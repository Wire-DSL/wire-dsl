import type { IRContract, IRNode, IRStyle } from '../ir/index';
import { resolveSpacingToken, type DensityLevel } from '../shared/spacing';
import { resolveIconButtonSize, resolveIconSize } from '../shared/component-sizes';

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
  private style: IRStyle;
  private result: LayoutResult = {};
  private viewport: { width: number; height: number };
  private ir: IRContract;
  private parentContainerTypes: Map<string, string> = new Map(); // Track parent container types

  constructor(ir: IRContract) {
    this.ir = ir;
    this.nodes = ir.project.nodes;
    this.style = ir.project.style;
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
      case 'card':
        this.calculateCard(node, innerX, innerY, innerWidth, innerHeight);
        break;
    }

    // For vertical stacks and cards, recalculate container height based on actual children positions
    if (isVerticalStack || node.containerType === 'card') {
      let containerMaxY = y;
      node.children.forEach((childRef) => {
        const childPos = this.result[childRef.ref];
        if (childPos) {
          containerMaxY = Math.max(containerMaxY, childPos.y + childPos.height);
        }
      });
      const cardPadding = node.containerType === 'card' ? this.resolveSpacing(node.style.padding) : padding;
      const calculatedHeight = containerMaxY - y + cardPadding;
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
        // If it's a component, use intrinsic height (pass width for responsive components like Image)
        else if (childNode?.kind === 'component') {
          childHeight = this.getIntrinsicComponentHeight(childNode, width);
        }

        this.calculateNode(childRef.ref, x, currentY, width, childHeight, 'stack');
        currentY += childHeight;

        // Add gap except after last child
        if (index < children.length - 1) {
          currentY += gap;
        }
      });

      // Post-processing: adjust Y positions based on actual container heights
      // Some containers (like card) may have their heights recalculated after children are positioned
      let adjustedY = y;
      children.forEach((childRef, index) => {
        const childPos = this.result[childRef.ref];
        if (childPos) {
          const deltaY = adjustedY - childPos.y;
          
          // Update Y position to the adjusted position
          childPos.y = adjustedY;
          
          // If this child is a container, recursively update all its descendants
          if (deltaY !== 0) {
            this.adjustNodeYPositions(childRef.ref, deltaY);
          }
          
          adjustedY += childPos.height;
          
          // Add gap except after last child
          if (index < children.length - 1) {
            adjustedY += gap;
          }
        }
      });
    } else {
      // horizontal - apply align property
      const align = node.style.align || 'justify';
      
      if (align === 'justify') {
        // Default behavior: equal width distribution (100% width)
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
            childHeight = this.getIntrinsicComponentHeight(childNode, childWidth);
          }

          stackHeight = Math.max(stackHeight, childHeight);
        });

        // Position children with calculated height
        children.forEach((childRef) => {
          this.calculateNode(childRef.ref, currentX, y, childWidth, stackHeight, 'stack');
          currentX += childWidth + gap;
        });
      } else {
        // Custom alignment: left, center, right with natural widths
        // Calculate natural widths for all children
        const childWidths: number[] = [];
        let stackHeight = 0;

        children.forEach((childRef) => {
          const childNode = this.nodes[childRef.ref];
          let childWidth = this.getIntrinsicComponentWidth(childNode);
          let childHeight = this.getComponentHeight();

          if (childNode?.kind === 'component' && childNode.props.height) {
            childHeight = Number(childNode.props.height);
          } else if (childNode?.kind === 'component' && childNode.props.width) {
            childWidth = Number(childNode.props.width);
          } else if (childNode?.kind === 'container') {
            childHeight = this.calculateContainerHeight(childNode, childWidth);
          } else if (childNode?.kind === 'component') {
            childHeight = this.getIntrinsicComponentHeight(childNode, childWidth);
          }

          childWidths.push(childWidth);
          stackHeight = Math.max(stackHeight, childHeight);
        });

        // Calculate total content width needed
        const totalChildWidth = childWidths.reduce((sum, w) => sum + w, 0);
        const totalGapWidth = gap * Math.max(0, children.length - 1);
        const totalContentWidth = totalChildWidth + totalGapWidth;

        // Calculate starting X based on alignment
        let startX = x;
        if (align === 'center') {
          startX = x + (width - totalContentWidth) / 2;
        } else if (align === 'right') {
          startX = x + width - totalContentWidth;
        }
        // 'left' uses startX = x (no adjustment)

        // Position children with natural widths
        let currentX = startX;
        children.forEach((childRef, index) => {
          const childWidth = childWidths[index];
          this.calculateNode(childRef.ref, currentX, y, childWidth, stackHeight, 'stack');
          currentX += childWidth + gap;
        });
      }
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
            childHeight = this.getIntrinsicComponentHeight(child, colWidth * span);
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
            childHeight = this.getIntrinsicComponentHeight(child, availableWidth);
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
          childHeight = this.getIntrinsicComponentHeight(child, availableWidth);
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
          cellHeight = this.getIntrinsicComponentHeight(child, colWidth);
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

  private calculateCard(node: IRNode, x: number, y: number, width: number, height: number): void {
    if (node.kind !== 'container' || node.children.length === 0) return;

    // Card is a vertical stack container with its own padding
    const cardPadding = this.resolveSpacing(node.style.padding);
    const gap = this.resolveSpacing(node.style.gap);
    const innerCardWidth = width - cardPadding * 2;
    const children = node.children;
    let currentY = y + cardPadding;

    children.forEach((childRef, index) => {
      const childNode = this.nodes[childRef.ref];
      let childHeight = this.getComponentHeight();

      // If explicit height in props
      if (childNode?.kind === 'component' && childNode.props.height) {
        childHeight = Number(childNode.props.height);
      }
      // If it's a container (layout), calculate height from its children
      else if (childNode?.kind === 'container') {
        childHeight = this.calculateContainerHeight(childNode, innerCardWidth);
      }
      // If it's a component, use intrinsic height (pass innerCardWidth for responsive components like Image)
      else if (childNode?.kind === 'component') {
        childHeight = this.getIntrinsicComponentHeight(childNode, innerCardWidth);
      }

      this.calculateNode(childRef.ref, x + cardPadding, currentY, innerCardWidth, childHeight, 'card');
      currentY += childHeight;

      // Add gap except after last child
      if (index < children.length - 1) {
        currentY += gap;
      }
    });
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
    const componentHeight = Number(node.props.height) || this.getIntrinsicComponentHeight(node, componentWidth);

    this.result[nodeId] = {
      x,
      y,
      width: componentWidth,
      height: componentHeight,
    };
  }

  private resolveSpacing(spacing?: string): number {
    return resolveSpacingToken(
      spacing,
      this.style.spacing || 'md',
      (this.style.density || 'normal') as DensityLevel,
      true
    );
  }

  private getSeparateSize(node: IRNode): number {
    if (node.kind !== 'component') {
      return resolveSpacingToken('md', 'md', (this.style.density || 'normal') as DensityLevel, true);
    }
    const explicitSize = node.props.size;
    if (typeof explicitSize === 'number' && !isNaN(explicitSize)) {
      return explicitSize;
    }
    return resolveSpacingToken(
      explicitSize ? String(explicitSize) : 'md',
      'md',
      (this.style.density || 'normal') as DensityLevel,
      true
    );
  }

  private getComponentHeight(): number {
    return DENSITY_HEIGHTS[this.style.density] || DENSITY_HEIGHTS.normal;
  }

  private getTextMetricsForDensity(): { fontSize: number; lineHeight: number } {
    switch (this.style.density) {
      case 'compact':
        return { fontSize: 12, lineHeight: 1.4 };
      case 'comfortable':
        return { fontSize: 16, lineHeight: 1.6 };
      case 'normal':
      default:
        return { fontSize: 14, lineHeight: 1.5 };
    }
  }

  private getHeadingMetricsForDensity(): { fontSize: number; lineHeight: number } {
    switch (this.style.density) {
      case 'compact':
        return { fontSize: 16, lineHeight: 1.25 };
      case 'comfortable':
        return { fontSize: 24, lineHeight: 1.25 };
      case 'normal':
      default:
        return { fontSize: 20, lineHeight: 1.25 };
    }
  }

  private wrapTextToLines(text: string, maxWidth: number, fontSize: number): string[] {
    const normalized = text.replace(/\r\n/g, '\n');
    const paragraphs = normalized.split('\n');
    const charWidth = fontSize * 0.6;
    const safeWidth = Math.max(maxWidth, charWidth);
    const maxCharsPerLine = Math.max(1, Math.floor(safeWidth / charWidth));
    const lines: string[] = [];

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) {
        lines.push('');
        continue;
      }

      const words = paragraph.split(/\s+/).filter(Boolean);
      let currentLine = '';

      for (const word of words) {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        if (candidate.length <= maxCharsPerLine) {
          currentLine = candidate;
          continue;
        }

        if (currentLine) {
          lines.push(currentLine);
          currentLine = '';
        }

        if (word.length <= maxCharsPerLine) {
          currentLine = word;
          continue;
        }

        for (let i = 0; i < word.length; i += maxCharsPerLine) {
          lines.push(word.slice(i, i + maxCharsPerLine));
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }
    }

    return lines.length > 0 ? lines : [''];
  }

  private getIntrinsicComponentHeight(node: IRNode, availableWidth?: number): number {
    if (node.kind !== 'component') return this.getComponentHeight();

    // Image: calculate height based on aspect ratio and available width
    if (node.componentType === 'Image') {
      const placeholder = String(node.props.placeholder || 'landscape');
      const aspectRatios: Record<string, number> = {
        landscape: 16 / 9,
        portrait: 2 / 3,
        square: 1,
        icon: 1,
        avatar: 1,
      };
      
      const ratio = aspectRatios[placeholder] || 16 / 9;
      
      // If explicit height is set, use it
      const explicitHeight = Number(node.props.height);
      if (!isNaN(explicitHeight) && explicitHeight > 0) {
        return explicitHeight;
      }
      
      // If available width is provided, calculate responsive height
      if (availableWidth && availableWidth > 0) {
        return availableWidth / ratio;
      }
      
      // Fallback: use default 200px
      return 200;
    }

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

    if (node.componentType === 'Heading') {
      const text = String(node.props.text || 'Heading');
      const { fontSize, lineHeight } = this.getHeadingMetricsForDensity();
      const lineHeightPx = Math.ceil(fontSize * lineHeight);
      const maxWidth = availableWidth && availableWidth > 0 ? availableWidth : 200;
      const lines = this.wrapTextToLines(text, maxWidth, fontSize);
      const wrappedHeight = Math.max(1, lines.length) * lineHeightPx;
      return Math.max(this.getComponentHeight(), wrappedHeight);
    }

    if (node.componentType === 'Text') {
      const content = String(node.props.content || '');
      const { fontSize, lineHeight } = this.getTextMetricsForDensity();
      const lineHeightPx = Math.ceil(fontSize * lineHeight);
      const maxWidth = availableWidth && availableWidth > 0 ? availableWidth : 200;
      const lines = this.wrapTextToLines(content, maxWidth, fontSize);
      const wrappedHeight = Math.max(1, lines.length) * lineHeightPx;
      return Math.max(this.getComponentHeight(), wrappedHeight);
    }

    if (node.componentType === 'Alert') {
      const title = String(node.props.title || '');
      const text = String(node.props.text || 'Alert message');
      const fontSize = 13;
      const titleLineHeightPx = Math.ceil(fontSize * 1.25);
      const textLineHeightPx = Math.ceil(fontSize * 1.4);
      const maxWidth = Math.max(40, (availableWidth && availableWidth > 0 ? availableWidth : 280) - 24);

      const titleLines = title.trim().length > 0
        ? this.wrapTextToLines(title, maxWidth, fontSize)
        : [];
      const textLines = this.wrapTextToLines(text, maxWidth, fontSize);

      const topPadding = 12;
      const bottomPadding = 12;
      const titleGap = titleLines.length > 0 ? 6 : 0;
      const wrappedHeight =
        topPadding +
        titleLines.length * titleLineHeightPx +
        titleGap +
        Math.max(1, textLines.length) * textLineHeightPx +
        bottomPadding;

      return Math.max(this.getComponentHeight(), wrappedHeight);
    }

    if (node.componentType === 'SidebarMenu') {
      const itemsStr = String(node.props.items || 'Item 1,Item 2,Item 3');
      const items = itemsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const itemCount = items.length > 0 ? items.length : 3;
      const itemHeight = 40;
      return Math.max(this.getComponentHeight(), itemCount * itemHeight);
    }

    // Taller components
    if (node.componentType === 'Textarea') return 100;
    if (node.componentType === 'Modal') return 300;
    if (node.componentType === 'Card') return 120;
    if (node.componentType === 'StatCard') return 120;
    if (node.componentType === 'ChartPlaceholder') return 250;
    if (node.componentType === 'List') return 180;

    // Standard height components
    if (node.componentType === 'Topbar') return 56;
    if (node.componentType === 'Divider') return 1;
    if (node.componentType === 'Separate') return this.getSeparateSize(node);

    // Default height
    return this.getComponentHeight();
  }

  private getIntrinsicComponentWidth(node: IRNode | undefined): number {
    if (!node || node.kind !== 'component') {
      // Default width for containers or undefined nodes
      return 120;
    }

    // Icon: small fixed width
    if (node.componentType === 'Icon') {
      const size = String(node.props.size || 'md');
      return resolveIconSize(size, (this.style.density || 'normal') as DensityLevel);
    }

    // IconButton: size + padding
    if (node.componentType === 'IconButton') {
      const size = String(node.props.size || 'md');
      return resolveIconButtonSize(size, (this.style.density || 'normal') as DensityLevel);
    }

    // Checkbox, Radio: fixed width
    if (node.componentType === 'Checkbox' || node.componentType === 'Radio') {
      return 24;
    }

    // Separate: fixed spacer width (useful in horizontal stacks)
    if (node.componentType === 'Separate') return this.getSeparateSize(node);

    // Button, Link: text width + padding (estimate)
    if (node.componentType === 'Button' || node.componentType === 'Link') {
      const text = String(node.props.text || '');
      return Math.max(80, text.length * 8 + 32); // ~8px per char + 32px padding
    }

    // Label, Text: content-based width (estimate)
    if (node.componentType === 'Label' || node.componentType === 'Text') {
      const text = String(node.props.content || node.props.text || '');
      return Math.max(60, text.length * 8 + 16);
    }

    // Heading: content-based width
    if (node.componentType === 'Heading') {
      const text = String(node.props.text || '');
      return Math.max(80, text.length * 12 + 16);
    }

    // Input, Select, Textarea: standard widths
    if (node.componentType === 'Input' || node.componentType === 'Select') {
      return 200;
    }

    if (node.componentType === 'Textarea') {
      return 200;
    }

    // Image: responsive, use aspect ratio
    if (node.componentType === 'Image') {
      const placeholder = String(node.props.placeholder || 'landscape');
      const widths: Record<string, number> = {
        landscape: 300,
        portrait: 200,
        square: 200,
        icon: 64,
        avatar: 64,
      };
      return widths[placeholder] || 300;
    }

    // Table: wide by default
    if (node.componentType === 'Table') {
      return 400;
    }

    // StatCard, Card: fixed width
    if (node.componentType === 'StatCard' || node.componentType === 'Card') {
      return 280;
    }

    // SidebarMenu: fixed width
    if (node.componentType === 'SidebarMenu') {
      return 260;
    }

    // Badge, Chip: small fixed width
    if (node.componentType === 'Badge' || node.componentType === 'Chip') {
      const text = String(node.props.text || '');
      return Math.max(50, text.length * 7 + 16);
    }

    // Default width: 120px
    return 120;
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
  private adjustNodeYPositions(nodeId: string, deltaY: number): void {
    const node = this.nodes[nodeId];
    if (!node) return;

    // If this is a container, adjust all its children's Y positions
    if (node.kind === 'container' && node.children) {
      node.children.forEach((childRef) => {
        const childPos = this.result[childRef.ref];
        if (childPos) {
          childPos.y += deltaY;
          // Recursively adjust descendants
          this.adjustNodeYPositions(childRef.ref, deltaY);
        }
      });
    }
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
