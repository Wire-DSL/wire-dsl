# 🎯 WireDSL - Quick Start Guide

> **Wireframes as Code.** Declarative wireframing with AI-friendly syntax.

## ⚡ Get Started in 5 Minutes

### Prerequisites

```bash
# Verify Node.js version
node --version  # Should be 20+

# Verify pnpm version
pnpm --version  # Should be 8+
```

### First Time Setup

```bash
# Install all dependencies
pnpm install

# Verify everything works
pnpm build
pnpm type-check
pnpm test
```

### Start the Live Editor

```bash
cd apps/web
pnpm dev
# → Open http://localhost:3000
```

### Work on Different Packages

```bash
# Engine (Parser + Layout + Renderer)
cd packages/engine
pnpm test:watch

# Exporters (SVG, PNG, PDF)
cd packages/exporters
pnpm test:watch

# CLI Tool
cd packages/cli
pnpm build
node dist/index.js --help

# Web Editor
cd apps/web
pnpm dev
```

### Root Level Commands

```bash
pnpm dev              # Start all dev servers
pnpm build            # Build all packages
pnpm build:engine     # Build only engine
pnpm build:exporters  # Build only exporters
pnpm build:cli        # Build only CLI
pnpm build:web        # Build only web

pnpm test             # Run all tests
pnpm test:engine      # Test only engine
pnpm test:exporters   # Test only exporters
pnpm test:web         # Test only web

pnpm lint             # Check code style
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code
pnpm type-check       # Validate TypeScript
```
pnpm lint:fix         # Fix style issues
pnpm format           # Format all code
pnpm type-check       # Validate TypeScript
pnpm clean            # Clean all dist folders
```

---

## 📁 Project Structure

```
wire-dsl/
├── packages/
│   ├── engine/        # Parser, IR generator, layout engine, SVG renderer
│   ├── exporters/     # SVG, PNG, PDF export (Node.js only)
│   ├── cli/           # Command-line tool
│   └── web/           # React + Monaco live editor
│
├── docs/              # Documentation (architecture, syntax, theme, etc.)
├── specs/             # Technical specifications (IR, layout, validation)
├── examples/          # Example .wire files
├── .github/
│   ├── workflows/     # CI/CD (test, build, publish)
│   └── CONTRIBUTING.md
└── config/            # Shared config (vitest, etc.)
```

For full details, see [MONOREPO.md](./MONOREPO.md)

---

## 🔗 Important Documents

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Project overview & features |
| [MONOREPO.md](./MONOREPO.md) | Monorepo structure & workflow |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design |
| [docs/DSL-SYNTAX.md](./docs/DSL-SYNTAX.md) | Language syntax guide |
| [docs/COMPONENTS-REFERENCE.md](./docs/COMPONENTS-REFERENCE.md) | 23 component types |
| [docs/LLM-PROMPTING.md](./docs/LLM-PROMPTING.md) | AI generation guide |
| [.github/CONTRIBUTING.md](./.github/CONTRIBUTING.md) | How to contribute |

---

## 🚀 Next Steps

1. **Start the web editor**: `cd apps/web && pnpm dev`
2. **Read the docs**: Start with [MONOREPO.md](./MONOREPO.md)
3. **Explore examples**: Check [examples/](./examples/) for `.wire` files
4. **Contribute**: See [CONTRIBUTING.md](./.github/CONTRIBUTING.md)

---

**Last Updated**: February 1, 2026  
**Status**: ✅ Phase 1 Complete - Ready for Phase 2  
**Current Branch**: refactor/core-to-engine → Ready to merge to main
