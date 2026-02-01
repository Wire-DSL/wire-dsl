/**
 * @file components/DiagnosticsDrawer.tsx
 * @description Diagnostics panel drawer - OSS foundation
 *
 * Displays parse errors, warnings, and info messages.
 * Completely OSS-safe.
 */

import React, { useCallback } from 'react';
import { ChevronDown, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { DiagnosticItem } from '../types/index';

export interface DiagnosticsDrawerProps {
  /** Array of diagnostics to display */
  diagnostics: DiagnosticItem[];

  /** Called when user clicks a diagnostic to navigate to it */
  onNavigateTo?: (line?: number, column?: number) => void;

  /** Is drawer open? */
  isOpen: boolean;

  /** Called when drawer open/close state changes */
  onToggle: (open: boolean) => void;

  /** Optional CSS class */
  className?: string;
}

export const DiagnosticsDrawer = React.forwardRef<HTMLDivElement, DiagnosticsDrawerProps>(
  ({ diagnostics, onNavigateTo, isOpen, onToggle, className }, ref) => {
    const handleNavigate = useCallback(
      (diagnostic: DiagnosticItem) => {
        onNavigateTo?.(diagnostic.line, diagnostic.column);
      },
      [onNavigateTo],
    );

    const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
    const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;

    return (
      <div
        ref={ref}
        className={className || 'w-full bg-slate-50 border-t border-slate-300'}
        data-testid="diagnostics-drawer"
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-2 bg-slate-100 cursor-pointer hover:bg-slate-200 transition-colors"
          onClick={() => onToggle(!isOpen)}
        >
          <ChevronDown
            size={18}
            className={`transition-transform ${isOpen ? '' : '-rotate-90'}`}
          />

          <span className="text-sm font-semibold text-slate-700 flex-1">Problems</span>

          <div className="flex items-center gap-2 text-xs">
            {errorCount > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <AlertCircle size={14} />
                {errorCount}
              </span>
            )}

            {warningCount > 0 && (
              <span className="flex items-center gap-1 text-yellow-600">
                <AlertTriangle size={14} />
                {warningCount}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        {isOpen && (
          <div className="max-h-64 overflow-y-auto">
            {diagnostics.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">
                No problems detected
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {diagnostics.map((diagnostic) => (
                  <DiagnosticItem
                    key={diagnostic.id}
                    diagnostic={diagnostic}
                    onClick={() => handleNavigate(diagnostic)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

DiagnosticsDrawer.displayName = 'DiagnosticsDrawer';

/**
 * Individual diagnostic item component
 */
const DiagnosticItem: React.FC<{
  diagnostic: DiagnosticItem;
  onClick: () => void;
}> = ({ diagnostic, onClick }) => {
  const getIcon = () => {
    switch (diagnostic.severity) {
      case 'error':
        return <AlertCircle size={16} className="text-red-600" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-600" />;
      default:
        return <Info size={16} className="text-blue-600" />;
    }
  };

  const getSeverityColor = () => {
    switch (diagnostic.severity) {
      case 'error':
        return 'bg-red-50 hover:bg-red-100';
      case 'warning':
        return 'bg-yellow-50 hover:bg-yellow-100';
      default:
        return 'bg-blue-50 hover:bg-blue-100';
    }
  };

  return (
    <div
      className={`px-4 py-2 cursor-pointer transition-colors ${getSeverityColor()}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        {getIcon()}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 break-words">
            {diagnostic.message}
          </p>

          {(diagnostic.line || diagnostic.column) && (
            <p className="text-xs text-slate-600 mt-1">
              {diagnostic.line && <span>Line {diagnostic.line}</span>}
              {diagnostic.line && diagnostic.column && <span>, </span>}
              {diagnostic.column && <span>Column {diagnostic.column}</span>}
            </p>
          )}

          {diagnostic.source && (
            <p className="text-xs text-slate-500 mt-0.5">{diagnostic.source}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsDrawer;
