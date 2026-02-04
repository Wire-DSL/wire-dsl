---
title: CLI Tool Reference
description: Wire-DSL command-line tool documentation
---

The Wire-DSL CLI is a command-line tool for validating, rendering, and managing Wire-DSL projects.

## Installation

### Option 1: Global Installation (Recommended)

Install the CLI globally via npm:

```bash
npm install -g @wire-dsl/cli
```

Then use the `wire` command anywhere:

```bash
wire validate myfile.wire
wire render myfile.wire -o output.svg
```

**Advantages**:
- Available from any directory
- Simple command syntax
- Works after single installation

### Option 2: From Source

For development or building from source:

```bash
cd packages/cli
pnpm install
pnpm build
```

Then run commands using Node directly:

```bash
node dist/cli.js validate myfile.wire
node dist/cli.js render myfile.wire -o output.svg
```

**Advantages**:
- Test latest changes immediately
- No global installation needed
- Full control over version

---

## Quick Commands

### Validate a File

Check syntax and semantic validity:

```bash
wire validate myfile.wire
```

**Output**:
- ✅ Valid file
- ✅ Detailed errors with line numbers
- ✅ Helpful suggestions for fixes

### Render to SVG

Convert a `.wire` file to SVG:

```bash
wire render myfile.wire -o output.svg
```

**Options**:
- `-o, --output <path>` – Output file path

### Render to PDF

Convert a `.wire` file to PDF:

```bash
wire render myfile.wire -pdf -o output.pdf
```

### Render to PNG

Convert a `.wire` file to PNG:

```bash
wire render myfile.wire -png -o output.png
```

---

## Command Reference

All examples use the global `wire` command. If using from source, replace `wire` with `node dist/cli.js`.

### validate

Validate syntax and semantics of a Wire-DSL file.

**Usage**:
```bash
wire validate <file.wire>
```

**From Source**:
```bash
node dist/cli.js validate <file.wire>
```

**Options**:
- `--format <json|text>` – Output format (default: text)

**Examples**:
```bash
wire validate dashboard.wire
wire validate dashboard.wire --format json
```

**Output**:
```
✅ Valid Wire-DSL file
  - Syntax: OK
  - Semantics: OK
  - Components: 23 found
  - Screens: 2 found
```

Or with errors:
```
❌ Syntax Error at line 12, column 5
   layout stack {
     component BadComponent  ← Unknown component
   }

Suggestion: Use one of the 23 built-in components
```

### render

Render a Wire-DSL file to various formats.

**Usage**:
```bash
wire render <file.wire> [options]
```

**From Source**:
```bash
node dist/cli.js render <file.wire> [options]
```

**Options**:
- `-o, --output <path>` – Output file path (required)
- `-svg` – Output as SVG (default)
- `-png` – Output as PNG
- `-pdf` – Output as PDF
- `--width <pixels>` – Canvas width (default: 1280)
- `--height <pixels>` – Canvas height (default: 720)

**Examples**:
```bash
# SVG (default)
wire render dashboard.wire -o dashboard.svg

# PNG with custom size
wire render dashboard.wire -png -o dashboard.png --width 1920 --height 1080

# PDF
wire render dashboard.wire -pdf -o dashboard.pdf
```

**From Source**:
```bash
node dist/cli.js render dashboard.wire -o dashboard.svg
node dist/cli.js render dashboard.wire -png -o dashboard.png --width 1920
```

### init

Initialize a new Wire-DSL project (future feature).

```bash
wire init my-project
```

Or from source:
```bash
node dist/cli.js init my-project
```

---

## Package-Specific Commands

### Engine (Parser, Layout, Renderer)

```bash
cd packages/engine

# Test
pnpm test
pnpm test:watch

# Build
pnpm build

# Type check
pnpm type-check
```

### Exporters (SVG, PNG, PDF)

```bash
cd packages/exporters

# Test
pnpm test

# Build
pnpm build
```

### CLI

```bash
cd packages/cli

# Build
pnpm build

# Test
pnpm test

# Run directly from source
node dist/cli.js --help
node dist/cli.js validate <file.wire>
node dist/cli.js render <file.wire> -o output.svg

# Install globally from source
npm install -g .
wire --help
```

### Web Editor

```bash
cd apps/web

# Dev server
pnpm dev

# Build
pnpm build

# Preview production build
pnpm preview
```

---

## Monorepo Commands

From the project root:

