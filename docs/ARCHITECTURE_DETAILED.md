# WireDSL Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        WireDSL Ecosystem                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ User Interfaces (Input)                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   Web Editor     │  │   CLI Tool       │  │ Future: VS   │  │
│  │  (React + Monaco)│  │ (Commander.js)   │  │ Code Ext     │  │
│  │ - Live preview   │  │ - render         │  │              │  │
│  │ - AI generation  │  │ - validate       │  │              │  │
│  │ - Code editor    │  │ - init           │  │              │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────────────┘  │
│           │                     │                               │
└───────────┼─────────────────────┼───────────────────────────────┘
            │                     │
            └─────────────┬───────┘
                          │
                  Input: .wire files
                          │
            ┌─────────────▼─────────────────────────────────────┐
            │     @wire-dsl/core (Engine)                      │
            ├──────────────────────────────────────────────────┤
            │                                                   │
            │  ┌──────────────────────────────────────────┐    │
            │  │ 1. PARSER (Chevrotain)                  │    │
            │  │   Input:  .wire (text)                  │    │
            │  │   Output: AST (tokens)                  │    │
            │  └──────────────┬───────────────────────────┘    │
            │                 │                                 │
            │  ┌──────────────▼───────────────────────────┐    │
            │  │ 2. IR GENERATOR                         │    │
            │  │   Input:  AST                           │    │
            │  │   Output: IR Contract (JSON)            │    │
            │  │   - Validates schema with Zod           │    │
            │  └──────────────┬───────────────────────────┘    │
            │                 │                                 │
            │  ┌──────────────▼───────────────────────────┐    │
            │  │ 3. LAYOUT ENGINE                        │    │
            │  │   Input:  IR                            │    │
            │  │   Output: Positioned components         │    │
            │  │   - CSS Grid resolver                   │    │
            │  │   - Calculates x, y, width, height      │    │
            │  └──────────────┬───────────────────────────┘    │
            │                 │                                 │
            │  ┌──────────────▼───────────────────────────┐    │
            │  │ 4. SVG RENDERER                         │    │
            │  │   Input:  Layout + IR                   │    │
            │  │   Output: SVG (DOM-independent)         │    │
            │  │   - Accessible, optimized               │    │
            │  │   - Exportable, scalable                │    │
            │  └──────────────┬───────────────────────────┘    │
            │                 │                                 │
            └─────────────────┼──────────────────────────────────┘
                              │
                    Output: SVG / IR / AST
                              │
            ┌─────────────────┴───────────────────────────────┐
            │                                                 │
    ┌───────▼──────────┐                          ┌──────────▼────┐
    │  Preview/Export  │                          │ Further Uses  │
    │  - SVG file      │                          │ - Figma       │
    │  - PNG file      │                          │ - Code gen    │
    │  - PDF file      │                          │ - Prototyping │
    └──────────────────┘                          └───────────────┘
```

## AI Integration Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        AI-Powered Generation                      │
└──────────────────────────────────────────────────────────────────┘

User Input: "Create a login form with email, password, and remember me"
        │
        ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  FREE TIER: User provides API Key                           │
    │  ┌───────────────────────────────────────────────────────┐  │
    │  │ OpenAI / Anthropic / Ollama                           │  │
    │  │ (Client-side LLM call)                                │  │
    │  └───────────────────┬──────────────────────────────────┘  │
    └────────────────────┼────────────────────────────────────────┘
                         │
                    ┌────▼─────────────────────────────────────────┐
                    │  PRO TIER: Pooled API Keys                   │
                    │  ┌─────────────────────────────────────────┐ │
                    │  │ Cloudflare Worker (Backend)             │ │
                    │  │ - Claude Haiku (cost-effective)          │ │
                    │  │ - Rate limiting per user                 │ │
                    │  │ - Usage tracking via KV                  │ │
                    │  └─────────────────┬───────────────────────┘ │
                    └────────────────────┼──────────────────────────┘
                                         │
                        LLM Output: Raw WireDSL text
                                         │
                                    ┌────▼─────────────────┐
                                    │ WireDSL Validation   │
                                    │ - Parse & validate   │
                                    │ - Fix invalid syntax │
                                    └────┬────────────────┘
                                         │
                        Valid WireDSL → Feed to Parser
                                         │
                                    ┌────▼─────────────────┐
                                    │ Render Preview       │
                                    │ - Show in editor     │
                                    │ - User can adjust    │
                                    └─────────────────────┘
```

