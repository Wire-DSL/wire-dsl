# Wire-DSL AI Instructions Architecture

**Last Updated:** January 24, 2026

Complete overview of the centralized AI instruction system for Wire-DSL.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│         Wire-DSL AI Instructions Centralized System             │
│                     (All in English)                            │
└─────────────────────────────────────────────────────────────────┘

                          Root Level
                              │
        ┌─────────────┬───────┴────────┬──────────────┐
        │             │                │              │
    CLAUDE.md   [.ai/folder]  [.github/folder]    Other Files
        │             │                │
        │             │          COPILOT-
        │             │         INSTRUCTIONS.md
        │             │
        │       ┌─────┴──────────────┐
        │       │                    │
        │  AI-INSTRUCTIONS-     AI-INSTRUCTIONS-
        │  MAIN.md (10K)         INDEX.md (11K)
        │       │                    │
        │       │              [Navigation Hub]
        │  [Comprehensive     [Central Reference]
        │   Dev Guide]             │
        │       │            ┌─────┼─────┬──────────┐
        └───────┼────────────┤     │     │          │
                │            │     │     │          │
                │      ┌─────▼──┬──▼──┬──▼──┐   ┌──▼────┐
                │      │        │     │     │   │       │
                └─────►│  docs/ │spec/│exam/│   │plans/ │
                       │ folder │olds │ples │   │folder │
                       └────────┴─────┴─────┘   └───────┘
```

---

## 📁 Complete File Structure

```
Wire-DSL/
│
├── 📄 CLAUDE.md                           (11.6 KB)
│   └─ Claude Code AI instructions
│   └─ Entry point for Claude Code users
│   └─ Contains: Architecture overview, tech stack, common tasks
│
├── 📁 .github/
│   └── 📄 COPILOT-INSTRUCTIONS.md        (7.2 KB)
│       └─ GitHub Copilot AI instructions
│       └─ Entry point for Copilot users
│       └─ Contains: Quick references, checklists, patterns
│
├── 📁 .ai/                               (AI Instructions Hub)
│   ├── 📄 AI-INSTRUCTIONS-MAIN.md        (10.4 KB)
│   │   └─ Comprehensive development guide
│   │   └─ For developers and AI agents needing full context
│   │   └─ Contains: All concepts, workflows, quality checks
│   │
│   ├── 📄 AI-INSTRUCTIONS-INDEX.md       (10.8 KB)
│   │   └─ Navigation hub for all resources
│   │   └─ Central reference for finding information
│   │   └─ Contains: Quick lookups, learning paths, support
│   │
│   └── 📄 README.md                      (7.8 KB)
│       └─ Overview of .ai folder
│       └─ Explains structure and organization
│
├── 📄 AI-INSTRUCTIONS-SETUP.md            (Quick start guide)
│   └─ This system's overview and quick start
│
│── 📁
│   ├── 📁 docs/  (Documentation)
│   └── 📁 web/   (Web editor)
│
├── 📁 docs/
│   ├── 📄 ARCHITECTURE.md
│   ├── 📄 DSL-SYNTAX.md
│   ├── 📄 COMPONENTS-REFERENCE.md
│   ├── 📄 CONTAINERS-REFERENCE.md
│   ├── 📄 THEME-GUIDE.md
│   ├── 📄 CLI-REFERENCE.md
│   ├── 📄 LLM-PROMPTING.md
│   └── 📄 DOCUMENTATION-INDEX.md
│
├── 📁 specs/
│   ├── 📄 IR-CONTRACT.md
│   ├── 📄 LAYOUT-ENGINE.md
│   └── 📄 VALIDATION-RULES.md
│
├── 📁 examples/
│   └── 📄 [Example .wire files]
│
└── 📁 packages/
    ├── 📁 cli/                (Command-line tool)
    ├── 📁 engine/             (Parser, IR, Layout, Renderer)
    ├── 📁 exporters/          (SVG, PDF, PNG)
    └── 📁 lenguage-support/   (Lenguage syntax)
