/**
 * @file types/index.ts
 * @description Core types for editor-ui - OSS compatible, no cloud-specific logic
 *
 * These types define the minimal interface needed for editor UI components.
 * They are intentionally generic to support OSS usage without cloud-specific bindings.
 */

/**
 * Diagnostic severity levels
 */
export enum DiagnosticSeverity {
  Error = 'error',
  Warning = 'warning',
  Information = 'information',
}

/**
 * Represents a single diagnostic message (error, warning, or info)
 * This is OSS-safe and has no cloud-specific dependencies
 */
export interface DiagnosticItem {
  /** Unique identifier for this diagnostic */
  id: string;

  /** Severity level of the diagnostic */
  severity: DiagnosticSeverity;

  /** Human-readable message */
  message: string;

  /** File path or identifier where the diagnostic occurred */
  source?: string;

  /** Line number (1-based) */
  line?: number;

  /** Column number (1-based) */
  column?: number;

  /** Additional code for programmatic identification */
  code?: string;

  /** Timestamp when diagnostic was created */
  timestamp: number;
}

/**
 * Editor render state - tracks rendering progress
 * Fully OSS-compatible, no cloud features
 */
export enum RenderState {
  Idle = 'idle',
  Rendering = 'rendering',
  Success = 'success',
  Error = 'error',
}

/**
 * SVG render result from Wire DSL core
 * This wraps the IR from @wire-dsl/engine in a UI-friendly format
 */
export interface SVGRenderResult {
  /** SVG string output */
  svg: string;

  /** Width of rendered SVG */
  width: number;

  /** Height of rendered SVG */
  height: number;

  /** Any diagnostics generated during rendering */
  diagnostics: DiagnosticItem[];

  /** Timestamp of render */
  timestamp: number;
}

/**
 * Editor configuration - intentionally minimal and OSS-safe
 * DO NOT add cloud-specific fields (auth, sync, AI, etc.)
 * Such features belong in application-level state, not here
 */
export interface EditorConfig {
  /** Language ID (e.g., 'wire') */
  language: string;

  /** Theme name ('light' or 'dark') */
  theme: 'light' | 'dark';

  /** Font size in pixels */
  fontSize: number;

  /** Tab size in spaces */
  tabSize: number;

  /** Enable word wrap */
  wordWrap: 'on' | 'off' | 'wordWrapColumn';

  /** Font family */
  fontFamily: string;
}

/**
 * Editor file metadata - OSS-safe, no cloud tracking
 */
export interface FileInfo {
  /** File name including extension */
  name: string;

  /** File content */
  content: string;

  /** Is the file modified? */
  isDirty: boolean;

  /** Timestamp of last modification */
  lastModified: number;

  /** Language hint (e.g., 'wire') */
  language: string;
}

/**
 * Split panel layout configuration
 */
export interface SplitLayoutConfig {
  /** Primary panel (editor) size percentage (0-100) */
  primarySize: number;

  /** Orientation of split (horizontal or vertical) */
  orientation: 'horizontal' | 'vertical';

  /** Can panels be resized? */
  resizable: boolean;
}

/**
 * Zoom state for preview
 */
export interface ZoomState {
  /** Zoom level as percentage (e.g., 100 = 100%) */
  level: number;

  /** Min zoom percentage */
  min: number;

  /** Max zoom percentage */
  max: number;
}

/**
 * Component extension point - allows future implementations to extend
 * WITHOUT modifying OSS code
 *
 * This is NOT a feature hook - it's for documentation only.
 * Future implementations should extend via composition,
 * not by adding fields here.
 */
export interface ComponentExtensionPoint {
  /** Reserved for future use - do not implement in OSS */
  _reserved?: never;
}

// React is implicitly available, no need to re-export
