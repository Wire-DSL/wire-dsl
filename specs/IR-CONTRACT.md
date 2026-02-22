# IR Contract (Intermediate Representation)

## IR Objective

The **IR (Intermediate Representation)** is a stable, versioned JSON that represents the wireframe in **normalized form** (without ambiguity), applying defaults and validations.

- Parser produces **AST** (what was written)
- Normalizer produces **IR** (what is renderable)

## IR Characteristics

- **Deterministic**: same input → same output
- **Versioned**: migrations possible
- **AI-friendly**: repetitive structure
- **Normalized**: defaults applied, values validated

---

## General Structure

```json
{
  "irVersion": "1.0",
  "project": {
    "id": "proj_admin_dashboard",
    "name": "Admin Dashboard",
    "config": { ... },
    "screens": [ ... ],
    "nodes": { ... }
  }
}
```

### Project

```json
{
  "id": "proj_admin_dashboard",
  "name": "Admin Dashboard",
  "config": {
    "density": "normal",
    "spacing": "md",
    "radius": "md",
    "stroke": "normal",
    "font": "base"
  },
  "screens": [ ... ],
  "nodes": { ... }
}
```

**Properties**:
- `id`: Unique identifier (auto-generated from name)
- `name`: Human-readable name
- `theme`: Global design tokens
- `screens`: Array of screen definitions
- `nodes`: Dictionary of all nodes (for cross-references)

---

### Screen

```json
{
  "id": "UsersList",
  "name": "Users List",
  "viewport": { "width": 1280, "height": 720 },
  "root": { "ref": "node_root_users" }
}
```

**Properties**:
- `id`: Unique identifier
- `name`: Human-readable name
- `viewport`: Screen dimensions
- `root`: Reference to root layout node

---

## Nodes (Dictionary)

Nodes are stored in a `nodes` dictionary to allow cross-references.

```json
{
  "nodes": {
    "node_id_1": { ... },
    "node_id_2": { ... }
  }
}
```

### Base Node

Common fields for all nodes:

```json
{
  "id": "node_users_root",
  "kind": "container" | "component" | "instance",
  "style": { ... },
  "meta": { ... }
}
```

**Properties**:
- `id`: Unique node identifier
- `kind`: Node type (`container` | `component` | `instance`)
- `style`: Applied styles (optional)
- `meta.nodeId`: SourceMap nodeId of the AST node that produced this IR node (enables bidirectional canvas↔code selection)

---

## Container Nodes

### Container with Stack Layout

```json
{
  "id": "node_main_stack",
  "kind": "container",
  "layout": {
    "type": "stack",
    "props": {
      "direction": "vertical",
      "gap": "md"
    }
  },
  "style": {
    "padding": "lg"
  },
  "children": [
    { "slot": "child", "ref": "cmp_heading" },
    { "slot": "child", "ref": "cmp_table" }
  ]
}
```

**Stack Layout Props**:
- `direction`: `"vertical"` | `"horizontal"`
- `gap`: spacing between children (`"xs"` | `"sm"` | `"md"` | `"lg"` | `"xl"`)

---

### Container with Grid Layout

```json
{
  "id": "node_actions_grid",
  "kind": "container",
  "layout": {
    "type": "grid",
    "props": {
      "columns": 12,
      "gap": "md",
      "rowHeight": { "mode": "content" }
    }
  },
  "children": [
    {
      "slot": "cell",
      "ref": "cmp_search",
      "grid": { "colSpan": 8, "rowSpan": 1, "align": "start" }
    },
    {
      "slot": "cell",
      "ref": "cmp_button",
      "grid": { "colSpan": 4, "rowSpan": 1, "align": "end" }
    }
  ]
}
```

**Grid Layout Props**:
- `columns`: number of columns
- `gap`: spacing between cells
- `rowHeight`: row height (Size object)

**Grid Cell Metadata**:
- `colSpan`: columns occupied
- `rowSpan`: rows occupied
- `align`: horizontal alignment (`"start"` | `"center"` | `"end"`)

---

### Container with Split Layout

```json
{
  "id": "node_split_root",
  "kind": "container",
  "layout": {
    "type": "split",
    "props": {
      "sidebarWidth": 260,
      "gap": "md",
      "leftMinWidth": 220,
      "rightMinWidth": 640
    }
  },
  "children": [
    { "slot": "left", "ref": "node_sidebar" },
    { "slot": "right", "ref": "node_main" }
  ]
}
```

**Split Layout Props**:
- `sidebarWidth`: left panel width (px)
- `gap`: spacing between panels
- `leftMinWidth`: left panel minimum width
- `rightMinWidth`: right panel minimum width

---

### Container with Panel Layout

