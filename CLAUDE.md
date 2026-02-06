# Claude Code Instructions for Wire-DSL

**Quick Reference → [.ai/AI-INSTRUCTIONS-MAIN.md](../.ai/AI-INSTRUCTIONS-MAIN.md)**

---

## 🎯 For Claude Code Users

This file points you to the centralized AI development guidance. All detailed instructions are in the `.ai/` folder.

### What is Wire-DSL?
A **TypeScript-based, block-declarative DSL** for creating interactive wireframes using code instead of visual tools.

- **Language:** Declarative (like Mermaid, but for UI)
- **Parser:** Chevrotain
- **Validation:** Zod schemas
- **Output:** SVG, IR, AST
- **Components:** 23 UI types
- **Containers:** Stack, Grid, Split, Panel, Card

---

## 📚 Complete Development Guide

**→ [.ai/AI-INSTRUCTIONS-MAIN.md](../.ai/AI-INSTRUCTIONS-MAIN.md)**

Contains all detailed information about:
- Architecture & system design
- Core concepts & DSL language
- Development workflows (add components, fix bugs, update layouts)
- Quality checklists & validation
- Important files & code locations
- Getting help & support

**Time:** 15-20 minutes to read

---

## 🔍 Find Specific Information

**→ [.ai/AI-INSTRUCTIONS-INDEX.md](../.ai/AI-INSTRUCTIONS-INDEX.md)**

Quick lookup hub with:
- Navigation tables
- Cross-references to all docs
- Learning paths by role
- Support section with topic links

---

## ⚡ Quick Links

| Need | Link |
|------|------|
| **Complete Guide** | [.ai/AI-INSTRUCTIONS-MAIN.md](../.ai/AI-INSTRUCTIONS-MAIN.md) |
| **Find Info** | [.ai/AI-INSTRUCTIONS-INDEX.md](../.ai/AI-INSTRUCTIONS-INDEX.md) |
| **System Design** | [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) |
| **DSL Syntax** | [docs/DSL-SYNTAX.md](../docs/DSL-SYNTAX.md) |
| **All 23 Components** | [docs/COMPONENTS-REFERENCE.md](../docs/COMPONENTS-REFERENCE.md) |
| **IR Schema** | [specs/IR-CONTRACT](../specs/IR-CONTRACT) |
| **Validation Rules** | [specs/VALIDATION-RULES](../specs/VALIDATION-RULES) |
| **Layout Algorithm** | [specs/LAYOUT-ENGINE](../specs/LAYOUT-ENGINE) |

---

## 💡 Common Tasks

Detailed instructions for these in [.ai/AI-INSTRUCTIONS-MAIN.md](../.ai/AI-INSTRUCTIONS-MAIN.md):

- **Adding a new component** - Full workflow
- **Fixing parser issues** - Debugging guide
- **Updating layout engine** - Modification checklist
- **Understanding the pipeline** - Architecture overview

---

## 🚀 Getting Started

1. **Read:** [.ai/AI-INSTRUCTIONS-MAIN.md](../.ai/AI-INSTRUCTIONS-MAIN.md) (comprehensive)
2. **Bookmark:** [.ai/AI-INSTRUCTIONS-INDEX.md](../.ai/AI-INSTRUCTIONS-INDEX.md) (quick lookup)
3. **Reference:** Specific docs as needed
4. **Code:** Using the guidance above

---

## 📂 Project Structure

```
Wire-DSL/
├── packages/
│   ├── core/        Parser, IR, Layout, Renderer
│   ├── cli/         Command-line tool
│   ├── web/         Web editor
│   ├── vscode-extension/  VS Code plugin
│   └── ...
├── .ai/             AI DEVELOPMENT GUIDANCE (← Central Hub)
├── docs/            Public documentation
├── specs/           Technical specifications
└── examples/        Example .wire files
```

---

## ✅ Before You Code

**Checklist:**
- [ ] Read [.ai/AI-INSTRUCTIONS-MAIN.md](../.ai/AI-INSTRUCTIONS-MAIN.md)
- [ ] Understand the processing pipeline
- [ ] Know your component types (23 total)
- [ ] Check relevant spec document
- [ ] Review similar test cases

---

**Last Updated:** January 24, 2026  
**For Complete Guidance:** → [.ai/AI-INSTRUCTIONS-MAIN.md](../.ai/AI-INSTRUCTIONS-MAIN.md)
