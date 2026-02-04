# OSS-Safety Policy for `@wire-dsl/editor-ui`

## 🎯 Core Principle

**`@wire-dsl/editor-ui` is an OSS-first component library.**

It provides the foundation for Wire Live and any downstream applications. To maintain OSS integrity, we enforce strict boundaries.

---

## ✅ What BELONGS in `editor-ui`

### Components
- ✅ `EditorPanel` - text input container
- ✅ `PreviewPanel` - SVG display with zoom/pan
- ✅ `DiagnosticsDrawer` - error/warning display
- ✅ `SplitView` - resizable layout

### Hooks
- ✅ `useWireParser()` - basic parsing wrapper around `@wire-dsl/core`
- ✅ `useDebounce()` - generic utility
- ✅ `useLocalStorage()` - browser-only persistence
- ✅ `useZoom()` - UI state management
- ✅ `useFocusWithin()` - focus tracking

### Types
- ✅ `DiagnosticItem` - error structure
- ✅ `EditorConfig` - editor settings
- ✅ `RenderState` - render progress
- ✅ `SVGRenderResult` - output wrapper
- ✅ `FileInfo` - file metadata

### Utils
- ✅ `createDebounce()` / `createThrottle()` - functional utilities
- ✅ `formatDiagnosticMessage()` - formatting helpers
- ✅ `extractLocationFromError()` - error parsing
- ✅ `calculateAspectRatio()` - SVG helpers
- ✅ Pure, side-effect-free utility functions

---

## ❌ What DOES NOT BELONG in `editor-ui`

### Cloud Features
- ❌ Authentication / Authorization
- ❌ Cloud sync / save to server
- ❌ Real-time collaboration
- ❌ WebSocket / server integration
- ❌ AI features / LLM calls
- ❌ API keys / credentials

### App-Level Logic
- ❌ Global app state beyond basic UI state
- ❌ File system access (use browser APIs in app)
- ❌ Router / navigation (app concern)
- ❌ Theme switching beyond light/dark
- ❌ Workspace management

### Proprietary Features
- ❌ Enterprise licensing
- ❌ Usage tracking / analytics
- ❌ DRM or copy protection
- ❌ Anything specific to a closed-source product

### Infrastructure
- ❌ Build optimization specific to a single product
- ❌ Private dependencies
- ❌ Proprietary fonts / icons

---

## 🔄 Design Pattern: Composition over Extension

### ✅ Correct: Application Wraps Components

```tsx
// apps/web/src/App.tsx
import { EditorPanel, PreviewPanel, SplitView } from '@wire-dsl/editor-ui';

export function App() {
  return (
    <SplitView
      primary={<EditorWithMonaco />}
      secondary={<PreviewPanel {...props} />}
    />
  );
}

### ❌ Wrong: Cloud Logic in editor-ui

```tsx
// ❌ DO NOT DO THIS
export interface EditorPanelProps {
  // This binds OSS to cloud features!
  onSave?: (content: string, apiKey: string) => Promise<void>;
  collaborationToken?: string;
  aiAssistant?: AIProvider;
}
```

---

## 📋 Pre-Commit Checklist

Before committing to `editor-ui`:

- [ ] **No cloud bindings** - no auth, sync, collaboration APIs
- [ ] **No private dependencies** - all deps are public OSS
- [ ] **Composable** - can be used without any context providers
- [ ] **Documented** - comments explain what it does, not what app to use
- [ ] **Tested** - works standalone without mocks/stubbing
- [ ] **Types are generic** - no product-specific fields
- [ ] **No proprietary features** - nothing locked behind licensing

### Example: Type Review

```tsx
// ✅ Good - Generic and extensible
export interface PreviewPanelProps {
  renderResult: SVGRenderResult | null;
  renderState: RenderState;
  onNavigate?: (line: number, column: number) => void;
}

// ❌ Bad - Cloud-specific
export interface PreviewPanelProps {
  renderResult: SVGRenderResult | null;
  renderState: RenderState;
  onShareWithCollaborators?: (url: string) => void;
  aiSuggestions?: AIFeedback[];
}
```

---

## 🚀 Extensibility

Applications extend editor-ui via **context + composition**, not code changes.

---

## 📚 Governance

### Questions to Ask

When proposing a feature for `editor-ui`, ask:

1. **Can Wire Live use this?** If no → it doesn't belong
2. **Does it depend on cloud/auth?** If yes → it doesn't belong
3. **Can an application extend it via composition?** If no → redesign
4. **Is it tested independently?** If no → make it testable
5. **Are types product-agnostic?** If no → make them generic

### Code Review

Reviewers check:

- ✓ No cloud/auth/sync imports
- ✓ No proprietary dependencies
- ✓ Testable without context providers
- ✓ Works in Wire Live without modification
- ✓ Generic props/types
- ✓ Good OSS documentation

---

## 🔗 Related Files

- [README.md](./README.md) - Quick start and overview
- [src/types/index.ts](./src/types/index.ts) - Type definitions with OSS comments
- [src/hooks/index.ts](./src/hooks/index.ts) - Hooks with OSS-safe implementation
- [../../.ai/AI-INSTRUCTIONS-MAIN.md](../../.ai/AI-INSTRUCTIONS-MAIN.md) - Development guidelines

---
