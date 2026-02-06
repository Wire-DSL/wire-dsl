# Support

Thank you for using Wire-DSL! This document explains how to get help.

## Where to Get Help

### Questions & General Support

Use **GitHub Discussions** (if enabled) for:
- How to use Wire-DSL features
- Best practices and examples
- General questions about the project

### Bugs & Issues

Use **GitHub Issues** with the **"Bug report"** template for:
- Reproducible bugs
- Unexpected behavior
- Errors or crashes

### Feature Requests

Use **GitHub Issues** with the **"Feature request"** template for:
- New features or enhancements
- Improvements to existing features
- Design proposals

## Before Opening an Issue

### Check Your Version

Include your package version when reporting bugs:

```bash
npm list @wire-dsl/engine
npm list @wire-dsl/cli
```

Add this to your issue: `@wire-dsl/engine@1.0.0`

### Search for Existing Issues

- Check **existing issues** to avoid duplicates
- Review **closed issues** for resolved problems
- Check **pull requests** for ongoing work

### For Bugs: Include These Details

- Node.js version: `node --version`
- pnpm version: `pnpm --version`
- Operating system (Windows, macOS, Linux)
- Steps to reproduce the bug
- Expected vs. actual behavior
- Error messages and stack traces
- Minimal reproducible example (if possible)

**Example bug report:**

```
### Description
The CLI fails when rendering large wireframes.

### Steps to Reproduce
1. Create a .wire file with 500+ components
2. Run `wire render large.wire -o output.svg`
3. CLI crashes with "Maximum call stack exceeded"

### Environment
- Node.js 20.11
- pnpm 8.15
- @wire-dsl/cli@1.0.0
- macOS 14.2

### Error Output
```
Error: Maximum call stack size exceeded
    at computeLayout (packages/engine/src/layout/index.ts:42)
```
```

## Response Times

- Critical bugs: Response within 24-48 hours
- Regular bugs: Response within 1 week
- Feature requests: Response when reviewed
- Questions: Respond as bandwidth allows

## Community

- **GitHub Discussions** - Ask questions and share ideas
- **GitHub Issues** - Report bugs and request features
- **Pull Requests** - Contribute fixes and improvements

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Troubleshooting

### Common Issues

**"Command not found: wire"**

Make sure the CLI is installed globally:
```bash
npm install -g @wire-dsl/cli
npm list -g @wire-dsl/cli
```

**"Module not found: @wire-dsl/engine"**

Verify installation in your project:
```bash
npm list @wire-dsl/engine
npm install @wire-dsl/engine
```

**Syntax errors in .wire files**

Use the CLI to validate:
```bash
wire validate myfile.wire
```

**Permission denied errors**

Check file and directory permissions:
```bash
ls -la output/  # Check directory is writable
```

### Getting More Help

1. Review the [official documentation](https://wire-dsl.org)
2. Check [existing discussions](https://github.com/wire-dsl/wire-dsl/discussions)
3. Search [closed issues](https://github.com/wire-dsl/wire-dsl/issues?q=is%3Aissue+is%3Aclosed)
4. Open a new issue or discussion

## Reporting Security Vulnerabilities

For security issues, please email security@wire-dsl.org instead of using public issues.

---

Thank you for helping improve Wire-DSL!
