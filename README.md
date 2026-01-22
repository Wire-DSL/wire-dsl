# 🎨 WireDSL

> **Wireframes as Code.** Declarative wireframing with AI-powered generation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-8+-FF6B6B)](https://pnpm.io/)

## What is WireDSL?

WireDSL is a **code-first wireframing tool** that lets you:

- ✍️ **Write wireframes as declarative code** (like Mermaid, but for UI)
- 🤖 **Generate from plain English** ("Create a login form..." → automatic wireframe)
- 📦 **Export to SVG, PNG, React, Vue, Figma**
- 🔓 **100% open-source** with premium cloud features
- ⚡ **AI-powered** (free with your API key, $15/mes for ours)

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start web editor
cd packages/web
pnpm dev
# → http://localhost:3000

# Use CLI
npm install -g @wire-dsl/cli
wire render myfile.wire -o output.svg

# Use as library
npm install @wire-dsl/core
import { parseWireDSL } from '@wire-dsl/core';
```

## 📖 First Time? Read This

1. **[START_HERE.txt](./START_HERE.txt)** - 2-minute orientation (REQUIRED)
2. **[QUICKSTART.md](./QUICKSTART.md)** - Setup guide (5 minutes)
3. **[MONOREPO.md](./MONOREPO.md)** - How the project is organized (10 minutes)

## 📚 Full Documentation

**Getting Started**

- **[QUICKSTART.md](./QUICKSTART.md)** - Get up and running
- **[MONOREPO.md](./MONOREPO.md)** - Project structure
- **[COMMANDS.md](./COMMANDS.md)** - Command reference
- **[.github/CONTRIBUTING.md](./.github/CONTRIBUTING.md)** - Contributing guide

**Technical**

- **[docs/technical-stack.md](./docs/technical-stack.md)** - All tech decisions
- **[docs/ARCHITECTURE_DETAILED.md](./docs/ARCHITECTURE_DETAILED.md)** - System design
- **[docs/overview.md](./docs/overview.md)** - Project vision
- **[docs/dsl-syntax.md](./docs/dsl-syntax.md)** - Language syntax

**Specifications**

- **[specs/ir-contract.md](./specs/ir-contract.md)** - Data format
- **[specs/layout-engine.md](./specs/layout-engine.md)** - Layout algorithms
- **[specs/components.md](./specs/components.md)** - Component library

**Planning & Next Steps**

- **[docs/RECOMMENDATION.md](./docs/RECOMMENDATION.md)** - What to do next
- **[docs/ACTION_PLAN.md](./docs/ACTION_PLAN.md)** - Concrete tasks for next 2 weeks

**Examples**

- **[examples/](./examples/)** - Complete examples

---

## 🎯 ¿Qué es WireDSL?

WireDSL es una plataforma para crear wireframes declarativos donde:

- ✍️ **Se declara**, no se dibuja
- 🤖 **AI-friendly**: sintaxis predecible para generación automática
- 📐 **Determinístico**: misma entrada → mismo output
- 🔄 **Versionable**: los wireframes son código

### Ejemplo Rápido

```
project "Dashboard" {
  tokens density: normal

  screen Home {
    layout stack(gap: md, padding: lg) {
      component Heading text: "Welcome"
      component Button text: "Get Started" onClick: goto("Dashboard")
    }
  }
}
```

## 📦 Packages

| Package                                       | Purpose                      | Status         |
| --------------------------------------------- | ---------------------------- | -------------- |
| [@wire-dsl/core](./packages/core)             | Parser, IR, layout, renderer | 🚧 In Progress |
| [@wire-dsl/cli](./packages/cli)               | Command-line tool            | 🚧 In Progress |
| [@wire-dsl/web](./packages/web)               | Live web editor              | 🚧 In Progress |
| [@wire-dsl/ai-backend](./packages/ai-backend) | AI service                   | 🚧 In Progress |
| [@wire-dsl/studio](./packages/studio)         | Visual editor (WYSIWYG)      | 📅 Roadmap     |

## 🎯 Example Workflow

### 1. Write Wireframe Code

```
wireframe "Login Form" {
  container main {
    input email { label: "Email" }
    input password { label: "Password" }
    button submit { text: "Sign In" }
  }
}
```

### 2. See Live Preview

- Monaco editor on the left
- SVG preview on the right
- Hot reload as you type

### 3. Generate with AI

```
User: "Create a login form with email, password, and remember me"
→ AI generates .wire code
→ Preview appears instantly
→ Edit if needed
```

### 4. Export

- SVG (scale to any size)
- PNG (with transparent background)
- React component (with TypeScript)
- Figma (coming soon)

## 🤖 AI Integration

### Free (Bring Your Own Key)

```javascript
// Use your OpenAI/Anthropic API key
const prompt = 'Create a dashboard with charts';
const wireframe = await generateWithAI(prompt, {
  provider: 'openai',
  apiKey: process.env.OPENAI_KEY,
});
```

### Pro Tier ($15/month)

```javascript
// No API key needed, we handle it
const wireframe = await generateWithAI(prompt, {
  subscription: 'pro', // Uses our pooled Claude Haiku
});
```

**Why this pricing?**

- Claude Haiku costs ~$0.004 per generation
- Pro subscription: $15/month = 3,750 free generations
- **99.7% gross margin** on first user!

## 🛠️ Tech Stack

**Core**

- TypeScript 5.3 (strict mode)
- Chevrotain 11.x (parser)
- Zod 3.x (validation)

**Web Editor**

- React 18
- Vite
- Monaco Editor
- Tailwind CSS

**Backend**

- Hono (Cloudflare Workers)
- Anthropic Claude API

**DevOps**

- pnpm + Turborepo
- Vitest (testing)
- GitHub Actions (CI/CD)
- Changesets (versioning)

**Deployment**

- Cloudflare Pages (web editor)
- Cloudflare Workers (AI service)
- NPM (CLI tool)

## 📊 Architecture

```
.wire (text)
   ↓
Parser (Chevrotain)
   ↓
AST (tokens)
   ↓
IR Generator
   ↓
IR Contract (JSON)
   ↓
Layout Engine
   ↓
Positioned Elements
   ↓
SVG Renderer
   ↓
SVG / PNG / PDF / React
```

**With AI:**

```
User Prompt
   ↓
LLM (Claude/OpenAI)
   ↓
Generated .wire code
   ↓ [enters pipeline above]
```

## 🚢 Deployment

- **Web Editor**: Automatic via Cloudflare Pages (git push → live)
- **AI Backend**: Automatic via Cloudflare Workers (git push → live)
- **CLI Tool**: Automatic via GitHub Actions + NPM (changesets → publish)

## 💰 Business Model

**Open Core + Cloud SaaS**

```
FREE (Forever)
├─ Core library (@wire-dsl/core)
├─ CLI tool (@wire-dsl/cli)
├─ Web editor (basic)
├─ Self-hosted visual editor
└─ AI with your API key

PRO ($15/month)
├─ Cloud visual editor
├─ AI generation (100/month with our key)
├─ Collaboration (coming soon)
├─ Private projects
└─ Premium templates

ENTERPRISE (Custom)
├─ On-premise
├─ SSO/SAML
├─ Custom integrations
└─ SLA support
```

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./.github/CONTRIBUTING.md).

**Quick start:**

```bash
git checkout -b feature/your-feature
cd packages/core
pnpm test:watch
# Make changes
git commit -m "feat(core): your feature"
git push origin feature/your-feature
# Create PR
```

## 🔗 Links

- **Website**: https://wire-dsl.dev (coming soon)
- **GitHub**: https://github.com/wire-dsl/wire-dsl
- **NPM Org**: https://www.npmjs.com/org/wire-dsl
- **Issues**: [GitHub Issues](https://github.com/wire-dsl/wire-dsl/issues)
- **Discussions**: [GitHub Discussions](https://github.com/wire-dsl/wire-dsl/discussions)

## 📄 License

MIT License - Free for personal and commercial use

## ✨ Why WireDSL?

### vs Figma

- ✅ Version control (git)
- ✅ Text-based (diffs)
- ✅ AI-friendly syntax
- ✅ Open source
- ❌ Less visual

### vs Mermaid

- ✅ Made for UI/UX
- ✅ Export to code
- ✅ More components
- ✅ AI generation
- ❌ Younger project

### vs Code Templates

- ✅ Language-agnostic
- ✅ Instant visual feedback
- ✅ AI-powered
- ✅ Collaborative (coming)
- ✅ No framework lock-in

## 🙏 Acknowledgments

Inspired by:

- **Mermaid** - Diagrams as code
- **Figma** - Collaborative design
- **React** - Component-based UIs
- **DSL design patterns** - Language engineering

## 📈 Roadmap

**Phase 1** (Current)

- [ ] Parser implementation
- [ ] IR generator
- [ ] Layout engine
- [ ] SVG renderer
- [ ] Web editor MVP

**Phase 2**

- [ ] Visual editor (WYSIWYG)
- [ ] Real-time collaboration
- [ ] Component library
- [ ] Code generation (React/Vue)

**Phase 3**

- [ ] Figma import/export
- [ ] VS Code extension
- [ ] LSP support
- [ ] Plugin system

**Phase 4**

- [ ] Design system integration
- [ ] Accessibility audits
- [ ] Performance profiling
- [ ] Enterprise features

## 👥 Status

```
✅ Architecture designed
✅ Tech stack decided
✅ Monorepo setup complete
✅ CI/CD pipelines ready
✅ AI strategy defined
🚧 Core engine (in progress)
📅 Web editor
📅 Visual editor
```

---

**Last Updated**: January 20, 2026  
**Status**: 🚀 Open Source, Production-Ready Monorepo
**Next**: `pnpm install && pnpm dev`
