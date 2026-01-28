# WireDSL Command Reference

## Quick Reference Card

### 🔧 Essential Commands

```bash
# Installation (ONE TIME)
pnpm install

# Daily Development
pnpm dev              # Start all dev servers
pnpm test             # Run all tests
pnpm lint             # Check code style
pnpm build            # Build all packages

# Specific Package
cd packages/core
pnpm test:watch       # Watch mode for tests
pnpm dev              # Start dev server (if available)

# Code Quality
pnpm format           # Format all code
pnpm type-check       # TypeScript validation
pnpm clean            # Remove all build artifacts
```

---

## 📦 Package-Specific Commands

### @wire-dsl/core

```bash
cd packages/core
pnpm build            # Build parser library
pnpm test             # Run parser tests
pnpm test:watch       # Watch mode
```

### @wire-dsl/cli

```bash
cd packages/cli
pnpm build            # Build CLI tool
pnpm test             # Run CLI tests
node dist/cli.js --help
```

### @wire-dsl/web

```bash
cd packages/web
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Build for production
pnpm preview          # Preview production build
```

### @wire-dsl/ai-backend

```bash
cd packages/ai-backend
pnpm dev              # Start local worker
wrangler deploy       # Deploy to Cloudflare
```

### @wire-dsl/studio

```bash
cd packages/studio
# Placeholder - roadmap feature
```

---

## 🔄 Turborepo Commands

### Filter by Package

```bash
# Build only core
pnpm build --filter=@wire-dsl/core

# Test only web
pnpm test --filter=@wire-dsl/web

# Lint only CLI
pnpm lint --filter=@wire-dsl/cli

# Build only affected packages
pnpm build --filter=[HEAD~1]
```

### Advanced Options

```bash
# Show task dependencies
pnpm build -- --graph

# Force rebuild (skip cache)
pnpm build -- --force

# Verbose output
pnpm build -- --verbose

# Profile build performance
pnpm build -- --profile=profile-name
```

---

## 📝 Version Management (Changesets)

```bash
# Create a changeset
pnpm changeset

# Bump versions
pnpm version

# Publish to NPM
pnpm release

# View pending changesets
cat .changeset/
```

**Changeset Prompts:**

1. Select packages that changed
2. Choose: major/minor/patch bump
3. Write change description
4. Commit & push

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm test --filter=@wire-dsl/core

# Watch mode
cd packages/core && pnpm test:watch

# Coverage report
pnpm test -- --coverage

# UI mode
cd packages/core && pnpm test:ui
```

### Test File Location

```
packages/[name]/src/[module]/[file].test.ts
```

---

## 🎨 Code Quality

```bash
# Lint all
pnpm lint

# Lint specific package
pnpm lint --filter=@wire-dsl/core

# Fix all
pnpm lint:fix

# Format all
pnpm format

# TypeScript check
pnpm type-check
```

---

## 📦 Dependencies

### Add to Package

```bash
# Navigate to package
cd packages/core

# Add external package
pnpm add lodash

# Add dev dependency
pnpm add -D vitest

# Add workspace package
pnpm add @wire-dsl/core --workspace
```

### Update Dependencies

```bash
# Check outdated
pnpm outdated

# Update all
pnpm update -r

# Update specific
cd packages/core && pnpm update zod
```

---

## 🚀 Deployment

### Web Editor (Cloudflare Pages)

```bash
# Preview locally
cd packages/web
pnpm dev

# Build for production
pnpm build

# Deploy (GitHub Actions automatic)
# Or manual: push to main
```

### CLI Tool (NPM)

```bash
# Build
pnpm build:cli

# Test binary
node packages/cli/dist/cli.js --version

# Publish (automatic via changesets)
pnpm release
```

### AI Backend (Cloudflare Workers)

```bash
# Navigate
cd packages/ai-backend

# Local development
pnpm dev

# Deploy
wrangler deploy

# View logs
wrangler tail
```

---

## 🐛 Debugging

### TypeScript Errors

```bash
pnpm type-check
# or per-package
cd packages/core && tsc --noEmit
```

### Build Issues

```bash
pnpm clean          # Remove artifacts
pnpm build          # Full rebuild
```

### Test Failures

```bash
cd packages/core
pnpm test -- --reporter=verbose
pnpm test -- src/parser/index.test.ts
```

### Dependency Issues

```bash
pnpm ls              # Show dependency tree
pnpm ls -r           # Recursive, all packages
pnpm ls --depth=0    # Top level only
```

---

## 🔗 Workspace Navigation

### Quick Access

```bash
# Root
cd .

# Core package
cd packages/core

# Web editor
cd packages/web

# CLI tool
cd packages/cli

# AI Backend
cd packages/ai-backend

# Back to root (from any package)
cd ../..
```

---

## 📊 Useful Information

### Show Package Info

```bash
# All packages
pnpm ls -r

# Only @wire-dsl packages
pnpm ls -r | grep @wire-dsl

