# Contributing to Wire-DSL

Thank you for your interest in contributing to Wire-DSL! This document provides guidelines and instructions for contributing.

Wire-DSL is a **monorepo** with multiple packages:
- `@wire-dsl/engine` - Parser, IR, layout, renderer
- `@wire-dsl/exporters` - SVG, PNG, PDF export
- `@wire-dsl/cli` - Command-line tool
- `@wire-dsl/language-support` - Editor integrations
- `@wire-dsl/editor-ui` - Reusable components
- `apps/web` - Web editor
- `apps/docs` - Documentation site

## Reporting Issues

### Bug Reports

Use the **"Bug report"** issue template and include:
- Clear description of the bug
- Steps to reproduce
- Expected vs. actual behavior
- Node.js version and OS
- Minimal reproducible example if possible

### Feature Requests

Use the **"Feature request"** issue template with:
- Use case and motivation
- Proposed solution (if you have one)
- Examples or mockups

### Questions

Prefer **GitHub Discussions** for questions: https://github.com/Wire-DSL/wire-dsl/discussions

## Getting Started

### Prerequisites

- Node.js 20+ (LTS recommended)
- pnpm 8+
- Git

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/wire-dsl/wire-dsl.git
cd wire-dsl

# Install all dependencies (monorepo)
pnpm install

# Start development mode (watches all packages)
pnpm dev
```

For specific packages:
```bash
# Engine package
cd packages/engine
pnpm dev

# Web editor
cd apps/web
pnpm dev

# Documentation
cd apps/docs
pnpm dev
```

## Development Workflow

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Making Changes

1. **Edit code** in your feature branch
2. **Run tests** to ensure nothing breaks: `pnpm test`
3. **Check types**: `pnpm type-check`
4. **Lint code**: `pnpm lint`
5. **Format code**: `pnpm format`

### Committing Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "chore: maintenance tasks"
git commit -m "docs: update documentation"
git commit -m "test: add test cases"
git commit -m "refactor: reorganize code"
```

### Creating a Pull Request

1. Push your branch: `git push origin feature/your-feature-name`
2. Open a PR on GitHub
3. Describe your changes clearly
4. Reference related issues: `Fixes #123` (when possible)
5. Wait for review and CI checks

## PR Conventions

### Linking to Issues

- Associate your PR with an issue when possible
- Use `Fixes #123` to auto-close related issues
- Include context in the PR description

### Keep Changes Focused

- One feature or bug fix per PR
- Avoid mixing refactoring with feature work
- Keep PRs reasonably sized for easier review

### When Modifying DSL Syntax or Behavior

- Update relevant documentation in `docs/` or `apps/docs/`
- Add test cases if the project has tests
- Include examples in the PR description
- Update TypeDoc comments for API changes

### Code Quality Standards

- Run `pnpm test` before submitting
- Run `pnpm lint` and `pnpm format`
- Pass `pnpm type-check`
- All CI checks must pass

### When in Doubt

- Open an issue first to discuss the approach
- We prefer incremental, focused changes
- Ask for guidance before starting major work
- Comment PRs are welcome and encouraged

## Package-Specific Development

Working on a specific package?

```bash
# Test a single package
pnpm test --filter=@wire-dsl/engine

# Build a single package
pnpm build --filter=@wire-dsl/cli

# Lint a single package
pnpm lint --filter=@wire-dsl/language-support
```

### Adding Dependencies

Use workspace protocol for internal dependencies:

```bash
# Add external dependency to a package
cd packages/core
pnpm add zod

# Add internal dependency
pnpm add @wire-dsl/engine --workspace
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
cd packages/core
pnpm test:watch

# Run with coverage
pnpm test -- --coverage
```

### Writing Tests

Create test files alongside source files:

```
src/
├── parser/
│   ├── index.ts
│   └── index.test.ts
```

Use Vitest syntax:

```typescript
import { describe, it, expect } from 'vitest';
import { parseWireDSL } from './index';

describe('parseWireDSL', () => {
  it('should parse simple wireframe', () => {
    const input = 'wireframe "Login" { }';
    const result = parseWireDSL(input);
    expect(result.name).toBe('Login');
  });
});
```

## Code Quality

### Linting

```bash
# Check for issues
pnpm lint

# Fix issues automatically
pnpm lint:fix
```

### Type Checking

```bash
pnpm type-check
```

### Code Style

We use Prettier for formatting. Format is applied automatically on commit.

## Documentation

### Updating Docs

- Update relevant `.md` files in `/docs`
- Update API docs with TypeDoc comments
- Include examples in code comments

### TypeDoc Comments

````typescript
/**
 * Parses a WireDSL string into an AST
 *
 * @param input - The WireDSL source code
 * @returns The parsed AST
 *
 * @example
 * ```ts
 * const ast = parseWireDSL('wireframe "Login" {}');
 * ```
 */
export function parseWireDSL(input: string): ParsedWireframe {
  // ...
}
````

## Version Management

### Creating a Changeset

```bash
pnpm changeset
```

This will prompt you to:

1. Select which packages changed
2. Choose version bump (major, minor, patch)
3. Write a change description



## Code Review Process

- At least one approval required
- All CI checks must pass
- Code must follow project style guide
- Documentation must be updated

## Resources

- [Wire-DSL Documentation](https://wire-dsl.org)
- [DSL Syntax Guide](../docs/DSL-SYNTAX.md)
- [Architecture Overview](../docs/ARCHITECTURE.md)
- [Development Roadmap](../docs/ROADMAP.md)

## ✨ Recognition

Contributors are recognized in:

- GitHub contributors page
- Release notes
- Documentation

## Questions or Need Help?

- Open a **GitHub Discussion** (preferred for questions)
- Check **existing issues and PRs** to avoid duplicates
- Review **documentation** in `/docs` and `/apps/docs`

---

**Thank you for contributing to Wire-DSL!**
