# @wire-dsl/core

## Unreleased

### Fixed

- **PDF Font Resolution**: Fix pdfkit font resolution in bundled contexts (VS Code Extension, CLI, etc.)
  - Implement dynamic Helvetica.afm path resolution using `require.resolve()`
  - Add support for custom font paths via `exportMultipagePDF(options)` parameter
  - Graceful fallback to pdfkit defaults if resolution fails
  - Adds 4 resolution strategies to handle different execution contexts
  - Resolves font file path errors in: webpack bundles, Electron, esbuild, vite, and npm packages

## 0.1.0

### Minor Changes

- [`71b9042`](https://github.com/Wire-DSL/wire-dsl/commit/71b9042d0a8b28a6021132cd53716a2e3569ab1f) Thanks [@roxguel](https://github.com/roxguel)! - 🎉 First official release with Core package exporters and automated publishing pipeline
