---
title: IR Format Specification
description: Intermediate Representation (IR) schema and contract
---

The **IR (Intermediate Representation)** is a stable, versioned JSON format that represents wireframes in normalized form after parsing and validation.

## Quick Reference

The IR transforms raw DSL into an unambiguous, renderable format:

- **Input**: Parsed `.wire` file (AST)
- **Processing**: Apply style defaults, validate components, normalize values
- **Output**: Complete IR document ready for layout and rendering

## Key Characteristics

- **Deterministic**: Same input always produces same output
- **Versioned**: Allows for schema migrations (currently v1.0)
- **Normalized**: All defaults applied, all values validated
- **Cross-referenceable**: Nodes stored in dictionary for easy lookup
- **AI-friendly**: Regular, predictable structure

## Basic Structure

```json
{
  "irVersion": "1.0",
  "project": {
    "id": "proj_dashboard",
    "name": "Admin Dashboard",
    "style": {
      "density": "normal",
      "spacing": "md",
      "radius": "md",
      "stroke": "normal",
      "font": "base"
    },
    "screens": [
      {
        "id": "screen_dashboard",
        "name": "Dashboard",
        "viewport": { "width": 1280, "height": 720 },
        "root": { "ref": "node_root_1" }
      }
    ],
    "nodes": {
      "node_root_1": {
        "id": "node_root_1",
        "kind": "container",
        "type": "stack",
        "children": [ ... ]
      }
    }
  }
}
```

## Schema Details

### Project Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique project identifier |
| `name` | string | Yes | Human-readable name |
| `style` | object | No | Style tokens (engine defaults applied if omitted) |
| `screens` | array | Yes | Screen definitions (at least 1) |
| `nodes` | object | Yes | All nodes referenced by screens |

### Style Object

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `density` | string | `compact`, `normal`, `comfortable` | UI compactness |
| `spacing` | string | `xs`, `sm`, `md`, `lg`, `xl` | Base spacing token |
| `radius` | string | `none`, `sm`, `md`, `lg`, `full` | Border radius token |
| `stroke` | string | `thin`, `normal`, `thick` | Border width token |
| `font` | string | `sm`, `base`, `lg` | Typography scale token |

### Screen Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique screen identifier |
| `name` | string | Yes | Human-readable name |
| `viewport` | object | Yes | Display dimensions `{width, height}` |
| `root` | ref | Yes | Reference to root layout node |

### Node Object (Container)

```json
{
  "id": "node_stack_1",
  "kind": "container",
  "type": "stack",
  "properties": {
    "direction": "vertical",
    "gap": 16,
    "padding": 24,
    "align": "justify"
  },
  "children": [
    { "ref": "node_heading_1" },
    { "ref": "node_input_1" }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique node ID |
| `kind` | string | `container` or `component` |
| `type` | string | Layout/component type |
| `properties` | object | Type-specific properties |
| `children` | array | Child node references (containers only) |

### Node Object (Component)

```json
{
  "id": "node_button_1",
  "kind": "component",
  "type": "Button",
  "properties": {
    "text": "Submit",
    "variant": "primary"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique node ID |
| `kind` | string | Always `component` |
| `type` | string | Component name (e.g., `Button`, `Input`) |
| `properties` | object | Component-specific properties |

## Layout Type Properties

### Stack
```json
{
  "type": "stack",
  "properties": {
    "direction": "vertical" | "horizontal",
    "gap": 16,
    "padding": 24,
    "align": "justify" | "left" | "center" | "right"
  }
}
```

### Grid
```json
{
  "type": "grid",
  "properties": {
    "columns": 12,
    "gap": 16
  },
  "children": [
    {
      "ref": "cell_1",
      "span": 6,
      "align": "start" | "center" | "end"
    }
  ]
}
```

### Split
```json
{
  "type": "split",
  "properties": {
    "sidebarWidth": 260,
    "gap": 16
  },
  "children": [
    { "ref": "sidebar_node" },
    { "ref": "content_node" }
  ]
}
```

### Panel
```json
{
  "type": "panel",
  "properties": {
    "padding": 16,
    "background": "white"
  },
  "children": [{ "ref": "content_node" }]
}
```

### Card
```json
{
  "type": "card",
  "properties": {
    "padding": 16,
    "gap": 16,
    "radius": "md",
    "border": true
  },
  "children": [ ... ]
}
```

## Component Properties

Components store properties specific to their type:

```json
{
  "id": "node_input_1",
  "kind": "component",
  "type": "Input",
  "properties": {
    "label": "Email",
    "placeholder": "your@email.com"
  }
}
```

See [Components Reference](../language/components.md) for all property options.

## Example: Complete IR

```json
{
  "irVersion": "1.0",
  "project": {
    "id": "proj_login",
    "name": "Login",
    "style": {
      "density": "normal",
      "spacing": "md",
      "radius": "md",
      "stroke": "normal",
      "font": "base"
    },
    "screens": [{
      "id": "screen_login",
      "name": "Login Screen",
      "viewport": { "width": 400, "height": 500 },
      "root": { "ref": "stack_root" }
    }],
    "nodes": {
      "stack_root": {
        "id": "stack_root",
        "kind": "container",
        "type": "stack",
        "properties": {
          "direction": "vertical",
          "gap": 16,
          "padding": 24
        },
        "children": [
          { "ref": "heading_title" },
          { "ref": "input_email" },
          { "ref": "input_password" },
          { "ref": "button_login" }
        ]
      },
      "heading_title": {
        "id": "heading_title",
        "kind": "component",
        "type": "Heading",
        "properties": { "text": "Sign In" }
      },
      "input_email": {
        "id": "input_email",
        "kind": "component",
        "type": "Input",
        "properties": {
          "label": "Email",
          "placeholder": "you@example.com"
        }
      },
      "input_password": {
        "id": "input_password",
        "kind": "component",
        "type": "Input",
        "properties": {
          "label": "Password",
          "placeholder": "••••••••"
        }
      },
      "button_login": {
        "id": "button_login",
        "kind": "component",
        "type": "Button",
        "properties": {
          "text": "Login",
          "variant": "primary"
        }
      }
    }
  }
}
```

## Validation in IR

All IR documents are validated against a Zod schema:

-  properties must exist and have valid values
- Screen viewports must be positive integers
- All node references must exist in the nodes dictionary
- All component properties must be valid for that component type
- Layout children references must exist

Invalid IR produces detailed validation errors.

## Full Specification

For complete technical specification with all property definitions, see:
- [specs/IR-CONTRACT.md](../../specs/IR-CONTRACT.md) in the repository

## Next Steps

- [Layout Engine Specification](./layout-engine.md)
- [Validation Rules](./validation.md)
- [Architecture Overview](./overview.md)
