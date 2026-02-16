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

export class SkeletonSVGRenderer extends SVGRenderer {
  /**
   * Render button with same appearance as standard but without text
   */
  protected renderButton(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || 'Button');
    const variant = String(node.props.variant || 'default');

    // Use same tokens as standard renderer
    const radius = this.tokens.button.radius;
    const fontSize = this.tokens.button.fontSize;
    const paddingX = this.tokens.button.paddingX;
    const paddingY = this.tokens.button.paddingY;

    // Calculate same dimensions as standard
    const textWidth = text.length * fontSize * 0.6;
    const buttonWidth = this.clampControlWidth(Math.max(textWidth + paddingX * 2, 60), pos.width);
    const buttonHeight = fontSize + paddingY * 2;

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
      <rect x="${pos.x}" y="${pos.y}"
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
    const fontSize = this.tokens.button.fontSize;
    const paddingX = this.tokens.button.paddingX;
    const paddingY = this.tokens.button.paddingY;
    const linkColor = this.resolveVariantColor(variant, this.renderTheme.primary);

    const textWidth = text.length * fontSize * 0.6;
    const linkWidth = this.clampControlWidth(Math.max(textWidth + paddingX * 2, 60), pos.width);
    const linkHeight = fontSize + paddingY * 2;
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
   * Render heading as gray block
   */
  protected renderHeading(node: IRComponentNode, pos: any): string {
    return this.renderTextBlock(
      node,
      pos,
      String(node.props.text || 'Heading'),
      this.tokens.heading.fontSize,
      1.25
    );
  }

