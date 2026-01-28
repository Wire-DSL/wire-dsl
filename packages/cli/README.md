# @wire-dsl/cli

Command-line interface for Wire-DSL. Transform `.wire` DSL files into interactive wireframes, components, and releases.

## Installation

```bash
npm install -g @wire-dsl/cli
```

Or use with `npx`:

```bash
npx @wire-dsl/cli [command]
```

## Usage

### Basic Commands

```bash
# Render a .wire file to PDF/SVG
wire render input.wire --output output.pdf

# Validate .wire file syntax
wire validate input.wire

# Initialize a new WireDSL project
wire init my-project

# Show version
wire --version

# Help
wire --help
```

### Command Examples

**Render to PDF:**
```bash
wire render dashboard.wire --output dashboard.pdf
```

**Render to SVG (stdout):**
```bash
wire render dashboard.wire
```

**Validate syntax:**
```bash
wire validate dashboard.wire
```

**Initialize new project:**
```bash
wire init
# or with a name:
wire init my-wireframes
```

## What is Wire-DSL?

Wire-DSL is a **block-declarative Domain-Specific Language** for creating interactive wireframes using code instead of visual tools.

Write wireframes like this:

```wire
screen "Dashboard" {
  layout grid(columns: 2, gap: 16) {
    layout card(padding: lg, gap: md, border: true) {
      component StatCard title: "Q4 Revenue" value: "$2.5M"
    }
    
    layout card(padding: lg, gap: md, border: true) {
      component StatCard title: "Active Users" value: "1.2K"
    }
  }
}
```

## Features

- 🎯 **Block-declarative syntax** - Intuitive, structured definitions
- 📱 **23 UI components** - Buttons, forms, cards, modals, and more
- 🎨 **Theming support** - Customize colors, typography, spacing
- 🔄 **Responsive layouts** - Grid, Stack, Split containers
- ⚡ **Fast compilation** - Powered by Chevrotain parser
- 🧪 **Validation** - Zod-based schema validation

## Documentation

- [Full Documentation](https://github.com/Wire-DSL/wire-dsl#readme)
- [DSL Syntax Guide](https://github.com/Wire-DSL/wire-dsl/blob/main/docs/DSL-SYNTAX.md)
- [Components Reference](https://github.com/Wire-DSL/wire-dsl/blob/main/docs/COMPONENTS-REFERENCE.md)

## License

MIT
