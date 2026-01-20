# WireDSL Technical Stack

## Core Technologies

- **Runtime**: Node.js 20+ (LTS) + Browser (ESM)
- **Language**: TypeScript 5.x (strict mode)
- **Package Manager**: pnpm (workspaces support)
- **Build Tool**: Vite (fast, optimized for TS + React)
- **Testing**: Vitest + Testing Library

## Repository Architecture

### Monorepo Structure

```
packages/
├── core/           # @wire-dsl/core - Motor compartido
├── cli/            # @wire-dsl/cli - Herramienta de línea de comandos
├── web-editor/     # @wire-dsl/web - Live editor online
└── visual-editor/  # @wire-dsl/studio - WYSIWYG (roadmap)
```

**Justificación del Monorepo**:

- **Desarrollo coordinado**: Cambios en el core se prueban inmediatamente en CLI y web
- **Versionado sincronizado**: Evita incompatibilidades entre paquetes
- **DX superior**: Un solo `git clone`, una sola instalación
- **CI/CD simplificado**: Un pipeline para todo
- **Refactoring seguro**: TypeScript puede validar cambios cross-package

**Alternativa Multi-repo**:

- Mejor para proyectos con ciclos de release independientes
- Más complejo: requiere git submodules o npm dependencies
- Mayor fricción para contributors

**Decisión**: Monorepo con publicación independiente a NPM

## Core Package (@wire-dsl/core)

### Parser

- **Library**: Chevrotain 11.x
- **Output**: TypeScript AST types
- **Size target**: < 50KB minified

### IR Generator

- **Input**: AST from parser
- **Output**: JSON IR (contract-compliant)
- **Validation**: Zod schemas

### Layout Engine

- **Algorithm**: CSS Grid resolver (custom)
- **Dependencies**: None (pure TS)
- **Output**: Positioned elements with dimensions

### Renderer

- **Output**: SVG (DOM-independent)
- **Library**: Custom SVG builder (no external deps)
- **Format**: Optimized, accessible SVG

## Web Editor (@wire-dsl/web)

### Framework: React 18

**Justificación**:

- Ecosistema maduro para editores (Monaco, CodeMirror)
- Mermaid Live usa React - patrón probado
- Excelente soporte para drag-and-drop (react-dnd, dnd-kit)
- Base sólida para futuro WYSIWYG

### UI Components

- **Editor**: Monaco Editor (mismo de VS Code)
- **Preview**: Custom React component wrapping SVG
- **Layout**: TailwindCSS + shadcn/ui
- **Icons**: Lucide React

### State Management

- **Local**: Zustand (ligero, < 1KB)
- **Sync**: URL params para shareable links
- **Persistence**: LocalStorage + IndexedDB (drafts)

### Hosting & Deployment

- **Platform**: Cloudflare Pages (primary) o GitHub Pages (fallback)
- **CDN**: Cloudflare CDN (built-in)
- **SSL**: Automático
- **Domain**: Custom domain support

**Cloudflare Pages vs Vercel**:

- ✅ Cloudflare: Generous free tier, edge computing, mejor analytics
- ✅ GitHub Pages: Simple, gratuito, ideal para open-source
- ⚠️ Vercel: Más features pero vendor lock-in

## CLI Package (@wire-dsl/cli)

### Framework

- **Commander.js**: Parsing de argumentos
- **Chalk**: Output coloreado
- **Ora**: Spinners y progress

### Commands

```bash
wire render input.wire -o output.svg
wire validate input.wire
wire watch input.wire --live-reload
wire init [template]
```

### Output Formats

- SVG (default)
- PNG (via sharp)
- PDF (roadmap - via puppeteer)

### Distribution

- NPM package: `npm install -g @wire-dsl/cli`
- Binary releases: GitHub Releases (compiled with pkg)

## Build & Deployment

### Core + CLI

- **Bundler**: tsup (ultra-rápido para libraries)
- **Target**: ESM + CJS
- **Registry**: NPM (public)

### Web Editor

