# Layout Engine Specification

## Objective

The **Layout Engine** is responsible for calculating final positions (`x`, `y`) and dimensions (`width`, `height`) of all nodes, transforming the IR (with declarative constraints) into a **Render Tree** with concrete bounding boxes.

---

## Input and Output

**Input**:
- `viewport`: screen dimensions (`{ width, height }`)
- `root node`: root node of the IR
- `tokens`: values for spacing, padding, etc.

**Output**:
- **Render Tree**: tree of nodes with calculated properties:
  - `x`, `y`: absolute position
  - `width`, `height`: final dimensions
  - Reference to original IR node

---

## Principles

### 1. Top-Down Layout

Layout is calculated from **top to bottom** (parent to child):
- Parent determines available space for children
- Children are sized within that space

### 2. Constraints

Each node can specify constraints:
- `width: fill` → occupies all available width
- `height: content` → adjusts height to content
- `width: { mode: "fixed", value: 240 }` → fixed width

### 3. Spacing

- `gap`: space between child elements
- `padding`: internal container space

---

## Supported Layouts

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

**Rules**:
- Children stack on Y axis
- Default width is `fill` (occupies entire container)
- Height is sum of child heights + gaps + padding
- If child has `height: fill`, occupies remaining space

**Algorithm**:
1. Calculate available space: `containerHeight - padding*2`
2. Subtract gaps: `availableHeight - gap*(numChildren-1)`
3. For each child:
   - If `height: content` → calculate intrinsic height
   - If `height: fixed` → use fixed value
   - If `height: fill` → distribute remaining space
4. Position children sequentially on Y axis

---

#### Horizontal Stack

```
┌────┬───┬────┬────┐
│ C1 │gap│ C2 │ C3 │
└────┴───┴────┴────┘
```

**Rules**:
- Children stack on X axis
- Default height is `fill`
- Width is sum of child widths + gaps + padding
- If child has `width: fill`, occupies remaining space

**Algorithm**:
Similar to vertical, but on X axis.

---

### Grid Layout

```
┌──────┬──────┬──────┬──────┐
│ C1 (span: 8)       │C2(4) │
├──────┴──────┴──────┼──────┤
│ C3 (span: 12)             │
└──────────────────────────┘
```

**Rules**:
- Container divided into `columns` (default: 12)
- Each cell declares `colSpan` (how many columns it occupies)
- Positioned left to right
- If doesn't fit in current row, moves to next row

**Algorithm**:
1. Calculate column width:
   ```
   columnWidth = (containerWidth - padding*2 - gap*(columns-1)) / columns
   ```

2. For each cell:
   - Calculate width: `cellWidth = columnWidth * colSpan + gap * (colSpan - 1)`
   - If doesn't fit in current row → new row
   - Position at calculated (x, y)

3. Row height:
   - `mode: content` → maximum height of elements in that row
   - `mode: fixed` → fixed value

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

**Rules**:
- Divides into two columns: sidebar (fixed width) + content (fill)
- Total width is: `sidebarWidth + gap + remainingWidth`
- Both children must be layouts (stack, grid, etc.)

**Algorithm**:
1. Left child width = `sidebar` (parameter)
2. Right child width = `containerWidth - sidebarWidth - gap`
3. Both use full available height (height: fill)

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

**Purpose**: Specialized container with single child

**Rules**:
- Accepts **exactly one child** (validated in IR)
- Applies automatic padding on all sides
- Child occupies all available space: `width: fill`, `height: fill`
- Renders with optional border and background

**Parameters**:
- `padding`: `xs` | `sm` | `md` | `lg` | `xl` (padding size)
- `background`: background color (named or hex)

**Algorithm**:
1. Resolve padding to pixels based on token
2. Calculate available space: `containerW/H - padding*2`
3. Position child at `(x + padding, y + padding)`
4. Assign size: `width: fill`, `height: fill` (relative to available space)

---

### Card Layout

```
┌────────────────────────┐
│ padding                │
│  ┌──────────────────┐  │
│  │ (stack/grid)     │  │
│  │  Flexible box    │  │
│  └──────────────────┘  │
│ padding                │
└────────────────────────┘
```

