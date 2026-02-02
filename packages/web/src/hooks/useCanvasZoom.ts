import { useState, useCallback, useRef, useEffect } from 'react';

export interface CanvasZoomState {
  zoom: number;
  fitZoom: number;
}

/**
 * Canvas zoom hook - manages zoom level exactly like VS Code extension
 * - Stores original SVG dimensions (extracted from DOM, not prop)
 * - Calculates fitZoom based on available space when preview ref is ready
 * - Defaults to fitZoom on mount
 * - Uses scale multiplier for zoom calculations
 */
export const useCanvasZoom = () => {
  const [state, setState] = useState<CanvasZoomState>({
    zoom: 1,
    fitZoom: 1,
  });

  const previewRef = useRef<HTMLDivElement | null>(null);
  const svgOriginalWidthRef = useRef<number>(0);
  const svgOriginalHeightRef = useRef<number>(0);

  /**
   * Calculate fit zoom based on available preview space
   * Same formula as VS Code extension
   */
  const calculateFitZoom = useCallback(() => {
    if (!previewRef.current || svgOriginalWidthRef.current <= 0 || svgOriginalHeightRef.current <= 0) {
      return 1;
    }

    const padding = 40;
    const availWidth = previewRef.current.clientWidth - padding;
    const availHeight = previewRef.current.clientHeight - padding;

    const fit = Math.min(
      availWidth / svgOriginalWidthRef.current,
      availHeight / svgOriginalHeightRef.current
    );
    
    // Return fit value clamped to [0.1, 1]
    return Math.min(fit, 1);
  }, []);

  /**
   * Extract original SVG dimensions from DOM and initialize zoom
   * Called when SVG is first rendered. Only initializes zoom on first call.
   * Subsequent calls only update original dimensions.
   */
  const extractAndInitialize = useCallback(() => {
    if (!previewRef.current) return;

    const svgElement = previewRef.current.querySelector('svg');
    if (!svgElement) return;

    // Extract width and height from SVG attributes (set by renderToSVG)
    const width = parseFloat(svgElement.getAttribute('width') || '0');
    const height = parseFloat(svgElement.getAttribute('height') || '0');

    if (width > 0 && height > 0) {
      const isFirstTime = svgOriginalWidthRef.current === 0;
      
      svgOriginalWidthRef.current = width;
      svgOriginalHeightRef.current = height;

      // Only initialize zoom on first extraction
      if (isFirstTime) {
        const fitZoomValue = calculateFitZoom();
        setState({
          zoom: fitZoomValue,
          fitZoom: fitZoomValue,
        });
      } else {
        // Subsequent calls: update fitZoom in case viewport changed, but keep zoom as-is
        const fitZoomValue = calculateFitZoom();
        setState((prev) => ({
          ...prev,
          fitZoom: fitZoomValue,
        }));
      }
    }
  }, [calculateFitZoom]);



  const zoomIn = useCallback(() => {
    setState((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom + 0.1, 3),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setState((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom - 0.1, 0.1),
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setState((prev) => ({
      ...prev,
      zoom: prev.fitZoom,
    }));
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (!e.ctrlKey && !e.metaKey) return;

      e.preventDefault();
      const direction = e.deltaY > 0 ? -1 : 1;
      setState((prev) => ({
        ...prev,
        zoom: Math.max(0.1, Math.min(prev.zoom + 0.1 * direction, 3)),
      }));
    },
    []
  );

  return {
    zoom: state.zoom,
    fitZoom: state.fitZoom,
    originalWidth: svgOriginalWidthRef.current,
    originalHeight: svgOriginalHeightRef.current,
    zoomIn,
    zoomOut,
    resetZoom,
    handleWheel,
    setPreviewRef: (ref: HTMLDivElement | null) => {
      previewRef.current = ref;
    },
    extractAndInitialize,
  };
};
