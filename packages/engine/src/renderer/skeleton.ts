/**
 * Skeleton SVG Renderer
 *
 * Renders wireframes in a skeleton/loading state style:
 * - Text/Heading: Gray rectangular blocks instead of text
 * - Buttons: Shape outline only (no text, no fill)
 * - Icons: Hidden completely
 * - All text content: Gray blocks instead of actual text
 *
 * Used for:
 * - Loading states
 * - Content placeholders
 * - Wireframe presentations without actual content
 */

import { SVGRenderer } from './index';
import type { IRComponentNode } from '../ir';
import {
  resolveActionControlHeight,
  resolveControlHorizontalPadding,
} from '../shared/component-sizes';
import type { DensityLevel } from '../shared/spacing';

export class SkeletonSVGRenderer extends SVGRenderer {
  /**
   * Render button with same appearance as standard but without text
   */
  protected renderButton(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || 'Button');
    const variant = String(node.props.variant || 'default');
    const size = String(node.props.size || 'md');
    const density = (this.ir.project.style.density || 'normal') as DensityLevel;
    const extraPadding = resolveControlHorizontalPadding(String(node.props.padding || 'none'), density);
    const labelOffset = this.parseBooleanProp(node.props.labelSpace, false) ? 18 : 0;
    const fullWidth = this.shouldButtonFillAvailableWidth(node);

    // Use same tokens as standard renderer
    const radius = this.tokens.button.radius;
    const fontSize = this.tokens.button.fontSize;
    const paddingX = this.tokens.button.paddingX;
    const buttonHeight = Math.max(
      16,
      Math.min(resolveActionControlHeight(size, density), pos.height - labelOffset)
    );
    const buttonY = pos.y + labelOffset;

    // Calculate same dimensions as standard
    const textWidth = text.length * fontSize * 0.6;
    const buttonWidth = fullWidth
      ? Math.max(1, pos.width)
      : this.clampControlWidth(Math.max(textWidth + (paddingX + extraPadding) * 2, 60), pos.width);

