# Contrato IR (Intermediate Representation)

## Objetivo del IR

El **IR (Intermediate Representation)** es un JSON estable y versionado que representa el prototipo de forma **normalizada** (sin ambigüedad), aplicando defaults y validaciones.

- El parser produce **AST** (lo escrito)
- El normalizador produce **IR** (lo renderizable)

## Características del IR

- **Determinístico**: misma entrada → mismo output
- **Versionado**: migraciones posibles
- **AI-friendly**: estructura repetible
- **Normalizado**: defaults aplicados, valores validados

---

## Estructura General

```json
{
  "irVersion": "1.0",
  "project": {
    "id": "proj_admin_dashboard",
    "name": "Admin Dashboard",
    "tokens": { ... },
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
  "tokens": {
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

### Screen

```json
{
  "id": "UsersList",
  "name": "Users List",
  "viewport": { "width": 1280, "height": 720 },
  "root": { "ref": "node_root_users" }
}
```

**Propiedades**:

- `id`: Identificador único
- `name`: Nombre legible
- `viewport`: Dimensiones de la pantalla
- `root`: Referencia al nodo raíz

---

## Nodes (Diccionario)

Los nodos se almacenan en un diccionario `nodes` para permitir referencias cruzadas.

```json
{
  "nodes": {
    "node_id_1": { ... },
    "node_id_2": { ... }
  }
}
```

### Node Base

Campos comunes a todos los nodos:

```json
{
  "id": "node_users_root",
  "kind": "container" | "component",
  "style": { ... },
  "meta": { ... }
}
```

**Propiedades**:

- `id`: Identificador único del nodo
- `kind`: Tipo de nodo (`container` | `component`)
- `style`: Estilos aplicados (opcional)
- `meta`: Metadata para tooling/IA (opcional)

---

## Container Nodes

### Container con Stack Layout

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

**Layout Props (Stack)**:

- `direction`: `"vertical"` | `"horizontal"`
- `gap`: espaciado entre hijos (`"xs"` | `"sm"` | `"md"` | `"lg"` | `"xl"`)

---

### Container con Grid Layout

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

**Layout Props (Grid)**:

- `columns`: número de columnas
- `gap`: espaciado entre celdas
- `rowHeight`: altura de filas (Size object)

**Grid Cell Metadata**:

- `colSpan`: columnas que ocupa
- `rowSpan`: filas que ocupa
- `align`: alineación horizontal (`"start"` | `"center"` | `"end"`)

---

### Container con Split Layout

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

**Layout Props (Split)**:

- `sidebarWidth`: ancho del panel izquierdo (px)
- `gap`: espaciado entre paneles
- `leftMinWidth`: ancho mínimo del panel izquierdo
- `rightMinWidth`: ancho mínimo del panel derecho

---

## Component Nodes

```json
{
  "id": "cmp_heading_users",
  "kind": "component",
  "componentType": "Heading",
  "props": {
    "text": "Users"
  },
  "events": []
}
```

**Propiedades**:

- `id`: Identificador único
- `kind`: Siempre `"component"`
- `componentType`: Tipo de componente (ver biblioteca)
- `props`: Propiedades específicas del componente
- `events`: Array de eventos declarativos

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

**Propiedades**:

- `padding`: relleno interno (token de spacing)
- `gap`: espaciado entre elementos (token de spacing)
- `align`: alineación horizontal (`"start"` | `"center"` | `"end"`)
- `justify`: justificación vertical (`"start"` | `"center"` | `"end"`)
- `width`: objeto Size
- `height`: objeto Size

---

## Size Object

Define dimensiones de forma flexible.

### Fixed (píxeles)

```json
{ "mode": "fixed", "value": 240 }
```

### Fill (ocupa espacio disponible)

```json
{ "mode": "fill" }
```

### Content (ajusta al contenido)

```json
{ "mode": "content" }
```

### Percent (porcentaje del contenedor)

```json
{ "mode": "percent", "value": 50 }
```

---

## Events

```json
{
  "events": [
    {
      "event": "onClick",
      "action": {
        "type": "goto",
        "targetScreenId": "UserCreate"
      }
    }
  ]
}
```

**Tipos de eventos**:

- `onClick`: Click en elemento
- `onRowClick`: Click en fila de tabla
- (Futuro: `onSubmit`, `onChange`, etc.)

**Tipos de acciones**:

- `goto`: Navega a otra pantalla
  - `targetScreenId`: ID de la pantalla destino

---

## Componentes - Props Reference

### Text Components

**Heading**

```json
{
  "componentType": "Heading",
  "props": { "text": "Title" }
}
```

**Text**

```json
{
  "componentType": "Text",
  "props": { "content": "Lorem ipsum..." }
}
```

---

### Input Components

**Input**

```json
{
  "componentType": "Input",
  "props": {
    "label": "Username",
    "placeholder": "Enter name..."
  }
}
```

**Textarea**

```json
{
  "componentType": "Textarea",
  "props": {
    "label": "Description",
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

---

### Button Components

**Button**

```json
{
  "componentType": "Button",
  "props": {
    "text": "Save",
    "variant": "primary" | "secondary" | "ghost"
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

### Navigation Components

**SidebarMenu**

```json
{
  "componentType": "SidebarMenu",
  "props": {
    "items": [
      {
        "label": "Users",
        "active": true,
        "action": { "type": "goto", "targetScreenId": "UsersList" }
      },
      { "label": "Roles", "active": false }
    ]
  }
}
```

**Topbar**

```json
{
  "componentType": "Topbar",
  "props": { "title": "Dashboard" }
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

### Data Components

**Table**

```json
{
  "componentType": "Table",
  "props": {
    "columns": ["Name", "Email", "Status", "Role"],
    "rowsMock": 8
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

### Container Components

**Panel**

```json
{
  "componentType": "Panel",
  "props": {
    "title": "User Info",
    "height": { "mode": "fixed", "value": 240 }
  }
}
```

**Card**

```json
{
  "componentType": "Card",
  "props": {
    "title": "Stats"
  }
}
```

---

### Other Components

**Divider**

```json
{
  "componentType": "Divider",
  "props": {}
}
```

**ChartPlaceholder**

```json
{
  "componentType": "ChartPlaceholder",
  "props": {
    "type": "bar" | "line" | "pie",
    "height": 200
  }
}
```

---

## Ejemplo IR Completo

Ver archivo: [examples/ir-example.json](../examples/ir-example.json)

---

## Versionado

El campo `irVersion` permite evolucionar el formato:

- `"1.0"`: Versión inicial (MVP)
- Futuras versiones podrán incluir migraciones automáticas

Reglas de versionado:

- **Major version**: Cambios incompatibles
- **Minor version**: Nuevas características compatibles
