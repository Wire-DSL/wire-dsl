import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

export interface MonacoEditorProps {
  content: string;
  onChange: (content: string) => void;
  fileName?: string;
  language?: string;
  readOnly?: boolean;
  className?: string;
}

export const MonacoEditorComponent = React.forwardRef<
  monaco.editor.IStandaloneCodeEditor | null,
  MonacoEditorProps
>(
  (
    {
      content,
      onChange,
      fileName = 'untitled.wire',
      language = 'wire',
      readOnly = false,
      className = '',
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const isInitializedRef = useRef(false);

    // Inicializar Monaco Editor - solo una vez
    useEffect(() => {
      if (!containerRef.current || isInitializedRef.current) return;

      try {
        const editor = monaco.editor.create(containerRef.current, {
          value: content,
          language,
          theme: 'vs-light',
          fontSize: 14,
          fontFamily: 'Fira Code, monospace',
          lineNumbers: 'on',
          wordWrap: 'on',
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnPaste: true,
          tabSize: 2,
          insertSpaces: true,
          readOnly,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        });

        editorRef.current = editor;
        isInitializedRef.current = true;

        // Listener para cambios
        const disposable = editor.onDidChangeModelContent(() => {
          const newContent = editor.getValue();
          onChange(newContent);
        });

        // Actualizar ref para acceso desde el parent
        if (typeof ref === 'function') {
          ref(editor);
        } else if (ref) {
          ref.current = editor;
        }

        return () => {
          disposable.dispose();
        };
      } catch (error) {
        console.error('Error creating Monaco editor:', error);
      }
    }, []);

    // Actualizar contenido cuando el prop cambia externamente
    useEffect(() => {
      if (
        editorRef.current &&
        editorRef.current.getValue() !== content
      ) {
        editorRef.current.setValue(content);
      }
    }, [content]);

    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
        }}
      />
    );
  }
);

MonacoEditorComponent.displayName = 'MonacoEditorComponent';

MonacoEditorComponent.displayName = 'MonacoEditorComponent';
