---
title: Create Your First Wireframe
description: Build your first Wire-DSL wireframe in 5 minutes
---

## Your First Wireframe

Wire-DSL uses simple, declarative syntax to describe wireframes. Let's create a basic login form.

## Basic Structure

Every `.wire` file has this structure:

```wire
project "ProjectName" {
  theme {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen ScreenName {
    layout stack {
      // Components go here
    }
  }
}
```

## Login Form Example

Create a file called `login.wire` and add the following:

```wire
project "Login App" {
  theme {
    density: "comfortable"
    spacing: "lg"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen LoginScreen {
    layout stack(direction: vertical, gap: lg, padding: xl, align: "center") {
      component Heading text: "Welcome Back"
      component Text content: "Sign in to your account"

      layout stack(direction: vertical, gap: md) {
        component Input label: "Email" placeholder: "user@example.com"
        component Input label: "Password" placeholder: "••••••••"
        component Checkbox label: "Remember me" checked: false
      }

      layout stack(direction: horizontal, gap: md) {
        component Button text: "Sign In" variant: primary
        component Button text: "Sign Up" variant: secondary
      }
    }
  }
}
```

## Using the Web Editor

1. **Open the editor**: Start with `cd apps/web && pnpm dev`
2. **Copy the code**: Paste the login form code above into the code editor
3. **See the preview**: Watch the wireframe render in real-time on the right side

## Using the CLI

To render the `.wire` file to an SVG image:

```bash
cd packages/cli
pnpm build
node dist/index.js render ../examples/login.wire -o output.svg
```

The `output.svg` file will be created in your current directory.

## Anatomy of a Wire-DSL File

Let's break down the login form:

### 1. Project Block

```wire
project "Login App" { ... }
```

Defines the wireframe name. This is required and appears in the output.

### 2. Theme Block

```wire
theme {
  density: "comfortable"
  spacing: "lg"
  radius: "md"
  stroke: "normal"
  font: "base"
}
```

Sets visual design tokens:
- **density**: UI compactness (`compact`, `normal`, `comfortable`)
- **spacing**: Default gap between elements
- **radius**: Border roundness on components
- **stroke**: Border thickness
- **font**: Typography style

### 3. Screen Block

```wire
screen LoginScreen { ... }
```

Represents a single page/view in your wireframe. You can have multiple screens.

### 4. Layout Block

```wire
layout stack(direction: vertical, gap: lg, padding: xl, align: "center") { ... }
```

Arranges components:
- **direction**: `vertical` (default) or `horizontal`
- **gap**: Spacing between children (`xs`, `sm`, `md`, `lg`, `xl`)
- **padding**: Internal padding
- **align**: Alignment (`justify`, `left`, `center`, `right` for horizontal stacks)

### 5. Components

```wire
component Heading text: "Welcome Back"
component Input label: "Email" placeholder: "user@example.com"
component Button text: "Sign In" variant: primary
```

Building blocks of your wireframe. Wire-DSL has 23 component types covering text, inputs, buttons, navigation, and more.

## Common Patterns

### Centered Card

```wire
layout stack(direction: vertical, gap: md, padding: lg, align: "center") {
  component Heading text: "Title"
  component Text content: "Description"
  component Button text: "Action" variant: primary
}
```

### Two-Column Form

```wire
layout grid(columns: 12, gap: md) {
  cell span: 6 {
    component Input label: "First Name"
  }
  cell span: 6 {
    component Input label: "Last Name"
  }
}
```

### Action Buttons

```wire
layout stack(direction: horizontal, gap: md, align: "right") {
  component Button text: "Cancel" variant: secondary
  component Button text: "Save" variant: primary
}
```

## Validation

To check if your `.wire` file is valid:

```bash
cd packages/cli
pnpm build
node dist/index.js validate ../examples/login.wire
```

If there are errors, they'll be reported with helpful messages.

## What's Next?

- **Explore components**: [All 23 Component Types](../language/components.md)
- **Learn layouts**: [Containers & Layouts](../language/containers.md)
- **Master the syntax**: [Complete DSL Syntax](../language/syntax.md)
- **Build examples**: Check the [examples/](../../examples) folder for more samples

Happy wireframing! 🎨
