# wire-dsl/web

Live web editor for Wire-DSL. Create and preview interactive wireframes in real-time with a browser-based interface.

## Online Access

The web editor is available at **[https://live.wire-dsl.org](https://live.wire-dsl.org)** - no installation required.

## Features

- **Live Editor** - Real-time syntax highlighting and validation
- **Live Preview** - Instant preview of wireframe changes
- **Auto-save** - Automatic state persistence
- **Responsive** - Works on desktop and tablets
- **Fast** - Powered by Vite for instant HMR
- **Export Options** - Download as SVG, PNG, or JSON IR

## Getting Started

### Development

```bash
cd apps/web
npm install
npm run dev
```

The editor will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Usage

The Web editor is designed for interactive development of `.wire` files:

1. **Write** your wireframe definition in the editor (left panel)
2. **See** the live preview update instantly (right panel)
3. **Export** your wireframe as SVG, PNG, or JSON IR
4. **Share** your designs with team members

## Editor Features

- **Syntax Highlighting** - Wire-DSL language support
- **Error Messages** - Real-time validation feedback
- **Code Completion** - Smart suggestions and snippets
- **Theme Support** - Light and dark modes
- **Export Options** - SVG, PNG, JSON IR

## Technology Stack

- **React 18+** - Modern UI framework
- **Vite 5+** - Fast build tool
- **Monaco Editor** - Powerful code editor
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **TypeScript** - Type-safe development

## Documentation

- [DSL Syntax Guide](https://github.com/Wire-DSL/wire-dsl/blob/main/docs/DSL-SYNTAX.md)
- [Components Reference](https://github.com/Wire-DSL/wire-dsl/blob/main/docs/COMPONENTS-REFERENCE.md)
- [Theme Customization](https://github.com/Wire-DSL/wire-dsl/blob/main/docs/THEME-GUIDE.md)

## License

MIT
