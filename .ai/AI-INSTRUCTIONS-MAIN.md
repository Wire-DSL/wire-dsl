# Wire-DSL AI Development Instructions

**Last Updated:** January 24, 2026  
**Purpose:** Central reference guide for AI agents (GitHub Copilot, Claude, etc.) developing Wire-DSL

---

## Quick Navigation

### 🎯 For New Feature Development
Start here when building new functionality:
- [DSL Syntax Reference](../docs/DSL-SYNTAX.md) - Language grammar and structure
- [Architecture Overview](../docs/ARCHITECTURE.md) - System design and layers
- [Components Reference](../docs/COMPONENTS-REFERENCE.md) - Available UI components
- [Validation Rules](../specs/VALIDATION-RULES.md) - Business rule constraints

---

### 🐛 For Maintenance & Bug Fixes
When troubleshooting or fixing issues:
- [CLI Reference](../docs/CLI-REFERENCE.md) - Command-line tool documentation
- [Layout Engine Specification](../specs/LAYOUT-ENGINE.md) - Grid and positioning system
- [IR Contract Specification](../specs/IR-CONTRACT.md) - Internal representation schema
- [Components Reference](../docs/COMPONENTS-REFERENCE.md) - Component behavior details

---

### 📋 Project Structure

```
Wire-DSL/
├── .ai/                          # AI Instructions (this folder)
│   ├── AI-INSTRUCTIONS-MAIN.md   # This file
│   └── plans/                    # Development & refactor plans
├── docs/                         # Public documentation
│   ├── ARCHITECTURE.md           # System architecture
│   ├── DSL-SYNTAX.md             # Language grammar
│   ├── COMPONENTS-REFERENCE.md   # Component catalog (23 types)
│   ├── CONTAINERS-REFERENCE.md   # Layout containers
│   ├── THEME-GUIDE.md            # Theming system
│   ├── CLI-REFERENCE.md          # CLI tool guide
│   ├── LLM-PROMPTING.md          # AI prompt engineering
│   └── DOCUMENTATION-INDEX.md    # Full doc index
├── specs/                        # Technical specifications
│   ├── IR-CONTRACT         # Internal representation schema
│   ├── LAYOUT-ENGINE       # Layout calculation engine
│   └── VALIDATION-RULES    # Validation & constraints
├── packages/
│   ├── engine/                   # @wire-dsl/engine (Parser, IR, Layout, SVG)
│   ├── cli/                      # @wire-dsl/cli (Command-line tool)
│   ├── language-support/         # @wire-dsl/language-support (VS Code, Monaco)
│   ├── editor-ui/                # @wire-dsl/editor-ui (React components)
│   └── exporters/                # @wire-dsl/exporters (SVG, PNG, PDF export)
├── apps/
│   └── web/                      # @wire-dsl/web (Web editor & preview)
├── examples/                     # Example .wire files
└── tests/                        # Test suites
```

---

## Core Concepts

### 1. The Wire DSL Language

**Purpose:** Declarative language for designing interactive wireframes

**Basic Structure:**
```wire
project "Dashboard" {
  theme {
    density: "normal"
    spacing: "md"
  }
  
  screen Home {
    stack {
      heading "Welcome"
      paragraph "This is a wireframe"
    }
  }
}
```

**Key Features:**
- Block-based syntax (inspired by Mermaid)
- Property-value pairs for configuration
- 23 UI components available
- 5 layout containers (Stack, Grid, Split, Panel, Card)
- Theming system for visual consistency

**References:**
- Full syntax: [DSL-SYNTAX.md](../docs/DSL-SYNTAX.md)
- Examples: [examples/](../examples/)

---

### 2. Processing Pipeline

The system processes `.wire` files through these stages:

```
.wire File
    ↓
[1] PARSER (Chevrotain)
    → Tokenization & AST generation
    → Input validation
    ↓
[2] IR GENERATOR
    → Convert AST to IR Contract (JSON)
    → Zod schema validation
    ↓
[3] LAYOUT ENGINE
    → CSS Grid resolution
    → Calculate x, y, width, height for components
    ↓
[4] SVG RENDERER
    → Generate SVG output (DOM-independent)
    → Accessible, optimizable
    ↓
Output (SVG / IR / AST)
```

