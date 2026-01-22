# Testing Wire DSL Extension - Phase 1: Syntax Highlighting

## Quick Start

### Option 1: Debug Mode (Recommended for Development)

1. Open this folder in VS Code:
   ```bash
   code packages/vscode-extension
   ```

2. Press `F5` or go to **Run → Start Debugging**
   - This will compile the extension and launch a new VS Code window with the extension loaded

3. In the debug window, open an example `.wire` file:
   - Navigate to `examples/simple-dashboard.wire` or any `.wire` file from the main repo

4. You should see syntax highlighting with colors for:
   - **Blue**: Keywords (`project`, `screen`, `stack`, etc.)
   - **Orange/Brown**: Component names (`Card`, `Button`, `Input`, etc.)
   - **Green**: String values
   - **Purple**: Hex colors (`#RRGGBB`)
   - **Cyan**: Numbers and spacing tokens (`12`, `md`, etc.)
   - **Gray**: Comments

### Option 2: Manual Testing from Extension Directory

```bash
cd packages/vscode-extension

# Install dependencies
npm install

# Compile extension
npm run esbuild

# (Optionally) Watch for changes during development
npm run esbuild-watch
```

Then from VS Code:
- Press Ctrl+Shift+P → "Extensions: Show Extension Commands" → "Wire DSL"
- Or load the folder: `code packages/vscode-extension` and press F5

## What to Verify

### ✅ Syntax Highlighting Works

Open `examples/simple-dashboard.wire` (or create a test file) and verify:

```wire
project "Dashboard" {
  screen MainScreen {
    grid {
      columns: 2
      gap: md
      
      Card {
        id: "card1"
        label: "Users"
        // This is a comment - should be gray
      }
      
      Button {
        label: "Click me"
        color: #3B82F6
      }
    }
  }
}
```

#### Expected Colors:
| Element | Color | Line |
|---------|-------|------|
| `project`, `screen`, `grid`, `Card`, `Button` | **Blue keyword** | 1, 2, 3, 7, 11 |
| `"Dashboard"`, `"Users"`, `"Click me"` | **Green string** | 1, 8, 12 |
| `columns`, `gap`, `id`, `label`, `color` | **Property color** | 4, 5, 7, 8, 13 |
| `2`, `md`, `#3B82F6` | **Number/color** | 4, 5, 13 |
| `// This is a comment` | **Gray comment** | 9 |

### ✅ Bracket Matching
- Click between `{` and `}` → opposite bracket should highlight
- Auto-close: type `{` → should auto-insert `}`
- Auto-pair: type `"` → should auto-insert closing `"`

### ✅ Indentation
- Cursor after `{` → press Enter → should auto-indent next line
- Cursor at start of `}` → should auto-dedent

### ✅ Language Recognition
- Open any `.wire` file → bottom right of VS Code should show "Wire DSL" as language
- If it doesn't, right-click in editor → "Select Language Mode" → choose "Wire DSL"

## Troubleshooting

### Extension doesn't activate
1. Check Debug Console (View → Debug Console) for error messages
2. Verify file has `.wire` extension
3. Check that `activationEvents` in `package.json` includes `onLanguage:wire`

### Syntax highlighting not showing
1. Press Ctrl+Shift+P → "Developer: Inspect Editor Tokens and Scopes"
2. Place cursor on highlighted element
3. Check if scope is matching expected pattern
4. Compare with `syntaxes/wire.tmLanguage.json` patterns

### Colors not matching expectations
- Colors depend on VS Code theme (Light, Dark, etc.)
- Each scope in the grammar maps to theme rules
- Example: `keyword.control.wire` might use different colors in different themes
- To debug: Use "Developer: Inspect Editor Tokens and Scopes" command

## File Structure

```
packages/vscode-extension/
├── src/
│   └── extension.ts          # Main extension file (activation)
├── syntaxes/
│   └── wire.tmLanguage.json  # TextMate grammar (syntax rules)
├── language-configuration.json # Language config (brackets, comments, etc.)
├── package.json              # Extension manifest (contributes, metadata)
├── tsconfig.json            # TypeScript config
├── .vscode/
│   ├── launch.json          # Debug configuration
│   └── tasks.json           # Build tasks
├── icons/
│   ├── wire-light.svg       # Light theme icon
│   └── wire-dark.svg        # Dark theme icon
└── out/                      # Compiled JavaScript (auto-generated)
```

## Next Steps

Once syntax highlighting is verified:

1. **Phase 2 (Autocompletion)**: Add `completionProvider.ts` with IntelliSense
2. **Phase 3 (Hover Tooltips)**: Add `hoverProvider.ts` with documentation
3. **Phase 4 (SVG Preview)**: Add `webviewProvider.ts` with live preview

## Command Line Help

```bash
# Compile to JavaScript
npm run esbuild

# Watch mode (recompile on file changes)
npm run esbuild-watch

# Production build (minified)
npm run vscode:prepublish

# Run tests
npm test
```

## VS Code Extension API References

- [Extension API Docs](https://code.visualstudio.com/api)
- [Language Extension Guide](https://code.visualstudio.com/api/language-extensions/overview)
- [TextMate Grammar](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide)
