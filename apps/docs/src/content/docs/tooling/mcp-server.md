---
title: MCP Server
description: Connect any AI assistant to Wire DSL via the Model Context Protocol — generate, validate, and render wireframes directly from your chat.
---

The Wire DSL MCP server exposes the engine to any MCP-compatible AI client. The model generates `.wire` code on its own; the server provides documentation, validation, and rendering.

**Compatible clients:** Claude Desktop, ChatGPT, Cursor, Windsurf, and any client that supports the [Model Context Protocol](https://modelcontextprotocol.io).

---

## Available tools

| Tool | Description |
|---|---|
| `get_documentation` | Returns Wire DSL syntax reference, component catalog, and usage examples |
| `validate_wire` | Validates `.wire` source code and returns errors with line/column positions |
| `render_wire` | Renders wireframes as SVG or PNG |
| `render_wire_widget` | Renders wireframes as an interactive embedded widget (Claude Desktop, ChatGPT, and other MCP Apps hosts) |

---

## Hosted server

A public instance is available at:

```
https://mcp.wire-dsl.org/mcp
```

No installation or authentication required.

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

Restart Claude Desktop after saving.

### ChatGPT

Connect via the hosted URL `https://mcp.wire-dsl.org/mcp` in the ChatGPT MCP integration settings. No authentication required.

### Cursor / Windsurf

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
# Custom port: PORT=8080 npx @wire-dsl/mcp-server --http
```

---

## Usage

Once connected, ask your AI assistant naturally:

> *"Create a wireframe for a login page with email and password fields"*

> *"Generate a mobile wireframe for a settings screen in dark mode"*

> *"Validate this Wire DSL code and fix any errors"*

The model will call `get_documentation` to learn the syntax, generate `.wire` code, and render the result automatically.

---

## Render options

All render tools accept the same optional parameters:

| Parameter | Values | Description |
|---|---|---|
| `device` | `mobile`, `tablet`, `desktop` | Viewport preset (overrides DSL `style.device`) |
| `renderer` | `standard`, `skeleton`, `sketch` | Visual style |
| `theme` | `light`, `dark` | Color theme (overrides DSL `style.theme`) |
| `screen` | screen name | Render a specific screen only |

`render_wire` additionally accepts:

| Parameter | Values | Description |
|---|---|---|
| `format` | `svg`, `png` | Output format (`png` returns a base64 image) |

---

## Example

```wire
project "Login" {
  style {
    device: "mobile"
    theme: "light"
  }

  screen Login {
    layout stack(direction: vertical, gap: md, padding: xl) {
      component Heading text: "Sign in"
      component Input label: "Email" placeholder: "you@example.com"
      component Input label: "Password" type: password
      component Button text: "Continue" variant: primary
      layout stack(direction: horizontal, gap: sm, justify: center) {
        component Text text: "No account?"
        component Link text: "Sign up"
      }
    }
  }
}
```

---

## Troubleshooting

**The model generates code but nothing renders**

Ask the model to call `validate_wire` first to check for syntax errors, then retry the render.

**Widget shows "Loading wireframe…" and doesn't update**

Fully quit and relaunch the host app (Claude Desktop aggressively caches widget resources). If using Claude Desktop against a remote HTTP MCP server, wrap with `mcp-remote` and force `--transport http-only`.

**SVG dimensions look wrong (too wide for mobile)**

Make sure the `.wire` file includes `device: "mobile"` in the `style` block, or pass `device: mobile` as a parameter to the render tool explicitly.

**Tool not found after setup**

Restart your AI client after updating the MCP configuration. For Claude Desktop, quit and reopen the application.

---

## Self-hosting

The package is open source and can be run locally or deployed to any Node.js environment:

```bash
git clone https://github.com/wire-dsl/wire-dsl
cd wire-dsl
pnpm install
pnpm --filter @wire-dsl/mcp-server build
node packages/mcp-server/dist/index.js --http
```

Source code: [`packages/mcp-server`](https://github.com/wire-dsl/wire-dsl/tree/main/packages/mcp-server)
