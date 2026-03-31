import {
  parseWireDSL,
  generateIR,
  calculateLayout,
  renderToSVG,
  SkeletonSVGRenderer,
  SketchSVGRenderer,
  resolveDevicePreset,
} from '@wire-dsl/engine';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

type RenderMode = 'standard' | 'skeleton' | 'sketch';

const require = createRequire(import.meta.url);

function resolveWireframeViewerHtmlPath(): URL {
  const candidates = [
    new URL('./wireframe-viewer.html', import.meta.url),
    new URL('./tools/wireframe-viewer.html', import.meta.url),
  ];

  for (const candidate of candidates) {
    if (existsSync(fileURLToPath(candidate))) return candidate;
  }

  throw new Error(
    `Widget template not found. Tried: ${candidates
      .map((candidate) => fileURLToPath(candidate))
      .join(', ')}`
  );
}

function loadWireframeViewerHtmlTemplate(): string {
  return readFileSync(resolveWireframeViewerHtmlPath(), 'utf8');
}

function buildExtAppsBundle(): string {
  const bundle = readFileSync(
    require.resolve('@modelcontextprotocol/ext-apps/app-with-deps'),
    'utf8'
  );

  return bundle.replace(/export\{([^}]+)\};?\s*$/, (_match, body: string) => {
    const exportsObject = body
      .split(',')
      .map((pair) => {
        const [local, exported] = pair.split(' as ').map((s) => s.trim());
        return `${exported ?? local}:${local}`;
      })
      .join(',');

    return `globalThis.ExtApps={${exportsObject}};`;
  });
}

const WIREFRAME_VIEWER_HTML_TEMPLATE = loadWireframeViewerHtmlTemplate();
const EXT_APPS_BUNDLE = buildExtAppsBundle();

export const WIREFRAME_VIEWER_HTML = WIREFRAME_VIEWER_HTML_TEMPLATE.replace(
  '/*__EXT_APPS_BUNDLE__*/',
  () => EXT_APPS_BUNDLE
);

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
