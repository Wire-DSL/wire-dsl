# Guía para LLM: generar archivos `.wire`

Documento único para que un LLM genere wireframes válidos desde texto o imagen. Responde **solo** con código `.wire`, sin explicaciones.

## Instrucciones al modelo

- Genera exclusivamente un bloque `.wire` válido.
- Si falta información, usa defaults seguros (gap: md, padding: md, columns: 12, density: normal).
- Un solo layout raíz por `screen`. Nombres de `screen` en CamelCase.
- Prefiere tokens a valores numéricos; usa números solo donde la DSL lo exige (`sidebar`, alturas explícitas).
- No inventes props no listadas aquí.

## Sintaxis mínima

```wire
project "Nombre" {
  tokens density: normal
  tokens spacing: md

  screen ScreenName {
    layout <stack|grid|split>(...) {
      // contenido
    }
  }
}
```

⚠️ **Importante**: Cada `tokens` debe estar en su propia línea. No agrupes en una sola línea.

## Tokens (usar por defecto)

- spacing: xs=4, sm=8, md=16 (default), lg=24, xl=32
- density: compact | normal (default) | comfortable
- radius: none | sm | md (default) | lg
- stroke: thin | normal (default)

## Layouts y reglas

- **stack(direction: vertical|horizontal, gap, padding, align)**
  - Hijos en orden; ancho fill por defecto; altura = suma de hijos + gaps + padding.
- **grid(columns, gap)** con `cell span: N { ... }`
  - `span` entre 1 y `columns` (default 12). Salta a nueva fila si no cabe.
- **split(sidebar, gap)**
  - Divide en dos paneles: sidebar (izquierdo, ancho fijo) y contenido (derecho, fill).
  - Contiene dos layouts anidados sin etiquetas: el primero es el sidebar, el segundo es el contenido.
  - ⚠️ NO usar `left:` ni `right:` (eso es incorrecto).
  - `sidebar` es ancho fijo en px (ej: 240, 260).

## Catálogo de componentes (props, tipos, defaults, ejemplo)

- **Heading**: `text` (string, req). Ej: `component Heading text: "Users"`
- **Text**: `content` (string, req). Ej: `component Text content: "Lorem ipsum"`
- **Input**: `label?` (string), `placeholder?` (string). Ej: `component Input label: "Email" placeholder: "user@example.com"`
- **Textarea**: `label?` (string), `placeholder?` (string), `rows?` (number, default 4). Ej: `component Textarea label: "Bio" rows: 4`
- **Select**: `label?` (string), `options?` (array/CSV), `placeholder?` (string). Ej: `component Select label: "Role" options: "Admin,User"`
- **Button**: `text` (string, req), `variant?` (primary|secondary|ghost, default secondary), `onClick?` (goto("Screen")). Ej: `component Button text: "Save" variant: primary`
- **IconButton**: `icon` (string, req). Ej: `component IconButton icon: "search"`
- **SidebarMenu**: `items` (array de strings u objetos `{label, active?, action?}`). Ej: `component SidebarMenu items: "Home,Users,Settings"`
- **Topbar**: `title?` (string). Ej: `component Topbar title: "Dashboard"`
- **Breadcrumbs**: `items` (array/CSV, req). Ej: `component Breadcrumbs items: "Home,Users,Detail"`
- **Tabs**: `items` (array/CSV, req), `activeIndex?` (number, default 0). Ej: `component Tabs items: "Profile,Settings" activeIndex: 1`
- **Table**: `columns` (array/CSV, req), `rowsMock?` (number, default 5), `rowHeight?` (number, default 40), `onRowClick?` (goto("Screen")). Ej: `component Table columns: "Name,Email,Status" rowsMock: 6`
- **List**: `items` (array/CSV, req). Ej: `component List items: "Item 1,Item 2,Item 3"`
- **Panel**: `title?` (string), `height?` (number px). Ej: `component Panel title: "User Info" height: 240`
- **Card**: `title?` (string). Ej: `component Card title: "Stats"`
- **Divider**: sin props. Ej: `component Divider`
- **ChartPlaceholder**: `type?` (bar|line|pie, default bar), `height?` (number, default 200). Ej: `component ChartPlaceholder type: "bar" height: 200`
- **Alert**: `title?` (string), `message?` (string). Ej: `component Alert title: "Notice" message: "Pending"`

## Validaciones clave

- 1 `layout` raíz por `screen`.
- `cell span` ≤ `columns`.
- `split` requiere `sidebar` (en px) y contiene dos layouts anidados (sin `left:` ni `right:`).
- Props requeridas presentes; strings entre comillas si llevan espacios.
- Eventos `goto("ScreenId")` deben referir a screens existentes si se usa navegación.

