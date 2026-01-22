# Wire DSL - VS Code Extension

Syntax highlighting, autocompletion, and preview for **Wire DSL** `.wire` files.

## Features

### ✅ Phase 1: Syntax Highlighting (Current)
- **Keywords** highlighting (`project`, `screen`, `stack`, `grid`, `panel`, `split`, `form`, `table`)
- **Component types** highlighting (40+ UI components: `Button`, `Input`, `Card`, `Table`, etc.)
- **Properties** highlighting (`id`, `label`, `color`, `background`, `width`, `height`, etc.)
- **Colors** highlighting (hex colors `#RRGGBB` and named colors)
- **Numbers** and spacing tokens (`xs`, `sm`, `md`, `lg`, `xl`)
- **Comments** support (`//` and `/* */`)
- **Bracket matching** and auto-pairing

### 📋 Phase 2: Autocompletion (Upcoming)
- Context-aware completions for keywords, components, and properties
- Snippet suggestions for common patterns
- Type-safe property suggestions

### 💡 Phase 3: Hover Tooltips (Upcoming)
- Component documentation on hover
- Property descriptions and examples
- Keyboard shortcut reference

### 👁️ Phase 4: SVG Preview (Upcoming)
- Live preview of `.wire` files rendered as interactive SVG
- Light/dark theme support
- Auto-refresh on file save

## Installation

### From Marketplace (Coming Soon)
Search for "Wire DSL" in VS Code Extensions

### Local Development
```bash
cd packages/vscode-extension
npm install
npm run esbuild
# Open VS Code, press F5 to run extension in debug mode
```

## Usage

1. Open or create a `.wire` file
2. Syntax highlighting is automatically applied
3. Use Ctrl+Space (Cmd+Space on Mac) for autocomplete (Phase 2)
4. Hover over elements for documentation (Phase 3)
5. Open preview panel for SVG rendering (Phase 4)

## Example

Create a file named `dashboard.wire`:

```wire
project "My Dashboard" {
  screen Dashboard {
    grid {
      columns: 2
      gap: md
      
      Card {
        id: "card1"
        label: "Users"
      }
      
      Card {
        id: "card2"
        label: "Revenue"
      }
    }
  }
}
```

The Wire DSL extension will highlight:
- `project` as a declaration keyword
- `screen` and `Dashboard` appropriately
- `grid` as a layout control
- `Card` as a component type
- Properties like `id`, `label`, `columns`, `gap` in property color
- String values in string color
- Numbers and spacing tokens in numeric color

## Documentation

- [Wire DSL Syntax Guide](../../docs/dsl-syntax.md)
- [Component Reference](../../docs/COMPONENTS_REFERENCE.md)
- [Layout Engine](../../specs/layout-engine.md)

## Contributing

This extension is part of the Wire DSL monorepo. For development:

```bash
# In monorepo root
pnpm install
pnpm -C packages/vscode-extension run esbuild-watch

# VS Code: Press F5 to launch extension in debug mode
```

## License

MIT - See LICENSE file in root directory
