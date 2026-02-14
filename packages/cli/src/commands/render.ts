import { readFile, mkdir, stat } from 'fs/promises';
import path from 'path';
import chokidar from 'chokidar';
import { LayoutEngine, SVGRenderer, SkeletonSVGRenderer, generateIR, parseWireDSL } from '@wire-dsl/engine';
import { exportSVG, exportPNG, exportMultipagePDF } from '@wire-dsl/exporters';

// Dynamic imports for ESM modules to handle CJS compatibility
let modules: { chalk?: any; ora?: any } = {};

async function loadDependencies() {
  if (!modules.chalk) {
    const chalkModule = await import('chalk');
    modules.chalk = chalkModule.default;
  }
  if (!modules.ora) {
    try {
      const oraModule = await import('ora');
      modules.ora = oraModule.default;
    } catch {
      // Fallback: no-op spinner
      modules.ora = (msg: string) => ({
        start: function() { return this; },
        succeed: function() { return this; },
        fail: function() { return this; }
      });
    }
  }
  return modules as { chalk: any; ora: any };
}

type RenderOptions = {
  out?: string;
  svg?: string;
  pdf?: string;
  png?: string;
  screen?: string;
  theme?: 'light' | 'dark';
  renderer?: string;
  width?: number;
  height?: number;
  watch?: boolean;
};

type ExportFormat = 'svg' | 'pdf' | 'png';

/**
 * Check if path is a directory
 */
