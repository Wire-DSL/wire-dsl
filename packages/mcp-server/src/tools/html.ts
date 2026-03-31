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
 * Implements the MCP Apps protocol (JSON-RPC over postMessage) for Claude, ChatGPT,
 * and any compliant host. The handshake works as follows:
 *   1. Host sends  ui/initialize  → app replies with capabilities
 *   2. Host sends  ui/notifications/initialized  (ack)
 *   3. Host sends  ui/notifications/tool-result  with the structuredContent
 *   4. App renders the wireframe SVG screens
 */
export const WIREFRAME_VIEWER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wire DSL Wireframe</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; padding: 24px; background: transparent; color: #1a1a1a; }
    #loading { opacity: 0.4; font-size: 13px; }
    .screen { margin-bottom: 40px; }
    .screen-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .label { font-size: 11px; font-weight: 600; opacity: 0.45; letter-spacing: 0.08em; text-transform: uppercase; }
    .actions { display: flex; gap: 6px; }
    .btn-dl { font-size: 10px; font-weight: 500; padding: 3px 8px; border-radius: 4px; border: 1px solid currentColor; opacity: 0.45; background: transparent; color: inherit; cursor: pointer; letter-spacing: 0.03em; transition: opacity 0.15s; }
    .btn-dl:hover { opacity: 0.85; }
    .card { border-radius: 8px; padding: 16px; display: inline-block; max-width: 100%; overflow: auto; box-shadow: 0 1px 4px rgba(0,0,0,0.10); background: #ffffff; }
    .card svg { display: block; max-width: 100%; height: auto; }
    @media (prefers-color-scheme: dark) {
      body { color: #e0e0e0; }
      .card { background: #2a2a2a; box-shadow: 0 1px 4px rgba(0,0,0,0.30); }
    }
  </style>
</head>
<body>
  <p id="loading">Loading wireframe\u2026</p>
  <div id="root"></div>
  <script>
    // ── Helpers ──────────────────────────────────────────────────────
    function esc(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function dl(filename, content, mime) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([content], { type: mime }));
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }

    var _screens = [];
    var _wireCode = '';
    var _hostTheme = null; // set by the host via ui/initialize or context-changed

    function getTheme() {
      if (_hostTheme) return _hostTheme;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
      return 'light';
    }

    function applyTheme() {
      var dark = getTheme() === 'dark';
      document.body.style.color = dark ? '#e0e0e0' : '#1a1a1a';
      document.querySelectorAll('.card').forEach(function(el) {
        el.style.background = dark ? '#2a2a2a' : '#ffffff';
        el.style.boxShadow = dark ? '0 1px 4px rgba(0,0,0,0.30)' : '0 1px 4px rgba(0,0,0,0.10)';
      });
    }

    // ── Render wireframe screens ────────────────────────────────────
    function render(data) {
      document.getElementById('loading').style.display = 'none';
      var root = document.getElementById('root');
      if (!data || data.error) {
        root.innerHTML = '<p style="color:#c0392b">' + esc((data && data.error) || 'No data received') + '</p>';
        return;
      }
      _screens = data.screens || [];
      _wireCode = data.wire_code || '';
      root.innerHTML = _screens.map(function(s, i) {
        var slug = s.name.toLowerCase().replace(/\\s+/g, '-');
        return '<div class="screen">' +
          '<div class="screen-header">' +
            '<span class="label">' + esc(s.name) + '</span>' +
            '<div class="actions">' +
              '<button class="btn-dl" onclick="dl(\\''+slug+'.svg\\',_screens['+i+'].svg,\\'image/svg+xml\\')">\\u2193 SVG</button>' +
              (_wireCode ? '<button class="btn-dl" onclick="dl(\\'wireframe.wire\\',_wireCode,\\'text/plain\\')">\\u2193 .wire</button>' : '') +
            '</div>' +
          '</div>' +
          '<div class="card">' + s.svg + '</div>' +
        '</div>';
      }).join('');
      applyTheme();
    }

    // ── MCP Apps protocol (JSON-RPC 2.0 over postMessage) ───────────
    // Handles the handshake and tool-result delivery for Claude, ChatGPT
    // and any compliant MCP Apps host.
    var _msgId = 0;
    function send(msg) { window.parent.postMessage(msg, '*'); }
    function rpcResult(id, result) { send({ jsonrpc: '2.0', id: id, result: result }); }

    window.addEventListener('message', function(e) {
      var msg = e.data;
      if (!msg || msg.jsonrpc !== '2.0') return;

      // ui/initialize — host asks the app for its capabilities
      if (msg.method === 'ui/initialize') {
        var ctx = (msg.params && msg.params.hostContext) || {};
        if (ctx.theme) _hostTheme = ctx.theme;
        rpcResult(msg.id, {
          protocolVersion: '2026-01-26',
          capabilities: {},
          appInfo: { name: 'Wire DSL Wireframe Viewer', version: '0.1.0' }
        });
        return;
      }

      // ui/notifications/initialized — handshake complete (no response needed)
      if (msg.method === 'ui/notifications/initialized') return;

      // ui/notifications/tool-result — the structured wireframe data
      if (msg.method === 'ui/notifications/tool-result') {
        var params = msg.params || {};
        // structuredContent holds our screen data; fall back to parsing text content
        var sc = params.structuredContent;
        if (sc) {
          render(sc);
        } else if (params.content) {
          // Try to parse the text content as JSON (fallback)
          var textBlock = params.content.find(function(c) { return c.type === 'text'; });
          if (textBlock) { try { render(JSON.parse(textBlock.text)); } catch(ex) {} }
        }
        return;
      }

      // ui/notifications/host-context-changed — theme updates
      if (msg.method === 'ui/notifications/host-context-changed') {
        var hctx = (msg.params && msg.params.hostContext) || {};
        if (hctx.theme) { _hostTheme = hctx.theme; applyTheme(); }
        return;
      }

      // ping — keep-alive
      if (msg.method === 'ping') {
        rpcResult(msg.id, {});
        return;
      }
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
  const screen = ir.project.screens.find((s) => s.name === screenName);
  const options = {
    screenName,
    theme,
    width: screen?.viewport.width,
    height: screen?.viewport.height,
  };
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
      wire_code,
      theme: resolvedTheme,
      renderer,
      device: device ?? ir.project.style.device ?? 'desktop',
    },
  };
}
