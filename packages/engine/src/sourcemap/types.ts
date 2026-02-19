/**
 * SourceMap Types for Wire DSL
 * 
 * Provides bidirectional mapping between code positions and AST nodes
 * for features like code-canvas selection, visual editing, and error reporting.
 */

import type { AST } from '../parser/index';

/**
 * Position in source code (1-based line, 0-based column)
 */
export interface Position {
  line: number;      // 1-based (line 1 = first line)
  column: number;    // 0-based (column 0 = first character)
  offset?: number;   // Optional: absolute offset in file (useful for editing)
}

/**
 * Range in source code
 */
export interface CodeRange {
  start: Position;
  end: Position;
}

/**
 * SourceMap for a single property
 * Captures ranges for precise property editing
 */
export interface PropertySourceMap {
  name: string;              // Property name (e.g., "text", "direction", "size")
  value: any;                // Parsed value
  range: CodeRange;          // Full range "name: value"
  nameRange: CodeRange;      // Range of just the name
  valueRange: CodeRange;     // Range of just the value (for precise replacement)
}

/**
 * Types of nodes in Wire DSL
 */
export type SourceMapNodeType =
  | 'project'
  | 'screen'
  | 'layout'
  | 'component'
  | 'component-definition'  // For user-defined components (define Component "Name")
  | 'layout-definition'     // For user-defined layouts (define Layout "Name")
  | 'cell'                  // For grid cells
  | 'style'                 // Style configuration block
  | 'mocks'                 // Mocks data block
  | 'colors';               // Colors palette block

/**
 * Main SourceMap entry - represents one node in the AST
 */
export interface SourceMapEntry {
  // ===== FASE 1: Core Identity =====
  nodeId: string;                    // Stable content-based hash
  type: SourceMapNodeType;           // Type of node
  range: CodeRange;                  // Full range in source code
  filePath: string;                  // Path to source file (or "<input>")
  parentId: string | null;           // ID of parent node (null for project root)
  
  // Note: The corresponding AST node can be found using ast._meta.nodeId === entry.nodeId
  // This keeps SourceMap and AST separated (single responsibility)
  
  // ===== FASE 1: Basic Metadata (optional) =====
  name?: string;                     // Name of node (screen name, component type, etc.)
  layoutType?: string;               // For layouts: 'stack' | 'grid' | 'split' | 'panel' | 'card'
  componentType?: string;            // For components: 'Icon' | 'Button' | 'Heading' | custom
  
  // ===== FASE 2: Hierarchy (to be implemented) =====
  indexInParent?: number;            // Position among siblings (0-based)
  isUserDefined?: boolean;           // true if it's a user-defined component
  
  // ===== FASE 3: Detailed Ranges (to be implemented) =====
  keywordRange?: CodeRange;          // Only the keyword (e.g., "component", "layout", "screen")
  nameRange?: CodeRange;             // Only the name (e.g., "Main" in "screen Main")
  bodyRange?: CodeRange;             // Only the body { ... }
  properties?: Record<string, PropertySourceMap>;  // Map of properties
  insertionPoint?: InsertionPoint;   // Where to insert new children (for editing)
}

/**
 * Insertion point for new children (FASE 3)
 */
export interface InsertionPoint {
  line: number;                      // Line where to insert
  column: number;                    // Column where to insert
  indentation: string;               // Spaces/tabs to maintain formatting
  after?: string;                    // NodeId of last child (if exists)
}

/**
 * Parse result with SourceMap
 */
export interface ParseResult {
  ast: AST;                          // Unchanged AST (same as parseWireDSL())
  sourceMap: SourceMapEntry[];       // SourceMap entries
  diagnostics: ParseError[];         // Errors + warnings with ranges
  errors: ParseError[];              // Error diagnostics only
  warnings: ParseError[];            // Warning diagnostics only
  hasErrors: boolean;                // True when errors.length > 0
}

/**
 * Parse result with diagnostics and optional AST/SourceMap
 * Used by tolerant editor flows where diagnostics are needed even when parsing fails
 */
export interface ParseDiagnosticsResult {
  ast?: AST;                         // Present when parsing reaches AST stage
  sourceMap?: SourceMapEntry[];      // Present when SourceMap generation succeeds
  diagnostics: ParseError[];         // Errors and warnings with precise ranges
  errors: ParseError[];              // Error diagnostics only
  warnings: ParseError[];            // Warning diagnostics only
  hasErrors: boolean;                // Convenience flag for fatal/non-fatal handling
}

/**
 * Parse error with optional nodeId reference
 */
export interface ParseError {
  message: string;
  range: CodeRange;
  severity: 'error' | 'warning';
  code?: string;                     // Machine-readable diagnostic code
  phase?: 'lexer' | 'parser' | 'semantic';
  expected?: string;
  actual?: string;
  suggestion?: string;
  nodeId?: string;                   // Optional: ID of node that caused the error
}

/**
 * Captured tokens from Chevrotain parser (internal use)
 * These are NOT stored in AST, only used temporarily during SourceMap building
 */
export interface CapturedTokens {
  keyword?: any;                     // Token for keyword (component, layout, screen, etc.)
  name?: any;                        // Token for name/type
  paramList?: any;                   // Token for parameter list
  properties?: any[];                // Tokens for properties
  body?: any;                        // Token for body
  children?: any[];                  // Child nodes
}
