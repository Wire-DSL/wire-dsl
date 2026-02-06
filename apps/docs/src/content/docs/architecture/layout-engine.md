---
title: Layout Engine Specification
description: How Wire-DSL calculates positions and sizes
---

The **Layout Engine** is responsible for calculating final positions (`x`, `y`) and dimensions (`width`, `height`) of all nodes, transforming the IR (with declarative constraints) into a **Render Tree** with concrete bounding boxes.

## Input and Output

**Input**:
- IR document (with theme tokens)
- Screen viewport dimensions
- Root layout node

**Output**:
- **Render Tree**: All nodes with calculated:
  - `x`, `y`: absolute position in viewport
  - `width`, `height`: final dimensions
  - Reference to original IR node for rendering

## Core Principles

### 1. Top-Down Calculation

Layout is calculated from **parent to child**:
- Parent determines available space
- Children are sized within that space
- Constraints cascade down the tree

### 2. Constraint System

Each node can specify sizing constraints:
- **`fill`**: Occupy all available space
- **`content`**: Adjust size to content
- **`fixed`**: Use specified fixed value

### 3. Spacing & Padding

- **`gap`**: Space between sibling children
- **`padding`**: Internal space inside container

## Supported Layout Types

### Stack Layout (Vertical)

Arranges children vertically from top to bottom.

**Algorithm**:
1. Calculate available height: `containerHeight - padding*2`
2. Subtract gaps: `availableHeight - gap*(numChildren-1)`
3. For each child:
   - If `height: content` → measure intrinsic height
   - If `height: fixed` → use specified value
   - If `height: fill` → distribute remaining space equally
4. Position children sequentially on Y axis starting at `y = padding`
5. Width: Children fill container width by default

**Example**:
```
Container: height=200, padding=10
Children: 3 items, gap=8

Available height = 200 - 10*2 = 180
After gaps = 180 - 8*2 = 164
Per-child height = 164/3 ≈ 54.7

Child 1: y=10, height=54.7
Child 2: y=72.7, height=54.7
Child 3: y=135.4, height=54.7
```

### Stack Layout (Horizontal)

Arranges children horizontally from left to right.

**Algorithm**: Similar to vertical, but on X axis.

**Alignment options**:
- **`justify`** (default): All children get equal width, fill 100%
- **`left`**: Children use natural width, group left
- **`center`**: Children use natural width, group center
- **`right`**: Children use natural width, group right

### Grid Layout

12-column flexible grid system.

**Algorithm**:
1. Calculate cell width: `(containerWidth - padding*2 - gap*(columns-1)) / columns`
2. For each cell:
   - Calculate span: columns occupied (default: 12)
   - Calculate width: `cellWidth * span + gap * (span-1)`
   - Position on grid using X/Y coordinates

**Example**:
```
Container: width=1200, columns=12
Gap=16, padding=16

Cell width = (1200 - 16*2 - 16*11) / 12
           = (1200 - 32 - 176) / 12
           = 992 / 12
           ≈ 82.67px

Cell with span=4: width = 82.67*4 + 16*3 = 330.68 + 48 = 378.68px
```

### Split Layout

Two-panel layout with fixed sidebar and flexible main.

**Algorithm**:
1. Sidebar width: Fixed (specified in IR)
2. Gap: Specified (default: theme spacing)
3. Main content width: `containerWidth - sidebarWidth - gap`
4. Position:
   - Sidebar: x=0
   - Main: x=sidebarWidth+gap

**Example**:
```
Container: width=1000
Sidebar: 260px, Gap: 16px

Sidebar: x=0, width=260
Main: x=276, width=724
```

### Panel Layout

Single-child container with padding and border.

**Algorithm**:
1. Measure child (recursively apply layout)
2. Add padding around child
3. Total dimensions: child dimensions + padding*2

### Card Layout

Multi-child vertical container with gap and padding.

**Algorithm**: Same as vertical stack, but with automatic border/styling applied.

## Sizing Modes

### Fill Mode
- Child occupies all available space after other constraints
- Used when component should be responsive
- Default for most container children

### Content Mode
- Child sized based on its content
- Used for text, buttons, images
- Intrinsic size determined by component type

### Fixed Mode
- Child has explicit fixed size
- Used for specific sizing requirements
- Value in pixels

## Theme Token Application

Layout engine applies theme tokens as defaults:

| Token | Default Value | Affects |
|-------|---------------|---------|
| `spacing` | 16px | Default gap between children |
| `padding` | varies | Default internal padding |
| `density` | normal | Component sizing (compact, normal, comfortable) |

These can be overridden per-layout with explicit properties.

## Viewport & Screen Size

Each screen has a defined viewport:
- Default: 1280×720 (16:9 aspect ratio)
- Can be customized
- Root layout sized to fill viewport

## Example: Layout Calculation

**Input DSL**:
```wire
screen Dashboard {
  layout stack(direction: vertical, gap: 16, padding: 24) {
    component Heading text: "Dashboard"
    component Table columns: "Name,Email" rows: 10
  }
}
```

**Calculation**:
```
Viewport: 1280×720

Stack layout:
  x=0, y=0, width=1280, height=720

Children positioned:
  Heading: x=24, y=24, width=1232, height=32 (content height)
  Table: x=24, y=72 (24+32+16), width=1232, height=596 (fill remaining)
```

## Responsive Design

Layout engine supports responsive sizing:
- Layouts adapt to viewport changes
- Grid system is flexible
- Stack alignment allows responsive patterns

## Performance

- **Time Complexity**: O(n·d) where n=nodes, d=max depth
- **Space Complexity**: O(n) for render tree
- Typical files (100-1000 nodes) calculate in <10ms

## Edge Cases

### Overflow
- If content exceeds container, clipping occurs
- Behavior depends on component type
- Vertical overflow: Scrollable in renderers
- Horizontal overflow: Container expands or clips

### Zero-Height Containers
- Containers with no children or all children hidden
- Render with height=0
- Still occupy layout space

### Deeply Nested Layouts
- Max recommended depth: 5 levels
- Each level adds ~1ms to calculation
- Very deep nesting may cause performance issues

## Full Specification

For complete technical specification including all algorithms and edge cases, see:
- [specs/LAYOUT-ENGINE](../../specs/LAYOUT-ENGINE) in the repository

## Next Steps

- [IR Format Specification](./ir-format.md)
- [Validation Rules](./validation.md)
- [Architecture Overview](./overview.md)
