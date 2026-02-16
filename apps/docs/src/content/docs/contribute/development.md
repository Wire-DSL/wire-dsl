---
title: Development Guide
description: Setup, architecture, and contribution guidelines for Wire-DSL
---

This guide covers setting up Wire-DSL for development and contributing to the project.

## Project Overview

Wire-DSL is a monorepo using **Turbo**, **TypeScript**, and **pnpm**. It consists of:

- **@wire-dsl/engine** – Parser, IR generator, layout engine, SVG renderer
- **@wire-dsl/exporters** – PNG, PDF, SVG export (uses Playwright)
- **@wire-dsl/cli** – Command-line tool for rendering wireframes
- **@wire-dsl/editor-ui** – Reusable React component library
- **@wire-dsl/web** – Web editor (React + Monaco)
- **apps/docs** – Astro Starlight documentation site
- **apps/web** – Web editor application

---

## Prerequisites

- **Node.js 20.x or later** (check with `node --version`)
- **pnpm 8.x or later** (install with `npm install -g pnpm`)
- **Git** for version control
- A code editor (VS Code recommended)

---

## Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/wire-dsl/wire-dsl.git
cd wire-dsl
```

### 2. Install Dependencies
```bash
pnpm install
```

This installs all workspace dependencies and uses Turbo for intelligent caching.

### 3. Verify Installation
```bash
pnpm lint
pnpm test
```

---

## Monorepo Commands

### Build All Packages
```bash
pnpm build
```

Compiles TypeScript, bundles outputs. Uses Turbo cache for speed.

### Development Mode (Watch)
```bash
pnpm dev
```

Starts all watch tasks simultaneously. Changes auto-rebuild.

### Run Tests
```bash
pnpm test
```

Runs Vitest across all packages. Filter with `--filter`:
```bash
pnpm test --filter @wire-dsl/engine
```

### Lint Code
```bash
pnpm lint
pnpm lint:fix
```

Uses ESLint. Fix automatically or review violations.

### Format Code
```bash
pnpm format
```

Uses Prettier to format all files.

---

## Package-Specific Development

### Core Engine (@wire-dsl/engine)

**Directory:** `packages/engine/`

**Start Development:**
```bash
cd packages/engine
pnpm dev
```

**Key Files:**
- `src/parser/` – Chevrotain grammar and lexer
- `src/ir/` – IR structure and generation
- `src/layout/` – Layout calculation engine
- `src/renderer/` – SVG and PNG rendering
- `src/index.ts` – Public API exports

**Test Engine:**
```bash
pnpm test --filter @wire-dsl/engine
```

### Web Editor (@wire-dsl/web)

**Directory:** `apps/web/`

**Start Dev Server:**
```bash
cd apps/web
pnpm dev
```

Opens at `http://localhost:5173`

**Key Files:**
- `src/components/` – Editor UI components
- `src/hooks/` – React hooks (useEditor, useTheme, etc.)
- `src/pages/` – Route pages
- `src/layout/` – Main editor layout

**Features:**
- Monaco code editor on left
- Live preview on right
- /component reference on top right
- Keyboard shortcuts (`Ctrl+Enter` to preview)

### CLI (@wire-dsl/cli)

**Directory:** `packages/cli/`

**Test CLI:**
```bash
pnpm cli validate examples/simple-dashboard.wire
pnpm cli render-svg examples/simple-dashboard.wire output.svg
```

**Key Commands:**
- `validate` – Check syntax and semantics
- `render-svg` – Generate SVG output
- `render-png` – Generate PNG output (requires Playwright)
- `render-pdf` – Generate PDF output (requires Playwright)

---

## File Organization

```
Wire-DSL/
├── .ai/                          # AI development guidance
├── .github/                       # GitHub workflows, templates
├── docs/                          # Public documentation sources
├── specs/                         # Technical specifications
│   ├── IR-CONTRACT.md
│   ├── LAYOUT-ENGINE.md
│   └── VALIDATION-RULES.md
├── examples/                      # Example .wire files
├── packages/
│   ├── engine/                    # Core parser, IR, layout, renderer
│   │   ├── src/
│   │   │   ├── parser/
│   │   │   ├── ir/
│   │   │   ├── layout/
│   │   │   └── renderer/
│   │   ├── tests/
│   │   └── package.json
│   ├── cli/                       # Command-line interface
│   │   ├── src/
│   │   └── tests/
│   ├── web/                       # Web editor
│   │   ├── src/
│   │   └── package.json
│   ├── editor-ui/                 # Reusable UI components
│   │   ├── src/
│   │   └── package.json
│   └── exporters/                 # PNG, PDF export
├── apps/
│   ├── docs/                      # Astro Starlight docs
│   └── web/                       # Web editor app
├── package.json                   # Root workspace
├── pnpm-workspace.yaml            # Monorepo config
└── turbo.json                     # Turbo build config
```

---

## Common Development Tasks

