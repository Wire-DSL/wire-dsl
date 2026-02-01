# @wire-dsl/language-support

Shared language definitions for Wire DSL - used by Monaco Editor, VS Code, and CLI tools.

## Installation

```bash
npm install @wire-dsl/language-support
```

## Quick Start

```typescript
import { getCompletions, ALL_KEYWORDS } from '@wire-dsl/language-support';
import { MONACO_GRAMMAR } from '@wire-dsl/language-support/grammar';

// Use completions
const suggestions = getCompletions('but'); // → [button, ...]

// Use grammar for syntax highlighting
// See INTEGRATION-GUIDE.md for setup
```

## What's Included

- **35+ Keywords & Components** - All Wire DSL language definitions
- **Autocomplete Logic** - Context-aware suggestions
- **Syntax Grammar** - For Monaco, VS Code, and TextMate editors

## Documentation

- **[STRATEGY.md](STRATEGY.md)** - NPM publication strategy & rationale
- **[INTEGRATION-GUIDE.md](INTEGRATION-GUIDE.md)** - How to use in your tool

## Exports

```typescript
// Keywords and components
export { ALL_KEYWORDS, KEYWORDS, PROPERTIES } from '@wire-dsl/language-support';
export { getCompletions, getKeywordsByType } from '@wire-dsl/language-support';

// Grammar for syntax highlighting
export { MONACO_GRAMMAR, TOKENIZE_RULES } from '@wire-dsl/language-support/grammar';

// Advanced completions
export { getContextualCompletions } from '@wire-dsl/language-support/completions';
```

## Published Versions

- **1.0.0** - Initial release with 35+ keywords and components

## License

MIT - See LICENSE in root directory
