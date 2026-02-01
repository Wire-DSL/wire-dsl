/**
 * @file components/EditorPanel.tsx
 * @description Editor panel component - OSS foundation for Wire Live
 *
 * This component is intentionally minimal and extensible.
 * DO NOT add cloud features here (auth, sync, collaboration).
 * Such features belong in application-level composition.
 */

import React, { useRef } from 'react';
import type { EditorConfig, FileInfo } from '../types/index';

export interface EditorPanelProps {
  /** Current file being edited */
  file: FileInfo;

  /** Called when file content changes */
  onChange: (content: string) => void;

  /** Editor configuration */
  config?: Partial<EditorConfig>;

  /** Called when editor is ready (for Monaco setup) */
  onReady?: (editor: any) => void;

  /** Optional CSS class for styling */
  className?: string;
}

/**
 * EditorPanel - Wrapper for Monaco Editor integration
 *
 * This component handles basic editor lifecycle and doesn't impose
 * any cloud-specific logic. It's designed to be extended at the
 * application level for features like:
 * - Cloud sync (application concern, not editor-ui)
 * - Collaboration (application concern, not editor-ui)
 * - Advanced diagnostics UI (can be added, but diagnostics data comes from parent)
 */
export const EditorPanel = React.forwardRef<HTMLDivElement, EditorPanelProps>(
  ({ file, className }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);

    return (
      <div
        ref={ref || editorRef}
        className={className || 'w-full h-full bg-slate-900 text-slate-100'}
        data-testid="editor-panel"
      >
        {/* Monaco Editor will be mounted here via web/App component */}
        {/* This component provides the container and interface */}
        {/* Actual editor integration is in the application layer */}
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            {/* Editor content placeholder - real editor mounted by parent */}
            <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words">
              {file.content || '// Load a Wire DSL file to get started...'}
            </pre>
          </div>
        </div>
      </div>
    );
  },
);

EditorPanel.displayName = 'EditorPanel';

export default EditorPanel;