```json
{
  "id": "node_panel",
  "kind": "container",
  "layout": {
    "type": "panel",
    "props": {
      "padding": "md"
    }
  },
  "children": [
    { "slot": "child", "ref": "child_node" }
  ]
}
```

**Panel Layout Props**:
- `padding`: internal padding (spacing token)

---

### Container with Card Layout

```json
{
  "id": "node_card",
  "kind": "container",
  "layout": {
    "type": "card",
    "props": {
      "padding": "lg",
      "gap": "md",
      "radius": "md"
    }
  },
  "children": [
    { "slot": "child", "ref": "child_1" },
    { "slot": "child", "ref": "child_2" }
  ]
}
```

**Card Layout Props**:
- `padding`: internal padding
- `gap`: spacing between children
- `radius`: border radius (token)

---

## Component Nodes

```json
{
  "id": "cmp_heading_users",
  "kind": "component",
  "componentType": "Heading",
  "props": {
    "text": "Users"
  }
}
```

**Properties**:
- `id`: Unique identifier
- `kind`: Always `"component"`
- `componentType`: Component type
- `props`: Component-specific properties

---

## Instance Nodes

When a user-defined component or layout (`define Component` / `define Layout`) is used in a screen, the IR generator produces an **instance node** that wraps the expanded content. This preserves the call-site identity so the canvas can select, inspect, and edit the invocation independently from the definition.

```json
{
  "id": "node_12",
  "kind": "instance",
  "definitionName": "MyComp",
  "definitionKind": "component",
  "invocationProps": { "text": "Hello" },
  "expandedRoot": { "ref": "node_11" },
  "style": {},
  "meta": { "nodeId": "component-mycomp-0" }
}
```

**Properties**:
- `id`: Unique identifier
- `kind`: Always `"instance"`
- `definitionName`: Name of the user-defined component or layout (e.g. `"MyComp"`)
- `definitionKind`: `"component"` or `"layout"`, matching the `define` keyword used
- `invocationProps`: The props/params passed at the call site (e.g. `{ text: "Hello" }`). These are what the canvas property editor should surface for editing.
- `expandedRoot.ref`: Reference to the root IR node produced by expanding the definition. Internal nodes have scoped IDs (`layout-stack-0@component-mycomp-0`) to ensure uniqueness across multiple instances.
- `meta.nodeId`: SourceMap nodeId of the call-site AST node (e.g. `"component-mycomp-0"`). Present in the SVG as `data-node-id`.

### SVG Output for Instance Nodes

The SVG renderer emits a wrapper `<g>` with only `data-node-id`, identical to any other node. The canvas resolves everything else (definition name, invocation props, source range) via the SourceMap — the SVG is not a metadata store.

```xml
<g data-node-id="component-mycomp-0">
  <rect x="0" y="0" width="375" height="40"
        fill="transparent" stroke="none" pointer-events="all"/>
  <!-- expanded content with scoped IDs -->
  <g data-node-id="layout-stack-0@component-mycomp-0"> ... </g>
</g>
```

| What the canvas needs | Where it lives |
|---|---|
| Definition name | `sourceMap["component-mycomp-0"].componentType` |
| Whether it is user-defined | `sourceMap["component-mycomp-0"].isUserDefined` |
| Invocation prop values | `sourceMap["component-mycomp-0"].properties.text.value` |
| Call-site source range | `sourceMap["component-mycomp-0"].range` |
| Definition source range | SourceMap entry where `nodeId === "define-MyComp"` |

---

## Style Object

```json
{
  "padding": "lg",
  "gap": "md",
  "align": "start",
  "justify": "start",
  "width": { "mode": "fill" },
  "height": { "mode": "content" }
}
```

**Properties**:
- `padding`: internal padding (spacing token)
- `gap`: spacing between elements (spacing token)
- `align`: horizontal alignment (`"start"` | `"center"` | `"end"`)
- `justify`: vertical justification (`"start"` | `"center"` | `"end"`)
- `width`: Size object
- `height`: Size object

---

## Size Object

Defines dimensions flexibly.

### Fixed (pixels)

```json
{ "mode": "fixed", "value": 240 }
```

### Fill (occupies available space)

```json
{ "mode": "fill" }
```

### Content (adjusts to content)

```json
{ "mode": "content" }
```

### Percent (percentage of container)

```json
{ "mode": "percent", "value": 50 }
```

---

## Components - Props Reference

### Text Components (3)

**Heading**
```json
{ "componentType": "Heading", "props": { "text": "Title" } }
```

**Text**
```json
{ "componentType": "Text", "props": { "text": "Text content" } }
```

**Text**
```json
{ "componentType": "Text", "props": { "text": "Multi-line content..." } }
```

