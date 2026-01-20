# Contributing to WireDSL

Thank you for your interest in contributing to WireDSL! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (LTS)
- pnpm 8+
- Git

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/wire-dsl/wire-dsl.git
cd wire-dsl

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## 📋 Development Workflow

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
git commit -m "docs: update documentation"
git commit -m "test: add test cases"
git commit -m "refactor: reorganize code"
```

### Creating a Pull Request

1. Push your branch: `git push origin feature/your-feature-name`
2. Open a PR on GitHub
3. Describe your changes clearly
4. Reference related issues: `Fixes #123`
5. Wait for review and CI checks

## 📦 Package Structure

### Working on Specific Packages

```bash
# Build only @wire-dsl/core
pnpm build:core

# Test only @wire-dsl/cli
pnpm test:cli

# Develop web editor
cd packages/web
pnpm dev
```

### Adding Dependencies

Use workspace protocol for internal dependencies:

```bash
# Add external dependency to a package
cd packages/core
pnpm add zod

# Add internal dependency
pnpm add @wire-dsl/core --workspace
```

## 🧪 Testing

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

## 🔍 Code Quality

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

## 📝 Documentation

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

## 🔄 Version Management

### Creating a Changeset

```bash
pnpm changeset
```

This will prompt you to:

1. Select which packages changed
2. Choose version bump (major, minor, patch)
3. Write a change description

## 🐛 Reporting Issues

When reporting bugs, include:

- **Description**: Clear explanation of the issue
- **Steps to Reproduce**: How to reproduce the bug
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Node version, OS, etc.

## 🎨 Code Review Process

- At least one approval required
- All CI checks must pass
- Code must follow project style guide
- Documentation must be updated

## 📚 Resources

- [WireDSL Docs](../docs/README.md)
- [Technical Stack](../docs/technical-stack.md)
- [DSL Syntax](../docs/dsl-syntax.md)

## ✨ Recognition

Contributors are recognized in:

- GitHub contributors page
- Release notes
- Documentation

## ❓ Questions?

- Open a GitHub Discussion
- Check existing issues and PRs
- Join our Discord community (coming soon)

---

**Thank you for contributing to WireDSL!** 🎉
