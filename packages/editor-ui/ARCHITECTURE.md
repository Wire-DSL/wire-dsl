# `@wire-dsl/editor-ui` Architecture

## Overview

```
@wire-dsl/editor-ui/
├── src/
│   ├── components/       → React UI components
│   ├── hooks/            → Reusable React hooks
│   ├── types/            → TypeScript type definitions
│   ├── utils/            → Pure utility functions
│   └── index.ts          → Barrel export
├── OSS-SAFETY-POLICY.md  → Governance for OSS-first design
├── README.md             → Quick start guide
└── package.json          → Dependencies (minimal, OSS-safe)
```

## Layers

### Layer 1: Types (`src/types/`)

**Responsibility**: Define interfaces and enums that other layers use.

**Constraints**:
- Pure types, no implementations
- Generic, product-agnostic
- No cloud/auth-specific fields
- Fully backward compatible

**Examples**:
- `DiagnosticItem` - error structure
- `RenderState` - enum for rendering progress
- `EditorConfig` - editor settings interface

### Layer 2: Utils (`src/utils/`)

**Responsibility**: Pure utility functions with no side effects.

**Constraints**:
- No React dependencies
- No external API calls
- No state management
- Deterministic (same input = same output)

**Examples**:
- `formatDiagnosticMessage()` - string formatting
- `extractLocationFromError()` - error parsing
- `createDebounce()` - functional utility factory

### Layer 3: Hooks (`src/hooks/`)

**Responsibility**: React hooks for common editor patterns.

**Constraints**:
- Use `useEffect`, `useState`, `useCallback` only
- No context providers
- No cloud integration
- Minimal dependencies (use utils layer)

**Examples**:
- `useWireParser()` - wraps core parser with debounce
- `useLocalStorage()` - browser storage only
- `useDebounce()` - generic value debouncing

### Layer 4: Components (`src/components/`)

**Responsibility**: React components for editor UI.

**Constraints**:
- Consume hooks (layer 3) and types (layer 1)
- Accept props for all behavior
- No default API calls
- Render-only, minimal logic
- Forwardable refs for parent control

**Examples**:
- `EditorPanel` - code editor container
- `PreviewPanel` - SVG preview display
- `SplitView` - resizable layout
- `DiagnosticsDrawer` - error panel

---

## Data Flow

### Editor Workflow (in Wire Live)

```
User Types → Editor Component
           ↓
       Monaco Editor (in web/App.tsx)
           ↓
       onChange callback → AppState
           ↓
       Pass new code to useWireParser hook
           ↓
       useWireParser: debounce → parse → formatDiagnostics
           ↓
       SVGRenderResult + DiagnosticItem[] → PreviewPanel
           ↓
       Render SVG + show errors
```

### State Location

| State | Location | Why |
|-------|----------|-----|
| Code content | App (web) | App-level, persisted via IndexedDB |
| Render result | App (web) | App-level, derived from code |
| Editor zoom | App (web) | UI concern, but app-managed |
| Drawer open/closed | App (web) | UI state, app-level |
| DiagnosticItem[] | Hook return | Derived from code |

**editor-ui never holds state** except component internals (e.g., zoom level in PreviewPanel).

---

## Dependency Graph

```
index.ts (barrel export)
├── components/index.ts
│   ├── EditorPanel.tsx ─→ types/
│   ├── PreviewPanel.tsx ─→ types/, lucide-react
│   ├── DiagnosticsDrawer.tsx ─→ types/, utils/, lucide-react
│   └── SplitView.tsx ─→ types/
├── hooks/index.ts
│   ├── useWireParser.ts ─→ types/, @wire-dsl/core
│   ├── useDebounce.ts ─→ types/
│   ├── useLocalStorage.ts ─→ types/
│   ├── useFocusWithin.ts ─→ (no deps)
│   └── useZoom.ts ─→ types/
├── types/index.ts
│   └── (no internal deps)
└── utils/index.ts
    └── (no internal deps)
```

