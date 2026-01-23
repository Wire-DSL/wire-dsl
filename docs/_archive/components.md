# Biblioteca de Componentes Wireframe

## Principio

Los componentes son **primitivas wireframe** low-fidelity, no componentes de producción.

**Regla de oro**: No hay lógica de negocio, solo representación visual.

---

## Categorías

1. **Texto**: Heading, Text
2. **Inputs**: Input, Textarea, Select
3. **Botones**: Button, IconButton
4. **Navegación**: SidebarMenu, Topbar, Breadcrumbs, Tabs
5. **Datos**: Table, List
6. **Contenedores**: Panel, Card
7. **Otros**: Divider, ChartPlaceholder

---

## Componentes de Texto

### Heading

**Propósito**: Títulos de sección.

**Props**:

- `text`: string (requerido)

**Representación**:

- Texto grande, bold
- Color: gris oscuro
- Tamaño: ~24-32px

**Ejemplo DSL**:

```
component Heading text: "Users"
```

**Ejemplo IR**:

```json
{
  "componentType": "Heading",
  "props": { "text": "Users" }
}
```

---

### Text

**Propósito**: Párrafo o bloque de texto.

**Props**:

- `content`: string (requerido)

**Representación**:

- Texto normal
- Color: gris medio
- Tamaño: ~14-16px

**Ejemplo DSL**:

```
component Text content: "Lorem ipsum dolor sit amet..."
```

---

## Componentes de Input

### Input

**Propósito**: Campo de texto de una línea.

**Props**:

- `label`: string (opcional)
- `placeholder`: string (opcional)

**Representación**:

- Caja con borde gris
- Label arriba (si existe)
- Placeholder en gris claro
- Altura: ~40px

**Ejemplo DSL**:

```
component Input label: "Username" placeholder: "Enter your name..."
```

**Ejemplo IR**:

```json
{
  "componentType": "Input",
  "props": {
    "label": "Username",
    "placeholder": "Enter your name..."
  }
}
```

---

### Textarea

**Propósito**: Campo de texto multilínea.

**Props**:

- `label`: string (opcional)
- `placeholder`: string (opcional)
- `rows`: number (default: 4)

**Representación**:

- Similar a Input, pero más alto
- Altura: `rows * rowHeight`

**Ejemplo DSL**:

```
component Textarea label: "Description" rows: 6
```

---

### Select

**Propósito**: Lista desplegable.

**Props**:

- `label`: string (opcional)
- `options`: string[] (opcional, solo visual)
- `placeholder`: string (opcional)

**Representación**:

- Caja con flecha hacia abajo
- Label arriba (si existe)
- Altura: ~40px

**Ejemplo DSL**:

```
component Select label: "Role" options: ["Admin", "User", "Guest"]
```

---

## Componentes de Botón

### Button

**Propósito**: Botón de acción.

**Props**:

- `text`: string (requerido)
- `variant`: `"primary"` | `"secondary"` | `"ghost"` (default: `"secondary"`)

**Representación**:

- Caja rectangular con bordes redondeados
- `primary`: fondo oscuro, texto claro
- `secondary`: borde, fondo claro
- `ghost`: sin borde, solo texto
- Altura: ~36px

**Ejemplo DSL**:

```
component Button text: "Save" variant: primary onClick: goto("Dashboard")
```

**Ejemplo IR**:

```json
{
  "componentType": "Button",
  "props": { "text": "Save", "variant": "primary" },
  "events": [{ "event": "onClick", "action": { "type": "goto", "targetScreenId": "Dashboard" } }]
}
```

---

### IconButton

**Propósito**: Botón con ícono (sin texto).

**Props**:

- `icon`: string (nombre del ícono)

**Representación**:

- Caja cuadrada pequeña
- Ícono centrado (placeholder)
- Tamaño: ~32x32px

**Ejemplo DSL**:

```
component IconButton icon: "search"
```

---

## Componentes de Navegación

### SidebarMenu

**Propósito**: Menú lateral de navegación.

**Props**:

- `items`: array de objetos o strings
  - Si es objeto: `{ label, active?, action? }`
  - Si es string: solo label

**Representación**:

- Lista vertical de items
- Item activo con fondo destacado
- Padding entre items

**Ejemplo DSL**:

```
component SidebarMenu items: ["Users", "Roles", "Settings"]
```

**Ejemplo IR**:

```json
{
  "componentType": "SidebarMenu",
  "props": {
    "items": [
      { "label": "Users", "active": true },
      { "label": "Roles", "active": false },
      { "label": "Settings", "active": false }
    ]
  }
}
```

---

### Topbar

**Propósito**: Barra superior de navegación.

**Props**:

- `title`: string (opcional)

**Representación**:

- Barra horizontal con fondo
- Título a la izquierda
- Altura: ~56px

**Ejemplo DSL**:

```
component Topbar title: "Dashboard"
```

---

### Breadcrumbs

**Propósito**: Ruta de navegación.

**Props**:

- `items`: string[] (requerido)

**Representación**:

- Items separados por "/"
- Último item en bold

**Ejemplo DSL**:

```
component Breadcrumbs items: ["Home", "Users", "Detail"]
```

**Ejemplo IR**:

```json
{
  "componentType": "Breadcrumbs",
  "props": {
    "items": ["Home", "Users", "Detail"]
  }
}
```

---

### Tabs

**Propósito**: Pestañas de navegación.

**Props**:

- `items`: string[] (requerido)
- `activeIndex`: number (default: 0)

**Representación**:

- Lista horizontal de pestañas
- Pestaña activa con subrayado
- Altura: ~40px

**Ejemplo DSL**:

```
component Tabs items: ["Profile", "Settings", "Logs"]
```

**Ejemplo IR**:

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

## Componentes de Datos

### Table

**Propósito**: Tabla de datos.

**Props**:

- `columns`: string[] (requerido)
- `rowsMock`: number (default: 5) - número de filas mock
- `rowHeight`: number (default: 40)

**Representación**:

- Header con nombres de columnas
- Filas con datos simulados (líneas grises)
- Altura total: `headerHeight + rowHeight * rowsMock`

**Eventos**:

- `onRowClick`: acción al hacer click en fila

**Ejemplo DSL**:

```
component Table
  columns: ["Name", "Email", "Status", "Role"]
  rowsMock: 8
  onRowClick: goto("UserDetail")
```

**Ejemplo IR**:

```json
{
  "componentType": "Table",
  "props": {
    "columns": ["Name", "Email", "Status", "Role"],
    "rowsMock": 8,
    "rowHeight": 40
  },
  "events": [{ "event": "onRowClick", "action": { "type": "goto", "targetScreenId": "UserDetail" } }]
}
```

---

### List

**Propósito**: Lista de items.

**Props**:

- `items`: string[] (requerido)

**Representación**:

- Lista vertical de items
- Cada item con padding
- Separador entre items

**Ejemplo DSL**:

```
component List items: ["Item 1", "Item 2", "Item 3"]
```

---

## Componentes de Contenedor


**Props**:

- `title`: string (opcional)
- `height`: Size object (opcional)

**Representación**:

- Caja con borde
- Título en header (si existe)
- Contenido simulado (líneas grises)

**Ejemplo DSL**:

```
component Panel title: "User Info" height: 240
```

**Ejemplo IR**:

```json
{
  "componentType": "Panel",
  "props": {
    "title": "User Info",
    "height": { "mode": "fixed", "value": 240 }
  }
}
```

**Renderizado**:

```
┌─────────────────────────┐
│ Panel background color  │
│  (con borde gris)       │
│                         │
│  padding                │
│  ┌───────────────────┐  │
│  │  Child (stack)    │  │
│  └───────────────────┘  │
│                         │
│  padding                │
└─────────────────────────┘
```

**Diferencias con el componente Panel**:

| Aspecto | Component Panel | Layout Panel |
| --- | --- | --- |
| Tipo | Componente wireframe | Contenedor layout |
| Hijos | Solo contenido simulado | Cualquier contenido real |
| Padding | Fijo | Configurable |
| Background | No | Sí, configurable |
| Uso | Mockups | Layouts reales |
| Status | Deprecado | ✨ Recomendado |

---

### Card

**Propósito**: Tarjeta simple.

**Props**:

- `title`: string (opcional)

**Representación**:

- Similar a Panel, más compacto
- Sombra sutil

**Ejemplo DSL**:

```
component Card title: "Stats"
```

---

## Otros Componentes

### Divider

**Propósito**: Separador visual.

**Props**: ninguna

**Representación**:

- Línea horizontal gris
- Altura: 1px

**Ejemplo DSL**:

```
component Divider
```

---

### ChartPlaceholder

**Propósito**: Placeholder para gráficos.

**Props**:

- `type`: `"bar"` | `"line"` | `"pie"` (default: `"bar"`)
- `height`: number (default: 200)

**Representación**:

- Caja con representación esquemática del tipo de gráfico
- Texto: "Chart (type)"

**Ejemplo DSL**:

```
component ChartPlaceholder type: "bar" height: 200
```

**Ejemplo IR**:

```json
{
  "componentType": "ChartPlaceholder",
  "props": {
    "type": "bar",
    "height": 200
  }
}
```

---

## Dimensiones Intrínsecas

Cuando un componente tiene `height: content`, se usan estos valores:

| Componente  | Altura                                        |
| ----------- | --------------------------------------------- |
| Heading     | 32px                                          |
| Text        | Depende del contenido                         |
| Input       | 40px                                          |
| Textarea    | `rows * 20px`                                 |
| Select      | 40px                                          |
| Button      | 36px                                          |
| IconButton  | 32px                                          |
| Topbar      | 56px                                          |
| Breadcrumbs | 24px                                          |
| Tabs        | 40px                                          |
| Table       | `headerHeight(40) + rowHeight(40) * rowsMock` |
| Divider     | 1px                                           |
| Panel       | Según prop `height`                           |
| Card        | `content`                                     |

---

## Extensibilidad

Futuros componentes:

- **Form**: grupo de inputs con layout automático
- **Modal**: overlay modal
- **Tooltip**: información contextual
- **Avatar**: imagen de usuario
- **Badge**: etiqueta/insignia
- **Stepper**: wizard de pasos

Cada componente nuevo debe:

1. Definir props claramente
2. Especificar dimensiones intrínsecas
3. Documentar eventos soportados
4. Mantener estilo wireframe (low-fidelity)
