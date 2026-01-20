import type { IRContract, IRNode, IRTokens } from '../ir/index';

/**
 * Layout Engine
 *
 * Calculates positions and dimensions for all nodes
 * Supports: stack (vertical/horizontal), grid (12-column)
 */

// ============================================================================
// TYPES
// ============================================================================

export interface LayoutPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutResult {
  [nodeId: string]: LayoutPosition;
}

// ============================================================================
// SPACING TOKENS
// ============================================================================

const SPACING_VALUES: Record<string, number> = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const DENSITY_HEIGHTS: Record<string, number> = {
  compact: 32,
  normal: 40,
  comfortable: 48,
};

// ============================================================================
// LAYOUT ENGINE
// ============================================================================

export class LayoutEngine {
  private nodes: Record<string, IRNode>;
  private tokens: IRTokens;
  private result: LayoutResult = {};
  private viewport: { width: number; height: number };
  private ir: IRContract;

  constructor(ir: IRContract) {
    this.ir = ir;
    this.nodes = ir.project.nodes;
    this.tokens = ir.project.tokens;
    this.viewport = ir.project.screens[0]?.viewport || { width: 1280, height: 720 };
  }

  calculate(): LayoutResult {
    this.result = {};

    // Calculate layout for each screen's root
    if (this.ir.project.screens.length > 0) {
      const screen = this.ir.project.screens[0];
      const rootId = screen.root.ref;
      if (rootId) {
        this.calculateNode(rootId, 0, 0, this.viewport.width, this.viewport.height);
      }
    }

    return this.result;
  }

  private calculateNode(nodeId: string, x: number, y: number, width: number, height: number): void {
    const node = this.nodes[nodeId];
    if (!node) return;

    if (node.kind === 'container') {
      this.calculateContainer(node, nodeId, x, y, width, height);
    } else {
      this.calculateComponent(node, nodeId, x, y, width, height);
    }
  }

  private calculateContainer(
    node: IRNode,
    nodeId: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    if (node.kind !== 'container') return;

    // Apply padding
    const padding = this.resolveSpacing(node.style.padding);
    const innerX = x + padding;
    const innerY = y + padding;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    // Store container position
    this.result[nodeId] = { x, y, width, height };

    // Calculate children based on container type
    switch (node.containerType) {
      case 'stack':
        this.calculateStack(node, innerX, innerY, innerWidth, innerHeight);
        break;
      case 'grid':
        this.calculateGrid(node, innerX, innerY, innerWidth, innerHeight);
        break;
      case 'split':
        this.calculateSplit(node, innerX, innerY, innerWidth, innerHeight);
        break;
    }
  }

  private calculateStack(node: IRNode, x: number, y: number, width: number, height: number): void {
    if (node.kind !== 'container') return;

    const direction = node.params.direction || 'vertical';
    const gap = this.resolveSpacing(node.style.gap);
    const children = node.children;

    if (direction === 'vertical') {
      let currentY = y;

      children.forEach((childRef, index) => {
        const childNode = this.nodes[childRef.ref];
        let childHeight = this.getComponentHeight();

        // Use actual component height or calculate share of remaining space
        if (childNode?.kind === 'component' && childNode.props.height) {
          childHeight = Number(childNode.props.height);
        }

        this.calculateNode(childRef.ref, x, currentY, width, childHeight);
        currentY += childHeight;

        // Add gap except after last child
        if (index < children.length - 1) {
          currentY += gap;
        }
      });
    } else {
      // horizontal
      let currentX = x;
      const childWidth = this.calculateChildWidth(children.length, width, gap);

      children.forEach((childRef) => {
        this.calculateNode(childRef.ref, currentX, y, childWidth, height);
        currentX += childWidth + gap;
      });
    }
  }

  private calculateGrid(node: IRNode, x: number, y: number, width: number, height: number): void {
    if (node.kind !== 'container') return;

    const columns = Number(node.params.columns) || 12;
    const gap = this.resolveSpacing(node.style.gap);
    const colWidth = (width - gap * (columns - 1)) / columns;

    let currentRow = 0;
    let currentCol = 0;
    const rowHeight = this.getComponentHeight();

    node.children.forEach((childRef) => {
      const child = this.nodes[childRef.ref];
      let span = 1;

      // Get span from cell params if it's a cell container
      if (child?.kind === 'container' && child.meta?.source === 'cell') {
        span = Number(child.params.span) || 1;
      }

      const cellWidth = colWidth * span + gap * (span - 1);
      const cellX = x + currentCol * (colWidth + gap);
      const cellY = y + currentRow * (rowHeight + gap);

      this.calculateNode(childRef.ref, cellX, cellY, cellWidth, rowHeight);

      currentCol += span;
      if (currentCol >= columns) {
        currentCol = 0;
        currentRow++;
      }
    });
  }

  private calculateSplit(node: IRNode, x: number, y: number, width: number, height: number): void {
    if (node.kind !== 'container') return;

    const gap = this.resolveSpacing(node.style.gap);
    const sidebarWidth = Number(node.params.sidebar) || 260;

    if (node.children.length === 1) {
      // Only one child, give it full width
      this.calculateNode(node.children[0].ref, x, y, width, height);
    } else if (node.children.length >= 2) {
      // Left sidebar
      this.calculateNode(node.children[0].ref, x, y, sidebarWidth, height);

      // Right content
      const contentX = x + sidebarWidth + gap;
      const contentWidth = width - sidebarWidth - gap;
      this.calculateNode(node.children[1].ref, contentX, y, contentWidth, height);
    }
  }

  private calculateComponent(
    node: IRNode,
    nodeId: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    if (node.kind !== 'component') return;

    // Use explicit dimensions from props if available
    const componentWidth = Number(node.props.width) || width;
    const componentHeight = Number(node.props.height) || this.getComponentHeight();

    this.result[nodeId] = {
      x,
      y,
      width: componentWidth,
      height: componentHeight,
    };
  }

  private resolveSpacing(spacing?: string): number {
    if (!spacing) return SPACING_VALUES[this.tokens.spacing];
    return SPACING_VALUES[spacing] || SPACING_VALUES.md;
  }

  private getComponentHeight(): number {
    return DENSITY_HEIGHTS[this.tokens.density] || DENSITY_HEIGHTS.normal;
  }

  private calculateChildHeight(count: number, totalHeight: number, gap: number): number {
    if (count === 0) return 0;
    const totalGap = gap * (count - 1);
    return (totalHeight - totalGap) / count;
  }

  private calculateChildWidth(count: number, totalWidth: number, gap: number): number {
    if (count === 0) return 0;
    const totalGap = gap * (count - 1);
    return (totalWidth - totalGap) / count;
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

export function calculateLayout(ir: IRContract): LayoutResult {
  const engine = new LayoutEngine(ir);
  return engine.calculate();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function resolveGridPosition(
  row: number,
  col: number,
  rowSpan: number = 1,
  colSpan: number = 1,
  gridWidth: number = 1200,
  gridHeight: number = 800,
  gridCols: number = 12,
  gridRows: number = 8
): LayoutPosition {
  const colWidth = gridWidth / gridCols;
  const rowHeight = gridHeight / gridRows;

  return {
    x: col * colWidth,
    y: row * rowHeight,
    width: colSpan * colWidth,
    height: rowSpan * rowHeight,
  };
}
