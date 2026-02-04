/**
 * WirePreviewButton.tsx
 * 
 * Client-side component for generating and displaying Wire-DSL previews.
 * Handles rendering, error states, and loading indicators.
 */

import { useState } from 'preact/hooks';
import { prepareCodeForRendering, validateWireCode } from '../lib/wire-code-wrapper';
import '../styles/preview-block.css';

interface Props {
  code: string;
}

export default function WirePreviewButton({ code }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePreview = async () => {
    setIsLoading(true);
    setError(null);
    setSvgContent(null);

    try {
      // Validate original code
      const validation = validateWireCode(code);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid Wire-DSL code');
      }

      // Prepare code for rendering (auto-wrap if needed)
      const preparedCode = prepareCodeForRendering(code);

      // Validate prepared code
      const preparedValidation = validateWireCode(preparedCode);
      if (!preparedValidation.valid) {
        throw new Error('Failed to prepare code for rendering');
      }

      // Try to render using @wire-dsl/engine
      // This will be loaded dynamically to avoid bloating the page
      const svg = await renderWireDSL(preparedCode);

      if (!svg) {
        throw new Error('Failed to generate SVG preview');
      }

      setSvgContent(svg);
      setShowPreview(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to render preview';
      setError(errorMessage);
      console.error('Preview generation error:', err);
      setShowPreview(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setSvgContent(null);
    setError(null);
  };

  return (
    <div className="wire-preview-controls">
      <button
        onClick={handleGeneratePreview}
        disabled={isLoading}
        className="wire-preview-btn"
        title="Generate an interactive preview of this Wire-DSL code"
      >
        {isLoading ? (
          <>
            <span className="spinner">⏳</span>
            <span>Generating Preview...</span>
          </>
        ) : (
          <>
            <span>▶️</span>
            <span>Preview</span>
          </>
        )}
      </button>

      {showPreview && (
        <div className="wire-preview-modal-overlay" onClick={handleClosePreview}>
          <div className="wire-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wire-preview-modal-header">
              <h3>Wire-DSL Preview</h3>
              <button
                onClick={handleClosePreview}
                className="wire-preview-close-btn"
                title="Close preview"
              >
                ✕
              </button>
            </div>

            <div className="wire-preview-modal-body">
              {error ? (
                <div className="wire-preview-error">
                  <strong>❌ Preview Error</strong>
                  <p>{error}</p>
                  <details className="wire-preview-error-details">
                    <summary>View generated code</summary>
                    <pre>{prepareCodeForRendering(code)}</pre>
                  </details>
                </div>
              ) : svgContent ? (
                <div
                  className="wire-preview-svg-container"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              ) : (
                <div className="wire-preview-loading">
                  <div className="spinner-large">⏳</div>
                  <p>Generating preview...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Render Wire-DSL code to SVG using @wire-dsl/engine
 * Dynamically imported to reduce page bundle
 */
async function renderWireDSL(code: string): Promise<string | null> {
  try {
    // Dynamically import the engine only when needed
    const { parseWireDSL, renderToSVG } = await import('@wire-dsl/engine');

    // Parse the Wire-DSL code
    const ast = parseWireDSL(code);

    if (!ast) {
      return null;
    }

    // Render to SVG
    const svg = renderToSVG(ast, {
      // Optional: viewport size, theme, etc.
      width: 800,
      height: 600,
    });

    return svg;
  } catch (err) {
    console.error('Wire-DSL rendering error:', err);
    throw new Error(
      `Failed to render: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }
}
