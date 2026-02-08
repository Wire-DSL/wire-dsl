/**
 * SourceMapBuilder
 * 
 * Constructs SourceMap during AST traversal
 * Captures token positions and builds mappings
 */

import type {
  SourceMapEntry,
  SourceMapNodeType,
  CodeRange,
  Position,
  CapturedTokens,
} from './types';
import { generateStableNodeId } from './hash';

/**
 * Builder for constructing SourceMap entries during parsing
 */
export class SourceMapBuilder {
  private entries: SourceMapEntry[] = [];
  private filePath: string;
  private parentStack: string[] = [];  // Stack of parent nodeIds for hierarchy tracking

  constructor(filePath: string = '<input>') {
    this.filePath = filePath;
  }

  /**
   * Add a node to the SourceMap
   * 
   * @param type - Type of AST node
   * @param tokens - Captured tokens from parser
   * @param metadata - Optional metadata (name, layoutType, componentType)
   * @returns Generated nodeId
   */
  addNode(
    type: SourceMapNodeType,
    tokens: CapturedTokens,
    metadata?: {
      name?: string;
      layoutType?: string;
      componentType?: string;
    }
  ): string {
    // Calculate range from tokens
    const range = this.calculateRange(tokens);
    
    // Generate stable nodeId
    const nodeId = generateStableNodeId(
      type,
      this.filePath,
      range.start.line,
      range.start.column,
      metadata?.name
    );

    // Get current parent (if any)
    const parentId = this.parentStack.length > 0 
      ? this.parentStack[this.parentStack.length - 1] 
      : null;

    // Create entry
    const entry: SourceMapEntry = {
      nodeId,
      type,
      range,
      filePath: this.filePath,
      parentId,
      ...metadata,  // Spread name, layoutType, componentType if provided
    };

    this.entries.push(entry);
    return nodeId;
  }

  /**
   * Push a parent onto the stack (when entering a container node)
   */
  pushParent(nodeId: string): void {
    this.parentStack.push(nodeId);
  }

  /**
   * Pop a parent from the stack (when exiting a container node)
   */
  popParent(): void {
    this.parentStack.pop();
  }

  /**
   * Get the current parent nodeId (or null if at root)
   */
  getCurrentParent(): string | null {
    return this.parentStack.length > 0 
      ? this.parentStack[this.parentStack.length - 1] 
      : null;
  }

  /**
   * Build and return the final SourceMap
   */
  build(): SourceMapEntry[] {
    return this.entries;
  }

  /**
   * Calculate CodeRange from captured tokens
   * Finds the earliest start and latest end among all tokens
   */
  private calculateRange(tokens: CapturedTokens): CodeRange {
    const positions: Array<{ line: number; column: number; offset?: number }> = [];

    // Collect all token positions
    if (tokens.keyword) {
      positions.push(this.getTokenStart(tokens.keyword));
      positions.push(this.getTokenEnd(tokens.keyword));
    }
    if (tokens.name) {
      positions.push(this.getTokenStart(tokens.name));
      positions.push(this.getTokenEnd(tokens.name));
    }
    if (tokens.paramList) {
      positions.push(this.getTokenStart(tokens.paramList));
      positions.push(this.getTokenEnd(tokens.paramList));
    }
    if (tokens.body) {
      positions.push(this.getTokenStart(tokens.body));
      positions.push(this.getTokenEnd(tokens.body));
    }
    if (tokens.properties && tokens.properties.length > 0) {
      tokens.properties.forEach(prop => {
        positions.push(this.getTokenStart(prop));
        positions.push(this.getTokenEnd(prop));
      });
    }

    // Find min start and max end
    if (positions.length === 0) {
      // Fallback: use keyword or first available token
      const fallbackToken = tokens.keyword || tokens.name;
      return {
        start: this.getTokenStart(fallbackToken),
        end: this.getTokenEnd(fallbackToken),
      };
    }

    // Sort positions by line, then column
    positions.sort((a, b) => {
      if (a.line !== b.line) return a.line - b.line;
      return a.column - b.column;
    });

    const start = positions[0];
    const end = positions[positions.length - 1];

    return { start, end };
  }

  /**
   * Extract start position from a Chevrotain token
   */
  private getTokenStart(token: any): Position {
    return {
      line: token.startLine || 1,
      column: token.startColumn !== undefined ? token.startColumn - 1 : 0,  // Chevrotain is 1-based, we want 0-based
      offset: token.startOffset,
    };
  }

  /**
   * Extract end position from a Chevrotain token
   */
  private getTokenEnd(token: any): Position {
    return {
      line: token.endLine || token.startLine || 1,
      column: token.endColumn !== undefined ? token.endColumn : token.startColumn || 0,  // Chevrotain columns are 1-based
      offset: token.endOffset,
    };
  }

  /**
   * Reset the builder (for reuse)
   */
  reset(filePath: string = '<input>'): void {
    this.entries = [];
    this.filePath = filePath;
    this.parentStack = [];
  }
}
