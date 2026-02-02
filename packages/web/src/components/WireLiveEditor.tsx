import React, { useEffect, useState, useRef } from 'react';
import { MonacoEditorComponent } from './MonacoEditorComponent';
import { WireLiveHeader } from './WireLiveHeader';
import { useEditorStore } from '../store/editorStore';
import { useWireParser } from '../hooks/useWireParser';
import { useCanvasZoom } from '../hooks/useCanvasZoom';
import { useFileSystemAccess } from '../hooks/useFileSystemAccess';

export const WireLiveEditor: React.FC = () => {
  const { fileHandle, openFile, saveFile, saveFileAs } = useFileSystemAccess();
  
  // Subscribe to both files and currentFileId to ensure re-renders
  const files = useEditorStore((state) => state.files);
  const currentFileId = useEditorStore((state) => state.currentFileId);
  const previewMode = useEditorStore((state) => state.previewMode);
  const selectedScreen = useEditorStore((state) => state.selectedScreen);
  const createFile = useEditorStore((state) => state.createFile);
  const updateFileContent = useEditorStore((state) => state.updateFileContent);
  const renameFile = useEditorStore((state) => state.renameFile);
  const markFileSaved = useEditorStore((state) => state.markFileSaved);
  const setPreviewMode = useEditorStore((state) => state.setPreviewMode);
  const setSelectedScreen = useEditorStore((state) => state.setSelectedScreen);
  const getCurrentFile = useEditorStore((state) => state.getCurrentFile);

  // Get current file - now guaranteed to be fresh
  const currentFile = files.get(currentFileId);
  const [diagnosticsVisible, setDiagnosticsVisible] = useState(false);
  const currentFileHandleRef = useRef<any>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const svgContainerRef = useRef<HTMLDivElement | null>(null);

  // Parser hook - real integration with wire-dsl/engine
  // Pass both currentFile.content directly to ensure reactivity
  const { renderState, renderResult, diagnostics } = useWireParser(
    currentFile?.content || '',
    selectedScreen
  );

  // Canvas zoom hook - no size params needed, extracts from DOM
  const {
    zoom,
    fitZoom,
    originalWidth,
    originalHeight,
    zoomIn,
    zoomOut,
    resetZoom,
    handleWheel,
    setPreviewRef,
    extractAndInitialize,
  } = useCanvasZoom();

  // Update preview ref when container is ready
  useEffect(() => {
    setPreviewRef(previewContainerRef.current);
  }, [setPreviewRef]);

  // Reset zoom when file changes
  useEffect(() => {
    resetZoom();
  }, [currentFileId, resetZoom]);

  // Extract SVG dimensions and initialize zoom when SVG is rendered
  useEffect(() => {
    // Use setTimeout to ensure SVG is in DOM before extracting
    const timer = setTimeout(() => {
      extractAndInitialize();
    }, 0);
    return () => clearTimeout(timer);
  }, [renderResult?.svg, extractAndInitialize]);

  // Apply zoom to SVG element - using ORIGINAL dimensions like the extension
  useEffect(() => {
    if (!previewContainerRef.current || !svgContainerRef.current) return;
    if (originalWidth <= 0 || originalHeight <= 0) return;

    // Find SVG element
    const svgElement = svgContainerRef.current.querySelector('svg');
    if (!svgElement) return;

    // Calculate new dimensions using original size * zoom scale
    // This is exactly what the extension does
    const newWidth = originalWidth * zoom;
    const newHeight = originalHeight * zoom;

    // Set container size
    svgContainerRef.current.style.width = newWidth + 'px';
    svgContainerRef.current.style.height = newHeight + 'px';

    // Set SVG size
    svgElement.style.width = newWidth + 'px';
    svgElement.style.height = newHeight + 'px';

    // Center scroll after DOM update (exactly like the extension)
    // Use setTimeout to ensure layout is updated
    setTimeout(() => {
      if (!previewContainerRef.current) return;

      const container = previewContainerRef.current;
      const scrollX = (container.scrollWidth - container.clientWidth) / 2;
      const scrollY = (container.scrollHeight - container.clientHeight) / 2;

      container.scrollLeft = Math.max(0, scrollX);
      container.scrollTop = Math.max(0, scrollY);
    }, 0);
  }, [zoom, originalWidth, originalHeight]);

  const handleFileChange = (content: string) => {
    updateFileContent(currentFileId, content);
  };

  const handleNew = () => {
    const newFileName = `untitled-${Date.now()}.wire`;
    createFile(newFileName);
    // Clear file handle for new files
    currentFileHandleRef.current = null;
  };

  const handleOpen = async () => {
    // Try FileSystemAccess API first, fallback to input element
    if (typeof window !== 'undefined' && 'showOpenFilePicker' in window) {
      const result = await openFile();
      if (result) {
        createFile(result.name, result.content);
        // Save the file handle directly from the result for later use in save
        currentFileHandleRef.current = result.handle;
        return;
      }
    }

    // Fallback to input element - clears file handle
    currentFileHandleRef.current = null;
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
      // Clear file handle for example files
      currentFileHandleRef.current = null;
    } catch (error) {
      console.error('Error loading example:', error);
    }
  };

  const handleSave = async () => {
    if (!currentFile) return;

    // 1. Si existe handle, guardar con él
    if (currentFileHandleRef.current) {
      try {
        const success = await saveFile(currentFile.content);
        if (success) {
          markFileSaved(currentFileId);
          return;
        }
      } catch (err) {
        console.error('Error saving:', err);
      }
    }

    // 2. Si no existe handle, intentar abrir picker
    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      try {
        const result = await saveFileAs(currentFile.content, currentFile.name);
        
        // Usuario canceló el diálogo - no hacer nada
        if (result === false) {
          return;
        }
        
        // Guardado exitoso
        if (result) {
          renameFile(currentFileId, result.name);
          markFileSaved(currentFileId);
          currentFileHandleRef.current = result.handle;
          return;
        }
        
        // Error real (result === null) - continuar al fallback
      } catch (err) {
        console.error('Error in save as:', err);
      }
    }

    // 3. Fallback: descarga
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(currentFile.content)
    );
    element.setAttribute('download', currentFile.name);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    markFileSaved(currentFileId);
  };

  const handleSaveAs = async () => {
    if (!currentFile) return;

    // Try FileSystemAccess first
    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      const result = await saveFileAs(currentFile.content, currentFile.name);
      
      // Usuario canceló el diálogo - no hacer nada
      if (result === false) {
        return;
      }
      
      // Guardado exitoso
      if (result) {
        renameFile(currentFileId, result.name);
        markFileSaved(currentFileId);
        // Save the handle directly from result for subsequent saves
        currentFileHandleRef.current = result.handle;
        return;
      }
      
      // Error real (result === null) - continuar al fallback
    }

    // Fallback to browser download
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(currentFile.content)
    );
    element.setAttribute('download', currentFile.name);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    markFileSaved(currentFileId);
  };

  const handleRename = (newName: string) => {
    renameFile(currentFileId, newName);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo si Ctrl (o Cmd en Mac) está presionado
      if (!e.ctrlKey && !e.metaKey) return;

      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          if (e.shiftKey) {
            handleSaveAs();
          } else {
            handleSave();
          }
          break;
        case 'n':
          e.preventDefault();
          handleNew();
          break;
        case 'o':
          e.preventDefault();
          handleOpen();
          break;
        case 'e':
          e.preventDefault();
          handleExport();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleSaveAs, handleNew, handleOpen, handleExport]);

  if (!currentFile) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f9fafb',
        }}
      >
        <WireLiveHeader
          currentFileName="No file"
          isDirty={false}
          onNew={handleNew}
          onOpen={handleOpen}
          onSave={handleSave}
          onSaveAs={handleSaveAs}
          onRename={handleRename}
          onExport={handleExport}
          onExampleSelect={handleExampleSelect}
        />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Create or open a file to start editing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Header */}
      <WireLiveHeader
        currentFileName={currentFile.name}
        isDirty={currentFile.isDirty}
        onNew={handleNew}
        onOpen={handleOpen}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onRename={handleRename}
        onExport={handleExport}
        onExampleSelect={handleExampleSelect}
      />

      {/* Main content with split view */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Editor and Preview split */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'row' }}>
          {/* Editor panel - left side (50%) */}
          <div
            style={{
              flex: '0 0 50%',
              height: '100%',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              borderRight: '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <MonacoEditorComponent
              content={currentFile.content}
              onChange={handleFileChange}
              fileName={currentFile.name}
              language="wire"
            />
          </div>

          {/* Divider */}
          <div
            style={{
              width: '1px',
              backgroundColor: '#d1d5db',
              cursor: 'col-resize',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#9ca3af')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d1d5db')}
          />

          {/* Preview panel - right side (50%) */}
          <div
            style={{
              flex: '0 0 50%',
              height: '100%',
              overflow: 'hidden',
              backgroundColor: '#fafbfc',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* Controls Container - Screens & Zoom */}
            <div
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                zIndex: 10,
                display: 'flex',
                gap: '6px',
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                padding: '6px',
              }}
            >
              {/* Screens Dropdown */}
              {renderResult?.screens && renderResult.screens.length > 1 && (
                <>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#374151',
                        transition: 'all 0.2s',
                        maxWidth: '150px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                      onClick={(e) => {
                        const menu = e.currentTarget.nextElementSibling as HTMLElement;
                        if (menu) {
                          menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
                        }
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e5e7eb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      title="Select screen"
                    >
                      <span style={{ flex: 1, textAlign: 'left' }}>
                        {renderResult.selectedScreenName || 'Screen'}
                      </span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flexShrink: 0 }}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>

                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        marginTop: '4px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        zIndex: 100,
                        minWidth: '160px',
                        display: 'none',
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    >
                      {renderResult.screens.map((screen, index) => (
                        <button
                          key={screen.id}
                          onClick={(e) => {
                            setSelectedScreen(screen.name);
                            const menu = (e.currentTarget.parentElement as HTMLElement);
                            if (menu) menu.style.display = 'none';
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            paddingLeft: '12px',
                            paddingRight: '12px',
                            paddingTop: '8px',
                            paddingBottom: '8px',
                            fontSize: '12px',
                            color:
                              renderResult.selectedScreenName === screen.name ? '#3b82f6' : '#374151',
                            backgroundColor:
                              renderResult.selectedScreenName === screen.name
                                ? '#eff6ff'
                                : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            fontWeight:
                              renderResult.selectedScreenName === screen.name ? '600' : '500',
                            borderTopLeftRadius: index === 0 ? '4px' : '0px',
                            borderTopRightRadius: index === 0 ? '4px' : '0px',
                            borderBottomLeftRadius:
                              index === renderResult.screens.length - 1 ? '4px' : '0px',
                            borderBottomRightRadius:
                              index === renderResult.screens.length - 1 ? '4px' : '0px',
                          }}
                          onMouseEnter={(e) => {
                            if (renderResult.selectedScreenName !== screen.name) {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (renderResult.selectedScreenName !== screen.name) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {screen.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      width: '1px',
                      backgroundColor: '#d1d5db',
                    }}
                  />
                </>
              )}

              {/* Zoom Controls */}
              <button
                onClick={zoomOut}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                title="Zoom Out (Ctrl + Scroll)"
              >
                −
              </button>
              <div
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  minWidth: '50px',
                  textAlign: 'center',
                }}
              >
                {Math.round(zoom * 100)}%
              </div>
              <button
                onClick={zoomIn}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                title="Zoom In (Ctrl + Scroll)"
              >
                +
              </button>
              <div
                style={{
                  width: '1px',
                  backgroundColor: '#d1d5db',
                }}
              />
              <button
                onClick={resetZoom}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '500',
                  color: '#374151',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                title="Reset Zoom"
              >
                Reset
              </button>
            </div>

            {/* Canvas container with scroll */}
            <div
              ref={previewContainerRef}
              style={{
                flex: 1,
                overflow: 'auto',
                display: 'grid',
                placeItems: 'center',
                padding: '20px',
                userSelect: 'none',
              }}
              onWheel={handleWheel}
            >
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
                <div ref={svgContainerRef} dangerouslySetInnerHTML={{ __html: renderResult.svg }} />
              ) : (
                <div style={{ color: '#9ca3af', fontSize: '14px' }}>Add code to preview SVG</div>
              )}
            </div>
          </div>
        </div>

        {/* Diagnostics panel - bottom (only show if errors) */}
        {diagnostics.length > 0 && (
          <div
            style={{
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#fef2f2',
              padding: '12px 16px',
              maxHeight: '120px',
              overflow: 'auto',
            }}
          >
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
