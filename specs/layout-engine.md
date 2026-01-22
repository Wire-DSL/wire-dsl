# Layout Engine - Especificación

## Objetivo

El **Layout Engine** es responsable de calcular posiciones (`x`, `y`) y dimensiones (`width`, `height`) finales de todos los nodos, transformando el IR (con constraints declarativas) en un **Render Tree** con bounding boxes concretas.

---

## Input y Output

**Input**:

- `viewport`: dimensiones de la pantalla (`{ width, height }`)
- `root node`: nodo raíz del IR
- `tokens`: valores de spacing, padding, etc.

**Output**:

- **Render Tree**: árbol de nodos con propiedades calculadas:
  - `x`, `y`: posición absoluta
  - `width`, `height`: dimensiones finales
  - Referencia al nodo IR original

---

## Principios

### 1. Layout Top-Down

El layout se calcula de **arriba hacia abajo** (de padre a hijo):

- El padre determina el espacio disponible para los hijos
- Los hijos se dimensionan dentro de ese espacio

### 2. Constraints

Cada nodo puede especificar constraints:

- `width: fill` → ocupa todo el ancho disponible
- `height: content` → ajusta su altura al contenido
- `width: { mode: "fixed", value: 240 }` → ancho fijo

### 3. Espaciado

- `gap`: espacio entre elementos hijos
- `padding`: espacio interno del contenedor

---

## Layouts Soportados

### Stack Layout

#### Vertical Stack

```
┌─────────────────┐
│    Child 1      │
├─────────────────┤ ← gap
│    Child 2      │
├─────────────────┤ ← gap
│    Child 3      │
└─────────────────┘
```

**Reglas**:

- Los hijos se apilan en el eje Y
- El ancho por defecto es `fill` (ocupa todo el contenedor)
- La altura es la suma de alturas de hijos + gaps + padding
- Si un hijo tiene `height: fill`, ocupa el espacio remanente

**Algoritmo**:

1. Calcular espacio disponible: `containerHeight - padding*2`
2. Restar gaps: `availableHeight - gap*(numChildren-1)`
3. Para cada hijo:
   - Si `height: content` → calcular altura intrínseca
   - Si `height: fixed` → usar valor fijo
   - Si `height: fill` → distribuir espacio remanente
4. Posicionar hijos secuencialmente en Y

---

#### Horizontal Stack

```
┌────┬───┬────┬────┐
│ C1 │gap│ C2 │ C3 │
└────┴───┴────┴────┘
```

**Reglas**:

- Los hijos se apilan en el eje X
- La altura por defecto es `fill`
- El ancho es la suma de anchos de hijos + gaps + padding
- Si un hijo tiene `width: fill`, ocupa el espacio remanente

**Algoritmo**:
Similar a vertical, pero en eje X.

---

### Grid Layout

```
┌──────┬──────┬──────┬──────┐
│ C1 (span: 8)       │C2(4) │
├──────┴──────┴──────┼──────┤
│ C3 (span: 12)             │
└──────────────────────────┘
```

**Reglas**:

- Contenedor dividido en `columns` (default: 12)
- Cada celda declara `colSpan` (cuántas columnas ocupa)
- Se ubican de izquierda a derecha
- Si no caben en la fila actual, bajan a la siguiente

**Algoritmo**:

1. Calcular ancho de columna:

   ```
   columnWidth = (containerWidth - padding*2 - gap*(columns-1)) / columns
   ```

2. Para cada celda:
   - Calcular ancho: `cellWidth = columnWidth * colSpan + gap * (colSpan - 1)`
   - Si no cabe en fila actual → nueva fila
   - Posicionar en (x, y) calculado

3. Altura de fila:
   - `mode: content` → máximo alto de elementos en esa fila
   - `mode: fixed` → valor fijo

---

### Split Layout

```
┌─────────┬───┬──────────────┐
│         │gap│              │
│  Left   │   │    Right     │
│ Sidebar │   │     Main     │
│         │   │              │
└─────────┴───┴──────────────┘
```

**Reglas**:

- Divide en dos columnas: sidebar (ancho fijo) + contenido (fill)
- El ancho total es: `sidebarWidth + gap + remainingWidth`
- Ambos children deben ser layouts (stack, grid, etc.)

**Algoritmo**:

1. Left child width = `sidebar` (parámetro)
2. Right child width = `containerWidth - sidebarWidth - gap`
3. Ambos usan toda la altura disponible (height: fill)

---

### Panel Layout

```
┌────────────────────────┐
│ padding                │
│  ┌──────────────────┐  │
│  │   Single Child   │  │
│  │  (stack/grid)    │  │
│  └──────────────────┘  │
│ padding                │
└────────────────────────┘
```

**Propósito**: Contenedor especializado con un único hijo

**Reglas**:

- Acepta **exactamente un hijo** (validación en IR)
- Aplica padding automático en todos los lados
- El hijo ocupa todo el espacio disponible: `width: fill`, `height: fill`
- Renderiza con borde y fondo opcional

**Parámetros**:

- `padding`: `xs` | `sm` | `md` | `lg` | `xl` (tamaño del relleno)
- `background`: color de fondo (nombrado o hex)

**Algoritmo**:

1. Resolver padding a píxeles según token
2. Calcular espacio disponible: `containerW/H - padding*2`
3. Posicionar hijo a `(x + padding, y + padding)`
4. Asignar tamaño: `width: fill`, `height: fill` (respecto al espacio disponible)

