# 🎯 WireDSL Monorepo - Initialization Complete

> **Wireframes as Code.** Declarative wireframing with AI-powered generation.

## ✨ What's New

Your monorepo is now fully scaffolded and ready for development! Here's what was created:

### 📦 **5 Production-Ready Packages**

1. **@wire-dsl/engine** - Engine (parser, IR, layout, renderer)
2. **@wire-dsl/exporters** - Exporters (SVG, PNG, PDF - Node.js)
3. **@wire-dsl/cli** - Command-line tool
4. **@wire-dsl/web** - Live web editor (React + Monaco)

### 🔧 **Infrastructure Configured**

- ✅ **pnpm workspaces** - Package management
- ✅ **Turborepo** - Build orchestration & caching
- ✅ **TypeScript** - Full type safety across packages
- ✅ **ESLint + Prettier** - Code quality
- ✅ **Vitest** - Testing framework
- ✅ **GitHub Actions** - CI/CD pipelines
- ✅ **Changesets** - Version management

### 📚 **Documentation**

- [MONOREPO.md](./MONOREPO.md) - Full monorepo guide
- [.github/CONTRIBUTING.md](./.github/CONTRIBUTING.md) - Contribution guidelines

---

## 🚀 Quick Start

### Prerequisites

```bash
# Verify Node.js version
node --version  # Should be 20+

# Verify pnpm version (or install)
pnpm --version  # Should be 8+
```

### First Time Setup

```bash
# Install all dependencies (one-time)
pnpm install

# Verify everything works
pnpm test
pnpm lint
pnpm build
```

### Daily Development

```bash
# Option 1: Start web editor dev server
cd packages/web
pnpm dev

# Option 2: Work on core package
cd packages/core
pnpm test:watch

# Option 3: Test CLI tool
cd packages/cli
pnpm build
node dist/cli.js render --help
```

### Root Level Commands

```bash
pnpm dev              # Start all dev servers
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Check code style
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
│   ├── engine/            # @wire-dsl/engine (parser, IR, layout, renderer)
│   │   ├── src/
│   │   │   ├── parser/    # Chevrotain parser → AST
│   │   │   ├── ir/        # AST → IR (JSON)
│   │   │   ├── layout/    # IR → Positions
│   │   │   └── renderer/  # Positions → SVG
│   │   └── tests/
│   │
│   ├── exporters/         # @wire-dsl/exporters (SVG/PNG/PDF export)
│   │   ├── src/
│   │   │   ├── svg.ts     # SVG file export
│   │   │   ├── png.ts     # PNG export (sharp)
│   │   │   ├── pdf.ts     # PDF export (pdfkit)
│   │   │   └── helpers.ts # Utilities
│   │   └── tests/
│   │
│   ├── cli/               # @wire-dsl/cli (CLI wrapper)
│   │   └── commands/
│   │
│   └── web/               # @wire-dsl/web (React app)
│       ├── src/
│       │   ├── components/
│       │   └── App.tsx
│       └── index.html
│
├── docs/                  # Documentation
├── specs/                 # Specifications
├── examples/              # Example .wire files
├── .github/
│   ├── workflows/         # CI/CD pipelines
│   └── CONTRIBUTING.md
└── package.json           # Root workspace
```

---

## 🔄 Development Workflow

### Working on a Feature

```bash
# 1. Create feature branch
git checkout -b feature/awesome-feature

# 2. Make changes in any package(s)
cd packages/core
# ... edit code ...

# 3. Test locally
pnpm test:core
pnpm lint:fix

# 4. Build and verify
pnpm build:core

# 5. Commit with conventional format
git commit -m "feat(core): add awesome feature"

# 6. Push and create PR
git push origin feature/awesome-feature
```

### Updating Cross-Package Dependencies

```bash
# All packages can import from each other using workspace protocol
// In packages/cli/package.json
{
  "dependencies": {
    "@wire-dsl/engine": "workspace:*",
    "@wire-dsl/exporters": "workspace:*"
  }
}

// In packages/cli/src/cli.ts
import { parseWireDSL, generateIR } from '@wire-dsl/engine';
import { exportSVG, exportPNG } from '@wire-dsl/exporters';
```

---

## 🎯 Implementation Roadmap

