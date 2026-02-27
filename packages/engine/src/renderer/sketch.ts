/**
 * Sketch SVG Renderer
 *
 * Renders wireframes in a hand-drawn/sketch style:
 * - Thicker borders with sketch appearance
 * - For variant elements (Button, Badge): colored border instead of fill
 * - Keeps text and icons visible
 * - Traditional wireframe look
 *
 * Used for:
 * - Low-fidelity wireframes
 * - Traditional hand-drawn wireframe presentations
 * - Early design mockups
 */

import { SVGRenderer } from './index';
import type { IRComponentNode } from '../ir';
import { getIcon } from './icons/iconLibrary';
import { MockDataGenerator } from './mock-data';
import { resolveControlHeight, resolveControlHorizontalPadding } from '../shared/component-sizes';
import type { DensityLevel } from '../shared/spacing';

export class SketchSVGRenderer extends SVGRenderer {
  /**
   * Override render to add sketch filter definitions
   */
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

    // Hand-drawn sketch filter - subtle wavy effect
    const sketchFilters = `
  <defs>
    <!-- Sketch filter: hand-drawn appearance with subtle irregularity -->
    <filter id="sketch-rough" x="-50%" y="-50%" width="200%" height="200%">
      <!-- Layer 1: Main wavy displacement (reduced scale for subtlety) -->
      <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" result="turbulence" seed="2"/>
      <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="1.2" xChannelSelector="R" yChannelSelector="G" result="displaced1"/>

      <!-- Layer 2: Add thickness variation (pen pressure effect) -->
      <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="2" result="thickness" seed="3"/>
      <feColorMatrix in="thickness" type="matrix" values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 1 0" result="thicknessMask"/>
      <feMorphology operator="dilate" radius="0.3" in="displaced1" result="thickened"/>

      <!-- Blend original and thickened for variation -->
      <feBlend in="displaced1" in2="thickened" mode="normal" result="blended"/>

      <!-- Soften slightly for natural look -->
      <feGaussianBlur stdDeviation="0.3" in="blended" result="softened"/>
    </filter>
  </defs>`;

