import type { IRContract, IRNode, IRComponentNode, IRContainerNode } from '../ir/index';
import type { LayoutResult } from '../layout/index';
import { MockDataGenerator } from './mock-data';
import { ColorResolver } from './colors';
import { getIcon } from './icons/iconLibrary';
import { resolveTokens, type DesignTokens } from './tokens';

/**
 * SVG Renderer
 *
 * Generates accessible, optimized SVG output from IR + Layout
 */

// ============================================================================
// TYPES
// ============================================================================

export interface SVGRenderOptions {
  width?: number;
  height?: number;
  theme?: 'light' | 'dark';
  includeLabels?: boolean;
  screenName?: string; // Select specific screen by name
}

export interface SVGComponent {
  tag: string;
  attrs: Record<string, string | number>;
  children?: SVGComponent[];
  text?: string;
}

// ============================================================================
// THEME COLORS
// ============================================================================

const THEMES = {
  light: {
    bg: '#F8FAFC',
    cardBg: '#FFFFFF',
    border: '#E2E8F0',
    text: '#1E293B',
    textMuted: '#64748B',
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    primaryLight: '#EFF6FF',
  },
  dark: {
    bg: '#0F172A',
    cardBg: '#1E293B',
    border: '#334155',
    text: '#F1F5F9',
    textMuted: '#94A3B8',
    primary: '#60A5FA',
    primaryHover: '#3B82F6',
    primaryLight: '#1E3A8A',
  },
};

// ============================================================================
// SVG RENDERER CLASS
// ============================================================================

export class SVGRenderer {
  private ir: IRContract;
  private layout: LayoutResult;
  protected options: Required<Omit<SVGRenderOptions, 'screenName'>> & { screenName?: string };
  protected renderTheme: typeof THEMES.light;
  protected tokens: DesignTokens;
  private selectedScreenName?: string;
  protected renderedNodeIds: Set<string> = new Set(); // Track nodes rendered in current pass
  protected colorResolver: ColorResolver;
  protected fontFamily: string = 'system-ui, -apple-system, sans-serif';

  constructor(ir: IRContract, layout: LayoutResult, options?: SVGRenderOptions) {
    this.ir = ir;
    this.layout = layout;
    this.selectedScreenName = options?.screenName;

    // Resolve color scheme with priority: options.theme > style.theme > 'light'
    const colorScheme = options?.theme || ir.project.style.theme || 'light';

    // Resolve design tokens based on style (density-aware)
    this.tokens = resolveTokens(ir.project.style);

    this.options = {
      width: options?.width || 1280,
      height: options?.height || 720,
      theme: colorScheme as 'light' | 'dark',
      includeLabels: options?.includeLabels ?? true,
      screenName: options?.screenName,
    };
    this.renderTheme = THEMES[this.options.theme];
    this.colorResolver = new ColorResolver();

    // Initialize MockDataGenerator with custom mocks from project metadata
    if (ir.project.mocks && Object.keys(ir.project.mocks).length > 0) {
      MockDataGenerator.setCustomMocks(ir.project.mocks);
    }

    // Initialize ColorResolver with project colors
    if (ir.project.colors && Object.keys(ir.project.colors).length > 0) {
      this.colorResolver.setCustomColors(ir.project.colors);
    }
  }

  /**
   * Get list of available screens in the project
   */
  getAvailableScreens(): Array<{ name: string; id: string }> {
    return this.ir.project.screens.map((screen) => ({
      name: screen.name,
      id: screen.id,
    }));
  }

  /**
   * Get the currently selected or first screen
   */
  protected getSelectedScreen(): { screen: any; name: string } {
    let screen = this.ir.project.screens[0];
    let screenName = screen?.name || 'Unknown';

    if (this.selectedScreenName) {
      const found = this.ir.project.screens.find(
        (s) => s.name.toLowerCase() === this.selectedScreenName!.toLowerCase()
      );
      if (found) {
        screen = found;
        screenName = found.name;
      }
    }

    return { screen, name: screenName };
  }

  render(): string {
    const { screen } = this.getSelectedScreen();
    if (!screen) return '<svg></svg>';

    const rootId = screen.root.ref;
    const children: string[] = [];

    // Reset rendered nodes tracking for this pass
    this.renderedNodeIds.clear();

    // Render root and all children
    this.renderNode(rootId, children);

    // Calculate actual content height (using only rendered nodes)
    const actualHeight = this.calculateContentHeight();

    // Build SVG with auto-calculated height
    const svgHeight = Math.max(this.options.height, actualHeight);

    // Resolve screen background color
    let backgroundColor = this.renderTheme.bg;
    if (screen.background) {
      backgroundColor = this.colorResolver.resolveColor(screen.background, this.renderTheme.bg);
    }

    return `<svg width="${this.options.width}" height="${svgHeight}" viewBox="0 0 ${this.options.width} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
  ${children.join('\n  ')}
</svg>`;
  }

  protected calculateContentHeight(): number {
    let maxY = 0;

    // Find the lowest y position + height (only for rendered nodes)
    for (const nodeId of this.renderedNodeIds) {
      const pos = this.layout[nodeId];
      if (pos) {
        const bottom = pos.y + pos.height;
        if (bottom > maxY) {
          maxY = bottom;
        }
      }
    }

    return Math.max(maxY + 40, this.options.height); // Add 40px padding at bottom
  }

  protected renderNode(nodeId: string, output: string[]): void {
    const node = this.ir.project.nodes[nodeId];
    const pos = this.layout[nodeId];

    if (!node || !pos) return;

    // Track this node as rendered (only valid nodes)
    this.renderedNodeIds.add(nodeId);

    if (node.kind === 'container') {
      // Wrapper group for all containers (enables selection in editor)
      const containerGroup: string[] = [];
      const hasNodeId = node.meta?.nodeId;
      
      if (hasNodeId) {
        containerGroup.push(`<g${this.getDataNodeId(node)}>`);
      }

      // Add invisible clickable rect for layouts (excluding panel/card which have visible borders)
      const needsClickableArea = hasNodeId && 
        node.containerType !== 'panel' && 
        node.containerType !== 'card';
      
      if (needsClickableArea) {
        // Transparent rectangle for click detection in editor
        containerGroup.push(
          `<rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}" ` +
          `fill="transparent" stroke="none" pointer-events="all"/>`
        );
      }

      // Special handling for panel and card: render border
      if (node.containerType === 'panel') {
        this.renderPanelBorder(node, pos, containerGroup);
      }
      if (node.containerType === 'card') {
        this.renderCardBorder(node, pos, containerGroup);
      }

      // Render container children
      node.children.forEach((childRef) => {
        this.renderNode(childRef.ref, containerGroup);
      });

      // Close wrapper group
      if (hasNodeId) {
        containerGroup.push('</g>');
      }

      // Add container output to main output
      output.push(...containerGroup);
    } else if (node.kind === 'component') {
      // Render component
      const componentSvg = this.renderComponent(node, pos);
      if (componentSvg) {
        output.push(componentSvg);
      }
    }
  }

