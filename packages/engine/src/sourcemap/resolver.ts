/**
 * SourceMapResolver
 * 
 * Provides query APIs for bidirectional code↔canvas selection
 * 
 * **Use Cases:**
 * 1. Canvas → Code: Click SVG element with data-node-id → find code location
 * 2. Code → Canvas: Click code position → find corresponding node
 * 
 * **Performance:**
 * - getNodeById: O(1) with Map index
 * - getNodeByPosition: O(n) linear search (could be optimized with interval tree)
 * - getChildren/getParent: O(1) with indexes
 */

import type { SourceMapEntry, Position } from './types';

/**
 * Query result for position-based lookups
 */
export interface PositionQueryResult extends SourceMapEntry {
  // Depth in the AST tree (0 = root, higher = more nested)
  depth: number;
}

/**
 * SourceMap query and navigation API
 */
export class SourceMapResolver {
  private nodeMap: Map<string, SourceMapEntry>;
  private childrenMap: Map<string, SourceMapEntry[]>;
  private positionIndex: SourceMapEntry[];

  constructor(sourceMap: SourceMapEntry[]) {
    // Build indexes for fast lookups
    this.nodeMap = new Map();
    this.childrenMap = new Map();
    this.positionIndex = sourceMap;

    // Index by nodeId
    for (const entry of sourceMap) {
      this.nodeMap.set(entry.nodeId, entry);
    }

    // Index children by parentId
    for (const entry of sourceMap) {
      if (entry.parentId) {
        const siblings = this.childrenMap.get(entry.parentId) || [];
        siblings.push(entry);
        this.childrenMap.set(entry.parentId, siblings);
      }
    }
  }

  /**
   * Find node by ID (Canvas → Code)
   * 
   * @example
   * // User clicks SVG element with data-node-id="component-button-0"
   * const node = resolver.getNodeById("component-button-0");
   * editor.revealRange(node.range); // Jump to code
   */
  getNodeById(nodeId: string): SourceMapEntry | null {
    return this.nodeMap.get(nodeId) || null;
  }

  /**
   * Find node at position (Code → Canvas)
   * Returns the most specific (deepest) node containing the position
   * 
   * @example
   * // User clicks code at line 5, column 10
   * const node = resolver.getNodeByPosition(5, 10);
   * canvas.highlightElement(node.nodeId); // Highlight in canvas
   */
  getNodeByPosition(line: number, column: number): SourceMapEntry | null {
    const candidates: PositionQueryResult[] = [];

    for (const entry of this.positionIndex) {
      if (this.containsPosition(entry, line, column)) {
        const depth = this.calculateDepth(entry);
        candidates.push({ ...entry, depth });
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    // Return the deepest (most specific) node
    candidates.sort((a, b) => b.depth - a.depth);
    return candidates[0];
  }

  /**
   * Get all child nodes of a parent
   * 
   * @example
   * const children = resolver.getChildren("layout-stack-0");
   * // Returns: [component-button-0, component-input-0, ...]
   */
  getChildren(nodeId: string): SourceMapEntry[] {
    return this.childrenMap.get(nodeId) || [];
  }

  /**
   * Get parent node
   * 
   * @example
   * const parent = resolver.getParent("component-button-0");
   * // Returns: layout-stack-0
   */
  getParent(nodeId: string): SourceMapEntry | null {
    const node = this.nodeMap.get(nodeId);
    if (!node || !node.parentId) {
      return null;
    }
    return this.nodeMap.get(node.parentId) || null;
  }

  /**
   * Get all nodes in the SourceMap
   */
  getAllNodes(): SourceMapEntry[] {
    return this.positionIndex;
  }

  /**
   * Get all nodes of a specific type
   * 
   * @example
   * const buttons = resolver.getNodesByType("component", "Button");
   */
  getNodesByType(type: SourceMapEntry['type'], subtype?: string): SourceMapEntry[] {
    return this.positionIndex.filter(entry => {
      if (entry.type !== type) return false;
      
      // Filter by subtype if provided
      if (subtype) {
        if (type === 'component' && entry.componentType !== subtype) return false;
        if (type === 'layout' && entry.layoutType !== subtype) return false;
      }
      
      return true;
    });
  }

  /**
   * Get siblings of a node (nodes with same parent)
   */
  getSiblings(nodeId: string): SourceMapEntry[] {
    const node = this.nodeMap.get(nodeId);
    if (!node || !node.parentId) {
      return [];
    }

    const siblings = this.getChildren(node.parentId);
    return siblings.filter(s => s.nodeId !== nodeId);
  }

  /**
   * Get path from root to node (breadcrumb)
   * 
   * @example
   * const path = resolver.getPath("component-button-0");
   * // Returns: [project, screen-0, layout-stack-0, component-button-0]
   */
  getPath(nodeId: string): SourceMapEntry[] {
    const path: SourceMapEntry[] = [];
    let current = this.nodeMap.get(nodeId);

    while (current) {
      path.unshift(current);
      current = current.parentId ? this.nodeMap.get(current.parentId) : undefined;
    }

    return path;
  }

  /**
   * Check if a position is within a node's range
   */
  private containsPosition(entry: SourceMapEntry, line: number, column: number): boolean {
    const { range } = entry;

    // Check if line is within range
    if (line < range.start.line || line > range.end.line) {
      return false;
    }

    // If single line, check column bounds
    if (range.start.line === range.end.line) {
      return column >= range.start.column && column <= range.end.column;
    }

    // Multi-line range
    if (line === range.start.line) {
      return column >= range.start.column;
    }
    if (line === range.end.line) {
      return column <= range.end.column;
    }

    // Line is in the middle
    return true;
  }

  /**
   * Calculate depth of a node in the tree (0 = root)
   */
  private calculateDepth(entry: SourceMapEntry): number {
    let depth = 0;
    let current = entry;

    while (current.parentId) {
      depth++;
      const parent = this.nodeMap.get(current.parentId);
      if (!parent) break;
      current = parent;
    }

    return depth;
  }

  /**
   * Get statistics about the SourceMap
   */
  getStats(): {
    totalNodes: number;
    byType: Record<string, number>;
    maxDepth: number;
  } {
    const byType: Record<string, number> = {};
    let maxDepth = 0;

    for (const entry of this.positionIndex) {
      // Count by type
      byType[entry.type] = (byType[entry.type] || 0) + 1;

      // Calculate max depth
      const depth = this.calculateDepth(entry);
      maxDepth = Math.max(maxDepth, depth);
    }

    return {
      totalNodes: this.positionIndex.length,
      byType,
      maxDepth,
    };
  }
}