async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stats = await stat(filePath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Get sanitized filename from screen name
 */
function sanitizeScreenName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Detect export format from file path extension
 */
function detectFormat(filePath: string): ExportFormat {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') return 'pdf';
  if (ext === '.png') return 'png';
  return 'svg'; // default
}

/**
 * Determine output format and path based on options
 */
function resolveOutputFormat(options: RenderOptions): {
  format: ExportFormat;
  outputPath?: string;
} {
  // Explicit format flags take priority
  if (options.pdf) return { format: 'pdf', outputPath: options.pdf };
  if (options.png) return { format: 'png', outputPath: options.png };
  if (options.svg) return { format: 'svg', outputPath: options.svg };

  // Auto-detect from --out
  if (options.out) {
    return { format: detectFormat(options.out), outputPath: options.out };
  }

  // No output specified = stdout SVG
  return { format: 'svg' };
}

export const renderCommand = async (input: string, options: RenderOptions = {}): Promise<void> => {
  const resolvedInputPath = path.resolve(process.cwd(), input);
  const { format, outputPath } = resolveOutputFormat(options);
  const { chalk, ora } = await loadDependencies();

  const renderOnce = async () => {
    const spinner = ora(`Rendering ${input}`).start();

    try {
      const source = await readFile(resolvedInputPath, 'utf8');

      const ast = parseWireDSL(source);
      const ir = generateIR(ast);

      const layout = new LayoutEngine(ir).calculate();
      const baseViewport = ir.project.screens[0]?.viewport ?? { width: 1280, height: 720 };

      // Determine which screens to render
      let screensToRender = ir.project.screens;
      if (options.screen) {
        const found = ir.project.screens.find(
          (s) => s.name.toLowerCase() === options.screen!.toLowerCase()
        );
        if (!found) {
          spinner.fail(`Screen not found: ${options.screen}`);
          console.error(
            chalk.red(`Available screens: ${ir.project.screens.map((s) => s.name).join(', ')}`)
          );
          process.exitCode = 1;
          return;
        }
        screensToRender = [found];
      }

      const basename = path.basename(resolvedInputPath, path.extname(resolvedInputPath));
      const multiScreen = screensToRender.length > 1;

      // Render all screens to SVG first (respect each screen viewport unless overridden)
      const renderedScreens = screensToRender.map((screen) => {
        const viewport = screen.viewport ?? baseViewport;
        const width = options.width ?? viewport.width;
        const height = options.height ?? viewport.height;

        // Select renderer class based on --renderer option
        const RendererClass = options.renderer === 'skeleton' ? SkeletonSVGRenderer : SVGRenderer;

        const renderer = new RendererClass(ir, layout, {
          width,
          height,
          theme: options.theme ?? 'light',
          includeLabels: true,
          screenName: screen.name,
        });

        return {
          name: screen.name,
          svg: renderer.render(),
          width,
          height,
        };
      });

      // No output path = stdout SVG (first screen only)
      if (!outputPath) {
        spinner.succeed('Rendered SVG');
        process.stdout.write(renderedScreens[0].svg + '\n');
        return;
      }

      // Handle different export formats
      const renderedFiles: string[] = [];

      if (format === 'pdf') {
        // PDF: always single file with all screens as pages
        let pdfPath = outputPath;

        // If output is a directory, generate filename
        const isDir = await isDirectory(outputPath);
        if (isDir) {
          pdfPath = path.join(outputPath, `${basename}.pdf`);
        } else if (!pdfPath.endsWith('.pdf')) {
          pdfPath += '.pdf';
        }

        await exportMultipagePDF(renderedScreens, pdfPath);
        renderedFiles.push(pdfPath);

        spinner.succeed(
          `PDF written to ${chalk.cyan(pdfPath)} (${renderedScreens.length} page${renderedScreens.length > 1 ? 's' : ''})`
        );
      } else if (format === 'png') {
        // PNG: requires directory for multiple screens
        const isDir = await isDirectory(outputPath);

        let filePaths: string[] = [];
        
        if (multiScreen && !isDir) {
          // Multiple screens without directory: use directory of provided path
          spinner.warn('PNG export with multiple screens requires a directory');
          const outputDir = path.dirname(outputPath);
          await mkdir(outputDir, { recursive: true }).catch(() => {});

          for (const screen of renderedScreens) {
            const sanitizedName = sanitizeScreenName(screen.name);
            const fileName = `${basename}-${sanitizedName}.png`;
            const filePath = path.join(outputDir, fileName);
            await exportPNG(screen.svg, filePath, screen.width, screen.height);
            filePaths.push(filePath);
          }
        } else if (multiScreen || isDir) {
          // Multiple screens with directory, or single screen into directory
          const outputDir = isDir ? outputPath : path.dirname(outputPath);
          await mkdir(outputDir, { recursive: true }).catch(() => {});

          for (const screen of renderedScreens) {
            const sanitizedName = sanitizeScreenName(screen.name);
            const fileName = multiScreen
              ? `${basename}-${sanitizedName}.png`
              : path.basename(outputPath).endsWith('.png')
                ? path.basename(outputPath)
                : `${basename}.png`;
            const filePath = path.join(outputDir, fileName);
            await exportPNG(screen.svg, filePath, screen.width, screen.height);
            filePaths.push(filePath);
          }
        } else {
          // Single screen to file
          const outputDir = path.dirname(outputPath);
          await mkdir(outputDir, { recursive: true }).catch(() => {});
          const screen = renderedScreens[0];
          await exportPNG(screen.svg, outputPath, screen.width, screen.height);
          filePaths.push(outputPath);
        }
        
        const renderedFiles = filePaths;

        if (renderedFiles.length === 1) {
          spinner.succeed(`PNG written to ${chalk.cyan(renderedFiles[0])}`);
        } else {
          spinner.succeed(`${renderedFiles.length} PNG files written:`);
          renderedFiles.forEach((file) => console.log(`  ${chalk.cyan(file)}`));
        }
      } else {
        // SVG: directory for multiple screens, file for single screen
        let outputDir = outputPath;
        const isDir = await isDirectory(outputPath);

        if (multiScreen || isDir) {
          if (!isDir) {
            outputDir = path.dirname(outputPath);
          }
          await mkdir(outputDir, { recursive: true }).catch(() => {});

          for (const screen of renderedScreens) {
            const sanitizedName = sanitizeScreenName(screen.name);
            const fileName = `${basename}-${sanitizedName}.svg`;
            const filePath = path.join(outputDir, fileName);
            await exportSVG(screen.svg, filePath);
            renderedFiles.push(filePath);
          }

          spinner.succeed(`${renderedFiles.length} SVG files written:`);
          renderedFiles.forEach((file) => console.log(`  ${chalk.cyan(file)}`));
        } else {
          // Single screen to file
          await exportSVG(renderedScreens[0].svg, outputPath);
          spinner.succeed(`SVG written to ${chalk.cyan(outputPath)}`);
        }
      }
    } catch (error: any) {
      spinner.fail('Render failed');
      const message = error?.message || 'Unknown error';
      console.error(chalk.red(message));
      process.exitCode = 1;
    }
  };

  await renderOnce();

  if (options.watch) {
    console.log(chalk.cyan(`Watching for changes: ${resolvedInputPath}`));
    const watcher = chokidar.watch(resolvedInputPath, { ignoreInitial: true });

    watcher.on('change', async () => {
      await renderOnce();
    });
  }
};
