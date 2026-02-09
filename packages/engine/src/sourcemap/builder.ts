/**
 * SourceMapBuilder
 * 
 * Constructs SourceMap during AST traversal using semantic node IDs.
 * 
 * **ID Strategy:**
 * - Uses human-readable, semantic IDs: `{type}-{subtype}-{counter}`
 * - Counter is per type-subtype to keep indices small
 * - Examples: `component-button-0`, `layout-stack-1`, `screen-0`
 * 
 * **Stability:**
 * - IDs remain stable when editing properties ✅
 * - IDs change when reordering nodes ⚠️
 * - Ideal for editor UX where property editing is frequent
 * 
 * **Generated IDs:**
 * - `project` - Single project (no counter)
 * - `screen-{n}` - Screens by index (0-based)
 * - `component-{type}-{n}` - Components by subtype (button-0, input-0, etc.)
 * - `layout-{type}-{n}` - Layouts by subtype (stack-0, grid-1, etc.)
 * - `cell-{n}` - Grid cells by index
 * - `define-{name}` - Component definitions by name
 */

import type {
  SourceMapEntry,
  SourceMapNodeType,
  CodeRange,
  Position,
  CapturedTokens,
  PropertySourceMap,
} from './types';

/**
 * Builder for constructing SourceMap entries during parsing
 * Uses semantic IDs based on type-subtype-counter (e.g., component-button-0)
 */
export class SourceMapBuilder {
  private entries: SourceMapEntry[] = [];
  private filePath: string;
  private parentStack: string[] = [];  // Stack of parent nodeIds for hierarchy tracking
  private counters = new Map<string, number>();  // Counter per type-subtype

  constructor(filePath: string = '<input>') {
    this.filePath = filePath;
  }

  /**
   * Add a node to the SourceMap
   * Generates semantic IDs like: project, screen-0, component-button-1, layout-stack-0
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
    
    // Generate semantic nodeId based on type and subtype
    const nodeId = this.generateNodeId(type, metadata);

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
   * Generate semantic node ID based on type and subtype
   * Format: {type}-{subtype}-{counter} or {type}-{counter}
   * 
   * Examples:
   * - project → "project"
   * - theme → "theme"
   * - mocks → "mocks"
   * - colors → "colors"
   * - screen → "screen-0", "screen-1"
   * - component Button → "component-button-0", "component-button-1"
   * - layout stack → "layout-stack-0", "layout-stack-1"
   * - cell → "cell-0", "cell-1"
   * - component-definition → "define-MyButton"
   */
  private generateNodeId(
    type: SourceMapNodeType,
    metadata?: { name?: string; layoutType?: string; componentType?: string }
  ): string {
    switch (type) {
      case 'project':
        // Only one project per file
        return 'project';
        
      case 'theme':
        // Only one theme per project
        return 'theme';
        
      case 'mocks':
        // Only one mocks block per project
        return 'mocks';
        
      case 'colors':
        // Only one colors block per project
        return 'colors';
        
      case 'screen':
        // screen-0, screen-1, etc. (by index, not name to avoid conflicts)
        const screenIdx = this.counters.get('screen') || 0;
        this.counters.set('screen', screenIdx + 1);
        return `screen-${screenIdx}`;
        
      case 'component': {
        // component-button-0, component-input-1, etc.
        const componentType = metadata?.componentType || 'unknown';
        const key = `component-${componentType.toLowerCase()}`;
        const idx = this.counters.get(key) || 0;
        this.counters.set(key, idx + 1);
        return `${key}-${idx}`;
      }
        
      case 'layout': {
        // layout-stack-0, layout-grid-1, etc.
        const layoutType = metadata?.layoutType || 'unknown';
        const key = `layout-${layoutType.toLowerCase()}`;
        const idx = this.counters.get(key) || 0;
        this.counters.set(key, idx + 1);
        return `${key}-${idx}`;
      }
        
      case 'cell': {
        // cell-0, cell-1, etc.
        const idx = this.counters.get('cell') || 0;
        this.counters.set('cell', idx + 1);
        return `cell-${idx}`;
      }
        
      case 'component-definition':
        // define-MyButton, define-Card, etc.
        return `define-${metadata?.name || 'unknown'}`;
        
      default:
        // Fallback
        return `${type}-0`;
    }
  }

  /**
   * Add a property to an existing node in the SourceMap
   * Captures precise ranges for property name and value for surgical editing
   * 
   * @param nodeId - ID of the node that owns this property
   * @param propertyName - Name of the property (e.g., "text", "direction")
   * @param propertyValue - Parsed value of the property
   * @param tokens - Captured tokens for the property
   * @returns The PropertySourceMap entry created
   */
  addProperty(
    nodeId: string,
    propertyName: string,
    propertyValue: any,
    tokens: {
      name?: any;           // Token for property name
      value?: any;          // Token for property value
      separator?: any;      // Token for ':' separator
      full?: any;           // Full property token (if single token)
    }
  ): PropertySourceMap {
    // Find the node entry
    const entry = this.entries.find(e => e.nodeId === nodeId);
    if (!entry) {
      throw new Error(`Cannot add property to non-existent node: ${nodeId}`);
    }

    // Initialize properties map if not present
    if (!entry.properties) {
      entry.properties = {};
    }

    // Calculate ranges for name, value, and full property
    let nameRange: CodeRange;
    let valueRange: CodeRange;
    let fullRange: CodeRange;

    if (tokens.name && tokens.value) {
      // Separate name and value tokens
      nameRange = {
        start: this.getTokenStart(tokens.name),
        end: this.getTokenEnd(tokens.name),
      };
      valueRange = {
        start: this.getTokenStart(tokens.value),
        end: this.getTokenEnd(tokens.value),
      };
      
      // Full range from name start to value end
      fullRange = {
        start: nameRange.start,
        end: valueRange.end,
      };
    } else if (tokens.full) {
      // Single token for the whole property (e.g., "text: 'Hello'")
      fullRange = {
        start: this.getTokenStart(tokens.full),
        end: this.getTokenEnd(tokens.full),
      };
      
      // Estimate name and value ranges (parser should provide separate tokens ideally)
      // For now, use full range for both (will be refined when parser provides detail)
      nameRange = fullRange;
      valueRange = fullRange;
    } else {
      throw new Error(`Invalid tokens for property ${propertyName}: need either name+value or full`);
    }

    // Create PropertySourceMap
    const propertySourceMap: PropertySourceMap = {
      name: propertyName,
      value: propertyValue,
      range: fullRange,
      nameRange,
      valueRange,
    };

    // Add to entry
    entry.properties[propertyName] = propertySourceMap;

    return propertySourceMap;
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
