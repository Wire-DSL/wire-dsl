import React from 'react';
import { ChevronDown, Download, FolderOpen, Plus } from 'lucide-react';

export interface WireLiveHeaderProps {
  currentFileName: string;
  isDirty: boolean;
  onNew: () => void;
  onOpen: () => void;
  onExport: () => void;
  onExampleSelect?: (exampleName: string) => void;
  examples?: string[];
}

export const WireLiveHeader: React.FC<WireLiveHeaderProps> = ({
  currentFileName,
  isDirty,
  onNew,
  onOpen,
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

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: '24px',
      paddingRight: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Logo y nombre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#3b82f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            📐
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
            Wire Live
          </h1>
          <span style={{
            fontSize: '11px',
            backgroundColor: '#f3f4f6',
            color: '#4b5563',
            paddingLeft: '8px',
            paddingRight: '8px',
            paddingTop: '4px',
            paddingBottom: '4px',
            borderRadius: '6px',
            fontWeight: '500'
          }}>
            open-source
          </span>
        </div>

        {/* Separador */}
        <div style={{ width: '1px', height: '32px', backgroundColor: '#e5e7eb' }} />

        {/* Archivo actual */}
        <div style={{ fontSize: '14px', color: '#4b5563' }}>
          <span style={{ fontWeight: '500', color: '#111827' }}>
            {currentFileName}
          </span>
          {isDirty && <span style={{ color: '#f59e0b', marginLeft: '6px', fontSize: '10px' }}>● unsaved</span>}
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
            transition: 'background-color 0.2s'
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
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          title="Abrir archivo (Ctrl+O)"
        >
          <FolderOpen size={16} />
          Open
        </button>

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
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Examples
            <ChevronDown size={16} style={{ transform: examplesOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>

          {examplesOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              zIndex: 10,
              minWidth: '160px'
            }}>
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
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
          title="Exportar como SVG"
        >
          <Download size={16} />
          Export SVG
        </button>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px', paddingLeft: '16px', borderLeft: '1px solid #e5e7eb' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Local only</span>
        </div>
      </div>
    </header>
  );
};
