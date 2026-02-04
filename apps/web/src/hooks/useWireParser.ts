import { useState, useEffect } from 'react';
import {
  parseWireDSL,
  generateIR,
  calculateLayout,
  renderToSVG,
} from '@wire-dsl/engine';
import type { IRContract } from '@wire-dsl/engine';

export interface WireRenderResult {
  svg: string;
  width: number;
  height: number;
  projectName: string;
  screenCount: number;
  componentCount: number;
  screens: Array<{ name: string; id: string }>;
  selectedScreenName: string;
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
 * Uses @wire-dsl/engine for parsing, IR generation, layout calculation, and rendering.
 * All operations run in the browser (engine is pure JS/TS with no Node.js dependencies).
 *
 * Pipeline:
 * 1. Parse DSL code to AST using Chevrotain parser
 * 2. Generate IR (Intermediate Representation) with validation
 * 3. Calculate layout positions and dimensions
 * 4. Render to SVG with all visual properties
 */
export function useWireParser(code: string, selectedScreenName?: string | null) {
  const [renderResult, setRenderResult] = useState<WireRenderResult | null>(null);
  const [diagnostics, setDiagnostics] = useState<WireDiagnostic[]>([]);
  const [renderState, setRenderState] = useState<'idle' | 'parsing' | 'rendering'>('idle');

  useEffect(() => {
    if (!code || code.trim().length === 0) {
      setRenderResult(null);
      setDiagnostics([]);
      return;
    }

    const processWireCode = async () => {
      try {
        setRenderState('parsing');
        const errors: WireDiagnostic[] = [];

        // 1. Parse DSL to AST
        let ast;
        try {
          ast = parseWireDSL(code);
        } catch (parseError) {
          const message =
            parseError instanceof Error
              ? parseError.message
              : 'Failed to parse Wire DSL';
          errors.push({
            line: 1,
            column: 1,
            message,
            severity: 'error',
          });
          setDiagnostics(errors);
          setRenderResult(null);
          setRenderState('idle');
          return;
        }

        // 2. Generate IR
        let ir: IRContract;
        try {
          ir = generateIR(ast);
        } catch (irError) {
          const message =
            irError instanceof Error
              ? irError.message
              : 'Failed to generate IR';
          errors.push({
            line: 1,
            column: 1,
            message,
            severity: 'error',
          });
          setDiagnostics(errors);
          setRenderResult(null);
          setRenderState('idle');
          return;
        }

        // 3. Calculate layout
        setRenderState('rendering');
        let layout;
        try {
          layout = calculateLayout(ir);
        } catch (layoutError) {
          const message =
            layoutError instanceof Error
              ? layoutError.message
              : 'Failed to calculate layout';
          errors.push({
            line: 1,
            column: 1,
            message,
            severity: 'error',
          });
          setDiagnostics(errors);
          setRenderResult(null);
          setRenderState('idle');
          return;
        }

        // 4. Render to SVG
        let svgOutput: string;
        const screenToRender = selectedScreenName
          ? ir.project.screens.find((s) => s.name === selectedScreenName)
          : null;
        
        const screenName = screenToRender?.name || ir.project.screens[0]?.name;
        
        try {
          svgOutput = renderToSVG(ir, layout, { screenName });
        } catch (renderError) {
          const message =
            renderError instanceof Error
              ? renderError.message
              : 'Failed to render SVG';
          errors.push({
            line: 1,
            column: 1,
            message,
            severity: 'error',
          });
          setDiagnostics(errors);
          setRenderResult(null);
          setRenderState('idle');
          return;
        }

        // Success: extract metadata and set result
        const screenCount = ir.project.screens.length;
        const componentCount = ir.project.screens.reduce(
          (total: number, screen: any) => total + countComponents(screen),
          0
        );

        // Get dimensions for the rendered screen
        const renderedScreen = ir.project.screens.find((s) => s.name === screenName);
        const width = renderedScreen?.viewport.width || 800;
        const height = renderedScreen?.viewport.height || 600;

        // Build screens list with name and id
        const screens = ir.project.screens.map((screen) => ({
          name: screen.name,
          id: screen.id,
        }));

        setRenderResult({
          svg: svgOutput,
          width,
          height,
          projectName: ir.project.name,
          screenCount,
          componentCount,
          screens,
          selectedScreenName: screenName,
        });

        setDiagnostics([]);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        setDiagnostics([
          {
            line: 1,
            column: 1,
            message,
            severity: 'error',
          },
        ]);
        setRenderResult(null);
      } finally {
        setRenderState('idle');
      }
    };

    processWireCode();
  }, [code, selectedScreenName]);

  return {
    renderResult,
    diagnostics,
    renderState,
  };
}

/**
 * Helper to count components in a screen
 */
function countComponents(screen: any): number {
  if (!screen.layout) return 0;

  let count = 0;
  const countInNode = (node: any) => {
    if (node.type === 'component') {
      count++;
    } else if (node.children) {
      node.children.forEach(countInNode);
    }
  };

  countInNode(screen.layout);
  return count;
}
