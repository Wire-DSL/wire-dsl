import type { IRContract, IRNode, IRComponentNode, IRContainerNode, IRInstanceNode } from '../ir/index';
import type { LayoutResult } from '../layout/index';
import { MockDataGenerator } from './mock-data';
import { ColorResolver } from './colors';
import { getIcon } from './icons/iconLibrary';
import { resolveTokens, type DesignTokens } from './tokens';
import { resolveSpacingToken, type DensityLevel } from '../shared/spacing';
import {
  resolveActionControlHeight,
  resolveControlHeight,
  resolveControlHorizontalPadding,
  resolveIconButtonSize,
  resolveIconSize,
} from '../shared/component-sizes';
import { resolveHeadingTypography } from '../shared/heading-levels';
import { resolveHeadingVerticalPadding } from '../shared/heading-spacing';

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
  /**
   * When true, renders visual diagnostic overlays for invalid DSL states
   * (e.g. empty containers). Enable in editor/canvas mode; leave false for
   * clean exports (CLI, PDF, PNG).
   */
  showDiagnostics?: boolean;
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
    text: '#000000',
    textMuted: '#64748B',
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    primaryLight: '#EFF6FF',
  },
  dark: {
    bg: '#111111',
    cardBg: '#1C1C1C',
    border: '#303030',
    text: '#F0F0F0',
    textMuted: '#808080',
    primary: '#60A5FA',
    primaryHover: '#3B82F6',
    primaryLight: '#1C2A3A',
  },
};

// ============================================================================
// SVG RENDERER CLASS
// ============================================================================

