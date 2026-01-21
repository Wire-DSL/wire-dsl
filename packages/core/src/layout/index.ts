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
  none: 0,
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
  private parentContainerTypes: Map<string, string> = new Map(); // Track parent container types

  constructor(ir: IRContract) {
    this.ir = ir;
    this.nodes = ir.project.nodes;
    this.tokens = ir.project.tokens;
    this.viewport = ir.project.screens[0]?.viewport || { width: 1280, height: 720 };
  }

  calculate(): LayoutResult {
    this.result = {};

    // Calculate layout for all screens
    for (const screen of this.ir.project.screens) {
      const rootId = screen.root.ref;
      if (rootId) {
        this.calculateNode(rootId, 0, 0, this.viewport.width, this.viewport.height);
      }
    }

    return this.result;
  }

  private calculateNode(
    nodeId: string,
    x: number,
    y: number,
    width: number,
    height: number,
    parentContainerType?: string
  ): void {
    const node = this.nodes[nodeId];
    if (!node) return;

    // Track parent container type for padding optimization
    if (parentContainerType && node.kind === 'container') {
      this.parentContainerTypes.set(nodeId, parentContainerType);
    }

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

    // Apply padding normally - children handle their own padding
    const padding = this.resolveSpacing(node.style.padding);
    const innerX = x + padding;
    const innerY = y + padding;
    const innerWidth = width - padding * 2;

    // For vertical stacks, don't constrain height - let children determine it
    // For horizontal stacks and grids, use available height
    const direction = node.params.direction || 'vertical';
    const isVerticalStack = node.containerType === 'stack' && direction === 'vertical';
    const innerHeight = isVerticalStack ? height : height - padding * 2;

    // Store container position with width and initial height (may be updated)
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
      case 'panel':
        this.calculatePanel(node, innerX, innerY, innerWidth, innerHeight);
        break;
    }

    // For vertical stacks, recalculate container height based on actual children positions
    if (isVerticalStack) {
      let containerMaxY = innerY;
      node.children.forEach((childRef) => {
        const childPos = this.result[childRef.ref];
        if (childPos) {
          containerMaxY = Math.max(containerMaxY, childPos.y + childPos.height);
        }
      });
      const calculatedHeight = containerMaxY - y + padding;
      this.result[nodeId].height = calculatedHeight;
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

        // If explicit height in props
        if (childNode?.kind === 'component' && childNode.props.height) {
          childHeight = Number(childNode.props.height);
        }
        // If it's a container (layout), calculate height from its children
        else if (childNode?.kind === 'container') {
          childHeight = this.calculateContainerHeight(childNode, width);
        }
        // If it's a component, use intrinsic height
        else if (childNode?.kind === 'component') {
          childHeight = this.getIntrinsicComponentHeight(childNode);
        }

        this.calculateNode(childRef.ref, x, currentY, width, childHeight, 'stack');
        currentY += childHeight;

        // Add gap except after last child
        if (index < children.length - 1) {
          currentY += gap;
        }
      });
    } else {
      // horizontal - calculate height from tallest child
      let currentX = x;
      const childWidth = this.calculateChildWidth(children.length, width, gap);

      // Calculate max height of children
      let stackHeight = 0;
      children.forEach((childRef) => {
        const childNode = this.nodes[childRef.ref];
        let childHeight = this.getComponentHeight();

        if (childNode?.kind === 'component' && childNode.props.height) {
          childHeight = Number(childNode.props.height);
        } else if (childNode?.kind === 'container') {
          childHeight = this.calculateContainerHeight(childNode, childWidth);
        } else if (childNode?.kind === 'component') {
          childHeight = this.getIntrinsicComponentHeight(childNode);
        }

        stackHeight = Math.max(stackHeight, childHeight);
      });

      // Position children with calculated height
      children.forEach((childRef) => {
        this.calculateNode(childRef.ref, currentX, y, childWidth, stackHeight, 'stack');
        currentX += childWidth + gap;
      });
    }
  }

  private calculateContainerHeight(node: IRNode, availableWidth: number): number {
    if (node.kind !== 'container') return this.getComponentHeight();

    const gap = this.resolveSpacing(node.style.gap);
    const padding = this.resolveSpacing(node.style.padding);
    let totalHeight = padding * 2;

    // For grids, calculate height based on row layout, not linear sum
    if (node.containerType === 'grid') {
      const columns = Number(node.params.columns) || 12;
      const colWidth = availableWidth / columns;

      // Calculate row heights
      let currentRow = 0;
      let currentCol = 0;
      let currentRowMaxHeight = 0;
      const rowHeights: number[] = [0];

      node.children.forEach((childRef) => {
        const child = this.nodes[childRef.ref];
        let span = 1;
        let childHeight = this.getComponentHeight();

        if (child?.kind === 'container' && child.meta?.source === 'cell') {
          span = Number(child.params.span) || 1;
        }

        if (child?.kind === 'component') {
          if (child.props.height) {
            childHeight = Number(child.props.height);
          } else {
            childHeight = this.getIntrinsicComponentHeight(child);
          }
        } else if (child?.kind === 'container') {
          childHeight = this.calculateContainerHeight(child, colWidth * span);
        }

        // Check if cell fits in current row
        if (currentCol + span > columns) {
          rowHeights[currentRow] = currentRowMaxHeight;
          currentRow++;
          currentCol = 0;
          currentRowMaxHeight = 0;
        }

        currentRowMaxHeight = Math.max(currentRowMaxHeight, childHeight);
        currentCol += span;
      });

      // Add last row
      rowHeights[currentRow] = currentRowMaxHeight;

      // Sum row heights
      for (let r = 0; r <= currentRow; r++) {
        totalHeight += rowHeights[r];
        if (r < currentRow) {
          totalHeight += gap;
        }
      }

      return totalHeight;
    }

    // For stacks and other containers
    const direction = node.params.direction || 'vertical';

    if (node.containerType === 'stack' && direction === 'horizontal') {
      // Horizontal stacks take the tallest child only
      let maxHeight = 0;

      node.children.forEach((childRef) => {
        const child = this.nodes[childRef.ref];
        let childHeight = this.getComponentHeight();

        if (child?.kind === 'component') {
          if (child.props.height) {
            childHeight = Number(child.props.height);
          } else {
            childHeight = this.getIntrinsicComponentHeight(child);
          }
        } else if (child?.kind === 'container') {
          childHeight = this.calculateContainerHeight(child, availableWidth);
        }

        maxHeight = Math.max(maxHeight, childHeight);
      });

      totalHeight += maxHeight;
      return totalHeight;
    }

    // Vertical stacks and other containers sum heights linearly
    node.children.forEach((childRef, index) => {
      const child = this.nodes[childRef.ref];
      let childHeight = this.getComponentHeight();

      if (child?.kind === 'component') {
        if (child.props.height) {
          childHeight = Number(child.props.height);
        } else {
          childHeight = this.getIntrinsicComponentHeight(child);
        }
      } else if (child?.kind === 'container') {
        childHeight = this.calculateContainerHeight(child, availableWidth);
      }

      totalHeight += childHeight;

      // Add gap except after last child
      if (index < node.children.length - 1) {
        totalHeight += gap;
      }
    });

    return totalHeight;
  }

  private calculateGrid(node: IRNode, x: number, y: number, width: number, height: number): void {
    if (node.kind !== 'container') return;

    const columns = Number(node.params.columns) || 12;
    const gap = this.resolveSpacing(node.style.gap);
    const colWidth = (width - gap * (columns - 1)) / columns;

    // Multi-pass layout:
    // Pass 1: Calculate heights of all cells
    const cellHeights: Record<number, number> = {}; // cellIndex -> height
    node.children.forEach((childRef, cellIndex) => {
      const child = this.nodes[childRef.ref];
      let cellHeight = this.getComponentHeight();

      if (child?.kind === 'container') {
        cellHeight = this.calculateContainerHeight(child, colWidth);
      } else if (child?.kind === 'component') {
        if (child.props.height) {
          cellHeight = Number(child.props.height);
        } else {
          cellHeight = this.getIntrinsicComponentHeight(child);
        }
      }

      cellHeights[cellIndex] = cellHeight;
    });

    // Pass 2: Layout cells and determine row heights
    let currentRow = 0;
    let currentCol = 0;
    let currentRowMaxHeight = 0;
    const rowHeights: number[] = [0];
    const cellPositions: Array<{ row: number; col: number; span: number }> = [];

    node.children.forEach((childRef, cellIndex) => {
      const child = this.nodes[childRef.ref];
      let span = 1;

      if (child?.kind === 'container' && child.meta?.source === 'cell') {
        span = Number(child.params.span) || 1;
      }

      // Check if cell fits in current row
      if (currentCol + span > columns) {
        // Move to next row
        rowHeights[currentRow] = currentRowMaxHeight;
        currentRow++;
        currentCol = 0;
        currentRowMaxHeight = 0;
      }

      cellPositions.push({ row: currentRow, col: currentCol, span });
      currentRowMaxHeight = Math.max(currentRowMaxHeight, cellHeights[cellIndex]);

      currentCol += span;
    });

    // Add last row height
    rowHeights[currentRow] = currentRowMaxHeight;

    // Pass 3: Position all cells using calculated row heights
    node.children.forEach((childRef, cellIndex) => {
      const { row, col, span } = cellPositions[cellIndex];
      const cellHeight = rowHeights[row];

      // Calculate y position (sum of all previous row heights + gaps)
      let cellY = y;
      for (let r = 0; r < row; r++) {
        cellY += rowHeights[r] + gap;
      }

      const cellWidth = colWidth * span + gap * (span - 1);
      const cellX = x + col * (colWidth + gap);

      this.calculateNode(childRef.ref, cellX, cellY, cellWidth, cellHeight, 'grid');
    });
  }

  private calculateSplit(node: IRNode, x: number, y: number, width: number, height: number): void {
    if (node.kind !== 'container') return;

    const gap = this.resolveSpacing(node.style.gap);
    const sidebarWidth = Number(node.params.sidebar) || 260;

    if (node.children.length === 1) {
      // Only one child, give it full width
      this.calculateNode(node.children[0].ref, x, y, width, height, 'split');
    } else if (node.children.length >= 2) {
      // Left sidebar - will have its left padding, but right padding handled by gap
      this.calculateNode(node.children[0].ref, x, y, sidebarWidth, height, 'split');

      // Right content - will have its right padding, but left padding handled by gap
      const contentX = x + sidebarWidth + gap;
      const contentWidth = width - sidebarWidth - gap;
      this.calculateNode(node.children[1].ref, contentX, y, contentWidth, height, 'split');
    }
  }

  private calculatePanel(node: IRNode, x: number, y: number, width: number, height: number): void {
    if (node.kind !== 'container' || node.children.length === 0) return;

    // Panel has exactly one child
    const childRef = node.children[0];
    this.calculateNode(childRef.ref, x, y, width, height, 'panel');
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
    const componentHeight = Number(node.props.height) || this.getIntrinsicComponentHeight(node);

    this.result[nodeId] = {
      x,
      y,
      width: componentWidth,
      height: componentHeight,
    };
  }

  private resolveSpacing(spacing?: string): number {
    if (!spacing) return SPACING_VALUES[this.tokens.spacing];
    const value = SPACING_VALUES[spacing];
    return value !== undefined ? value : SPACING_VALUES.md;
  }

  private getComponentHeight(): number {
    return DENSITY_HEIGHTS[this.tokens.density] || DENSITY_HEIGHTS.normal;
  }

  private getIntrinsicComponentHeight(node: IRNode): number {
    if (node.kind !== 'component') return this.getComponentHeight();

    // Table: calculate based on rows if available
    if (node.componentType === 'Table') {
      const explicitHeight = Number(node.props.height);
      if (!isNaN(explicitHeight) && explicitHeight > 0) {
        return explicitHeight;
      }
      const rowCount = Number(node.props.rows || 5);
      const hasTitle = !!node.props.title;
      const hasPagination = String(node.props.pagination) === 'true';
      const headerHeight = 44;
      const rowHeight = 36;
      const titleHeight = hasTitle ? 32 : 0;
      const paginationHeight = hasPagination ? 64 : 0; // 16px gap + 32px buttons + 16px bottom margin
      return titleHeight + headerHeight + rowCount * rowHeight + paginationHeight;
    }

    // Taller components
    if (node.componentType === 'Textarea') return 100;
    if (node.componentType === 'Modal') return 300;
    if (node.componentType === 'Card') return 120;
    if (node.componentType === 'ChartPlaceholder') return 250;
    if (node.componentType === 'List') return 180;

    // Standard height components
    if (node.componentType === 'Topbar') return 56;
    if (node.componentType === 'Divider') return 1;

    // Default height
    return this.getComponentHeight();
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
