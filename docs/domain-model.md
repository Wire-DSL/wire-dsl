# Modelo de Dominio

## Conceptos Principales

### Project

Contenedor de nivel superior que agrupa todas las pantallas y configuración.

**Propiedades**:

- `id`: Identificador único del proyecto
- `name`: Nombre legible del proyecto
- `tokens`: Configuración global de tokens de estilo
- `screens[]`: Array de pantallas del proyecto
- `nodes{}`: Diccionario de todos los nodos (containers y components)

---

### Screen

Representa una pantalla/vista individual del prototipo.

**Propiedades**:

- `id`: Identificador único (usado para navegación)
- `name`: Nombre legible
- `viewport`: Dimensiones de la pantalla (`{ width, height }`)
- `root`: Referencia al nodo raíz del layout

**Relaciones**:

- Pertenece a un `Project`
- Tiene un nodo raíz (container)
- Puede ser referenciada por eventos de navegación

---

### Node

Clase base abstracta para todos los elementos del árbol de UI.

Subtipos:

- **ContainerNode**: Nodos con layout (organizan hijos)
- **ComponentNode**: Componentes visuales (widgets)

**Propiedades comunes**:

- `id`: Identificador único
- `kind`: `"container"` | `"component"`
- `style`: Estilos aplicados (opcional)
- `meta`: Metadata para tooling (opcional)

---

### ContainerNode

Nodo que contiene un layout y organiza hijos.

**Propiedades**:

- Hereda de `Node`
- `layout`: Configuración del layout (`type` + `props`)
- `children[]`: Array de referencias a nodos hijos

**Tipos de layout**:

- `stack`: Apila elementos vertical u horizontalmente
- `grid`: Organiza en grilla de columnas
- `split`: Divide en dos paneles (sidebar + main)

---

### ComponentNode

Nodo que representa un componente wireframe.

**Propiedades**:

- Hereda de `Node`
- `componentType`: Tipo de componente (ej: `"Button"`, `"Table"`)
- `props`: Propiedades específicas del componente
- `events[]`: Array de eventos declarativos

---

### Layout

Configuración de cómo se organizan los hijos de un container.

**Estructura**:

```json
{
  "type": "stack" | "grid" | "split",
  "props": { ... }
}
```

**Props según tipo**:

**Stack**:

- `direction`: `"vertical"` | `"horizontal"`
- `gap`: Token de spacing
- `align`: `"start"` | `"center"` | `"end"`

**Grid**:

- `columns`: Número de columnas
- `gap`: Token de spacing
- `rowHeight`: Size object

**Split**:

- `sidebarWidth`: Ancho del panel izquierdo (px)
- `gap`: Token de spacing
- `leftMinWidth`: Ancho mínimo izquierdo
- `rightMinWidth`: Ancho mínimo derecho

---

### Style

Propiedades de estilo aplicables a nodos.

**Propiedades**:

- `padding`: Token de spacing (relleno interno)
- `gap`: Token de spacing (espacio entre hijos)
- `align`: Alineación horizontal
- `justify`: Justificación vertical
- `width`: Size object
- `height`: Size object

---

### Size

Especificación de dimensiones flexible.

**Modos**:

**Fixed** (Fijo):

```json
{ "mode": "fixed", "value": 240 }
```

**Fill** (Llenar):

```json
{ "mode": "fill" }
```

**Content** (Ajustar al contenido):

```json
{ "mode": "content" }
```

**Percent** (Porcentaje):

```json
{ "mode": "percent", "value": 50 }
```

---

### Event

Interacción declarativa asociada a un componente.

**Estructura**:

```json
{
  "event": "onClick" | "onRowClick" | ...,
  "action": { ... }
}
```

**Tipos de eventos**:

- `onClick`: Click en elemento
- `onRowClick`: Click en fila de tabla
- (Futuro: `onSubmit`, `onChange`, etc.)

