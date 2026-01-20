# Arquitectura del Proyecto — WireDSL

## 1. Propósito
WireDSL es una plataforma para **crear wireframes/prototipos low‑fidelity de forma declarativa**, similar a Mermaid, donde:

- Se definen **pantallas** como bloques.
- Cada pantalla contiene **layouts** (split / stack / grid).
- Dentro de los layouts se colocan **componentes wireframe** (tabla, formulario, cards, inputs, etc.).
- El output se renderiza como **mock navegable** y puede exportarse (SVG/PNG/PDF/JSON).

El objetivo principal es que el formato sea **estable, determinístico y AI‑friendly**, de modo que una IA pueda generar prototipos siguiendo patrones predecibles.

---

## 2. Principios de diseño

### 2.1 Declaratividad total
- No se “dibuja”; se **declara estructura**.
- El lenguaje describe **intención**, no posiciones absolutas.

### 2.2 Pipeline determinístico
Entrada declarativa → Parser → AST → IR normalizado → Layout engine → Render → Export

### 2.3 AI‑friendly
- Sintaxis repetible.
- Defaults consistentes.
- Validación estricta con errores claros.

### 2.4 Separación de responsabilidades
- DSL/Parser desacoplado del render.
- Layout engine independiente del renderer.
- Modelo de dominio estable (IR versionado).

---

## 3. Alcance funcional

### 3.1 MVP
- Definir `project`, `screen`, `layout`, `component`.
- Layouts: `stack`, `grid`, `split`.
- Render Web (React/HTML) estático.
- Export JSON del IR.

### 3.2 Evolución
- Navegación declarativa (hotspots, `goto(screenId)`).
- Componentes avanzados (Tabs, Forms, Tables con columnas).
- Export SVG/PNG/PDF.
- Inspector/Debug overlay (cajas, padding, grid).

---

## 4. Arquitectura lógica (capas)

### Capa A — DSL (Lenguaje declarativo)
WireDSL provee un formato “estilo Mermaid”, humano y estructurado.

**Requisitos**:
- Fácil de leer/escribir.
- Fácil de parsear.
- Fácil de generar por IA.

**Estrategia**: DSL híbrido (bloques + propiedades `key: value`).

---

### Capa B — Parser + AST
- El parser transforma el DSL en un **AST** (lo que el usuario escribió).
- Se preservan ubicaciones (línea/columna) para errores y tooling.

---

### Capa C — IR (Modelo interno normalizado)
El AST se convierte a un **IR estable**, aplicando:
- Defaults
- Normalización (tokens, sizes)
- Validaciones semánticas

El IR es la **fuente de verdad técnica** para el render.

---

### Capa D — Layout Engine
Responsable de calcular posiciones y tamaños finales a partir de constraints declarativas.

Layouts soportados (core):
- **Stack** (vertical/horizontal)
- **Grid** (columnas + spans)
- **Split panes** (sidebar + main)

El layout engine opera sobre el IR y produce un **Render Tree** con bounding boxes.

---

### Capa E — Renderer
Implementación principal:
- **React + HTML/CSS** (rápido, extensible)

Modos de render:
- Wireframe (gris, low fidelity)
- Interactivo (click → navegación)

---

### Capa F — Interaction Layer
Interacciones declarativas:
- `onClick: goto("UserDetail")`
- Hotspots y navegación entre pantallas

---

### Capa G — Exporters
- JSON (IR)
- SVG (diagramas)
- PNG
- PDF

---

## 5. Modelo de dominio (conceptual)

### 5.1 Project
- `name`
- `screens[]`
- `tokens` (spacing, radius, density)

### 5.2 Screen
- `id`, `name`
- `rootLayout`
- `routes/links` (opcional)

### 5.3 Node (UI Tree)
Todo elemento renderizable es un `Node`.

- `ContainerNode` (layout)
- `ComponentNode` (widgets)

---

## 6. Component Library (primitives wireframe)
Conjunto mínimo (MVP):
- Text, Heading
- Button, IconButton
- Input, Textarea, Select
- Table, List
- Card, Panel
- Tabs
- Divider
- ChartPlaceholder
- SidebarMenu, Topbar, Breadcrumbs

Regla: **no hay negocio**, solo representación visual.

---

## 7. Tokens de estilo
Tokens para consistencia (no “diseño final”, sino coherencia):

- Spacing: `xs/sm/md/lg/xl`
- Radius: `none/sm/md/lg`
- Stroke: `thin/normal`
- Font: `base/title/mono`
- Density: `compact/normal/comfortable`

---

## 8. Validación y reglas
Validaciones sintácticas y semánticas para evitar ambigüedades.

Ejemplos:
- Un `screen` debe tener un solo root layout.
- `grid` requiere `columns`.
- `table` requiere `columns[]`.
- `absolute` deshabilitado por defecto.

