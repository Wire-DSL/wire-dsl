import React, { useEffect, useState } from 'react';
import { MonacoEditorComponent } from './MonacoEditorComponent';
import { WireLiveHeader } from './WireLiveHeader';
import { useEditorStore } from '../store/editorStore';
import { useWireParser } from '../hooks/useWireParser';

export const WireLiveEditor: React.FC = () => {
  const {
    currentFileId,
    zoomLevel,
    previewMode,
    selectedScreen,
    createFile,
    updateFileContent,
    setZoomLevel,
    setPreviewMode,
    setSelectedScreen,
    getCurrentFile,
  } = useEditorStore();

  const currentFile = getCurrentFile();
  const [diagnosticsVisible, setDiagnosticsVisible] = useState(false);

  // Parser hook - real integration with wire-dsl/core
  const { renderState, renderResult, diagnostics } = useWireParser(currentFile?.content || '');

  const handleFileChange = (content: string) => {
    updateFileContent(currentFileId, content);
  };

  const handleNew = () => {
    const newFileName = `untitled-${Date.now()}.wire`;
    createFile(newFileName);
  };

  const handleOpen = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.wire,.txt';
    fileInput.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const content = ev.target?.result as string;
          createFile(file.name, content);
        };
        reader.readAsText(file);
      }
    };
    fileInput.click();
  };

  const handleExport = () => {
    if (!renderResult?.svg) {
      alert('No SVG content to export');
      return;
    }

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(renderResult.svg)
    );
    element.setAttribute('download', `${currentFile?.name || 'export'}.svg`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExampleSelect = async (exampleName: string) => {
    try {
      const response = await fetch(`/examples/${exampleName}.wire`);
      const content = await response.text();
      createFile(`${exampleName}.wire`, content);
    } catch (error) {
      console.error('Error loading example:', error);
    }
  };

  if (!currentFile) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
        <WireLiveHeader
          currentFileName="No file"
          isDirty={false}
          onNew={handleNew}
          onOpen={handleOpen}
          onExport={handleExport}
          onExampleSelect={handleExampleSelect}
        />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Create or open a file to start editing.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      {/* Header */}
      <WireLiveHeader
        currentFileName={currentFile.name}
        isDirty={currentFile.isDirty}
        onNew={handleNew}
        onOpen={handleOpen}
        onExport={handleExport}
        onExampleSelect={handleExampleSelect}
      />

      {/* Main content with split view */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Editor and Preview split */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'row' }}>
          {/* Editor panel - left side (50%) */}
          <div style={{ 
            flex: '0 0 50%', 
            height: '100%', 
            overflow: 'hidden', 
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <MonacoEditorComponent
              content={currentFile.content}
              onChange={handleFileChange}
              fileName={currentFile.name}
              language="wire"
            />
          </div>

          {/* Divider */}
          <div style={{ 
            width: '1px', 
            backgroundColor: '#d1d5db', 
            cursor: 'col-resize',
            transition: 'background-color 0.2s'
          }} 
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#9ca3af')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d1d5db')}
          />

          {/* Preview panel - right side (50%) */}
          <div style={{ 
            flex: '0 0 50%', 
            height: '100%', 
            overflow: 'auto', 
            backgroundColor: '#fafbfc',
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            {renderState === 'parsing' || renderState === 'rendering' ? (
              <div style={{ color: '#6b7280', fontSize: '14px' }}>
                {renderState === 'parsing' ? 'Parsing...' : 'Rendering...'}
              </div>
            ) : diagnostics.length > 0 ? (
              <div style={{ color: '#dc2626', fontSize: '14px', textAlign: 'center' }}>
                <div style={{ marginBottom: '10px', fontWeight: '500' }}>Parse Error</div>
                {diagnostics[0]?.message}
              </div>
            ) : renderResult?.svg ? (
              <div
                dangerouslySetInnerHTML={{ __html: renderResult.svg }}
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            ) : (
              <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                Add code to preview SVG
              </div>
            )}
          </div>
        </div>

        {/* Diagnostics panel - bottom (only show if errors) */}
        {diagnostics.length > 0 && (
          <div style={{
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#fef2f2',
            padding: '12px 16px',
            maxHeight: '120px',
            overflow: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: '#dc2626', fontWeight: '500' }}>
                Problems {diagnostics.length}
              </span>
              <button
                onClick={() => setDiagnosticsVisible(!diagnosticsVisible)}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  fontSize: '12px',
                  padding: '4px 8px',
                }}
              >
                {diagnosticsVisible ? 'Hide' : 'Show'}
              </button>
            </div>
            {diagnosticsVisible && (
              <div style={{ fontSize: '12px' }}>
                {diagnostics.map((diag, idx) => (
                  <div key={idx} style={{ color: '#7f1d1d', marginBottom: '4px' }}>
                    Line {diag.line}: {diag.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