**Purpose**: Self-contained container with visual boundaries

**Rules**:
- Can contain one or more children
- Applies padding and optional gap between children
- Renders with border and background
- Optional rounded corners (radius token)

**Parameters**:
- `padding`: spacing token
- `gap`: spacing between children
- `radius`: border roundness token

---

## Dimension Calculation

### Width/Height Modes

#### `fill`

Occupies all available space in the container.

```json
{ "mode": "fill" }
```

In vertical stack:
- `width: fill` → container width
- `height: fill` → distributes remaining space among fill children

---

#### `content`

Adjusts to content size.

```json
{ "mode": "content" }
```

For components:
- Uses intrinsic size (calculated by renderer)
- Tables: height = `rowHeight * numRows`
- Text: depends on content and available width

---

#### `fixed`

Fixed size in pixels.

```json
{ "mode": "fixed", "value": 240 }
```

---

#### `percent`

Percentage of container.

```json
{ "mode": "percent", "value": 50 }
```

---

## Overflow Handling

If content exceeds available space:
- **Truncate**: apply overflow clipping
- **Scroll**: enable scrolling in container
- **Expand**: allow container to grow (specific cases only)

Default: scroll for containers, truncate for components.

---

## Spacing Tokens

Spacing tokens resolve to concrete values:

| Token | Pixels |
|-------|--------|
| `xs`  | 4px    |
| `sm`  | 8px    |
| `md`  | 16px   |
| `lg`  | 24px   |
| `xl`  | 32px   |

Applied to:
- `gap`: spacing between elements
- `padding`: internal container padding

---

## Special Cases

### Components with Intrinsic Height

Some components have natural height:
- `Input`: ~40px
- `Button`: ~36px
- `Heading`: ~32px
- `Table`: `rowHeight * numRows + headerHeight`

Used when `height: content`.

---

### Remaining Space Distribution

If multiple children have `width: fill` (or `height: fill`):
- Remaining space distributed **equally**
- Future: allow proportions (flex-grow)

---

### Alignment

Within containers:
- `align`: horizontal alignment (`start` | `center` | `end`)
- `justify`: vertical justification (`start` | `center` | `end`)

Example:
```json
{
  "style": {
    "align": "center",
    "justify": "start"
  }
}
```

---

## Calculation Example

### Input

```json
{
  "viewport": { "width": 1280, "height": 720 },
  "root": {
    "kind": "container",
    "layout": { 
      "type": "stack", 
      "props": { "direction": "vertical", "gap": "md" } 
    },
    "style": { "padding": "lg" },
    "children": [
      { "ref": "heading" },
      { "ref": "button" }
    ]
  }
}
```

### Calculation

1. **Root container**:
   - `x=0, y=0`
   - `width=1280, height=720`
   - `padding=24` (lg)

2. **Available space**:
   - `contentWidth = 1280 - 24*2 = 1232`
   - `contentHeight = 720 - 24*2 = 672`

3. **Gap between children**:
   - `gap = 16` (md)
   - `totalGap = 16 * (2-1) = 16`

4. **Child 1 (Heading)**:
   - `width: fill` → 1232px
   - `height: content` → 32px (intrinsic)
   - `x=24, y=24`

5. **Child 2 (Button)**:
   - `width: fill` → 1232px
   - `height: content` → 36px (intrinsic)
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

## Recommended Implementation

### Phase 1: Measurement (Measure)

Calculate intrinsic dimensions of components.

### Phase 2: Layout (Layout)

Calculate positions and final dimensions of containers and children.

### Phase 3: Render Tree (Output)

Generate tree with concrete bounding boxes.

---

## Testing

Layout engine should be independently testable:

**Input**: IR + viewport  
**Output**: Render Tree

Unit tests per layout:
- Vertical stack with 3 children
- Grid with multiple rows
- Split with fixed sidebar
- Edge cases (no space, overflow, etc.)

---

**Last Updated**: January 2026  
**Status**: Complete Specification
