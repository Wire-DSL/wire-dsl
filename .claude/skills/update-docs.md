# Skill: update-docs

Update all Wire-DSL documentation to reflect recent code changes.

## Instructions

Scan the codebase for changes since the last documentation update and synchronize all documentation files. Follow the steps below in order.

### Step 1 — Identify what changed

Run `git diff main...HEAD --name-only` to find all modified files. Group them by area:
- Parser changes → affects DSL-SYNTAX.md, LLM-PROMPTING.md
- IR changes → affects IR-CONTRACT.md, VALIDATION-RULES.md
- Renderer changes → affects ARCHITECTURE.md, any SVG output docs
- New components → affects COMPONENTS-REFERENCE.md, LLM-PROMPTING.md
- New containers → affects CONTAINERS-REFERENCE.md, LLM-PROMPTING.md, AI-INSTRUCTIONS-MAIN.md
- New events/interactions → affects COMPONENTS-REFERENCE.md, CONTAINERS-REFERENCE.md, VALIDATION-RULES.md, LLM-PROMPTING.md, AI-INSTRUCTIONS-MAIN.md
- state.ts changes → affects AI-INSTRUCTIONS-MAIN.md (Important Files table)

### Step 2 — Update each affected documentation file

For each file that needs updating, read the current content first, then apply targeted edits. Never rewrite files wholesale — only update the sections that are stale.

**Files to check and update:**

| File | Update when |
|------|-------------|
| `docs/DSL-SYNTAX.md` | Parser grammar changed, new syntax added |
| `docs/COMPONENTS-REFERENCE.md` | New components, new props, new events |
| `docs/CONTAINERS-REFERENCE.md` | New containers, new container props |
| `docs/LLM-PROMPTING.md` | Any syntax change that affects how an LLM should generate Wire DSL |
| `docs/ARCHITECTURE.md` | Pipeline stages changed, new packages added |
| `docs/THEME-GUIDE.md` | Theme tokens changed |
| `docs/CLI-REFERENCE.md` | New CLI commands or flags |
| `specs/IR-CONTRACT.md` | IR schema changed (new fields, new node types) |
| `specs/VALIDATION-RULES.md` | New validation rules (EVT-*, layout rules, etc.) |
| `.ai/AI-INSTRUCTIONS-MAIN.md` | Core concepts changed (containers count, event system, important files) |

### Step 3 — Mirror changes to `apps/docs`

The `apps/docs/` Astro site has counterpart files that must stay in sync with the `docs/` source files. After updating any `docs/` file, apply the same content changes to the corresponding app file — preserving the Astro frontmatter (`---` block at the top).

| Source (`docs/`) | App counterpart (`apps/docs/src/content/docs/`) |
|---|---|
| `docs/DSL-SYNTAX.md` | `language/syntax.md` |
| `docs/COMPONENTS-REFERENCE.md` | `language/components.md` |
| `docs/CONTAINERS-REFERENCE.md` | `language/containers.md` |
| `docs/ICONS-GUIDE.md` | `language/icons.md` |
| `docs/THEME-GUIDE.md` | `language/configuration.md` |
| `docs/CLI-REFERENCE.md` | `tooling/cli.md` (if it exists) |

Only update app files whose source counterpart was changed in Step 2. Do not touch app files that have no corresponding source change.

### Step 4 — Update `llms.txt` and regenerate `llms-full.txt`

**`llms.txt`** is a manually maintained index of all user-facing docs (used as the LLM-friendly entry point). Update it only if:
- A new `docs/` file was added or removed
- A section title or link changed

Do **not** update `llms.txt` for content-only edits that don't change file paths or section structure.

**`llms-full.txt`** is generated automatically. After any `docs/` file change (content or structure), regenerate it by running:

```bash
pnpm docs:llms
```

This runs `scripts/generate-llms-full.js`, which concatenates `docs/DSL-SYNTAX.md`, `docs/COMPONENTS-REFERENCE.md`, `docs/CONTAINERS-REFERENCE.md`, `docs/ICONS-GUIDE.md`, and the CLI section into `llms-full.txt`. Always regenerate after Step 2 if any of those files were touched.

### Step 5 — Verify consistency

After updates, cross-check:
- Container count in AI-INSTRUCTIONS-MAIN.md matches actual containers in CONTAINERS-REFERENCE.md
- Event rules in VALIDATION-RULES.md match what the IR generator actually enforces
- LLM-PROMPTING.md examples are valid Wire DSL (parseable by current parser)
- Component events table in COMPONENTS-REFERENCE.md matches `supportedEvents` in `packages/language-support/src/components.ts`
- `apps/docs` counterpart files reflect the same changes as their `docs/` sources

### Step 6 — Report

Summarize what was updated and what was left unchanged. If any documentation section cannot be updated without more context, flag it explicitly so the user can provide clarification.

## Rules

- All documentation must be written in **English**
- Do not create new documentation files — update existing ones
- Do not add timestamps or "last updated" markers unless the file already has one
- Keep examples minimal and valid — every code example must be parseable Wire DSL
- Prefer targeted edits over full rewrites
