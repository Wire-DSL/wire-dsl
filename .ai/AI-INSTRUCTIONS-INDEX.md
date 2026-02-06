# Wire-DSL AI Instructions Index

**Last Updated:** January 24, 2026

This file serves as the central hub for all AI development guidance and documentation for Wire-DSL.

---

## 🎯 AI-Specific Instruction Files

### GitHub Copilot
**Location:** [.github/COPILOT-INSTRUCTIONS.md](../../.github/COPILOT-INSTRUCTIONS.md)

Quick reference guide optimized for GitHub Copilot's code completion and suggestion workflow. Contains:
- Core references to official documentation
- Key facts about Wire-DSL
- Component categorization
- Checklists for common tasks
- File organization map
- Quality checklist

**Best for:** Code generation, inline suggestions, quick reference during development

---

### Claude Code
**Location:** [CLAUDE.md](../../CLAUDE.md)

Comprehensive instruction guide for Claude Code assistant. Contains:
- System architecture overview
- Processing pipeline documentation
- Component ecosystem details
- Monorepo structure
- Technology stack
- Common development tasks with full checklists
- Testing strategy
- Coding standards and quality guidelines

**Best for:** Deep analysis, refactoring, complex feature development, code review

---

### Main AI Development Instructions
**Location:** [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)

Complete development guide for all AI agents. Contains:
- Comprehensive navigation guide
- Core concepts explanation
- Development workflows
- Validation and quality processes
- Important files reference
- Quick task reference

**Best for:** Comprehensive understanding, planning complex work, finding authoritative sources

---

## 📚 Official Documentation (English)

### Core Language & System
| Document | Location | Purpose |
|----------|----------|---------|
| **DSL Syntax Guide** | [docs/DSL-SYNTAX.md](../../docs/DSL-SYNTAX.md) | Complete grammar, syntax rules, and structure |
| **Architecture** | [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) | System design, layers, processing pipeline |
| **CLI Reference** | [docs/CLI-REFERENCE.md](../../docs/CLI-REFERENCE.md) | Command-line tool usage and commands |

### Components & Layouts
| Document | Location | Purpose |
|----------|----------|---------|
| **Components Reference** | [docs/COMPONENTS-REFERENCE.md](../../docs/COMPONENTS-REFERENCE.md) | All 23 UI components with specs |
| **Containers Reference** | [docs/CONTAINERS-REFERENCE.md](../../docs/CONTAINERS-REFERENCE.md) | Layout containers (Stack, Grid, Split, Panel, Card) |
| **Theme Guide** | [docs/THEME-GUIDE.md](../../docs/THEME-GUIDE.md) | Theming system and visual consistency |

### AI & Development
| Document | Location | Purpose |
|----------|----------|---------|
| **LLM Prompting Guide** | [docs/LLM-PROMPTING.md](../../docs/LLM-PROMPTING.md) | Best practices for AI-assisted development |
| **Documentation Index** | [docs/DOCUMENTATION-INDEX.md](../../docs/DOCUMENTATION-INDEX.md) | Full documentation overview |

---

## 📋 Technical Specifications

| Specification | Location | Purpose |
|---------------|----------|---------|
| **IR Contract** | [specs/IR-CONTRACT](../../specs/IR-CONTRACT) | Internal representation JSON schema (Zod definitions) |
| **Layout Engine** | [specs/LAYOUT-ENGINE](../../specs/LAYOUT-ENGINE) | Grid-based positioning algorithm and specifications |
| **Validation Rules** | [specs/VALIDATION-RULES](../../specs/VALIDATION-RULES) | Validation rules, constraints, and business logic |

---

##  Quick Start Guides

### For Different Roles

**👨‍💻 Developers (Writing New Features)**
1. Start with: [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)
2. Reference: [docs/DSL-SYNTAX.md](../../docs/DSL-SYNTAX.md)
3. Check: [specs/IR-CONTRACT](../../specs/IR-CONTRACT)
4. Use examples from: `examples/` folder

**🤖 AI Agents (Code Generation)**
1. Use: [.github/COPILOT-INSTRUCTIONS.md](../../.github/COPILOT-INSTRUCTIONS.md) (GitHub Copilot)
2. Use: [CLAUDE.md](../../CLAUDE.md) (Claude Code)
3. Reference: [docs/LLM-PROMPTING.md](../../docs/LLM-PROMPTING.md) for prompt engineering

**🔧 Code Reviewers & Maintainers**
1. Check: [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)
2. Validate against: [specs/VALIDATION-RULES](../../specs/VALIDATION-RULES)
3. Review examples: [examples/](../../examples/)

**📚 Documentation Writers**
1. Reference: [docs/DOCUMENTATION-INDEX.md](../../docs/DOCUMENTATION-INDEX.md)
2. Maintain consistency with existing docs
3. Keep aligned with specs: `specs/` folder

---

## 🗺️ File Organization

