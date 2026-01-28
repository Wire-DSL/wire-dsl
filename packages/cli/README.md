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
# Compile a .wire file to interactive HTML
wire compile input.wire --output output.html

# Watch mode for development
wire watch input.wire --output output.html

# Generate component definitions
wire generate input.wire --output components.json

# Validate .wire file syntax
wire validate input.wire

# Show version
wire --version

# Help
wire --help
```

## What is Wire-DSL?

Wire-DSL is a **block-declarative Domain-Specific Language** for creating interactive wireframes using code instead of visual tools.

Write wireframes like this:

```wire
screen "Dashboard" {
  grid(columns: 2, gap: 16) {
    card "Revenue" {
      text "Q4 Revenue"
      heading "$2.5M"
    }
    
    card "Users" {
      text "Active Users"
      heading "1.2K"
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
