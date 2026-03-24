# render_wire Tool Parameters

When calling the `render_wire` MCP tool, these parameters control the output:

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `format` | `svg` \| `png` | `svg` | `png` returns a base64 image visible in chat. `svg` returns raw markup for inspection. **Always use `png` when showing the wireframe to the user.** |
| `device` | `mobile` \| `tablet` \| `desktop` | DSL value or `desktop` | Overrides the viewport set in the DSL `style` block. Widths: mobile=375px, tablet=768px, desktop=1280px. |
| `renderer` | `standard` \| `skeleton` \| `sketch` | `standard` | `skeleton` renders grey loading-state placeholders. `sketch` renders a hand-drawn appearance. |
| `theme` | `light` \| `dark` | DSL value or `light` | Overrides the `theme` set in the DSL `style` block. |
| `screen` | screen name string | all screens | Render only a specific screen by its name. |

## Priority rules

- `device` tool param > `style { device: ... }` in DSL > `desktop`
- `theme` tool param > `style { theme: ... }` in DSL > `light`

## Usage examples

Show a mobile wireframe to the user:
```
render_wire(wire_code: "...", format: "png", device: "mobile")
```

Inspect SVG markup for a specific screen:
```
render_wire(wire_code: "...", format: "svg", screen: "Dashboard")
```

Render a skeleton loading state in dark mode:
```
render_wire(wire_code: "...", format: "png", renderer: "skeleton", theme: "dark")
```

Render a sketch-style wireframe for desktop:
```
render_wire(wire_code: "...", format: "png", renderer: "sketch", device: "desktop")
```
