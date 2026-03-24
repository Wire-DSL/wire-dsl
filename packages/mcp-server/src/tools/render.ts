import {
  parseWireDSL,
  generateIR,
  calculateLayout,
  renderToSVG,
  SkeletonSVGRenderer,
  SketchSVGRenderer,
  resolveDevicePreset,
} from '@wire-dsl/engine';
import { renderAsync } from '@resvg/resvg-js';

type RenderMode = 'standard' | 'skeleton' | 'sketch';

function renderScreen(
  ir: ReturnType<typeof generateIR>,
  layout: ReturnType<typeof calculateLayout>,
  screenName: string,
  mode: RenderMode,
  theme: 'light' | 'dark'
): string {
  const options = { screenName, theme };
  if (mode === 'skeleton') {
    const r = new SkeletonSVGRenderer(ir, layout, options);
    return r.render();
  }
  if (mode === 'sketch') {
    const r = new SketchSVGRenderer(ir, layout, options);
    return r.render();
  }
  return renderToSVG(ir, layout, options);
}

export async function handleRender({
  wire_code,
  screen,
  format = 'svg',
  device,
  renderer = 'standard',
  theme,
}: {
  wire_code: string;
  screen?: string;
  format?: 'svg' | 'png';
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
      content: [{ type: 'text' as const, text: JSON.stringify({ error: `Parse error: ${msg}` }) }],
    };
  }

  let ir: ReturnType<typeof generateIR>;
  try {
    ir = generateIR(ast);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify({ error: `IR generation error: ${msg}` }) }],
    };
  }

  // Override device viewport if provided — takes precedence over DSL style.device
  if (device) {
    const preset = resolveDevicePreset(device);
    for (const s of ir.project.screens) {
      s.viewport = { width: preset.width, height: preset.minHeight };
    }
  }

  const layout = calculateLayout(ir);
  const allScreens = ir.project.screens.map((s) => s.name);
  const targets = screen ? [screen] : allScreens;

  // Resolve theme: tool param > DSL style.theme > 'light'
  const resolvedTheme: 'light' | 'dark' = theme ?? (ir.project.style.theme as 'light' | 'dark') ?? 'light';

  if (format === 'png') {
    const deviceWidth = device
      ? resolveDevicePreset(device).width
      : (ir.project.screens[0]?.viewport.width ?? 1280);

    const results = await Promise.all(
      targets.map(async (name) => {
        const svg = renderScreen(ir, layout, name, renderer, resolvedTheme);
        const rendered = await renderAsync(svg, {
          fitTo: { mode: 'width', value: deviceWidth },
          background: resolvedTheme === 'dark' ? '#1a1a1a' : '#ffffff',
          logLevel: 'off',
        });
        return {
          screen: name,
          data: rendered.asPng().toString('base64'),
          width: rendered.width,
          height: rendered.height,
        };
      })
    );

    return {
      content: results.flatMap((r) => [
        { type: 'image' as const, data: r.data, mimeType: 'image/png' as const },
        {
          type: 'text' as const,
          text: JSON.stringify({
            screen: r.screen,
            width: r.width,
            height: r.height,
            format: 'png',
            renderer,
            theme: resolvedTheme,
            device: device ?? ir.project.style.device ?? 'desktop',
          }),
        },
      ]),
    };
  }

  const renders = targets.map((name) => ({
    screen: name,
    content: renderScreen(ir, layout, name, renderer, resolvedTheme),
    format: 'svg' as const,
    renderer,
    theme: resolvedTheme,
    device: device ?? ir.project.style.device ?? 'desktop',
  }));

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ renders, screens_count: renders.length }),
      },
    ],
  };
}