  /**
   * Render text as gray block
   */
  protected renderText(node: IRComponentNode, pos: any): string {
    return this.renderTextBlock(
      node,
      pos,
      String(node.props.content || 'Text content'),
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

    // Calculate placeholder block width based on text length
    const placeholderWidth = placeholder ? Math.min(placeholder.length * 7, pos.width - 24) : 80;

    return `<g${this.getDataNodeId(node)}>
      ${label ? `<rect x="${pos.x}" y="${pos.y - 18}" width="60" height="10" rx="4" fill="${this.renderTheme.border}"/>` : ''}
      <rect x="${pos.x}" y="${pos.y}"
            width="${pos.width}" height="${pos.height}"
            rx="${radius}"
            fill="${this.renderTheme.cardBg}"
            stroke="${this.renderTheme.border}"
            stroke-width="1"/>
      <rect x="${pos.x + 12}" y="${pos.y + (pos.height - 12) / 2}"
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

    // Calculate placeholder block width based on text length
    const placeholderWidth = placeholder ? Math.min(placeholder.length * 7, pos.width - 24) : 120;

    return `<g${this.getDataNodeId(node)}>
      ${label ? `<rect x="${pos.x}" y="${pos.y - 18}" width="70" height="10" rx="4" fill="${this.renderTheme.border}"/>` : ''}
      <rect x="${pos.x}" y="${pos.y}"
            width="${pos.width}" height="${pos.height}"
            rx="6"
            fill="${this.renderTheme.cardBg}"
            stroke="${this.renderTheme.border}"
            stroke-width="1"/>
      <rect x="${pos.x + 12}" y="${pos.y + 12}"
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

    return `<g${this.getDataNodeId(node)}>
      ${label ? `<rect x="${pos.x}" y="${pos.y - 18}" width="65" height="10" rx="4" fill="${this.renderTheme.border}"/>` : ''}
      <rect x="${pos.x}" y="${pos.y}"
            width="${pos.width}" height="${pos.height}"
            rx="6"
            fill="${this.renderTheme.cardBg}"
            stroke="${this.renderTheme.border}"
            stroke-width="1"/>
      <rect x="${pos.x + pos.width - 25}" y="${pos.y + pos.height / 2 - 2}"
            width="8" height="4"
            fill="${this.renderTheme.textMuted}"/>
    </g>`;
  }

  /**
   * Render checkbox as shape only (no label text)
   */
  protected renderCheckbox(node: IRComponentNode, pos: any): string {
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
    const radioSize = 16;
    const radioY = pos.y + pos.height / 2 - radioSize / 2;

    return `<g${this.getDataNodeId(node)}>
      <circle cx="${pos.x + radioSize / 2}" cy="${radioY + radioSize / 2}"
              r="${radioSize / 2}"
              fill="${this.renderTheme.cardBg}"
              stroke="${this.renderTheme.border}"
              stroke-width="1"/>
      ${checked ? `<circle cx="${pos.x + radioSize / 2}" cy="${radioY + radioSize / 2}" r="${radioSize / 3.5}" fill="${this.renderTheme.primary}"/>` : ''}
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
    const toggleWidth = 40;
    const toggleHeight = 22;
    const toggleY = pos.y + pos.height / 2 - toggleHeight / 2;

    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${toggleY}"
            width="${toggleWidth}" height="${toggleHeight}"
            rx="${toggleHeight / 2}"
            fill="${enabled ? this.renderTheme.primary : this.renderTheme.border}"
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
    const columns = columnsStr.split(',').map((c) => c.trim());
    const rowCount = Number(node.props.rows || 5);

    const headerHeight = 44;
    const rowHeight = 36;
    const colWidth = pos.width / columns.length;

    let svg = `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${pos.y}"
            width="${pos.width}" height="${pos.height}"
            rx="8"
            fill="${this.renderTheme.cardBg}"
            stroke="${this.renderTheme.border}"
            stroke-width="1"/>`;

    // Title as gray block
    if (title) {
      svg += `<rect x="${pos.x + 16}" y="${pos.y + 12}"
                width="100" height="12"
                rx="4"
                fill="${this.renderTheme.border}"/>`;
    }

    // Header row
    const headerY = pos.y + (title ? 32 : 0);
    svg += `<line x1="${pos.x}" y1="${headerY + headerHeight}" x2="${pos.x + pos.width}" y2="${headerY + headerHeight}"
                  stroke="${this.renderTheme.border}" stroke-width="1"/>`;

    // Header cells as gray blocks
    columns.forEach((_, i) => {
      svg += `<rect x="${pos.x + i * colWidth + 12}" y="${headerY + 16}"
                    width="50" height="10"
                    rx="4"
                    fill="${this.renderTheme.border}"/>`;
    });

    // Data rows as gray blocks
    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
      const rowY = headerY + headerHeight + rowIdx * rowHeight;
      svg += `<line x1="${pos.x}" y1="${rowY + rowHeight}" x2="${pos.x + pos.width}" y2="${rowY + rowHeight}"
                    stroke="${this.renderTheme.border}" stroke-width="0.5"/>`;

      columns.forEach((_, colIdx) => {
        const blockWidth = Math.min(colWidth - 24, 60 + Math.random() * 40);
        svg += `<rect x="${pos.x + colIdx * colWidth + 12}" y="${rowY + 12}"
                      width="${blockWidth}" height="10"
                      rx="4"
                      fill="${this.renderTheme.border}"/>`;
      });
    }

    svg += '</g>';
    return svg;
  }

  /**
   * Render topbar with gray blocks instead of text
   */
  protected renderTopbar(node: IRComponentNode, pos: any): string {
    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${pos.y}"
            width="${pos.width}" height="${pos.height}"
            fill="${this.renderTheme.cardBg}"
            stroke="${this.renderTheme.border}"
            stroke-width="0 0 1 0"/>
      <rect x="${pos.x + 24}" y="${pos.y + pos.height / 2 - 8}"
            width="120" height="16"
            rx="4"
            fill="${this.renderTheme.border}"/>
    </g>`;
  }

  /**
   * Render StatCard with gray blocks instead of values
   */
  protected renderStatCard(node: IRComponentNode, pos: any): string {
    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${pos.y}"
            width="${pos.width}" height="${pos.height}"
            rx="8"
            fill="${this.renderTheme.cardBg}"
            stroke="${this.renderTheme.border}"
            stroke-width="1"/>
      <rect x="${pos.x + 16}" y="${pos.y + 16}"
            width="80" height="10"
            rx="4"
            fill="${this.renderTheme.border}"/>
      <rect x="${pos.x + 16}" y="${pos.y + 40}"
            width="100" height="20"
            rx="4"
            fill="${this.renderTheme.border}"/>
      <rect x="${pos.x + 16}" y="${pos.y + 72}"
            width="60" height="10"
            rx="4"
            fill="${this.renderTheme.border}"/>
    </g>`;
  }

  /**
   * Render icon as gray square instead of hiding it
   */
  protected renderIcon(node: IRComponentNode, pos: any): string {
    const size = String(node.props.size || 'md');
    const iconSize = this.getIconSize(size);

    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${pos.y + (pos.height - iconSize) / 2}"
            width="${iconSize}" height="${iconSize}"
            rx="2"
            fill="${this.renderTheme.border}"/>
    </g>`;
  }

  /**
   * Render IconButton with same appearance as standard but without icon
   */
  protected renderIconButton(node: IRComponentNode, pos: any): string {
    const variant = String(node.props.variant || 'default');
    const size = String(node.props.size || 'md');
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
    const buttonSize = this.getIconButtonSize(size);

    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${pos.y}"
            width="${buttonSize}" height="${buttonSize}"
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

    let svg = `<g${this.getDataNodeId(node)}>`;

    items.forEach((_, index) => {
      const itemY = pos.y + index * itemHeight;
      const isActive = index === activeIndex;
      const bgColor = isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent';

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
    lineHeightMultiplier: number
  ): string {
    const lineHeight = Math.ceil(fontSize * lineHeightMultiplier);
    const blockHeight = Math.max(8, Math.round(fontSize * 0.75));
    const blockColor = this.renderTheme.border;
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
