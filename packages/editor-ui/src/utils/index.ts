/**
 * @file utils/index.ts
 * @description Utility functions for editor-ui - OSS foundation
 *
 * All utilities here are pure functions, cloud-agnostic, and safe for OSS.
 * DO NOT add sync, auth, or cloud-specific logic here.
 */

import type { DiagnosticItem } from '../types/index';

/**
 * Format a diagnostic message with line/column info
 * OSS-safe utility
 */
export function formatDiagnosticMessage(diagnostic: DiagnosticItem): string {
  const parts: string[] = [diagnostic.message];

  if (diagnostic.line !== undefined) {
    parts.push(`at line ${diagnostic.line}`);
  }

  if (diagnostic.column !== undefined) {
    parts.push(`column ${diagnostic.column}`);
  }

  return parts.join(' ');
}

/**
 * Extract line and column from error message
 * Helps normalize error formats from parser
 */
export function extractLocationFromError(
  errorMessage: string,
): { line?: number; column?: number } {
  const lineMatch = errorMessage.match(/line (\d+)/i);
  const columnMatch = errorMessage.match(/(?:column|col) (\d+)/i);

  return {
    line: lineMatch ? parseInt(lineMatch[1], 10) : undefined,
    column: columnMatch ? parseInt(columnMatch[1], 10) : undefined,
  };
}

/**
 * Get line content at given line number
 * 1-based indexing
 */
export function getLineContent(code: string, lineNumber: number): string {
  const lines = code.split('\n');
  return lines[lineNumber - 1] || '';
}

/**
 * Get character position given line and column
 * 1-based indexing
 */
export function getCharacterPosition(code: string, line: number, column: number): number {
  const lines = code.split('\n');
  let position = 0;

  for (let i = 0; i < line - 1 && i < lines.length; i++) {
    position += lines[i].length + 1; // +1 for newline
  }

  position += column - 1;
  return Math.max(0, position);
}

/**
 * Convert SVG dimensions to aspect ratio friendly format
 * Useful for responsive preview sizing
 */
export function calculateAspectRatio(
  width: number,
  height: number,
): { ratio: number; formatted: string } {
  const ratio = width / height;
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.round(width), Math.round(height));
  const w = Math.round(width) / divisor;
  const h = Math.round(height) / divisor;

  return {
    ratio,
    formatted: `${w}:${h}`,
  };
}

/**
 * Sanitize file name to be safe
 * Removes/replaces problematic characters
 */
export function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 255);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Debounce function creator
 * Pure function, OSS-safe
 */
export function createDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle function creator
 * Pure function, OSS-safe
 */
export function createThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let lastCallTime = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCallTime >= delay) {
      lastCallTime = now;
      fn(...args);
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        fn(...args);
        timeoutId = null;
      }, delay - (now - lastCallTime));
    }
  };
}

export default {
  formatDiagnosticMessage,
  extractLocationFromError,
  getLineContent,
  getCharacterPosition,
  calculateAspectRatio,
  sanitizeFileName,
  formatFileSize,
  createDebounce,
  createThrottle,
};
