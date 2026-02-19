# @wire-dsl/language-support Integration Guide

This package is the single source of truth for Wire DSL language metadata.

## What You Get

- component/layout metadata
- keyword/property catalogs
- completion helpers
- parser/context helpers for editor tooling
- typed icon catalog (`ICON_NAMES`, `IconName`)

## Import Patterns

### ESM

```ts
import { COMPONENTS, LAYOUTS, getCompletions } from '@wire-dsl/language-support';
import { getContextualCompletions } from '@wire-dsl/language-support/completions';
```

### CommonJS

```js
const { COMPONENTS, LAYOUTS, getCompletions } = require('@wire-dsl/language-support');
const { getContextualCompletions } = require('@wire-dsl/language-support/completions');
```

## Editor Integration (Monaco / Custom)

```ts
import {
  ALL_KEYWORDS,
  COMPONENTS,
  ICON_NAME_OPTIONS,
  getCompletions,
} from '@wire-dsl/language-support';

const keywordNames = ALL_KEYWORDS.map((k) => k.name);
const componentNames = Object.keys(COMPONENTS);
const iconOptions = ICON_NAME_OPTIONS;
```

Use `COMPONENTS` and `LAYOUTS` to drive:
- hover docs
- property completion
- enum completion
- validation hints

## Useful Subpaths

- `@wire-dsl/language-support/components`
- `@wire-dsl/language-support/completions`
- `@wire-dsl/language-support/grammar`
- `@wire-dsl/language-support/documentation`
- `@wire-dsl/language-support/document-parser`
- `@wire-dsl/language-support/context-detection`

## Icon Catalog

```ts
import { ICON_NAMES, type IconName } from '@wire-dsl/language-support';

const first: IconName = ICON_NAMES[0];
```

This is the same catalog used for metadata validation in icon-related properties.

## Recommended Flow for Tool Authors

1. use `COMPONENTS`/`LAYOUTS` as the schema source
2. use `getContextualCompletions` for smart suggestions
3. use `document-parser` + `context-detection` for richer editor features
4. keep tool docs synced with package metadata on each release