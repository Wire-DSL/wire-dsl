---
"@wire-dsl/core": patch
---

fix: elegantly resolve pdfkit fonts without monkeypatching

Replace fs.readFileSync monkeypatch with clean solution:
- Pass font: null to PDFDocument constructor to prevent auto-loading
- Explicitly register and load fonts after document creation
- Use require.resolve() for bundler-aware path resolution
- Add missing type definitions for font option and font() method
- Graceful fallback to Courier if Helvetica cannot be resolved

This approach eliminates hacks and improves code maintainability.
