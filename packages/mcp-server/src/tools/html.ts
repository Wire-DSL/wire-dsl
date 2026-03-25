import {
  parseWireDSL,
  generateIR,
  calculateLayout,
  renderToSVG,
  SkeletonSVGRenderer,
  SketchSVGRenderer,
  resolveDevicePreset,
} from '@wire-dsl/engine';

type RenderMode = 'standard' | 'skeleton' | 'sketch';

/**
 * Static HTML widget served as a registered MCP resource.
 * ChatGPT embeds this in an iframe and passes tool result data via window.openai.toolOutput.
 * Other clients can use the postMessage fallback.
 */
export const WIREFRAME_VIEWER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wire DSL Wireframe</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; padding: 24px; transition: background 0.15s; }
    #loading { opacity: 0.4; font-size: 13px; }
    .label { font-size: 11px; font-weight: 600; opacity: 0.45; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px; }
    .screen { margin-bottom: 40px; }
    .card { border-radius: 8px; padding: 16px; display: inline-block; max-width: 100%; overflow: auto; box-shadow: 0 1px 4px rgba(0,0,0,0.10); }
    .card svg { display: block; max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <p id="loading">Loading wireframe\u2026</p>
  <div id="root"></div>
  <script>
    function esc(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function applyTheme(theme) {
      var dark = theme === 'dark';
      document.body.style.background = dark ? '#1a1a1a' : '#f5f5f5';
      document.body.style.color = dark ? '#e0e0e0' : '#333333';
      document.querySelectorAll('.card').forEach(function(el) {
        el.style.background = dark ? '#2a2a2a' : '#ffffff';
      });
    }
    function render(data) {
      document.getElementById('loading').style.display = 'none';
      var root = document.getElementById('root');
      if (!data || data.error) {
        root.innerHTML = '<p style="color:#c0392b">' + esc((data && data.error) || 'No data received') + '</p>';
        return;
      }
      root.innerHTML = (data.screens || []).map(function(s) {
        return '<div class="screen"><p class="label">' + esc(s.name) + '</p><div class="card">' + s.svg + '</div></div>';
      }).join('');
      applyTheme(data.theme || 'light');
    }
    // ChatGPT: window.openai.toolOutput (MCP Apps SDK bridge)
    if (typeof window.openai !== 'undefined' && window.openai.toolOutput) {
      Promise.resolve(window.openai.toolOutput).then(render).catch(console.error);
    }
    // postMessage fallback for other MCP clients
    window.addEventListener('message', function(e) {
      var d = e.data;
      if (!d) return;
      if (d.method === 'ui/notifications/tool-result' && d.params) render(d.params);
      else if (d.type === 'tool-result') render(d.data);
    });
  </script>
</body>
</html>`;

function renderScreen(
  ir: ReturnType<typeof generateIR>,
  layout: ReturnType<typeof calculateLayout>,
  screenName: string,
  mode: RenderMode,
  theme: 'light' | 'dark'
): string {
  const options = { screenName, theme };
  if (mode === 'skeleton') return new SkeletonSVGRenderer(ir, layout, options).render();
  if (mode === 'sketch') return new SketchSVGRenderer(ir, layout, options).render();
  return renderToSVG(ir, layout, options);
}

export async function handleGetWireframeWidget({
  wire_code,
  screen,
  device,
  renderer = 'standard',
  theme,
}: {
  wire_code: string;
  screen?: string;
  device?: 'mobile' | 'tablet' | 'desktop';
  renderer?: RenderMode;
  theme?: 'light' | 'dark';
}) {
  let ast: ReturnType<typeof parseWireDSL>;
  try {
    ast = parseWireDSL(wire_code);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      content: [{ type: 'text' as const, text: `Parse error: ${msg}` }],
      isError: true,
    };
  }

  let ir: ReturnType<typeof generateIR>;
  try {
    ir = generateIR(ast);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      content: [{ type: 'text' as const, text: `IR error: ${msg}` }],
      isError: true,
    };
  }

  if (device) {
    const preset = resolveDevicePreset(device);
    for (const s of ir.project.screens) {
      s.viewport = { width: preset.width, height: preset.minHeight };
    }
  }

  const layout = calculateLayout(ir);
  const resolvedTheme: 'light' | 'dark' =
    theme ?? (ir.project.style.theme as 'light' | 'dark') ?? 'light';
  const allScreens = ir.project.screens.map((s) => s.name);
  const targets = screen ? [screen] : allScreens;

  const screens = targets.map((name) => ({
    name,
    svg: renderScreen(ir, layout, name, renderer, resolvedTheme),
  }));

  return {
    content: [{ type: 'text' as const, text: `Wireframe ready: ${screens.map((s) => s.name).join(', ')}` }],
    structuredContent: {
      screens,
      theme: resolvedTheme,
      renderer,
      device: device ?? ir.project.style.device ?? 'desktop',
    },
  };
}
