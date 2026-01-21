import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { LayoutEngine, SVGRenderer, generateIR, parseWireDSL } from '@wire-dsl/core';

type RenderOptions = {
  out?: string;
  theme?: 'light' | 'dark';
  width?: number;
  height?: number;
};

export const renderCommand = async (input: string, options: RenderOptions = {}): Promise<void> => {
  const spinner = ora(`Rendering ${input}`).start();

  try {
    const resolvedPath = path.resolve(process.cwd(), input);
    const source = await readFile(resolvedPath, 'utf8');

    const ast = parseWireDSL(source);
    const ir = generateIR(ast);

    const layout = new LayoutEngine(ir).calculate();
    const viewport = ir.project.screens[0]?.viewport ?? { width: 1280, height: 720 };

    const renderer = new SVGRenderer(ir, layout, {
      width: options.width ?? viewport.width,
      height: options.height ?? viewport.height,
      theme: options.theme ?? 'light',
      includeLabels: true,
    });

    const svg = renderer.render();

    if (options.out) {
      const outPath = path.resolve(process.cwd(), options.out);
      await writeFile(outPath, svg, 'utf8');
      spinner.succeed(`SVG written to ${outPath}`);
    } else {
      spinner.succeed('Rendered SVG');
      process.stdout.write(svg + '\n');
    }
  } catch (error: any) {
    spinner.fail('Render failed');
    const message = error?.message || 'Unknown error';
    console.error(chalk.red(message));
    process.exitCode = 1;
  }
};
