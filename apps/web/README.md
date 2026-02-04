# @wire-dsl/web

Live editor and renderer for Wire-DSL. Create and preview interactive wireframes in real-time with a modern web-based interface.

## Installation

```bash
npm install @wire-dsl/web
```

## Features

- 🎨 **Live Editor** - Real-time syntax highlighting and validation
- 👁️ **Live Preview** - Instant preview of wireframe changes
- 💾 **Auto-save** - Automatic state persistence
- 📱 **Responsive** - Works on desktop and tablets
- ⚡ **Fast** - Powered by Vite for instant HMR
- 🎯 **Intuitive UI** - Monaco editor with Wire-DSL syntax support

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
3. **Export** your wireframe as HTML, JSON, or components
4. **Share** your designs with team members

## Editor Features

- **Syntax Highlighting** - Wire-DSL language support
- **Error Messages** - Real-time validation feedback
- **Code Completion** - Smart suggestions and snippets
- **Theme Support** - Light and dark modes
- **Export Options** - HTML, JSON, React components

## Technology Stack

- **React 19** - Modern UI framework
- **Vite 7** - Fast build tool
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
