#!/usr/bin/env pwsh

# Wire DSL Extension - Quick Debug Script
# This script helps you quickly test the Wire DSL extension in VS Code

Write-Host "Wire DSL VS Code Extension - Debug Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$extensionPath = Get-Location

Write-Host "Extension location: $extensionPath" -ForegroundColor Green
Write-Host ""

# Check if dependencies are installed
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Build extension
Write-Host "Building extension..." -ForegroundColor Yellow
npm run esbuild

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Extension compiled successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Open this folder in VS Code: code ." -ForegroundColor White
    Write-Host "2. Press F5 (Run → Start Debugging)" -ForegroundColor White
    Write-Host "3. In the debug window, open any .wire file" -ForegroundColor White
    Write-Host ""
    Write-Host "Example test files:" -ForegroundColor Cyan
    Write-Host "  - packages/vscode-extension/test-syntax.wire" -ForegroundColor White
    Write-Host "  - examples/simple-dashboard.wire" -ForegroundColor White
    Write-Host "  - examples/card-and-stat-card-demo.wire" -ForegroundColor White
    Write-Host ""
    Write-Host "Expected syntax highlighting:" -ForegroundColor Cyan
    Write-Host "  🔵 Blue:    Keywords (project, screen, grid, Button, etc.)" -ForegroundColor Blue
    Write-Host "  🟢 Green:   Strings (""text here"")" -ForegroundColor Green
    Write-Host "  🟣 Purple:  Hex colors (#3B82F6)" -ForegroundColor Magenta
    Write-Host "  🔷 Cyan:    Numbers (12, md, xs, lg, etc.)" -ForegroundColor Cyan
    Write-Host "  ⚫ Gray:    Comments (// and /* */)" -ForegroundColor Gray
} else {
    Write-Host "❌ Build failed. Please check the error messages above." -ForegroundColor Red
}