---

## 9. Propuesta de sintaxis DSL (ejemplo)

```txt
project "Admin Dashboard" {
  tokens density: normal

  screen UsersList {
    layout split(sidebar: 260, gap: md) {
      left: sidebar {
        component SidebarMenu items: ["Users", "Roles", "Permissions", "Audit"]
      }

      right: stack(gap: md, padding: lg) {
        component Heading text: "Users"

        layout grid(columns: 12, gap: md) {
          cell span: 8 {
            component Input label: "Search user" placeholder: "name, email..."
          }
          cell span: 4 align: end {
            component Button text: "Create user" onClick: goto("UserCreate")
          }
        }

        component Table
          columns: ["Name", "Email", "Status", "Role"]
          rowsMock: 8
          onRowClick: goto("UserDetail")
      }
    }
  }
}
```

---

## 10. Arquitectura técnica (paquetes)

### `wiredsl-core`
- Tipos de dominio (AST/IR)
- Validación semántica
- Normalización y defaults
- Versionado de IR

### `wiredsl-parser`
- Tokenizer + Parser DSL
- Mensajes de error (línea/columna)

### `wiredsl-layout`
- Stack/Grid/Split
- Cálculo de bounding boxes

### `wiredsl-render-web`
- Renderer React/HTML
- Navegación y hotspots
- Inspector overlay (debug)

### `wiredsl-export`
- Exporters SVG/PNG/PDF
- Export IR JSON

### `wiredsl-cli`
- `wiredsl validate input.wire`
- `wiredsl build input.wire --out out/`
- `wiredsl export input.wire --pdf`

---

## 11. Roadmap

### Fase 1 — MVP determinístico
- DSL + Parser
- IR estable
- Layout stack/grid/split
- Render web
- Export JSON

### Fase 2 — Interacción
- `goto(screen)`
- Hotspots
- Mini-router

### Fase 3 — Componentes avanzados
- Table real
- Form groups
- Tabs

### Fase 4 — Export
- PNG/PDF/SVG

### Fase 5 — AI patterns
- Plantillas por pantalla (list/detail/create)
- Linter: “recomendaciones de estructura”

---

## 12. Próximo paso recomendado
Definir el **contrato IR JSON** (esquema interno versionado) y mapear:
- DSL → AST → IR
- IR → Render Tree

El IR será la base para:
- Render
- Export
- Validación
- Generación por IA

---

## 13. Contrato IR JSON (Fuente de verdad)

### 13.1 Objetivo del IR
El **IR (Intermediate Representation)** es un JSON estable y versionado que representa el prototipo de forma **normalizada** (sin ambigüedad), aplicando defaults y validaciones.

- El parser produce AST (lo escrito)
- El normalizador produce IR (lo renderizable)

El IR debe ser:
- **Determinístico** (misma entrada → mismo output)
- **Versionado** (migraciones posibles)
- **AI-friendly** (estructura repetible)

---

### 13.2 Estructura general

```json
{
  "irVersion": "1.0",
  "project": {
    "id": "proj_admin_dashboard",
    "name": "Admin Dashboard",
    "tokens": {
      "density": "normal",
      "spacing": "md",
      "radius": "md",
      "stroke": "normal",
      "font": "base"
    },
    "screens": [
      {
        "id": "UsersList",
        "name": "Users List",
        "viewport": { "width": 1280, "height": 720 },
        "root": { "ref": "node_root_users" }
      }
    ],
    "nodes": {
      "node_root_users": {
        "id": "node_root_users",
        "kind": "container",
        "layout": { "type": "split", "props": { "sidebarWidth": 260, "gap": "md" } },
        "children": [
          { "slot": "left", "ref": "node_sidebar" },
          { "slot": "right", "ref": "node_main" }
        ]
      }
    }
  }
}
```

Notas:
- `screens[]` refiere a un nodo raíz por referencia.
- `nodes{}` es un diccionario para permitir referencias cruzadas y reuso.
- Todo nodo tiene `id` único.

---

### 13.3 Tipos base

#### Node (común)
Campos recomendados en todos los nodos:
- `id`: string
- `kind`: `container | component`
- `style`: opcional (padding, gap, align, width/height)
- `meta`: opcional (tags para tooling/IA)

#### Style (común)
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

#### Size
- `fixed`: pixels
- `fill`: ocupa el espacio disponible
- `content`: se ajusta al contenido (mínimos)
- `percent`: porcentaje del contenedor

Ejemplos:
```json
{ "mode": "fixed", "value": 240 }
{ "mode": "fill" }
{ "mode": "percent", "value": 50 }
{ "mode": "content" }
```

---

### 13.4 Layout containers

#### Stack
```json
{
  "type": "stack",
  "props": {
    "direction": "vertical",
    "gap": "md"
  }
}
```

