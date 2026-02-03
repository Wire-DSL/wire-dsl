# Quick Reference - `@wire-dsl/editor-ui`

## 🚀 Import Everything

```tsx
import {
  // Components
  EditorPanel,
  PreviewPanel,
  DiagnosticsDrawer,
  SplitView,
  
  // Hooks
  useWireParser,
  useDebounce,
  useLocalStorage,
  useFocusWithin,
  useZoom,
  
  // Types
  DiagnosticItem,
  DiagnosticSeverity,
  RenderState,
  SVGRenderResult,
  EditorConfig,
  FileInfo,
  
  // Utils
  formatDiagnosticMessage,
  extractLocationFromError,
  createDebounce,
  createThrottle,
} from '@wire-dsl/editor-ui';
```

## 🧩 Basic Usage

### Split View + Editor + Preview

```tsx
import { SplitView, EditorPanel, PreviewPanel } from '@wire-dsl/editor-ui';
import { useState } from 'react';

export function App() {
  const [code, setCode] = useState('');
  
  return (
    <SplitView
      primary={
        <EditorPanel
          file={{ name: 'app.wire', content: code, ... }}
          onChange={setCode}
        />
      }
      secondary={
        <PreviewPanel renderResult={null} renderState="idle" />
      }
    />
  );
}
```

### With Parsing

```tsx
import { useWireParser, PreviewPanel } from '@wire-dsl/editor-ui';

export function Preview({ code }) {
  const { renderResult, renderState, diagnostics } = useWireParser(code);
  
  return <PreviewPanel {...} />;
}
```

### With Diagnostics

```tsx
import { DiagnosticsDrawer } from '@wire-dsl/editor-ui';

export function Editor({ diagnostics }) {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <DiagnosticsDrawer
      diagnostics={diagnostics}
      isOpen={isOpen}
      onToggle={setIsOpen}
      onNavigateTo={(line, col) => {
        editor.setPosition({ lineNumber: line, column: col });
      }}
    />
  );
}
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Overview, quick start |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical deep dive |
| [OSS-SAFETY-POLICY.md](./OSS-SAFETY-POLICY.md) | What belongs here |

## 🛠️ Development

```bash
# Type check
pnpm type-check

# Lint
pnpm lint
pnpm lint:fix

# Build
pnpm build
```

## 🔒 Remember

**This is OSS-first.** No cloud features, no auth, no sync.

Cloud features go in the **application layer**, not here.

See [OSS-SAFETY-POLICY.md](./OSS-SAFETY-POLICY.md) for checklist.

## 📝 Component Props Cheat Sheet

### EditorPanel
```tsx
<EditorPanel
  file={FileInfo}                          // Required
  onChange={(content: string) => void}     // Required
  config={Partial<EditorConfig>}           // Optional
  onReady={(editor: any) => void}          // Optional
  className={string}                       // Optional
/>
```

### PreviewPanel
```tsx
<PreviewPanel
  renderResult={SVGRenderResult | null}    // Required
  renderState={RenderState}                // Required
  className={string}                       // Optional
/>
```

### SplitView
```tsx
<SplitView
  primary={React.ReactNode}                // Required
  secondary={React.ReactNode}              // Required
  config={Partial<SplitLayoutConfig>}      // Optional
  onConfigChange={(config) => void}        // Optional
  className={string}                       // Optional
/>
```

### DiagnosticsDrawer
```tsx
<DiagnosticsDrawer
  diagnostics={DiagnosticItem[]}           // Required
  isOpen={boolean}                         // Required
  onToggle={(open: boolean) => void}       // Required
  onNavigateTo={(line?, col?) => void}     // Optional
  className={string}                       // Optional
/>
```

## 🎯 Type Hierarchy

```
DiagnosticItem
  ├─ id: string
  ├─ severity: DiagnosticSeverity (error | warning | information)
  ├─ message: string
  ├─ source?: string
  ├─ line?: number
  ├─ column?: number
  └─ timestamp: number

RenderState
  ├─ Idle          (no preview yet)
  ├─ Rendering     (currently parsing)
  ├─ Success       (rendered)
  └─ Error         (parse error)

SVGRenderResult
  ├─ svg: string          (SVG markup)
  ├─ width: number
  ├─ height: number
  ├─ diagnostics: DiagnosticItem[]
  └─ timestamp: number
```

## ⚙️ Hook Return Types

```tsx
useWireParser(code: string) → {
  renderState: RenderState
  renderResult: SVGRenderResult | null
  diagnostics: DiagnosticItem[]
  reparse: () => void
}

useDebounce<T>(value: T, delay: number) → T

useLocalStorage<T>(key: string, initial: T) → 
  [T, (value: T | (v: T) => T) => void]

useFocusWithin(ref: RefObject<HTMLElement>) → boolean

useZoom(initial: number) → {
  level: number
  zoom: (delta: number) => void
  reset: () => void
  setToLevel: (level: number) => void
}
```

---

**For detailed info:** See full docs in [ARCHITECTURE.md](./ARCHITECTURE.md)
