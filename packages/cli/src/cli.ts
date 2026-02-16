#!/usr/bin/env node

/**
 * WireDSL CLI
 *
 * Command-line interface for wireframe generation and validation
 */

import { program } from 'commander';
import { renderCommand } from './commands/render';
import { validateCommand } from './commands/validate';
import { initCommand } from './commands/init';

program.name('wire').description('WireDSL - Wireframes as Code').version('0.0.1', '-v, --version');

program
  .command('render <input>')
  .description('Render .wire file (default: PDF when saving, SVG to stdout)')
  .option(
    '-o, --out <path>, --output <path>',
    'Output path (auto-detects format: .pdf/.svg/.png or directory for PDF)'
  )
  .option('--svg <path>', 'Force SVG output (file or directory for multiple files)')
  .option('--pdf <path>', 'Force PDF output (single file with all screens as pages)')
  .option('--png <path>', 'Force PNG output (directory for multiple files)')
  .option('-s, --screen <name>', 'Render specific screen by name (defaults to all screens)')
  .option('--width <number>', 'Override viewport width')
  .option('--height <number>', 'Override viewport height')
  .option('--theme <theme>', 'Color scheme (light|dark)', 'light')
  .option('--renderer <renderer>', 'Renderer type (standard|skeleton|sketch)', 'standard')
  .option('-w, --watch', 'Watch input file and re-render on changes')
  .action((input, options) => {
    const width = options.width ? Number(options.width) : undefined;
    const height = options.height ? Number(options.height) : undefined;
    const theme = options.theme === 'dark' ? 'dark' : 'light';
    const renderer = options.renderer || 'standard';

    return renderCommand(input, {
      out: options.out,
      svg: options.svg,
      pdf: options.pdf,
      png: options.png,
      screen: options.screen,
      width,
      height,
      theme,
      renderer,
      watch: Boolean(options.watch),
    });
  });

program
  .command('validate <input>')
  .description('Validate .wire file syntax')
  .action(validateCommand);

program.command('init [name]').description('Initialize a new WireDSL project').action(initCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