**Label**
```json
{ "componentType": "Label", "props": { "text": "Field label" } }
```

---

### Input Components (6)

**Input**
```json
{
  "componentType": "Input",
  "props": {
    "label": "Email",
    "placeholder": "Enter email...",
    "type": "email"
  }
}
```

**Textarea**
```json
{
  "componentType": "Textarea",
  "props": {
    "label": "Comments",
    "placeholder": "Enter comments...",
    "rows": 4
  }
}
```

**Select**
```json
{
  "componentType": "Select",
  "props": {
    "label": "Role",
    "options": ["Admin", "User", "Guest"]
  }
}
```

**Checkbox**
```json
{
  "componentType": "Checkbox",
  "props": {
    "label": "Agree to terms",
    "checked": false
  }
}
```

**Radio**
```json
{
  "componentType": "Radio",
  "props": {
    "label": "Option",
    "options": ["A", "B", "C"],
    "value": "A"
  }
}
```

**Toggle**
```json
{
  "componentType": "Toggle",
  "props": {
    "label": "Enable notifications",
    "checked": true
  }
}
```

---

### Button Components (2)

**Button**
```json
{
  "componentType": "Button",
  "props": {
    "text": "Save",
    "variant": "primary"
  }
}
```

**IconButton**
```json
{
  "componentType": "IconButton",
  "props": {
    "icon": "search"
  }
}
```

---

### Navigation Components (4)

**Topbar**
```json
{
  "componentType": "Topbar",
  "props": { "title": "Dashboard" }
}
```

**SidebarMenu**
```json
{
  "componentType": "SidebarMenu",
  "props": {
    "items": [
      { "label": "Dashboard", "active": true },
      { "label": "Users", "active": false }
    ]
  }
}
```

**Breadcrumbs**
```json
{
  "componentType": "Breadcrumbs",
  "props": {
    "items": ["Home", "Users", "Detail"]
  }
}
```

**Tabs**
```json
{
  "componentType": "Tabs",
  "props": {
    "items": ["Profile", "Settings", "Logs"],
    "activeIndex": 0
  }
}
```

---

### Data Display Components (2)

**Table**
```json
{
  "componentType": "Table",
  "props": {
    "columns": ["Name", "Email", "Status"],
    "rows": 8
  }
}
```

**List**
```json
{
  "componentType": "List",
  "props": {
    "items": ["Item 1", "Item 2", "Item 3"]
  }
}
```

---

### Media Components (3)

**Image**
```json
{
  "componentType": "Image",
  "props": {
    "src": "image.png",
    "alt": "Description"
  }
}
```

**Icon**
```json
{
  "componentType": "Icon",
  "props": { "name": "check" }
}
```

**Profile Image (use `Image`)**
```json
{
  "componentType": "Image",
  "props": {
    "src": "profile.png",
    "alt": "Profile image"
  }
}
```

---

### Display Components (4)

**Badge**
```json
{
  "componentType": "Badge",
  "props": {
    "label": "New",
    "variant": "success"
  }
}
```

**Link**
```json
{
  "componentType": "Link",
  "props": { "text": "Click here" }
}
```

**Divider**
```json
{
  "componentType": "Divider",
  "props": {}
}
```

**Alert**
```json
{
  "componentType": "Alert",
  "props": {
    "text": "Warning message",
    "type": "warning"
  }
}
```

---

### Information Components (3)

**StatCard**
```json
{
  "componentType": "StatCard",
  "props": {
    "label": "Total Users",
    "value": "1,234"
  }
}
```

**Code**
```json
{
  "componentType": "Code",
  "props": {
    "code": "const x = 10;",
    "language": "javascript"
  }
}
```

**ChartPlaceholder**
```json
{
  "componentType": "ChartPlaceholder",
  "props": {
    "type": "bar",
    "height": 300
  }
}
```

---

### Feedback Components (2)

**Modal**
```json
{
  "componentType": "Modal",
  "props": {
    "title": "Confirm Action",
    "message": "Are you sure?"
  }
}
```

**Spinner**
```json
{
  "componentType": "Spinner",
  "props": { "size": "medium" }
}
```

---

## Complete IR Example

See file: [examples/ir-example.json](../examples/ir-example.json)

---

## Versioning

The `irVersion` field enables format evolution:

- `"1.0"`: Initial version (MVP)
- Future versions can include automatic migrations

Versioning rules:
- **Major version**: Breaking changes
- **Minor version**: New compatible features

---

## Validation Rules

Every IR must pass:
1. Schema validation (all required fields present)
2. Reference validation (all refs exist)
3. Type validation (property values match expected types)
4. Semantic validation (consistent structure)

---

**Last Updated**: January 2026  
**Status**: Complete Specification
