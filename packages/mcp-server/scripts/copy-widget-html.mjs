import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(scriptDir, '..');

const sourceFile = resolve(packageDir, 'src', 'tools', 'wireframe-viewer.html');
const targets = [
  resolve(packageDir, 'dist', 'wireframe-viewer.html'),
  resolve(packageDir, 'dist', 'tools', 'wireframe-viewer.html'),
];

for (const targetFile of targets) {
  mkdirSync(dirname(targetFile), { recursive: true });
  copyFileSync(sourceFile, targetFile);
  console.log(`Copied widget template to ${targetFile}`);
}
