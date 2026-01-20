import chalk from 'chalk';

export const initCommand = async (name?: string): Promise<void> => {
  const projectName = name || 'wire-project';
  console.log(chalk.green('Initializing:'), projectName);
  // TODO: Implement init command
};
