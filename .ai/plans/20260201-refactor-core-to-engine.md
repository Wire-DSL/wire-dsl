# Refactor Plan: Core → Engine + Exporters

**Status**: Ready to Start  
**Branch**: `refactor/core-to-engine`  
**Date Started**: 2026-02-01  
**Objective**: Split `@wire-dsl/core` into `@wire-dsl/engine` (pure JS/TS, browser-safe) and `@wire-dsl/exporters` (Node.js I/O)

---

## 📋 Checklist Completo

### Phase 1: Package Reorganization

- [ ] **1.1** Rename `packages/core` → `packages/engine`
- [ ] **1.2** Update `packages/engine/package.json` (name: `@wire-dsl/engine`)
- [ ] **1.3** Update `packages/engine/README.md` and `CHANGELOG.md`
- [ ] **1.4** Create new `packages/exporters`
- [ ] **1.5** Copy exporters code to new package
- [ ] **1.6** Update `packages/exporters/package.json` (dependencies: sharp, pdfkit, fontkit)

### Phase 2: Import Updates

- [ ] **2.1** Update `packages/cli/src/` imports (`@wire-dsl/core` → `@wire-dsl/engine` + `@wire-dsl/exporters`)
- [ ] **2.2** Update `packages/vscode-extension/src/` imports (if exists)
- [ ] **2.3** Update `packages/web/src/hooks/useWireParser.ts` imports
- [ ] **2.4** Update root README.md (package table)
- [ ] **2.5** Update root QUICKSTART.md
- [ ] **2.6** Update root SETUP_COMPLETE.txt

### Phase 3: Configuration & Build

- [ ] **3.1** Update `pnpm-workspace.yaml` (if needed)
- [ ] **3.2** Update `turbo.json` (if needed)
- [ ] **3.3** Verify `package.json` root dependencies (remove if any)
- [ ] **3.4** Update GitHub Actions workflows:
  - [ ] **3.4a** `ci.yml` - Build filters
  - [ ] **3.4b** `release.yml` - Package list

### Phase 4: Verification & Testing

- [ ] **4.1** Run `pnpm install` to verify lock file
- [ ] **4.2** Run `pnpm build` - should build both packages
- [ ] **4.3** Run `pnpm test` - tests pass
- [ ] **4.4** Verify no `@wire-dsl/core` references remain in src/
- [ ] **4.5** CLI still works: `pnpm -F @wire-dsl/cli wire ...`

---

## 📁 Files to Modify/Create

### Directory Renames
```
packages/core/              → packages/engine/
  ├── package.json          (name, exports update)
  ├── README.md             (update references)
  ├── CHANGELOG.md          (remove export functions)
  ├── src/
  │   ├── index.ts          (remove export functions exports)
  │   ├── parser/           (KEEP - parseWireDSL, grammar)
  │   ├── ir/               (KEEP - IR generation)
  │   ├── layout/           (KEEP - layout engine)
  │   ├── renderer/         (KEEP - SVG rendering)
  │   └── exporters/        (DELETE - move to packages/exporters)
  └── ...

packages/exporters/        ← NEW PACKAGE
  ├── package.json          (name: @wire-dsl/exporters)
  ├── README.md             (describe export functions)
  ├── CHANGELOG.md
  ├── src/
  │   ├── index.ts          (export functions: exportSVG, exportPNG, exportMultipagePDF)
  │   ├── svg.ts            (SVG export logic)
  │   ├── png.ts            (PNG export logic)
  │   ├── pdf.ts            (PDF export logic)
  │   └── helpers.ts        (hexToRgba, preprocessSVGColors, etc)
  ├── tsconfig.json
  └── ...
```

### Files to Update

| File | Change | Type |
|------|--------|------|
| `packages/engine/package.json` | name, exports, description | Rename, Content |
| `packages/engine/README.md` | update title, examples, remove export functions | Content |
| `packages/engine/src/index.ts` | remove export from './exporters' | Content |
| `packages/exporters/package.json` | NEW - dependencies: sharp, pdfkit, fontkit | Create |
| `packages/exporters/README.md` | NEW - document exporters | Create |
| `packages/exporters/src/index.ts` | NEW - export functions | Create |
| `packages/cli/src/` | `@wire-dsl/core` → `@wire-dsl/engine`, add `@wire-dsl/exporters` | Content |
| `packages/web/package.json` | `@wire-dsl/core` → `@wire-dsl/engine` | Content |
| `packages/web/src/hooks/useWireParser.ts` | import from engine (no exporters) | Content |
| `.github/workflows/ci.yml` | filter: `@wire-dsl/engine` instead of `@wire-dsl/core` | Content |
| `.github/workflows/release.yml` | Update package references | Content |
| `README.md` | Update package table | Content |
| `QUICKSTART.md` | Update package references | Content |
| `SETUP_COMPLETE.txt` | Update package names | Content |

