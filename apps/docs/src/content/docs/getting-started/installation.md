---
title: Installation
description: Get Wire-DSL up and running in 5 minutes
---

## Prerequisites

Before installing Wire-DSL, ensure you have:

- **Node.js 20+** (LTS version recommended)
- **pnpm 8+** (fast, space-efficient package manager)

Verify your versions:

```bash
node --version   # Should be 20 or higher
pnpm --version   # Should be 8 or higher
```

## Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Wire-DSL/wire-dsl.git
cd wire-dsl
```

### 2. Install Dependencies

```bash
pnpm install
```

This command installs all dependencies for the entire monorepo including the parser, CLI, web editor, and all supporting packages.

### 3. Verify Installation

Run the build and tests to confirm everything is working:

```bash
pnpm build
pnpm type-check
pnpm test
```

All commands should complete without errors.

## Start the Web Editor

The easiest way to start building wireframes is with the interactive web editor:

```bash
cd apps/web
pnpm dev
```

Then open your browser to **http://localhost:3000** and you'll see the Wire-DSL editor with live preview.

## Alternative: Use the CLI

If you prefer working with command-line tools:

```bash
cd packages/cli
pnpm build
node dist/index.js --help
```

This shows all available CLI commands for rendering and validating `.wire` files.

## Project Structure

The monorepo is organized into several packages:

- **[@wire-dsl/engine](../../packages/engine)** – Parser, IR generator, layout engine, and SVG renderer
- **[@wire-dsl/exporters](../../packages/exporters)** – Export to SVG, PNG, and PDF
- **[@wire-dsl/cli](../../packages/cli)** – Command-line interface
- **[@wire-dsl/web](../../apps/web)** – Live web editor (React + Monaco)

## Common Development Commands

From the root directory:

```bash
pnpm dev              # Start all dev servers
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Check code style
pnpm lint:fix         # Fix linting issues
pnpm format           # Format all code
pnpm type-check       # Validate TypeScript
pnpm clean            # Remove all build artifacts
```

## Troubleshooting

### `pnpm: command not found`

Install pnpm globally:

```bash
npm install -g pnpm
```

### Build fails with TypeScript errors

Ensure you're running Node.js 20+ and pnpm 8+:

```bash
node --version
pnpm --version
```

### Port 3000 already in use

If port 3000 is already in use, the web editor will automatically try the next available port. Check the terminal output for the actual URL.

## Next Steps

- [Create Your First Wireframe](./first-wire.md)
- [Explore the Web Editor](./web-preview.md)
- [Learn the DSL Syntax](../language/syntax.md)
