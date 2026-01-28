# Component Composition Implementation

Implementation details have been integrated into the main codebase. For technical details, refer to:
- `packages/core/src/parser/index.ts` - Parser with cycle detection (validateComponentDefinitionCycles)
- `packages/core/src/ir/index.ts` - IR generator with component expansion (expandDefinedComponent)
- Test files: `packages/core/src/parser/index.test.ts`, `packages/core/src/ir/index.test.ts`

## Status: ✅ IMPLEMENTED

The component composition feature has been successfully implemented in Wire-DSL. This document summarizes the implementation details.

## Feature Overview

**Component Composition** allows developers to define reusable component templates and reuse them throughout their UI definitions. This is a compile-time feature that expands defined components during IR generation.

### Syntax

```wire
define Component "ButtonGroup" {
  layout stack(direction: horizontal) {
    component Button text: "OK"
    component Button text: "Cancel"
  }
}
```

Then use it like:
```wire
component ButtonGroup
```

During compilation, `component ButtonGroup` is expanded to its definition (a stack layout with 2 buttons).

## Implementation Details

### 1. Parser Changes (`packages/core/src/parser/index.ts`)

**New Token:**
- Added `ComponentKeyword` token to recognize the capitalized keyword `Component`
- Added to `allTokens` array BEFORE `Component` (lowercase) for proper precedence

**New Grammar Rule:**
```typescript
private definedComponent = this.RULE('definedComponent', () => {
  this.CONSUME(Define);
  this.CONSUME(ComponentKeyword, { LABEL: 'componentKeyword' });
  this.CONSUME(StringLiteral, { LABEL: 'componentName' });
  this.CONSUME(LCurly);
  this.OR([
    { ALT: () => this.SUBRULE(this.layout) },
    { ALT: () => this.SUBRULE(this.component) },
  ]);
  this.CONSUME(RCurly);
});
```

**AST Updates:**
- Added `ASTDefinedComponent` interface with `type`, `name`, and `body` fields
- Updated `AST` interface to include `definedComponents: ASTDefinedComponent[]`
- Updated `project()` visitor to collect and store defined components

### 2. IR Generator Changes (`packages/core/src/ir/index.ts`)

**Symbol Table:**
```typescript
private definedComponents: Map<string, ASTDefinedComponent> = new Map();
```

**Initialization in generate():**
```typescript
if (ast.definedComponents && ast.definedComponents.length > 0) {
  ast.definedComponents.forEach((def) => {
    this.definedComponents.set(def.name, def);
  });
}
```

**Expansion Logic in convertComponent():**
```typescript
const definition = this.definedComponents.get(component.componentType);
if (definition) {
  return this.expandDefinedComponent(definition);
}
```

**Expansion Method:**
```typescript
private expandDefinedComponent(definition: ASTDefinedComponent): string {
  if (definition.body.type === 'layout') {
    return this.convertLayout(definition.body);
  } else if (definition.body.type === 'component') {
    return this.convertComponent(definition.body);
  } else {
    throw new Error(`Invalid defined component body type for "${definition.name}"`);
  }
}
```

### 3. Tests (`packages/core/src/ir/index.test.ts`)

Three comprehensive tests validate the feature:

#### Test 1: Basic Expansion
```typescript
it('should expand defined components at IR generation', () => {
  // Defines ButtonGroup with 2 Button components
  // Verifies: ButtonGroup expanded to 2 Button nodes
  // Verifies: No ButtonGroup component type in final IR
});
```

#### Test 2: Nested Expansion
```typescript
it('should handle nested defined components', () => {
  // Defines FormField and FormGroup (uses FormField twice)
  // Verifies: All custom components expanded
  // Verifies: Leaf nodes (Input, Label) present
});
```

#### Test 3: Single Component Body
```typescript
it('should handle defined component with single component body', () => {
  // Defines PrimaryButton as single Button component
  // Verifies: PrimaryButton expanded to Button
  // Verifies: Properties preserved
});
```

**Test Results:**
```
✓ should expand defined components at IR generation
✓ should handle nested defined components
✓ should handle defined component with single component body
```

## Example File

Created [examples/component-composition-demo.wire](examples/component-composition-demo.wire) demonstrating:

1. **ButtonGroup** - Reusable button pair
   - Used in LoginForm screen

2. **FormField** - Label + Input combination
   - Used in LoginForm screen (twice)

3. **ProductCard** - Reusable product display
   - Used in ProductCatalog screen (6 times)

4. **StatCardBadge** - Single component wrapper
   - Used in Dashboard screen (3 times)

## Key Features

✅ **Compile-Time Expansion**
- No runtime overhead
- Fully expanded IR sent to renderer
- Renderer unchanged

✅ **Flexible Body**
- Body can be layout: `layout stack { ... }`
- Body can be component: `component Button ...`

✅ **Recursive Expansion**
- Defined components can use other defined components
- All expanded before rendering

✅ **Type Safety**
- Parser validates syntax
- IR generator validates references
- Errors caught at compile-time

## Architecture Benefits

1. **DRY Principle** - Define once, reuse many times
2. **Consistency** - Same component definition everywhere
3. **Maintainability** - Change definition, update all usages
4. **Performance** - No runtime cost (compile-time only)
5. **Clarity** - Semantic meaning of custom components

## Scope (v0.5)

This implementation is v0.5 scope:
- ✅ Compile-time expansion
- ✅ No parameters/props
- ❌ Props/parameters (planned for v1.0)

For v1.0, component definitions will support parameters:
```wire
define Component "Button" (text, variant) {
  component Button text: text variant: variant
}
```

## Testing

Run tests:
```bash
cd packages/core
pnpm test
```

Filter to component composition tests:
```bash
cd packages/core
pnpm test -- --grep "expand|nested|single"
```

## Next Steps

1. **Props System (v1.0)** - Add parameter support
2. **Conditional Rendering (v1.0)** - Add `if` statements
3. **Iteration (v1.0)** - Add `repeat` loops
4. **Documentation** - Expand DSL-SYNTAX.md with examples
5. **LSP Support** - Update VS Code extension for autocomplete

## Files Modified

- [packages/core/src/parser/index.ts](packages/core/src/parser/index.ts) - Parser implementation
- [packages/core/src/ir/index.ts](packages/core/src/ir/index.ts) - IR generator
- [packages/core/src/ir/index.test.ts](packages/core/src/ir/index.test.ts) - Tests
- [docs/COMPONENT-COMPOSITION-DESIGN.md](docs/COMPONENT-COMPOSITION-DESIGN.md) - Design documentation
- [examples/component-composition-demo.wire](examples/component-composition-demo.wire) - Example

## Conclusion

Component Composition is now a fully functional feature of Wire-DSL v0.5. Developers can define reusable components and reference them throughout their UI definitions with full compile-time expansion and no runtime overhead.
