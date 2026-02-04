# GitHub Copilot Instructions for Wire-DSL

**Quick Reference → [../../.ai/AI-INSTRUCTIONS-MAIN.md](../../.ai/AI-INSTRUCTIONS-MAIN.md)**

---

## 🎯 For GitHub Copilot Users

This file points you to the centralized AI development guidance. All detailed instructions are in the `.ai/` folder.

### What is Wire-DSL?
A **TypeScript-based, block-declarative DSL** for creating interactive wireframes using code instead of visual tools.

**Core Stack:**
- **Language:** TypeScript 5.0+
- **Parser:** Chevrotain
- **Validation:** Zod schemas
- **Build:** Turbo monorepo
- **Components:** 23 UI types
- **Containers:** Stack, Grid, Split, Panel, Card

---

## 📚 Complete Development Guide

**→ [../../.ai/AI-INSTRUCTIONS-MAIN.md](../../.ai/AI-INSTRUCTIONS-MAIN.md)**

Contains all detailed information about:
- Processing pipeline & architecture
- Core DSL concepts
- Development workflows
- Quality checklists
- File organization
- Markdown documentation policy (no excessive files)
- Getting help & support

**Time:** 15-20 minutes to read

---

## ✅ Documentation Policy

**Important**: Do NOT create excessive .md files.
- **Consolidate**: Merge documentation into existing files or single STRATEGY.md
- **No Timestamps**: Dates make docs obsolete
- **Quality > Quantity**: One comprehensive doc beats 8 scattered ones
- **Example**: Instead of 8 separate files → Create one STRATEGY.md with sections

See AI-INSTRUCTIONS-MAIN.md for full documentation policy.

---

## 🔍 Find Information Quickly

**→ [../../.ai/AI-INSTRUCTIONS-INDEX.md](../../.ai/AI-INSTRUCTIONS-INDEX.md)**

Quick lookup hub with:
- Navigation tables by topic
- Cross-references to all resources
- Learning paths by role
- Fast access to specifications

---

## ⚡ Quick Links

| Need | Link |
|------|------|
| **Complete Guide** | [../../.ai/AI-INSTRUCTIONS-MAIN.md](../../.ai/AI-INSTRUCTIONS-MAIN.md) |
| **Find Anything** | [../../.ai/AI-INSTRUCTIONS-INDEX.md](../../.ai/AI-INSTRUCTIONS-INDEX.md) |
| **System Design** | [../../docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) |
| **DSL Grammar** | [../../docs/DSL-SYNTAX.md](../../docs/DSL-SYNTAX.md) |
| **23 Components** | [../../docs/COMPONENTS-REFERENCE.md](../../docs/COMPONENTS-REFERENCE.md) |
| **IR Schema** | [../../specs/IR-CONTRACT-EN.md](../../specs/IR-CONTRACT-EN.md) |
| **Validation Rules** | [../../specs/VALIDATION-RULES-EN.md](../../specs/VALIDATION-RULES-EN.md) |
| **Layout Algorithm** | [../../specs/LAYOUT-ENGINE-EN.md](../../specs/LAYOUT-ENGINE-EN.md) |

---

## 💡 Key Topics

All detailed guidance in [../../.ai/AI-INSTRUCTIONS-MAIN.md](../../.ai/AI-INSTRUCTIONS-MAIN.md):

- **Adding components** - Full development workflow
- **Fixing parser issues** - Debugging strategy
- **Layout engine** - Algorithm updates
- **Component organization** - 23 types by category
- **Quality standards** - Pre-commit checklist

---

## 🚀 Getting Started

1. **Read:** [../../.ai/AI-INSTRUCTIONS-MAIN.md](../../.ai/AI-INSTRUCTIONS-MAIN.md) (comprehensive, 15-20 min)
2. **Bookmark:** [../../.ai/AI-INSTRUCTIONS-INDEX.md](../../.ai/AI-INSTRUCTIONS-INDEX.md) (quick lookup)
3. **Reference:** Topic-specific docs as needed
4. **Code:** Using the guidance & standards above

---

## 📂 Project Layout

```
Wire-DSL/
├── packages/
│   ├── core/            Parser, IR, Layout, Renderer
│   ├── cli/             Command-line tool
│   ├── web/             Web editor
│   └── vscode-extension/  VS Code plugin
├── .ai/                 AI DEVELOPMENT GUIDANCE (← Central Hub)
├── docs/                Public documentation
├── specs/               Technical specifications
└── examples/            Example .wire files
```

---

## ✅ Code Quality Standards

Before suggesting code:
- [ ] Follow TypeScript strict mode
- [ ] Use proper naming: PascalCase components, camelCase functions
- [ ] Include TSDoc comments for public APIs
- [ ] Write tests for new features
- [ ] Update docs if behavior changes
- [ ] No breaking DSL syntax changes

---

**Last Updated:** January 24, 2026  
**For Complete Guidance:** → [../../.ai/AI-INSTRUCTIONS-MAIN.md](../../.ai/AI-INSTRUCTIONS-MAIN.md)
