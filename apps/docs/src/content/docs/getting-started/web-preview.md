---
title: Using the Web Editor
description: Get the most out of the Wire-DSL web editor
---

## The Web Editor

The Wire-DSL web editor is a live, interactive environment for building and previewing wireframes in real-time.

## Starting the Editor

### Online (No Installation)

Visit **[https://live.wire-dsl.org](https://live.wire-dsl.org)** to start editing immediately in your browser.

### Local Development

To run the editor locally with your own files:

```bash
cd apps/web
pnpm dev
```

Open **http://localhost:3000** in your browser.

## Editor Layout

The web editor has three main sections:

```
┌─────────────────────────────────────────┐
│          Wire-DSL Editor                │
├──────────────────┬──────────────────────┤
│                  │                      │
│  Code Editor     │   Live Preview       │
│  (Left Panel)    │   (Right Panel)      │
│                  │                      │
│  • Syntax        │   • Real-time        │
│    highlighting  │     rendering        │
│  • Monaco        │   • Responsive       │
│    Editor        │     design           │
│  • Errors &      │   • SVG output       │
│    warnings      │                      │
│                  │                      │
└──────────────────┴──────────────────────┘
```

## Code Editor (Left Panel)

### Features

- **Syntax Highlighting**: Wire-DSL syntax is color-coded
- **Auto-completion**: Type hints for keywords and components
- **Error Messages**: Real-time validation with line numbers
- **Monaco Editor**: Familiar VS Code-like experience

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save current code |
| `Ctrl+/` | Toggle comment |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Alt+Shift+F` | Format code |

## Live Preview (Right Panel)

### Features

- **Real-time Updates**: Preview updates as you type
- **Interactive**: Hover over components to see details
- **Responsive**: Test different viewport sizes
- **Zoom Controls**: Zoom in/out to inspect details
- **Export**: Download as SVG or PNG

## Workflow

### 1. Start with a Template

The editor includes starter templates. Choose one or start blank.

### 2. Edit Code

Modify the code in the left panel. The preview updates automatically.

### 3. See Errors

If there are syntax errors, they appear in red with helpful messages.

### 4. Refine Design

Adjust spacing, components, and layout based on the preview.

### 5. Export

Download the final wireframe in SVG or PNG format.

## Debugging Errors

### Common Errors

**Missing or incomplete theme block** (optional but recommended):
```
Warning: theme block recommended for consistent styling
```
Solution: Add a theme block to define design tokens. If omitted, defaults are applied.

**Invalid component name**:
```
Error: Unknown component "BadComponent"
```
Solution: Check the [Components Reference](../language/components.md) for valid component names.

**Mismatched brackets**:
```
Error: Expected "}" but found "{" on line 42
```
Solution: Count opening and closing braces.

### Error Panel

When there are errors, the preview panel shows:
- Error message
- Line number
- Suggestion for fixing

## Tips & Tricks

### Quickly Test Layouts

<!-- wire-preview:start -->
```wire
project "Layout Tests" {
  theme {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }
  
  screen StackExample {
    layout stack(direction: vertical, gap: md) {
      component Heading text: "Vertical Stack"
      component Text content: "Items stack top-to-bottom"
    }
  }
  
  screen GridExample {
    layout grid(columns: 12, gap: md) {
      cell span: 6 { component Text content: "Left" }
      cell span: 6 { component Text content: "Right" }
    }
  }
}
```
<!-- wire-preview:end -->

### Preview Multiple Screens

If your wireframe has multiple screens, they all render in the preview. Use the screen selector to navigate between them.

### Use Comments

Add comments to organize your code:

```wire
// Main dashboard
screen Dashboard { ... }

/* Multi-line comment
   for detailed explanations */
screen UserDetail { ... }
```

### Copy Working Examples

The [examples/](../../examples) folder has complete working wireframes. Copy them into the editor and modify them to suit your needs.

## Keyboard Navigation

| Shortcut | Action |
|----------|--------|
| `Tab` | Indent code |
| `Shift+Tab` | Decrease indent |
| `Ctrl+H` | Find and replace |
| `Ctrl+G` | Go to line |
| `Ctrl+K Ctrl+0` | Fold all regions |
| `Ctrl+K Ctrl+J` | Unfold all regions |

## Integration with Version Control

Export your wireframes and commit them to git:

1. **Download SVG**: Click "Export" and select SVG
2. **Commit to git**: `git add wireframes/ && git commit -m "Add wireframes"`
3. **Track changes**: Version control system shows all modifications

## Limitations

- The editor is read-only in terms of design; you create wireframes with code
- Real-time preview is limited to standard screen sizes
- Very large wireframes (100+ components) may slow down preview

## Next Steps

- [Learn the DSL Syntax](../language/syntax.md)
- [Explore All Components](../language/components.md)
- [Check Example Wireframes](../examples/index.md)

Happy wireframing!
