# Wire DSL — MCP Server

Generate, validate, and render wireframes directly from your AI assistant.

Wire DSL is a declarative language for creating UI wireframes with code. This MCP server connects any compatible AI client (Claude Desktop, ChatGPT, Cursor, Windsurf) to the Wire DSL engine — the model generates `.wire` code, and the server validates and renders it into visual wireframes.

---

## What it does

| Tool | Description |
|---|---|
| `get_documentation` | Returns Wire DSL syntax reference, component catalog, and examples |
| `validate_wire` | Validates `.wire` source code and returns errors with line/column positions |
| `render_wire` | Renders wireframes as SVG or PNG |
| `render_wire_widget` | Renders wireframes as an interactive embedded widget (Claude Desktop, ChatGPT, and other MCP Apps hosts) |

---

## Hosted server

The MCP server is publicly available at:

```
https://mcp.wire-dsl.org/mcp
```

No installation required. Use this URL directly in your client configuration.

---

## Setup

### Claude Desktop

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "wire-dsl": {
      "command": "npx",
      "args": ["-y", "@wire-dsl/mcp-server"]
    }
  }
}
```

Config file location:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

### ChatGPT

Connect via the hosted HTTP server URL `https://mcp.wire-dsl.org/mcp` in the ChatGPT MCP integration settings. No authentication required.

### Cursor / Windsurf

Add to your MCP settings:

```json
{
  "mcpServers": {
    "wire-dsl": {
      "url": "https://mcp.wire-dsl.org/mcp"
    }
  }
}
```

### Self-hosted (HTTP mode)

```bash
npx @wire-dsl/mcp-server --http
# Starts on http://localhost:3000/mcp
# Change port: PORT=8080 npx @wire-dsl/mcp-server --http
```

---

## Usage

Once connected, ask your AI assistant naturally:

> *"Create a wireframe for a login page with email and password fields"*

> *"Generate a mobile wireframe for a settings screen in dark mode"*

> *"Validate this Wire DSL code: ..."*

The model will consult the documentation, generate `.wire` code, and render the wireframe automatically.

---

## Wire DSL syntax overview

```wire
project "MyApp" {
  style {
    device: "mobile"   // mobile | tablet | desktop
    theme: "light"     // light | dark
  }

  screen Login {
    layout stack(direction: vertical, gap: md, padding: xl) {
      component Heading text: "Sign in"
      component Input label: "Email" placeholder: "you@example.com"
      component Input label: "Password" type: password
      component Button text: "Continue" variant: primary
    }
  }
}
```

**Available components:** button, input, text, heading, link, image, avatar, badge, icon, divider, card, stat, chart, table, list, nav, tabs, modal, sidebar, breadcrumb, form, select, checkbox

**Available containers:** stack, grid, split, panel, card

Full reference available via the `get_documentation` tool.

---

## Render options

| Parameter | Values | Description |
|---|---|---|
| `format` | `svg`, `png` | Output format |
| `device` | `mobile`, `tablet`, `desktop` | Viewport preset |
| `renderer` | `standard`, `skeleton`, `sketch` | Visual style |
| `theme` | `light`, `dark` | Color theme |
| `screen` | screen name | Render a specific screen only |

---

## Troubleshooting

**The model generates code but nothing renders**
Ask the model to call `validate_wire` first to check for syntax errors, then `render_wire` or `render_wire_widget`.

**Widget shows "Loading wireframe…" and doesn't update**
Fully quit and relaunch the host app (Claude Desktop aggressively caches widget resources). If using Claude Desktop against a remote HTTP MCP server, wrap with `mcp-remote` and force `--transport http-only`.

**SVG dimensions look wrong (too wide for mobile)**
Make sure your `.wire` file includes `device: "mobile"` in the `style` block, or pass `device: mobile` as a parameter to the render tool.

**Tool not found after setup**
Restart your AI client after updating the MCP configuration. For Claude Desktop, quit and reopen the app.

---

## Self-hosting

The server is open source. Run it locally or deploy to any Node.js environment:

```bash
git clone https://github.com/wire-dsl/wire-dsl
cd wire-dsl
pnpm install
pnpm --filter @wire-dsl/mcp-server build
node packages/mcp-server/dist/index.js --http
```

---

## License

MIT — [github.com/wire-dsl/wire-dsl](https://github.com/wire-dsl/wire-dsl)