- **Bundler**: Vite (optimizado React + TS)
- **Hosting**: Cloudflare Pages
- **Deploy**: Git push → auto-deploy
- **Preview**: Branch deployments

## Development Tools

### Code Quality

- **Linter**: ESLint + TypeScript ESLint
- **Formatter**: Prettier
- **Git Hooks**: Husky + lint-staged
- **Commit**: Conventional Commits

### CI/CD

- **Platform**: GitHub Actions
- **Versioning**: Changesets
- **Orchestration**: Turborepo (build cache)
- **Tests**: Run on PR + main

### Documentation

- **Site**: VitePress o Docusaurus
- **API Docs**: TypeDoc (auto-generated)
- **Examples**: In-repo examples/

## Key Dependencies

### Production Dependencies

```json
{
  "@wire-dsl/core": {
    "chevrotain": "^11.0.0",
    "zod": "^3.22.0"
  },
  "@wire-dsl/cli": {
    "@wire-dsl/core": "workspace:*",
    "commander": "^11.0.0",
    "chalk": "^5.0.0",
    "ora": "^7.0.0",
    "sharp": "^0.33.0"
  },
  "@wire-dsl/web": {
    "@wire-dsl/core": "workspace:*",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "monaco-editor": "^0.45.0",
    "zustand": "^4.0.0",
    "@radix-ui/react-*": "latest",
    "tailwindcss": "^3.4.0"
  }
}
```

### Development Dependencies

```json
{
  "vite": "^5.0.0",
  "vitest": "^1.0.0",
  "typescript": "^5.3.0",
  "tsup": "^8.0.0",
  "turborepo": "^1.11.0",
  "@changesets/cli": "^2.27.0",
  "eslint": "^8.0.0",
  "prettier": "^3.0.0"
}
```

## Performance Targets

- **Core bundle**: < 100KB gzipped
- **Web app initial load**: < 200KB (excludes Monaco)
- **Parse time**: < 50ms para 1000 líneas .wire
- **Render time**: < 100ms para wireframe complejo
- **Time to Interactive**: < 2s en 3G

## Security & Best Practices

### Code Security

- **Dependencies**: Automated security audits (Dependabot)
- **Secrets**: No secrets in repo, use GitHub Secrets
- **CSP**: Content Security Policy headers en web

### Accessibility

- **Web**: WCAG 2.1 AA compliance
- **SVG Output**: Semantic markup, ARIA labels
- **Keyboard**: Full keyboard navigation

## Roadmap Tech Additions

### Phase 2: Visual Editor

- **Canvas**: Konva.js o Fabric.js
- **Drag & Drop**: dnd-kit
- **Property Panel**: react-hook-form + zod
- **Undo/Redo**: immer + history stack

### Phase 3: Collaboration (Premium)

- **Real-time**: Yjs + y-websocket
- **Backend**: Hono (edge-compatible)
- **DB**: Turso (SQLite edge) o Cloudflare D1
- **Auth**: Clerk o Auth0

### Phase 4: Integrations

- **VS Code Extension**: LSP server
- **Figma Plugin**: Exportar a .wire
- **API**: REST API para conversiones

## AI Integration Strategy

### Free Tier: Bring Your Own Key

- OpenAI API key (user provides)
- Anthropic Claude API key
- Local Ollama (self-hosted LLM)
- User controls costs

### Pro Tier: Built-in AI

- Anthropic Claude Haiku (nosotros pagamos)
- 100 generations/mes included
- Backend: Hono on Cloudflare Workers
- Rate limiting per subscription

### System Architecture

```
┌─────────────────┐
│  Web Editor     │
│  (React + Monaco)
└────────┬────────┘
         │
         ├─ User's API Key
         │  └─ Direct LLM call (client)
         │
         └─ Pro Subscription
            └─ Cloudflare Worker
               ├─ Validate auth
               ├─ Track usage
               └─ Call pooled API key
```

### LLM Providers

- **Primary**: Anthropic Claude (cost-effective)
- **Fallback**: OpenAI GPT-4 Turbo (user key)
- **Local**: Ollama support (privacy-first)

