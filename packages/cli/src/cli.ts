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
  .description('Render .wire file to SVG')
  .option('-o, --out <file>', 'Output SVG file (defaults to stdout)')
  .option('--width <number>', 'Override viewport width')
  .option('--height <number>', 'Override viewport height')
  .option('--theme <theme>', 'Theme (light|dark)', 'light')
  .action((input, options) => {
    const width = options.width ? Number(options.width) : undefined;
    const height = options.height ? Number(options.height) : undefined;
    const theme = options.theme === 'dark' ? 'dark' : 'light';

    return renderCommand(input, {
      out: options.out,
      width,
      height,
      theme,
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
