import { readFile, mkdir, stat } from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import chokidar from 'chokidar';
import { LayoutEngine, SVGRenderer, generateIR, parseWireDSL } from '@wire-dsl/core';
import { exportSVG, exportPNG, exportMultipagePDF } from './exporters';

type RenderOptions = {
  out?: string;
  svg?: string;
  pdf?: string;
  png?: string;
  screen?: string;
  theme?: 'light' | 'dark';
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

        const renderer = new SVGRenderer(ir, layout, {
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
        let outputDir = outputPath;
        const isDir = await isDirectory(outputPath);

        if (!isDir && multiScreen) {
          spinner.warn('PNG export with multiple screens requires a directory');
          outputDir = path.dirname(outputPath);
        }

        await mkdir(outputDir, { recursive: true }).catch(() => {});

        for (const screen of renderedScreens) {
          const sanitizedName = sanitizeScreenName(screen.name);
          const fileName = multiScreen
            ? `${basename}-${sanitizedName}.png`
            : path.basename(outputPath).endsWith('.png')
              ? path.basename(outputPath)
              : `${basename}.png`;

          const filePath = isDir || multiScreen ? path.join(outputDir, fileName) : outputPath;

          await exportPNG(screen.svg, filePath, screen.width, screen.height);
          renderedFiles.push(filePath);
        }

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