**Ejemplo**:

```
layout panel(padding: md, background: lightGray) {
  component Text content: "Contenido"
}
```

Renderizado:
- Rectángulo de fondo lightGray (#F3F4F6)
- Borde gris 1px
- Text centrado con padding de 16px (md = 16px)

---



**Reglas**:

- Slot `left` tiene ancho fijo (`sidebarWidth`)
- Slot `right` ocupa el resto
- `gap` separa ambas regiones
- Respeta `leftMinWidth` y `rightMinWidth`

**Algoritmo**:

1. Calcular ancho izquierdo:

   ```
   leftWidth = max(sidebarWidth, leftMinWidth)
   ```

2. Calcular ancho derecho:

   ```
   rightWidth = max(containerWidth - leftWidth - gap, rightMinWidth)
   ```

3. Posicionar:
   - Left: `x=0, y=0, width=leftWidth, height=containerHeight`
   - Right: `x=leftWidth+gap, y=0, width=rightWidth, height=containerHeight`

---

## Cálculo de Dimensiones

### Width/Height Modes

#### `fill`

Ocupa todo el espacio disponible del contenedor.

```json
{ "mode": "fill" }
```

En stack vertical:

- `width: fill` → ancho del contenedor
- `height: fill` → reparte espacio remanente entre hijos con fill

---

#### `content`

Se ajusta al tamaño del contenido.

```json
{ "mode": "content" }
```

Para componentes:

- Se usa el tamaño intrínseco (calculado por el renderer)
- Tablas: altura = `rowHeight * numRows`
- Texto: depende del contenido y ancho disponible

---

#### `fixed`

Tamaño fijo en píxeles.

```json
{ "mode": "fixed", "value": 240 }
```

---

#### `percent`

Porcentaje del contenedor.

```json
{ "mode": "percent", "value": 50 }
```

---

## Manejo de Overflow

Si el contenido excede el espacio disponible:

- **Truncar**: aplicar overflow
- **Scroll**: activar scroll en el contenedor
- **Expand**: permitir que el contenedor crezca (solo en casos específicos)

Por defecto: scroll para contenedores, truncar para componentes.

---

## Espaciado (Spacing)

Los tokens de spacing se resuelven a valores concretos:

| Token | Valor |
| ----- | ----- |
| `xs`  | 4px   |
| `sm`  | 8px   |
| `md`  | 16px  |
| `lg`  | 24px  |
| `xl`  | 32px  |

Estos valores se aplican a:

- `gap`: espaciado entre elementos
- `padding`: relleno interno de contenedores

---

## Casos Especiales

### Componentes con altura intrínseca

Algunos componentes tienen altura natural:

- `Input`: ~40px
- `Button`: ~36px
- `Heading`: ~32px
- `Table`: `rowHeight * numRows + headerHeight`

Estos valores se usan cuando `height: content`.

---

### Distribución de espacio remanente

Si varios hijos tienen `width: fill` (o `height: fill`):

- El espacio remanente se distribuye **equitativamente**
- Futuro: permitir proporciones (flex-grow)

---

### Alineación

Dentro de contenedores:

- `align`: alineación horizontal (`start` | `center` | `end`)
- `justify`: justificación vertical (`start` | `center` | `end`)

Ejemplo:

```json
{
  "style": {
    "align": "center",
    "justify": "start"
  }
}
```

---

## Ejemplo de Cálculo

### Input

```json
{
  "viewport": { "width": 1280, "height": 720 },
  "root": {
    "kind": "container",
    "layout": { "type": "stack", "props": { "direction": "vertical", "gap": "md" } },
    "style": { "padding": "lg" },
    "children": [{ "ref": "heading" }, { "ref": "button" }]
  }
}
```

### Cálculo

1. **Root container**:
   - `x=0, y=0`
   - `width=1280, height=720`
   - `padding=24` (lg)

2. **Espacio disponible**:
   - `contentWidth = 1280 - 24*2 = 1232`
   - `contentHeight = 720 - 24*2 = 672`

3. **Gap entre hijos**:
   - `gap = 16` (md)
   - `totalGap = 16 * (2-1) = 16`

4. **Hijo 1 (Heading)**:
   - `width: fill` → 1232px
   - `height: content` → 32px (intrínseco)
   - `x=24, y=24`

5. **Hijo 2 (Button)**:
   - `width: fill` → 1232px
   - `height: content` → 36px (intrínseco)
   - `x=24, y=24+32+16 = 72`

### Output (Render Tree)

```json
{
  "root": { "x": 0, "y": 0, "width": 1280, "height": 720 },
  "children": [
    { "id": "heading", "x": 24, "y": 24, "width": 1232, "height": 32 },
    { "id": "button", "x": 24, "y": 72, "width": 1232, "height": 36 }
  ]
}
```

---

## Implementación Recomendada

### Fase 1: Medición (Measure)

Calcular dimensiones intrínsecas de componentes.

### Fase 2: Layout (Layout)

Calcular posiciones y dimensiones finales de contenedores y sus hijos.

### Fase 3: Render Tree (Output)

Generar árbol con bounding boxes concretas.

---

## Testing

El layout engine debe ser testeable de forma aislada:

**Input**: IR + viewport
**Output**: Render Tree

Tests unitarios por layout:

- Stack vertical con 3 hijos
- Grid con múltiples filas
- Split con sidebar fijo
- Casos extremos (sin espacio, overflow, etc.)
