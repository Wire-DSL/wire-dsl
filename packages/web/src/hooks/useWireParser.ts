import { useState, useEffect } from 'react';

export interface WireRenderResult {
  svg: string;
  width: number;
  height: number;
  projectName: string;
  screenCount: number;
  componentCount: number;
}

export interface WireDiagnostic {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Hook to parse Wire DSL code and render to SVG
 * 
 * NOTE: @wire-dsl/core uses Node.js dependencies (pdfkit, fs, etc)
 * and cannot run directly in the browser.
 * 
 * TODO: Implement one of:
 * 1. Web Worker wrapper around core
 * 2. Backend API endpoint for parsing/rendering
 * 3. Rust/WASM version of parser
 * 
 * For now: Basic validation + placeholder SVG rendering
 */
export function useWireParser(code: string) {
  const [renderResult, setRenderResult] = useState<WireRenderResult | null>(null);
  const [diagnostics, setDiagnostics] = useState<WireDiagnostic[]>([]);
  const [renderState, setRenderState] = useState<'idle' | 'parsing' | 'rendering'>('idle');

  useEffect(() => {
    if (!code || code.trim().length === 0) {
      setRenderResult(null);
      setDiagnostics([]);
      return;
    }

    try {
      setRenderState('parsing');

      // Basic syntax validation
      const errors: WireDiagnostic[] = [];

      // Check for required keywords
      if (!code.includes('project')) {
        errors.push({
          line: 1,
          column: 1,
          message: 'Missing "project" declaration',
          severity: 'error',
        });
      }

      if (!code.includes('screen')) {
        errors.push({
          line: code.split('\n').findIndex((l) => l.includes('project')) + 1,
          column: 1,
          message: 'Missing "screen" declaration',
          severity: 'error',
        });
      }

      // Check bracket matching
      const open = code.match(/{/g)?.length || 0;
      const close = code.match(/}/g)?.length || 0;
      if (open !== close) {
        errors.push({
          line: code.split('\n').length,
          column: code.split('\n')[code.split('\n').length - 1].length,
          message: `Mismatched braces: ${open} open, ${close} close`,
          severity: 'error',
        });
      }

      if (errors.length > 0) {
        setDiagnostics(errors);
        setRenderResult(null);
        setRenderState('idle');
        return;
      }

      // Generate placeholder SVG with metadata
      setRenderState('rendering');

      const lines = code.split('\n');
      const projectMatch = code.match(/project\s+"([^"]+)"/);
      const projectName = projectMatch?.[1] || 'Wireframe';

      // Extract component count
      const componentCount = (code.match(/component\s+\w+/gi) || []).length;

      const placeholderSvg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <style>
      .bg { fill: #F8FAFC; }
      .border { stroke: #E2E8F0; stroke-width: 1; }
      .text { font-family: -apple-system, system-ui, sans-serif; font-size: 14px; fill: #475569; }
      .title { font-size: 24px; font-weight: 600; fill: #1E293B; }
      .meta { font-size: 12px; fill: #94A3B8; }
    </style>
  </defs>
  <rect width="800" height="600" class="bg border"/>
  <g>
    <text x="40" y="60" class="title">${projectName}</text>
    <text x="40" y="100" class="text">Lines: ${lines.length}</text>
    <text x="40" y="125" class="text">Components: ${componentCount}</text>
    <rect x="40" y="160" width="720" height="380" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="8"/>
    <text x="400" y="360" class="meta" text-anchor="middle">
      Preview rendering in progress...
    </text>
    <text x="400" y="385" class="meta" text-anchor="middle" style="font-size: 11px;">
      Awaiting backend parser integration
    </text>
  </g>
</svg>`;

      setRenderResult({
        svg: placeholderSvg,
        width: 800,
        height: 600,
        projectName,
        screenCount: 1,
        componentCount,
      });

      setDiagnostics([]);
      setRenderState('idle');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown parsing error';
      setDiagnostics([
        {
          line: 1,
          column: 1,
          message,
          severity: 'error',
        },
      ]);
      setRenderResult(null);
      setRenderState('idle');
    }
  }, [code]);

  return {
    renderResult,
    diagnostics,
    renderState,
  };
}