#### Grid
```json
{
  "type": "grid",
  "props": {
    "columns": 12,
    "gap": "md",
    "rowHeight": { "mode": "content" }
  }
}
```

Las celdas se representan como nodos hijos con metadata de grid:
```json
{
  "slot": "cell",
  "ref": "node_search",
  "grid": { "colSpan": 8, "rowSpan": 1, "align": "start" }
}
```

#### Split
```json
{
  "type": "split",
  "props": {
    "sidebarWidth": 260,
    "gap": "md",
    "leftMinWidth": 220,
    "rightMinWidth": 640
  }
}
```

Los hijos se ubican en slots `left` y `right`.

---

### 13.5 Componentes (wireframe)
Un componente se representa como:

```json
{
  "id": "cmp_heading_users",
  "kind": "component",
  "componentType": "Heading",
  "props": { "text": "Users" },
  "events": []
}
```

Eventos declarativos:
```json
{
  "event": "onClick",
  "action": { "type": "goto", "targetScreenId": "UserCreate" }
}
```

---

### 13.6 Ejemplo completo (UsersList)

```json
{
  "irVersion": "1.0",
  "project": {
    "id": "proj_admin_dashboard",
    "name": "Admin Dashboard",
    "tokens": {
      "density": "normal",
      "spacing": "md",
      "radius": "md",
      "stroke": "normal",
      "font": "base"
    },
    "screens": [
      {
        "id": "UsersList",
        "name": "Users List",
        "viewport": { "width": 1280, "height": 720 },
        "root": { "ref": "node_users_root" }
      },
      {
        "id": "UserDetail",
        "name": "User Detail",
        "viewport": { "width": 1280, "height": 720 },
        "root": { "ref": "node_userdetail_root" }
      },
      {
        "id": "UserCreate",
        "name": "Create User",
        "viewport": { "width": 1280, "height": 720 },
        "root": { "ref": "node_usercreate_root" }
      }
    ],
    "nodes": {
      "node_users_root": {
        "id": "node_users_root",
        "kind": "container",
        "layout": { "type": "split", "props": { "sidebarWidth": 260, "gap": "md" } },
        "children": [
          { "slot": "left", "ref": "node_users_sidebar" },
          { "slot": "right", "ref": "node_users_main" }
        ]
      },

      "node_users_sidebar": {
        "id": "node_users_sidebar",
        "kind": "container",
        "layout": { "type": "stack", "props": { "direction": "vertical", "gap": "sm" } },
        "style": { "padding": "md" },
        "children": [
          { "slot": "child", "ref": "cmp_sidebar_menu" }
        ]
      },

      "node_users_main": {
        "id": "node_users_main",
        "kind": "container",
        "layout": { "type": "stack", "props": { "direction": "vertical", "gap": "md" } },
        "style": { "padding": "lg" },
        "children": [
          { "slot": "child", "ref": "cmp_heading_users" },
          { "slot": "child", "ref": "node_users_actions_grid" },
          { "slot": "child", "ref": "cmp_users_table" }
        ]
      },

      "node_users_actions_grid": {
        "id": "node_users_actions_grid",
        "kind": "container",
        "layout": { "type": "grid", "props": { "columns": 12, "gap": "md" } },
        "children": [
          { "slot": "cell", "ref": "cmp_user_search", "grid": { "colSpan": 8 } },
          { "slot": "cell", "ref": "cmp_create_user", "grid": { "colSpan": 4, "align": "end" } }
        ]
      },

      "cmp_sidebar_menu": {
        "id": "cmp_sidebar_menu",
        "kind": "component",
        "componentType": "SidebarMenu",
        "props": {
          "items": [
            { "label": "Users", "active": true, "action": { "type": "goto", "targetScreenId": "UsersList" } },
            { "label": "Roles", "active": false },
            { "label": "Permissions", "active": false },
            { "label": "Audit", "active": false }
          ]
        }
      },

      "cmp_heading_users": {
        "id": "cmp_heading_users",
        "kind": "component",
        "componentType": "Heading",
        "props": { "text": "Users" }
      },

      "cmp_user_search": {
        "id": "cmp_user_search",
        "kind": "component",
        "componentType": "Input",
        "props": { "label": "Search user", "placeholder": "name, email..." }
      },

      "cmp_create_user": {
        "id": "cmp_create_user",
        "kind": "component",
        "componentType": "Button",
        "props": { "text": "Create user", "variant": "primary" },
        "events": [
          { "event": "onClick", "action": { "type": "goto", "targetScreenId": "UserCreate" } }
        ]
      },

      "cmp_users_table": {
        "id": "cmp_users_table",
        "kind": "component",
        "componentType": "Table",
        "props": {
          "columns": ["Name", "Email", "Status", "Role"],
          "rowsMock": 8
        },
        "events": [
          { "event": "onRowClick", "action": { "type": "goto", "targetScreenId": "UserDetail" } }
        ]
      },

      "node_userdetail_root": {
        "id": "node_userdetail_root",
        "kind": "container",
        "layout": { "type": "stack", "props": { "direction": "vertical", "gap": "md" } },
        "style": { "padding": "lg" },
        "children": [
          { "slot": "child", "ref": "cmp_breadcrumbs" },
          { "slot": "child", "ref": "node_detail_grid" },
          { "slot": "child", "ref": "cmp_tabs" },
          { "slot": "child", "ref": "cmp_panel_content" }
        ]
      },

      "cmp_breadcrumbs": {
        "id": "cmp_breadcrumbs",
        "kind": "component",
        "componentType": "Breadcrumbs",
        "props": { "items": ["Users", "User detail"] }
      },

      "node_detail_grid": {
        "id": "node_detail_grid",
        "kind": "container",
        "layout": { "type": "grid", "props": { "columns": 12, "gap": "md" } },
        "children": [
          { "slot": "cell", "ref": "cmp_panel_profile", "grid": { "colSpan": 8 } },
          { "slot": "cell", "ref": "cmp_panel_actions", "grid": { "colSpan": 4 } }
        ]
      },

      "cmp_panel_profile": {
        "id": "cmp_panel_profile",
        "kind": "component",
        "componentType": "Panel",
        "props": { "title": "Profile", "height": { "mode": "fixed", "value": 240 } }
      },

      "cmp_panel_actions": {
        "id": "cmp_panel_actions",
        "kind": "component",
        "componentType": "Panel",
        "props": { "title": "Actions", "height": { "mode": "fixed", "value": 240 } }
      },

      "cmp_tabs": {
        "id": "cmp_tabs",
        "kind": "component",
        "componentType": "Tabs",
        "props": { "items": ["Permissions", "Sessions", "Audit log"], "activeIndex": 0 }
      },

      "cmp_panel_content": {
        "id": "cmp_panel_content",
        "kind": "component",
        "componentType": "Panel",
        "props": { "title": "Content", "height": { "mode": "fixed", "value": 320 } }
      },

      "node_usercreate_root": {
        "id": "node_usercreate_root",
        "kind": "container",
        "layout": { "type": "stack", "props": { "direction": "vertical", "gap": "md" } },
        "style": { "padding": "lg" },
        "children": [
          { "slot": "child", "ref": "cmp_heading_create" },
          { "slot": "child", "ref": "cmp_panel_form" }
        ]
      },

      "cmp_heading_create": {
        "id": "cmp_heading_create",
        "kind": "component",
        "componentType": "Heading",
        "props": { "text": "Create User" }
      },

      "cmp_panel_form": {
        "id": "cmp_panel_form",
        "kind": "component",
        "componentType": "Panel",
        "props": { "title": "User Form", "height": { "mode": "fixed", "value": 420 } }
      }
    }
  }
}
```