---

### Action

Acción a ejecutar cuando se dispara un evento.

**Tipos**:

**Goto** (Navegación):

```json
{
  "type": "goto",
  "targetScreenId": "UserDetail"
}
```

Futuras acciones:

- `openModal`
- `showToast`
- `submitForm`

---

### Tokens

Valores predefinidos para consistencia visual.

**Propiedades**:

- `density`: `"compact"` | `"normal"` | `"comfortable"`
- `spacing`: Token base (`"xs"` ... `"xl"`)
- `radius`: `"none"` | `"sm"` | `"md"` | `"lg"`
- `stroke`: `"thin"` | `"normal"`
- `font`: `"base"` | `"title"` | `"mono"`

Ver [specs/tokens.md](../specs/tokens.md) para valores concretos.

---

## Relaciones

```
Project
  ├─ tokens: Tokens
  ├─ screens[]: Screen[]
  └─ nodes: { [id]: Node }

Screen
  ├─ viewport: Viewport
  └─ root: ref → ContainerNode

ContainerNode (extends Node)
  ├─ layout: Layout
  └─ children[]: NodeRef[]

ComponentNode (extends Node)
  ├─ componentType: string
  ├─ props: object
  └─ events[]: Event[]

NodeRef
  ├─ slot: string
  ├─ ref: string (node id)
  └─ grid?: GridMetadata (solo para grids)
```

---

## Flujo de Transformación

### DSL → AST

El parser lee el DSL y genera un **AST** (Abstract Syntax Tree) que representa exactamente lo que el usuario escribió.

**Características del AST**:

- Preserva ubicaciones (línea/columna)
- No aplica defaults
- Representa la sintaxis tal cual

---

### AST → IR

El normalizador transforma el AST en **IR** (Intermediate Representation).

**Transformaciones**:

- Aplicar defaults (ej: `direction: "vertical"` si no se especifica)
- Normalizar valores (tokens, sizes)
- Generar IDs únicos para nodos
- Validar semántica
- Convertir estructura anidada en diccionario de nodos

---

### IR → Render Tree

El layout engine toma el IR y calcula posiciones y dimensiones.

**Output**:

```json
{
  "id": "node_1",
  "x": 0,
  "y": 0,
  "width": 1280,
  "height": 720,
  "children": [{ "id": "node_2", "x": 24, "y": 24, "width": 1232, "height": 40 }]
}
```

---

## Invariantes

### Validación de Integridad

1. **IDs únicos**: Todos los nodos tienen IDs únicos en el proyecto
2. **Referencias válidas**: Todas las `ref` apuntan a nodos existentes
3. **No ciclos**: No puede haber referencias circulares
4. **Screen alcanzables**: Todas las screens son alcanzables (vía navegación o como root)
5. **Layout válido**: Cada container tiene un layout válido según su tipo
6. **Props requeridas**: Componentes tienen todas las props requeridas

---

## Extensibilidad

### Nuevos Layouts

Para agregar un nuevo tipo de layout:

1. Definir `LayoutProps` específicas
2. Implementar algoritmo en Layout Engine
3. Agregar validaciones
4. Documentar comportamiento

---

### Nuevos Componentes

Para agregar un nuevo componente:

1. Definir en `ComponentType` enum
2. Especificar `Props` interface
3. Definir dimensiones intrínsecas
4. Implementar renderer
5. Agregar a documentación

---

### Nuevas Acciones

Para agregar un nuevo tipo de acción:

1. Definir `ActionType`
2. Especificar parámetros
3. Implementar handler en interaction layer
4. Documentar comportamiento

---

## Ejemplos de Uso

### Crear un Proyecto (Programáticamente)