  protected renderComponent(
    node: IRComponentNode,
    pos: { x: number; y: number; width: number; height: number }
  ): string {
    switch (node.componentType) {
      // Existing components
      case 'Heading':
        return this.renderHeading(node, pos);
      case 'Button':
        return this.renderButton(node, pos);
      case 'Input':
        return this.renderInput(node, pos);
      case 'Topbar':
        return this.renderTopbar(node, pos);
      case 'Table':
        return this.renderTable(node, pos);
      case 'ChartPlaceholder':
        return this.renderChartPlaceholder(node, pos);
      case 'Breadcrumbs':
        return this.renderBreadcrumbs(node, pos);
      case 'SidebarMenu':
        return this.renderSidebarMenu(node, pos);

      // Text/Content components
      case 'Text':
        return this.renderText(node, pos);
      case 'Label':
        return this.renderLabel(node, pos);
      case 'Code':
        return this.renderCode(node, pos);

      // Form components
      case 'Textarea':
        return this.renderTextarea(node, pos);
      case 'Select':
        return this.renderSelect(node, pos);
      case 'Checkbox':
        return this.renderCheckbox(node, pos);
      case 'Radio':
        return this.renderRadio(node, pos);
      case 'Toggle':
        return this.renderToggle(node, pos);

      // Layout/Structure components
      case 'Sidebar':
        return this.renderSidebar(node, pos);
      case 'Tabs':
        return this.renderTabs(node, pos);
      case 'Divider':
        return this.renderDivider(node, pos);

      // Feedback/Alert components
      case 'Alert':
        return this.renderAlert(node, pos);
      case 'Badge':
        return this.renderBadge(node, pos);
      case 'Modal':
        return this.renderModal(node, pos);
      case 'List':
        return this.renderList(node, pos);
      case 'StatCard':
        return this.renderStatCard(node, pos);
      case 'Image':
        return this.renderImage(node, pos);

      // Icon components
      case 'Icon':
        return this.renderIcon(node, pos);
      case 'IconButton':
        return this.renderIconButton(node, pos);

      default:
        return this.renderGenericComponent(node, pos);
    }
  }

  protected renderHeading(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || 'Heading');

    // Use tokens from density configuration
    const fontSize = this.tokens.heading.fontSize;
    const fontWeight = this.tokens.heading.fontWeight;
    const lineHeightPx = Math.ceil(fontSize * 1.25);
    const lines = this.wrapTextToLines(text, pos.width, fontSize);

    if (lines.length <= 1) {
      return `<g${this.getDataNodeId(node)}>
    <text x="${pos.x}" y="${pos.y + pos.height / 2 + 6}"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="${fontSize}"
          font-weight="${fontWeight}"
          fill="${this.renderTheme.text}">${this.escapeXml(text)}</text>
  </g>`;
    }

    const firstLineY = pos.y + fontSize;
    const tspans = lines
      .map(
        (line, index) =>
          `<tspan x="${pos.x}" dy="${index === 0 ? 0 : lineHeightPx}">${this.escapeXml(line)}</tspan>`
      )
      .join('');

