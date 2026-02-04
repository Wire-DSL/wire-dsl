# @wire-dsl/language-support NPM Strategy

## Executive Summary

**Viability**: ✅ YES - Highly Recommended  
**ROI**: 17.7x (elimina 650+ líneas duplicadas)  
**Effort**: 4 horas  
**Risk**: LOW (non-breaking changes)

---

## The Problem & Solution

### Current State (Duplicated Code)
```
VS Code Extension:  components.ts (250) + documentation.ts (300) = 550 líneas
Monaco Editor:      wireLanguage.ts (80 hardcoded) = 80 líneas
CLI tools:          validators (50) = 50 líneas
────────────────────────────────────────────────────────────────────
TOTAL:              780+ LÍNEAS DUPLICADAS 😱
```

### After Publishing language-support
```
@wire-dsl/language-support:    450 líneas (single source)
Used by VS Code (refactored):  40 líneas (imports)
Used by Monaco (optimized):    30 líneas (imports)
Used by CLI (updated):         20 líneas (imports)
────────────────────────────────────────────────────────────────────
TOTAL:                         540 líneas (31% reduction) ✅
```

---

## What Can Be Eliminated

### ✅ Fully Replaceable (650 lines)
- `src/data/components.ts` (250) → DELETE
- `src/data/documentation.ts` (300) → DELETE  
- `syntaxes/wire.tmLanguage.json` (100) → AUTO-GENERATED

### ✅ Partially Replaceable (290 lines)
- `completionProvider.ts`: 150 → 40 lines (73% reduction)
- `hoverProvider.ts`: 80 → 35 lines (56% reduction)
- `definitionProvider.ts`: 60 → 40 lines (33% reduction)

---

## Implementation Timeline

### Phase 1: Publish (30 min - THIS WEEK)
```bash
npm publish @wire-dsl/language-support@1.0.0
# Verify on npmjs.com
```

### Phase 2: Update Wire Live (30 min)
```json
// apps/web/package.json
"@wire-dsl/language-support": "^1.0.0"  // was: workspace:*
```

### Phase 3: Refactor VS Code Extension (2-3 hours)
- Delete redundant data files
- Refactor providers to import from language-support
- Test and publish v2.0.0 to Marketplace

---

## Code Examples: Before & After

### VS Code Completion Provider

**BEFORE** (150 lines):
```typescript
export class CompletionProvider {
  provideCompletionItems() {
    const completions = [];
    COMPONENTS.forEach(comp => {
      completions.push({
        label: comp.name,
        kind: CompletionItemKind.Class,
        detail: comp.description,
      });
    });
    PROPERTIES.forEach(prop => {
      completions.push({
        label: prop.name,
        kind: CompletionItemKind.Property,
        detail: prop.description,
      });
    });
    return completions;
  }
}
```

**AFTER** (40 lines):
```typescript
import { getCompletions } from '@wire-dsl/language-support';

export class CompletionProvider {
  provideCompletionItems() {
    return getCompletions(word).map(item => ({
      label: item.label,
      kind: this.mapKind(item.kind),
      detail: item.detail,
      documentation: item.documentation,
      insertText: item.insertText,
    }));
  }

  private mapKind(kind: string) {
    return {
      keyword: CompletionItemKind.Keyword,
      component: CompletionItemKind.Class,
      property: CompletionItemKind.Property,
    }[kind];
  }
}
```

---

## Risk Assessment

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| NPM package has bugs | Very Low | Use monorepo first (workspace:*) |
| Breaking changes | Very Low | Semver strict (^1.0.0) |
| Extension fails | Low | Comprehensive tests + rollback |
| NPM down | Very Low | npm ci locks versions |

**Overall Risk**: 🟢 LOW

---

## Next Steps

1. **Today**: Publish to NPM (30 min) → `npm publish`
2. **Tomorrow**: Update Wire Live Web (30 min)
3. **This Week**: Refactor VS Code Extension (2-3 hours)
4. **Result**: Cleaner code, better architecture, community-friendly package

---

## Files in This Package

- `src/index.ts` - Keywords, components, properties definitions
- `src/completions.ts` - Autocomplete & IntelliSense logic
- `src/grammar.ts` - Monarch & TextMate grammar
- `src/generate-grammar.ts` - Auto-generates wire.tmLanguage.json
- `package.json` - NPM manifest with export configuration

All compiled to `dist/` with full TypeScript declarations.
