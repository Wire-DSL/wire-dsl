# Wire-DSL AI Instructions Hub

**Last Updated:** January 24, 2026  
**Documentation Language:** English

Central hub for all AI development guidance and documentation for Wire-DSL.

---

## 🎯 Quick Start by Role

### For GitHub Copilot Users
→ Start with [.github/COPILOT-INSTRUCTIONS.md](../../.github/COPILOT-INSTRUCTIONS.md)

### For Claude Code Users
→ Start with [CLAUDE.md](../../CLAUDE.md)

### For Developers (Manual Development)
→ Start with [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)

### For Code Reviewers
→ Read [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md) + [specs/](../../specs/)

---

## 📁 Folder Organization

```
Wire-DSL/.ai/
├── README.md                              ← This file
├── AI-INSTRUCTIONS-MAIN.md                ← Comprehensive dev guide
├── AI-INSTRUCTIONS-INDEX.md               ← Navigation hub & lookup
├── plans/                                 ← Strategic planning documents
│   ├── 20260122-dsl-refactor-comprehensive-plan.md
│   └── 20260123-vscode-extension-improvements.md
└── _archive/                              ← Historical reference docs
```

---

## 📚 What's Where

### Core Development Resources

| Resource | Location | Purpose |
|----------|----------|---------|
| **Main AI Guide** | [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md) | Comprehensive development reference |
| **Navigation Hub** | [AI-INSTRUCTIONS-INDEX.md](AI-INSTRUCTIONS-INDEX.md) | Quick links to all resources |
| **Copilot Instructions** | [.github/COPILOT-INSTRUCTIONS.md](../../.github/COPILOT-INSTRUCTIONS.md) | GitHub Copilot entry point |
| **Claude Instructions** | [CLAUDE.md](../../CLAUDE.md) | Claude Code entry point |

### Language & Syntax Documentation

| Resource | Location |
|----------|----------|
| DSL Syntax | [docs/DSL-SYNTAX.md](../../docs/DSL-SYNTAX.md) |
| Architecture | [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) |
| Components Reference | [docs/COMPONENTS-REFERENCE.md](../../docs/COMPONENTS-REFERENCE.md) |
| Containers Reference | [docs/CONTAINERS-REFERENCE.md](../../docs/CONTAINERS-REFERENCE.md) |
| Theme Guide | [docs/THEME-GUIDE.md](../../docs/THEME-GUIDE.md) |
| CLI Reference | [docs/CLI-REFERENCE.md](../../docs/CLI-REFERENCE.md) |
| LLM Prompting | [docs/LLM-PROMPTING.md](../../docs/LLM-PROMPTING.md) |

### Technical Specifications

| Specification | Location |
|---------------|----------|
| IR Contract | [specs/IR-CONTRACT-EN.md](../../specs/IR-CONTRACT-EN.md) |
| Layout Engine | [specs/LAYOUT-ENGINE-EN.md](../../specs/LAYOUT-ENGINE-EN.md) |
| Validation Rules | [specs/VALIDATION-RULES-EN.md](../../specs/VALIDATION-RULES-EN.md) |

---

## 🚀 Common Tasks

