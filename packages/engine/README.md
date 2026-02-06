# @wire-dsl/engine

Pure JavaScript/TypeScript engine for Wire-DSL. Provides the parser, IR generator, layout engine, and SVG renderer for transforming `.wire` files into interactive wireframes. **Browser-safe - no Node.js dependencies.**

## Installation

```bash
npm install @wire-dsl/engine
```

## Quick Start

```typescript
import { parseWire, generateIR, computeLayout } from '@wire-dsl/engine';

// Parse .wire DSL file
const ast = parseWire(`
  project "MyWireframe" {
    theme {
      density: "normal"
      spacing: "md"
      radius: "md"
      stroke: "normal"
      font: "base"
    }
    screen Home {
      layout stack(direction: vertical, gap: md, padding: lg) {
        component Heading text: "Welcome"
        component Button text: "Click me" variant: primary
      }
    }
  }
`);

// Generate Intermediate Representation
const ir = generateIR(ast);

// Compute layout
const layout = computeLayout(ir);

console.log(layout);
```

## Core Modules

### Parser
Transforms `.wire` DSL syntax into an Abstract Syntax Tree (AST) using Chevrotain.

```typescript
import { parseWire } from '@wire-dsl/engine';
const ast = parseWire(wireCode);
```

### IR (Intermediate Representation)
Converts AST into a structured IR contract that describes components, properties, and relationships.

```typescript
import { generateIR } from '@wire-dsl/engine';
const ir = generateIR(ast);
```

### Layout Engine
Computes positions and dimensions for all components based on container types and constraints.

```typescript
import { computeLayout } from '@wire-dsl/engine';
const layout = computeLayout(ir);
```

### Validators
Schema-based validation using Zod to ensure IR correctness.

```typescript
import { validateIR } from '@wire-dsl/engine';
validateIR(ir); // Throws if invalid
```

### Components
30+ built-in UI components:

**Text**: Heading, Text, Paragraph, Label

**Input**: Input, Textarea, Select, Checkbox, Radio, Toggle

**Buttons**: Button, IconButton

**Navigation**: Topbar, SidebarMenu, Breadcrumbs, Tabs

**Data**: Table, List

**Media**: Image, Icon, Avatar

**Display**: Divider, Badge, Link, Alert

**Info**: StatCard, Code, ChartPlaceholder

**Feedback**: Modal, Spinner

## Features

- 🎯 **Type-safe** - Full TypeScript support
- ✅ **Validated** - Zod-based schema validation
- 📐 **Layout Engine** - Automatic responsive positioning
- 🔧 **Extensible** - Add custom components
- ⚡ **Performance** - Optimized parsing and computation
- 📦 **ESM + CJS** - Works in Node.js and browsers

## Documentation

- [IR Contract Specification](https://github.com/Wire-DSL/wire-dsl/blob/main/specs/IR-CONTRACT.md)
- [Layout Engine Algorithm](https://github.com/Wire-DSL/wire-dsl/blob/main/specs/LAYOUT-ENGINE.md)
- [Validation Rules](https://github.com/Wire-DSL/wire-dsl/blob/main/specs/VALIDATION-RULES.md)

## License

MIT
