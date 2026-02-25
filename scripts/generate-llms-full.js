#!/usr/bin/env node
/**
 * scripts/generate-llms-full.js
 *
 * Generates llms-full.txt by concatenating all user-facing documentation
 * into a single file for LLMs with large context windows.
 *
 * Scope: DSL usage only (syntax, components, containers, icons, CLI export).
 * Out of scope: internal architecture, IR schema, layout engine internals,
 * developer tooling (build/test/lint), and AI agent dev instructions.
 *
 * Usage:
 *   node scripts/generate-llms-full.js
 *   pnpm docs:llms
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

function read(relPath) {
  const abs = join(ROOT, relPath)
  if (!existsSync(abs)) {
    console.warn(`  ⚠  Skipped (not found): ${relPath}`)
    return null
  }
  return readFileSync(abs, 'utf-8').trim()
}

function divider(title) {
  const bar = '─'.repeat(78)
  return `\n\n${bar}\n## ${title}\n${bar}\n\n`
}

// ─── Header ───────────────────────────────────────────────────────────────────

const header = `\
# Wire-DSL — Complete Documentation
# Generated: ${new Date().toISOString().slice(0, 10)}
# Index: llms.txt

Wire-DSL is a block-declarative DSL for creating interactive wireframes using
code. Write .wire files and render them to SVG, PNG, or PDF.

Key facts:
- Syntax: declarative, similar to Mermaid but for UI layouts
- 22 UI components across 8 groups (Text, Input, Button, Nav, Data, Media, Display, Info/Modal)
- 5 container types: stack, grid, split, panel, card
- 287 built-in Feather Icons
- Custom reusable definitions: define Component, define Layout
- No absolute positioning — all structure is hierarchical

This file contains, in order:
  1. DSL Syntax (grammar, tokens, layouts, validation rules)
  2. Components Reference (all 22 components)
  3. Containers & Layouts Reference
  4. Icons Guide (287 icon names)
  5. CLI — wire render command
  6. Curated Examples
`

// ─── Documentation sections ───────────────────────────────────────────────────

const docs = [
  ['DSL SYNTAX', 'docs/DSL-SYNTAX.md'],
  ['COMPONENTS REFERENCE', 'docs/COMPONENTS-REFERENCE.md'],
  ['CONTAINERS & LAYOUTS REFERENCE', 'docs/CONTAINERS-REFERENCE.md'],
  ['ICONS GUIDE', 'docs/ICONS-GUIDE.md'],
]

// ─── CLI — only the wire render section ───────────────────────────────────────

const cliSection = `\
## wire render

Converts a .wire file to SVG, PNG, or PDF.

\`\`\`bash
# Render to stdout (SVG)
wire render input.wire

# Save to file
wire render input.wire --svg output.svg
wire render input.wire --pdf output.pdf
wire render input.wire --png output.png

# Render a specific screen
wire render input.wire --screen "Dashboard"

# Watch mode (re-renders on file change)
wire render input.wire --watch
\`\`\`

| Option     | Description                           |
|------------|---------------------------------------|
| --svg      | Save as SVG                           |
| --pdf      | All screens as multipage PDF          |
| --png      | Save as PNG (one file per screen)     |
| --out      | Auto-detect format from extension     |
| --screen   | Render a specific screen by name      |
| --theme    | Apply theme: light (default) or dark  |
| --width    | Override viewport width in pixels     |
| --height   | Override viewport height in pixels    |
| --watch    | Watch for file changes and re-render  |

Multi-screen handling:
- Single screen + --png → single .png file
- Multiple screens + --png → directory with one .png per screen
- --pdf → always a single multipage file (one page per screen)
`

// ─── Curated examples ─────────────────────────────────────────────────────────

const examples = [
  {
    title: 'Admin Dashboard — Split layout, multi-screen',
    path: 'examples/admin-dashboard.wire',
    note: 'Shows: split with sidebar nav, grid for search/action bar, table, form inputs, multi-screen (list + detail + create)',
  },
  {
    title: 'Analytics Dashboard — Charts, alerts, tabs',
    path: 'examples/analytics-dashboard.wire',
    note: 'Shows: nested split, multiple chart types (bar/line/area), alerts, tabs, filters sidebar',
  },
  {
    title: 'Simple Dashboard — Grid + stat cards',
    path: 'examples/simple-dashboard.wire',
    note: 'Shows: topbar, grid of cards with stats, chart, table',
  },
  {
    title: 'Form Example — All input components',
    path: 'examples/form-example.wire',
    note: 'Shows: Input, Textarea, Select, Checkbox, Radio, Toggle — all input types in a single form',
  },
  {
    title: 'Card & Stat Demo — Multi-screen',
    path: 'examples/card-and-stat-card-demo.wire',
    note: 'Shows: stat card grid, product cards, profile card with avatar, horizontal stack in card',
  },
  {
    title: 'Mobile Demo — device: mobile target',
    path: 'examples/mobile-demo.wire',
    note: 'Shows: device: "mobile" style property, single-column card grid, multi-screen mobile flow',
  },
]

// ─── Build output ─────────────────────────────────────────────────────────────

const parts = [header]

for (const [title, path] of docs) {
  const content = read(path)
  if (content) {
    parts.push(divider(title) + content)
  }
}

parts.push(divider('CLI — wire render command') + cliSection)

let examplesOutput = ''
for (const { title, path, note } of examples) {
  const content = read(path)
  if (content) {
    examplesOutput += `\n### ${title}\n\n_${note}_\n\n\`\`\`wire\n${content}\n\`\`\`\n`
  }
}

if (examplesOutput) {
  parts.push(divider('EXAMPLES') + examplesOutput.trim())
}

const output = parts.join('')
const lines = output.split('\n').length
const kb = Math.round(output.length / 1024)

// Write to repo root (for GitHub / local AI agents)
const rootOut = join(ROOT, 'llms-full.txt')
writeFileSync(rootOut, output, 'utf-8')
console.log(`✓  llms-full.txt         → repo root (${lines.toLocaleString()} lines, ~${kb} KB)`)

// Copy both files to apps/docs/public/ (for the deployed docs site)
const publicDir = join(ROOT, 'apps/docs/public')
if (existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true })
  writeFileSync(join(publicDir, 'llms-full.txt'), output, 'utf-8')
  copyFileSync(join(ROOT, 'llms.txt'), join(publicDir, 'llms.txt'))
  console.log(`✓  llms.txt + llms-full.txt → apps/docs/public/`)
} else {
  console.log(`   apps/docs/public/ not found — skipping web copy`)
}