```

---

## 🎯 Three-Level Instruction System

### Level 1: AI Agent Entry Points (Quick Start)
**Purpose:** Optimized for specific AI agents  
**Files:**
- `CLAUDE.md` (11.6 KB) - For Claude Code
- `.github/COPILOT-INSTRUCTIONS.md` (7.2 KB) - For GitHub Copilot

**Contains:**
- Key facts about Wire-DSL
- Essential references
- Common workflows
- Quick checklists

**Best for:** "I'm using an AI agent, what do I need to know?"

---

### Level 2: Comprehensive Developer Guide (Complete Reference)
**Purpose:** Full development guidance for any developer or AI  
**File:**
- `.ai/AI-INSTRUCTIONS-MAIN.md` (10.4 KB)

**Contains:**
- Complete architecture
- Core concepts explained
- Development workflows
- Quality checklists
- Important files reference

**Best for:** "I need to understand this project deeply"

---

### Level 3: Navigation & Specialized Reference (Lookup)
**Purpose:** Find specific information quickly  
**Files:**
- `.ai/AI-INSTRUCTIONS-INDEX.md` (10.8 KB) - Navigation hub
- `docs/` folder - Public documentation
- `specs/` folder - Technical specifications

**Contains:**
- Quick lookup tables
- Cross-references
- Learning paths
- Topic-specific guidance

**Best for:** "Where do I find information about [X]?"

---

## 🔄 Navigation Flows

### For GitHub Copilot Users
```
1. Start: .github/COPILOT-INSTRUCTIONS.md
2. Need more? → .ai/AI-INSTRUCTIONS-MAIN.md
3. Specific topic? → Use .ai/AI-INSTRUCTIONS-INDEX.md
4. Deep dive? → Check docs/ or specs/ folder
```

### For Claude Code Users
```
1. Start: CLAUDE.md
2. Need more? → .ai/AI-INSTRUCTIONS-MAIN.md
3. Specific topic? → Use .ai/AI-INSTRUCTIONS-INDEX.md
4. Deep dive? → Check docs/ or specs/ folder
```

### For Manual Developers
```
1. Start: .ai/AI-INSTRUCTIONS-MAIN.md
2. Find resources? → .ai/AI-INSTRUCTIONS-INDEX.md
3. Learn language? → docs/DSL-SYNTAX.md
4. Reference spec? → specs/ folder
5. See examples? → examples/ folder
```

---

## 📊 File Sizes & Content

| File | Size | Purpose | For |
|------|------|---------|-----|
| CLAUDE.md | 11.6 KB | Claude Code instructions | Claude users |
| COPILOT-INSTRUCTIONS.md | 7.2 KB | Copilot instructions | Copilot users |
| AI-INSTRUCTIONS-MAIN.md | 10.4 KB | Complete dev guide | Developers/AI |
| AI-INSTRUCTIONS-INDEX.md | 10.8 KB | Navigation hub | Everyone |
| .ai/README.md | 7.8 KB | Folder overview | Project understanding |

**Total:** ~48 KB of instruction documentation (lean and efficient)

---

## ✨ Key Features

### ✅ Centralized
- All AI guidance in one place (`.ai/` folder)
- Clear organization
- No duplication

### ✅ Multi-Level
- Quick references for AI agents
- Comprehensive guide for developers
- Navigation hub for lookup

### ✅ Well-Linked
- Cross-references between docs
- Easy navigation
- Clear information hierarchy

### ✅ AI-Optimized
- Tailored for different AI agents
- Structured for agent consumption
- Machine-readable organization

### ✅ Comprehensive
- Covers all development aspects
- Links to detailed docs
- Includes planning documents

### ✅ English-Only
- Consistent language
- Global accessibility
- Professional documentation

---

## 🎓 Information Architecture

```
User's Question → Entry Point → Navigation → Source

"What is Wire-DSL?"
    ↓
Start with AI-INSTRUCTIONS-MAIN.md
    ↓
Read: Core Concepts section
    ↓
Reference: ARCHITECTURE.md for details

"How do I add a component?"
    ↓
Start with AI-INSTRUCTIONS-MAIN.md
    ↓
Read: Development Workflows section
    ↓
Follow: Checklist for adding new component
    ↓
Reference: COMPONENTS-REFERENCE.md
    ↓
See examples: examples/ folder

"Where's the validation rule for X?"
    ↓
Start with AI-INSTRUCTIONS-INDEX.md
    ↓
Look up: Quick reference table
    ↓
Find: specs/VALIDATION-RULES.md
    ↓
Reference: VALIDATION-RULES.md section

"I'm using Copilot, what do I do?"
    ↓
Start with .github/COPILOT-INSTRUCTIONS.md
    ↓
Find relevant section
    ↓
Reference external docs if needed
    ↓
