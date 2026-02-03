/**
 * @file hooks/index.ts
 * @description Reusable hooks for Wire DSL editor UI - OSS foundation
 *
 * All hooks here are cloud-agnostic and generic.
 * Cloud features (auth, sync, collaboration) belong in application layer.
 */

'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import type { DiagnosticItem, SVGRenderResult } from '../types/index';
import { RenderState } from '../types/index';

/**
 * Hook for debouncing values - prevents excessive renders
 * Completely OSS-safe, no external dependencies
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for managing local storage persistence
 * Completely OSS-safe, uses browser localStorage only
 * DO NOT add cloud sync here - that belongs in application layer
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading from localStorage (key: ${key}):`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error writing to localStorage (key: ${key}):`, error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue];
}

/**
 * Hook for parsing Wire DSL code using @wire-dsl/engine
 * Returns render state and results
 * Completely OSS-safe, no cloud logic
 */
export function useWireParser(code: string) {
  const [renderState, setRenderState] = useState<RenderState>(RenderState.Idle);
  const [renderResult, setRenderResult] = useState<SVGRenderResult | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([]);
  const parseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const parse = useCallback(async () => {
    // Clear existing timeout
    if (parseTimeoutRef.current) {
      clearTimeout(parseTimeoutRef.current);
    }

    setRenderState(RenderState.Rendering);

    // Debounce parsing to avoid excessive renders
    parseTimeoutRef.current = setTimeout(async () => {
      try {
        // Import dynamically to avoid circular dependencies
        const wireEngine = await import('@wire-dsl/engine');
        const { parseWire, renderToSVG, LayoutEngine } = wireEngine as any;

        const ir = parseWire(code);
        const layout = new LayoutEngine().layout(ir);
        const svg = renderToSVG(ir, layout);

        setRenderResult({
          svg,
          width: 800,
          height: 600,
          diagnostics: [],
          timestamp: Date.now(),
        });
        setDiagnostics([]);
        setRenderState(RenderState.Success);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Extract line/column from error message if possible
        const lineMatch = errorMessage.match(/line (\d+)/i);
        const columnMatch = errorMessage.match(/column (\d+)/i);

        const diagnostic: DiagnosticItem = {
          id: `error-${Date.now()}`,
          severity: 'error' as any,
          message: errorMessage,
          line: lineMatch ? parseInt(lineMatch[1]) : undefined,
          column: columnMatch ? parseInt(columnMatch[1]) : undefined,
          timestamp: Date.now(),
        };

        setDiagnostics([diagnostic]);
        setRenderResult(null);
        setRenderState(RenderState.Error);
      }
    }, 300); // 300ms debounce
  }, [code]);

  // Re-parse when code changes
  useEffect(() => {
    parse();

    return () => {
      if (parseTimeoutRef.current) {
        clearTimeout(parseTimeoutRef.current);
      }
    };
  }, [code, parse]);

  return {
    renderState,
    renderResult,
    diagnostics,
    reparse: parse,
  };
}

/**
 * Hook for managing editor focus
 */
export function useFocusWithin(ref: React.RefObject<HTMLElement>) {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: FocusEvent) => {
      // Only blur if focus moved outside the container
      if (!element.contains(e.relatedTarget as Node)) {
        setIsFocused(false);
      }
    };

    element.addEventListener('focus', handleFocus, true);
    element.addEventListener('blur', handleBlur, true);

    return () => {
      element.removeEventListener('focus', handleFocus, true);
      element.removeEventListener('blur', handleBlur, true);
    };
  }, [ref]);

  return isFocused;
}

/**
 * Hook for managing zoom state
 */
export function useZoom(initialLevel: number = 100) {
  const [level, setLevel] = useState(initialLevel);

  const zoom = useCallback((delta: number) => {
    setLevel((prev) => Math.max(10, Math.min(500, prev + delta)));
  }, []);

  const reset = useCallback(() => {
    setLevel(100);
  }, []);

  const setToLevel = useCallback((newLevel: number) => {
    setLevel(Math.max(10, Math.min(500, newLevel)));
  }, []);

  return {
    level,
    zoom,
    reset,
    setToLevel,
  };
}

export default {
  useDebounce,
  useLocalStorage,
  useWireParser,
  useFocusWithin,
  useZoom,
};
