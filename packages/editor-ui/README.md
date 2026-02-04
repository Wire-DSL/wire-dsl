# `@wire-dsl/editor-ui`

Reusable UI components and hooks for Wire DSL editors.

## 🎯 Philosophy

This package is **intentionally minimal and OSS-safe**:

- ✅ Generic editor, preview, and diagnostics components
- ✅ Reusable hooks for parsing, debouncing, and local storage
- ✅ No cloud-specific logic (auth, sync, collaboration)
- ✅ Extensible via composition (not inheritance)
- ✅ Pure TypeScript/React, zero opinion on features

**Cloud features (auth, sync, collaboration, AI) belong in application-level code**, not here.

## 📦 What's Inside

### Components

- **`EditorPanel`** - Container for Monaco Editor integration
- **`PreviewPanel`** - SVG preview with zoom/pan controls
- **`DiagnosticsDrawer`** - Error/warning display panel
- **`SplitView`** - Resizable split layout

### Hooks

- **`useWireParser()`** - Parse Wire DSL code with debounce
- **`useDebounce()`** - Generic debounce hook
- **`useLocalStorage()`** - Persistent local storage
- **`useFocusWithin()`** - Track focus state
- **`useZoom()`** - Manage zoom level

### Types

- `DiagnosticItem` - Error/warning structure
- `EditorConfig` - Editor settings
- `FileInfo` - File metadata
- `RenderState` - Render progress states
- `SVGRenderResult` - SVG output wrapper

### Utils

- `formatDiagnosticMessage()` - Format errors for display
- `extractLocationFromError()` - Parse error location
- `calculateAspectRatio()` - SVG dimension helpers
- `createDebounce()` / `createThrottle()` - Functional utilities
- And more...

## 🚀 Quick Start

```bash
# Install
pnpm add @wire-dsl/editor-ui

# In your React app
import { EditorPanel, PreviewPanel, SplitView } from '@wire-dsl/editor-ui';

const App = () => {
  const [code, setCode] = React.useState('');

  return (
    <SplitView
      primary={
        <EditorPanel
          file={{ name: 'app.wire', content: code, isDirty: false, lastModified: 0, language: 'wire' }}
          onChange={setCode}
        />
      }
      secondary={
        <PreviewPanel renderResult={null} renderState="idle" />
      }
    />
  );
};
```

## 🔒 Design Principles

### OSS-Safe
No cloud-specific bindings. Everything works standalone.

### Composable
Components are simple and combine via composition, not inheritance.

### Extensible via Composition
Product-specific features are added at the **application level**, not here:

```tsx
// ✅ Good: Application-level composition
<EditorProvider apiKey={apiKey} onSync={handleSync}>
  <EditorPanel {...props} />
</EditorProvider>

// ❌ Bad: Don't add cloud fields to editor-ui types
export interface EditorPanelProps {
  apiKey?: string; // ❌ Cloud feature - not here
}
```

### Minimal Dependencies
- `react` (peer)
- `@wire-dsl/core` (for parsing)
- `zustand` (state for future features)
- `lucide-react` (icons)

## 📖 Documentation

See [../../.ai/AI-INSTRUCTIONS-MAIN.md](../../.ai/AI-INSTRUCTIONS-MAIN.md) for development guidelines.

## 🔄 Integration

The `@wire-dsl/web` package uses `editor-ui`:

```tsx
// apps/web/src/App.tsx
import { EditorPanel, PreviewPanel } from '@wire-dsl/editor-ui';

export function App() {
  // Application adds:
  // - Monaco Editor integration (not in editor-ui)
  // - Persistence (application concern)
  // - File management UI
  // - Example templates
  return (
    <SplitView
      primary={<EditorWithMonaco />}
      secondary={<PreviewPanel />}
    />
  );
}
```

## 📋 Development

```bash
# Build
pnpm build

# Type check
pnpm type-check

# Lint
pnpm lint
pnpm lint:fix
```

## 📝 Contributing

Contributions welcome! Remember:

1. **Keep it OSS-safe** - no cloud features
2. **Minimal and composable** - prefer props over complexity
3. **Document extensibility** - show how applications can extend this
4. **Test thoroughly** - components must work independently

## 📄 License

MIT - Same as Wire DSL