    return `<svg width="${this.options.width}" height="${svgHeight}" viewBox="0 0 ${this.options.width} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
  ${sketchFilters}
  ${children.join('\n  ')}
</svg>`;
  }

  /**
   * Render button with colored border instead of fill
   */
  protected renderButton(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || 'Button');
    const variant = String(node.props.variant || 'default');
    const size = String(node.props.size || 'sm');
    const density = (this.ir.project.style.density || 'normal') as DensityLevel;
    const extraPadding = resolveControlHorizontalPadding(String(node.props.padding || 'none'), density);
    const labelOffset = this.parseBooleanProp(node.props.labelSpace, false) ? 18 : 0;
    const fullWidth = this.shouldButtonFillAvailableWidth(node);
    const iconName = String(node.props.icon || '').trim();
    const iconAlign = String(node.props.iconAlign || 'left').toLowerCase();

    // Use same tokens as standard renderer
    const radius = this.tokens.button.radius;
    const fontSize = this.tokens.button.fontSize;
    const fontWeight = this.tokens.button.fontWeight;
    const paddingX = this.tokens.button.paddingX;
    const buttonHeight = Math.max(
      16,
      Math.min(resolveControlHeight(size, density), pos.height - labelOffset)
    );
    const buttonY = pos.y + labelOffset;

    // Icon support
    const iconSvg = iconName ? getIcon(iconName) : null;
    const iconSize = iconSvg ? Math.round(fontSize * 1.1) : 0;
    const iconGap = iconSvg ? 8 : 0;
    const edgePad = 12; // icon distance from button border
    const textPad = paddingX + extraPadding;

    // Keep control inside layout bounds; truncate text if needed.
    const idealTextWidth = text.length * fontSize * 0.6;
    const buttonWidth = fullWidth
      ? Math.max(1, pos.width)
      : this.clampControlWidth(Math.max(idealTextWidth + (iconSvg ? iconSize + iconGap : 0) + textPad * 2, 60), pos.width);
    const availableTextWidth = Math.max(0, buttonWidth - textPad * 2 - (iconSvg ? iconSize + iconGap : 0));
    const visibleText = this.truncateTextToWidth(text, availableTextWidth, fontSize);

    const semanticBase = this.getSemanticVariantColor(variant);
    const hasExplicitVariantColor =
      semanticBase !== undefined || this.colorResolver.hasColor(variant);
    const variantColor = hasExplicitVariantColor
      ? this.resolveVariantColor(variant, this.renderTheme.primary)
      : this.resolveTextColor();
    const borderColor = variantColor;
    const textColor = variantColor;
    const strokeWidth = 0.5;

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

    let svg = `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${buttonY}"
            width="${buttonWidth}" height="${buttonHeight}"
            rx="${radius}"
            fill="none"
            stroke="${borderColor}"
            stroke-width="${strokeWidth}"
            filter="url(#sketch-rough)"/>`;

    if (iconSvg) {
      svg += `
      <g transform="translate(${iconX}, ${iconOffsetY})">
        <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${textColor}" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round">
          ${this.extractSvgContent(iconSvg)}
        </svg>
      </g>`;
    }

    svg += `
      <text x="${textX}" y="${buttonY + buttonHeight / 2 + fontSize * 0.35}"
            font-family="${this.fontFamily}"
            font-size="${fontSize}"
            font-weight="${fontWeight}"
            fill="${textColor}"
            text-anchor="${textAnchor}">${this.escapeXml(visibleText)}</text>
    </g>`;
    return svg;
  }

  /**
   * Render badge with colored border instead of fill
   */
  protected renderBadge(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || '');
    const variant = String(node.props.variant || 'default');
    const semanticBase = this.getSemanticVariantColor(variant);
    const hasExplicitVariantColor =
      semanticBase !== undefined || this.colorResolver.hasColor(variant);
    const variantColor = hasExplicitVariantColor
      ? this.resolveVariantColor(variant, this.renderTheme.primary)
      : this.resolveTextColor();
    const borderColor = variantColor;
    const textColor = variantColor;
    const badgeRadius = this.tokens.badge.radius === 'pill' ? pos.height / 2 : this.tokens.badge.radius;

    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${pos.y}"
            width="${pos.width}" height="${pos.height}"
            rx="${badgeRadius}"
            fill="none"
            stroke="${borderColor}"
            stroke-width="0.5"
            filter="url(#sketch-rough)"/>
      ${text ? `<text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 4}"
            font-family="${this.fontFamily}"
            font-size="11"
            font-weight="500"
            fill="${textColor}"
            text-anchor="middle">${this.escapeXml(text)}</text>` : ''}
    </g>`;
  }

  /**
   * Render IconButton with colored border instead of fill
   */
  protected renderIconButton(node: IRComponentNode, pos: any): string {
    const iconName = String(node.props.icon || 'help-circle');
    const variant = String(node.props.variant || 'default');
    const size = String(node.props.size || 'sm');
    const density = (this.ir.project.style.density || 'normal') as DensityLevel;
    const labelOffset = this.parseBooleanProp(node.props.labelSpace, false) ? 18 : 0;
    const extraPadding = resolveControlHorizontalPadding(String(node.props.padding || 'none'), density);

    const semanticBase = this.getSemanticVariantColor(variant);
    const hasExplicitVariantColor =
      semanticBase !== undefined || this.colorResolver.hasColor(variant);
    const variantColor = hasExplicitVariantColor
      ? this.resolveVariantColor(variant, this.renderTheme.primary)
      : this.resolveTextColor();
    const borderColor = variantColor;
    const iconColor = variantColor;
    const buttonSize = Math.max(16, Math.min(resolveControlHeight(size, density), pos.height - labelOffset));
    const buttonWidth = buttonSize + extraPadding * 2;
    const radius = 6;
    const buttonY = pos.y + labelOffset;

    // Get icon from parent class
    const iconSvg = this.getIconSvg(iconName);

    let svg = `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${buttonY}"
            width="${buttonWidth}" height="${buttonSize}"
            rx="${radius}"
            fill="none"
            stroke="${borderColor}"
            stroke-width="0.5"
            filter="url(#sketch-rough)"/>`;

    // Icon inside button
    if (iconSvg) {
      const iconSize = buttonSize * 0.6;
      const offsetX = pos.x + (buttonWidth - iconSize) / 2;
      const offsetY = buttonY + (buttonSize - iconSize) / 2;

      svg += `
      <g transform="translate(${offsetX}, ${offsetY})">
        <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round">
          ${this.extractSvgContent(iconSvg)}
        </svg>
      </g>`;
    }

    svg += '\n  </g>';
    return svg;
  }

  /**
   * Render alert with colored border
   */
  protected renderAlert(node: IRComponentNode, pos: any): string {
    const variant = String(node.props.variant || 'info');
    const title = String(node.props.title || '');
    const text = String(node.props.text || 'Alert message');
    const borderColor = this.resolveVariantColor(variant, this.getSemanticVariantColor(variant) || '#3B82F6');
    const hasTitle = title.trim().length > 0;
    const fontSize = 14;
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
            fill="none"
            stroke="${borderColor}"
            stroke-width="0.5"
            filter="url(#sketch-rough)"/>
      <rect x="${pos.x}" y="${pos.y}"
            width="4" height="${pos.height}"
            rx="6"
            fill="${borderColor}"/>
      ${
        hasTitle
          ? `<text x="${contentX}" y="${titleStartY}"
            font-family="${this.fontFamily}"
            font-size="${fontSize}"
            font-weight="700"
            fill="${borderColor}">${titleTspans}</text>`
          : ''
      }
      <text x="${contentX}" y="${textStartY}"
            font-family="${this.fontFamily}"
            font-size="${fontSize}"
            fill="${borderColor}">${textTspans}</text>
    </g>`;
  }

  /**
   * Render input with thicker border
   */
  protected renderInput(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || '');
    const placeholder = String(node.props.placeholder || '');
    const iconLeftName = String(node.props.iconLeft || '').trim();
    const iconRightName = String(node.props.iconRight || '').trim();

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
    const iconColor = '#888888';
    const iconCenterY = controlY + (controlHeight - iconSize) / 2;

    let svg = `<g${this.getDataNodeId(node)}>`;
    if (label) {
      svg += `
      <text x="${pos.x}" y="${this.getControlLabelBaselineY(pos.y)}"
            font-family="${this.fontFamily}"
            font-size="12"
            fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>`;
    }
    svg += `
      <rect x="${pos.x}" y="${controlY}"
            width="${pos.width}" height="${controlHeight}"
            rx="${radius}"
            fill="${this.renderTheme.cardBg}"
            stroke="#2D3748"
            stroke-width="0.5"
            filter="url(#sketch-rough)"/>`;
    if (iconLeftSvg) {
      svg += `
      <g transform="translate(${pos.x + iconPad}, ${iconCenterY})">
        <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          ${this.extractSvgContent(iconLeftSvg)}
        </svg>
      </g>`;
    }
    if (iconRightSvg) {
      svg += `
      <g transform="translate(${pos.x + pos.width - iconPad - iconSize}, ${iconCenterY})">
        <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          ${this.extractSvgContent(iconRightSvg)}
        </svg>
      </g>`;
    }
    if (placeholder) {
      const availWidth = pos.width - (iconLeftSvg ? leftOffset : paddingX) - (iconRightSvg ? rightOffset : paddingX);
      const visiblePh = this.truncateTextToWidth(placeholder, Math.max(0, availWidth), fontSize);
      svg += `
      <text x="${textX}" y="${controlY + controlHeight / 2 + 5}"
            font-family="${this.fontFamily}"
            font-size="${fontSize}"
            fill="${this.renderTheme.textMuted}">${this.escapeXml(visiblePh)}</text>`;
    }
    svg += '\n    </g>';
    return svg;
  }

  /**
   * Render textarea with thicker border
   */
  protected renderTextarea(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || '');
    const placeholder = String(node.props.placeholder || '');
    const fontSize = this.tokens.input.fontSize;
    const paddingX = this.tokens.input.paddingX;
    const labelOffset = this.getControlLabelOffset(label);
    const controlY = pos.y + labelOffset;
    const controlHeight = Math.max(20, pos.height - labelOffset);
    const placeholderY = controlY + fontSize + 6;

    return `<g${this.getDataNodeId(node)}>
      ${label ? `<text x="${pos.x}" y="${this.getControlLabelBaselineY(pos.y)}"
            font-family="${this.fontFamily}"
            font-size="12"
            fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>` : ''}
      <rect x="${pos.x}" y="${controlY}"
            width="${pos.width}" height="${controlHeight}"
            rx="6"
            fill="${this.renderTheme.cardBg}"
            stroke="#2D3748"
            stroke-width="0.5"
            filter="url(#sketch-rough)"/>
      ${placeholder ? `<text x="${pos.x + paddingX}" y="${placeholderY}"
            font-family="${this.fontFamily}"
            font-size="${fontSize}"
            fill="${this.renderTheme.textMuted}">${this.escapeXml(placeholder)}</text>` : ''}
    </g>`;
  }

  /**
   * Render card with thicker border and sketch filter
   */
  protected renderCard(node: IRComponentNode, pos: any): string {
    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${pos.y}"
            width="${pos.width}" height="${pos.height}"
            rx="8"
            fill="${this.renderTheme.cardBg}"
            stroke="#2D3748"
            stroke-width="0.5"
            filter="url(#sketch-rough)"/>
    </g>`;
  }

  /**
   * Render panel with thicker border and sketch filter
   */
  protected renderPanel(node: IRComponentNode, pos: any): string {
    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${pos.y}"
            width="${pos.width}" height="${pos.height}"
            rx="8"
            fill="${this.renderTheme.cardBg}"
            stroke="#2D3748"
            stroke-width="0.5"
            filter="url(#sketch-rough)"/>
    </g>`;
  }

  /**
   * Render heading with sketch filter and Comic Sans
   */
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
          font-family="${this.fontFamily}"
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
          font-family="${this.fontFamily}"
          font-size="${fontSize}"
          font-weight="${fontWeight}"
          fill="${headingColor}">${tspans}</text>
  </g>`;
  }

  /**
   * Render topbar with sketch filter and Comic Sans
   */
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
    const topbar = this.calculateTopbarLayout(node, pos, title, subtitle, actions, user);

    // A2: respect background color prop (default to cardBg in sketch style)
    const bgPropStr = String(node.props.background ?? '');
    let sketchTopbarBg: string = this.renderTheme.cardBg;
    if (bgPropStr && bgPropStr !== 'false' && bgPropStr !== 'true') {
      if (bgPropStr.startsWith('#') || bgPropStr.startsWith('rgb')) {
        sketchTopbarBg = bgPropStr;
      } else if (this.colorResolver.hasColor(bgPropStr)) {
        sketchTopbarBg = this.colorResolver.resolveColor(bgPropStr, this.renderTheme.cardBg);
      }
    }
    // color prop: overrides title / subtitle text color
    const colorPropStr = String(node.props.color ?? '');
    let titleColor = this.renderTheme.text;
    let subtitleColor = this.renderTheme.textMuted;
    if (colorPropStr && colorPropStr !== 'false') {
      let resolvedTitleColor: string | null = null;
      if (colorPropStr.startsWith('#') || colorPropStr.startsWith('rgb')) {
        resolvedTitleColor = colorPropStr;
      } else if (this.colorResolver.hasColor(colorPropStr)) {
        resolvedTitleColor = this.colorResolver.resolveColor(colorPropStr, this.renderTheme.text);
      }
      if (resolvedTitleColor) {
        titleColor = resolvedTitleColor;
        subtitleColor = this.hexToRgba(resolvedTitleColor, 0.65);
      }
    }

    const showBorder = this.parseBooleanProp(node.props.border, false);
    const hasBgProp = bgPropStr === 'true' || (bgPropStr && bgPropStr !== 'false' && bgPropStr !== '');
    const showBackground = hasBgProp;

    let svg = `<g${this.getDataNodeId(node)}>`;
    if (showBorder || showBackground) {
      const stroke = showBorder ? '#2D3748' : 'none';
      svg += `
    <rect x="${pos.x}" y="${pos.y}"
          width="${pos.width}" height="${pos.height}"
          fill="${sketchTopbarBg}"
          stroke="${stroke}"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>`;
    }
    svg += `
    <!-- Title -->`;
    svg += `
    <text x="${topbar.textX}" y="${topbar.titleY}"
          font-family="${this.fontFamily}"
          font-size="18"
          font-weight="600"
          fill="${titleColor}">${this.escapeXml(topbar.visibleTitle)}</text>`;

    if (topbar.hasSubtitle) {
      svg += `
    <text x="${topbar.textX}" y="${topbar.subtitleY}"
          font-family="${this.fontFamily}"
          font-size="13"
          fill="${subtitleColor}">${this.escapeXml(topbar.visibleSubtitle)}</text>`;
    }

    if (topbar.leftIcon) {
      svg += `
    <!-- Left icon -->
    <rect x="${topbar.leftIcon.badgeX}" y="${topbar.leftIcon.badgeY}"
          width="${topbar.leftIcon.badgeSize}" height="${topbar.leftIcon.badgeSize}"
          rx="${topbar.leftIcon.badgeRadius}"
          fill="none"
          stroke="${accentColor}"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>
    <g transform="translate(${topbar.leftIcon.iconX}, ${topbar.leftIcon.iconY})">
      <svg width="${topbar.leftIcon.iconSize}" height="${topbar.leftIcon.iconSize}" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(topbar.leftIcon.iconSvg)}
      </svg>
    </g>`;
    }

    topbar.actions.forEach((action) => {
      svg += `
    <!-- Action button: ${action.label} -->
    <rect x="${action.x}" y="${action.y}"
          width="${action.width}" height="${action.height}"
          rx="6"
          fill="none"
          stroke="${accentColor}"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>
    <text x="${action.x + action.width / 2}" y="${action.y + action.height / 2 + 4}"
          font-family="${this.fontFamily}"
          font-size="12"
          font-weight="600"
          fill="${accentColor}"
          text-anchor="middle">${this.escapeXml(action.label)}</text>`;
    });

    if (topbar.userBadge) {
      svg += `
    <!-- User badge -->
    <rect x="${topbar.userBadge.x}" y="${topbar.userBadge.y}"
          width="${topbar.userBadge.width}" height="${topbar.userBadge.height}"
          rx="4"
          fill="${this.renderTheme.cardBg}"
          stroke="#2D3748"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>
    <text x="${topbar.userBadge.x + topbar.userBadge.width / 2}" y="${topbar.userBadge.y + topbar.userBadge.height / 2 + 4}"
          font-family="${this.fontFamily}"
          font-size="12"
          fill="${this.renderTheme.text}"
          text-anchor="middle">${this.escapeXml(topbar.userBadge.label)}</text>`;
    }

    if (topbar.avatar) {
      svg += `
    <!-- Avatar -->
    <circle cx="${topbar.avatar.cx}" cy="${topbar.avatar.cy}" r="${topbar.avatar.r}"
            fill="${this.renderTheme.cardBg}"
            stroke="#2D3748"
            stroke-width="0.5"
            filter="url(#sketch-rough)"/>
    <circle cx="${topbar.avatar.cx}" cy="${topbar.avatar.cy - topbar.avatar.r * 0.22}" r="${topbar.avatar.r * 0.28}"
            fill="#2D3748"/>
    <rect x="${topbar.avatar.cx - topbar.avatar.r * 0.45}" y="${topbar.avatar.cy + topbar.avatar.r * 0.02}"
          width="${topbar.avatar.r * 0.9}" height="${topbar.avatar.r * 0.62}" rx="${topbar.avatar.r * 0.3}"
          fill="#2D3748"/>`;
    }

    svg += '\n  </g>';
    return svg;
  }

  /**
   * Render table with sketch filter and Comic Sans
   */
  protected renderTable(node: IRComponentNode, pos: any): string {
    const standard = super.renderTable(node, pos);
    return standard.replace('<g', '<g filter="url(#sketch-rough)"');
  }

  /**
   * Render text with Comic Sans
   */
  protected renderText(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || 'Text content');
    const sizeProp = String(node.props.size || '');
    const defaultFontSize = this.tokens.text.fontSize;
    const textFontSizeMap: Record<string, number> = { xs: 10, sm: 12, lg: 16, xl: 20 };
    const fontSize = textFontSizeMap[sizeProp] ?? defaultFontSize;
    const lineHeightPx = Math.ceil(fontSize * this.tokens.text.lineHeight);
    const bold = this.parseBooleanProp(node.props.bold, false);
    const italic = this.parseBooleanProp(node.props.italic, false);
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
          font-family="${this.fontFamily}"
          font-size="${fontSize}"
          font-weight="${bold ? '700' : '400'}"
          font-style="${italic ? 'italic' : 'normal'}"
          fill="${this.renderTheme.text}">${tspans}</text>
  </g>`;
  }

  protected renderParagraph(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || '');
    const sizeProp = String(node.props.size || '');
    const defaultFontSize = this.tokens.text.fontSize;
    const textFontSizeMap: Record<string, number> = { xs: 10, sm: 12, lg: 16, xl: 20 };
    const fontSize = textFontSizeMap[sizeProp] ?? defaultFontSize;
    const lineHeightPx = Math.ceil(fontSize * this.tokens.text.lineHeight);
    const bold = this.parseBooleanProp(node.props.bold, false);
    const italic = this.parseBooleanProp(node.props.italic, false);
    const align = String(node.props.align || 'left');
    const lines = this.wrapTextToLines(text, pos.width, fontSize);
    const firstLineY = pos.y + fontSize;

    let textX: number;
    let textAnchor: string;
    if (align === 'center') {
      textX = pos.x + pos.width / 2;
      textAnchor = 'middle';
    } else if (align === 'right') {
      textX = pos.x + pos.width;
      textAnchor = 'end';
    } else {
      textX = pos.x;
      textAnchor = 'start';
    }

    const tspans = lines
      .map(
        (line, index) =>
          `<tspan x="${textX}" dy="${index === 0 ? 0 : lineHeightPx}">${this.escapeXml(line)}</tspan>`
      )
      .join('');

    return `<g${this.getDataNodeId(node)}>
    <text x="${textX}" y="${firstLineY}"
          font-family="${this.fontFamily}"
          font-size="${fontSize}"
          font-weight="${bold ? '700' : '400'}"
          font-style="${italic ? 'italic' : 'normal'}"
          fill="${this.renderTheme.text}"
          text-anchor="${textAnchor}">${tspans}</text>
  </g>`;
  }

  /**
   * Render label with Comic Sans
   */
  protected renderLabel(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || 'Label');

    return `<g${this.getDataNodeId(node)}>
    <text x="${pos.x}" y="${pos.y + 12}"
          font-family="${this.fontFamily}"
          font-size="12"
          fill="${this.renderTheme.textMuted}">${this.escapeXml(text)}</text>
  </g>`;
  }

  /**
   * Render code with sketch filter and Comic Sans
   */
  protected renderCode(node: IRComponentNode, pos: any): string {
    const code = String(node.props.code || 'const x = 42;');

    return `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${pos.y}"
          width="${pos.width}" height="${pos.height}"
          rx="4"
          fill="${this.renderTheme.bg}"
          stroke="#2D3748"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>
    <text x="${pos.x + 8}" y="${pos.y + 18}"
          font-family="${this.fontFamily}"
          font-size="11"
          fill="${this.renderTheme.text}">${this.escapeXml(code.substring(0, 30))}</text>
  </g>`;
  }

  /**
   * Render select with sketch filter and Comic Sans
   */
  protected renderSelect(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || '');
    const placeholder = String(node.props.placeholder || 'Select...');
    const iconLeftName = String(node.props.iconLeft || '').trim();
    const iconRightName = String(node.props.iconRight || '').trim();
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
    const iconColor = '#888888';
    const iconCenterY = controlY + (controlHeight - iconSize) / 2;

    let svg = `<g${this.getDataNodeId(node)}>`;
    if (label) {
      svg += `
    <text x="${pos.x}" y="${this.getControlLabelBaselineY(pos.y)}"
          font-family="${this.fontFamily}"
          font-size="12"
          fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>`;
    }
    svg += `
    <rect x="${pos.x}" y="${controlY}"
          width="${pos.width}" height="${controlHeight}"
          rx="6"
          fill="${this.renderTheme.cardBg}"
          stroke="#2D3748"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>`;
    if (iconLeftSvg) {
      svg += `
    <g transform="translate(${pos.x + iconPad}, ${iconCenterY})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(iconLeftSvg)}
      </svg>
    </g>`;
    }
    if (iconRightSvg) {
      svg += `
    <g transform="translate(${pos.x + pos.width - chevronWidth - iconPad - iconSize}, ${iconCenterY})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(iconRightSvg)}
      </svg>
    </g>`;
    }
    const textX = pos.x + (iconLeftSvg ? leftOffset : 12);
    const availWidth = pos.width - (iconLeftSvg ? leftOffset : 12) - chevronWidth - (iconRightSvg ? iconPad + iconSize + iconInnerGap : 0);
    const visiblePh = this.truncateTextToWidth(placeholder, Math.max(0, availWidth), 14);
    svg += `
    <text x="${textX}" y="${centerY}"
          font-family="${this.fontFamily}"
          font-size="14"
          fill="${this.renderTheme.textMuted}">${this.escapeXml(visiblePh)}</text>
    <text x="${pos.x + pos.width - 20}" y="${centerY}"
          font-family="${this.fontFamily}"
          font-size="16"
          fill="${this.renderTheme.textMuted}">▼</text>
  </g>`;
    return svg;
  }

  /**
   * Render checkbox with sketch filter and Comic Sans
   */
  protected renderCheckbox(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || 'Checkbox');
    const checked = String(node.props.checked || 'false').toLowerCase() === 'true';
    const controlColor = this.resolveControlColor();

    const checkboxSize = 18;
    const checkboxY = pos.y + pos.height / 2 - checkboxSize / 2;

    return `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${checkboxY}"
          width="${checkboxSize}" height="${checkboxSize}"
          rx="4"
          fill="${checked ? controlColor : this.renderTheme.cardBg}"
          stroke="#2D3748"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>
    ${
      checked
        ? `<text x="${pos.x + checkboxSize / 2}" y="${checkboxY + 14}"
          font-family="${this.fontFamily}"
          font-size="12"
          fill="white"
          text-anchor="middle">✓</text>`
        : ''
    }
    <text x="${pos.x + checkboxSize + 12}" y="${pos.y + pos.height / 2 + 5}"
          font-family="${this.fontFamily}"
          font-size="14"
          fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>
  </g>`;
  }

  /**
   * Render radio with sketch filter and Comic Sans
   */
  protected renderRadio(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || 'Radio');
    const checked = String(node.props.checked || 'false').toLowerCase() === 'true';
    const controlColor = this.resolveControlColor();

    const radioSize = 16;
    const radioY = pos.y + pos.height / 2 - radioSize / 2;

    return `<g${this.getDataNodeId(node)}>
    <circle cx="${pos.x + radioSize / 2}" cy="${radioY + radioSize / 2}"
            r="${radioSize / 2}"
            fill="${this.renderTheme.cardBg}"
            stroke="#2D3748"
            stroke-width="0.5"
            filter="url(#sketch-rough)"/>
    ${
      checked
        ? `<circle cx="${pos.x + radioSize / 2}" cy="${radioY + radioSize / 2}"
            r="${radioSize / 3.5}"
            fill="${controlColor}"/>`
        : ''
    }
    <text x="${pos.x + radioSize + 12}" y="${pos.y + pos.height / 2 + 5}"
          font-family="${this.fontFamily}"
          font-size="14"
          fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>
  </g>`;
  }

  /**
   * Render toggle with sketch filter and Comic Sans
   */
  protected renderToggle(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || 'Toggle');
    const enabled = String(node.props.enabled || 'false').toLowerCase() === 'true';
    const controlColor = this.resolveControlColor();

    const toggleWidth = 40;
    const toggleHeight = 20;
    const toggleY = pos.y + pos.height / 2 - toggleHeight / 2;

    return `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${toggleY}"
          width="${toggleWidth}" height="${toggleHeight}"
          rx="10"
          fill="${enabled ? controlColor : '#2D3748'}"
          stroke="none"
          filter="url(#sketch-rough)"/>
    <circle cx="${pos.x + (enabled ? toggleWidth - 10 : 10)}" cy="${toggleY + toggleHeight / 2}"
            r="8"
            fill="white"
            filter="url(#sketch-rough)"/>
    <text x="${pos.x + toggleWidth + 12}" y="${pos.y + pos.height / 2 + 5}"
          font-family="${this.fontFamily}"
          font-size="14"
          fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>
  </g>`;
  }

  /**
   * Render sidebar with sketch filter and Comic Sans
   */
  protected renderSidebar(node: IRComponentNode, pos: any): string {
    const title = String(node.props.title || 'Sidebar');
    const itemsStr = String(node.props.items || '');
    const activeItem = String(node.props.active || '');

    const items = itemsStr ? itemsStr.split(',').map((i) => i.trim()) : ['Item 1', 'Item 2', 'Item 3'];
    const itemHeight = 40;
    const padding = 16;
    const titleHeight = 40;

    let svg = `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${pos.y}"
          width="${pos.width}" height="${pos.height}"
          fill="${this.renderTheme.cardBg}"
          stroke="#2D3748"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>
    <!-- Title -->
    <text x="${pos.x + padding}" y="${pos.y + padding + 8}"
          font-family="${this.fontFamily}"
          font-size="14"
          font-weight="600"
          fill="${this.renderTheme.text}">${this.escapeXml(title)}</text>
    <line x1="${pos.x}" y1="${pos.y + titleHeight}" x2="${pos.x + pos.width}" y2="${pos.y + titleHeight}"
          stroke="#2D3748" stroke-width="0.5" filter="url(#sketch-rough)"/>`;

    items.forEach((item, i) => {
      const itemY = pos.y + titleHeight + padding + i * itemHeight;
      const isActive = item === activeItem;

      svg += `
    <rect x="${pos.x + 8}" y="${itemY}"
          width="${pos.width - 16}" height="36"
          rx="4"
          fill="${isActive ? '#3B82F6' : 'transparent'}"
          stroke="${isActive ? '#3B82F6' : 'none'}"
          stroke-width="0.5"
          ${isActive ? 'filter="url(#sketch-rough)"' : ''}/>
    <text x="${pos.x + 16}" y="${itemY + 22}"
          font-family="${this.fontFamily}"
          font-size="13"
          fill="${isActive ? 'white' : this.renderTheme.textMuted}">${this.escapeXml(item)}</text>`;
    });

    svg += '\n  </g>';
    return svg;
  }

  /**
   * Render tabs with sketch filter and Comic Sans
   */
  protected renderTabs(node: IRComponentNode, pos: any): string {
    const itemsStr = String(node.props.items || '');
    const tabs = itemsStr ? itemsStr.split(',').map((t) => t.trim()) : ['Tab 1', 'Tab 2', 'Tab 3'];
    const activeProp = node.props.active ?? 0;
    const activeIndex = Number.isFinite(Number(activeProp))
      ? Math.max(0, Math.floor(Number(activeProp)))
      : 0;

    const variant = String(node.props.variant || 'default');
    const accentColor =
      variant === 'default'
        ? this.resolveAccentColor()
        : this.resolveVariantColor(variant, this.resolveAccentColor());

    const radiusMap: Record<string, number> = { none: 0, sm: 4, md: 6, lg: 10, full: 20 };
    const tabRadius = radiusMap[String(node.props.radius || 'md')] ?? 6;

    const sizeMap: Record<string, number> = { sm: 32, md: 44, lg: 52 };
    const tabHeight = pos.height > 0 ? pos.height : (sizeMap[String(node.props.size || 'md')] ?? 44);
    const fontSize = 13;
    const textY = pos.y + Math.round(tabHeight / 2) + Math.round(fontSize * 0.4);

    const iconsStr = String(node.props.icons || '');
    const iconList = iconsStr ? iconsStr.split(',').map((s) => s.trim()) : [];
    const isFlat = this.parseBooleanProp(node.props.flat, false);
    const showBorder = this.parseBooleanProp(node.props.border, true);
    const tabWidth = pos.width / tabs.length;

    // color prop: overrides tab label text color
    const colorPropStr = String(node.props.color ?? '');
    let textColorOverride: string | null = null;
    if (colorPropStr && colorPropStr !== 'false') {
      if (colorPropStr.startsWith('#') || colorPropStr.startsWith('rgb')) {
        textColorOverride = colorPropStr;
      } else if (this.colorResolver.hasColor(colorPropStr)) {
        textColorOverride = this.colorResolver.resolveColor(colorPropStr, this.renderTheme.text);
      }
    }
    const activeTextColor = textColorOverride ?? (isFlat ? accentColor : 'white');
    const inactiveTextColor = textColorOverride
      ? this.hexToRgba(textColorOverride, 0.55)
      : this.renderTheme.textMuted;

    // Container clip: rounds all corners of the Tabs widget
    const hasRadius = tabRadius > 0;
    const clipId = hasRadius
      ? `stc${String(node.meta?.nodeId ?? '').replace(/\W/g, '').slice(0, 12) || `${Math.round(Math.abs(pos.x))}x${Math.round(Math.abs(pos.y))}`}`
      : '';

    let svg = '';
    if (hasRadius) {
      svg += `<defs><clipPath id="${clipId}"><rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}" rx="${tabRadius}"/></clipPath></defs>`;
    }

    svg += `<g${this.getDataNodeId(node)}>`;
    if (hasRadius) {
      svg += `<g clip-path="url(#${clipId})">`;
    }

    // Tab header background (not in flat mode)
    if (!isFlat) {
      svg += `
    <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${tabHeight}"
          fill="${this.renderTheme.bg}"/>`;
    }

    tabs.forEach((tab, i) => {
      const tabX = pos.x + i * tabWidth;
      const isActive = i === activeIndex;
      const iconName = iconList[i] || '';
      const tabIconSvg = iconName ? getIcon(iconName) : null;

      // Compute centered icon+text group position
      const iconSize = 14;
      const iconGap = 4;
      const charW = fontSize * 0.58;
      const textEst = tab.length * charW;
      const totalW = tabIconSvg ? (iconSize + iconGap + textEst) : textEst;
      const groupX = tabX + Math.round((tabWidth - totalW) / 2);
      const iconOffY = pos.y + Math.round((tabHeight - iconSize) / 2);

      if (isFlat) {
        if (isActive) {
          svg += `
    <rect x="${tabX + 6}" y="${pos.y + tabHeight - 3}"
          width="${tabWidth - 12}" height="3"
          rx="1.5"
          fill="${accentColor}"
          filter="url(#sketch-rough)"/>`;
        }
        if (tabIconSvg) {
          svg += `
    <g transform="translate(${groupX}, ${iconOffY})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none"
           stroke="${isActive ? accentColor : this.renderTheme.textMuted}"
           stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(tabIconSvg)}
      </svg>
    </g>
    <text x="${groupX + iconSize + iconGap}" y="${textY}"
          font-family="${this.fontFamily}"
          font-size="${fontSize}"
          font-weight="${isActive ? '600' : '500'}"
          fill="${isActive ? activeTextColor : inactiveTextColor}">${this.escapeXml(tab)}</text>`;
        } else {
          svg += `
    <text x="${tabX + tabWidth / 2}" y="${textY}"
          font-family="${this.fontFamily}"
          font-size="${fontSize}"
          font-weight="${isActive ? '600' : '500'}"
          fill="${isActive ? activeTextColor : inactiveTextColor}"
          text-anchor="middle">${this.escapeXml(tab)}</text>`;
        }
      } else {
        svg += `
    <rect x="${tabX}" y="${pos.y}"
          width="${tabWidth}" height="${tabHeight}"
          rx="${!showBorder && hasRadius && isActive ? tabRadius : 0}"
          fill="${isActive ? accentColor : 'transparent'}"
          stroke="${isActive ? accentColor : (showBorder ? '#2D3748' : 'none')}"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>`;

        if (tabIconSvg) {
          svg += `
    <g transform="translate(${groupX}, ${iconOffY})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none"
           stroke="${isActive ? activeTextColor : this.renderTheme.textMuted}"
           stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(tabIconSvg)}
      </svg>
    </g>
    <text x="${groupX + iconSize + iconGap}" y="${textY}"
          font-family="${this.fontFamily}"
          font-size="${fontSize}"
          font-weight="${isActive ? '600' : '500'}"
          fill="${isActive ? activeTextColor : this.renderTheme.text}">${this.escapeXml(tab)}</text>`;
        } else {
          svg += `
    <text x="${tabX + tabWidth / 2}" y="${textY}"
          font-family="${this.fontFamily}"
          font-size="${fontSize}"
          font-weight="${isActive ? '600' : '500'}"
          fill="${isActive ? activeTextColor : this.renderTheme.text}"
          text-anchor="middle">${this.escapeXml(tab)}</text>`;
        }
      }
    });

    const contentY = pos.y + tabHeight;
    const contentH = pos.height - tabHeight;
    if (contentH >= 20 && !isFlat) {
      svg += `
    <!-- Tab content area -->
    <rect x="${pos.x}" y="${contentY}"
          width="${pos.width}" height="${contentH}"
          fill="${this.renderTheme.cardBg}"
          ${showBorder ? 'stroke="#2D3748" stroke-width="0.5" filter="url(#sketch-rough)"' : ''}/>`;
    } else if (isFlat && showBorder) {
      svg += `
    <line x1="${pos.x}" y1="${contentY}" x2="${pos.x + pos.width}" y2="${contentY}"
          stroke="#2D3748" stroke-width="0.5" filter="url(#sketch-rough)"/>`;
    }

    if (hasRadius) {
      svg += `\n  </g>`;
      if (!isFlat && showBorder) {
        svg += `
    <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}"
          rx="${tabRadius}" fill="none" stroke="#2D3748" stroke-width="0.5"
          filter="url(#sketch-rough)"/>`;
      }
    }

    svg += '\n  </g>';
    return svg;
  }

  /**
   * Render divider with sketch filter
   */
  protected renderDivider(node: IRComponentNode, pos: any): string {
    return `<g${this.getDataNodeId(node)}>
    <line x1="${pos.x}" y1="${pos.y + pos.height / 2}"
          x2="${pos.x + pos.width}" y2="${pos.y + pos.height / 2}"
          stroke="${this.renderTheme.border}"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>
  </g>`;
  }

  /**
   * Render modal with sketch filter and Comic Sans
   */
  protected renderModal(node: IRComponentNode, pos: any): string {
    const visible = this.parseBooleanProp(node.props.visible, true);
    if (!visible) {
      return '';
    }

    const title = String(node.props.title || 'Modal');
    const padding = 16;
    const headerHeight = 48;
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
        stroke="#2D3748"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>

    <!-- Header -->
      <line x1="${modalX}" y1="${modalY + headerHeight}"
        x2="${modalX + pos.width}" y2="${modalY + headerHeight}"
          stroke="#2D3748"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>

      <text x="${modalX + padding}" y="${modalY + padding + 16}"
          font-family="${this.fontFamily}"
          font-size="16"
          font-weight="600"
          fill="${this.renderTheme.text}">${this.escapeXml(title)}</text>

    <!-- Close button -->
      <text x="${modalX + pos.width - 16}" y="${modalY + padding + 12}"
          font-family="${this.fontFamily}"
          font-size="18"
          fill="${this.renderTheme.textMuted}">✕</text>

    <!-- Content placeholder -->
      <text x="${modalX + pos.width / 2}" y="${modalY + headerHeight + (pos.height - headerHeight) / 2}"
          font-family="${this.fontFamily}"
          font-size="13"
          fill="${this.renderTheme.textMuted}"
          text-anchor="middle">Modal content</text>
  </g>`;
  }

  /**
   * Render list with sketch filter and Comic Sans
   */
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
          stroke="#2D3748"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>`;

    // Title
    if (title) {
      svg += `
    <text x="${pos.x + padding}" y="${pos.y + 26}"
          font-family="${this.fontFamily}"
          font-size="13"
          font-weight="600"
          fill="${this.renderTheme.text}">${this.escapeXml(title)}</text>
    <line x1="${pos.x}" y1="${pos.y + titleHeight}" x2="${pos.x + pos.width}" y2="${pos.y + titleHeight}"
          stroke="#2D3748" stroke-width="0.5" filter="url(#sketch-rough)"/>`;
    }

    // Items
    items.forEach((item, i) => {
      const itemY = pos.y + titleHeight + i * itemHeight;
      if (itemY + itemHeight <= pos.y + pos.height) {
        svg += `
    <line x1="${pos.x}" y1="${itemY + itemHeight}"
          x2="${pos.x + pos.width}" y2="${itemY + itemHeight}"
          stroke="#2D3748"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>
    <text x="${pos.x + padding}" y="${itemY + 24}"
          font-family="${this.fontFamily}"
          font-size="13"
          fill="${this.renderTheme.text}">${this.escapeXml(item)}</text>`;
      }
    });

    svg += '\n  </g>';
    return svg;
  }

  /**
   * Render generic component with sketch filter and Comic Sans
   */
  protected renderGenericComponent(node: IRComponentNode, pos: any): string {
    return `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${pos.y}"
          width="${pos.width}" height="${pos.height}"
          rx="4"
          fill="${this.renderTheme.cardBg}"
          stroke="#2D3748"
          stroke-width="0.5"
          stroke-dasharray="4 4"
          filter="url(#sketch-rough)"/>
    <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2}"
          font-family="${this.fontFamily}"
          font-size="12"
          fill="${this.renderTheme.textMuted}"
          text-anchor="middle">${node.componentType}</text>
  </g>`;
  }

  /**
   * Render stat card with sketch filter and Comic Sans
   */
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

    // Inline spacing resolution
    const padding = this.resolveSpacing(node.style.padding);
    const innerX = pos.x + padding;
    const innerY = pos.y + padding;

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
    const titleMaxWidth = iconSvg
      ? Math.max(40, pos.width - padding * 2 - iconBadgeSize - 8)
      : Math.max(40, pos.width - padding * 2);
    const visibleTitle = this.truncateTextToWidth(title, titleMaxWidth, titleSize);
    const visibleCaption = hasCaption
      ? this.truncateTextToWidth(caption, Math.max(20, pos.width - padding * 2), captionSize)
      : '';

    let svg = `<g${this.getDataNodeId(node)}>
    <!-- Stat Background -->
    <rect x="${pos.x}" y="${pos.y}"
          width="${pos.width}" height="${pos.height}"
          rx="8"
          fill="${this.renderTheme.cardBg}"
          stroke="#2D3748"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>

    <!-- Title -->
    <text x="${innerX}" y="${titleY}"
          font-family="${this.fontFamily}"
          font-size="${titleSize}"
          font-weight="500"
          fill="${this.renderTheme.textMuted}">${this.escapeXml(visibleTitle)}</text>

    <!-- Value (Large) -->
    <text x="${innerX}" y="${valueY}"
          font-family="${this.fontFamily}"
          font-size="${valueSize}"
          font-weight="700"
          fill="${accentColor}">${this.escapeXml(value)}</text>`;

    if (iconSvg) {
      svg += `
    <!-- Icon -->
    <rect x="${iconBadgeX}" y="${iconBadgeY}"
          width="${iconBadgeSize}" height="${iconBadgeSize}"
          rx="6"
          fill="none"
          stroke="#2D3748"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>
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
          font-family="${this.fontFamily}"
          font-size="${captionSize}"
          fill="${this.renderTheme.textMuted}">${this.escapeXml(visibleCaption)}</text>`;
    }

    svg += `
  </g>`;
    return svg;
  }

  /**
   * Render image with sketch filter
   */
  protected renderImage(node: IRComponentNode, pos: any): string {
    const placeholder = String(node.props.placeholder || 'landscape').toLowerCase();
    const iconType = String(node.props.icon || '').trim();
    const variant = String(node.props.variant || '').trim();
    const iconSvg =
      placeholder === 'icon' && iconType.length > 0 ? getIcon(iconType) : null;

    // Theme-aware image background
    const imageBg = this.options.theme === 'dark' ? '#2A2A2A' : '#E8E8E8';

    // A3/A4: Clip handling
    const hasExplicitHeight = node.props.height !== undefined && !isNaN(Number(node.props.height)) && Number(node.props.height) > 0;
    const isCircle = this.parseBooleanProp(node.props.circle, false);
    const useClip = isCircle || hasExplicitHeight;
    const clipId = useClip
      ? `sclip${String(node.meta?.nodeId ?? '').replace(/\W/g, '').slice(0, 16) || `${Math.round(Math.abs(pos.x))}x${Math.round(Math.abs(pos.y))}`}`
      : '';
    const imgCx = pos.x + pos.width / 2;
    const imgCy = pos.y + pos.height / 2;
    const imgR = Math.min(pos.width, pos.height) / 2;
    const defsHtml = useClip
      ? `<defs><clipPath id="${clipId}">${isCircle ? `<circle cx="${imgCx}" cy="${imgCy}" r="${imgR}"/>` : `<rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}" rx="4"/>`}</clipPath></defs>`
      : '';
    const clipAttr = useClip ? ` clip-path="url(#${clipId})"` : '';

    // Custom icon placeholder — no inner badge rect; icon fills the space
    if (iconSvg) {
      const semanticBase = variant ? this.getSemanticVariantColor(variant) : undefined;
      const hasVariant = variant.length > 0 && (semanticBase !== undefined || this.colorResolver.hasColor(variant));
      const variantColor = hasVariant ? this.resolveVariantColor(variant, this.renderTheme.primary) : null;

      const bgColor = hasVariant ? this.hexToRgba(variantColor!, 0.12) : imageBg;
      const iconColor = hasVariant ? variantColor! : '#666666';
      const iconSize = Math.max(16, Math.min(pos.width, pos.height) * 0.6);
      const iconOffsetX = pos.x + (pos.width - iconSize) / 2;
      const iconOffsetY = pos.y + (pos.height - iconSize) / 2;

      const sketchIconBorder = isCircle
        ? `<circle cx="${imgCx}" cy="${imgCy}" r="${imgR}" fill="none" stroke="#2D3748" stroke-width="0.5" filter="url(#sketch-rough)"/>`
        : `<rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}" fill="none" stroke="#2D3748" stroke-width="0.5" rx="4" filter="url(#sketch-rough)"/>`;
      return `${defsHtml}<g${this.getDataNodeId(node)}${clipAttr}>
    <rect x="${pos.x}" y="${pos.y}"
          width="${pos.width}" height="${pos.height}"
          fill="${bgColor}"
          rx="4"
          filter="url(#sketch-rough)"/>
    <g transform="translate(${iconOffsetX}, ${iconOffsetY})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(iconSvg)}
      </svg>
    </g>
    ${sketchIconBorder}
  </g>`;
    }

    const sketchCircleBorder = isCircle
      ? `<circle cx="${imgCx}" cy="${imgCy}" r="${imgR}" fill="none" stroke="#2D3748" stroke-width="0.5"/>`
      : '';

    // Sketch renderer uses emoji placeholder — no camera icon scaling issue.
    // For consistency with the standard renderer, keep contained mode (not cover).
    return `${defsHtml}<g${this.getDataNodeId(node)}${clipAttr}>
    <rect x="${pos.x}" y="${pos.y}"
          width="${pos.width}" height="${pos.height}"
          fill="${imageBg}"
          stroke="#2D3748"
          stroke-width="0.5"
          rx="4"
          filter="url(#sketch-rough)"/>
    <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2}"
          font-family="${this.fontFamily}"
          font-size="24"
          fill="#666"
          text-anchor="middle">🖼</text>
  </g>${sketchCircleBorder}`;
  }

  /**
   * Render breadcrumbs with Comic Sans
   */
  protected renderBreadcrumbs(node: IRComponentNode, pos: any): string {
    const itemsStr = String(node.props.items || 'Home');
    const items = itemsStr.split(',').map((s) => s.trim());
    const separator = String(node.props.separator || '/');
    const fontSize = 12;
    const separatorWidth = 20;
    const itemSpacing = 8;

    let currentX = pos.x;
    let svg = `<g${this.getDataNodeId(node)}>`;

    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const textColor = isLast ? this.renderTheme.text : this.renderTheme.textMuted;
      const fontWeight = isLast ? '500' : '400';

      svg += `
    <text x="${currentX}" y="${pos.y + pos.height / 2 + 4}"
          font-family="${this.fontFamily}"
          font-size="${fontSize}"
          font-weight="${fontWeight}"
          fill="${textColor}">${this.escapeXml(item)}</text>`;

      const textWidth = item.length * 6.5;
      currentX += textWidth + itemSpacing;

      if (!isLast) {
        svg += `
    <text x="${currentX + 4}" y="${pos.y + pos.height / 2 + 4}"
          font-family="${this.fontFamily}"
          font-size="${fontSize}"
          fill="${this.renderTheme.textMuted}">${this.escapeXml(separator)}</text>`;
        currentX += separatorWidth;
      }
    });

    svg += '\n  </g>';
    return svg;
  }

  /**
   * Render sidebar menu with sketch filter and Comic Sans
   */
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
      const textColor = isActive ? activeColor : this.resolveTextColor();
      const fontWeight = isActive ? '500' : '400';

      if (isActive) {
        svg += `
    <rect x="${pos.x}" y="${itemY}"
          width="${pos.width}" height="${itemHeight}"
          rx="6"
          fill="${bgColor}"
          filter="url(#sketch-rough)"/>`;
      }

      // Icon if provided
      let currentX = pos.x + 12;
      if (icons[index]) {
        const iconSvg = getIcon(icons[index]);
        if (iconSvg) {
          const iconSize = 16;
          const iconY = itemY + (itemHeight - iconSize) / 2;
          const iconColor = isActive ? activeColor : this.resolveMutedColor();
          svg += `
    <g transform="translate(${currentX}, ${iconY})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(iconSvg)}
      </svg>
    </g>`;
          currentX += iconSize + 8;
        }
      }

      svg += `
    <text x="${currentX}" y="${itemY + itemHeight / 2 + 5}"
          font-family="${this.fontFamily}"
          font-size="${fontSize}"
          font-weight="${fontWeight}"
          fill="${textColor}">${this.escapeXml(item)}</text>`;
    });

    svg += '\n  </g>';
    return svg;
  }

  /**
   * Render icon (same as base, icons don't need filter)
   */
  protected renderIcon(node: IRComponentNode, pos: any): string {
    const iconType = String(node.props.icon || 'help-circle');
    const size = String(node.props.size || 'md');
    const variant = String(node.props.variant || 'default');
    const iconSvg = getIcon(iconType);

    if (!iconSvg) {
      return `<g${this.getDataNodeId(node)}>
    <circle cx="${pos.x + pos.width / 2}" cy="${pos.y + pos.height / 2}"
            r="${Math.min(pos.width, pos.height) / 2 - 2}"
            fill="none" stroke="${this.resolveMutedColor()}" stroke-width="0.5"
            filter="url(#sketch-rough)"/>
    <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 4}"
          font-family="${this.fontFamily}"
          font-size="12" fill="${this.resolveMutedColor()}" text-anchor="middle">?</text>
  </g>`;
    }

    const iconSize = this.getIconSize(size);
    const iconColor =
      variant === 'default' ? this.resolveTextColor() : this.resolveVariantColor(variant, this.resolveTextColor());
    const paddingPx = Math.max(0, Number(node.props.padding || 0));
    const renderedIconSize = Math.max(4, iconSize - paddingPx * 2);
    const offsetX = pos.x + (pos.width - renderedIconSize) / 2;
    const offsetY = pos.y + (pos.height - renderedIconSize) / 2;

    // A4: Circle clip for Icon
    const isIconCircle = this.parseBooleanProp(node.props.circle, false);
    if (isIconCircle) {
      const cx = pos.x + pos.width / 2;
      const cy = pos.y + pos.height / 2;
      const r = Math.min(pos.width, pos.height) / 2;
      const iconClipId = `sconclip${String(node.meta?.nodeId ?? '').replace(/\W/g, '').slice(0, 16) || `${Math.round(Math.abs(pos.x))}x${Math.round(Math.abs(pos.y))}`}`;
      const bgColor = this.hexToRgba(iconColor, 0.10);
      return `<defs><clipPath id="${iconClipId}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath></defs><g${this.getDataNodeId(node)} clip-path="url(#${iconClipId})">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${bgColor}"/>
    <g transform="translate(${offsetX}, ${offsetY})">
      <svg width="${renderedIconSize}" height="${renderedIconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round">
        ${this.extractSvgContent(iconSvg)}
      </svg>
    </g>
  </g>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${this.hexToRgba(iconColor, 0.35)}" stroke-width="0.5"/>`;    
    }

    return `<g${this.getDataNodeId(node)} transform="translate(${offsetX}, ${offsetY})">
    <svg width="${renderedIconSize}" height="${renderedIconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round">
      ${this.extractSvgContent(iconSvg)}
    </svg>
  </g>`;
  }

  /**
   * Helper method to get icon SVG
   */
  private getIconSvg(iconName: string): string {
    return getIcon(iconName) || '';
  }
}
