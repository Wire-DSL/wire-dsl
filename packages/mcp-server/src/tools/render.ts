import {
  parseWireDSL,
  generateIR,
  calculateLayout,
  renderToSVG,
  SkeletonSVGRenderer,
  SketchSVGRenderer,
  resolveDevicePreset,
} from '@wire-dsl/engine';
import { initWasm, Resvg } from '@resvg/resvg-wasm';

type RenderMode = 'standard' | 'skeleton' | 'sketch';

// WASM init state — initSvgRenderer() must be called before any PNG render.
let wasmReady = false;

/**
 * Initialize the WASM rasterizer. Must be called once before render_wire
 * is invoked with format: "png".
 *
 * - Node.js:       pass a Buffer from fs.readFileSync on the .wasm file
 * - CF Workers:    pass the imported .wasm module binding
 * - Any runtime:   pass a fetch() Response pointing to the .wasm file
 */
export async function initSvgRenderer(
  wasm: Parameters<typeof initWasm>[0]
): Promise<void> {
  if (wasmReady) return;
  await initWasm(wasm);
  wasmReady = true;
}

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
    if (!wasmReady) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ error: 'PNG renderer not initialized. Call initSvgRenderer() before using format: "png".' }),
        }],
      };
    }

    const deviceWidth = device
      ? resolveDevicePreset(device).width
      : (ir.project.screens[0]?.viewport.width ?? 1280);

    const results = targets.map((name) => {
      const svg = renderScreen(ir, layout, name, renderer, resolvedTheme);
      const rendered = new Resvg(svg, {
        fitTo: { mode: 'width', value: deviceWidth },
        background: resolvedTheme === 'dark' ? '#1a1a1a' : '#ffffff',
      }).render();
      const png = rendered.asPng();
      return {
        screen: name,
        data: Buffer.from(png).toString('base64'),
        width: rendered.width,
        height: rendered.height,
      };
    });

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
    content: [{
      type: 'text' as const,
      text: JSON.stringify({ renders, screens_count: renders.length }),
    }],
  };
}