### Adding a New Component

1. **Define in Engine** (`packages/engine/src/parser/grammar.ts`)
   ```typescript
   // Add to component types
   export type ComponentType = "Button" | "Input" | "YourNewComponent";
   ```

2. **Add SVG Renderer** (`packages/engine/src/renderer/components/`)
   ```typescript
   export function renderYourNewComponent(node: ComponentNode): string {
     // SVG rendering logic
   }
   ```

3. **Test Parsing & Rendering**
   ```bash
   pnpm test --filter @wire-dsl/engine
   ```

4. **Update Documentation** (`docs/COMPONENTS-REFERENCE.md`)

### Adding a CLI Command

1. **Define Command** (`packages/cli/src/commands/`)
2. **Register in CLI** (`packages/cli/src/index.ts`)
3. **Test**
   ```bash
   pnpm cli your-command --help
   ```

### Updating the Web Editor

1. **Modify Component** (`apps/web/src/components/`)
2. **Test Live**
   ```bash
   pnpm dev --filter @wire-dsl/web
   ```
3. **Test Build**
   ```bash
   pnpm build --filter @wire-dsl/web
   ```

---

## Testing

### Run All Tests
```bash
pnpm test
```

### Run Specific Package
```bash
pnpm test --filter @wire-dsl/engine
```

### Watch Mode
```bash
pnpm test -- --watch
```

### Coverage Report
```bash
pnpm test -- --coverage
```

Tests use **Vitest**. Key test locations:
- `packages/engine/tests/`
- `packages/cli/tests/`

---

## Code Quality

### Type Checking
```bash
pnpm typecheck
```

Checks all TypeScript files. Project uses strict mode.

### Linting
```bash
pnpm lint
pnpm lint:fix
```

Uses ESLint with TypeScript support. Rules in `.eslintrc.json`.

### Formatting
```bash
pnpm format
```

Uses Prettier. Config in `prettier.config.js`.

---

## Git Workflow

### Creating a Feature Branch
```bash
git checkout -b feature/my-feature
```

Branch naming: `feature/`, `fix/`, `docs/`, `chore/`

### Before Committing
```bash
pnpm lint:fix
pnpm format
pnpm test
```

Ensures quality before pushing.

### Creating a Pull Request

1. Push your branch
2. Open PR against `main`
3. Provide clear description
4. Link any related issues
5. Ensure CI passes
6. Request review

---

## Performance Tips

### Turbo Cache
Turbo caches build results. To clear cache:
```bash
pnpm turbo clean
```

### Selective Builds
Build only changed packages:
```bash
pnpm build --filter=[HEAD^]
```

### Filter to Specific Package
```bash
pnpm test --filter @wire-dsl/engine
pnpm dev --filter @wire-dsl/web
```

---

## Troubleshooting

### Dependencies Won't Install
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Build Fails
```bash
pnpm clean
pnpm install
pnpm build
```

### Tests Timeout
Increase timeout in test file:
```typescript
describe("My Tests", { timeout: 10000 }, () => {
  // ...
});
```

### Port Already in Use
If `5173` is taken:
```bash
pnpm dev --filter @wire-dsl/web -- --port 3000
```

---

## Documentation Updates

All documentation source files are in `docs/`:
- `DSL-SYNTAX.md` – Language grammar
- `COMPONENTS-REFERENCE.md` – All components
- `ARCHITECTURE.md` – System design
- See [DOCUMENTATION-INDEX.md](../DOCUMENTATION-INDEX.md) for full list

When changing behavior, update corresponding doc.

---

## Creating Issues and PRs

### Before Opening an Issue
1. Search existing issues (may be duplicate)
2. Check [ROADMAP.md](./roadmap.md) for planned work
3. Provide detailed reproduction steps

### PR Requirements
- Clear, descriptive title
- Link related issues
- Describe changes
- Ensure tests pass
- Update docs if needed

---

## Architecture Overview

Wire-DSL processes wireframes through 7 layers:

1. **Lexer** – Tokenization
2. **Parser** – AST generation
3. **IR Generator** – Semantic structure
4. **Validation** – Syntax & semantic checks
5. **Layout Engine** – Size calculation
6. **SVG Renderer** – Vector output
7. **Exporters** – PNG/PDF conversion

See [Architecture](../architecture/overview.md) for details.

---

## Getting Help

- Check [Development Guide](./development.md) (this file)
- Review [Architecture](../architecture/overview.md)
- Search [existing issues](https://github.com/wire-dsl/wire-dsl/issues)
- Read [MONOREPO.md](../MONOREPO.md) for project structure
- Check package-specific `README.md` files

---

## Next Steps

- Review the [Architecture Guide](../architecture/overview.md)
- Read the [DSL Syntax](../language/syntax.md)
- Explore [example files](../examples/index.md)
- Start with [good first issues](https://github.com/wire-dsl/wire-dsl/issues?q=label%3A%22good+first+issue%22)