    return `<g${this.getDataNodeId(node)}>
    <text x="${pos.x}" y="${firstLineY}"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="${fontSize}"
          font-weight="${fontWeight}"
          fill="${this.renderTheme.text}">${tspans}</text>
  </g>`;
  }

  protected renderButton(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || 'Button');
    const variant = String(node.props.variant || 'default');

    // Use tokens from density configuration
    const radius = this.tokens.button.radius;
    const fontSize = this.tokens.button.fontSize;
    const fontWeight = this.tokens.button.fontWeight;
    const paddingX = this.tokens.button.paddingX;
    const paddingY = this.tokens.button.paddingY;

    // Calculate button dimensions based on text + padding
    const textWidth = text.length * fontSize * 0.6;  // Approximate character width
    const buttonWidth = Math.max(textWidth + paddingX * 2, 60);
    const buttonHeight = fontSize + paddingY * 2;

    // Color configuration
    const bgColor = variant === 'primary' ? 'rgba(59, 130, 246, 0.85)' : 'rgba(226, 232, 240, 0.9)';
    const textColor = variant === 'primary' ? '#FFFFFF' : 'rgba(30, 41, 59, 0.85)';
    const borderColor = variant === 'primary' ? 'rgba(59, 130, 246, 0.7)' : 'rgba(100, 116, 139, 0.4)';

    return `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${pos.y}"
          width="${buttonWidth}" height="${buttonHeight}"
          rx="${radius}"
          fill="${bgColor}"
          stroke="${borderColor}"
          stroke-width="1"/>
    <text x="${pos.x + buttonWidth / 2}" y="${pos.y + buttonHeight / 2 + fontSize * 0.35}"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="${fontSize}"
          font-weight="${fontWeight}"
          fill="${textColor}"
          text-anchor="middle">${this.escapeXml(text)}</text>
  </g>`;
  }

  protected renderInput(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || '');
    const placeholder = String(node.props.placeholder || '');

    // Use tokens from density configuration
    const radius = this.tokens.input.radius;
    const fontSize = this.tokens.input.fontSize;
    const paddingX = this.tokens.input.paddingX;

    return `<g${this.getDataNodeId(node)}>
    ${
      label
        ? `<text x="${pos.x + paddingX}" y="${pos.y - 6}"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="12"
          fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>`
        : ''
    }
    <rect x="${pos.x}" y="${pos.y}"
          width="${pos.width}" height="${pos.height}"
          rx="${radius}"
          fill="${this.renderTheme.cardBg}"
          stroke="${this.renderTheme.border}"
          stroke-width="1"/>
    <text x="${pos.x + paddingX}" y="${pos.y + pos.height / 2 + 5}"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="${fontSize}"
          fill="${this.renderTheme.textMuted}">${this.escapeXml(placeholder)}</text>
  </g>`;
  }

  protected renderTopbar(node: IRComponentNode, pos: any): string {
    const title = String(node.props.title || 'App');
    const subtitle = String(node.props.subtitle || '');
    const actions = String(node.props.actions || '');
    const user = String(node.props.user || '');

    // Calculate title position: center vertically or padded with subtitle
    const titleLineHeight = 18;
    const paddingTop = 24; // adjusted top padding

    let titleY: number;
    let subtitleY: number = 0; // Initialize to avoid usage before assignment

    if (subtitle) {
      // Title near top with fixed padding; subtitle below with comfortable gap
      titleY = pos.y + paddingTop;
      subtitleY = titleY + 20; // gap between title baseline and subtitle baseline
    } else {
      // Center title vertically when no subtitle
      titleY = pos.y + pos.height / 2 + titleLineHeight / 2 - 4; // centered with slight upward shift
    }

    let svg = `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          fill="${this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
    
    <!-- Title -->
    <text x="${pos.x + 16}" y="${titleY}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="18" 
          font-weight="600" 
          fill="${this.renderTheme.text}">${this.escapeXml(title)}</text>`;

    // Subtitle
    if (subtitle) {
      svg += `
    <text x="${pos.x + 16}" y="${subtitleY}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="13" 
          fill="${this.renderTheme.textMuted}">${this.escapeXml(subtitle)}</text>`;
    }

    // User badge (top-right, above actions)
    if (user) {
      const badgeHeight = 28;
      const badgePaddingX = 12;
      const badgeX = pos.x + pos.width - 16 - badgePaddingX * 2 - user.length * 7.5;
      const badgeY = pos.y + 12;

      svg += `
    <!-- User badge -->
    <rect x="${badgeX}" y="${badgeY}" 
          width="${badgePaddingX * 2 + user.length * 7.5}" height="${badgeHeight}" 
          rx="4" 
          fill="${this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
    <text x="${badgeX + badgePaddingX + user.length * 3.75}" y="${badgeY + badgeHeight / 2 + 4}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="12" 
          fill="${this.renderTheme.text}" 
          text-anchor="middle">${this.escapeXml(user)}</text>`;
    }

    // Actions (as buttons on the right)
    if (actions) {
      const actionList = actions
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);
      const buttonWidth = 100;
      const buttonHeight = 32;
      const buttonStartX = pos.x + pos.width - 16 - actionList.length * (buttonWidth + 8);
      const buttonY = pos.y + (pos.height - buttonHeight) / 2;

      actionList.forEach((action, idx) => {
        const bx = buttonStartX + idx * (buttonWidth + 8);
        svg += `
    <!-- Action button: ${action} -->
    <rect x="${bx}" y="${buttonY}" 
          width="${buttonWidth}" height="${buttonHeight}" 
          rx="6" 
          fill="${this.renderTheme.primary}" 
          stroke="none"/>
    <text x="${bx + buttonWidth / 2}" y="${buttonY + buttonHeight / 2 + 4}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="12" 
          font-weight="600" 
          fill="white" 
          text-anchor="middle">${this.escapeXml(action)}</text>`;
      });
    }

    svg += '\n  </g>';
    return svg;
  }

  protected renderPanelBorder(node: IRNode, pos: any, output: string[]): void {
    if (node.kind !== 'container') return;

    // Resolve background color, defaulting to cardBg (white in light theme)
    let fillColor = this.renderTheme.cardBg;
    if (node.style.background) {
      fillColor = this.colorResolver.resolveColor(node.style.background, this.renderTheme.cardBg);
    }

    // Render panel border as a rectangle with fill and stroke
    const svg = `<g>
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          rx="8" 
          fill="${fillColor}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
    </g>`;
    output.push(svg);
  }

  protected renderCardBorder(node: IRNode, pos: any, output: string[]): void {
    if (node.kind !== 'container') return;

    // Use tokens from density configuration, but allow override from params
    const radiusMap: Record<string, number> = {
      none: 0,
      sm: 4,
      md: this.tokens.card.radius,
      lg: 12,
    };
    const radius = radiusMap[String(node.params.radius) || 'md'] || this.tokens.card.radius;

    // Resolve background color
    let fillColor = this.renderTheme.cardBg;
    if (node.style.background) {
      fillColor = this.colorResolver.resolveColor(node.style.background, this.renderTheme.cardBg);
    }

    // Check if border is disabled (default true)
    const borderParam = String(node.params.border || 'true');
    const showBorder = borderParam !== 'false';
    const strokeWidth = showBorder ? this.tokens.card.strokeWidth : 0;

    // Render card border as a rectangle with padding, gap support
    const svg = `<g>
    <rect x="${pos.x}" y="${pos.y}"
          width="${pos.width}" height="${pos.height}"
          rx="${radius}"
          fill="${fillColor}"
          stroke="${this.renderTheme.border}"
          stroke-width="${strokeWidth}"/>
    </g>`;
    output.push(svg);
  }

  protected renderTable(node: IRComponentNode, pos: any): string {
    const title = String(node.props.title || '');
    const columnsStr = String(node.props.columns || 'Col1,Col2,Col3');
    const columns = columnsStr.split(',').map((c) => c.trim());
    const rowCount = Number(node.props.rows || 5);
    const mockStr = String(node.props.mock || '');
    const paginationValue = String(node.props.pagination || 'false');
    const pagination = paginationValue === 'true';
    const pageCount = Number(node.props.pages || 5);
    const paginationAlign = String(node.props.paginationAlign || 'right'); // left, center, right

    // Parse mock types, default to "item" if not specified
    const mockTypes = mockStr ? mockStr.split(',').map((m) => m.trim()) : columns.map(() => 'item');

    // Ensure we have a mock type for each column (pad with 'item' if needed)
    while (mockTypes.length < columns.length) {
      mockTypes.push('item');
    }

    const headerHeight = 44;
    const rowHeight = 36;
    const colWidth = pos.width / columns.length;

    // Generate mock rows based on mock types
    const mockRows: Record<string, string>[] = [];
    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
      const row: Record<string, string> = {};
      columns.forEach((col, colIdx) => {
        const mockType = mockTypes[colIdx] || 'item';
        row[col] = MockDataGenerator.getMockValue(mockType, rowIdx);
      });
      mockRows.push(row);
    }

    let svg = `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          rx="8" 
          fill="${this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>`;

    // Title
    if (title) {
      svg += `
    <text x="${pos.x + 16}" y="${pos.y + 24}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="13" 
          font-weight="600" 
          fill="${this.renderTheme.text}">${this.escapeXml(title)}</text>`;
    }

    // Header row
    const headerY = pos.y + (title ? 32 : 0);
    svg += `
    <line x1="${pos.x}" y1="${headerY + headerHeight}" x2="${pos.x + pos.width}" y2="${headerY + headerHeight}" 
          stroke="${this.renderTheme.border}" stroke-width="1"/>`;

    columns.forEach((col, i) => {
      svg += `
    <text x="${pos.x + i * colWidth + 12}" y="${headerY + 26}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="11" 
          font-weight="600" 
          fill="${this.renderTheme.textMuted}">${this.escapeXml(col)}</text>`;
    });

    // Data rows (render all, don't restrict by height)
    mockRows.forEach((row, rowIdx) => {
      const rowY = headerY + headerHeight + rowIdx * rowHeight;

      // Row separator
      svg += `
    <line x1="${pos.x}" y1="${rowY + rowHeight}" x2="${pos.x + pos.width}" y2="${rowY + rowHeight}" 
          stroke="${this.renderTheme.border}" stroke-width="0.5"/>`;

      // Row data
      columns.forEach((col, colIdx) => {
        const cellValue = row[col] || '';
        svg += `
    <text x="${pos.x + colIdx * colWidth + 12}" y="${rowY + 22}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="12" 
          fill="${this.renderTheme.text}">${this.escapeXml(cellValue)}</text>`;
      });
    });

    // Render pagination if enabled
    if (pagination) {
      const paginationY = headerY + headerHeight + mockRows.length * rowHeight + 16;
      const buttonWidth = 40;
      const buttonHeight = 32;
      const gap = 8;
      const totalWidth = (pageCount + 2) * (buttonWidth + gap) - gap; // +2 for prev/next buttons

      // Calculate startX based on alignment
      let startX: number;
      if (paginationAlign === 'left') {
        startX = pos.x + 16;
      } else if (paginationAlign === 'center') {
        startX = pos.x + (pos.width - totalWidth) / 2;
      } else {
        // right (default)
        startX = pos.x + pos.width - totalWidth - 16;
      }

      // Previous button
      svg += `
    <rect x="${startX}" y="${paginationY}" 
          width="${buttonWidth}" height="${buttonHeight}" 
          rx="4" 
          fill="${this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
    <text x="${startX + buttonWidth / 2}" y="${paginationY + buttonHeight / 2 + 4}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="14" 
          fill="${this.renderTheme.text}" 
          text-anchor="middle">&lt;</text>`;

      // Page number buttons
      for (let i = 1; i <= pageCount; i++) {
        const btnX = startX + (buttonWidth + gap) * i;
        const isActive = i === 1; // First page is active by default
        const bgColor = isActive ? this.renderTheme.primary : this.renderTheme.cardBg;
        const textColor = isActive ? '#FFFFFF' : this.renderTheme.text;

        svg += `
    <rect x="${btnX}" y="${paginationY}" 
          width="${buttonWidth}" height="${buttonHeight}" 
          rx="4" 
          fill="${bgColor}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
    <text x="${btnX + buttonWidth / 2}" y="${paginationY + buttonHeight / 2 + 4}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="14" 
          fill="${textColor}" 
          text-anchor="middle">${i}</text>`;
      }

      // Next button
      const nextX = startX + (buttonWidth + gap) * (pageCount + 1);
      svg += `
    <rect x="${nextX}" y="${paginationY}" 
          width="${buttonWidth}" height="${buttonHeight}" 
          rx="4" 
          fill="${this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
    <text x="${nextX + buttonWidth / 2}" y="${paginationY + buttonHeight / 2 + 4}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="14" 
          fill="${this.renderTheme.text}" 
          text-anchor="middle">&gt;</text>`;
    }

    svg += '\n  </g>';
    return svg;
  }

  protected renderChartPlaceholder(node: IRComponentNode, pos: any): string {
    const type = String(node.props.type || 'bar');

    return `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          rx="8" 
          fill="${this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
    <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="14" 
          fill="${this.renderTheme.textMuted}" 
          text-anchor="middle">[${this.escapeXml(type.toUpperCase())} CHART]</text>
  </g>`;
  }

  // ============================================================================
  // TEXT/CONTENT COMPONENTS
  // ============================================================================

  protected renderText(node: IRComponentNode, pos: any): string {
    const text = String(node.props.content || 'Text content');

    // Use tokens from density configuration
    const fontSize = this.tokens.text.fontSize;
    const lineHeightPx = Math.ceil(fontSize * this.tokens.text.lineHeight);
    const lines = this.wrapTextToLines(text, pos.width, fontSize);
    const firstLineY = pos.y + fontSize;
    const tspans = lines
      .map(
        (line, index) =>
          `<tspan x="${pos.x}" dy="${index === 0 ? 0 : lineHeightPx}">${this.escapeXml(line)}</tspan>`
      )
      .join('');

    return `<g${this.getDataNodeId(node)}>
    <text x="${pos.x}" y="${firstLineY}"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="${fontSize}"
          fill="${this.renderTheme.text}">${tspans}</text>
  </g>`;
  }

  protected renderLabel(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || 'Label');

    return `<g${this.getDataNodeId(node)}>
    <text x="${pos.x}" y="${pos.y + 12}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="12" 
          fill="${this.renderTheme.textMuted}">${this.escapeXml(text)}</text>
  </g>`;
  }

  protected renderCode(node: IRComponentNode, pos: any): string {
    const code = String(node.props.code || 'const x = 42;');

    return `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          rx="4" 
          fill="${this.renderTheme.bg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
    <text x="${pos.x + 8}" y="${pos.y + 18}" 
          font-family="monospace" 
          font-size="11" 
          fill="${this.renderTheme.text}">${this.escapeXml(code.substring(0, 30))}</text>
  </g>`;
  }

  // ============================================================================
  // FORM COMPONENTS
  // ============================================================================

  protected renderTextarea(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || '');
    const placeholder = String(node.props.placeholder || 'Enter text...');

    return `<g${this.getDataNodeId(node)}>
    ${
      label
        ? `<text x="${pos.x}" y="${pos.y - 6}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="12" 
          fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>`
        : ''
    }
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          rx="6" 
          fill="${this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
    <text x="${pos.x + 12}" y="${pos.y + 20}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="13" 
          fill="${this.renderTheme.textMuted}">${this.escapeXml(placeholder)}</text>
  </g>`;
  }

  protected renderSelect(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || '');
    const placeholder = String(node.props.placeholder || 'Select...');

    return `<g${this.getDataNodeId(node)}>
    ${
      label
        ? `<text x="${pos.x}" y="${pos.y - 6}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="12" 
          fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>`
        : ''
    }
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          rx="6" 
          fill="${this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
    <text x="${pos.x + 12}" y="${pos.y + pos.height / 2 + 5}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="14" 
          fill="${this.renderTheme.textMuted}">${this.escapeXml(placeholder)}</text>
    <text x="${pos.x + pos.width - 20}" y="${pos.y + pos.height / 2 + 5}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="16" 
          fill="${this.renderTheme.textMuted}">▼</text>
  </g>`;
  }

  protected renderCheckbox(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || 'Checkbox');
    const checked = String(node.props.checked || 'false').toLowerCase() === 'true';

    const checkboxSize = 18;
    const checkboxY = pos.y + pos.height / 2 - checkboxSize / 2;

    return `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${checkboxY}" 
          width="${checkboxSize}" height="${checkboxSize}" 
          rx="4" 
          fill="${checked ? this.renderTheme.primary : this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
    ${
      checked
        ? `<text x="${pos.x + checkboxSize / 2}" y="${checkboxY + 14}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="12" 
          fill="white" 
          text-anchor="middle">✓</text>`
        : ''
    }
    <text x="${pos.x + checkboxSize + 12}" y="${pos.y + pos.height / 2 + 5}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="14" 
          fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>
  </g>`;
  }

  protected renderRadio(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || 'Radio');
    const checked = String(node.props.checked || 'false').toLowerCase() === 'true';

    const radioSize = 16;
    const radioY = pos.y + pos.height / 2 - radioSize / 2;

    return `<g${this.getDataNodeId(node)}>
    <circle cx="${pos.x + radioSize / 2}" cy="${radioY + radioSize / 2}" 
            r="${radioSize / 2}" 
            fill="${this.renderTheme.cardBg}" 
            stroke="${this.renderTheme.border}" 
            stroke-width="1"/>
    ${
      checked
        ? `<circle cx="${pos.x + radioSize / 2}" cy="${radioY + radioSize / 2}" 
            r="${radioSize / 3.5}" 
            fill="${this.renderTheme.primary}"/>`
        : ''
    }
    <text x="${pos.x + radioSize + 12}" y="${pos.y + pos.height / 2 + 5}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="14" 
          fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>
  </g>`;
  }

  protected renderToggle(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || 'Toggle');
    const enabled = String(node.props.enabled || 'false').toLowerCase() === 'true';

    const toggleWidth = 40;
    const toggleHeight = 20;
    const toggleY = pos.y + pos.height / 2 - toggleHeight / 2;

    return `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${toggleY}" 
          width="${toggleWidth}" height="${toggleHeight}" 
          rx="10" 
          fill="${enabled ? this.renderTheme.primary : this.renderTheme.border}" 
          stroke="none"/>
    <circle cx="${pos.x + (enabled ? toggleWidth - 10 : 10)}" cy="${toggleY + toggleHeight / 2}" 
            r="8" 
            fill="white"/>
    <text x="${pos.x + toggleWidth + 12}" y="${pos.y + pos.height / 2 + 5}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="14" 
          fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>
  </g>`;
  }

  // ============================================================================
  // LAYOUT/STRUCTURE COMPONENTS
  // ============================================================================

  protected renderSidebar(node: IRComponentNode, pos: any): string {
    const title = String(node.props.title || 'Sidebar');
    const itemsStr = String(node.props.items || '');
    const activeItem = String(node.props.active || '');

    let items: string[] = [];
    if (itemsStr) {
      items = itemsStr.split(',').map((i) => i.trim());
    } else {
      // Generate mock items
      const itemCount = Number(node.props.itemsMock || 6);
      items = MockDataGenerator.generateMockList('name', itemCount);
    }

    const itemHeight = 40;
    const padding = 16;
    const titleHeight = 40;

    let svg = `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          fill="${this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
    <!-- Title -->
    <text x="${pos.x + padding}" y="${pos.y + padding + 8}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="14" 
          font-weight="600" 
          fill="${this.renderTheme.text}">${this.escapeXml(title)}</text>
    <line x1="${pos.x}" y1="${pos.y + titleHeight}" x2="${pos.x + pos.width}" y2="${pos.y + titleHeight}" 
          stroke="${this.renderTheme.border}" stroke-width="1"/>`;

    // Render items (without height restriction, allow overflow)
    items.forEach((item, i) => {
      const itemY = pos.y + titleHeight + padding + i * itemHeight;
      const isActive = item === activeItem;

      svg += `
    <rect x="${pos.x + 8}" y="${itemY}" 
          width="${pos.width - 16}" height="36" 
          rx="4" 
          fill="${isActive ? this.renderTheme.primary : 'transparent'}" 
          stroke="none"/>
    <text x="${pos.x + 16}" y="${itemY + 22}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="13" 
          fill="${isActive ? 'white' : this.renderTheme.textMuted}">${this.escapeXml(item)}</text>`;
    });

    svg += '\n  </g>';
    return svg;
  }

  protected renderTabs(node: IRComponentNode, pos: any): string {
    // Read items prop instead of tabs, or fall back to empty
    const itemsStr = String(node.props.items || '');
    const tabs = itemsStr ? itemsStr.split(',').map((t) => t.trim()) : ['Tab 1', 'Tab 2', 'Tab 3'];
    const tabWidth = pos.width / tabs.length;

    let svg = `<g${this.getDataNodeId(node)}>
    <!-- Tab headers -->`;

    tabs.forEach((tab, i) => {
      const tabX = pos.x + i * tabWidth;
      const isActive = i === 0;

      svg += `
    <rect x="${tabX}" y="${pos.y}" 
          width="${tabWidth}" height="44" 
          fill="${isActive ? this.renderTheme.primary : 'transparent'}" 
          stroke="${isActive ? 'none' : this.renderTheme.border}" 
          stroke-width="1"/>
    <text x="${tabX + tabWidth / 2}" y="${pos.y + 28}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="13" 
          font-weight="${isActive ? '600' : '500'}" 
          fill="${isActive ? 'white' : this.renderTheme.text}" 
          text-anchor="middle">${this.escapeXml(tab)}</text>`;
    });

    svg += `
    <!-- Tab content area -->
    <rect x="${pos.x}" y="${pos.y + 44}" 
          width="${pos.width}" height="${pos.height - 44}" 
          fill="${this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
  </g>`;
    return svg;
  }

  protected renderDivider(node: IRComponentNode, pos: any): string {
    return `<g${this.getDataNodeId(node)}>
    <line x1="${pos.x}" y1="${pos.y + pos.height / 2}" 
          x2="${pos.x + pos.width}" y2="${pos.y + pos.height / 2}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
  </g>`;
  }

  // ============================================================================
  // FEEDBACK/ALERT COMPONENTS
  // ============================================================================

  protected renderAlert(node: IRComponentNode, pos: any): string {
    const type = String(node.props.type || 'info');
    const message = String(node.props.message || 'Alert message');

    const typeColors: Record<string, string> = {
      info: '#3B82F6',
      warning: '#F59E0B',
      error: '#EF4444',
      success: '#10B981',
    };

    const bgColor = typeColors[type] || typeColors.info;

    return `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          rx="6" 
          fill="${bgColor}15" 
          stroke="${bgColor}" 
          stroke-width="1"/>
    <rect x="${pos.x}" y="${pos.y}" 
          width="4" height="${pos.height}" 
          rx="6" 
          fill="${bgColor}"/>
    <text x="${pos.x + 16}" y="${pos.y + pos.height / 2 + 5}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="13" 
          fill="${bgColor}">${this.escapeXml(message)}</text>
  </g>`;
  }

  protected renderBadge(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || 'Badge');
    const variant = String(node.props.variant || 'default');

    const bgColor = variant === 'primary' ? this.renderTheme.primary : this.renderTheme.border;
    const textColor = variant === 'primary' ? 'white' : this.renderTheme.text;

    // Use tokens from density configuration
    const badgeRadius = this.tokens.badge.radius === 'pill'
      ? pos.height / 2
      : this.tokens.badge.radius;
    const fontSize = this.tokens.badge.fontSize;

    return `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${pos.y}"
          width="${pos.width}" height="${pos.height}"
          rx="${badgeRadius}"
          fill="${bgColor}"
          stroke="none"/>
    <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 4}"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="${fontSize}"
          font-weight="600"
          fill="${textColor}"
          text-anchor="middle">${this.escapeXml(text)}</text>
  </g>`;
  }

  protected renderModal(node: IRComponentNode, pos: any): string {
    const title = String(node.props.title || 'Modal');

    const padding = 16;
    const headerHeight = 48;

    // Use full-canvas overlay so it sits above prior content
    const overlayHeight = Math.max(this.options.height, this.calculateContentHeight());
    const modalX = (this.options.width - pos.width) / 2;
    const modalY = Math.max(40, (overlayHeight - pos.height) / 2);

    return `<g${this.getDataNodeId(node)}>
    <!-- Modal backdrop -->
      <rect x="0" y="0" 
        width="${this.options.width}" height="${overlayHeight}" 
        fill="black" opacity="0.28"/>
    
    <!-- Modal box -->
      <rect x="${modalX}" y="${modalY}" 
        width="${pos.width}" height="${pos.height}" 
          rx="8" 
          fill="${this.renderTheme.cardBg}" 
        stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
    
    <!-- Header -->
      <line x1="${modalX}" y1="${modalY + headerHeight}" 
        x2="${modalX + pos.width}" y2="${modalY + headerHeight}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
    
      <text x="${modalX + padding}" y="${modalY + padding + 16}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="16" 
          font-weight="600" 
          fill="${this.renderTheme.text}">${this.escapeXml(title)}</text>
    
    <!-- Close button -->
      <text x="${modalX + pos.width - 16}" y="${modalY + padding + 12}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="18" 
          fill="${this.renderTheme.textMuted}">✕</text>
    
    <!-- Content placeholder -->
      <text x="${modalX + pos.width / 2}" y="${modalY + headerHeight + (pos.height - headerHeight) / 2}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="13" 
          fill="${this.renderTheme.textMuted}" 
          text-anchor="middle">Modal content</text>
  </g>`;
  }

  protected renderList(node: IRComponentNode, pos: any): string {
    const title = String(node.props.title || '');
    const itemsStr = String(node.props.items || '');

    let items: string[] = [];
    if (itemsStr) {
      items = itemsStr.split(',').map((i) => i.trim());
    } else {
      // Generate mock items
      const itemCount = Number(node.props.itemsMock || 4);
      items = MockDataGenerator.generateMockList('name', itemCount);
    }

    const padding = 12;
    const itemHeight = 36;
    const titleHeight = title ? 40 : 0;

    let svg = `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          rx="8" 
          fill="${this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>`;

    // Title
    if (title) {
      svg += `
    <text x="${pos.x + padding}" y="${pos.y + 26}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="13" 
          font-weight="600" 
          fill="${this.renderTheme.text}">${this.escapeXml(title)}</text>
    <line x1="${pos.x}" y1="${pos.y + titleHeight}" x2="${pos.x + pos.width}" y2="${pos.y + titleHeight}" 
          stroke="${this.renderTheme.border}" stroke-width="1"/>`;
    }

    // Items
    items.forEach((item, i) => {
      const itemY = pos.y + titleHeight + i * itemHeight;
      if (itemY + itemHeight < pos.y + pos.height) {
        svg += `
    <line x1="${pos.x}" y1="${itemY + itemHeight}" 
          x2="${pos.x + pos.width}" y2="${itemY + itemHeight}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="0.5"/>
    <text x="${pos.x + padding}" y="${itemY + 24}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="13" 
          fill="${this.renderTheme.text}">${this.escapeXml(item)}</text>`;
      }
    });

    svg += '\n  </g>';
    return svg;
  }

  protected renderGenericComponent(node: IRComponentNode, pos: any): string {
    return `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          rx="4" 
          fill="${this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1" 
          stroke-dasharray="4 4"/>
    <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="12" 
          fill="${this.renderTheme.textMuted}" 
          text-anchor="middle">${node.componentType}</text>
  </g>`;
  }

  protected renderStatCard(node: IRComponentNode, pos: any): string {
    const title = String(node.props.title || 'Metric');
    const value = String(node.props.value || '0');
    const caption = String(node.props.caption || '');

    const padding = this.resolveSpacing(node.style.padding) || 16;
    const innerX = pos.x + padding;
    const innerY = pos.y + padding;
    const innerWidth = pos.width - padding * 2;
    const innerHeight = pos.height - padding * 2;

    // StatCard layout: top-to-bottom flow with natural spacing
    const valueSize = 32;
    const titleSize = 14;
    const captionSize = 12;
    const lineHeight = 18;
    const topGap = 8;      // Space from top
    const valueGap = 12;   // Space before value
    const captionGap = 12; // Space before caption

    // Top-to-bottom flow
    const titleY = innerY + topGap + titleSize;
    const valueY = titleY + valueGap + valueSize;
    const captionY = valueY + captionGap + captionSize;

    let svg = `<g${this.getDataNodeId(node)}>
    <!-- StatCard Background -->
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          rx="8" 
          fill="${this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
    
    <!-- Title -->
    <text x="${innerX}" y="${titleY}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="${titleSize}" 
          font-weight="500" 
          fill="${this.renderTheme.textMuted}">${this.escapeXml(title)}</text>
    
    <!-- Value (Large) -->
    <text x="${innerX}" y="${valueY}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="${valueSize}" 
          font-weight="700" 
          fill="${this.renderTheme.primary}">${this.escapeXml(value)}</text>`;

    if (caption) {
      svg += `
    <!-- Caption -->
    <text x="${innerX}" y="${captionY}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="${captionSize}" 
          fill="${this.renderTheme.textMuted}">${this.escapeXml(caption)}</text>`;
    }

    svg += `
  </g>`;
    return svg;
  }

  protected renderImage(node: IRComponentNode, pos: any): string {
    const placeholder = String(node.props.placeholder || 'landscape');

    // Determine aspect ratio based on placeholder type
    const aspectRatios: Record<string, number> = {
      landscape: 16 / 9,
      portrait: 2 / 3,
      square: 1,
      icon: 1,
      avatar: 1,
    };

    const ratio = aspectRatios[placeholder] || 16 / 9;
    
    // Calculate max size without stretching (constrain to smallest dimension)
    const maxSize = Math.min(pos.width, pos.height) * 0.8; // 80% of available space
    let iconWidth = maxSize;
    let iconHeight = maxSize / ratio;
    
    // If height is still too large, constrain by height instead
    if (iconHeight > pos.height * 0.8) {
      iconHeight = pos.height * 0.8;
      iconWidth = iconHeight * ratio;
    }
    
    // Center the icon in the available space
    const offsetX = pos.x + (pos.width - iconWidth) / 2;
    const offsetY = pos.y + (pos.height - iconHeight) / 2;

    // SVG placeholder sketches
    let svgContent = '';

    // Background
    let svg = `<g${this.getDataNodeId(node)}>
    <!-- Image Background -->
    <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}" fill="#E8E8E8"/>`;

    // Camera icon for landscape, portrait, square
    if (['landscape', 'portrait', 'square'].includes(placeholder)) {
      // Modern digital camera design based on contemporary camera icon
      const cameraCx = offsetX + iconWidth / 2;
      const cameraCy = offsetY + iconHeight / 2;
      
      // Scale factor from original viewBox (24x24) to current icon size
      const scale = Math.min(iconWidth, iconHeight) / 24;
      const scaledX = cameraCx - (24 / 2) * scale;
      const scaledY = cameraCy - (24 / 2) * scale;
      
      // Camera body dimensions (from original viewBox)
      // Rectangle from 2,5 to 22,21 approximately
      const bodyLeft = scaledX + 2 * scale;
      const bodyTop = scaledY + 5 * scale;
      const bodyWidth = 20 * scale;
      const bodyHeight = 16 * scale;
      const bodyRadius = 2 * scale;
      
      // Lens circle center (at 12,12.5 in original) with radius ~4
      const lensCx = cameraCx;
      const lensCy = cameraCy + 0.5 * scale;
      const lensRadius = 4 * scale;

      svg += `
    <!-- Camera Icon - Modern Digital Design -->
    <!-- Camera body (rounded rectangle with fill) -->
    <g>
      <!-- Body with fill -->
      <path d="M ${bodyLeft + bodyRadius} ${bodyTop} 
               L ${bodyLeft + bodyWidth - bodyRadius} ${bodyTop}
               Q ${bodyLeft + bodyWidth} ${bodyTop} ${bodyLeft + bodyWidth} ${bodyTop + bodyRadius}
               L ${bodyLeft + bodyWidth} ${bodyTop + bodyHeight - bodyRadius}
               Q ${bodyLeft + bodyWidth} ${bodyTop + bodyHeight} ${bodyLeft + bodyWidth - bodyRadius} ${bodyTop + bodyHeight}
               L ${bodyLeft + bodyRadius} ${bodyTop + bodyHeight}
               Q ${bodyLeft} ${bodyTop + bodyHeight} ${bodyLeft} ${bodyTop + bodyHeight - bodyRadius}
               L ${bodyLeft} ${bodyTop + bodyRadius}
               Q ${bodyLeft} ${bodyTop} ${bodyLeft + bodyRadius} ${bodyTop}"
            fill="#666" stroke="#666" stroke-width="${1.5 * scale}" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <!-- Main lens circle (prominent) -->
    <circle cx="${lensCx}" cy="${lensCy}" r="${lensRadius}" 
            fill="none" stroke="#333" stroke-width="${2 * scale}" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Lens inner circle (glass effect) -->
    <circle cx="${lensCx}" cy="${lensCy}" r="${lensRadius * 0.7}" 
            fill="#C0C0C0" stroke="#999" stroke-width="${0.8 * scale}"/>
    <!-- Lens highlight (reflection) -->
    <circle cx="${lensCx - lensRadius * 0.25}" cy="${lensCy - lensRadius * 0.25}" 
            r="${lensRadius * 0.25}" 
            fill="#E0E0E0" opacity="0.6"/>`;
    } 
    // Person silhouette for avatar and icon
    else if (['avatar', 'icon'].includes(placeholder)) {
      const personWidth = iconWidth * 0.5;
      const personHeight = iconHeight * 0.7;
      const personCx = offsetX + iconWidth / 2;
      const personCy = offsetY + iconHeight / 2 - iconHeight * 0.1;

      svg += `
    <!-- Person Silhouette -->
    <!-- Head -->
    <circle cx="${personCx}" cy="${personCy - personHeight * 0.25}" 
            r="${personWidth * 0.25}" fill="#666"/>
    <!-- Body -->
    <rect x="${personCx - personWidth * 0.3}" y="${personCy - personHeight * 0.05}" 
          width="${personWidth * 0.6}" height="${personHeight * 0.5}" 
          fill="#666" rx="3"/>`;
    }

    // Border
    svg += `
    <!-- Border -->
    <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}" 
          fill="none" stroke="${this.renderTheme.border}" stroke-width="1" rx="4"/>
  </g>`;
    return svg;
  }

  protected renderBreadcrumbs(node: IRComponentNode, pos: any): string {
    const itemsStr = String(node.props.items || 'Home');
    const items = itemsStr.split(',').map((s) => s.trim());
    const separator = String(node.props.separator || '/');
    const fontSize = 12;
    const separatorWidth = 20; // Increased for spacing
    const itemSpacing = 8;

    let currentX = pos.x;
    let svg = `<g${this.getDataNodeId(node)}>`;

    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const textColor = isLast ? this.renderTheme.text : this.renderTheme.textMuted;
      const fontWeight = isLast ? '500' : '400';

      svg += `
    <text x="${currentX}" y="${pos.y + pos.height / 2 + 4}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="${fontSize}" 
          font-weight="${fontWeight}" 
          fill="${textColor}">${this.escapeXml(item)}</text>`;

      // Estimate text width (rough approximation)
      const textWidth = item.length * 6.5;
      currentX += textWidth + itemSpacing;

      // Add separator with spacing (except after last item)
      if (!isLast) {
        svg += `
    <text x="${currentX + 4}" y="${pos.y + pos.height / 2 + 4}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="${fontSize}" 
          fill="${this.renderTheme.textMuted}">${this.escapeXml(separator)}</text>`;
        currentX += separatorWidth;
      }
    });

    svg += '\n  </g>';
    return svg;
  }

  protected renderSidebarMenu(node: IRComponentNode, pos: any): string {
    const itemsStr = String(node.props.items || 'Item 1,Item 2,Item 3');
    const iconsStr = String(node.props.icons || '');
    const items = itemsStr.split(',').map((s) => s.trim());
    const icons = iconsStr ? iconsStr.split(',').map((s) => s.trim()) : [];
    
    const itemHeight = 40;
    const fontSize = 14;
    const activeIndex = Number(node.props.active || 0);

    let svg = `<g${this.getDataNodeId(node)}>`;

    items.forEach((item, index) => {
      const itemY = pos.y + index * itemHeight;
      const isActive = index === activeIndex;
      const bgColor = isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent';
      const textColor = isActive ? 'rgba(59, 130, 246, 0.9)' : 'rgba(30, 41, 59, 0.75)';
      const fontWeight = isActive ? '500' : '400';

      // Item background (only if active)
      if (isActive) {
        svg += `
    <rect x="${pos.x}" y="${itemY}" 
          width="${pos.width}" height="${itemHeight}" 
          rx="6" 
          fill="${bgColor}"/>`;
      }

      // Icon if provided
      let currentX = pos.x + 12;
      if (icons[index]) {
        const iconSvg = getIcon(icons[index]);
        if (iconSvg) {
          const iconSize = 16;
          const iconY = itemY + (itemHeight - iconSize) / 2;
          svg += `
    <g transform="translate(${currentX}, ${iconY})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="rgba(30, 41, 59, 0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(iconSvg)}
      </svg>
    </g>`;
          currentX += iconSize + 8;
        }
      }

      // Item text
      svg += `
    <text x="${currentX}" y="${itemY + itemHeight / 2 + 5}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="${fontSize}" 
          font-weight="${fontWeight}" 
          fill="${textColor}">${this.escapeXml(item)}</text>`;
    });

    svg += '\n  </g>';
    return svg;
  }

  protected renderIcon(node: IRComponentNode, pos: any): string {
    const iconType = String(node.props.type || 'help-circle');
    const size = String(node.props.size || 'md');
    const iconSvg = getIcon(iconType);

    if (!iconSvg) {
      // Fallback: render a placeholder with question mark
      return `<g${this.getDataNodeId(node)}>
    <!-- Icon not found: ${iconType} -->
    <circle cx="${pos.x + pos.width / 2}" cy="${pos.y + pos.height / 2}" r="${Math.min(pos.width, pos.height) / 2 - 2}" fill="none" stroke="rgba(100, 116, 139, 0.4)" stroke-width="1"/>
    <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 4}" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="rgba(100, 116, 139, 0.6)" text-anchor="middle">?</text>
  </g>`;
    }

    // Size: sm=14px, md=18px, lg=24px
    const sizeMap = { 'sm': 14, 'md': 18, 'lg': 24 };
    const iconSize = sizeMap[size as keyof typeof sizeMap] || 18;
    const iconColor = 'rgba(30, 41, 59, 0.75)';
    const offsetX = pos.x + (pos.width - iconSize) / 2;
    const offsetY = pos.y + (pos.height - iconSize) / 2;

    // Wrap SVG with viewBox and sizing
    const wrappedSvg = `<g${this.getDataNodeId(node)} transform="translate(${offsetX}, ${offsetY})">
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${this.extractSvgContent(iconSvg)}
    </svg>
  </g>`;

    return wrappedSvg;
  }

  protected renderIconButton(node: IRComponentNode, pos: any): string {
    const iconName = String(node.props.icon || 'help-circle');
    const variant = String(node.props.variant || 'default');
    const size = String(node.props.size || 'md');
    const disabled = String(node.props.disabled || 'false') === 'true';

    const bgColorMap = {
      'primary': 'rgba(59, 130, 246, 0.85)',
      'danger': 'rgba(239, 68, 68, 0.85)',
      'default': 'rgba(226, 232, 240, 0.9)'
    };
    const bgColor = bgColorMap[variant as keyof typeof bgColorMap] || bgColorMap['default'];

    const iconColorMap = {
      'primary': '#FFFFFF',
      'danger': '#FFFFFF',
      'default': 'rgba(30, 41, 59, 0.75)'
    };
    const iconColor = iconColorMap[variant as keyof typeof iconColorMap] || iconColorMap['default'];

    const borderColorMap = {
      'primary': 'rgba(59, 130, 246, 0.7)',
      'danger': 'rgba(239, 68, 68, 0.7)',
      'default': 'rgba(100, 116, 139, 0.4)'
    };
    const borderColor = borderColorMap[variant as keyof typeof borderColorMap] || borderColorMap['default'];

    const opacity = disabled ? '0.5' : '1';
    const iconSvg = getIcon(iconName);

    // Button size: sm=28px, md=32px, lg=40px
    const sizeMap = { 'sm': 28, 'md': 32, 'lg': 40 };
    const buttonSize = sizeMap[size as keyof typeof sizeMap] || 32;
    const radius = 6;

    let svg = `<g${this.getDataNodeId(node)} opacity="${opacity}">
    <!-- IconButton background -->
    <rect x="${pos.x}" y="${pos.y}" width="${buttonSize}" height="${buttonSize}" rx="${radius}" fill="${bgColor}" stroke="${borderColor}" stroke-width="1"/>`;

    // Icon inside button
    if (iconSvg) {
      const iconSize = buttonSize * 0.6;
      const offsetX = pos.x + (buttonSize - iconSize) / 2;
      const offsetY = pos.y + (buttonSize - iconSize) / 2;

      svg += `
    <!-- Icon -->
    <g transform="translate(${offsetX}, ${offsetY})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(iconSvg)}
      </svg>
    </g>`;
    }

    svg += '\n  </g>';
    return svg;
  }

  /**
   * Extract SVG path/element content from a full SVG string
   * Removes the outer <svg> tag but keeps the content
   */
  protected extractSvgContent(svgString: string): string {
    // Match content between <svg> and </svg> tags
    const match = svgString.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
    return match ? match[1] : svgString;
  }

  private resolveSpacing(spacing?: string): number {
    const spacingMap: Record<string, number> = {
      none: 0,
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    };

    if (!spacing) return spacingMap[this.ir.project.style.spacing] || 16;
    const value = spacingMap[spacing];
    return value !== undefined ? value : spacingMap.md;
  }

  protected wrapTextToLines(text: string, maxWidth: number, fontSize: number): string[] {
    const normalized = text.replace(/\r\n/g, '\n');
    const paragraphs = normalized.split('\n');
    const charWidth = fontSize * 0.6;
    const safeWidth = Math.max(maxWidth || 0, charWidth);
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

  protected escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Get data-node-id attribute string for SVG elements
   * Enables bidirectional selection between code and canvas
   */
  protected getDataNodeId(node: IRComponentNode | IRContainerNode): string {
    return node.meta.nodeId ? ` data-node-id="${node.meta.nodeId}"` : '';
  }

}

// ============================================================================
// PUBLIC API
// ============================================================================

export function renderToSVG(
  ir: IRContract,
  layout: LayoutResult,
  options?: SVGRenderOptions
): string {
  const renderer = new SVGRenderer(ir, layout, options);
  return renderer.render();
}

// ============================================================================
// UTILITY FUNCTIONS (Backward Compatibility)
// ============================================================================

export function createSVGElement(
  tag: string,
  attrs: Record<string, string | number>,
  children: string[] = []
): string {
  const attrStr = Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');

  return `<${tag} ${attrStr}>${children.join('')}</${tag}>`;
}

export function buildSVG(component: SVGComponent): string {
  const children = component.children?.map(buildSVG) ?? [];
  if (component.text) {
    children.push(component.text);
  }
  return createSVGElement(component.tag, component.attrs, children);
}

// ============================================================================
// NOTE: File export functions have been moved to @wire-dsl/exporters
// This keeps the engine pure JS/TS without Node.js I/O dependencies
// ============================================================================