**Reference:** [ARCHITECTURE.md](../docs/ARCHITECTURE.md#logical-architecture-layers)

---

### 3. Components & Containers

**23 Components in 6 Categories:**

| Category | Components |
|----------|-----------|
| **Text** | Heading, Text, Paragraph, Label |
| **Input** | Input, Textarea, Select, Checkbox, Radio, Toggle |
| **Button** | Button, IconButton |
| **Navigation** | Topbar, SidebarMenu, Breadcrumbs, Tabs |
| **Data Display** | Table, List |
| **Media & Display** | Image, Icon, Avatar, Divider, Badge, Link, Alert, StatCard, Code, ChartPlaceholder |
| **Modal & Feedback** | Modal, Spinner |

**5 Layout Containers:**
- **Stack** - Vertical/horizontal flow
- **Grid** - CSS Grid-based layout
- **Split** - Side-by-side with divider
- **Panel** - Card-like container
- **Card** - Elevated container with shadow

**References:**
- Full catalog: [COMPONENTS-REFERENCE.md](../docs/COMPONENTS-REFERENCE.md)
- Container guide: [CONTAINERS-REFERENCE.md](../docs/CONTAINERS-REFERENCE.md)

---

### 4. Theme System

Apply visual consistency through theming:
- **density**: Spacing between elements
- **spacing**: Inner padding values
- **radius**: Border radius values
- **stroke**: Border widths
- **font**: Font configuration

**Reference:** [THEME-GUIDE.md](../docs/THEME-GUIDE.md)

---

## Development Workflows

### Adding a New Component

1. **Define in DSL Syntax** → Update [DSL-SYNTAX.md](../docs/DSL-SYNTAX.md)
2. **Update Parser** → `packages/engine/src/parser/`
3. **Add IR Schema** → `packages/engine/src/ir/` (update Zod schema)
4. **Update Layout Engine** → `packages/engine/src/layout/`
5. **Implement Renderer** → `packages/engine/src/renderer/`
6. **Update Components Reference** → [COMPONENTS-REFERENCE.md](../docs/COMPONENTS-REFERENCE.md)
7. **Add Test Cases** → `packages/engine/tests/`
8. **Create Example** → `examples/`

### Fixing a Parser/Validation Issue

1. **Check Validation Rules** → [VALIDATION-RULES.md](../specs/VALIDATION-RULES.md)
2. **Review Parser Tests** → `packages/engine/tests/parser/`
3. **Update Parser** → `packages/engine/src/parser/`
4. **Validate Against Spec** → [IR-CONTRACT.md](../specs/IR-CONTRACT.md)
5. **Add Test Case** → Ensure coverage of edge case
6. **Update Documentation** → If behavior changed, update docs

### Updating the Layout Engine

1. **Review Current Logic** → [LAYOUT-ENGINE.md](../specs/LAYOUT-ENGINE.md)
2. **Check Test Cases** → `packages/engine/tests/layout/`
3. **Modify Engine** → `packages/engine/src/layout/`
4. **Validate Against Spec** → Ensure compliance with spec
5. **Test Rendering** → Check SVG output is correct
6. **Update Examples** → Add test case if demonstrating new behavior

---

## Validation & Quality

### Validation Rules
All `.wire` files must comply with:
- **Syntax Validation** - DSL grammar rules
- **Schema Validation** - IR Contract schema (Zod)
- **Constraint Validation** - Business rules and limits

**Full Rules:** [VALIDATION-RULES](../specs/VALIDATION-RULES.md)

### Testing Strategy

**Test Organization:**
- Unit tests for each module
- Integration tests for parser → IR → Layout
- End-to-end tests for complete pipeline
- Visual tests for SVG output

**Test Location:** `packages/core/tests/`

---

## Important Files to Know

| File | Purpose |
|------|---------|
| `packages/engine/src/parser/` | DSL parser implementation |
| `packages/engine/src/ir/` | IR generation and schema |
| `packages/engine/src/layout/` | Layout calculation engine |
| `packages/engine/src/renderer/` | SVG output generation |
| `packages/engine/tests/` | Test suites |
| `docs/ARCHITECTURE.md` | System design documentation |
| `specs/IR-CONTRACT.md` | IR schema specification |
| `specs/LAYOUT-ENGINE.md` | Layout engine specification |

---

## Coding Standards

### Language & Format
- **Primary Language:** TypeScript
- **Linting:** ESLint configuration in root `tsconfig.json`
- **Build System:** Turbo (monorepo task execution)

### Naming Conventions
- **Components:** PascalCase (e.g., `TextInput`, `StatCard`)
- **Functions/Methods:** camelCase (e.g., `parseProject`, `calculateLayout`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_COMPONENTS`)
- **Files:** kebab-case (e.g., `component-parser.ts`)

### Documentation Comments
- Use TSDoc comments for public APIs
- Include @param, @returns, @throws for functions
- Add examples for complex logic

### Markdown File Creation Policy
**DO NOT CREATE excessive .md files.** Follow these rules:

1. **Consolidate over Create**: Use existing files or merge into single comprehensive file
2. **One Strategy per Feature**: Not separate files for recommendation, visualization, decision, quickstart, etc.
3. **No Timestamps or Status Markers**: Dates make docs stale
4. **Max Effort**: If documentation effort > feature effort = WRONG APPROACH
5. **Quality Over Quantity**: One well-written STRATEGY.md > 8 scattered files

Example: Instead of creating RECOMMENDATION.md + VISUAL-ANALYSIS.md + DECISION.md + PUBLISH-QUICKSTART.md:
- Create ONE: STRATEGY.md (2 KB, 50 lines) with sections for: Problem, Solution, Timeline, Examples, Risks
- Link from README.md or package docs

---

## Getting Help

**Documentation by Topic:**
- **DSL Grammar** → [DSL-SYNTAX.md](../docs/DSL-SYNTAX.md)
- **System Design** → [ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- **Components** → [COMPONENTS-REFERENCE.md](../docs/COMPONENTS-REFERENCE.md)
- **Layouts** → [CONTAINERS-REFERENCE.md](../docs/CONTAINERS-REFERENCE.md)
- **Theming** → [THEME-GUIDE.md](../docs/THEME-GUIDE.md)
- **CLI Usage** → [CLI-REFERENCE.md](../docs/CLI-REFERENCE.md)
- **Prompt Engineering** → [LLM-PROMPTING.md](../docs/LLM-PROMPTING.md)

**Specifications by Topic:**
- **Data Structure** → [IR-CONTRACT](../specs/IR-CONTRACT.md)
- **Positioning Logic** → [LAYOUT-ENGINE](../specs/LAYOUT-ENGINE.md)
- **Validation Rules** → [VALIDATION-RULES](../specs/VALIDATION-RULES.md)

---

## Quick Reference: Common Tasks

### Write Example Code
Check [examples/](../examples/) directory for templates. Reference [LLM-PROMPTING.md](../docs/LLM-PROMPTING.md) for best practices.

### Debug Parser Issues
1. Enable parser debug mode
2. Check token output
3. Compare against [DSL-SYNTAX.md](../docs/DSL-SYNTAX.md) grammar
4. Review parser tests in `packages/core/tests/parser/`

### Check Component Behavior
1. Find component in [COMPONENTS-REFERENCE.md](../docs/COMPONENTS-REFERENCE.md)
2. Review renderer implementation in `packages/core/src/renderer/`
3. Check test cases for usage examples
4. Validate against IR schema in [IR-CONTRACT](../specs/IR-CONTRACT.md)

### Understand a Complex Feature
1. Start with [ARCHITECTURE.md](../docs/ARCHITECTURE.md)
2. Find relevant section in appropriate doc (DSL, Components, Layout, etc.)
3. Review example in `examples/`
4. Check test cases for edge cases
5. Review relevant spec file if needed

---

## Version Information

- **Wire-DSL Version:** 1.0+
- **Documentation Updated:** January 24, 2026
- **TypeScript Version:** 5.0+
- **Node.js Version:** 18.0+