```typescript
const project: Project = {
  id: "proj_example",
  name: "Example App",
  tokens: {
    density: "normal",
    spacing: "md",
    radius: "md",
    stroke: "normal",
    font: "base",
  },
  screens: [
    {
      id: "Home",
      name: "Home Screen",
      viewport: { width: 1280, height: 720 },
      root: { ref: "node_home_root" },
    },
  ],
  nodes: {
    node_home_root: {
      id: "node_home_root",
      kind: "container",
      layout: {
        type: "stack",
        props: { direction: "vertical", gap: "md" },
      },
      children: [{ slot: "child", ref: "cmp_heading" }],
    },
    cmp_heading: {
      id: "cmp_heading",
      kind: "component",
      componentType: "Heading",
      props: { text: "Welcome" },
    },
  },
};
```

---

### Navegar entre Screens

```typescript
// En el componente:
{
  "componentType": "Button",
  "props": { "text": "Go to Dashboard" },
  "events": [
    {
      "event": "onClick",
      "action": {
        "type": "goto",
        "targetScreenId": "Dashboard"
      }
    }
  ]
}
```

El interaction layer maneja la transición entre screens.

---

## TypeScript Interfaces (Propuestas)

```typescript
// Core types
interface Project {
  id: string;
  name: string;
  tokens: Tokens;
  screens: Screen[];
  nodes: Record<string, Node>;
}

interface Screen {
  id: string;
  name: string;
  viewport: Viewport;
  root: NodeRef;
}

interface Viewport {
  width: number;
  height: number;
}

type Node = ContainerNode | ComponentNode;

interface BaseNode {
  id: string;
  kind: "container" | "component";
  style?: Style;
  meta?: Record<string, any>;
}

interface ContainerNode extends BaseNode {
  kind: "container";
  layout: Layout;
  children: ChildRef[];
}

interface ComponentNode extends BaseNode {
  kind: "component";
  componentType: ComponentType;
  props: Record<string, any>;
  events?: Event[];
}

interface Layout {
  type: "stack" | "grid" | "split";
  props: LayoutProps;
}

type LayoutProps = StackProps | GridProps | SplitProps;

interface StackProps {
  direction: "vertical" | "horizontal";
  gap: SpacingToken;
  align?: Align;
}

interface GridProps {
  columns: number;
  gap: SpacingToken;
  rowHeight?: Size;
}

interface SplitProps {
  sidebarWidth: number;
  gap: SpacingToken;
  leftMinWidth?: number;
  rightMinWidth?: number;
}

interface ChildRef {
  slot: string;
  ref: string;
  grid?: GridMetadata;
}

interface GridMetadata {
  colSpan: number;
  rowSpan?: number;
  align?: Align;
}

interface Style {
  padding?: SpacingToken;
  gap?: SpacingToken;
  align?: Align;
  justify?: Justify;
  width?: Size;
  height?: Size;
}

interface Size {
  mode: "fixed" | "fill" | "content" | "percent";
  value?: number;
}

interface Event {
  event: EventType;
  action: Action;
}

type EventType = "onClick" | "onRowClick";

interface Action {
  type: "goto";
  targetScreenId: string;
}

interface Tokens {
  density: Density;
  spacing: SpacingToken;
  radius: RadiusToken;
  stroke: StrokeToken;
  font: FontToken;
}

type Density = "compact" | "normal" | "comfortable";
type SpacingToken = "xs" | "sm" | "md" | "lg" | "xl";
type RadiusToken = "none" | "sm" | "md" | "lg";
type StrokeToken = "thin" | "normal";
type FontToken = "base" | "title" | "mono";
type Align = "start" | "center" | "end";
type Justify = "start" | "center" | "end";

type ComponentType =
  | "Heading"
  | "Text"
  | "Input"
  | "Textarea"
  | "Select"
  | "Button"
  | "IconButton"
  | "SidebarMenu"
  | "Topbar"
  | "Breadcrumbs"
  | "Tabs"
  | "Table"
  | "List"
  | "Panel"
  | "Card"
  | "Divider"
  | "ChartPlaceholder";
```