# Dependency tree
pnpm ls --depth=2
```

### Git Operations

```bash
# Status
git status

# Create branch
git checkout -b feature/name

# Commit
git commit -m "feat(core): description"

# Push
git push origin feature/name

# Create PR (then open GitHub)
```

---

## ⚡ Performance Tips

### Speed Up Builds

```bash
# Use Turborepo cache
pnpm build          # Uses cache from previous builds

# Filter to specific packages
pnpm build --filter=@wire-dsl/core

# Skip dependencies
pnpm build -- --no-deps
```

### Speed Up Tests

```bash
# Run only affected
pnpm test -- --related=[files]

# Watch mode for development
pnpm test:watch

# Disable coverage
pnpm test -- --no-coverage
```

---

## 🆘 Common Issues

| Issue                     | Solution                               |
| ------------------------- | -------------------------------------- |
| `Module not found`        | `pnpm install`                         |
| `EACCES permission error` | Run with `sudo` or fix npm permissions |
| `pnpm: not found`         | Install pnpm: `npm install -g pnpm@8`  |
| `Port 3000 in use`        | Change port in vite.config.ts          |
| `TypeScript errors`       | Run `pnpm type-check` and fix          |
| `Workspace not found`     | Check package.json workspaces array    |

---

## 📚 Documentation Links

| Document                                                         | Purpose              |
| ---------------------------------------------------------------- | -------------------- |
| [QUICKSTART.md](./QUICKSTART.md)                                 | Getting started      |
| [MONOREPO.md](./MONOREPO.md)                                     | Structure & workflow |
| [docs/technical-stack.md](./docs/technical-stack.md)             | Technology decisions |
| [docs/ARCHITECTURE_DETAILED.md](./docs/ARCHITECTURE_DETAILED.md) | System design        |
| [.github/CONTRIBUTING.md](./.github/CONTRIBUTING.md)             | Contributing guide   |

---

## 🎯 Quick Workflows

### Feature Development

```bash
git checkout -b feature/my-feature
cd packages/core
# Edit files
pnpm test:watch     # See tests pass
pnpm lint:fix       # Auto-fix style
git commit -m "feat(core): my feature"
git push origin feature/my-feature
# Create PR on GitHub
```

### Release

```bash
# On main branch
pnpm changeset
# Answer prompts
git add .changeset/*.md
git commit -m "chore: version bump"
git push

# GitHub Actions handles the rest
# Or manual: pnpm release
```

### Deploy Web

```bash
cd packages/web
pnpm build
# Cloudflare Pages auto-deploys from main
# Or: wrangler deploy
```

---

## 🎨 Wire Render Command

The `wire render` command converts WireDSL `.wire` files to SVG, PNG, or PDF formats.

### Basic Usage

```bash
# Render to stdout (SVG)
wire render input.wire

# Render to file
wire render input.wire --svg output.svg
wire render input.wire --pdf output.pdf
wire render input.wire --png output.png

# Render specific screen
wire render input.wire --screen "Dashboard"

# Watch mode (re-render on file change)
wire render input.wire --watch
```

### Options

| Option | Description | Example |
|--------|-------------|---------|
| `--svg` | Save as SVG file | `--svg output.svg` |
| `--pdf` | Save all screens as multipage PDF | `--pdf output.pdf` |
| `--png` | Save as PNG file(s) | `--png output.png` |
| `--out` | Auto-detect format from extension | `--out output.pdf` |
| `--screen` | Render specific screen by name | `--screen "Home"` |
| `--theme` | Apply theme (light/dark) | `--theme dark` |
| `--width` | Override viewport width (px) | `--width 1920` |
| `--height` | Override viewport height (px) | `--height 1080` |
| `--watch` | Watch for file changes | `--watch` |

### Export Formats

**SVG** (default output)
- Scalable vector format
- Best for web, edit-friendly
- Single file for one screen, directory for multiple

**PNG** (raster image)
- Fixed resolution image
- Fast to share, lightweight
- Single file for one screen, multiple files for multi-screen

**PDF** (document format)
- All screens on separate pages
- Print-friendly
- Always multipage (one file)

### Multiscreen Handling

```bash
# Single screen → single file
wire render app.wire --png output.png
# Creates: output.png

# Multiple screens → multiple files
wire render app.wire --png output/
# Creates: output/app-screen1.png, output/app-screen2.png, ...

# Export to PDF (always single multipage file)
wire render app.wire --pdf output.pdf
# Creates: output.pdf (with each screen as a page)
```

### Architectural Note

As of January 27, 2026, the export functions (SVG, PNG, PDF) have been centralized in the `@wire-dsl/core` package. This enables reuse by other systems (web editor, studio, AI backend) without duplicating export logic. The CLI continues to provide the same interface, maintaining 100% backward compatibility.

---

**Last Updated**: January 27, 2026  
**Quick Ref Version**: 1.1