    const semanticBase = this.getSemanticVariantColor(variant);
    const hasExplicitVariantColor =
      semanticBase !== undefined || this.colorResolver.hasColor(variant);
    const resolvedBase = this.resolveVariantColor(variant, this.renderTheme.primary);
    const bgColor = hasExplicitVariantColor
      ? this.hexToRgba(resolvedBase, 0.85)
      : 'rgba(226, 232, 240, 0.9)';
    const borderColor = hasExplicitVariantColor
      ? this.hexToRgba(resolvedBase, 0.7)
      : 'rgba(100, 116, 139, 0.4)';

    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${buttonY}"
            width="${buttonWidth}" height="${buttonHeight}"
            rx="${radius}"
            fill="${bgColor}"
            stroke="${borderColor}"
            stroke-width="1"/>
    </g>`;
  }

  /**
   * Render link as placeholder block + underline (no text)
   */
  protected renderLink(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || 'Link');
    const variant = String(node.props.variant || 'primary');
    const size = String(node.props.size || 'md');
    const density = (this.ir.project.style.density || 'normal') as DensityLevel;
    const fontSize = this.tokens.button.fontSize;
    const paddingX = this.tokens.button.paddingX;
    const linkColor = this.resolveVariantColor(variant, this.renderTheme.primary);

    const textWidth = this.estimateTextWidth(text, fontSize);
    const linkWidth = this.clampControlWidth(Math.max(textWidth + paddingX * 2, 60), pos.width);
    const linkHeight = Math.max(16, Math.min(resolveActionControlHeight(size, density), pos.height));
    const blockHeight = Math.max(8, Math.round(fontSize * 0.75));
    const blockWidth = Math.max(28, Math.min(textWidth, linkWidth - paddingX * 2));
    const blockX = pos.x + (linkWidth - blockWidth) / 2;
    const blockY = pos.y + (linkHeight - blockHeight) / 2 - 1;
    const underlineY = blockY + blockHeight + 4;

    return `<g${this.getDataNodeId(node)}>
      <rect x="${blockX}" y="${blockY}"
            width="${blockWidth}" height="${blockHeight}"
            rx="4"
            fill="${this.hexToRgba(linkColor, 0.25)}"/>
      <line x1="${blockX}" y1="${underlineY}"
            x2="${blockX + blockWidth}" y2="${underlineY}"
            stroke="${this.hexToRgba(linkColor, 0.55)}"
            stroke-width="1"/>
    </g>`;
  }

  /**
   * Render breadcrumbs as skeleton blocks: <rect> / <rect> / <rect accent>
   */
  protected renderBreadcrumbs(node: IRComponentNode, pos: any): string {
    const itemsStr = String(node.props.items || 'Home');
    const items = itemsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const separator = String(node.props.separator || '/');
    const blockColor = this.renderTheme.border;
    const charWidth = 6.2;
    const minBlockWidth = 28;
    const maxBlockWidth = Math.max(minBlockWidth, Math.floor(pos.width * 0.4));
    const blockHeight = 12;
    const blockY = pos.y + (pos.height - blockHeight) / 2;
    const blockRadius = 4;
    const blockPaddingX = 10;
    const itemSpacing = 8;
    const separatorWidth = 12;
    const contentRight = pos.x + pos.width;
    let currentX = pos.x;

    let svg = `<g${this.getDataNodeId(node)}>`;

    items.forEach((item, index) => {
      if (currentX >= contentRight) return;
      const isLast = index === items.length - 1;
      const estimatedTextWidth = item.length * charWidth;
      let blockWidth = Math.max(
        minBlockWidth,
        Math.min(maxBlockWidth, Math.ceil(estimatedTextWidth + blockPaddingX * 2))
      );
      blockWidth = Math.min(blockWidth, Math.max(0, contentRight - currentX));
      if (blockWidth < minBlockWidth) return;

      const fillColor = blockColor;

      svg += `
      <rect x="${currentX}" y="${blockY}"
            width="${blockWidth}" height="${blockHeight}"
            rx="${blockRadius}"
            fill="${fillColor}"
            stroke="none"/>`;
      currentX += blockWidth + itemSpacing;

      if (!isLast && currentX + separatorWidth <= contentRight) {
        svg += `
      <text x="${currentX + 2}" y="${pos.y + pos.height / 2 + 4}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="12"
            fill="${blockColor}">${this.escapeXml(separator)}</text>`;
        currentX += separatorWidth;
      }
    });

    svg += '\n    </g>';
    return svg;
  }

  /**
   * Render heading as gray block
   */
  protected renderHeading(node: IRComponentNode, pos: any): string {
    const headingTypography = this.getHeadingTypography(node);
    const variant = String(node.props.variant || 'default');
    const blockColor =
      variant === 'default'
        ? this.renderTheme.border
        : this.hexToRgba(this.resolveVariantColor(variant, this.resolveTextColor()), 0.35);
    return this.renderTextBlock(
      node,
      pos,
      String(node.props.text || 'Heading'),
      headingTypography.fontSize,
      headingTypography.lineHeight,
      blockColor
    );
  }

  /**
   * Render text as gray block
   */
  protected renderText(node: IRComponentNode, pos: any): string {
    return this.renderTextBlock(
      node,
      pos,
      String(node.props.text || 'Text content'),
      this.tokens.text.fontSize,
      this.tokens.text.lineHeight
    );
  }

  /**
   * Render label as gray block
   */
  protected renderLabel(node: IRComponentNode, pos: any): string {
    return this.renderTextBlock(node, pos, String(node.props.text || 'Label'), 12, 1.2);
  }

  /**
   * Render image as a plain skeleton rectangle — no icon, no placeholder label,
   * just a filled block with the correct dimensions (aspect-ratio is preserved
   * by the layout engine, so pos already has the right size).
   */
  protected renderImage(node: IRComponentNode, pos: any): string {
    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${pos.y}"
            width="${pos.width}" height="${pos.height}"
            rx="4"
            fill="${this.renderTheme.border}"/>
    </g>`;
  }

  /**
   * Render badge as shape only (no text)
   */
  protected renderBadge(node: IRComponentNode, pos: any): string {
    const variant = String(node.props.variant || 'default');
    const semanticBase = this.getSemanticVariantColor(variant);
    const hasExplicitVariantColor =
      semanticBase !== undefined || this.colorResolver.hasColor(variant);
    const bgColor = hasExplicitVariantColor
      ? this.resolveVariantColor(variant, this.renderTheme.primary)
      : this.renderTheme.border;
    const badgeRadius = this.tokens.badge.radius === 'pill' ? pos.height / 2 : this.tokens.badge.radius;

    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${pos.y}"
            width="${pos.width}" height="${pos.height}"
            rx="${badgeRadius}"
            fill="${bgColor}"
            stroke="none"/>
    </g>`;
  }

  /**
   * Render alert as shape with gray block instead of message
   */
  protected renderAlert(node: IRComponentNode, pos: any): string {
    const variant = String(node.props.variant || 'info');
    const title = String(node.props.title || '');
    const text = String(node.props.text || 'Alert message');
    const bgColor = this.resolveVariantColor(variant, this.getSemanticVariantColor(variant) || '#3B82F6');
    const hasTitle = title.trim().length > 0;
    const fontSize = 13;
    const titleLineHeight = Math.ceil(fontSize * 1.25);
    const textLineHeight = Math.ceil(fontSize * 1.4);
    const blockHeight = Math.max(8, Math.round(fontSize * 0.75));
    const contentX = pos.x + 16;
    const contentWidth = Math.max(20, pos.width - 32);
    const titleLines = hasTitle ? this.wrapTextToLines(title, contentWidth, fontSize) : [];
    const textLines = this.wrapTextToLines(text, contentWidth, fontSize);
    const titleStartY = pos.y + 8;
    const textStartY = titleStartY + titleLines.length * titleLineHeight + (hasTitle ? 6 : 0);
    const titleBlocks = this.renderWrappedLineBlocks(
      contentX,
      titleStartY,
      contentWidth,
      titleLines,
      fontSize,
      titleLineHeight,
      blockHeight
    );
    const textBlocks = this.renderWrappedLineBlocks(
      contentX,
      textStartY,
      contentWidth,
      textLines,
      fontSize,
      textLineHeight,
      blockHeight
    );

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
      ${titleBlocks}
      ${textBlocks}
    </g>`;
  }

  /**
   * Render input with gray block for placeholder text
   */
  protected renderInput(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || '');
    const placeholder = String(node.props.placeholder || '');
    const radius = this.tokens.input.radius;
    const labelOffset = this.getControlLabelOffset(label);
    const controlY = pos.y + labelOffset;
    const controlHeight = Math.max(16, pos.height - labelOffset);

    // Calculate placeholder block width based on text length
    const placeholderWidth = placeholder ? Math.min(placeholder.length * 7, pos.width - 24) : 80;

    return `<g${this.getDataNodeId(node)}>
      ${label ? `<rect x="${pos.x}" y="${pos.y + 2}" width="60" height="10" rx="4" fill="${this.renderTheme.border}"/>` : ''}
      <rect x="${pos.x}" y="${controlY}"
            width="${pos.width}" height="${controlHeight}"
            rx="${radius}"
            fill="${this.renderTheme.cardBg}"
            stroke="${this.renderTheme.border}"
            stroke-width="1"/>
      <rect x="${pos.x + 12}" y="${controlY + (controlHeight - 12) / 2}"
            width="${placeholderWidth}" height="12"
            rx="4"
            fill="${this.renderTheme.border}"
            opacity="0.5"/>
    </g>`;
  }

  /**
   * Render textarea with gray block for placeholder text
   */
  protected renderTextarea(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || '');
    const placeholder = String(node.props.placeholder || '');
    const labelOffset = this.getControlLabelOffset(label);
    const controlY = pos.y + labelOffset;
    const controlHeight = Math.max(20, pos.height - labelOffset);

    // Calculate placeholder block width based on text length
    const placeholderWidth = placeholder ? Math.min(placeholder.length * 7, pos.width - 24) : 120;

    return `<g${this.getDataNodeId(node)}>
      ${label ? `<rect x="${pos.x}" y="${pos.y + 2}" width="70" height="10" rx="4" fill="${this.renderTheme.border}"/>` : ''}
      <rect x="${pos.x}" y="${controlY}"
            width="${pos.width}" height="${controlHeight}"
            rx="6"
            fill="${this.renderTheme.cardBg}"
            stroke="${this.renderTheme.border}"
            stroke-width="1"/>
      <rect x="${pos.x + 12}" y="${controlY + 12}"
            width="${placeholderWidth}" height="12"
            rx="4"
            fill="${this.renderTheme.border}"
            opacity="0.5"/>
    </g>`;
  }

  /**
   * Render select as shape only (no placeholder text)
   */
  protected renderSelect(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || '');
    const labelOffset = this.getControlLabelOffset(label);
    const controlY = pos.y + labelOffset;
    const controlHeight = Math.max(16, pos.height - labelOffset);

    return `<g${this.getDataNodeId(node)}>
      ${label ? `<rect x="${pos.x}" y="${pos.y + 2}" width="65" height="10" rx="4" fill="${this.renderTheme.border}"/>` : ''}
      <rect x="${pos.x}" y="${controlY}"
            width="${pos.width}" height="${controlHeight}"
            rx="6"
            fill="${this.renderTheme.cardBg}"
            stroke="${this.renderTheme.border}"
            stroke-width="1"/>
      <rect x="${pos.x + pos.width - 25}" y="${controlY + controlHeight / 2 - 2}"
            width="8" height="4"
            fill="${this.renderTheme.textMuted}"/>
    </g>`;
  }

  /**
   * Render checkbox as shape only (no label text)
   */
  protected renderCheckbox(node: IRComponentNode, pos: any): string {
    const checked = String(node.props.checked || 'false').toLowerCase() === 'true';
    const controlColor = this.resolveControlColor();
    const checkboxSize = 18;
    const checkboxY = pos.y + pos.height / 2 - checkboxSize / 2;

    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${checkboxY}"
            width="${checkboxSize}" height="${checkboxSize}"
            rx="4"
            fill="${checked ? controlColor : this.renderTheme.cardBg}"
            stroke="${this.renderTheme.border}"
            stroke-width="1"/>
      <rect x="${pos.x + checkboxSize + 12}" y="${pos.y + pos.height / 2 - 6}"
            width="80" height="12"
            rx="4"
            fill="${this.renderTheme.border}"/>
    </g>`;
  }

  /**
   * Render radio as shape only (no label text)
   */
  protected renderRadio(node: IRComponentNode, pos: any): string {
    const checked = String(node.props.checked || 'false').toLowerCase() === 'true';
    const controlColor = this.resolveControlColor();
    const radioSize = 16;
    const radioY = pos.y + pos.height / 2 - radioSize / 2;

    return `<g${this.getDataNodeId(node)}>
      <circle cx="${pos.x + radioSize / 2}" cy="${radioY + radioSize / 2}"
              r="${radioSize / 2}"
              fill="${this.renderTheme.cardBg}"
              stroke="${this.renderTheme.border}"
              stroke-width="1"/>
      ${checked ? `<circle cx="${pos.x + radioSize / 2}" cy="${radioY + radioSize / 2}" r="${radioSize / 3.5}" fill="${controlColor}"/>` : ''}
      <rect x="${pos.x + radioSize + 12}" y="${pos.y + pos.height / 2 - 6}"
            width="80" height="12"
            rx="4"
            fill="${this.renderTheme.border}"/>
    </g>`;
  }

  /**
   * Render toggle as shape only (no label text)
   */
  protected renderToggle(node: IRComponentNode, pos: any): string {
    const enabled = String(node.props.enabled || 'false').toLowerCase() === 'true';
    const controlColor = this.resolveControlColor();
    const toggleWidth = 40;
    const toggleHeight = 22;
    const toggleY = pos.y + pos.height / 2 - toggleHeight / 2;

    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${toggleY}"
            width="${toggleWidth}" height="${toggleHeight}"
            rx="${toggleHeight / 2}"
            fill="${enabled ? controlColor : this.renderTheme.border}"
            stroke="none"/>
      <circle cx="${pos.x + (enabled ? toggleWidth - 11 : 11)}" cy="${toggleY + toggleHeight / 2}"
              r="8"
              fill="white"/>
      <rect x="${pos.x + toggleWidth + 12}" y="${pos.y + pos.height / 2 - 6}"
            width="80" height="12"
            rx="4"
            fill="${this.renderTheme.border}"/>
    </g>`;
  }

  /**
   * Render code as shape with gray block instead of code text
   */
  protected renderCode(node: IRComponentNode, pos: any): string {
    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${pos.y}"
            width="${pos.width}" height="${pos.height}"
            rx="4"
            fill="${this.renderTheme.bg}"
            stroke="${this.renderTheme.border}"
            stroke-width="1"/>
      <rect x="${pos.x + 8}" y="${pos.y + 8}"
            width="${Math.min(pos.width - 16, 120)}" height="10"
            rx="4"
            fill="${this.renderTheme.border}"/>
    </g>`;
  }

  /**
   * Render table with gray blocks instead of text
   */
  protected renderTable(node: IRComponentNode, pos: any): string {
    const title = String(node.props.title || '');
    const columnsStr = String(node.props.columns || 'Col1,Col2,Col3');
    const columns = columnsStr
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    const rowCount = Number(node.props.rows || node.props.rowsMock || 5);
    const actions = String(node.props.actions || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    const hasActions = actions.length > 0;
    const pagination = this.parseBooleanProp(node.props.pagination, false);
    const parsedPageCount = Number(node.props.pages || 5);
    const pageCount = Number.isFinite(parsedPageCount) && parsedPageCount > 0 ? Math.floor(parsedPageCount) : 5;
    const paginationAlign = String(node.props.paginationAlign || 'right');
    const hasCaption = String(node.props.caption || '').trim().length > 0;
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
    const safeColumns = columns.length > 0 ? columns : ['Column'];

    const headerHeight = 44;
    const rowHeight = 36;
    const actionColumnWidth = hasActions
      ? Math.max(96, Math.min(180, actions.length * 26 + 28))
      : 0;
    const dataWidth = Math.max(20, pos.width - actionColumnWidth);
    const colWidth = dataWidth / safeColumns.length;

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

    // Title as gray block
    if (title) {
      svg += `<rect x="${pos.x + 16}" y="${pos.y + 12}"
                width="100" height="12"
                rx="4"
                fill="${this.renderTheme.border}"/>`;
    }

    // Header row
    const headerY = pos.y + (title ? 32 : 0);
    if (showInnerBorder) {
      svg += `<line x1="${pos.x}" y1="${headerY + headerHeight}" x2="${pos.x + pos.width}" y2="${headerY + headerHeight}"
                  stroke="${this.renderTheme.border}" stroke-width="1"/>`;
    }

    // Header cells as gray blocks
    safeColumns.forEach((_, i) => {
      svg += `<rect x="${pos.x + i * colWidth + 12}" y="${headerY + 16}"
                    width="50" height="10"
                    rx="4"
                    fill="${this.renderTheme.border}"/>`;
    });

    if (hasActions && showInnerBorder) {
      const dividerX = pos.x + dataWidth;
      svg += `<line x1="${dividerX}" y1="${headerY + headerHeight}" x2="${dividerX}" y2="${headerY + headerHeight + rowCount * rowHeight}"
                    stroke="${this.renderTheme.border}" stroke-width="1"/>`;
    }

    // Data rows as gray blocks
    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
      const rowY = headerY + headerHeight + rowIdx * rowHeight;
      if (showInnerBorder) {
        svg += `<line x1="${pos.x}" y1="${rowY + rowHeight}" x2="${pos.x + pos.width}" y2="${rowY + rowHeight}"
                    stroke="${this.renderTheme.border}" stroke-width="0.5"/>`;
      }

      safeColumns.forEach((_, colIdx) => {
        const variance = ((rowIdx * 17 + colIdx * 11) % 5) * 10;
        const blockWidth = Math.min(colWidth - 24, 60 + variance);
        svg += `<rect x="${pos.x + colIdx * colWidth + 12}" y="${rowY + 12}"
                      width="${blockWidth}" height="10"
                      rx="4"
                      fill="${this.renderTheme.border}"/>`;
      });

      if (hasActions) {
        const iconSize = 14;
        const iconGap = 8;
        const actionsWidth = actions.length * iconSize + Math.max(0, actions.length - 1) * iconGap;
        let currentX = pos.x + pos.width - 12 - actionsWidth;
        const iconY = rowY + (rowHeight - iconSize) / 2;
        actions.forEach(() => {
          svg += `<rect x="${currentX}" y="${iconY}" width="${iconSize}" height="${iconSize}" rx="3" fill="${this.renderTheme.border}"/>`;
          currentX += iconSize + iconGap;
        });
      }
    }

    const footerTop = headerY + headerHeight + rowCount * rowHeight + 16;

    if (hasCaption) {
      const captionY = sameFooterAlign ? footerTop : footerTop + (pagination ? 10 : 0);
      const captionWidth = Math.min(220, Math.max(90, pos.width * 0.34));
      let captionX = pos.x + 16;
      if (captionAlign === 'center') {
        captionX = pos.x + (pos.width - captionWidth) / 2;
      } else if (captionAlign === 'right') {
        captionX = pos.x + pos.width - 16 - captionWidth;
      }
      svg += `<rect x="${captionX}" y="${captionY}" width="${captionWidth}" height="10" rx="4" fill="${this.renderTheme.border}"/>`;
    }

    if (pagination) {
      const buttonWidth = 28;
      const buttonHeight = 24;
      const buttonGap = 8;
      const totalWidth = (pageCount + 2) * buttonWidth + (pageCount + 1) * buttonGap;
      const paginationY = sameFooterAlign ? footerTop + 18 : footerTop;
      let startX = pos.x + pos.width - totalWidth - 16;
      if (paginationAlign === 'left') {
        startX = pos.x + 16;
      } else if (paginationAlign === 'center') {
        startX = pos.x + (pos.width - totalWidth) / 2;
      }
      for (let i = 0; i < pageCount + 2; i++) {
        svg += `<rect x="${startX + i * (buttonWidth + buttonGap)}" y="${paginationY}" width="${buttonWidth}" height="${buttonHeight}" rx="4" fill="${this.renderTheme.border}"/>`;
      }
    }

    svg += '</g>';
    return svg;
  }

  /**
   * Render topbar with gray blocks instead of text
   */
  protected renderTopbar(node: IRComponentNode, pos: any): string {
    const title = String(node.props.title || 'App');
    const subtitle = String(node.props.subtitle || '');
    const actions = String(node.props.actions || '');
    const user = String(node.props.user || '');
    const variant = String(node.props.variant || 'default');
    const accentBlock =
      variant === 'default'
        ? this.renderTheme.border
        : this.hexToRgba(this.resolveVariantColor(variant, this.resolveAccentColor()), 0.35);
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
    const titleWidth = Math.max(56, Math.min(topbar.titleMaxWidth * 0.55, topbar.titleMaxWidth));
    const subtitleWidth = Math.max(48, Math.min(topbar.titleMaxWidth * 0.4, topbar.titleMaxWidth));

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

    if (topbar.leftIcon) {
      svg += `
      <rect x="${topbar.leftIcon.badgeX}" y="${topbar.leftIcon.badgeY}"
            width="${topbar.leftIcon.badgeSize}" height="${topbar.leftIcon.badgeSize}"
            rx="${topbar.leftIcon.badgeRadius}"
            fill="${accentBlock}"/>`;
    }

    svg += `
      <rect x="${topbar.textX}" y="${topbar.titleY - 12}"
            width="${titleWidth}" height="16"
            rx="4"
            fill="${this.renderTheme.border}"/>`;

    if (topbar.hasSubtitle) {
      svg += `
      <rect x="${topbar.textX}" y="${topbar.subtitleY - 9}"
            width="${subtitleWidth}" height="12"
            rx="4"
            fill="${this.renderTheme.border}"/>`;
    }

    topbar.actions.forEach((action) => {
      svg += `
      <rect x="${action.x}" y="${action.y}"
            width="${action.width}" height="${action.height}"
            rx="6"
            fill="${accentBlock}"/>`;
    });

    if (topbar.userBadge) {
      svg += `
      <rect x="${topbar.userBadge.x}" y="${topbar.userBadge.y}"
            width="${topbar.userBadge.width}" height="${topbar.userBadge.height}"
            rx="4"
            fill="${this.renderTheme.border}"/>`;
    }

    if (topbar.avatar) {
      svg += `
      <circle cx="${topbar.avatar.cx}" cy="${topbar.avatar.cy}" r="${topbar.avatar.r}"
              fill="${this.renderTheme.border}"/>`;
    }

    svg += '\n    </g>';
    return svg;
  }

  /**
   * Render StatCard with gray blocks instead of values
   */
  protected renderStatCard(node: IRComponentNode, pos: any): string {
    const hasIcon = String(node.props.icon || '').trim().length > 0;
    const hasCaption = String(node.props.caption || '').trim().length > 0;
    const iconSize = 20;
    const iconX = pos.x + pos.width - 16 - iconSize;
    const iconY = pos.y + 14;
    const padding = 16;
    const titleBlockHeight = 10;
    const valueBlockHeight = 20;
    const captionBlockHeight = 10;
    const valueGap = 14;
    const captionGap = 12;
    const contentHeight =
      titleBlockHeight +
      valueGap +
      valueBlockHeight +
      (hasCaption ? captionGap + captionBlockHeight : 0);
    const contentAreaHeight = Math.max(0, pos.height - padding * 2);
    const contentStartY = pos.y + padding + Math.max(0, (contentAreaHeight - contentHeight) / 2);
    const titleY = contentStartY;
    const valueY = titleY + titleBlockHeight + valueGap;
    const captionY = valueY + valueBlockHeight + captionGap;

    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${pos.y}"
            width="${pos.width}" height="${pos.height}"
            rx="8"
            fill="${this.renderTheme.cardBg}"
            stroke="${this.renderTheme.border}"
            stroke-width="1"/>
      ${
        hasIcon
          ? `<rect x="${iconX}" y="${iconY}"
            width="${iconSize}" height="${iconSize}"
            rx="4"
            fill="${this.renderTheme.border}"/>`
          : ''
      }
      <rect x="${pos.x + 16}" y="${titleY}"
            width="80" height="10"
            rx="4"
            fill="${this.renderTheme.border}"/>
      <rect x="${pos.x + 16}" y="${valueY}"
            width="100" height="20"
            rx="4"
            fill="${this.renderTheme.border}"/>
      ${
        hasCaption
          ? `<rect x="${pos.x + 16}" y="${captionY}"
            width="60" height="10"
            rx="4"
            fill="${this.renderTheme.border}"/>`
          : ''
      }
    </g>`;
  }

  /**
   * Render icon as gray square instead of hiding it
   */
  protected renderIcon(node: IRComponentNode, pos: any): string {
    const size = String(node.props.size || 'md');
    const variant = String(node.props.variant || 'default');
    const iconSize = this.getIconSize(size);
    const blockColor =
      variant === 'default'
        ? this.renderTheme.border
        : this.hexToRgba(this.resolveVariantColor(variant, this.resolveTextColor()), 0.35);

    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${pos.y + (pos.height - iconSize) / 2}"
            width="${iconSize}" height="${iconSize}"
            rx="2"
            fill="${blockColor}"/>
    </g>`;
  }

  /**
   * Render IconButton with same appearance as standard but without icon
   */
  protected renderIconButton(node: IRComponentNode, pos: any): string {
    const variant = String(node.props.variant || 'default');
    const size = String(node.props.size || 'md');
    const density = (this.ir.project.style.density || 'normal') as DensityLevel;
    const labelOffset = this.parseBooleanProp(node.props.labelSpace, false) ? 18 : 0;
    const extraPadding = resolveControlHorizontalPadding(String(node.props.padding || 'none'), density);
    const semanticBase = this.getSemanticVariantColor(variant);
    const hasExplicitVariantColor =
      semanticBase !== undefined || this.colorResolver.hasColor(variant);
    const resolvedBase = this.resolveVariantColor(variant, this.renderTheme.primary);
    const bgColor = hasExplicitVariantColor
      ? this.hexToRgba(resolvedBase, 0.85)
      : 'rgba(226, 232, 240, 0.9)';
    const borderColor = hasExplicitVariantColor
      ? this.hexToRgba(resolvedBase, 0.7)
      : 'rgba(100, 116, 139, 0.4)';
    const buttonSize = Math.max(
      16,
      Math.min(resolveActionControlHeight(size, density), pos.height - labelOffset)
    );
    const buttonWidth = buttonSize + extraPadding * 2;
    const buttonY = pos.y + labelOffset;

    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${buttonY}"
            width="${buttonWidth}" height="${buttonSize}"
            rx="6"
            fill="${bgColor}"
            stroke="${borderColor}"
            stroke-width="1"/>
    </g>`;
  }

  /**
   * Render Sidebar with gray blocks instead of text
   */
  protected renderSidebar(node: IRComponentNode, pos: any): string {
    const itemsStr = String(node.props.items || '');
    let items: string[] = [];
    if (itemsStr) {
      items = itemsStr.split(',').map((i) => i.trim());
    } else {
      const itemCount = Number(node.props.itemsMock || 6);
      items = Array(itemCount).fill('Item');
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
      <!-- Title block -->
      <rect x="${pos.x + padding}" y="${pos.y + padding}"
            width="80" height="12"
            rx="4"
            fill="${this.renderTheme.border}"/>
      <line x1="${pos.x}" y1="${pos.y + titleHeight}"
            x2="${pos.x + pos.width}" y2="${pos.y + titleHeight}"
            stroke="${this.renderTheme.border}" stroke-width="1"/>`;

    // Render items as gray blocks
    items.forEach((_, i) => {
      const itemY = pos.y + titleHeight + padding + i * itemHeight;
      svg += `
      <rect x="${pos.x + 16}" y="${itemY + 10}"
            width="${Math.min(pos.width - 32, 100)}" height="12"
            rx="4"
            fill="${this.renderTheme.border}"/>`;
    });

    svg += '\n  </g>';
    return svg;
  }

  /**
   * Render SidebarMenu with gray blocks instead of text and no icons
   */
  protected renderSidebarMenu(node: IRComponentNode, pos: any): string {
    const itemsStr = String(node.props.items || 'Item 1,Item 2,Item 3');
    const items = itemsStr.split(',').map((s) => s.trim());
    const itemHeight = 40;
    const activeIndex = Number(node.props.active || 0);
    const accentColor = this.resolveAccentColor();

    let svg = `<g${this.getDataNodeId(node)}>`;

    items.forEach((_, index) => {
      const itemY = pos.y + index * itemHeight;
      const isActive = index === activeIndex;
      const bgColor = isActive ? this.hexToRgba(accentColor, 0.15) : 'transparent';

      // Item background (only if active)
      if (isActive) {
        svg += `
      <rect x="${pos.x}" y="${itemY}"
            width="${pos.width}" height="${itemHeight}"
            rx="6"
            fill="${bgColor}"/>`;
      }

      // Gray block instead of text (no icon)
      svg += `
      <rect x="${pos.x + 12}" y="${itemY + 14}"
            width="80" height="12"
            rx="4"
            fill="${this.renderTheme.border}"/>`;
    });

    svg += '\n  </g>';
    return svg;
  }

  /**
   * Private helper: Render text as gray block
   */
  private renderTextBlock(
    node: IRComponentNode,
    pos: any,
    text: string,
    fontSize: number,
    lineHeightMultiplier: number,
    color?: string
  ): string {
    const lineHeight = Math.ceil(fontSize * lineHeightMultiplier);
    const blockHeight = Math.max(8, Math.round(fontSize * 0.75));
    const blockColor = color || this.renderTheme.border;
    const lines = this.wrapTextToLines(text, pos.width, fontSize);
    const contentHeight = lines.length * lineHeight;
    const startY = pos.y + Math.max(0, (pos.height - contentHeight) / 2);
    const lineBlocks = this.renderWrappedLineBlocks(
      pos.x,
      startY,
      pos.width,
      lines,
      fontSize,
      lineHeight,
      blockHeight,
      blockColor
    );

    return `<g${this.getDataNodeId(node)}>
      ${lineBlocks}
    </g>`;
  }

  private renderWrappedLineBlocks(
    x: number,
    startY: number,
    maxWidth: number,
    lines: string[],
    fontSize: number,
    lineHeight: number,
    blockHeight: number,
    color: string = this.renderTheme.border
  ): string {
    const charWidth = fontSize * 0.6;
    const minWidth = Math.max(20, Math.min(maxWidth, fontSize * 2));

    return lines
      .map((line, index) => {
        const width = line.trim()
          ? Math.max(minWidth, Math.min(maxWidth, line.length * charWidth))
          : minWidth;
        const y = startY + index * lineHeight + Math.max(0, (lineHeight - blockHeight) / 2);
        return `<rect x="${x}" y="${y}"
            width="${width}" height="${blockHeight}"
            rx="4"
            fill="${color}"/>`;
      })
      .join('\n      ');
  }
}