```bash
# Install all dependencies
pnpm install

# Start all dev servers
pnpm dev

# Build all packages
pnpm build

# Run all tests
pnpm test

# Check TypeScript
pnpm type-check

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Clean all build artifacts
pnpm clean
```

### Filter by Package

```bash
# Build only engine
pnpm build --filter=@wire-dsl/engine

# Test only CLI
pnpm test --filter=@wire-dsl/cli

# Run only affected changes
pnpm build --filter=[HEAD~1]
```

---

## Advanced Options

### Show Help

```bash
# Global installation
wire --help
wire validate --help
wire render --help

# From source
node dist/cli.js --help
node dist/cli.js validate --help
```

### Verbose Output

```bash
# Global installation
wire validate myfile.wire --verbose
wire render myfile.wire -o output.svg --verbose

# From source
node dist/cli.js validate myfile.wire --verbose
node dist/cli.js render myfile.wire -o output.svg --verbose
```

### Watch Mode (Engine)

```bash
cd packages/engine
pnpm test:watch
```

Continuously runs tests as files change.

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Syntax error in file |
| 3 | Semantic error in file |
| 4 | File not found |
| 5 | Permission denied |

### Example

```bash
wire validate myfile.wire
echo $?  # Exit code
```

---

## Environment Variables

### Debug Mode

```bash
DEBUG=wire-dsl:* wire validate myfile.wire
```

Shows detailed debug output for troubleshooting.

---

## Scripting

### Batch Processing

Validate all `.wire` files in a directory:

```bash
# Using global installation
for file in *.wire; do
  wire validate "$file" && echo "✅ $file" || echo "❌ $file"
done

# From source
for file in *.wire; do
  node dist/cli.js validate "$file" && echo "✅ $file" || echo "❌ $file"
done
```

### Automated Rendering

Render all files to SVG:

```bash
# Using global installation
for file in *.wire; do
  name="${file%.wire}"
  wire render "$file" -o "output/${name}.svg"
done

# From source
for file in *.wire; do
  name="${file%.wire}"
  node dist/cli.js render "$file" -o "output/${name}.svg"
done
```

### CI/CD Integration

Validate in a pipeline:

```bash
# Using global installation
wire validate *.wire || exit 1

# From source
node dist/cli.js validate *.wire || exit 1
```

```yaml
# GitHub Actions example
- name: Validate Wire-DSL files
  run: |
    for file in wireframes/*.wire; do
      wire validate "$file" --format json
    done
```

---

## Troubleshooting

### Command Not Found

If `wire` command is not found:

```bash
# Option 1: Install globally (if not already installed)
npm install -g @wire-dsl/cli

# Option 2: Use npx (requires no installation)
npx @wire-dsl/cli validate myfile.wire

# Option 3: Use from source (from monorepo)
cd packages/cli
pnpm build
node dist/cli.js validate myfile.wire

# Option 4: Check if installed
npm list -g @wire-dsl/cli
```

### File Not Found

Ensure the file path is correct:

```bash
# Check if file exists
ls -la myfile.wire

# Use absolute path
wire validate /full/path/to/file.wire

# Use relative path (from current directory)
wire validate ./wireframes/dashboard.wire

# Debug: List all .wire files in current directory
ls *.wire
```

### Permission Denied

When rendering to a directory without write permissions:

```bash
# Check permissions
ls -la output/

# Create output directory with proper permissions
mkdir -p output
chmod 755 output

# Render with full path to writable directory
wire render myfile.wire -o /tmp/output.svg
```

### Port Already in Use (Web Editor)

If `pnpm dev` fails due to port conflicts:

```bash
# Use a different port
pnpm dev --port 3001
```

### Out of Memory

For large renders:

```bash
# Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 wire render large.wire -o output.svg
```

### Performance Issues

Profile and debug rendering:

```bash
# Debug mode
DEBUG=wire-dsl:* wire render myfile.wire -o output.svg

# Check rendering time
time wire render myfile.wire -o output.svg
```

# Set permissions
chmod 755 output
```

### Out of Memory

For very large files (10,000+ components):

```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" wire render huge.wire -o output.svg
```

---

## Performance Tips

1. **Validate before rendering** to catch errors early
2. **Keep files under 1,000 components** for best performance
3. **Use the web editor** for interactive development
4. **Batch render** with scripts for multiple files
5. **Profile** with `--verbose` flag if slow

---

## Next Steps

- [Getting Started](../getting-started/installation.md)
- [Web Editor Guide](../getting-started/web-preview.md)
- [LLM Prompting Guide](./llm-prompting.md)
