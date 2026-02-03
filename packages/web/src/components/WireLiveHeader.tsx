import React from 'react';
import { ChevronDown, Download, FolderOpen, Plus, Save, FileDown } from 'lucide-react';

export interface WireLiveHeaderProps {
  currentFileName: string;
  isDirty: boolean;
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs?: () => void;
  onRename: (newName: string) => void;
  onExport: () => void;
  onExampleSelect?: (exampleName: string) => void;
  examples?: string[];
}

export const WireLiveHeader: React.FC<WireLiveHeaderProps> = ({
  currentFileName,
  isDirty,
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onRename,
  onExport,
  onExampleSelect,
  examples = [
    'simple-dashboard',
    'simple-multi-screen',
    'admin-dashboard',
    'form-example',
    'analytics-dashboard',
  ],
}) => {
  const [examplesOpen, setExamplesOpen] = React.useState(false);
  const [isRenamingFile, setIsRenamingFile] = React.useState(false);
  const [editingFileName, setEditingFileName] = React.useState(currentFileName);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Remove .wire extension from filename for display
  const fileNameWithoutExt = React.useMemo(() => {
    return currentFileName.endsWith('.wire') ? currentFileName.slice(0, -5) : currentFileName;
  }, [currentFileName]);

  React.useEffect(() => {
    setEditingFileName(fileNameWithoutExt);
  }, [fileNameWithoutExt]);

  React.useEffect(() => {
    if (isRenamingFile && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenamingFile]);

  const handleRenameSubmit = () => {
    if (editingFileName.trim()) {
      const newNameWithoutExt = editingFileName.trim();
      const newNameWithExt = newNameWithoutExt.endsWith('.wire')
        ? newNameWithoutExt
        : `${newNameWithoutExt}.wire`;

      if (newNameWithExt !== currentFileName) {
        onRename(newNameWithExt);
      }
    } else {
      setEditingFileName(fileNameWithoutExt);
    }
    setIsRenamingFile(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setIsRenamingFile(false);
      setEditingFileName(fileNameWithoutExt);
    }
  };

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '24px',
        paddingRight: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Logo y nombre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#3b82f6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="234"
              height="242"
              viewBox="0 0 234 242"
              role="img"
              aria-label="Wire-DSL logo"
            >
              <defs>
                <radialGradient id="bgGrad" cx="30%" cy="25%" r="75%">
                  <stop offset="0%" stop-color="#FFFFAA" stop-opacity="1" />
                  <stop offset="55%" stop-color="#AAAAAA" stop-opacity="1" />
                  <stop offset="100%" stop-color="#AADDDD" stop-opacity="1" />
                </radialGradient>

                <radialGradient id="nodeGrad" cx="33%" cy="33%" r="75%">
                  <stop offset="0%" stop-color="#EEEEEE" stop-opacity="1" />
                  <stop offset="100%" stop-color="#AAAAAA" stop-opacity="1" />
                </radialGradient>

                <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#F4F4F4" stop-opacity="1" />
                  <stop offset="100%" stop-color="#DADADA" stop-opacity="1" />
                </linearGradient>
              </defs>

              <g fill="none" stroke-linecap="round" stroke-linejoin="round" transform="translate(0, 30)">
                <g>
                  <circle cx="44" cy="45" r="15" fill="url(#nodeGrad)" />
                  <circle cx="86" cy="136" r="15" fill="url(#nodeGrad)" />
                  <circle cx="117" cy="56" r="15" fill="url(#nodeGrad)" />
                  <circle cx="148" cy="136" r="15" fill="url(#nodeGrad)" />
                  <circle cx="190" cy="45" r="15" fill="url(#nodeGrad)" />
                </g>

                <path
                  d="M 44 45 L 86 136 L 117 56 L 148 136 L 190 45"
                  stroke="url(#strokeGrad)"
                  stroke-width="18"
                />
              </g>
            </svg>
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
            Wire Live
          </h1>
          <span
            style={{
              fontSize: '11px',
              backgroundColor: '#f3f4f6',
              color: '#4b5563',
              paddingLeft: '8px',
              paddingRight: '8px',
              paddingTop: '4px',
              paddingBottom: '4px',
              borderRadius: '6px',
              fontWeight: '500',
            }}
          >
            open-source
          </span>
        </div>

        {/* Separador */}
        <div style={{ width: '1px', height: '32px', backgroundColor: '#e5e7eb' }} />

        {/* Archivo actual */}
        <div
          style={{
            fontSize: '14px',
            color: '#4b5563',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {isRenamingFile ? (
            <input
              ref={inputRef}
              type="text"
              value={editingFileName}
              onChange={(e) => setEditingFileName(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleRenameKeyDown}
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#111827',
                padding: '4px 8px',
                border: '2px solid #3b82f6',
                borderRadius: '4px',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          ) : (
            <span
              onClick={() => setIsRenamingFile(true)}
              style={{
                fontWeight: '500',
                color: '#111827',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '4px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              title="Click to rename"
            >
              {currentFileName}
            </span>
          )}
          {isDirty && <span style={{ color: '#f59e0b', fontSize: '10px' }}>● unsaved</span>}
        </div>
      </div>

      {/* Botones de acción */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Nuevo */}
        <button
          onClick={onNew}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: '12px',
            paddingRight: '12px',
            paddingTop: '8px',
            paddingBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          title="Nuevo archivo (Ctrl+N)"
        >
          <Plus size={16} />
          New
        </button>

        {/* Abrir */}
        <button
          onClick={onOpen}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: '12px',
            paddingRight: '12px',
            paddingTop: '8px',
            paddingBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          title="Abrir archivo (Ctrl+O)"
        >
          <FolderOpen size={16} />
          Open
        </button>

        {/* Guardar */}
        <button
          onClick={onSave}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: '12px',
            paddingRight: '12px',
            paddingTop: '8px',
            paddingBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: isDirty ? '#3b82f6' : '#374151',
            backgroundColor: isDirty ? '#eff6ff' : 'transparent',
            border: isDirty ? '1px solid #93c5fd' : 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (isDirty) {
              e.currentTarget.style.backgroundColor = '#dbeafe';
            } else {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDirty ? '#eff6ff' : 'transparent';
          }}
          title="Guardar archivo (Ctrl+S)"
        >
          <Save size={16} />
          Save
        </button>

        {/* Guardar Como */}
        {onSaveAs && (
          <button
            onClick={onSaveAs}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '8px',
              paddingBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            title="Guardar como (Ctrl+Shift+S)"
          >
            <FileDown size={16} />
            Save As
          </button>
        )}

        {/* Ejemplos */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setExamplesOpen(!examplesOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '8px',
              paddingBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Examples
            <ChevronDown
              size={16}
              style={{
                transform: examplesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </button>

          {examplesOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                marginTop: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                minWidth: '160px',
              }}
            >
              {examples.map((example, index) => (
                <button
                  key={example}
                  onClick={() => {
                    onExampleSelect?.(example);
                    setExamplesOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    fontSize: '14px',
                    color: '#374151',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    borderTopLeftRadius: index === 0 ? '8px' : '0px',
                    borderTopRightRadius: index === 0 ? '8px' : '0px',
                    borderBottomLeftRadius: index === examples.length - 1 ? '8px' : '0px',
                    borderBottomRightRadius: index === examples.length - 1 ? '8px' : '0px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {example}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Separador */}
        <div style={{ width: '1px', height: '32px', backgroundColor: '#e5e7eb' }} />

        {/* Exportar */}
        <button
          onClick={onExport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: '16px',
            paddingRight: '16px',
            paddingTop: '8px',
            paddingBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#ffffff',
            backgroundColor: '#3b82f6',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
          title="Exportar como SVG"
        >
          <Download size={16} />
          Export SVG
        </button>
      </div>
    </header>
  );
};
