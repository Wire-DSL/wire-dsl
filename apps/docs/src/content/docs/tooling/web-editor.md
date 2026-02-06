---
title: Web Editor
description: Wire-DSL live web editor documentation
---

The Wire-DSL Web Editor is a browser-based, real-time interactive environment for building and previewing wireframes instantly.

## Quick Access

Visit **[https://live.wire-dsl.org](https://live.wire-dsl.org)** to start coding immediately. No installation required.

## Editor Features

### Code Editor (Left Panel)

- **Syntax Highlighting** – Wire-DSL syntax with color coding
- **Monaco Editor** – Familiar VS Code-like experience
- **Real-time Validation** – Errors appear as you type
- **Line Numbers** – Easy navigation within files
- **Auto-indentation** – Automatic code formatting

**Keyboard Shortcuts**:
- `Ctrl+S` – Save file
- `Ctrl+/` – Toggle comment
- `Ctrl+Z` – Undo
- `Ctrl+Shift+Z` – Redo
- `Tab` – Indent
- `Shift+Tab` – Dedent

### Live Preview (Right Panel)

- **Real-time Rendering** – Updates instantly as you type
- **Multiple Screens** – Navigate between screens with dropdown selector
- **Responsive Preview** – View at different viewport sizes ⏱️
- **Zoom Controls** – Zoom in/out to inspect details
- **Error Display** – Visual error indicators in preview area

## Workflow

### 1. Start a New Project

**Option A: From Scratch**
- Open the editor
- Clear default code
- Start typing your Wire-DSL code

**Option B: Use a Template**
- Click "Examples" in toolbar
- Select a example (form, dashboard, etc.)
- Customize as needed

### 2. Write Code

<!-- wire-preview:start -->
```wire
project "My Wireframe" {
  theme {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Dashboard {
    layout stack(direction: vertical, gap: lg, padding: lg) {
      component Heading text: "Dashboard"
      component Text content: "Welcome to your dashboard"
      
      layout grid(columns: 12, gap: md) {
        cell span: 6 {
          component StatCard title: "Users" value: "1,234"
        }
        cell span: 6 {
          component StatCard title: "Revenue" value: "$12.5K"
        }
      }
    }
  }
}
```
<!-- wire-preview:end -->

### 3. View Live Preview

- The preview updates automatically as you type
- If there are errors, they appear in the preview area with details
- Use the screens dropdown to navigate between multiple screens

### 4. Adjust Theme & Layout

**Change Theme**:
```wire
theme {
  density: "comfortable"     // Options: compact, normal, comfortable
  spacing: "lg"              // Options: xs, sm, md, lg, xl
  radius: "lg"               // Options: none, sm, md, lg
  stroke: "thin"             // Options: thin, normal
  font: "base"               // Options: base, title, mono
}
```

**Adjust Responsive Behavior**:
- Use Grid for responsive multi-column layouts
- Use Stack for flexible vertical/horizontal layouts
- Resize browser to test responsiveness

### 5. Export

**Download Options**:
- **SVG** – Scalable vector format (recommended)
- **PNG** – Raster image with transparent background ⏱️
- **JSON** – Raw IR data for processing ⏱️

**Click "Download" in toolbar**:
```
[Export SVG ▼] → SVG file
```

## Browser Support

- Chrome/Edge 90+ (recommended)
- Firefox 88+
- Safari 14+

## Examples & Templates

### Built-in Examples

The toolbar includes example wireframes:
- Simple Dashboard
- Login Form
- Admin Interface
- Product Listing
- User Profile
- Multi-screen Project

### Load from Examples

```wire
// Copy any example from the Examples menu
// Paste into editor
// Customize as needed
```

## Tips & Tricks

### Working with Multiple Screens

Create complex projects with multiple screens:

```wire
project "Multi-Screen App" {
  theme { ... }
  
  screen LoginScreen {
    layout card { ... }
  }
  
  screen DashboardScreen {
    layout split { ... }
  }
  
  screen SettingsScreen {
    layout stack { ... }
  }
}
```

Use the screens dropdown to navigate between them.

### Testing Different Themes

Quickly test design variations:

```wire
// Test with different density levels
theme { density: "compact" }   // Tight layout
theme { density: "normal" }    // Balanced (default)
theme { density: "comfortable" }  // Spacious
```

Just change and watch the preview update.

### Creating Component Compositions

Define reusable components:

<!-- wire-preview:start -->
```wire
project "Component Composition" {
	define Component "UserCard" {
		layout card(padding: md, gap: sm) {
			component Image image: "user.png"
			component Heading text: "User Name"
			component Text content: "user@example.com"
		}
	}

	screen Users {
		layout grid(columns: 12, gap: md) {
			cell span: 4 { component UserCard }
			cell span: 4 { component UserCard }
			cell span: 4 { component UserCard }
		}
	}
}
```
<!-- wire-preview:end -->

### Using Comments

Organize complex wireframes:

```wire
// Main header section
layout stack(direction: horizontal) {
  component Topbar { ... }
}

/* 
   Sidebar section - contains:
   - Navigation menu
   - Quick links
   - User profile
*/
layout split {
  layout stack { ... }
  layout stack { ... }
}
```

## Common Tasks

### Convert to PNG for Presentations

1. Design your wireframe
2. Click "Export SVG"
3. Convert SVG to PNG using:
   - Online converter
   - Command line: `convert wireframe.svg wireframe.png`
   - Design software (Figma, Illustrator, etc.)

### Share Wireframes

**Option 1: Export & Send**
- Download SVG
- Email or upload to cloud storage
- Team member imports and modifies

**Option 2: Browser Link (future)**
- Save wire file
- Share with team

**Option 3: Version Control**
- Save wire file
- Commit to Git
- Track changes with diffs

### Batch Rendering

To render multiple `.wire` files:

1. Use the [CLI tool](./cli.md) for batch rendering
2. Or manually export each in the web editor
3. Or programmatically use the [@wire-dsl/engine](../architecture/overview.md) library

### Import SVG into Design Tools

**For Figma**:
- Download SVG
- In Figma: File → Import
- Select the SVG
- Refine in Figma as needed

**For Adobe XD**:
- Download SVG
- File → Open
- Fine-tune in XD

**For Sketch**:
- Download SVG
- Insert → Image → SVG
- Edit as needed

## Error Handling

### Common Errors

**Unknown component**:
```
Error: Unknown component "BadComponent"
```
Solution: Check [Components Reference](../language/components.md) for valid names.

**Missing property**:
```
Error: Button requires property "text"
```
Solution: Add all required properties. Check [Components Reference](../language/components.md) for requirements.

**Invalid theme value**:
```
Error: density must be "compact", "normal", or "comfortable"
```
Solution: Use only valid theme values.

**Mismatched brackets**:
```
Error: Expected "}" but found EOF
```
Solution: Count opening and closing braces `{` `}`.

### Debug Tips

- Use clear names for screens and components
- Add comments to mark sections
- Break complex layouts into smaller components
- Test incrementally (add small pieces at a time)
- Check the error message and line number
- Validate first with [CLI](./cli.md) if needed

## Performance

### Rendering Speed

- Simple wireframes (<50 components): < 50ms
- Medium wireframes (50-200 components): < 200ms
- Large wireframes (200-1000 components): < 1s
- Very large wireframes (1000+ components): < 5s

### Optimization Tips

1. **Avoid deep nesting** – Limit to 3-4 levels deep
2. **Use Grid instead of Stack** – For responsive multi-column layouts
3. **Reuse components** – Define once, use many times with `component YourCustomComponent`
4. **Keep files focused** – One major feature per file
5. **Use consistent theme** – Define once at project level

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save File |
| `Ctrl+/` | Toggle Comment |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Alt+Shift+F` | Format |
| `Ctrl+H` | Find/Replace |
| `Ctrl+G` | Go to Line |
| `Ctrl+K Ctrl+0` | Fold All |
| `Ctrl+K Ctrl+J` | Unfold All |

## Local Development

### Run Web Editor Locally

```bash
cd apps/web
pnpm install
pnpm dev
```

Opens at `http://localhost:5173`

### Build for Production

```bash
cd apps/web
pnpm build
pnpm preview
```

### File Structure

```
apps/web/
├── src/
│   ├── components/
│   │   ├── MonacoEditorComponent.tsx   # Code editor
│   │   ├── WireLiveEditor.tsx          # Main editor component
│   │   └── WireLiveHeader.tsx          # Toolbar
│   ├── hooks/
│   │   ├── useWireParser.ts            # Parser integration
│   │   ├── useCanvasZoom.ts            # Zoom functionality
│   │   └── useFileSystemAccess.ts      # File operations
│   ├── store/
│   │   └── editorStore.ts              # State management
│   ├── monaco/
│   │   └── wireLanguage.ts             # Syntax highlighting
│   └── App.tsx                          # Root component
├── public/examples/                     # Built-in examples
├── vite.config.ts                       # Build configuration
└── tailwind.config.js                   # Styling
```

### Technologies

- **React** – UI framework
- **Vite** – Build tool
- **Monaco Editor** – Code editor
- **Tailwind CSS** – Styling
- **@wire-dsl/engine** – Parser & renderer

## Troubleshooting

### Editor Not Loading

1. Clear browser cache: `Ctrl+Shift+Delete`
2. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Try a different browser
4. Check internet connection

### Preview Not Updating

1. Check browser console for errors: `F12` → Console tab
2. Verify syntax – look for red squiggles in editor
3. Refresh page: `F5`
4. Try a simple project to test

### Download Not Working

1. Check pop-up blocker settings
2. Verify you have disk space
3. Try a different export format
4. Use the CLI tool as alternative: `wire render file.wire -o output.svg`

### Browser Crashes

1. Try rendering a simpler wireframe
2. Restart browser
3. Check available RAM/disk space
4. Use CLI tool for very large files

## Integration with Other Tools

### With Git

```bash
# Export JSON IR for version control
# In web editor, download as JSON
# Commit to repository
git add wireframes/*.json
git commit -m "Update wireframes"
```

### With CI/CD

```yaml
# Validate in pipeline
- name: Validate Wire-DSL files
  run: |
    npx @wire-dsl/cli validate wireframes/*.wire
    npx @wire-dsl/cli render wireframes/*.wire -o output/
```

### With LLM Generation

```bash
# Generate wireframe code from natural language
# (Coming soon: integrated LLM prompting)
# Use LLM Prompting guide: docs/tooling/llm-prompting.md
```

## Next Steps

- [CLI Tool Reference](./cli.md) – For batch rendering
- [Getting Started](../getting-started/installation) – Complete setup guide
- [DSL Syntax](../language/syntax) – Language reference
- [Components Reference](../language/components) – All available components
- [LLM Prompting](./llm-prompting) – Generate from natural language

---

**Last Updated**: February 6, 2026  
**Status**: Production Ready  
**Live URL**: https://live.wire-dsl.org
