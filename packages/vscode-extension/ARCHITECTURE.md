# Wire DSL VS Code Extension - Architecture

## Overview

The Wire DSL VS Code Extension is a modular extension built in phases, starting with syntax highlighting (Phase 1) and progressively adding autocompletion, hover tooltips, and SVG preview capabilities.

## Project Structure

```
packages/vscode-extension/
├── src/
│   ├── extension.ts           # Entry point - activation and provider registration
│   ├── completionProvider.ts  # Phase 2: Autocompletion (planned)
│   ├── hoverProvider.ts       # Phase 3: Hover tooltips (planned)
│   ├── webviewProvider.ts     # Phase 4: SVG preview (planned)
│   └── data/
│       ├── components.ts      # Phase 2: Component metadata
│       └── documentation.ts   # Phase 3: Hover documentation
│
├── syntaxes/
│   └── wire.tmLanguage.json   # TextMate grammar - syntax highlighting rules
│
├── language-configuration.json # Bracket pairing, comment styles, indentation
├── package.json               # Extension manifest & VS Code contribution points
├── tsconfig.json              # TypeScript configuration
│
├── .vscode/
│   ├── launch.json            # Debug configuration for F5 testing
│   └── tasks.json             # Build tasks (esbuild)
│
├── icons/
│   ├── wire-light.svg         # Light theme icon
│   └── wire-dark.svg          # Dark theme icon
│
├── out/                       # Compiled JavaScript (auto-generated)
├── node_modules/              # Dependencies (auto-generated)
│
├── test-syntax.wire           # Test file for syntax highlighting verification
├── README.md                  # User documentation
├── TESTING.md                 # Testing guide
├── CHANGELOG.md               # Version history
└── .gitignore                 # Git ignore rules
```

## Component Breakdown

### 1. **extension.ts** (Entry Point)

The activation function is called when VS Code detects a `.wire` file.

```typescript
export function activate(context: vscode.ExtensionContext) {
  // Phase 1: TextMate grammar handles syntax highlighting automatically
  // Phase 2: Register CompletionItemProvider
  // Phase 3: Register HoverProvider
  // Phase 4: Register WebviewViewProvider
  
  context.subscriptions.push(...providers);
}
```

**Key responsibilities:**
- Initialize extension when `.wire` file is opened
- Register all language providers
- Manage lifecycle and cleanup

### 2. **wire.tmLanguage.json** (Syntax Highlighting)

TextMate grammar that tokenizes Wire DSL syntax using regex patterns.

**Structure:**
```json
{
  "scopeName": "source.wire",
  "patterns": [
    { "include": "#comments" },
    { "include": "#keywords" },
    { "include": "#components" },
    { "include": "#properties" },
    { "include": "#strings" },
    { "include": "#colors" },
    { "include": "#numbers" }
  ],
  "repository": {
    "keywords": { ... },
    "components": { ... },
    "properties": { ... }
  }
}
```