---

## 🔑 Key Decision Points

### Q: Should exporters be in pnpm-workspace.yaml?
**A**: Yes - it's a workspace package, already covered by `packages/*` pattern

### Q: Do we need separate CHANGELOG for exporters?
**A**: Yes - follows convention, helps users track deprecations in @wire-dsl/core

### Q: What about version numbers?
**A**: Both start at 0.1.0 (existing core version) unless changesets dictate otherwise

### Q: Do we need to support @wire-dsl/core anymore?
**A**: No - it's completely replaced by the two new packages. Consumers migrate to engine + exporters

### Q: What about backward compatibility?
**A**: None needed - this is a MAJOR breaking change. Users explicitly migrate to new packages

### Q: Should exporters be published to npm?
**A**: Yes - it's a public package for any Node.js project that needs wire exports

---

## 🚨 Things You Might Forget

✅ **Checked** - You should also remember to:

1. **GitHub Actions** - BOTH workflows reference `@wire-dsl/core`:
   - `ci.yml` line 47: `--filter "@wire-dsl/core"`
   - `release.yml` - general builds (OK since pnpm workspace handles it)

2. **Workspace Lock File** - `pnpm-lock.yaml` has `@wire-dsl/core` references
   - Will auto-regenerate after `pnpm install`

3. **Documentation** - Multiple files reference old package:
   - README.md (package table + import examples)
   - QUICKSTART.md (setup guide)
   - SETUP_COMPLETE.txt (project overview)
   - Core's own README.md
   - package.json files (dependencies)

4. **VSCode Extension** - If `packages/vscode-extension` exists:
   - May import from core
   - Needs update to engine + exporters

5. **Changelog Files** - Both packages should document:
   - engine: "Extracted from core package"
   - exporters: "New package for file I/O"

6. **Type Exports** - Check if `package.json` has `exports` field:
   - engine: export parser, IR, layout, renderer
   - exporters: export SVG, PNG, PDF functions

---

## 📊 Expected Outcome

**Before:**
```
@wire-dsl/core
├── Parser (pure JS)
├── IR generation (pure JS)
├── Layout (pure JS)
├── SVG renderer (pure JS)
├── SVG exporter (Node.js)
├── PNG exporter (Node.js, sharp)
└── PDF exporter (Node.js, pdfkit, fontkit)
```

**After:**
```
@wire-dsl/engine (pure JS/TS - works in browser)
├── Parser
├── IR generation
├── Layout
└── SVG renderer

@wire-dsl/exporters (Node.js only - file I/O)
├── SVG file export
├── PNG file export (sharp)
└── PDF file export (pdfkit, fontkit)
```

**Consumers:**
- **Web/Studio**: Import only `@wire-dsl/engine` (no Node.js deps)
- **CLI**: Import `@wire-dsl/engine` + `@wire-dsl/exporters`
- **VSCode Ext**: Import `@wire-dsl/engine` + `@wire-dsl/exporters`
- **AI Backend**: Import `@wire-dsl/engine` + `@wire-dsl/exporters` (if generating files)

---

## 🎯 Implementation Order

1. **Rename core → engine** (folder + package.json + README)
2. **Create exporters package** (copy code, update package.json)
3. **Update engine/src/index.ts** (remove exporter exports)
4. **Update all imports** (start with CLI, then web, docs)
5. **Update workflows** (ci.yml filter)
6. **Verify build** (pnpm build should work)
7. **Run tests** (pnpm test)
8. **Commit cleanly** (single commit or logical groups)

---

## ✅ Validation Checklist (Before Merge)

- [ ] Zero TypeScript errors: `pnpm type-check`
- [ ] Tests pass: `pnpm test`
- [ ] Build succeeds: `pnpm build` (both packages compile)
- [ ] No `@wire-dsl/core` in package imports (only internal references in docs)
- [ ] No .js files in src/ after build
- [ ] cli.wire command works: `pnpm -F @wire-dsl/cli wire [file.wire]`
- [ ] All GH Actions workflow references updated
- [ ] git log is clean (logical commit messages)

---

**Last Updated**: 2026-02-01  
**Prepared by**: GitHub Copilot  
**Next Step**: Execute Phase 1 (package rename)