export class SVGRenderer {
  protected ir: IRContract;
  private layout: LayoutResult;
  protected options: Required<Omit<SVGRenderOptions, 'screenName'>> & { screenName?: string };
  protected renderTheme: typeof THEMES.light;
  protected tokens: DesignTokens;
  private selectedScreenName?: string;
  protected renderedNodeIds: Set<string> = new Set(); // Track nodes rendered in current pass
  protected colorResolver: ColorResolver;
  protected fontFamily: string = 'Arial, Helvetica, sans-serif';
  private parentContainerByChildId: Map<string, IRContainerNode> = new Map();

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
      showDiagnostics: options?.showDiagnostics ?? false,
    };

    this.colorResolver = new ColorResolver();
    this.buildParentContainerIndex();

    // Initialize MockDataGenerator with custom mocks from project metadata
    if (ir.project.mocks && Object.keys(ir.project.mocks).length > 0) {
      MockDataGenerator.setCustomMocks(ir.project.mocks);
    }

    // Initialize ColorResolver with project colors
    if (ir.project.colors && Object.keys(ir.project.colors).length > 0) {
      this.colorResolver.setCustomColors(ir.project.colors);
    }

    const themeDefaults = THEMES[this.options.theme];
    this.renderTheme = {
      ...themeDefaults,
      text: this.resolveTextColor(),
      textMuted: this.resolveMutedColor(),
    };
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

    return Math.max(maxY, this.options.height);
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
      if (node.containerType === 'split') {
        this.renderSplitDecoration(node, pos, containerGroup);
      }

      // Render container children, or a diagnostic placeholder when empty
      // (cell containers are intentionally empty and should not show a diagnostic)
      const isCellContainer = node.meta?.source === 'cell';
      if (node.children.length === 0 && this.options.showDiagnostics && !isCellContainer) {
        containerGroup.push(this.renderEmptyContainerDiagnostic(pos, node.containerType));
      } else {
        node.children.forEach((childRef) => {
          this.renderNode(childRef.ref, containerGroup);
        });
      }

      // Close wrapper group
      if (hasNodeId) {
        containerGroup.push('</g>');
      }

      // Add container output to main output
      output.push(...containerGroup);
    } else if (node.kind === 'instance') {
      // Render a user-defined component/layout instance.
      // Only data-node-id is emitted — the canvas resolves everything else
      // (definition name, invocation props, source range) via the SourceMap.
      // The renderer has no business encoding SourceMap data into SVG attributes.
      const instanceGroup: string[] = [];
      if (node.meta.nodeId) {
        instanceGroup.push(`<g data-node-id="${node.meta.nodeId}">`);
      }
      // Transparent rect for hit-testing in the canvas
      instanceGroup.push(
        `<rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}" ` +
        `fill="transparent" stroke="none" pointer-events="all"/>`
      );
      // Render the expanded definition content
      this.renderNode(node.expandedRoot.ref, instanceGroup);
      if (node.meta.nodeId) {
        instanceGroup.push('</g>');
      }
      output.push(...instanceGroup);
    } else if (node.kind === 'component') {
      // Render built-in component
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
      case 'Link':
        return this.renderLink(node, pos);
      case 'Input':
        return this.renderInput(node, pos);
      case 'Topbar':
        return this.renderTopbar(node, pos);
      case 'Table':
        return this.renderTable(node, pos);
      case 'Chart':
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
      case 'Separate':
        return this.renderSeparate(node, pos);

      // Feedback/Alert components
      case 'Alert':
        return this.renderAlert(node, pos);
      case 'Badge':
        return this.renderBadge(node, pos);
      case 'Modal':
        return this.renderModal(node, pos);
      case 'List':
        return this.renderList(node, pos);
      case 'Stat':
        return this.renderStat(node, pos);
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
    const variant = String(node.props.variant || 'default');
    const headingColor =
      variant === 'default' ? this.resolveTextColor() : this.resolveVariantColor(variant, this.resolveTextColor());

    const headingTypography = this.getHeadingTypography(node);
    const fontSize = headingTypography.fontSize;
    const fontWeight = headingTypography.fontWeight;
    const lineHeightPx = Math.ceil(fontSize * headingTypography.lineHeight);
    const lines = this.wrapTextToLines(text, pos.width, fontSize);
    const firstLineY = this.getHeadingFirstLineY(node, pos, fontSize, lineHeightPx, lines.length);

    if (lines.length <= 1) {
      return `<g${this.getDataNodeId(node)}>
    <text x="${pos.x}" y="${firstLineY}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}"
          font-weight="${fontWeight}"
          fill="${headingColor}">${this.escapeXml(text)}</text>
  </g>`;
    }

    const tspans = lines
      .map(
        (line, index) =>
          `<tspan x="${pos.x}" dy="${index === 0 ? 0 : lineHeightPx}">${this.escapeXml(line)}</tspan>`
      )
      .join('');

    return `<g${this.getDataNodeId(node)}>
    <text x="${pos.x}" y="${firstLineY}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}"
          font-weight="${fontWeight}"
          fill="${headingColor}">${tspans}</text>
  </g>`;
  }

  protected renderButton(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || 'Button');
    const variant = String(node.props.variant || 'default');
    const size = String(node.props.size || 'md');
    const disabled = this.parseBooleanProp(node.props.disabled, false);
    const density = (this.ir.project.style.density || 'normal') as DensityLevel;
    const extraPadding = resolveControlHorizontalPadding(String(node.props.padding || 'none'), density);
    const labelOffset = this.parseBooleanProp(node.props.labelSpace, false) ? 18 : 0;
    const fullWidth = this.shouldButtonFillAvailableWidth(node);
    const iconName = String(node.props.icon || '').trim();
    const iconAlign = String(node.props.iconAlign || 'left').toLowerCase();

    // Use tokens from density configuration
    const radius = this.tokens.button.radius;
    const fontSize = this.tokens.button.fontSize;
    const fontWeight = this.tokens.button.fontWeight;
    const paddingX = this.tokens.button.paddingX;
    const controlHeight = resolveActionControlHeight(size, density);
    const buttonY = pos.y + labelOffset;
    const buttonHeight = Math.max(16, Math.min(controlHeight, pos.height - labelOffset));

    // Icon support
    const iconSvg = iconName ? getIcon(iconName) : null;
    const iconSize = iconSvg ? Math.round(fontSize * 1.1) : 0;
    const iconGap = iconSvg ? 8 : 0;
    const edgePad = 12; // icon distance from button border
    const textPad = paddingX + extraPadding;

    // Keep control inside layout bounds; truncate text if needed.
    const idealTextWidth = this.estimateTextWidth(text, fontSize);
    const buttonWidth = fullWidth
      ? Math.max(1, pos.width)
      : this.clampControlWidth(Math.max(Math.ceil(idealTextWidth + (iconSvg ? iconSize + iconGap : 0) + textPad * 2), 60), pos.width);
    const availableTextWidth = Math.max(0, buttonWidth - textPad * 2 - (iconSvg ? iconSize + iconGap : 0));
    const visibleText = this.truncateTextToWidth(text, availableTextWidth, fontSize);

    // Color configuration with variant override support from colors block.
    const semanticBase = this.getSemanticVariantColor(variant);
    const hasExplicitVariantColor =
      semanticBase !== undefined || this.colorResolver.hasColor(variant);
    const resolvedBase = this.resolveVariantColor(variant, this.renderTheme.primary);
    const isDarkMode = this.options.theme === 'dark';
    const bgColor = hasExplicitVariantColor
      ? this.hexToRgba(resolvedBase, 0.85)
      : (isDarkMode ? 'rgba(48, 48, 55, 0.9)' : 'rgba(226, 232, 240, 0.9)');
    const textColor = hasExplicitVariantColor
      ? '#FFFFFF'
      : this.hexToRgba(this.resolveTextColor(), 0.85);
    const borderColor = hasExplicitVariantColor
      ? this.hexToRgba(resolvedBase, 0.7)
      : (isDarkMode ? 'rgba(75, 75, 88, 0.8)' : 'rgba(100, 116, 139, 0.4)');

    // Icon pinned to its edge with edgePad breathing room
    const iconOffsetY = buttonY + (buttonHeight - iconSize) / 2;
    const iconX = iconAlign === 'right'
      ? pos.x + buttonWidth - edgePad - iconSize
      : pos.x + edgePad;

    // Text position based on align prop (default: center)
    const textAlign = String(node.props.align || 'center').toLowerCase();
    const sidePad = textPad + 4; // extra breathing room for left/right aligned text
    let textX: number;
    let textAnchor: string;
    if (textAlign === 'left') {
      textX = iconSvg && iconAlign === 'left'
        ? pos.x + edgePad + iconSize + iconGap
        : pos.x + sidePad;
      textAnchor = 'start';
    } else if (textAlign === 'right') {
      textX = iconSvg && iconAlign === 'right'
        ? pos.x + buttonWidth - edgePad - iconSize - iconGap
        : pos.x + buttonWidth - sidePad;
      textAnchor = 'end';
    } else {
      textX = pos.x + buttonWidth / 2;
      textAnchor = 'middle';
    }

    let svg = `<g${this.getDataNodeId(node)}${disabled ? ' opacity="0.45"' : ''}>
    <rect x="${pos.x}" y="${buttonY}"
          width="${buttonWidth}" height="${buttonHeight}"
          rx="${radius}"
          fill="${bgColor}"
          stroke="${borderColor}"
          stroke-width="1"/>`;

    if (iconSvg) {
      svg += `
    <g transform="translate(${iconX}, ${iconOffsetY})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${textColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(iconSvg)}
      </svg>
    </g>`;
    }

    svg += `
    <text x="${textX}" y="${buttonY + buttonHeight / 2 + fontSize * 0.35}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}"
          font-weight="${fontWeight}"
          fill="${textColor}"
          text-anchor="${textAnchor}">${this.escapeXml(visibleText)}</text>
  </g>`;
    return svg;
  }

  protected renderLink(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || 'Link');
    const variant = String(node.props.variant || 'primary');
    const size = String(node.props.size || 'md');
    const density = (this.ir.project.style.density || 'normal') as DensityLevel;
    const fontSize = this.tokens.button.fontSize;
    const fontWeight = this.tokens.button.fontWeight;
    const paddingX = this.tokens.button.paddingX;
    const linkColor = this.resolveVariantColor(variant, this.renderTheme.primary);

    // Match Button sizing so Link can align beside regular buttons.
    const idealTextWidth = this.estimateTextWidth(text, fontSize);
    const linkWidth = this.clampControlWidth(
      Math.max(Math.ceil(idealTextWidth + paddingX * 2), 60),
      pos.width
    );
    const linkHeight = Math.max(16, Math.min(resolveActionControlHeight(size, density), pos.height));
    const availableTextWidth = Math.max(0, linkWidth - paddingX * 2);
    const visibleText = this.truncateTextToWidth(text, availableTextWidth, fontSize);
    const visibleTextWidth = Math.min(
      this.estimateTextWidth(visibleText, fontSize),
      Math.max(0, availableTextWidth)
    );
    const centerY = pos.y + linkHeight / 2 + fontSize * 0.35;
    const underlineY = centerY + 3;

    return `<g${this.getDataNodeId(node)}>
    <text x="${pos.x + linkWidth / 2}" y="${centerY}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}"
          font-weight="${fontWeight}"
          fill="${linkColor}"
          text-anchor="middle">${this.escapeXml(visibleText)}</text>
    <line x1="${pos.x + (linkWidth - visibleTextWidth) / 2}" y1="${underlineY}"
          x2="${pos.x + (linkWidth + visibleTextWidth) / 2}" y2="${underlineY}"
          stroke="${linkColor}"
          stroke-width="1"/>
  </g>`;
  }

  protected renderInput(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || '');
    const placeholder = String(node.props.placeholder || '');
    const iconLeftName = String(node.props.iconLeft || '').trim();
    const iconRightName = String(node.props.iconRight || '').trim();
    const disabled = this.parseBooleanProp(node.props.disabled, false);

    // Use tokens from density configuration
    const radius = this.tokens.input.radius;
    const fontSize = this.tokens.input.fontSize;
    const paddingX = this.tokens.input.paddingX;
    const labelOffset = this.getControlLabelOffset(label);
    const controlY = pos.y + labelOffset;
    const controlHeight = Math.max(16, pos.height - labelOffset);

    const iconSize = 16;
    const iconPad = 12;  // breathing room between icon and box border
    const iconInnerGap = 8; // gap between icon and text
    const iconLeftSvg = iconLeftName ? getIcon(iconLeftName) : null;
    const iconRightSvg = iconRightName ? getIcon(iconRightName) : null;
    const leftOffset = iconLeftSvg ? iconPad + iconSize + iconInnerGap : 0;
    const rightOffset = iconRightSvg ? iconPad + iconSize + iconInnerGap : 0;
    const textX = pos.x + (iconLeftSvg ? leftOffset : paddingX);
    const iconColor = this.hexToRgba(this.resolveMutedColor(), 0.8);
    const iconCenterY = controlY + (controlHeight - iconSize) / 2;

    let svg = `<g${this.getDataNodeId(node)}${disabled ? ' opacity="0.45"' : ''}>`;
    if (label) {
      svg += `
    <text x="${pos.x + paddingX}" y="${this.getControlLabelBaselineY(pos.y)}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="12"
          fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>`;
    }
    svg += `
    <rect x="${pos.x}" y="${controlY}"
          width="${pos.width}" height="${controlHeight}"
          rx="${radius}"
          fill="${this.renderTheme.cardBg}"
          stroke="${this.renderTheme.border}"
          stroke-width="1"/>`;
    if (iconLeftSvg) {
      svg += `
    <g transform="translate(${pos.x + iconPad}, ${iconCenterY})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(iconLeftSvg)}
      </svg>
    </g>`;
    }
    if (iconRightSvg) {
      svg += `
    <g transform="translate(${pos.x + pos.width - iconPad - iconSize}, ${iconCenterY})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(iconRightSvg)}
      </svg>
    </g>`;
    }
    if (placeholder) {
      const availPlaceholderWidth = pos.width - (iconLeftSvg ? leftOffset : paddingX) - (iconRightSvg ? rightOffset : paddingX);
      const visiblePlaceholder = this.truncateTextToWidth(placeholder, Math.max(0, availPlaceholderWidth), fontSize);
      svg += `
    <text x="${textX}" y="${controlY + controlHeight / 2 + 5}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}"
          fill="${this.renderTheme.textMuted}">${this.escapeXml(visiblePlaceholder)}</text>`;
    }
    svg += '\n  </g>';
    return svg;
  }

  protected renderTopbar(node: IRComponentNode, pos: any): string {
    const title = String(node.props.title || 'App');
    const subtitle = String(node.props.subtitle || '');
    const actions = String(node.props.actions || '');
    const user = String(node.props.user || '');
    const variant = String(node.props.variant || 'default');
    const accentColor =
      variant === 'default'
        ? this.resolveAccentColor()
        : this.resolveVariantColor(variant, this.resolveAccentColor());
    const showBorder = this.parseBooleanProp(node.props.border, false);
    const showBackground = this.parseBooleanProp(node.props.background, false);
    const radiusMap: Record<string, number> = {
      none: 0,
      sm: 4,
      md: this.tokens.card.radius,
      lg: 12,
      xl: 16,
    };
    const topbarRadius = radiusMap[String(node.props.radius || 'md')] ?? this.tokens.card.radius;
    const topbar = this.calculateTopbarLayout(node, pos, title, subtitle, actions, user);

    let svg = `<g${this.getDataNodeId(node)}>`;
    if (showBorder || showBackground) {
      const bg = showBackground ? this.renderTheme.cardBg : 'none';
      const stroke = showBorder ? this.renderTheme.border : 'none';
      svg += `
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          rx="${topbarRadius}"
          fill="${bg}" 
          stroke="${stroke}" 
          stroke-width="1"/>`;
    }
    svg += `
    <!-- Title -->
    <text x="${topbar.textX}" y="${topbar.titleY}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="18" 
          font-weight="600" 
          fill="${this.renderTheme.text}">${this.escapeXml(topbar.visibleTitle)}</text>`;

    // Subtitle
    if (topbar.hasSubtitle) {
      svg += `
    <text x="${topbar.textX}" y="${topbar.subtitleY}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="13" 
          fill="${this.renderTheme.textMuted}">${this.escapeXml(topbar.visibleSubtitle)}</text>`;
    }

    if (topbar.leftIcon) {
      svg += `
    <!-- Left icon -->
    <rect x="${topbar.leftIcon.badgeX}" y="${topbar.leftIcon.badgeY}"
          width="${topbar.leftIcon.badgeSize}" height="${topbar.leftIcon.badgeSize}"
          rx="${topbar.leftIcon.badgeRadius}"
          fill="${this.hexToRgba(accentColor, 0.12)}"
          stroke="${this.hexToRgba(accentColor, 0.35)}"
          stroke-width="1"/>
    <g transform="translate(${topbar.leftIcon.iconX}, ${topbar.leftIcon.iconY})">
      <svg width="${topbar.leftIcon.iconSize}" height="${topbar.leftIcon.iconSize}" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(topbar.leftIcon.iconSvg)}
      </svg>
    </g>`;
    }

    // Actions are anchored to the right but shifted left when user/avatar occupy space.
    topbar.actions.forEach((action) => {
      svg += `
    <!-- Action button: ${action.label} -->
    <rect x="${action.x}" y="${action.y}" 
          width="${action.width}" height="${action.height}" 
          rx="6" 
          fill="${accentColor}" 
          stroke="none"/>
    <text x="${action.x + action.width / 2}" y="${action.y + action.height / 2 + 4}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="12" 
          font-weight="600" 
          fill="white" 
          text-anchor="middle">${this.escapeXml(action.label)}</text>`;
    });

    if (topbar.userBadge) {
      svg += `
    <!-- User badge -->
    <rect x="${topbar.userBadge.x}" y="${topbar.userBadge.y}" 
          width="${topbar.userBadge.width}" height="${topbar.userBadge.height}" 
          rx="4" 
          fill="${this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
    <text x="${topbar.userBadge.x + topbar.userBadge.width / 2}" y="${topbar.userBadge.y + topbar.userBadge.height / 2 + 4}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="12" 
          fill="${this.renderTheme.text}" 
          text-anchor="middle">${this.escapeXml(topbar.userBadge.label)}</text>`;
    }

    if (topbar.avatar) {
      svg += `
    <!-- Avatar -->
    <circle cx="${topbar.avatar.cx}" cy="${topbar.avatar.cy}" r="${topbar.avatar.r}"
            fill="${this.renderTheme.cardBg}"
            stroke="${this.renderTheme.border}"
            stroke-width="1"/>
    <circle cx="${topbar.avatar.cx}" cy="${topbar.avatar.cy - topbar.avatar.r * 0.22}" r="${topbar.avatar.r * 0.28}"
            fill="${this.renderTheme.textMuted}" opacity="0.7"/>
    <rect x="${topbar.avatar.cx - topbar.avatar.r * 0.45}" y="${topbar.avatar.cy + topbar.avatar.r * 0.02}"
          width="${topbar.avatar.r * 0.9}" height="${topbar.avatar.r * 0.62}" rx="${topbar.avatar.r * 0.3}"
          fill="${this.renderTheme.textMuted}" opacity="0.7"/>`;
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

  /**
   * Renders a yellow warning placeholder for containers with no children.
   * Only shown when `showDiagnostics` is enabled (editor/canvas mode).
   */
  protected renderEmptyContainerDiagnostic(
    pos: { x: number; y: number; width: number; height: number },
    containerType?: string
  ): string {
    const diagColor = '#F59E0B';       // amber-500 — warning yellow
    const diagBg    = '#FFFBEB';       // amber-50  — very light yellow fill
    const diagText  = '#92400E';       // amber-900 — readable dark label
    const minHeight = 40;
    const h = Math.max(pos.height, minHeight);
    const cx = pos.x + pos.width / 2;
    const cy = pos.y + h / 2;
    const label = containerType ? `Empty ${containerType}` : 'Empty layout';

    return (
      `<g>` +
      `<rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${h}" ` +
        `rx="4" fill="${diagBg}" stroke="${diagColor}" stroke-width="1" stroke-dasharray="6 3"/>` +
      `<text x="${cx}" y="${cy}" ` +
        `font-family="Arial, Helvetica, sans-serif" font-size="12" fill="${diagText}" ` +
        `text-anchor="middle" dominant-baseline="middle">` +
        `${label}` +
      `</text>` +
      `</g>`
    );
  }

  protected renderSplitDecoration(node: IRNode, pos: any, output: string[]): void {
    if (node.kind !== 'container') return;

    const gap = this.resolveSpacing(node.style.gap);
    const leftParam = Number(node.params.left);
    const rightParam = Number(node.params.right);
    const hasLeft = node.params.left !== undefined;
    const hasRight = node.params.right !== undefined && node.params.left === undefined;
    const fixedLeftWidth = Number.isFinite(leftParam) && leftParam > 0 ? leftParam : 250;
    const fixedRightWidth = Number.isFinite(rightParam) && rightParam > 0 ? rightParam : 250;
    const backgroundKey = String(node.style.background || '').trim();
    const showBorder = this.parseBooleanProp(node.params.border, false);

    if (backgroundKey) {
      const fill = this.colorResolver.resolveColor(backgroundKey, this.renderTheme.cardBg);
      if (hasRight) {
        const panelX = pos.x + Math.max(0, pos.width - fixedRightWidth);
        output.push(`<g>
    <rect x="${panelX}" y="${pos.y}" width="${Math.max(1, fixedRightWidth)}" height="${pos.height}" fill="${fill}" stroke="none"/>
    </g>`);
      } else if (hasLeft || !hasRight) {
        output.push(`<g>
    <rect x="${pos.x}" y="${pos.y}" width="${Math.max(1, fixedLeftWidth)}" height="${pos.height}" fill="${fill}" stroke="none"/>
    </g>`);
      }
    }

    if (showBorder) {
      const dividerX = hasRight
        ? pos.x + Math.max(0, pos.width - fixedRightWidth - gap / 2)
        : pos.x + Math.max(0, fixedLeftWidth + gap / 2);
      output.push(`<g>
    <line x1="${dividerX}" y1="${pos.y}" x2="${dividerX}" y2="${pos.y + pos.height}" stroke="${this.renderTheme.border}" stroke-width="1"/>
    </g>`);
    }
  }

  protected renderTable(node: IRComponentNode, pos: any): string {
    const title = String(node.props.title || '');
    const columnsStr = String(node.props.columns || 'Col1,Col2,Col3');
    const columns = columnsStr
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    const rowCount = Number(node.props.rows || node.props.rowsMock || 5);
    const mockStr = String(node.props.mock || '');
    const random = this.parseBooleanProp(node.props.random, false);
    const pagination = this.parseBooleanProp(node.props.pagination, false);
    const parsedPageCount = Number(node.props.pages || 5);
    const pageCount = Number.isFinite(parsedPageCount) && parsedPageCount > 0 ? Math.floor(parsedPageCount) : 5;
    const paginationAlign = String(node.props.paginationAlign || 'right');
    const actions = String(node.props.actions || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    const hasActions = actions.length > 0;
    const caption = String(node.props.caption || '').trim();
    const hasCaption = caption.length > 0;
    const showOuterBorder = this.parseBooleanProp(node.props.border, false);
    const showOuterBackground = this.parseBooleanProp(
      node.props.background,
      false
    );
    const showInnerBorder = this.parseBooleanProp(node.props.innerBorder, true);
    const rawCaptionAlign = String(node.props.captionAlign || '');
    const captionAlign =
      rawCaptionAlign === 'left' || rawCaptionAlign === 'center' || rawCaptionAlign === 'right'
        ? rawCaptionAlign
        : paginationAlign === 'left'
          ? 'right'
          : 'left';
    const sameFooterAlign = hasCaption && pagination && captionAlign === paginationAlign;

    // Parse mock types by column. If not provided, infer from column names.
    const mockTypes = mockStr
      ? mockStr
          .split(',')
          .map((m) => m.trim())
          .filter(Boolean)
      : [];
    const safeColumns = columns.length > 0 ? columns : ['Column'];
    while (mockTypes.length < safeColumns.length) {
      const inferred = MockDataGenerator.inferMockTypeFromColumn(safeColumns[mockTypes.length] || 'item');
      mockTypes.push(inferred);
    }

    const headerHeight = 44;
    const rowHeight = 36;
    const actionColumnWidth = hasActions
      ? Math.max(96, Math.min(180, actions.length * 26 + 28))
      : 0;
    const dataWidth = Math.max(20, pos.width - actionColumnWidth);
    const dataColWidth = dataWidth / safeColumns.length;

    // Generate mock rows based on mock types
    const mockRows: Record<string, string>[] = [];
    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
      const row: Record<string, string> = {};
      safeColumns.forEach((col, colIdx) => {
        const mockType =
          mockTypes[colIdx] || MockDataGenerator.inferMockTypeFromColumn(col) || 'item';
        row[col] = MockDataGenerator.getMockValue(mockType, rowIdx, random);
      });
      mockRows.push(row);
    }

    let svg = `<g${this.getDataNodeId(node)}>`;
    if (showOuterBorder || showOuterBackground) {
      const outerFill = showOuterBackground ? this.renderTheme.cardBg : 'none';
      const outerStroke = showOuterBorder ? this.renderTheme.border : 'none';
      svg += `
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          rx="8" 
          fill="${outerFill}" 
          stroke="${outerStroke}" 
          stroke-width="1"/>`;
    }

    // Title
    if (title) {
      svg += `
    <text x="${pos.x + 16}" y="${pos.y + 24}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="13" 
          font-weight="600" 
          fill="${this.renderTheme.text}">${this.escapeXml(title)}</text>`;
    }

    // Header row
    const headerY = pos.y + (title ? 32 : 0);
    if (showInnerBorder) {
      svg += `
    <line x1="${pos.x}" y1="${headerY + headerHeight}" x2="${pos.x + pos.width}" y2="${headerY + headerHeight}" 
          stroke="${this.renderTheme.border}" stroke-width="1"/>`;
    }

    safeColumns.forEach((col, i) => {
      svg += `
    <text x="${pos.x + i * dataColWidth + 12}" y="${headerY + 26}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="11" 
          font-weight="600" 
          fill="${this.renderTheme.textMuted}">${this.escapeXml(col)}</text>`;
    });

    if (hasActions && showInnerBorder) {
      const dividerX = pos.x + dataWidth;
      svg += `
    <line x1="${dividerX}" y1="${headerY + headerHeight}" x2="${dividerX}" y2="${headerY + headerHeight + mockRows.length * rowHeight}"
          stroke="${this.renderTheme.border}" stroke-width="1"/>`;
    }

    // Data rows (render all, don't restrict by height)
    mockRows.forEach((row, rowIdx) => {
      const rowY = headerY + headerHeight + rowIdx * rowHeight;

      // Row separator
      if (showInnerBorder) {
        svg += `
    <line x1="${pos.x}" y1="${rowY + rowHeight}" x2="${pos.x + pos.width}" y2="${rowY + rowHeight}" 
          stroke="${this.renderTheme.border}" stroke-width="0.5"/>`;
      }

      // Row data
      safeColumns.forEach((col, colIdx) => {
        const cellValue = row[col] || '';
        svg += `
    <text x="${pos.x + colIdx * dataColWidth + 12}" y="${rowY + 22}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="12" 
          fill="${this.renderTheme.text}">${this.escapeXml(cellValue)}</text>`;
      });

      if (hasActions) {
        const iconSize = 14;
        const buttonSize = 22;
        const buttonGap = 6;
        const actionsWidth = actions.length * buttonSize + Math.max(0, actions.length - 1) * buttonGap;
        let currentX = pos.x + pos.width - 12 - actionsWidth;
        const buttonY = rowY + (rowHeight - buttonSize) / 2;
        actions.forEach((actionIcon) => {
          const iconSvg = getIcon(actionIcon);
          const iconX = currentX + (buttonSize - iconSize) / 2;
          const iconY = buttonY + (buttonSize - iconSize) / 2;
          svg += `
    <rect x="${currentX}" y="${buttonY}" width="${buttonSize}" height="${buttonSize}" rx="4"
          fill="${this.renderTheme.cardBg}" stroke="${showInnerBorder ? this.renderTheme.border : 'none'}" stroke-width="1"/>`;
          if (iconSvg) {
            svg += `
    <g transform="translate(${iconX}, ${iconY})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${this.hexToRgba(this.resolveTextColor(), 0.75)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(iconSvg)}
      </svg>
    </g>`;
          }
          currentX += buttonSize + buttonGap;
        });
      }
    });

    const footerTop = headerY + headerHeight + mockRows.length * rowHeight + 16;

    // Render pagination if enabled.
    if (pagination) {
      const paginationY = sameFooterAlign ? footerTop + 18 + 8 : footerTop;
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
      const previousIcon = getIcon('chevron-left');
      svg += `
    <rect x="${startX}" y="${paginationY}" 
          width="${buttonWidth}" height="${buttonHeight}" 
          rx="4" 
          fill="${this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>`;
      if (previousIcon) {
        const iconSize = 14;
        const iconX = startX + (buttonWidth - iconSize) / 2;
        const iconY = paginationY + (buttonHeight - iconSize) / 2;
        svg += `
    <g transform="translate(${iconX}, ${iconY})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${this.resolveTextColor()}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(previousIcon)}
      </svg>
    </g>`;
      }

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
          font-family="Arial, Helvetica, sans-serif" 
          font-size="14" 
          fill="${textColor}" 
          text-anchor="middle">${i}</text>`;
      }

      // Next button
      const nextX = startX + (buttonWidth + gap) * (pageCount + 1);
      const nextIcon = getIcon('chevron-right');
      svg += `
    <rect x="${nextX}" y="${paginationY}" 
          width="${buttonWidth}" height="${buttonHeight}" 
          rx="4" 
          fill="${this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>`;
      if (nextIcon) {
        const iconSize = 14;
        const iconX = nextX + (buttonWidth - iconSize) / 2;
        const iconY = paginationY + (buttonHeight - iconSize) / 2;
        svg += `
    <g transform="translate(${iconX}, ${iconY})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${this.resolveTextColor()}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(nextIcon)}
      </svg>
    </g>`;
      }
    }

    if (hasCaption) {
      const captionY = sameFooterAlign ? footerTop + 12 : footerTop + (pagination ? 21 : 12);
      let captionX = pos.x + 16;
      let textAnchor: 'start' | 'middle' | 'end' = 'start';
      if (captionAlign === 'center') {
        captionX = pos.x + pos.width / 2;
        textAnchor = 'middle';
      } else if (captionAlign === 'right') {
        captionX = pos.x + pos.width - 16;
        textAnchor = 'end';
      }
      svg += `
    <text x="${captionX}" y="${captionY}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="12" 
          fill="${this.hexToRgba(this.resolveTextColor(), 0.75)}"
          text-anchor="${textAnchor}">${this.escapeXml(caption)}</text>`;
    }

    svg += '\n  </g>';
    return svg;
  }

  protected renderChartPlaceholder(node: IRComponentNode, pos: any): string {
    const type = String(node.props.type || 'bar').toLowerCase();
    const chartHeight = Number(node.props.height);
    const chartColor = this.resolveChartColor();
    const resolvedHeight = !isNaN(chartHeight) && chartHeight > 0 ? chartHeight : pos.height;
    const frameHeight = Math.min(pos.height, resolvedHeight);
    const frameY = pos.y + Math.max(0, (pos.height - frameHeight) / 2);
    const innerPadding = 16;
    const innerX = pos.x + innerPadding;
    const innerY = frameY + innerPadding;
    const innerWidth = Math.max(20, pos.width - innerPadding * 2);
    const innerHeight = Math.max(20, frameHeight - innerPadding * 2);

    let svg = `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${frameY}" 
          width="${pos.width}" height="${frameHeight}" 
          rx="8" 
          fill="${this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>`;

    if (type === 'pie') {
      const radius = Math.max(24, Math.min(innerWidth, innerHeight) / 2 - 4);
      const cx = innerX + innerWidth / 2;
      const cy = innerY + innerHeight / 2;
      const parts = [0.18, 0.24, 0.27, 0.31];
      const colors = [
        this.hexToRgba(this.renderTheme.primary, 0.9),
        this.hexToRgba('#10B981', 0.9),
        this.hexToRgba('#F59E0B', 0.9),
        this.hexToRgba('#8B5CF6', 0.9),
      ];

      let startAngle = -Math.PI / 2;
      parts.forEach((part, index) => {
        const endAngle = startAngle + part * Math.PI * 2;
        const x1 = cx + radius * Math.cos(startAngle);
        const y1 = cy + radius * Math.sin(startAngle);
        const x2 = cx + radius * Math.cos(endAngle);
        const y2 = cy + radius * Math.sin(endAngle);
        const largeArc = part > 0.5 ? 1 : 0;
        svg += `
    <path d="M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z"
          fill="${colors[index % colors.length]}"
          stroke="${this.renderTheme.cardBg}"
          stroke-width="1"/>`;
        startAngle = endAngle;
      });
    } else if (type === 'line' || type === 'area') {
      const pointCount = Math.max(4, Math.min(7, Math.floor(innerWidth / 56)));
      const stepX = pointCount > 1 ? innerWidth / (pointCount - 1) : innerWidth;
      const values = this.generateUpwardTrendValues(pointCount, 0.18, 0.88);
      const pointsArray = values.map((value, i) => {
        const x = innerX + i * stepX;
        const y = innerY + innerHeight - value * innerHeight;
        return { x, y };
      });
      const points = values
        .map((value, i) => {
          const x = innerX + i * stepX;
          const y = innerY + innerHeight - value * innerHeight;
          return `${x},${y}`;
        })
        .join(' ');
      const lastY = innerY + innerHeight;

      svg += `
    <line x1="${innerX}" y1="${lastY}" x2="${innerX + innerWidth}" y2="${lastY}"
          stroke="${this.renderTheme.border}" stroke-width="1"/>`;

      if (type === 'area' && pointsArray.length > 1) {
        const areaPath = [
          `M ${pointsArray[0].x} ${lastY}`,
          ...pointsArray.map((p) => `L ${p.x} ${p.y}`),
          `L ${pointsArray[pointsArray.length - 1].x} ${lastY}`,
          'Z',
        ].join(' ');
        svg += `
    <path d="${areaPath}"
          fill="${this.hexToRgba(chartColor, 0.18)}"
          stroke="none"/>`;
      }

      svg += `
    <polyline points="${points}"
          fill="none"
          stroke="${chartColor}"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"/>`;
    } else {
      // Default and "bar": ascending bars.
      const barCount = Math.max(4, Math.min(8, Math.floor(innerWidth / 42)));
      const slotWidth = innerWidth / barCount;
      const barWidth = Math.max(8, slotWidth * 0.62);
      const values = this.generateUpwardTrendValues(barCount, 0.16, 0.86);
      const baseY = innerY + innerHeight;

      svg += `
    <line x1="${innerX}" y1="${baseY}" x2="${innerX + innerWidth}" y2="${baseY}"
          stroke="${this.renderTheme.border}" stroke-width="1"/>`;

      values.forEach((value, i) => {
        const height = Math.max(6, value * innerHeight);
        const barX = innerX + i * slotWidth + (slotWidth - barWidth) / 2;
        const barY = baseY - height;
        svg += `
    <rect x="${barX}" y="${barY}"
          width="${barWidth}" height="${height}"
          rx="3"
          fill="${this.hexToRgba(chartColor, 0.82)}"/>`;
      });
    }

    svg += `
  </g>`;
    return svg;
  }

  // ============================================================================
  // TEXT/CONTENT COMPONENTS
  // ============================================================================

  protected renderText(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || 'Text content');

    // Use tokens from density configuration
    const fontSize = this.tokens.text.fontSize;
    const lineHeightPx = Math.ceil(fontSize * this.tokens.text.lineHeight);
    const lines = this.wrapTextToLines(text, pos.width, fontSize);
    // Center lines vertically within the bounding box. When the text fills the
    // box (multi-line), (pos.height - totalTextHeight) ≈ 0, so this is a no-op.
    // For single-line text, this aligns the baseline with adjacent controls
    // (Input, Button) that also center their text within the control height.
    const totalTextHeight = lines.length * lineHeightPx;
    const firstLineY = pos.y + Math.round(Math.max(0, (pos.height - totalTextHeight) / 2)) + fontSize;
    const tspans = lines
      .map(
        (line, index) =>
          `<tspan x="${pos.x}" dy="${index === 0 ? 0 : lineHeightPx}">${this.escapeXml(line)}</tspan>`
      )
      .join('');

    return `<g${this.getDataNodeId(node)}>
    <text x="${pos.x}" y="${firstLineY}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}"
          fill="${this.renderTheme.text}">${tspans}</text>
  </g>`;
  }

  protected renderLabel(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || 'Label');
    // Vertically center the text within the bounding box so that Label aligns
    // with Input / Button text when used in a horizontal stack row.
    // Formula matches Input placeholder: controlHeight / 2 + ~5 (font baseline offset).
    const textY = pos.y + Math.round(pos.height / 2) + 4;

    return `<g${this.getDataNodeId(node)}>
    <text x="${pos.x}" y="${textY}" 
          font-family="Arial, Helvetica, sans-serif" 
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
    const fontSize = this.tokens.input.fontSize;
    const paddingX = this.tokens.input.paddingX;
    const labelOffset = this.getControlLabelOffset(label);
    const controlY = pos.y + labelOffset;
    const controlHeight = Math.max(20, pos.height - labelOffset);
    const placeholderY = controlY + fontSize + 6;

    return `<g${this.getDataNodeId(node)}>
    ${
      label
        ? `<text x="${pos.x}" y="${this.getControlLabelBaselineY(pos.y)}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="12" 
          fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>`
        : ''
    }
    <rect x="${pos.x}" y="${controlY}" 
          width="${pos.width}" height="${controlHeight}" 
          rx="6" 
          fill="${this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
    <text x="${pos.x + paddingX}" y="${placeholderY}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="${fontSize}" 
          fill="${this.renderTheme.textMuted}">${this.escapeXml(placeholder)}</text>
  </g>`;
  }

  protected renderSelect(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || '');
    const placeholder = String(node.props.placeholder || 'Select...');
    const iconLeftName = String(node.props.iconLeft || '').trim();
    const iconRightName = String(node.props.iconRight || '').trim();
    const disabled = this.parseBooleanProp(node.props.disabled, false);
    const labelOffset = this.getControlLabelOffset(label);
    const controlY = pos.y + labelOffset;
    const controlHeight = Math.max(16, pos.height - labelOffset);
    const centerY = controlY + controlHeight / 2 + 5;

    const iconSize = 16;
    const iconPad = 12;  // breathing room between icon and box border
    const iconInnerGap = 8; // gap between icon and text
    const iconLeftSvg = iconLeftName ? getIcon(iconLeftName) : null;
    const iconRightSvg = iconRightName ? getIcon(iconRightName) : null;
    const leftOffset = iconLeftSvg ? iconPad + iconSize + iconInnerGap : 0;
    const chevronWidth = 20;
    const iconColor = this.hexToRgba(this.resolveMutedColor(), 0.8);
    const iconCenterY = controlY + (controlHeight - iconSize) / 2;

    let svg = `<g${this.getDataNodeId(node)}${disabled ? ' opacity="0.45"' : ''}>`;
    if (label) {
      svg += `
    <text x="${pos.x}" y="${this.getControlLabelBaselineY(pos.y)}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="12"
          fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>`;
    }
    svg += `
    <rect x="${pos.x}" y="${controlY}"
          width="${pos.width}" height="${controlHeight}"
          rx="6"
          fill="${this.renderTheme.cardBg}"
          stroke="${this.renderTheme.border}"
          stroke-width="1"/>`;
    if (iconLeftSvg) {
      svg += `
    <g transform="translate(${pos.x + iconPad}, ${iconCenterY})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(iconLeftSvg)}
      </svg>
    </g>`;
    }
    if (iconRightSvg) {
      svg += `
    <g transform="translate(${pos.x + pos.width - chevronWidth - iconPad - iconSize}, ${iconCenterY})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(iconRightSvg)}
      </svg>
    </g>`;
    }
    const textX = pos.x + (iconLeftSvg ? leftOffset : 12);
    const availPlaceholderWidth = pos.width - (iconLeftSvg ? leftOffset : 12) - chevronWidth - (iconRightSvg ? iconPad + iconSize + iconInnerGap : 0);
    const visiblePlaceholder = this.truncateTextToWidth(placeholder, Math.max(0, availPlaceholderWidth), 14);
    svg += `
    <text x="${textX}" y="${centerY}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="14"
          fill="${this.renderTheme.textMuted}">${this.escapeXml(visiblePlaceholder)}</text>
    <text x="${pos.x + pos.width - 20}" y="${centerY}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="16"
          fill="${this.renderTheme.textMuted}">▼</text>
  </g>`;
    return svg;
  }

  protected renderCheckbox(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || 'Checkbox');
    const checked = String(node.props.checked || 'false').toLowerCase() === 'true';
    const disabled = this.parseBooleanProp(node.props.disabled, false);
    const controlColor = this.resolveControlColor();

    const checkboxSize = 18;
    const checkboxY = pos.y + pos.height / 2 - checkboxSize / 2;

    return `<g${this.getDataNodeId(node)}${disabled ? ' opacity="0.45"' : ''}>
    <rect x="${pos.x}" y="${checkboxY}" 
          width="${checkboxSize}" height="${checkboxSize}" 
          rx="4" 
          fill="${checked ? controlColor : this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
    ${
      checked
        ? `<text x="${pos.x + checkboxSize / 2}" y="${checkboxY + 14}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="12" 
          fill="white" 
          text-anchor="middle">✓</text>`
        : ''
    }
    <text x="${pos.x + checkboxSize + 12}" y="${pos.y + pos.height / 2 + 5}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="14" 
          fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>
  </g>`;
  }

  protected renderRadio(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || 'Radio');
    const checked = String(node.props.checked || 'false').toLowerCase() === 'true';
    const disabled = this.parseBooleanProp(node.props.disabled, false);
    const controlColor = this.resolveControlColor();

    const radioSize = 16;
    const radioY = pos.y + pos.height / 2 - radioSize / 2;

    return `<g${this.getDataNodeId(node)}${disabled ? ' opacity="0.45"' : ''}>
    <circle cx="${pos.x + radioSize / 2}" cy="${radioY + radioSize / 2}" 
            r="${radioSize / 2}" 
            fill="${this.renderTheme.cardBg}" 
            stroke="${this.renderTheme.border}" 
            stroke-width="1"/>
    ${
      checked
        ? `<circle cx="${pos.x + radioSize / 2}" cy="${radioY + radioSize / 2}" 
            r="${radioSize / 3.5}" 
            fill="${controlColor}"/>`
        : ''
    }
    <text x="${pos.x + radioSize + 12}" y="${pos.y + pos.height / 2 + 5}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="14" 
          fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>
  </g>`;
  }

  protected renderToggle(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || 'Toggle');
    const enabled = String(node.props.enabled || 'false').toLowerCase() === 'true';
    const disabled = this.parseBooleanProp(node.props.disabled, false);
    const controlColor = this.resolveControlColor();

    const toggleWidth = 40;
    const toggleHeight = 20;
    const toggleY = pos.y + pos.height / 2 - toggleHeight / 2;

    return `<g${this.getDataNodeId(node)}${disabled ? ' opacity="0.45"' : ''}>
    <rect x="${pos.x}" y="${toggleY}" 
          width="${toggleWidth}" height="${toggleHeight}" 
          rx="10" 
          fill="${enabled ? controlColor : this.renderTheme.border}" 
          stroke="none"/>
    <circle cx="${pos.x + (enabled ? toggleWidth - 10 : 10)}" cy="${toggleY + toggleHeight / 2}" 
            r="8" 
            fill="white"/>
    <text x="${pos.x + toggleWidth + 12}" y="${pos.y + pos.height / 2 + 5}" 
          font-family="Arial, Helvetica, sans-serif" 
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
          font-family="Arial, Helvetica, sans-serif" 
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
          font-family="Arial, Helvetica, sans-serif" 
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
    const activeProp = node.props.active ?? 0;
    const activeIndex = Number.isFinite(Number(activeProp))
      ? Math.max(0, Math.floor(Number(activeProp)))
      : 0;
    const accentColor = this.resolveAccentColor();
    const tabWidth = pos.width / tabs.length;

    let svg = `<g${this.getDataNodeId(node)}>
    <!-- Tab headers -->`;

    tabs.forEach((tab, i) => {
      const tabX = pos.x + i * tabWidth;
      const isActive = i === activeIndex;

      svg += `
    <rect x="${tabX}" y="${pos.y}" 
          width="${tabWidth}" height="44" 
          fill="${isActive ? accentColor : 'transparent'}" 
          stroke="${isActive ? 'none' : this.renderTheme.border}" 
          stroke-width="1"/>
    <text x="${tabX + tabWidth / 2}" y="${pos.y + 28}" 
          font-family="Arial, Helvetica, sans-serif" 
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

  protected renderSeparate(node: IRComponentNode, _pos: any): string {
    // Spacer component: intentionally renders no visible shape.
    return `<g${this.getDataNodeId(node)}></g>`;
  }

  // ============================================================================
  // FEEDBACK/ALERT COMPONENTS
  // ============================================================================

  protected renderAlert(node: IRComponentNode, pos: any): string {
    const variant = String(node.props.variant || 'info');
    const title = String(node.props.title || '');
    const text = String(node.props.text || 'Alert message');
    const bgColor = this.resolveVariantColor(variant, this.getSemanticVariantColor(variant) || '#3B82F6');
    const hasTitle = title.trim().length > 0;
    const fontSize = 13;
    const titleLineHeight = Math.ceil(fontSize * 1.25);
    const textLineHeight = Math.ceil(fontSize * 1.4);
    const contentX = pos.x + 16;
    const contentWidth = Math.max(20, pos.width - 24);
    const titleLines = hasTitle ? this.wrapTextToLines(title, contentWidth, fontSize) : [];
    const textLines = this.wrapTextToLines(text, contentWidth, fontSize);
    const titleStartY = pos.y + 12 + fontSize;
    const textStartY = titleStartY + titleLines.length * titleLineHeight + (hasTitle ? 6 : 0);
    const titleTspans = titleLines
      .map(
        (line, index) =>
          `<tspan x="${contentX}" dy="${index === 0 ? 0 : titleLineHeight}">${this.escapeXml(line)}</tspan>`
      )
      .join('');
    const textTspans = textLines
      .map(
        (line, index) =>
          `<tspan x="${contentX}" dy="${index === 0 ? 0 : textLineHeight}">${this.escapeXml(line)}</tspan>`
      )
      .join('');

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
    ${
      hasTitle
        ? `<text x="${contentX}" y="${titleStartY}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="${fontSize}" 
          font-weight="700"
          fill="${bgColor}">${titleTspans}</text>`
        : ''
    }
    <text x="${contentX}" y="${textStartY}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="${fontSize}" 
          fill="${bgColor}">${textTspans}</text>
  </g>`;
  }

  protected renderBadge(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || 'Badge');
    const variant = String(node.props.variant || 'default');
    const semanticBase = this.getSemanticVariantColor(variant);
    const hasExplicitVariantColor =
      semanticBase !== undefined || this.colorResolver.hasColor(variant);
    const bgColor = hasExplicitVariantColor
      ? this.resolveVariantColor(variant, this.renderTheme.primary)
      : this.renderTheme.border;
    const textColor = hasExplicitVariantColor ? 'white' : this.renderTheme.text;

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
          font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}"
          font-weight="600"
          fill="${textColor}"
          text-anchor="middle">${this.escapeXml(text)}</text>
  </g>`;
  }

  protected renderModal(node: IRComponentNode, pos: any): string {
    const visible = this.parseBooleanProp(node.props.visible, true);
    if (!visible) {
      return '';
    }

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
          font-family="Arial, Helvetica, sans-serif" 
          font-size="16" 
          font-weight="600" 
          fill="${this.renderTheme.text}">${this.escapeXml(title)}</text>
    
    <!-- Close button -->
      <text x="${modalX + pos.width - 16}" y="${modalY + padding + 12}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="18" 
          fill="${this.renderTheme.textMuted}">✕</text>
    
    <!-- Content placeholder -->
      <text x="${modalX + pos.width / 2}" y="${modalY + headerHeight + (pos.height - headerHeight) / 2}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="13" 
          fill="${this.renderTheme.textMuted}" 
          text-anchor="middle">Modal content</text>
  </g>`;
  }

  protected renderList(node: IRComponentNode, pos: any): string {
    const title = String(node.props.title || '');
    const itemsStr = String(node.props.items || '');
    const mockType = String(node.props.mock || '').trim();
    const random = this.parseBooleanProp(node.props.random, false);

    let items: string[] = [];
    if (itemsStr) {
      items = itemsStr
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);
    } else {
      // Generate mock items from provided mock type or fallback to deterministic names.
      const parsedItemsMock = Number(node.props.itemsMock ?? 4);
      const itemCount = Number.isFinite(parsedItemsMock)
        ? Math.max(0, Math.floor(parsedItemsMock))
        : 4;
      const resolvedMockType = mockType || 'name';
      items = MockDataGenerator.generateMockList(resolvedMockType, itemCount, random);
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
          font-family="Arial, Helvetica, sans-serif" 
          font-size="13" 
          font-weight="600" 
          fill="${this.renderTheme.text}">${this.escapeXml(title)}</text>
    <line x1="${pos.x}" y1="${pos.y + titleHeight}" x2="${pos.x + pos.width}" y2="${pos.y + titleHeight}" 
          stroke="${this.renderTheme.border}" stroke-width="1"/>`;
    }

    // Items
    items.forEach((item, i) => {
      const itemY = pos.y + titleHeight + i * itemHeight;
      if (itemY + itemHeight <= pos.y + pos.height) {
        svg += `
    <line x1="${pos.x}" y1="${itemY + itemHeight}" 
          x2="${pos.x + pos.width}" y2="${itemY + itemHeight}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="0.5"/>
    <text x="${pos.x + padding}" y="${itemY + 24}" 
          font-family="Arial, Helvetica, sans-serif" 
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
          font-family="Arial, Helvetica, sans-serif" 
          font-size="12" 
          fill="${this.renderTheme.textMuted}" 
          text-anchor="middle">${node.componentType}</text>
  </g>`;
  }

  protected renderStat(node: IRComponentNode, pos: any): string {
    const title = String(node.props.title || 'Metric');
    const value = String(node.props.value || '0');
    const rawCaption = String(node.props.caption || '');
    const caption = rawCaption.replace(/\r\n/g, '\n').split('\n')[0] || '';
    const hasCaption = caption.trim().length > 0;
    const iconName = String(node.props.icon || '').trim();
    const iconSvg = iconName ? getIcon(iconName) : null;
    const variant = String(node.props.variant || 'default');
    const baseAccent = this.resolveAccentColor();
    const accentColor = variant !== 'default'
      ? this.resolveVariantColor(variant, baseAccent)
      : baseAccent;

    const padding = this.resolveSpacing(node.style.padding) || 16;
    const innerX = pos.x + padding;
    const innerY = pos.y + padding;
    const innerWidth = pos.width - padding * 2;

    // Stat layout: vertically center title/value/caption block (icon stays fixed).
    const valueSize = 32;
    const titleSize = 14;
    const captionSize = 12;
    const valueGap = 10;
    const captionGap = 8;
    const contentHeight =
      titleSize +
      valueGap +
      valueSize +
      (hasCaption ? captionGap + captionSize : 0);
    const contentAreaHeight = Math.max(0, pos.height - padding * 2);
    const contentStartY = innerY + Math.max(0, (contentAreaHeight - contentHeight) / 2);
    const titleY = contentStartY + titleSize;
    const valueY = titleY + valueGap + valueSize;
    const captionY = valueY + captionGap + captionSize;
    const iconSize = 16;
    const iconBadgeSize = 28;
    const iconBadgeX = pos.x + pos.width - padding - iconBadgeSize;
    const iconBadgeY = pos.y + padding;
    const titleMaxWidth = iconSvg ? Math.max(40, innerWidth - iconBadgeSize - 8) : innerWidth;
    const visibleTitle = this.truncateTextToWidth(title, titleMaxWidth, titleSize);
    const visibleCaption = hasCaption
      ? this.truncateTextToWidth(caption, Math.max(20, innerWidth), captionSize)
      : '';

    let svg = `<g${this.getDataNodeId(node)}>
    <!-- Stat Background -->
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          rx="8" 
          fill="${this.renderTheme.cardBg}" 
          stroke="${this.renderTheme.border}" 
          stroke-width="1"/>
    
    <!-- Title -->
    <text x="${innerX}" y="${titleY}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="${titleSize}" 
          font-weight="500" 
          fill="${this.renderTheme.textMuted}">${this.escapeXml(visibleTitle)}</text>
    
    <!-- Value (Large) -->
    <text x="${innerX}" y="${valueY}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="${valueSize}" 
          font-weight="700" 
          fill="${accentColor}">${this.escapeXml(value)}</text>`;

    if (iconSvg) {
      svg += `
    <!-- Icon -->
    <rect x="${iconBadgeX}" y="${iconBadgeY}"
          width="${iconBadgeSize}" height="${iconBadgeSize}"
          rx="6"
          fill="${this.hexToRgba(accentColor, 0.12)}"
          stroke="${this.hexToRgba(accentColor, 0.35)}"
          stroke-width="1"/>
    <g transform="translate(${iconBadgeX + (iconBadgeSize - iconSize) / 2}, ${iconBadgeY + (iconBadgeSize - iconSize) / 2})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(iconSvg)}
      </svg>
    </g>`;
    }

    if (hasCaption) {
      svg += `
    <!-- Caption -->
    <text x="${innerX}" y="${captionY}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="${captionSize}" 
          fill="${this.renderTheme.textMuted}">${this.escapeXml(visibleCaption)}</text>`;
    }

    svg += `
  </g>`;
    return svg;
  }

  protected renderImage(node: IRComponentNode, pos: any): string {
    const placeholder = String(node.props.placeholder || 'landscape').toLowerCase();
    const placeholderIcon = String(node.props.icon || '').trim();
    const variant = String(node.props.variant || '').trim();
    const placeholderIconSvg =
      placeholder === 'icon' && placeholderIcon ? getIcon(placeholderIcon) : null;

    // Theme-aware image background
    const imageBg = this.options.theme === 'dark' ? '#2A2A2A' : '#E8E8E8';

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
    const maxSize = Math.min(pos.width, pos.height) * 0.8;
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

    // Custom icon placeholder for "icon" variant when icon prop is provided.
    // No inner badge rect — icon fills the available space directly.
    if (placeholder === 'icon' && placeholderIconSvg) {
      const semanticBase = variant ? this.getSemanticVariantColor(variant) : undefined;
      const hasVariant = variant.length > 0 && (semanticBase !== undefined || this.colorResolver.hasColor(variant));
      const variantColor = hasVariant ? this.resolveVariantColor(variant, this.renderTheme.primary) : null;

      const bgColor = hasVariant ? this.hexToRgba(variantColor!, 0.12) : imageBg;
      const iconColor = hasVariant ? variantColor! : (this.options.theme === 'dark' ? '#888888' : '#666666');
      const iconSize = Math.max(16, Math.min(pos.width, pos.height) * 0.6);
      const iconOffsetX = pos.x + (pos.width - iconSize) / 2;
      const iconOffsetY = pos.y + (pos.height - iconSize) / 2;

      return `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}" fill="${bgColor}" rx="4"/>
    <g transform="translate(${iconOffsetX}, ${iconOffsetY})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(placeholderIconSvg)}
      </svg>
    </g>
    <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}" fill="none" stroke="${this.renderTheme.border}" stroke-width="1" rx="4"/>
  </g>`;
    }

    // Background
    let svg = `<g${this.getDataNodeId(node)}>
    <!-- Image Background -->
    <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}" fill="${imageBg}"/>`;

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
    // Person silhouette for avatar and icon fallback
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
          font-family="Arial, Helvetica, sans-serif" 
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
          font-family="Arial, Helvetica, sans-serif" 
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
    const accentColor = this.resolveAccentColor();

    // variant prop overrides the active color (accent is fallback)
    const variantProp = String(node.props.variant || '').trim();
    const semanticVariant = variantProp ? this.getSemanticVariantColor(variantProp) : undefined;
    const hasVariant = variantProp.length > 0 && (semanticVariant !== undefined || this.colorResolver.hasColor(variantProp));
    const activeColor = hasVariant ? this.resolveVariantColor(variantProp, accentColor) : accentColor;

    let svg = `<g${this.getDataNodeId(node)}>`;

    items.forEach((item, index) => {
      const itemY = pos.y + index * itemHeight;
      const isActive = index === activeIndex;
      const bgColor = isActive ? this.hexToRgba(activeColor, 0.15) : 'transparent';
      const textColor = isActive
        ? this.hexToRgba(activeColor, 0.9)
        : this.hexToRgba(this.resolveTextColor(), 0.75);
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
          const iconColor = isActive
            ? this.hexToRgba(activeColor, 0.9)
            : this.hexToRgba(this.resolveMutedColor(), 0.9);
          svg += `
    <g transform="translate(${currentX}, ${iconY})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(iconSvg)}
      </svg>
    </g>`;
          currentX += iconSize + 8;
        }
      }

      // Item text
      svg += `
    <text x="${currentX}" y="${itemY + itemHeight / 2 + 5}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}"
          font-weight="${fontWeight}"
          fill="${textColor}">${this.escapeXml(item)}</text>`;
    });

    svg += '\n  </g>';
    return svg;
  }

  protected renderIcon(node: IRComponentNode, pos: any): string {
    const iconType = String(node.props.icon || 'help-circle');
    const size = String(node.props.size || 'md');
    const variant = String(node.props.variant || 'default');
    const iconSvg = getIcon(iconType);
    const iconColor =
      variant === 'default'
        ? this.hexToRgba(this.resolveTextColor(), 0.75)
        : this.resolveVariantColor(variant, this.resolveTextColor());

    if (!iconSvg) {
      // Fallback: render a placeholder with question mark
      return `<g${this.getDataNodeId(node)}>
    <!-- Icon not found: ${iconType} -->
    <circle cx="${pos.x + pos.width / 2}" cy="${pos.y + pos.height / 2}" r="${Math.min(pos.width, pos.height) / 2 - 2}" fill="none" stroke="${this.hexToRgba(this.resolveMutedColor(), 0.4)}" stroke-width="1"/>
    <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 4}" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="${this.hexToRgba(this.resolveMutedColor(), 0.7)}" text-anchor="middle">?</text>
  </g>`;
    }

    const iconSize = this.getIconSize(size);
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
    const density = (this.ir.project.style.density || 'normal') as DensityLevel;
    const labelOffset = this.parseBooleanProp(node.props.labelSpace, false) ? 18 : 0;
    const extraPadding = resolveControlHorizontalPadding(String(node.props.padding || 'none'), density);

    const semanticBase = this.getSemanticVariantColor(variant);
    const hasExplicitVariantColor =
      semanticBase !== undefined || this.colorResolver.hasColor(variant);
    const resolvedBase = this.resolveVariantColor(variant, this.renderTheme.primary);
    const isDarkMode = this.options.theme === 'dark';
    const bgColor = hasExplicitVariantColor
      ? this.hexToRgba(resolvedBase, 0.85)
      : (isDarkMode ? 'rgba(48, 48, 55, 0.9)' : 'rgba(226, 232, 240, 0.9)');
    const iconColor = hasExplicitVariantColor
      ? '#FFFFFF'
      : this.hexToRgba(this.resolveTextColor(), 0.75);
    const borderColor = hasExplicitVariantColor
      ? this.hexToRgba(resolvedBase, 0.7)
      : (isDarkMode ? 'rgba(75, 75, 88, 0.8)' : 'rgba(100, 116, 139, 0.4)');

    const opacity = disabled ? '0.5' : '1';
    const iconSvg = getIcon(iconName);

    const buttonSize = Math.max(
      16,
      Math.min(resolveActionControlHeight(size, density), pos.height - labelOffset)
    );
    const buttonWidth = buttonSize + extraPadding * 2;
    const radius = 6;
    const buttonY = pos.y + labelOffset;

    let svg = `<g${this.getDataNodeId(node)} opacity="${opacity}">
    <!-- IconButton background -->
    <rect x="${pos.x}" y="${buttonY}" width="${buttonWidth}" height="${buttonSize}" rx="${radius}" fill="${bgColor}" stroke="${borderColor}" stroke-width="1"/>`;

    // Icon inside button
    if (iconSvg) {
      const iconSize = buttonSize * 0.6;
      const offsetX = pos.x + (buttonWidth - iconSize) / 2;
      const offsetY = buttonY + (buttonSize - iconSize) / 2;

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

  protected resolveVariantColor(variant: string, fallback: string): string {
    const semanticFallback = this.getSemanticVariantColor(variant) || fallback;
    return this.colorResolver.resolveColor(variant, semanticFallback);
  }

  protected resolveAccentColor(): string {
    return this.colorResolver.resolveColor('accent', this.renderTheme.primary);
  }

  protected resolveControlColor(): string {
    return this.colorResolver.resolveColor('control', this.renderTheme.primary);
  }

  protected resolveChartColor(): string {
    return this.colorResolver.resolveColor('chart', this.renderTheme.primary);
  }

  protected resolveTextColor(): string {
    const fallback = this.options.theme === 'dark' ? '#FFFFFF' : '#000000';
    return this.colorResolver.resolveColor('text', fallback);
  }

  protected resolveMutedColor(): string {
    const fallback = this.options.theme === 'dark' ? '#94A3B8' : '#64748B';
    return this.colorResolver.resolveColor('muted', fallback);
  }

  protected getSemanticVariantColor(variant: string): string | undefined {
    const isDark = this.options.theme === 'dark';
    const semantic: Record<string, string> = isDark
      ? {
          // Muted mid-range — readable on #111111 without being neon
          primary: this.renderTheme.primary, // already theme-aware (#60A5FA)
          secondary: '#7E8EA2',              // desaturated slate
          success: '#22A06B',                // muted emerald
          warning: '#B38010',                // deep amber
          danger: '#CC4444',                 // muted red
          error: '#CC4444',
          info: '#2485AF',                   // muted sky
        }
      : {
          // Tailwind 500-level — works on white/light backgrounds
          primary: this.renderTheme.primary, // #3B82F6
          secondary: '#64748B',              // Slate 500
          success: '#10B981',                // Emerald 500
          warning: '#F59E0B',                // Amber 500
          danger: '#EF4444',                 // Red 500
          error: '#EF4444',
          info: '#0EA5E9',                   // Sky 500
        };
    return semantic[variant];
  }

  protected hexToRgba(hex: string, alpha: number): string {
    const match = /^#([0-9A-Fa-f]{6})$/.exec(hex);
    if (!match) return hex;
    const r = parseInt(match[1].slice(0, 2), 16);
    const g = parseInt(match[1].slice(2, 4), 16);
    const b = parseInt(match[1].slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  protected getIconSize(size?: string): number {
    return resolveIconSize(size, (this.ir.project.style.density || 'normal') as DensityLevel);
  }

  protected getIconButtonSize(size?: string): number {
    return resolveIconButtonSize(size, (this.ir.project.style.density || 'normal') as DensityLevel);
  }

  protected resolveSpacing(spacing?: string): number {
    return resolveSpacingToken(
      spacing,
      this.ir.project.style.spacing || 'md',
      (this.ir.project.style.density || 'normal') as DensityLevel,
      true
    );
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

  protected clampControlWidth(idealWidth: number, availableWidth: number): number {
    const safeAvailable = Math.max(1, availableWidth || 0);
    return Math.max(1, Math.min(idealWidth, safeAvailable));
  }

  protected truncateTextToWidth(text: string, maxWidth: number, fontSize: number): string {
    const epsilon = 0.01;
    if (maxWidth <= 0) return '';
    if (this.estimateTextWidth(text, fontSize) <= maxWidth + epsilon) return text;

    const ellipsis = '...';
    const ellipsisWidth = this.estimateTextWidth(ellipsis, fontSize);
    if (ellipsisWidth >= maxWidth - epsilon) return '.';

    let result = '';
    for (const char of text) {
      const next = `${result}${char}`;
      if (this.estimateTextWidth(next, fontSize) + ellipsisWidth > maxWidth + epsilon) break;
      result = next;
    }
    return `${result}${ellipsis}`;
  }

  protected estimateTextWidth(text: string, fontSize: number): number {
    let width = 0;
    for (const ch of text) {
      if (/\s/.test(ch)) {
        width += fontSize * 0.33;
      } else if (/[.,:;'"`|!iIl]/.test(ch)) {
        width += fontSize * 0.32;
      } else if (/[MW@#%&]/.test(ch)) {
        width += fontSize * 0.9;
      } else {
        width += fontSize * 0.6;
      }
    }
    return width;
  }

  protected generateUpwardTrendValues(count: number, start: number, end: number): number[] {
    if (count <= 0) return [];
    if (count === 1) return [end];

    const span = end - start;
    const pulses = [0, 0.14, -0.09, 0.11, -0.06, 0.08, -0.05];
    const values = Array.from({ length: count }, (_, i) => {
      const progress = i / (count - 1);
      const base = start + span * Math.pow(progress, 0.92);
      const waveA = Math.sin((i + 1) * 1.19) * 0.08;
      const waveB = Math.cos((i + 2) * 0.77) * 0.05;
      const pulse = pulses[i % pulses.length];
      const edgeDamping = i === 0 || i === count - 1 ? 0 : i === 1 || i === count - 2 ? 0.72 : 1;
      const volatility = (waveA + waveB + pulse) * edgeDamping;
      return Math.min(0.95, Math.max(0.08, base + volatility));
    });

    values[0] = start;
    values[values.length - 1] = end;
    return values;
  }

  protected getControlLabelOffset(label: string): number {
    return label.trim().length > 0 ? 18 : 0;
  }

  protected getControlLabelBaselineY(y: number): number {
    return y + 12;
  }

  protected getHeadingTypography(
    node: IRComponentNode
  ): { fontSize: number; fontWeight: number; lineHeight: number } {
    const typography = resolveHeadingTypography(
      this.tokens.heading.fontSize,
      this.tokens.heading.fontWeight,
      node.props.level
    );
    return {
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
    };
  }

  protected getHeadingFirstLineY(
    node: IRComponentNode,
    pos: { y: number; height: number },
    fontSize: number,
    lineHeightPx: number,
    lineCount: number
  ): number {
    const headingPadding = resolveHeadingVerticalPadding(
      node.props.spacing,
      (this.ir.project.style.density || 'normal') as DensityLevel
    );

    if (headingPadding === null) {
      // Keep existing default behavior when spacing is not provided.
      if (lineCount <= 1) {
        return pos.y + pos.height / 2 + fontSize * 0.3;
      }
      return pos.y + fontSize;
    }

    const wrappedHeight = Math.max(1, lineCount) * lineHeightPx;
    const contentTop = pos.y + Math.max(headingPadding, (pos.height - wrappedHeight) / 2);
    return contentTop + fontSize;
  }

  protected calculateTopbarLayout(
    node: IRComponentNode,
    pos: { x: number; y: number; width: number; height: number },
    title: string,
    subtitle: string,
    actions: string,
    user: string
  ): {
    hasSubtitle: boolean;
    titleY: number;
    subtitleY: number;
    textX: number;
    titleMaxWidth: number;
    visibleTitle: string;
    visibleSubtitle: string;
    leftIcon: null | {
      badgeX: number;
      badgeY: number;
      badgeSize: number;
      badgeRadius: number;
      iconX: number;
      iconY: number;
      iconSize: number;
      iconSvg: string;
    };
    actions: Array<{ x: number; y: number; width: number; height: number; label: string }>;
    userBadge: null | { x: number; y: number; width: number; height: number; label: string };
    avatar: null | { cx: number; cy: number; r: number };
  } {
    const hasSubtitle = subtitle.trim().length > 0;
    const titleLineHeight = 18;
    const titleY = hasSubtitle
      ? pos.y + 24
      : pos.y + pos.height / 2 + titleLineHeight / 2 - 4;
    const subtitleY = hasSubtitle ? titleY + 20 : 0;

    const horizontalPadding = 16;
    let contentLeftX = pos.x + horizontalPadding;
    let rightCursor = pos.x + pos.width - horizontalPadding;

    const iconType = String(node.props.icon || '').trim();
    const iconSvg = iconType ? getIcon(iconType) : '';
    let leftIcon: null | {
      badgeX: number;
      badgeY: number;
      badgeSize: number;
      badgeRadius: number;
      iconX: number;
      iconY: number;
      iconSize: number;
      iconSvg: string;
    } = null;

    if (iconSvg) {
      const badgeSize = 28;
      const badgeY = pos.y + (pos.height - badgeSize) / 2;
      const iconSize = 18;
      leftIcon = {
        badgeX: contentLeftX,
        badgeY,
        badgeSize,
        badgeRadius: 6,
        iconX: contentLeftX + (badgeSize - iconSize) / 2,
        iconY: badgeY + (badgeSize - iconSize) / 2,
        iconSize,
        iconSvg,
      };
      contentLeftX += badgeSize + 10;
    }

    const showAvatar = this.parseBooleanProp(node.props.avatar, false);
    let avatar: null | { cx: number; cy: number; r: number } = null;
    if (showAvatar) {
      const avatarSize = 28;
      const avatarX = rightCursor - avatarSize;
      const avatarY = pos.y + (pos.height - avatarSize) / 2;
      avatar = {
        cx: avatarX + avatarSize / 2,
        cy: avatarY + avatarSize / 2,
        r: avatarSize / 2,
      };
      rightCursor = avatarX - 8;
    }

    let userBadge: null | { x: number; y: number; width: number; height: number; label: string } = null;
    const userLabel = user.trim();
    if (userLabel) {
      const height = 28;
      const fontSize = 12;
      const paddingX = 12;
      const width = Math.max(56, Math.ceil(this.estimateTextWidth(userLabel, fontSize) + paddingX * 2));
      const x = rightCursor - width;
      const y = pos.y + (pos.height - height) / 2;
      userBadge = { x, y, width, height, label: userLabel };
      rightCursor = x - 8;
    }

    const actionLabels = actions
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
    const actionHeight = 32;
    const actionY = pos.y + (pos.height - actionHeight) / 2;
    const actionGap = 8;
    const minActionsX = contentLeftX + 80;
    const availableActionsWidth = Math.max(0, rightCursor - minActionsX);
    const actionMetrics = actionLabels.map((label) => ({
      label,
      width: Math.max(64, Math.min(140, Math.ceil(this.estimateTextWidth(label, 12) + 28))),
    }));

    const visibleActionMetrics: Array<{ label: string; width: number }> = [];
    let actionsTotalWidth = 0;
    for (const metric of actionMetrics) {
      const nextTotal =
        actionsTotalWidth + metric.width + (visibleActionMetrics.length > 0 ? actionGap : 0);
      if (nextTotal > availableActionsWidth) {
        break;
      }
      visibleActionMetrics.push(metric);
      actionsTotalWidth = nextTotal;
    }

    const actionsStartX = rightCursor - actionsTotalWidth;
    let actionCursorX = actionsStartX;
    const actionButtons = visibleActionMetrics.map((metric) => {
      const button = {
        x: actionCursorX,
        y: actionY,
        width: metric.width,
        height: actionHeight,
        label: metric.label,
      };
      actionCursorX += metric.width + actionGap;
      return button;
    });

    const firstRightElementX = actionButtons.length > 0
      ? actionButtons[0].x
      : userBadge
        ? userBadge.x
        : avatar
          ? avatar.cx - avatar.r
          : pos.x + pos.width - horizontalPadding;

    const textMaxWidth = Math.max(40, firstRightElementX - contentLeftX - 12);
    const visibleTitle = this.truncateTextToWidth(title, textMaxWidth, 18);
    const visibleSubtitle = hasSubtitle
      ? this.truncateTextToWidth(subtitle, textMaxWidth, 13)
      : '';

    return {
      hasSubtitle,
      titleY,
      subtitleY,
      textX: contentLeftX,
      titleMaxWidth: textMaxWidth,
      visibleTitle,
      visibleSubtitle,
      leftIcon,
      actions: actionButtons,
      userBadge,
      avatar,
    };
  }

  protected parseBooleanProp(value: unknown, fallback: boolean = false): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.toLowerCase().trim();
      if (normalized === 'true') return true;
      if (normalized === 'false') return false;
    }
    return fallback;
  }

  protected shouldButtonFillAvailableWidth(node: IRComponentNode): boolean {
    if (this.parseBooleanProp(node.props.block, false)) {
      return true;
    }

    const parent = this.parentContainerByChildId.get(node.id);
    if (!parent || parent.containerType !== 'stack') {
      return false;
    }

    const direction = String(parent.params.direction || 'vertical');
    const justify = parent.style.justify || 'stretch';
    return direction === 'horizontal' && justify === 'stretch';
  }

  private buildParentContainerIndex(): void {
    this.parentContainerByChildId.clear();
    Object.values(this.ir.project.nodes).forEach((node) => {
      if (node.kind === 'container') {
        node.children.forEach((childRef) => {
          this.parentContainerByChildId.set(childRef.ref, node);
        });
      }
      // For instance nodes, map the expandedRoot to this instance's parent container
      // so that button-width lookups traverse through the instance boundary correctly
      // (the expandedRoot's own container children will be indexed when that container runs)
    });
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
  protected getDataNodeId(node: IRComponentNode | IRContainerNode | IRInstanceNode): string {
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
