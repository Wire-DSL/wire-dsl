# Sintaxis del DSL WireDSL

## Estructura General

```
project "Nombre del Proyecto" {
  tokens <configuración>

  screen NombrePantalla {
    layout <tipo> {
      // contenido
    }
  }
}
```

## Bloques Principales

### Project

Define el proyecto completo.

```
project "Admin Dashboard" {
  tokens density: normal

  screen UsersList { ... }
  screen UserDetail { ... }
}
```

**Propiedades**:

- `name`: Nombre del proyecto (string)
- `tokens`: Configuración de tokens de diseño

---

### Screen

Define una pantalla/vista del prototipo.

```
screen UsersList {
  layout split(sidebar: 260, gap: md) {
    layout stack { ... }  // sidebar
    layout stack { ... }  // contenido principal
  }
}
```

**Nota**: El `split` contiene dos layouts anidados SIN etiquetas `left:` ni `right:`. El primero es el sidebar, el segundo es el contenido.

**Propiedades**:

- `id`: Identificador único (derivado del nombre)
- Debe contener exactamente un layout raíz

---

### Layout

Contenedores para organizar componentes.

#### Stack (Vertical/Horizontal)

Apila elementos en una dirección.

```
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "Title"
  component Button text: "Action"
}
```

**Propiedades**:

- `direction`: `vertical` (default) | `horizontal`
- `gap`: espaciado entre elementos (`xs`=4px, `sm`=8px, `md`=16px, `lg`=24px, `xl`=32px)
- `padding`: relleno interno (`xs`/`sm`/`md`/`lg`/`xl` o `none`=0px; **default: none si no se especifica**)
- `align`: alineación (`start`/`center`/`end`)

**⚠️ Nota sobre padding**:

- Los layouts sin `padding` explícito tienen **0px de padding por defecto** (no heredan del proyecto)
- Especifica `padding: md` o `padding: lg` si quieres márgenes internos
- Evita acumular padding en layouts anidados; aplica solo en el nivel superior

#### Grid

Sistema de grillas de 12 columnas.

```
layout grid(columns: 12, gap: md) {
  cell span: 8 {
    component Input label: "Search"
  }
  cell span: 4 align: end {
    component Button text: "Create"
  }
}
```

**Propiedades**:

- `columns`: número de columnas (default: 12)
- `gap`: espaciado entre celdas
- **Cell properties**:
  - `span`: columnas que ocupa (default: 12)
  - `align`: alineación dentro de la celda

**⚠️ Nota sobre cells**: Las cells tienen **0px de padding por defecto**. El `gap` del grid maneja la separación entre columnas. No intentes agregar padding a las cells.

#### Split

Divide en dos paneles (sidebar + contenido principal).

```
layout split(sidebar: 260, gap: md) {
  layout stack {
    component SidebarMenu items: [...]
  }

  layout stack {
    // contenido principal
  }
}
```

**⚠️ Importante**: NO usar `left:` ni `right:`. Son simplemente dos layouts anidados consecutivos.

**Propiedades**:

- `sidebar`: ancho del panel izquierdo (px)
- `gap`: espaciado entre paneles

---

### Component

Elementos wireframe individuales.

```
component <Tipo> <propiedades>
```

**Sintaxis de propiedades**:

```
component Button text: "Click me" variant: primary onClick: goto("NextScreen")
```

---

## Componentes Disponibles

### Texto

```
component Heading text: "Title"
component Text content: "Lorem ipsum..."
```

### Inputs

```
component Input label: "Username" placeholder: "Enter name..."
component Textarea label: "Description" rows: 4
component Select label: "Role" options: ["Admin", "User"]
```

### Botones

```
component Button text: "Save" variant: primary
component IconButton icon: "search"
```

### Navegación

```
component SidebarMenu items: ["Users", "Roles", "Settings"]
component Topbar title: "Dashboard"
component Breadcrumbs items: ["Home", "Users", "Detail"]
component Tabs items: ["Profile", "Settings", "Logs"]
```

### Datos

```
component Table
  columns: ["Name", "Email", "Status"]
  rowsMock: 8
  onRowClick: goto("UserDetail")

component List items: ["Item 1", "Item 2", "Item 3"]
```

### Contenedores

```
component Panel title: "User Info" height: 240
component Card title: "Stats"
```

### Otros

```
component Divider
component ChartPlaceholder type: "bar" height: 200
```

---

## Tokens

Valores predefinidos para consistencia visual.

```
project "MyApp" {
  tokens density: normal
  tokens spacing: md
  tokens radius: md
  tokens stroke: normal
  tokens font: base
}
```

### Spacing

- `xs`: 4px
- `sm`: 8px
- `md`: 16px (default)
- `lg`: 24px
- `xl`: 32px

### Radius

- `none`: 0
- `sm`: 2px
- `md`: 4px (default)
- `lg`: 8px

### Density

- `compact`: UI compacta
- `normal`: estándar (default)
- `comfortable`: espaciosa

### Stroke

- `thin`: bordes finos
- `normal`: estándar (default)

### Font

- `base`: fuente estándar
- `title`: fuente para títulos
- `mono`: monoespaciada

---

## Eventos e Interacciones

### Navegación

```
component Button
  text: "View details"
  onClick: goto("UserDetail")

component Table
  columns: ["Name", "Email"]
  onRowClick: goto("UserDetail")
```

### Tipos de eventos

- `onClick`: click en un elemento
- `onRowClick`: click en fila de tabla
- (Futuro: `onSubmit`, `onChange`, etc.)

### Acciones

- `goto("ScreenId")`: navega a otra pantalla

---

## Ejemplo Completo

```
project "Admin Dashboard" {
  tokens density: normal

  screen UsersList {
    layout split(sidebar: 260, gap: md) {
      layout stack(gap: lg, padding: lg) {
        component SidebarMenu items: ["Users", "Roles", "Permissions", "Audit"]
      }

      layout stack(gap: md, padding: lg) {
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

  screen UserDetail {
    layout stack(gap: md, padding: lg) {
      component Breadcrumbs items: ["Users", "User detail"]

      layout grid(columns: 12, gap: md) {
        cell span: 8 {
          component Panel title: "Profile" height: 240
        }
        cell span: 4 {
          component Panel title: "Actions" height: 240
        }
      }

      component Tabs items: ["Permissions", "Sessions", "Audit log"]
      component Panel title: "Content" height: 320
    }
  }

  screen UserCreate {
    layout stack(gap: md, padding: lg) {
      component Heading text: "Create User"
      component Panel title: "User Form" height: 420
    }
  }
}
```

---

## Reglas de Validación

1. Un `project` debe tener al menos una `screen`
2. Cada `screen` debe tener exactamente un layout raíz
3. Los layouts `grid` requieren la propiedad `columns`
4. Los layouts `split` requieren la propiedad `sidebar`
5. Los componentes `Table` requieren `columns`
6. Las referencias de `goto()` deben apuntar a screens existentes
7. Los identificadores de screen deben ser únicos
8. No se permiten posiciones absolutas (salvo configuración especial)
