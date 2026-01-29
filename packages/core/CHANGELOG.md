# @wire-dsl/core

## 0.1.5

### Patch Changes

- [#14](https://github.com/Wire-DSL/wire-dsl/pull/14) [`2a858f4`](https://github.com/Wire-DSL/wire-dsl/commit/2a858f4bd8200f85f9b8a8c2f76c46ed69b8cb1a) Thanks [@roxguel](https://github.com/roxguel)! - fix: elegantly resolve pdfkit fonts without monkeypatching

  Replace fs.readFileSync monkeypatch with clean solution:
  - Pass font: null to PDFDocument constructor to prevent auto-loading
  - Explicitly register and load fonts after document creation
  - Use require.resolve() for bundler-aware path resolution
  - Add missing type definitions for font option and font() method
  - Graceful fallback to Courier if Helvetica cannot be resolved

  This approach eliminates hacks and improves code maintainability.

- [#14](https://github.com/Wire-DSL/wire-dsl/pull/14) [`2a858f4`](https://github.com/Wire-DSL/wire-dsl/commit/2a858f4bd8200f85f9b8a8c2f76c46ed69b8cb1a) Thanks [@roxguel](https://github.com/roxguel)! - fix(core): add missing type definitions for pdfkit font option and method

## 0.1.4

### Patch Changes

- [#11](https://github.com/Wire-DSL/wire-dsl/pull/11) [`00550fc`](https://github.com/Wire-DSL/wire-dsl/commit/00550fc8d839e83a8fee474870a7ab1cfadb1087) Thanks [@roxguel](https://github.com/roxguel)! - fix(core): monkeypatch fs.readFileSync to resolve pdfkit font paths in bundled contexts

## 0.1.3

### Patch Changes

- [#8](https://github.com/Wire-DSL/wire-dsl/pull/8) [`5783506`](https://github.com/Wire-DSL/wire-dsl/commit/5783506cb8eb9bc3ce7e08596ff826c29092787a) Thanks [@roxguel](https://github.com/roxguel)! - Add packages readmes

- [#7](https://github.com/Wire-DSL/wire-dsl/pull/7) [`6b4c7ae`](https://github.com/Wire-DSL/wire-dsl/commit/6b4c7ae34e702e374e589bb188a47c8ccd86358b) Thanks [@roxguel](https://github.com/roxguel)! - resolve pdfkit font path dynamically for bundled contexts

## 0.1.2

### Patch Changes

- [#5](https://github.com/Wire-DSL/wire-dsl/pull/5) [`a64e3cf`](https://github.com/Wire-DSL/wire-dsl/commit/a64e3cf03dbcfdac692e9b7bfc21b6fe26323150) Thanks [@roxguel](https://github.com/roxguel)! - add package-specific READMEs

## 0.1.1

### Patch Changes

- [#3](https://github.com/Wire-DSL/wire-dsl/pull/3) [`d780619`](https://github.com/Wire-DSL/wire-dsl/commit/d78061999f8b38e45fe39a4ebd94096067906d9b) Thanks [@roxguel](https://github.com/roxguel)! - CI build and automerge

## 0.1.0

### Minor Changes

- [`71b9042`](https://github.com/Wire-DSL/wire-dsl/commit/71b9042d0a8b28a6021132cd53716a2e3569ab1f) Thanks [@roxguel](https://github.com/roxguel)! - 🎉 First official release with Core package exporters and automated publishing pipeline