---

## 14. Reglas del Layout Engine

### 14.1 Reglas generales
- El layout engine recibe:
  - `viewport` (tamaño de pantalla)
  - `root node`
  - `tokens` (gap/padding base)
- Produce un Render Tree con:
  - `x, y, width, height` por nodo

El layout es **de arriba hacia abajo** (top‑down), propagando constraints a hijos.

---

### 14.2 Stack (vertical/horizontal)
- Dirección `vertical`:
  - Los hijos se apilan en Y.
  - El `gap` se aplica entre hijos.
  - El ancho por defecto es `fill`.
  - La altura es suma de alturas de hijos + gaps + padding.

- Dirección `horizontal`:
  - Los hijos se apilan en X.
  - Similar a vertical, pero en eje X.

Regla recomendada:
- Si un hijo tiene `height: fill` en un stack vertical, ocupa el remanente.

---

### 14.3 Grid (12 columnas)
- El contenedor se divide en `columns` (default 12).
- Cada celda declara `colSpan` (default 12).
- Se ubican de izquierda a derecha; si no cabe, baja de fila.
- El ancho de celda = `(containerWidth - gap*(columns-1)) / columns`.
- El alto de fila:
  - `content`: máximo alto de los items de esa fila
  - `fixed`: alto definido

---

### 14.4 Split (sidebar + main)
- Slot `left` tiene ancho fijo `sidebarWidth`.
- Slot `right` ocupa el resto.
- `gap` separa ambas regiones.
- Respeta `leftMinWidth` y `rightMinWidth`.

---

## 15. Siguiente paso
- Diseñar el **DSL final** y mapearlo 1:1 al IR.
- Implementar un renderer web mínimo usando IR como input.
- Agregar CLI `validate` + `build`.

