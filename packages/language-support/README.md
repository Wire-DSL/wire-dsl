# @wire-dsl/language-support

Shared language metadata and tooling for Wire DSL.

It powers autocomplete, syntax metadata, grammar helpers, and document parsing across editors/tools.

## Installation

```bash
npm install @wire-dsl/language-support
```

## Module Support

The package publishes both module formats:
- ESM (`import`)
- CommonJS (`require`)

## Quick Start

```ts
import {
  ALL_KEYWORDS,
  COMPONENTS,
  LAYOUTS,
  ICON_NAMES,
  type IconName,
  getCompletions,
} from '@wire-dsl/language-support';

const suggestions = getCompletions('tab');
```

## Main Exports

From `@wire-dsl/language-support`:
- `KEYWORDS`, `PROPERTIES`, `ALL_KEYWORDS`
- `COMPONENTS`, `LAYOUTS`, `PROPERTY_VALUES`
- `ICON_NAMES`, `ICON_NAME_OPTIONS`, `IconName`
- `getCompletions`, `getKeywordsByType`

Subpath exports:
- `@wire-dsl/language-support/components`
- `@wire-dsl/language-support/completions`
- `@wire-dsl/language-support/grammar`
- `@wire-dsl/language-support/documentation`
- `@wire-dsl/language-support/document-parser`
- `@wire-dsl/language-support/context-detection`

## Notes

- `COMPONENTS` / `LAYOUTS` include the latest DSL metadata (for example `split` with `left`/`right`, `background`, `border`).
- Icon properties (`Icon.type`, `IconButton.icon`, `Topbar.icon`, `Image.icon`, `Stat.icon`) are backed by a shared icon catalog.

## Documentation

- `INTEGRATION-GUIDE.md`
- `STRATEGY.md`

## License

MIT