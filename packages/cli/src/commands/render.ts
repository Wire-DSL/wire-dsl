import { readFile, writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { LayoutEngine, SVGRenderer, generateIR, parseWireDSL } from '@wire-dsl/core';

type RenderOptions = {
  out?: string;
  screen?: string;
  theme?: 'light' | 'dark';
  width?: number;
  height?: number;
};

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

export const renderCommand = async (input: string, options: RenderOptions = {}): Promise<void> => {
  const spinner = ora(`Rendering ${input}`).start();

  try {
    const resolvedInputPath = path.resolve(process.cwd(), input);
    const source = await readFile(resolvedInputPath, 'utf8');

    const ast = parseWireDSL(source);
    const ir = generateIR(ast);

    const layout = new LayoutEngine(ir).calculate();
    const baseViewport = ir.project.screens[0]?.viewport ?? { width: 1280, height: 720 };

    // Determine which screens to render
    let screensToRender = ir.project.screens;
    if (options.screen) {
      const found = ir.project.screens.find(
        s => s.name.toLowerCase() === options.screen!.toLowerCase()
      );
      if (!found) {
        spinner.fail(`Screen not found: ${options.screen}`);
        console.error(
          chalk.red(
            `Available screens: ${ir.project.screens.map(s => s.name).join(', ')}`
          )
        );
        process.exitCode = 1;
        return;
      }
      screensToRender = [found];
    }

    // Determine output path(s)
    const basename = path.basename(resolvedInputPath, path.extname(resolvedInputPath));

    // If multiple screens, always output to directory
    const multiScreen = screensToRender.length > 1;
    let outputDir: string | null = null;

    if (multiScreen) {
      if (options.out) {
        // Check if path is directory or if it looks like a directory
        const isDir = await isDirectory(options.out);
        if (isDir) {
          outputDir = path.resolve(process.cwd(), options.out);
        } else {
          // If user gave a file path for multi-screen, use its directory
          outputDir = path.dirname(path.resolve(process.cwd(), options.out));
        }
      } else {
        // Default to current directory
        outputDir = process.cwd();
      }

      // Ensure directory exists
      try {
        await mkdir(outputDir, { recursive: true });
      } catch {
        // Directory may already exist
      }
    }

    // Render each screen
    const renderedFiles: string[] = [];

    for (const screen of screensToRender) {
      const renderer = new SVGRenderer(ir, layout, {
        width: options.width ?? baseViewport.width,
        height: options.height ?? baseViewport.height,
        theme: options.theme ?? 'light',
        includeLabels: true,
        screenName: screen.name,
      });

      const svg = renderer.render();

      if (multiScreen) {
        // Output to directory with screen name
        const sanitizedScreenName = sanitizeScreenName(screen.name);
        const fileName = `${basename}-${sanitizedScreenName}.svg`;
        const filePath = path.join(outputDir!, fileName);
        await writeFile(filePath, svg, 'utf8');
        renderedFiles.push(filePath);
      } else if (options.out) {
        // Single screen with output path
        const outPath = path.resolve(process.cwd(), options.out);
        await writeFile(outPath, svg, 'utf8');
        renderedFiles.push(outPath);
      } else {
        // Single screen to stdout
        spinner.succeed('Rendered SVG');
        process.stdout.write(svg + '\n');
        return;
      }
    }

    // Report success
    if (renderedFiles.length === 1) {
      spinner.succeed(`SVG written to ${renderedFiles[0]}`);
    } else {
      spinner.succeed(`${renderedFiles.length} SVG files written:`);
      renderedFiles.forEach(file => console.log(`  ${chalk.cyan(file)}`));
    }
  } catch (error: any) {
    spinner.fail('Render failed');
    const message = error?.message || 'Unknown error';
    console.error(chalk.red(message));
    process.exitCode = 1;
  }
};
