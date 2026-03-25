#!/usr/bin/env node
/**
 * sync-mcp-docs.js
 *
 * Reads Wire DSL reference docs from two sources and regenerates
 * packages/mcp-server/src/docs.ts (fully auto-generated, do not edit by hand).
 *
 * Sources:
 *   1. skills/wireframe-generator/references/  — DSL language reference
 *   2. packages/mcp-server/docs/               — MCP-specific documentation
 *
 * Run from monorepo root: node scripts/sync-mcp-docs.js
 *   or via package script: pnpm --filter @wire-dsl/mcp-server sync-docs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = resolve(__dirname, '..');

const SKILL_REFS_DIR = resolve(MONOREPO_ROOT, 'skills/wireframe-generator/references');
const LOCAL_DOCS_DIR = resolve(MONOREPO_ROOT, 'packages/mcp-server/docs');
const OUT_FILE = resolve(MONOREPO_ROOT, 'packages/mcp-server/src/docs.ts');

/** Strip YAML frontmatter (--- ... ---) from a markdown string. */
function stripFrontmatter(content) {
  if (!content.startsWith('---')) return content;
  const end = content.indexOf('\n---', 3);
  if (end === -1) return content;
  return content.slice(end + 4).trimStart();
}

/** Escape backticks and template literal syntax for use inside a template literal. */
function escapeTemplateLiteral(content) {
  return content.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function readDoc(dir, filename) {
  const raw = readFileSync(resolve(dir, filename), 'utf8');
  return escapeTemplateLiteral(stripFrontmatter(raw));
}

// --- Source 1: skill reference docs ---
const SKILL_SECTIONS = [
  { name: 'DOCS_SYNTAX',         file: 'core-syntax.md' },
  { name: 'DOCS_COMPONENTS',     file: 'components-catalog.md' },
  { name: 'DOCS_CONTAINERS',     file: 'layouts-guide.md' },
  { name: 'DOCS_EXAMPLES',       file: 'common-patterns.md' },
  { name: 'DOCS_BEST_PRACTICES', file: 'best-practices.md' },
];

// --- Source 2: local MCP-specific docs ---
const LOCAL_SECTIONS = [
  { name: 'DOCS_MCP_RENDER', file: 'mcp-render.md' },
];

console.log('Reading skill reference docs…');
const skillLoaded = SKILL_SECTIONS.map(({ name, file }) => {
  const content = readDoc(SKILL_REFS_DIR, file);
  console.log(`  ${file} → ${name} (${content.split('\n').length} lines)`);
  return { name, content };
});

console.log('Reading local MCP docs…');
const localLoaded = LOCAL_SECTIONS.map(({ name, file }) => {
  const content = readDoc(LOCAL_DOCS_DIR, file);
  console.log(`  ${file} → ${name} (${content.split('\n').length} lines)`);
  return { name, content };
});

const allSections = [...skillLoaded, ...localLoaded];

const constants = allSections
  .map(({ name, content }) => `export const ${name} = \`\n${content}\`;`)
  .join('\n\n');

const allList = allSections.map(({ name }) => `  ${name}`).join(',\n');

const output = `// AUTO-GENERATED — do not edit by hand.
// Sources:
//   skills/wireframe-generator/references/  (DSL language reference)
//   packages/mcp-server/docs/               (MCP-specific docs)
// Regenerate with: node scripts/sync-mcp-docs.js

${constants}

// "theme": design tokens live in DOCS_SYNTAX (style block section)
// "all": all sections joined for initial LLM context
export const DOCS_ALL = [
${allList},
].join('\\n\\n---\\n\\n');
`;

writeFileSync(OUT_FILE, output, 'utf8');
console.log(`\nWrote ${OUT_FILE}`);
