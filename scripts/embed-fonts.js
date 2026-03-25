#!/usr/bin/env node
/**
 * embed-fonts.js
 *
 * Downloads font files (if not already present) and generates
 * packages/mcp-server/src/assets/fonts.ts with each font embedded
 * as a base64-decoded Uint8Array.
 *
 * The output is a pure ES module — no Node.js APIs, no fs — so it works
 * in Node.js, CF Workers, and any edge runtime.
 *
 * Neither the downloaded font binaries nor the generated fonts.ts are
 * committed to git — both are listed in packages/mcp-server/.gitignore.
 *
 * Run from monorepo root: node scripts/embed-fonts.js
 *   or via package script: pnpm --filter @wire-dsl/mcp-server embed-fonts
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = resolve(__dirname, '..');
const ASSETS_DIR = resolve(MONOREPO_ROOT, 'packages/mcp-server/assets');
const OUT_DIR = resolve(MONOREPO_ROOT, 'packages/mcp-server/src/assets');
const OUT_FILE = resolve(OUT_DIR, 'fonts.ts');

// Font sources — official releases, pinned to a specific version for reproducibility.
const FONT_FILES = [
  {
    file: 'Inter-Regular.ttf',
    exportName: 'INTER_REGULAR',
    url: 'https://github.com/rsms/inter/releases/download/v4.0/Inter-4.0.zip',
    zipPath: 'extras/ttf/Inter-Regular.ttf',
  },
];

mkdirSync(ASSETS_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

// Download a single file from a zip archive using fetch + DecompressionStream.
// Falls back to a direct binary download if zipPath is not provided.
async function downloadFromZip(url, zipPath, destFile) {
  console.log(`  Downloading ${url} …`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const zipBuf = Buffer.from(await res.arrayBuffer());

  // Write zip to a temp file and use unzip CLI (available on all platforms via Node child_process)
  const { execFileSync } = await import('node:child_process');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const tmpZip = join(tmpdir(), `inter-${Date.now()}.zip`);
  writeFileSync(tmpZip, zipBuf);
  const extracted = execFileSync('unzip', ['-p', tmpZip, zipPath]);
  writeFileSync(destFile, extracted);
  console.log(`  Saved to ${destFile} (${(extracted.length / 1024).toFixed(1)} KB)`);
}

console.log('Preparing fonts…');

for (const { file, url, zipPath } of FONT_FILES) {
  const dest = resolve(ASSETS_DIR, file);
  if (existsSync(dest)) {
    console.log(`  ${file} already present, skipping download`);
  } else {
    await downloadFromZip(url, zipPath, dest);
  }
}

console.log('Embedding fonts…');

const constants = FONT_FILES.map(({ file, exportName }) => {
  const buf = readFileSync(resolve(ASSETS_DIR, file));
  const b64 = buf.toString('base64');
  const sizeKb = (buf.length / 1024).toFixed(1);
  console.log(`  ${file} → ${exportName} (${sizeKb} KB → ${b64.length} chars base64)`);
  return [
    `// ${basename(file, extname(file))} — ${sizeKb} KB (${buf.length} bytes)`,
    `// Source: ${FONT_FILES.find((f) => f.file === file)?.url}`,
    `// License: SIL Open Font License 1.1 — https://scripts.sil.org/OFL`,
    `const ${exportName}_B64 = '${b64}';`,
    `export const ${exportName}: Uint8Array = (() => {`,
    `  const bin = atob(${exportName}_B64);`,
    `  const buf = new Uint8Array(bin.length);`,
    `  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);`,
    `  return buf;`,
    `})();`,
  ].join('\n');
});

const output = `// AUTO-GENERATED — do not edit by hand.
// Source: packages/mcp-server/assets/ (downloaded by scripts/embed-fonts.js)
// Regenerate with: node scripts/embed-fonts.js
//
// Fonts are embedded as Uint8Array constants using atob() which is available
// in Node.js 18+, CF Workers, and all modern edge runtimes.
//
// Neither this file nor the font binaries in assets/ are committed to git.
// They are regenerated automatically as part of the build (prebuild script).

${constants.join('\n\n')}
`;

writeFileSync(OUT_FILE, output, 'utf8');
console.log(`\nWrote ${OUT_FILE}`);