### Phase 1: Core Engine (Current)

- [ ] Parser with Chevrotain
- [ ] IR Generator
- [ ] Layout Engine
- [ ] SVG Renderer
- [ ] Core tests & docs

### Phase 2: CLI Tool

- [ ] Render command
- [ ] Validate command
- [ ] Init command
- [ ] Output formats (SVG, PNG)

### Phase 3: Web Editor

- [ ] Monaco editor integration
- [ ] Live preview
- [ ] SVG rendering
- [ ] Shareable links

### Phase 4: Visual Editor

- [ ] Canvas component
- [ ] Drag-and-drop
- [ ] Property inspector
- [ ] Code ↔ Visual sync

### Phase 5: Collaboration

- [ ] Real-time sync
- [ ] Yjs backend
- [ ] Team management

---

## 📊 Key Decisions Made

### Why Monorepo?

✅ Atomic changes across packages  
✅ Shared configuration & dependencies  
✅ Better TypeScript integration  
✅ Single CI/CD pipeline  
✅ But: Independent npm publishing

### Why Cloudflare?

✅ Edge computing (Workers)  
✅ Free tier is generous  
✅ No vendor lock-in  
✅ Built-in CDN  
✅ SQLite support (D1)

### Why React for Web?

✅ Mature ecosystem  
✅ Monaco editor integration  
✅ Best for drag-and-drop editors  
✅ Base for visual editor

---

## 🚢 Deployment

### Web Editor (Cloudflare Pages)

```bash
# Preview locally
cd packages/web
pnpm dev

# Deploy (automatic on push to main)
# Configure in Cloudflare dashboard:
# - Framework: React
# - Build command: pnpm build:web
# - Output: packages/web/dist
```

### NPM Packages

```bash
# Create changeset
pnpm changeset

# This auto-generates versions
# Push to main triggers GitHub Actions
# Publishes automatically
```

---

## 📚 Key Files to Know

| File                                                 | Purpose                |
| ---------------------------------------------------- | ---------------------- |
| [package.json](./package.json)                       | Workspace root config  |
| [turbo.json](./turbo.json)                           | Build orchestration    |
| [docs/technical-stack.md](./docs/technical-stack.md) | All tech decisions     |
| [MONOREPO.md](./MONOREPO.md)                         | How the monorepo works |
| [.github/CONTRIBUTING.md](./.github/CONTRIBUTING.md) | Contribution guide     |
| [.github/workflows/](./github/workflows/)            | Automated pipelines    |

---

## 🆘 Troubleshooting

### Dependencies not installing

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Build errors

```bash
# Clean all artifacts
pnpm clean

# Rebuild
pnpm build
```

### TypeScript errors

```bash
# Check all packages
pnpm type-check

# Fix in specific package
cd packages/core
tsc --noEmit
```

### CI/CD not running

- Check `.github/workflows/` files
- Verify GitHub Actions is enabled
- Check branch protection rules

---

## 💡 Pro Tips

1. **Use Turborepo caching** - It only rebuilds changed packages
2. **Filter with --filter** - `pnpm build --filter=@wire-dsl/engine --filter=@wire-dsl/exporters`
3. **Watch mode** - `pnpm test:watch` for development
4. **Monorepo visualization** - `pnpm ls -r` shows dependency tree
5. **Changesets** - Use `pnpm changeset` instead of manual versioning

---

## 🤝 Contributing

See [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for:

- Development setup
- Code style guidelines
- Testing requirements
- PR process
- Commit message format

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details

---

## 🔗 Resources

- **GitHub**: https://github.com/wire-dsl/wire-dsl
- **Website**: https://wire-dsl.dev
- **NPM**: https://www.npmjs.com/org/wire-dsl
- **Docs**: [docs/](./docs/)

---

## ✅ Setup Checklist

- [x] Monorepo structure created
- [x] Package configurations ready
- [x] TypeScript configured
- [x] Build system (Turborepo)
- [x] Testing framework (Vitest)
- [x] Linting & formatting
- [x] CI/CD pipelines
- [x] Version management (Changesets)
- [x] Documentation

**Status**: 🚀 Ready for implementation!

---

**Last Updated**: January 20, 2026  
**Next Step**: Begin parser implementation with Chevrotain