**Scope Hierarchy:**
- `source.wire` - Root scope for all Wire files
- `keyword.declaration.wire` - Keywords like `project`, `screen`
- `keyword.control.wire` - Layout keywords like `grid`, `stack`
- `entity.name.class.wire` - Component names like `Button`, `Card`
- `variable.other.property.wire` - Properties like `id`, `label`
- `string.quoted.double.wire` - String literals
- `constant.color.hex.wire` - Hex colors (#RRGGBB)
- `constant.numeric.wire` - Numbers
- `comment.line.double-slash.wire` - Comments

### 3. **language-configuration.json**

Defines language behaviors beyond syntax highlighting:
- Comment styles (`//` and `/* */`)
- Bracket pairs and auto-closing
- Indentation rules (increase after `{`, decrease before `}`)
- Code folding regions

### 4. **package.json** (VS Code Manifest)

Defines:

**Metadata:**
```json
{
  "name": "wire-dsl",
  "displayName": "Wire DSL",
  "version": "0.1.0",
  "engines": { "vscode": "^1.75.0" }
}
```

**Activation:**
```json
{
  "activationEvents": ["onLanguage:wire"]
}
```
- Extension activates when `.wire` file is opened (lazy loading for performance)

**Contributions:**
```json
{
  "contributes": {
    "languages": [{
      "id": "wire",
      "extensions": [".wire"],
      "configuration": "./language-configuration.json"
    }],
    "grammars": [{
      "language": "wire",
      "scopeName": "source.wire",
      "path": "./syntaxes/wire.tmLanguage.json"
    }]
  }
}
```

### 5. **completionProvider.ts** (Phase 2 - Planned)

Will implement `vscode.CompletionItemProvider` for context-aware code completion:

```typescript
class WireCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document, position, token, context
  ): CompletionItem[] {
    // Detect context (inside screen? inside form? etc.)
    // Return appropriate completions
    // - Keywords: project, screen, grid, stack, etc.
    // - Components: Button, Input, Card, etc.
    // - Properties: id, label, color, gap, padding, etc.
    // - Values: spacing tokens (xs, sm, md, lg, xl), colors
  }
}
```

**Data structure from Phase 2:**

```typescript
// data/components.ts
export const COMPONENTS = {
  Button: {
    description: 'Interactive button element',
    properties: ['id', 'label', 'onClick', 'disabled', 'variant', 'size'],
    example: 'Button { label: "Click me" }'
  },
  // ... 40+ components
};
```

### 6. **hoverProvider.ts** (Phase 3 - Planned)

Will implement `vscode.HoverProvider` to show documentation on hover:

```typescript
class WireHoverProvider implements vscode.HoverProvider {
  provideHover(document, position, token): Hover {
    // Get word at position
    // Look up in component/keyword documentation
    // Return Hover with MarkdownString
  }
}
```

**Documentation data:**
```typescript
// data/documentation.ts
export const DOCUMENTATION = {
  Button: {
    description: 'A clickable button component',
    properties: {
      label: 'Text displayed on the button',
      onClick: 'Handler function for clicks'
    },
    examples: [
      'Button { label: "Submit" }',
      'Button { label: "Cancel", variant: "secondary" }'
    ]
  }
};
```

### 7. **webviewProvider.ts** (Phase 4 - Planned)

Will implement `vscode.WebviewViewProvider` for SVG preview:

```typescript
class WirePreviewProvider implements vscode.WebviewViewProvider {
  resolveWebviewView(webviewView): void {
    // Parse current .wire file using @wire-dsl/core
    // Render to SVG using SVGRenderer
    // Display in webview
    // Watch for file changes and refresh
  }
}
```

## Data Flow

### Phase 1: Syntax Highlighting

```
.wire file opened
        ↓
VS Code detects file extension (.wire)
        ↓
Activates extension (onLanguage:wire)
        ↓
Loads wire.tmLanguage.json
        ↓
TextMate tokenizer processes file
        ↓
Scopes matched to VS Code theme colors
        ↓
Syntax highlighting displayed ✓
```

### Phase 2: Autocompletion (Future)

```
User types in .wire file
        ↓
CompletionProvider.provideCompletionItems() called
        ↓
Analyze context (position in file)
        ↓
Query component/keyword metadata
        ↓
Generate CompletionItem objects
        ↓
VS Code displays IntelliSense popup
        ↓
User selects completion, insertText inserted ✓
```

### Phase 3: Hover Tooltips (Future)

```
User hovers mouse over element
        ↓
HoverProvider.provideHover() called
        ↓
Get word at cursor position
        ↓
Look up in documentation map
        ↓
Return Hover with MarkdownString
        ↓
VS Code displays tooltip ✓
```

### Phase 4: SVG Preview (Future)

```
User opens preview panel (Cmd)
        ↓
WebviewViewProvider.resolveWebviewView() called
        ↓
Read current .wire file content
        ↓
Parse with @wire-dsl/core parser
        ↓
Generate IR (Intermediate Representation)
        ↓
Calculate layout with layout engine
        ↓
Render SVG with SVGRenderer
        ↓
Send SVG to webview
        ↓
Webview displays interactive preview ✓
```

## Integration Points

### With VS Code API

- **vscode.languages**: Register providers for language features
- **vscode.window**: Show UI elements (notifications, input boxes)
- **vscode.workspace**: Monitor file changes
- **vscode.ExtensionContext**: Manage subscriptions and cleanup
- **vscode.commands**: Register custom commands
- **TextMate Grammar**: Built-in tokenization without code

### With Wire DSL Core

**Current (Phase 1):** No dependency on core

**Future (Phase 4):**
```typescript
import { parse } from '@wire-dsl/core';
import { SVGRenderer } from '@wire-dsl/core';

const ast = parse(fileContent);
const svg = new SVGRenderer().render(ast);
```

## Performance Considerations

1. **Lazy Loading**: Extension only activates when `.wire` file is opened
2. **TextMate Grammar**: Efficient tokenization (built into VS Code)
3. **Incremental Parsing**: Phase 2-3 should cache parse results
4. **Webview**: Phase 4 should debounce rendering (re-render on save, not on keystroke)

## Testing Strategy

1. **Syntax Highlighting**: Visual inspection of colors in test file
2. **Autocompletion**: Test context detection with various code positions
3. **Hover**: Test documentation lookup for edge cases
4. **Preview**: Compare SVG output with expected layout

## Future Extensions

- Error diagnostics via Language Server Protocol (LSP)
- Code formatter (`npm run format`)
- Snippets for common patterns
- Custom theme support
- Export to other formats (React, HTML, etc.)

## Deployment

### For Local Testing
```bash
npm run esbuild
# Press F5 in VS Code to debug
```

### For Distribution
```bash
npm run vscode:prepublish  # Minified build
vsce package              # Create .vsix file
vsce publish              # Publish to marketplace
```

## Key Technologies

- **VS Code Extension API** 1.75.0+
- **TypeScript** 5.9+
- **TextMate Grammar** (JSON format)
- **esbuild** (Bundler)
- **Wire DSL Core** @wire-dsl/core (Phase 4+)