## Data Flow

```
.wire file (text)
    │
    ├─────────────────────────────────────────┐
    │                                         │
    ▼                                         ▼
PARSER (Chevrotain)                    Raw String
    │                                         │
    ▼                                         │
AST (Tokens)                                  │
    │                                         │
    ├─────────────────┐                       │
    │                 │                       │
    ▼                 │                       │
IR GENERATOR          │                       │
    │                 │                       │
    ▼                 │                       │
IR Contract (JSON)    │                       │
    │                 │                       ▼
    │                 │                   AI LLM Service
    │                 │                       │
    │                 │                       ▼
    │                 │                   Raw WireDSL
    │                 │                       │
    │                 └───────────┬───────────┘
    │                             │
    ├─────────────────────────────┘
    │
    ▼
LAYOUT ENGINE
    │
    ▼
Layout Positions (x, y, width, height)
    │
    ├─────────────────┐
    │                 │
    ▼                 ▼
SVG Renderer    Code Generator
    │                 │
    ▼                 ▼
SVG File       React/Vue Code
```

## Package Dependencies

```
@wire-dsl/web (React App)
    ├─ @wire-dsl/core
    ├─ monaco-editor
    ├─ react 18
    ├─ zustand
    └─ tailwindcss

@wire-dsl/cli (CLI Tool)
    ├─ @wire-dsl/core
    ├─ commander
    ├─ chalk
    ├─ ora
    └─ sharp

@wire-dsl/core (Engine)
    ├─ chevrotain (parser)
    └─ zod (validation)

@wire-dsl/ai-backend (Workers)
    ├─ hono
    ├─ zod
    └─ @cloudflare/workers-types

@wire-dsl/studio (Roadmap)
    └─ @wire-dsl/core
       ├─ konva.js (canvas)
       ├─ dnd-kit (drag-drop)
       ├─ react-hook-form (forms)
       └─ immer (undo/redo)
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      Production Deployment                        │
└──────────────────────────────────────────────────────────────────┘

Source: GitHub (main branch)
    │
    ├─────────────────────────┬──────────────────┬────────────────┐
    │                         │                  │                │
    ▼                         ▼                  ▼                ▼
Build & Test            Publish NPM      Deploy Web          Deploy AI
(CI/CD)              (@wire-dsl/*)    (Cloudflare Pages)   (Workers)
    │                         │                  │                │
    └─────────────────────────┼──────────────────┼────────────────┘
                              │                  │                │
                        ┌─────▼────┐    ┌──────┴──────┐    ┌─────▼────┐
                        │ NPM       │    │ Cloudflare │    │ Workers  │
                        │ Registry  │    │ CDN/Pages  │    │ KV Store │
                        │           │    │            │    │          │
                        │ @wire-dsl/│    │ wire-dsl   │    │ AI       │
                        │ core      │    │ .dev       │    │ Backend  │
                        │ @wire-dsl/│    │            │    │          │
                        │ cli       │    │            │    │ Rate     │
                        │ @wire-dsl/│    │            │    │ Limiting │
                        │ web       │    │            │    │ Usage    │
                        │           │    │            │    │ Tracking │
                        └───────────┘    └────────────┘    └──────────┘
```

## Technology Stack

### Core

- **Parser**: Chevrotain 11.x (TypeScript DSL generator)
- **Validation**: Zod 3.x (Schema validation)
- **Build**: tsup (Fast TypeScript bundler)

### Web Editor

- **Framework**: React 18 + Vite
- **Editor**: Monaco Editor (VS Code)
- **State**: Zustand (minimal store)
- **Styling**: Tailwind CSS + PostCSS
- **UI**: Radix UI components

### CLI

- **CLI Framework**: Commander.js
- **Output**: SVG, PNG, PDF (via sharp)
- **Colors**: Chalk
- **Progress**: Ora

### AI Backend

- **Framework**: Hono (Cloudflare Workers)
- **Deployment**: Cloudflare Workers
- **Storage**: Cloudflare KV
- **LLM**: Anthropic Claude (primary)

### DevOps

- **Build Orchestration**: Turborepo
- **Package Manager**: pnpm
- **Testing**: Vitest
- **Linting**: ESLint
- **Formatting**: Prettier
- **Version Management**: Changesets
- **CI/CD**: GitHub Actions
- **Hosting**: Cloudflare Pages / Workers

---

**Last Updated**: January 20, 2026  
**Status**: ✅ Complete Architecture Definition