### External Dependencies

```
@wire-dsl/editor-ui
├── Peer Dependencies
│   ├── react ≥18
│   └── react-dom ≥18
├── Runtime Dependencies
│   ├── @wire-dsl/core (for parsing)
│   ├── zustand (for future state if needed)
│   └── lucide-react (for icons)
└── Dev Dependencies
    ├── typescript
    ├── eslint
    └── @types/react
```

**No proprietary/private dependencies** - everything is public OSS.

---

## Component Props Design

### Principle: Props are "Questions to Parent"

Components ask parents for answers via props, not dictate behavior.

### EditorPanel Pattern

```tsx
export interface EditorPanelProps {
  // Data from parent
  file: FileInfo;

  // Callbacks (parent decides what to do)
  onChange: (content: string) => void;
  onReady?: (editor: any) => void;

  // Config (no cloud features)
  config?: Partial<EditorConfig>;

  // Optional styling
  className?: string;
}
```

This allows parent to:
- Persist to cloud (if it wants)
- Sync with collaborators (if it wants)
- Undo/redo (if it wants)
- etc.

Component doesn't know or care.

---

## Testing Strategy

Each layer is tested independently:

### Types
- ✓ TypeScript compilation

### Utils
- ✓ Unit tests with vitest
- ✓ No React required
- ✓ Pure function tests

### Hooks
- ✓ Component tests with React Testing Library
- ✓ No context providers (test in isolation)
- ✓ Mock core parser if needed

### Components
- ✓ Snapshot tests
- ✓ Interaction tests
- ✓ Accessibility tests
- ✓ No actual file I/O (stub everything)

---

## Extension Points

Applications extend `editor-ui` via composition, not by modifying components.

---

## Maintenance Guidelines

### When Adding Features

1. **Determine the layer**:
   - New type? → `types/`
   - Pure function? → `utils/`
   - React hook? → `hooks/`
   - UI component? → `components/`

2. **Check OSS-safety**:
   - ✓ No cloud/auth logic
   - ✓ Composable without context
   - ✓ Documented with examples

3. **Test in isolation**:
   - ✓ Unit tests for utils
   - ✓ Hook tests without providers
   - ✓ Component tests without app

4. **Update docs**:
   - ✓ JSDoc comments
   - ✓ README if public API change
   - ✓ Update this ARCHITECTURE.md if structure changes

### When Removing Features

1. **Check dependents**:
   - Does wire-dsl/web use it?
   - Could future products use it?

2. **Deprecate first**:
   - Add `@deprecated` JSDoc
   - Wait one minor version
   - Then remove

3. **Document breaking changes**:
  - Provide a migration guide

---

## Performance Considerations

### Debouncing

The `useWireParser` hook debounces by 300ms:
- Prevents parse on every keystroke
- Allows user to type smoothly
- Reduces CPU usage on large files

```tsx
// In hooks/index.ts
parseTimeoutRef.current = setTimeout(async () => {
  // Parse runs ~300ms after user stops typing
}, 300);
```

### Component Re-renders

Components accept `className` for styling to avoid re-renders via style prop changes.

```tsx
// ✅ Good - className passed once, no re-render
<PreviewPanel className="flex-1" />

// ❌ Bad - style prop recreated each render
<PreviewPanel style={{ flex: 1 }} />
```

### Icon Library

Uses `lucide-react` (tree-shakeable, lightweight):
```tsx
import { ZoomIn, ZoomOut } from 'lucide-react';
```

Only imported icons are bundled.

---

## Future Enhancements

### Planned (not in the initial release)

- [ ] Theme provider for dark/light mode
- [ ] Keyboard shortcuts manager
- [ ] Undo/redo stack (framework, not history)
- [ ] Multi-file tab interface
- [ ] Search and replace UI

### Not Planned (application-level)

- [ ] Cloud sync
- [ ] Real-time collaboration
- [ ] AI suggestions
- [ ] User preferences storage
- [ ] Workspace management

---
