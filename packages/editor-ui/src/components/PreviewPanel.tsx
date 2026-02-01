/**
 * @file components/PreviewPanel.tsx
 * @description SVG preview panel component - OSS foundation
 *
 * Renders SVG output with zoom/pan controls.
 * Completely OSS-safe, no cloud features.
 */

import React, { useRef, useCallback, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import type { SVGRenderResult, RenderState } from '../types/index';

export interface PreviewPanelProps {
  /** SVG render result to display */
  renderResult: SVGRenderResult | null;

  /** Current render state */
  renderState: RenderState;

  /** Optional CSS class */
  className?: string;
}

export const PreviewPanel = React.forwardRef<HTMLDivElement, PreviewPanelProps>(
  ({ renderResult, renderState, className }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(100);
    const [pan, setPan] = useState({ x: 0, y: 0 });

    const handleZoomIn = useCallback(() => {
      setZoom((prev) => Math.min(500, prev + 10));
    }, []);

    const handleZoomOut = useCallback(() => {
      setZoom((prev) => Math.max(10, prev - 10));
    }, []);

    const handleReset = useCallback(() => {
      setZoom(100);
      setPan({ x: 0, y: 0 });
    }, []);

    return (
      <div
        ref={ref || containerRef}
        className={className || 'w-full h-full bg-slate-100 flex flex-col'}
        data-testid="preview-panel"
      >
        {/* Toolbar */}
        <div className="flex-shrink-0 flex items-center gap-2 p-2 bg-slate-200 border-b border-slate-300">
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-slate-300 rounded"
            title="Zoom out"
          >
            <ZoomOut size={18} />
          </button>

          <span className="text-sm font-mono text-slate-700 min-w-12">{zoom}%</span>

          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-slate-300 rounded"
            title="Zoom in"
          >
            <ZoomIn size={18} />
          </button>

          <div className="flex-1" />

          <button
            onClick={handleReset}
            className="p-1 hover:bg-slate-300 rounded"
            title="Reset zoom and pan"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
          {renderState === 'rendering' && (
            <div className="text-slate-500 text-sm">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full mr-2" />
              Rendering...
            </div>
          )}

          {renderState === 'error' && (
            <div className="text-red-600 text-sm text-center">
              <p className="font-semibold mb-2">Render Error</p>
              <p className="text-xs">Check the Diagnostics panel for details</p>
            </div>
          )}

          {renderState === 'success' && renderResult && (
            <svg
              dangerouslySetInnerHTML={{ __html: renderResult.svg }}
              style={{
                transform: `scale(${zoom / 100}) translate(${pan.x}px, ${pan.y}px)`,
                transformOrigin: 'top left',
                maxWidth: '100%',
                maxHeight: '100%',
              }}
              className="bg-white shadow-sm rounded"
            />
          )}

          {renderState === 'idle' && (
            <div className="text-slate-400 text-sm text-center">
              <p>No preview available</p>
              <p className="text-xs mt-1">Start editing to see a preview</p>
            </div>
          )}
        </div>
      </div>
    );
  },
);

PreviewPanel.displayName = 'PreviewPanel';

export default PreviewPanel;
