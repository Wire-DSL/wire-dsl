/**
 * @file components/SplitView.tsx
 * @description Resizable split view component - OSS foundation
 *
 * Generic split view for editor/preview layout.
 * No cloud features.
 */

import React, { useState, useRef, useCallback } from 'react';
import type { SplitLayoutConfig } from '../types/index';

export interface SplitViewProps {
  /** Primary panel (left or top) */
  primary: React.ReactNode;

  /** Secondary panel (right or bottom) */
  secondary: React.ReactNode;

  /** Layout configuration */
  config?: Partial<SplitLayoutConfig>;

  /** Called when layout changes */
  onConfigChange?: (config: SplitLayoutConfig) => void;

  /** Optional CSS class */
  className?: string;
}

export const SplitView = React.forwardRef<HTMLDivElement, SplitViewProps>(
  (
    {
      primary,
      secondary,
      config = {
        primarySize: 50,
        orientation: 'horizontal',
        resizable: true,
      },
      onConfigChange,
      className,
    },
    ref,
  ) => {
    const [primarySize, setPrimarySize] = useState(config.primarySize || 50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleMouseDown = useCallback(() => {
      isDragging.current = true;
    }, []);

    const handleMouseUp = useCallback(() => {
      isDragging.current = false;
    }, []);

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!isDragging.current || !containerRef.current || !config.resizable) return;

        const container = containerRef.current;
        const rect = container.getBoundingClientRect();

        let newSize: number;
        if (config.orientation === 'horizontal') {
          newSize = ((e.clientX - rect.left) / rect.width) * 100;
        } else {
          newSize = ((e.clientY - rect.top) / rect.height) * 100;
        }

        newSize = Math.max(20, Math.min(80, newSize)); // Constrain between 20-80%
        setPrimarySize(newSize);

        onConfigChange?.({
          primarySize: newSize,
          orientation: config.orientation || 'horizontal',
          resizable: config.resizable ?? true,
        });
      },
      [config.resizable, config.orientation, onConfigChange],
    );

    React.useEffect(() => {
      if (isDragging.current) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
      return () => {};
    }, [handleMouseMove, handleMouseUp]);

    const isHorizontal = config.orientation === 'horizontal';

    return (
      <div
        ref={ref || containerRef}
        className={
          className ||
          (isHorizontal ? 'flex flex-row h-full' : 'flex flex-col h-full')
        }
        data-testid="split-view"
      >
        {/* Primary Panel */}
        <div
          style={{
            [isHorizontal ? 'width' : 'height']: `${primarySize}%`,
            [isHorizontal ? 'minWidth' : 'minHeight']: '200px',
          }}
          className="overflow-hidden"
        >
          {primary}
        </div>

        {/* Divider */}
        {config.resizable && (
          <div
            onMouseDown={handleMouseDown}
            className={`bg-slate-300 hover:bg-slate-400 cursor-${isHorizontal ? 'col' : 'row'}-resize transition-colors ${
              isHorizontal ? 'w-1' : 'h-1'
            }`}
            style={{
              userSelect: 'none',
            }}
            data-testid="split-divider"
          />
        )}

        {/* Secondary Panel */}
        <div
          style={{
            [isHorizontal ? 'width' : 'height']: `${100 - primarySize}%`,
            [isHorizontal ? 'minWidth' : 'minHeight']: '200px',
          }}
          className="overflow-hidden"
        >
          {secondary}
        </div>
      </div>
    );
  },
);

SplitView.displayName = 'SplitView';

export default SplitView;