Check examples for patterns
```

---

## 🔍 Search Strategy

**For Questions About:**

| Topic | Primary Resource | Secondary |
|-------|-----------------|-----------|
| DSL Syntax | docs/DSL-SYNTAX.md | .ai/AI-INSTRUCTIONS-MAIN.md |
| Components | docs/COMPONENTS-REFERENCE.md | examples/ |
| Architecture | docs/ARCHITECTURE.md | .ai/AI-INSTRUCTIONS-MAIN.md |
| Layout System | specs/LAYOUT-ENGINE.md | docs/ARCHITECTURE.md |
| IR Schema | specs/IR-CONTRACT.md | .ai/AI-INSTRUCTIONS-MAIN.md |
| Validation | specs/VALIDATION-RULES.md | .ai/AI-INSTRUCTIONS-MAIN.md |
| How to develop | .ai/AI-INSTRUCTIONS-MAIN.md | AI agent-specific file |
| Where to find X | .ai/AI-INSTRUCTIONS-INDEX.md | .ai/README.md |

---

## 🚀 Quick Start Paths

### Path 1: GitHub Copilot User (5 min)
```
1. Read: .github/COPILOT-INSTRUCTIONS.md
2. Bookmark: .ai/AI-INSTRUCTIONS-MAIN.md
3. Check: examples/ folder for patterns
4. Done! Start developing
```

### Path 2: Claude Code User (5 min)
```
1. Read: CLAUDE.md
2. Bookmark: .ai/AI-INSTRUCTIONS-MAIN.md
3. Check: examples/ folder for patterns
4. Done! Start developing
```

### Path 3: Experienced Developer (10 min)
```
1. Read: .ai/AI-INSTRUCTIONS-MAIN.md
2. Bookmark: .ai/AI-INSTRUCTIONS-INDEX.md
3. Reference: docs/ and specs/ as needed
4. Done! Ready to contribute
```

### Path 4: New Team Member (30 min)
```
1. Read: .ai/AI-INSTRUCTIONS-MAIN.md
2. Review: docs/ARCHITECTURE.md
3. Learn: docs/DSL-SYNTAX.md
4. Study: .ai/AI-INSTRUCTIONS-INDEX.md
5. Done! Understanding the project
```

---

## 🎯 Use Case Matrix

| Scenario | Start Here | Then Use | Goal |
|----------|-----------|----------|------|
| **Quick fix** | COPILOT or CLAUDE file | .ai/MAIN | Immediate answers |
| **New feature** | .ai/MAIN | Development workflow | Build correctly |
| **Find info** | .ai/INDEX | Topic-specific docs | Located resource |
| **Learn system** | docs/ARCHITECTURE | .ai/MAIN + specs | Understanding |
| **Code review** | specs/ folder | .ai/MAIN | Validate |
| **Troubleshoot** | docs/ folder | .ai/INDEX | Debug |

---

## 📋 Implementation Summary

✅ **Instruction Files Created:**
- `CLAUDE.md` - Claude Code instructions
- `.github/COPILOT-INSTRUCTIONS.md` - GitHub Copilot instructions
- `.ai/AI-INSTRUCTIONS-MAIN.md` - Comprehensive development guide
- `.ai/AI-INSTRUCTIONS-INDEX.md` - Navigation hub
- `.ai/README.md` - Folder overview
- `AI-INSTRUCTIONS-SETUP.md` - This system's guide

✅ **Centralization Achieved:**
- All AI guidance in `.ai/` folder
- AI agent-specific files at appropriate locations
- Clear navigation hierarchy
- All documentation in English

✅ **Quality Features:**
- Cross-references between documents
- Multiple entry points for different users
- Table of contents for quick lookup
- Learning paths for different roles
- Search strategy guides

---

## 🔗 Quick Reference

**AI Agent-Specific Files:**
- Claude Code: [CLAUDE.md](../../CLAUDE.md)
- GitHub Copilot: [.github/COPILOT-INSTRUCTIONS.md](../../.github/COPILOT-INSTRUCTIONS.md)

**Development Guidance:**
- Main Guide: [.ai/AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)
- Navigation: [.ai/AI-INSTRUCTIONS-INDEX.md](AI-INSTRUCTIONS-INDEX.md)
- Folder Info: [.ai/README.md](README.md)

**Setup & Overview:**
- System Guide: [AI-INSTRUCTIONS-SETUP.md](../../AI-INSTRUCTIONS-SETUP.md)
- This File: Architecture overview

---

## 📊 Documentation Statistics

| Category | Files | Size | Status |
|----------|-------|------|--------|
| **AI Instructions** | 5 | ~48 KB | ✅ Complete |
| **Public Docs** | 8 | ~200 KB | ✅ Existing |
| **Specifications** | 3 | ~150 KB | ✅ Existing |
| **Examples** | 15+ | ~100 KB | ✅ Existing |

**Total Documentation:** ~500 KB (comprehensive coverage)

---

**Last Updated:** January 24, 2026  
**Documentation Language:** English  
**For:** Wire-DSL v1.0+

**👉 Start Here:**
- Using Copilot? → [.github/COPILOT-INSTRUCTIONS.md](../../.github/COPILOT-INSTRUCTIONS.md)
- Using Claude? → [CLAUDE.md](../../CLAUDE.md)
- Manual Dev? → [.ai/AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)
- Finding Info? → [.ai/AI-INSTRUCTIONS-INDEX.md](AI-INSTRUCTIONS-INDEX.md)