## Mapeo desde imagen o prompt

1. Identifica macroestructura: ¿sidebar + contenido? → `split`. ¿Secciones apiladas? → `stack vertical`. ¿Cards/formulario en dos columnas? → `grid` con spans.
2. Asigna spans aproximando anchos relativos: 2/3 → span 8 de 12; 1/3 → span 4 de 12.
3. Componentiza:
   - Barra superior → `Topbar` o `stack` con `Heading` + botones.
   - Sidebar → `SidebarMenu items:"A,B,C"`.
   - Cards/estadísticas → `Card title:""` o `Panel title:""`.
   - Formularios → `grid` con `Input`/`Select`/`Textarea`; usa `stack` si es una sola columna.
   - Tablas → `Table columns:"A,B,C" rows: N`.
   - Alertas/banners → `Alert title:"" message:""`.
4. Usa tokens (`gap: md`, `padding: lg`) antes que números; números solo para `sidebar` y `height` explícito cuando sea evidente.

## Defaults recomendados

- `tokens` en líneas separadas (una por línea):
  ```
  tokens density: normal
  tokens spacing: md
  ```
- `layout stack(direction: vertical, gap: md, padding: lg)` para columnas únicas.
- `grid(columns: 12, gap: md)` con spans 8/4 o 6/6 para dos columnas.
- `rowsMock: 5..8` si no se especifica tamaño de tabla.

## Plantilla de respuesta (obligatorio, solo código)

```wire
project "App" {
  tokens density: normal
  tokens spacing: md

  screen Home {
    layout stack(direction: vertical, gap: md, padding: lg) {
      component Topbar title: "Home"
      layout grid(columns: 12, gap: md) {
        cell span: 8 {
          component Table columns: "Name,Email,Status" rowsMock: 6
        }
        cell span: 4 {
          component Card title: "Stats"
        }
      }
    }
  }
}
```

## Few-shot (texto → wire)

### 1) Dashboard con sidebar, topbar y tabla

Entrada: "Dashboard con menú lateral, topbar con título, tabla principal y panel de métricas a la derecha"

```wire
project "Dashboard" {
  tokens density: normal
  tokens spacing: md

  screen Home {
    layout split(sidebar: 240, gap: md) {
      layout stack(direction: vertical, gap: lg, padding: lg) {
        component SidebarMenu items: "Home,Users,Settings"
      }

      layout stack(direction: vertical, gap: md, padding: lg) {
        component Topbar title: "Home"
        layout grid(columns: 12, gap: md) {
          cell span: 8 {
            component Table columns: "Name,Email,Status,Role" rowsMock: 8
          }
          cell span: 4 {
            component Card title: "Stats"
          }
        }
      }
    }
  }
}
```

### 2) Formulario en 2 columnas

Entrada: "Formulario de usuario con nombre, email, rol y bio en dos columnas"

```wire
project "User Form" {
  tokens density: normal
  tokens spacing: md

  screen UserForm {
    layout stack(direction: vertical, gap: md, padding: lg) {
      component Heading text: "User"
      layout grid(columns: 12, gap: md) {
        cell span: 6 {
          component Input label: "Name" placeholder: "Full name"
        }
        cell span: 6 {
          component Input label: "Email" placeholder: "user@example.com"
        }
        cell span: 6 {
          component Select label: "Role" options: "Admin,Editor,Viewer"
        }
        cell span: 6 {
          component Input label: "Status" placeholder: "Active"
        }
        cell span: 12 {
          component Textarea label: "Bio" rows: 4 placeholder: "Short bio..."
        }
      }
      component Button text: "Save" variant: primary
    }
  }
}
```

### 3) Vista con alert + tabs + tabla

Entrada: "Vista de detalle con alerta arriba, tabs y una tabla"

```wire
project "Detail" {
  tokens density: normal
  tokens spacing: md

  screen DetailView {
    layout stack(direction: vertical, gap: md, padding: lg) {
      component Alert title: "Notice" message: "Pending verification"
      component Tabs items: "Overview,Activity,Settings"
      component Table columns: "ID,Name,Status" rowsMock: 6
    }
  }
}
```

## Errores comunes a evitar

- Más de un layout raíz por pantalla.
- `cell span` fuera de rango o sin `columns` definido.
- `split` sin `sidebar` o sin `right`.
- Componentes sin props requeridas (p.ej., `Button` sin `text`, `Table` sin `columns`).
- Salida con texto extra; debe ser solo el bloque `.wire`.
