# WireDSL Monorepo

> **Wireframes as Code.** Declarative wireframing with AI-powered generation.

This is a monorepo containing all packages for the WireDSL project.

## 📦 Packages

### Core Packages

- **[@wire-dsl/engine](./packages/engine)** - Parser, IR generator, layout engine, and SVG renderer
- **[@wire-dsl/exporters](./packages/exporters)** - Exporter to SVG, PDF and PNG
- **[@wire-dsl/cli](./packages/cli)** - Command-line interface for WireDSL
- **[@wire-dsl/web](./packages/web)** - Live web editor (React + Monaco)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (LTS)
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint and format
pnpm lint
pnpm format
```

### Development Scripts

```bash
# Build specific package
pnpm build:engine
pnpm build:exporters
pnpm build:cli
pnpm build:web

# Test specific package
pnpm test:engine
pnpm test:exporters
pnpm test:cli
pnpm test:web

# Type check
pnpm type-check

# Fix linting issues
pnpm lint:fix
```

## 📁 Project Structure

```
wire-dsl/
├── packages/
│   ├── engine/              # @wire-dsl/engine (Parser + IR + Layout + SVG Renderer)
│   │   ├── src/
│   │   │   ├── parser/    # Chevrotain parser (pure JS)
│   │   │   ├── ir/        # IR generator
│   │   │   ├── layout/    # Layout engine
│   │   │   ├── renderer/  # SVG renderer
│   │   │   └── index.ts
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── exporters/         # @wire-dsl/exporters (SVG, PNG, PDF export)
│   │   ├── src/
│   │   │   ├── svg.ts     # SVG file export
│   │   │   ├── png.ts     # PNG export via sharp
│   │   │   ├── pdf.ts     # Multipage PDF via pdfkit
│   │   │   ├── helpers.ts # Color & dimension utilities
│   │   │   ├── types/     # Type declarations
│   │   │   └── index.ts
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── cli/               # @wire-dsl/cli (Command-line tool)
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   ├── cli.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── web/               # @wire-dsl/web (Live web editor)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── studio/            # @wire-dsl/studio (Visual editor - Roadmap)
│   │   └── package.json
│   │
│   └── ai-backend/        # @wire-dsl/ai-backend (AI service)
│       ├── src/
│       │   ├── routes/
│       │   ├── middleware/
│       │   ├── utils/
│       │   └── index.ts
│       └── package.json
│
├── docs/                  # Documentation
│   ├── architecture.md
│   ├── technical-stack.md
│   ├── dsl-syntax.md
│   └── ...
│
├── specs/                 # Specifications
│   ├── ir-contract.md
│   ├── components.md
│   └── ...
│
├── examples/              # Example .wire files
│   ├── simple-dashboard.wire
│   ├── form-example.wire
│   └── ...
│
├── .github/
│   ├── workflows/         # GitHub Actions CI/CD
│   └── CONTRIBUTING.md
│
├── config/                # Shared configuration
│   └── vitest.config.ts
│
├── package.json           # Root workspace config
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc.json
└── README.md
```

## 🔧 Development Workflow

### Making Changes

1. **Work on a single package** - Make changes in `packages/*/src`
2. **Type safety** - TypeScript validates across packages automatically
3. **Test locally** - `pnpm test:engine` (only runs affected tests)
4. **Build locally** - `pnpm build` (Turborepo caches unchanged packages)

### Cross-Package Dependencies

Use workspace protocol for local dependencies:

```json
{
  "dependencies": {
    "@wire-dsl/engine": "workspace:*",
    "@wire-dsl/exporters": "workspace:*"
  }
}
```

**Notes:**
- Use `@wire-dsl/engine` for browser-compatible code (pure JS/TS)
- Use `@wire-dsl/exporters` for Node.js file I/O operations
- CLI uses both; Web/Studio uses only engine

### Version Management

```bash
# Create changeset (select which packages changed)
pnpm changeset

# Generate new versions
pnpm version

# Publish to npm
pnpm release
```

## 📚 Documentation

- [Technical Stack](./docs/technical-stack.md) - Complete technology decisions
- [Architecture](./docs/architecture.md) - System design
- [DSL Syntax](./docs/dsl-syntax.md) - WireDSL language spec
- [IR Contract](./specs/ir-contract.md) - Intermediate representation
- [Contributing](./docs/contributing.md) - How to contribute

## 🚢 Deployment

### Web Editor (Cloudflare Pages)

```bash
# Automatic deployment on push to main
# Configure in Cloudflare Pages:
# - Framework: React
# - Build command: pnpm build:web
# - Build output: packages/web/dist
```

### AI Backend (Cloudflare Workers)

```bash
# Automatic deployment on push to main
# Configure in Cloudflare Workers:
# - Build command: pnpm build:ai
# - Entry point: packages/ai-backend/src/index.ts
```

### NPM Packages

```bash
# Manual or automated release
pnpm release
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test -- --coverage

# Watch mode (single package)
cd packages/engine
pnpm test:watch
```

## 📊 Monorepo Benefits

- ✅ **Single source of truth** - One place to manage dependencies
- ✅ **Atomic changes** - Update engine, exporters, and CLI in single PR
- ✅ **Shared configuration** - ESLint, Prettier, TypeScript
- ✅ **Turborepo caching** - Fast builds (only changed packages)
- ✅ **CI efficiency** - One pipeline for all packages
- ✅ **Developer experience** - One `git clone`, one `pnpm install`

## 🔗 Links

- **GitHub**: https://github.com/wire-dsl/wire-dsl
- **Website**: https://wire-dsl.dev
- **NPM**: https://www.npmjs.com/org/wire-dsl
- **Discord**: Coming soon

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details

## 🤝 Contributing

See [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for guidelines.

---

**Last Updated**: February 1, 2026
**Status**: ✅ Engine + Exporters separation complete - Ready for production
