/**
 * Content-based hash generation for stable NodeIds
 * 
 * Browser-safe implementation (no crypto/node dependencies)
 * Generates stable IDs that persist across parses if code hasn't changed
 */

import type { SourceMapNodeType } from './types';

/**
 * Simple hash function (djb2 variant)
 * Browser-compatible, no external dependencies
 */
function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) + hash) + char; // hash * 33 + char
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a stable, content-based node ID
 * 
 * The ID is based on:
 * - File path (distinguishes nodes across files)
 * - Line and column (unique position in file)
 * - Node type (component, layout, screen, etc.)
 * - Optional name (for named nodes like screens, defined components)
 * 
 * Examples:
 * - "node-k7m2p9-component" (Icon component at Main.wire:5:4)
 * - "node-abc123-screen"    (Main screen at Main.wire:2:0)
 * - "node-xyz789-layout"    (stack layout at Main.wire:3:2)
 * 
 * @param type - Type of AST node
 * @param filePath - Source file path
 * @param line - Line number (1-based)
 * @param column - Column number (0-based)
 * @param name - Optional name (for screens, defined components)
 * @returns Stable node ID
 */
export function generateStableNodeId(
  type: SourceMapNodeType,
  filePath: string,
  line: number,
  column: number,
  name?: string
): string {
  // Build content string that uniquely identifies this node
  const content = `${filePath}:${line}:${column}:${type}${name ? `:${name}` : ''}`;
  
  // Generate hash
  const hash = simpleHash(content);
  
  // Convert to base36 (shorter, alphanumeric)
  const hashStr = hash.toString(36);
  
  // Format: node-{hash}-{type}
  // Examples: node-k7m2p9-component, node-abc123-screen
  return `node-${hashStr}-${type}`;
}

/**
 * Validate if a string looks like a valid node ID
 * 
 * @param id - String to validate
 * @returns true if it matches the node ID pattern
 */
export function isValidNodeId(id: string): boolean {
  return /^node-[a-z0-9]+-[a-z-]+$/.test(id);
}

/**
 * Extract node type from a node ID
 * 
 * @param nodeId - Node ID to parse
 * @returns The node type, or null if invalid
 */
export function getTypeFromNodeId(nodeId: string): SourceMapNodeType | null {
  const match = nodeId.match(/^node-[a-z0-9]+-(.+)$/);
  if (!match) return null;
  
  return match[1] as SourceMapNodeType;
}