### "I want to add a new component"
→ See [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md#adding-a-new-component)

### "I need to fix a parser issue"
→ See [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md#fixing-a-parser-validation-issue)

### "I want to update the layout engine"
→ See [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md#updating-the-layout-engine)

### "I'm using GitHub Copilot"
→ See [.github/COPILOT-INSTRUCTIONS.md](../../.github/COPILOT-INSTRUCTIONS.md)

### "I'm using Claude Code"
→ See [CLAUDE.md](../../CLAUDE.md)

### "I need to find something specific"
→ Use [AI-INSTRUCTIONS-INDEX.md](AI-INSTRUCTIONS-INDEX.md) as your navigation hub

---

## 📖 Three Levels of Guidance

### Level 1: Quick Start (5 minutes)
Pick your AI agent or role above and go to the appropriate entry point.

### Level 2: Comprehensive Development Guide (30-45 minutes)
Read [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md) for complete context about:
- Architecture overview and processing pipeline
- 23 UI components and their organization
- Container system (Stack, Grid, Split, Panel, Card)
- Development workflows (adding components, fixing bugs, updating layout)
- Quality standards and pre-commit checklist

### Level 3: Specialized References (As Needed)
Use these for deep dives on specific topics:
- **Navigation hub:** [AI-INSTRUCTIONS-INDEX.md](AI-INSTRUCTIONS-INDEX.md)
- **Public documentation:** [docs/](../../docs/) folder
- **Technical specifications:** [specs/](../../specs/) folder
- **Real examples:** [examples/](../../examples/) folder

---

## 🎓 Development Workflows

### For Feature Development
1. Read [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md#development-workflows)
2. Follow the workflow checklist for your task type
3. Reference the appropriate specification document
4. Check examples in `examples/` folder
5. Write tests and update documentation

### For Bug Fixes
1. Identify the affected layer (Parser, IR, Layout, Renderer)
2. Check relevant specification in `specs/`
3. Review test cases and examples
4. Implement the fix
5. Add test case for the bug

### For Code Review
1. Check against [specs/VALIDATION-RULES-EN.md](../../specs/VALIDATION-RULES-EN.md)
2. Review test coverage
3. Verify documentation updates
4. Check examples if applicable

---

## 🗂️ Instruction Files Organization

All AI development instructions are centralized in this folder:

```
Wire-DSL/
├── CLAUDE.md                              ← Entry point for Claude Code (Root)
├── .github/
│   └── COPILOT-INSTRUCTIONS.md            ← Entry point for GitHub Copilot
└── .ai/                                   ← Complete AI instruction system
    ├── README.md                          ← This file (overview & navigation)
    ├── AI-INSTRUCTIONS-MAIN.md            ← Comprehensive development guide
    ├── AI-INSTRUCTIONS-INDEX.md           ← Resource navigation hub
    ├── plans/                             ← Strategic planning documents
    └── _archive/                          ← Historical reference docs
```

---

## 💡 How to Navigate This System

```
AI Agent or Developer
        ↓
    [Start Here]
        ↓
Choose your role/agent:
├─ GitHub Copilot? → [.github/COPILOT-INSTRUCTIONS.md](../../.github/COPILOT-INSTRUCTIONS.md)
├─ Claude Code?     → [CLAUDE.md](../../CLAUDE.md)
└─ Manual Dev?      → [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)
        ↓
    [Need more details?]
        ↓
    [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)
        ↓
    [Need specific info?]
        ↓
    [AI-INSTRUCTIONS-INDEX.md](AI-INSTRUCTIONS-INDEX.md)
        ↓
    [Reference topic details?]
        ↓
    docs/ or specs/ folders
        ↓
    [See real examples?]
        ↓
    examples/ folder
```

---

## ✨ Key Features of This Setup

✅ **Centralized** - All AI guidance in `.ai/` folder  
✅ **Well-Organized** - Clear hierarchy and structure  
✅ **Multi-Level** - From quick references to comprehensive guides  
✅ **AI-Optimized** - Tailored formats for different AI agents  
✅ **Comprehensive** - Covers all aspects of development  
✅ **English-Only** - Consistent documentation language  
✅ **Well-Linked** - Clear cross-references between documents  
✅ **Easy to Maintain** - Single source of truth for each topic  

---

## 📍 Project Structure

```
Wire-DSL/
├── CLAUDE.md                              # Claude Code instructions (Root)
├── .github/
│   └── COPILOT-INSTRUCTIONS.md            # GitHub Copilot instructions
├── .ai/                                   # AI Instructions Hub ← YOU ARE HERE
│   ├── AI-INSTRUCTIONS-MAIN.md            # Main development guide
│   ├── AI-INSTRUCTIONS-INDEX.md           # Navigation & resource index
│   ├── README.md                          # This folder's overview
│   └── plans/                             # Strategic planning documents
├── docs/                                  # Public documentation
├── specs/                                 # Technical specifications
├── examples/                              # Example .wire files
└── packages/                              # Monorepo packages
    ├── core/                              # Parser, IR, Layout, Renderer
    ├── cli/                               # Command-line tool
    ├── web/                               # Web editor
    └── vscode-extension/                  # VS Code plugin
```

---

## 📞 Support & Navigation

**Finding information?**
→ Use [AI-INSTRUCTIONS-INDEX.md](AI-INSTRUCTIONS-INDEX.md) as your navigation hub

**Learning the codebase?**
→ Start with [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)

**Using an AI agent?**
→ Check the agent-specific file at root or .github/

**Need technical details?**
→ Check [docs/](../../docs/) and [specs/](../../specs/) folders

**Looking for examples?**
→ Check [examples/](../../examples/) folder

---

**Last Updated:** January 24, 2026  
**Documentation Language:** English  
**For:** Wire-DSL v1.0+

**Next Step:** Read [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md) or go to your agent entry point (CLAUDE.md or .github/COPILOT-INSTRUCTIONS.md)