```
Wire-DSL/
├── .ai/                           # AI Instructions (This Folder)
│   ├── AI-INSTRUCTIONS-MAIN.md    # Main comprehensive guide
│   ├── AI-INSTRUCTIONS-INDEX.md   # This file
│   ├── plans/                     # Development & strategic plans
│   ├── README.md                  # Folder overview
│   └── ARCHITECTURE.md            # System architecture docs
│
├── .github/                       # GitHub Configuration
│   └── COPILOT-INSTRUCTIONS.md    # GitHub Copilot reference (AI-specific)
│
├── CLAUDE.md                      # Claude Code instructions (Root level, AI-specific)
│
├── docs/                          # Public Documentation (English)
│   ├── ARCHITECTURE.md
│   ├── DSL-SYNTAX.md
│   ├── COMPONENTS-REFERENCE.md
│   ├── CONTAINERS-REFERENCE.md
│   ├── THEME-GUIDE.md
│   ├── CLI-REFERENCE.md
│   ├── LLM-PROMPTING.md
│   └── DOCUMENTATION-INDEX.md
│
├── specs/                         # Technical Specifications
│   ├── IR-CONTRACT
│   ├── LAYOUT-ENGINE
│   └── VALIDATION-RULES
│
├── packages/                      # Monorepo Packages
│   ├── engine/                    # Main engine (parser, IR, layout, renderer)
│   ├── cli/                       # Command-line tool
│   ├── language-support/          # VS Code language support
│   ├── editor-ui/                 # React UI components
│   └── exporters/                 # SVG, PNG, PDF exporters
│
├── apps/                          # Applications
│   └── web/                       # Web editor
│
└── examples/                      # Example .wire files
```

---

## 🔍 How to Use This Index

### Finding Information

**"I need to understand how [X] works"**
1. Check the **Official Documentation** section above
2. For specific details, read the relevant spec in **Technical Specifications**
3. See examples in `examples/` folder

**"I'm developing a new feature"**
1. Read: [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)
2. Follow the development workflow checklist
3. Reference the appropriate spec document

**"I need to fix a bug"**
1. Identify which layer (Parser, IR, Layout, Renderer)
2. Review relevant spec in **Technical Specifications**
3. Check test cases in `packages/engine/tests/`
4. Follow debugging workflow from [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)

**"I'm using an AI agent to help"**
1. If GitHub Copilot: Reference [.github/COPILOT-INSTRUCTIONS.md](../../.github/COPILOT-INSTRUCTIONS.md)
2. If Claude Code: Reference [CLAUDE.md](../../CLAUDE.md)
3. For prompt engineering: Use [docs/LLM-PROMPTING.md](../../docs/LLM-PROMPTING.md)

---

## 📊 Documentation Language

All instruction and documentation files in the Wire-DSL project are in **English**.

- **AI Instructions:** English
- **Technical Docs:** English
- **Specifications:** English
- **Public Docs:** English

This ensures consistency and accessibility for the global development community.

---

## 🎓 Learning Path

### Beginner (Just Starting)
1. [docs/DOCUMENTATION-INDEX.md](../../docs/DOCUMENTATION-INDEX.md) - Overview
2. [docs/DSL-SYNTAX.md](../../docs/DSL-SYNTAX.md) - Learn the language
3. `examples/simple-dashboard.wire` - See real usage
4. [docs/COMPONENTS-REFERENCE.md](../../docs/COMPONENTS-REFERENCE.md) - Know components

### Intermediate (Building Features)
1. [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) - Understand system design
2. [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md) - Development workflows
3. [specs/IR-CONTRACT](../../specs/IR-CONTRACT) - Data structure
4. `packages/engine/tests/` - See how things work

### Advanced (Deep Modifications)
1. [specs/LAYOUT-ENGINE](../../specs/LAYOUT-ENGINE) - Positioning algorithm
2. [specs/VALIDATION-RULES](../../specs/VALIDATION-RULES) - Constraints
3. Source code in `packages/engine/src/` - Implementation details
4. [.ai/plans/](plans/) - Strategic direction

---

## ✅ Checklist for New Developers

When starting work on Wire-DSL:
- [ ] Read [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)
- [ ] Review [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md)
- [ ] Check [docs/DSL-SYNTAX.md](../../docs/DSL-SYNTAX.md)
- [ ] Review relevant spec document
- [ ] Check `examples/` for similar patterns
- [ ] Run tests: `pnpm test --filter @wire-dsl/core`
- [ ] Read this index for reference locations

---

## 📞 Support & Questions

For questions about:
- **DSL Syntax** → [docs/DSL-SYNTAX.md](../../docs/DSL-SYNTAX.md)
- **Architecture** → [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md)
- **Components** → [docs/COMPONENTS-REFERENCE.md](../../docs/COMPONENTS-REFERENCE.md)
- **Layout System** → [specs/LAYOUT-ENGINE](../../specs/LAYOUT-ENGINE)
- **Data Schema** → [specs/IR-CONTRACT](../../specs/IR-CONTRACT)
- **Validation** → [specs/VALIDATION-RULES](../../specs/VALIDATION-RULES)
- **CLI Tool** → [docs/CLI-REFERENCE.md](../../docs/CLI-REFERENCE.md)
- **AI Development** → [docs/LLM-PROMPTING.md](../../docs/LLM-PROMPTING.md)
- **Development Workflow** → [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)

---

## 📝 Version History

| Date | Changes |
|------|---------|
| **Jan 24, 2026** | Initial centralized AI instructions setup. Created GitHub Copilot, Claude Code, and main AI instruction files. |

---

**Last Updated:** January 24, 2026  
**Maintained By:** Wire-DSL Development Team
