#!/bin/bash
# Verification Script for WireDSL Monorepo Setup

echo "🔍 WireDSL Monorepo Verification Script"
echo "========================================"
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  echo "  ✅ Node.js installed: $NODE_VERSION"
else
  echo "  ❌ Node.js not found. Install from https://nodejs.org/"
  exit 1
fi

# Check pnpm
echo ""
echo "✓ Checking pnpm..."
if command -v pnpm &> /dev/null; then
  PNPM_VERSION=$(pnpm --version)
  echo "  ✅ pnpm installed: $PNPM_VERSION"
else
  echo "  ⚠️  pnpm not found. Installing..."
  npm install -g pnpm
fi

# Check Git
echo ""
echo "✓ Checking Git..."
if command -v git &> /dev/null; then
  GIT_VERSION=$(git --version)
  echo "  ✅ $GIT_VERSION"
else
  echo "  ❌ Git not found. Install from https://git-scm.com/"
  exit 1
fi

# Check project structure
echo ""
echo "✓ Checking project structure..."
if [ -d "packages/core" ] && [ -d "packages/cli" ] && [ -d "packages/web" ]; then
  echo "  ✅ All packages found"
else
  echo "  ❌ Package directories not found"
  exit 1
fi

# Check configuration files
echo ""
echo "✓ Checking configuration files..."
required_files=(
  "package.json"
  "turbo.json"
  "tsconfig.json"
  ".eslintrc.json"
  ".prettierrc.json"
)

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file not found"
  fi
done

# Summary
echo ""
echo "========================================"
echo "✅ Verification Complete!"
echo ""
echo "Next steps:"
echo "  1. pnpm install"
echo "  2. cd packages/web && pnpm dev"
echo "  3. Open http://localhost:3000"
echo ""
echo "For more info, read START_HERE.txt"
echo "========================================"