### Prompt Engineering

- System prompt: Specialized en WireDSL syntax
- Few-shot examples en prompt
- Output validation contra WireDSL schema
- Regeneration on invalid syntax

### Competitive Advantage

- ✅ Free (with user key) vs Figma AI ($23/mes)
- ✅ Code-exportable vs design-only tools
- ✅ Open-source vs proprietary
- ✅ Privacy option (local Ollama)

### Cost Model

- Claude Haiku: ~$0.004 per user/mes
- Pro subscription: $15/mes
- **Gross margin**: ~99.7%
- **Breakeven**: 1 Pro user per 3750 free users

## Open Source Strategy

### License

- **Core**: MIT License (máxima adopción)
- **CLI**: MIT License
- **Web Editor**: MIT License
- **Visual Editor**: MIT License (basic) + Commercial (advanced features)

### Community

- **Repository**: GitHub (público)
- **Issues**: GitHub Issues + Discussions
- **Contributions**: CONTRIBUTING.md con guidelines
- **Code of Conduct**: Contributor Covenant

## Business Model (Open-Source Friendly)

### Free Tier (Always Free)

- Core library (MIT)
- CLI tool
- Web editor básico
- Self-hosted visual editor

### Premium Cloud (SaaS)

- ☁️ **WireDSL Cloud**: Hosted visual editor
- 👥 **Collaboration**: Real-time editing teams
- 🔒 **Private projects**: Cloud storage
- 📊 **Analytics**: Usage tracking
- 🎨 **Premium templates**: Curated library

### Enterprise

- 🏢 **On-premise**: Self-hosted con soporte
- 🔐 **SSO/SAML**: Enterprise auth
- 📞 **Support**: SLA garantizado
- 🎓 **Training**: Custom workshops

### Monetization Strategy

1. **Open core**: Todo el motor gratis
2. **Cloud hosting**: Pago por conveniencia
3. **Enterprise features**: Compliance, security, soporte
4. **Marketplace**: Templates y plugins premium (revenue share)

### Pricing Reference

- Free: $0/mes (unlimited local)
- Pro: $10/mes (cloud + collaboration)
- Team: $25/user/mes (advanced features)
- Enterprise: Custom pricing

## Project Naming

### Current: "WireDSL"

**Pros**:

- ✅ Claro: "Wire" + "DSL" describe exactamente qué es
- ✅ Técnico: Atractivo para desarrolladores
- ✅ Memorable: Corto, fácil de escribir
- ✅ Available: Dominio `.com` probablemente disponible

**Contras**:

- ⚠️ Generic: "DSL" puede sonar muy técnico para diseñadores
- ⚠️ No evoca acción: No dice "prototyping" o "wireframing"

### Alternativas a Considerar

- **WireSpec**: Más enfocado a especificación
- **ProtoWire**: Enfatiza prototyping
- **SketchDSL**: Para diseñadores
- **Wireframe**: Directo pero genérico

**Recomendación**: Mantener **WireDSL**

- SEO-friendly: "wire dsl", "wireframe dsl"
- Target audience: Desarrolladores primero, diseñadores después
- Brand evolution: "WireDSL Cloud", "WireDSL Studio"

### Package Naming

- Core: `@wire-dsl/core` o `wiredsl`
- CLI: `@wire-dsl/cli` → comando `wire`
- Web: Dominio `wiredsl.dev` o `wire-dsl.com`

## Next Steps

1. ✅ Define technical stack
2. ⬜ Setup monorepo con pnpm + turborepo
3. ⬜ Implement parser (Chevrotain)
4. ⬜ Build IR generator
5. ⬜ Create layout engine
6. ⬜ Develop SVG renderer
7. ⬜ Package CLI tool
8. ⬜ Build web editor MVP
9. ⬜ Deploy to Cloudflare Pages
10. ⬜ Launch open-source + beta

---

**Last Updated**: January 20, 2026
**Status**: ✅ Stack Defined - Ready for Implementation
