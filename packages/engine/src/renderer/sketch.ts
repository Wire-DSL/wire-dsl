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

    // Use same tokens as standard renderer
    const radius = this.tokens.button.radius;
    const fontSize = this.tokens.button.fontSize;
    const fontWeight = this.tokens.button.fontWeight;
    const paddingX = this.tokens.button.paddingX;
    const paddingY = this.tokens.button.paddingY;

    // Calculate same dimensions as standard
    const textWidth = text.length * fontSize * 0.6;
    const buttonWidth = Math.max(textWidth + paddingX * 2, 60);
    const buttonHeight = fontSize + paddingY * 2;

    // Sketch style: monochrome except for emphasized variants
    const borderColor = variant === 'primary' ? '#3B82F6' : '#2D3748';
    const textColor = variant === 'primary' ? '#3B82F6' : '#2D3748';
    const strokeWidth = 0.5;

    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${pos.y}"
            width="${buttonWidth}" height="${buttonHeight}"
            rx="${radius}"
            fill="none"
            stroke="${borderColor}"
            stroke-width="${strokeWidth}"
            filter="url(#sketch-rough)"/>
      <text x="${pos.x + buttonWidth / 2}" y="${pos.y + buttonHeight / 2 + fontSize * 0.35}"
            font-family="${this.fontFamily}"
            font-size="${fontSize}"
            font-weight="${fontWeight}"
            fill="${textColor}"
            text-anchor="middle">${this.escapeXml(text)}</text>
    </g>`;
  }

  /**
   * Render badge with colored border instead of fill
   */
  protected renderBadge(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || '');
    const variant = String(node.props.variant || 'default');

    const borderColor = variant === 'primary' ? '#3B82F6' : '#2D3748';
    const textColor = variant === 'primary' ? '#3B82F6' : '#2D3748';
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
    const size = String(node.props.size || 'md');

    const borderColorMap = {
      'primary': '#3B82F6',
      'danger': '#EF4444',
      'default': '#2D3748'
    };
    const borderColor = borderColorMap[variant as keyof typeof borderColorMap] || borderColorMap['default'];

    const iconColorMap = {
      'primary': '#3B82F6',
      'danger': '#EF4444',
      'default': '#2D3748'
    };
    const iconColor = iconColorMap[variant as keyof typeof iconColorMap] || iconColorMap['default'];

    const sizeMap = { 'sm': 28, 'md': 32, 'lg': 40 };
    const buttonSize = sizeMap[size as keyof typeof sizeMap] || 32;
    const radius = 6;

    // Get icon from parent class
    const iconSvg = this.getIconSvg(iconName);

    let svg = `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${pos.y}"
            width="${buttonSize}" height="${buttonSize}"
            rx="${radius}"
            fill="none"
            stroke="${borderColor}"
            stroke-width="0.5"
            filter="url(#sketch-rough)"/>`;

    // Icon inside button
    if (iconSvg) {
      const iconSize = buttonSize * 0.6;
      const offsetX = pos.x + (buttonSize - iconSize) / 2;
      const offsetY = pos.y + (buttonSize - iconSize) / 2;

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
    const message = String(node.props.message || 'Alert message');
    const type = String(node.props.type || 'info');

    const typeColors: Record<string, string> = {
      info: '#3B82F6',
      warning: '#F59E0B',
      error: '#EF4444',
      success: '#10B981',
    };
    const borderColor = typeColors[type] || typeColors.info;

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
      <text x="${pos.x + 16}" y="${pos.y + pos.height / 2 + 5}"
            font-family="${this.fontFamily}"
            font-size="14"
            fill="${borderColor}">${this.escapeXml(message)}</text>
    </g>`;
  }

  /**
   * Render input with thicker border
   */
  protected renderInput(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || '');
    const placeholder = String(node.props.placeholder || '');

    const radius = this.tokens.input.radius;
    const fontSize = this.tokens.input.fontSize;
    const paddingX = this.tokens.input.paddingX;

    return `<g${this.getDataNodeId(node)}>
      ${label ? `<text x="${pos.x}" y="${pos.y - 6}"
            font-family="${this.fontFamily}"
            font-size="12"
            fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>` : ''}
      <rect x="${pos.x}" y="${pos.y}"
            width="${pos.width}" height="${pos.height}"
            rx="${radius}"
            fill="${this.renderTheme.cardBg}"
            stroke="#2D3748"
            stroke-width="0.5"
            filter="url(#sketch-rough)"/>
      ${placeholder ? `<text x="${pos.x + paddingX}" y="${pos.y + pos.height / 2 + 5}"
            font-family="${this.fontFamily}"
            font-size="${fontSize}"
            fill="${this.renderTheme.textMuted}">${this.escapeXml(placeholder)}</text>` : ''}
    </g>`;
  }

  /**
   * Render textarea with thicker border
   */
  protected renderTextarea(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || '');
    const placeholder = String(node.props.placeholder || '');

    return `<g${this.getDataNodeId(node)}>
      ${label ? `<text x="${pos.x}" y="${pos.y - 6}"
            font-family="${this.fontFamily}"
            font-size="12"
            fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>` : ''}
      <rect x="${pos.x}" y="${pos.y}"
            width="${pos.width}" height="${pos.height}"
            rx="6"
            fill="${this.renderTheme.cardBg}"
            stroke="#2D3748"
            stroke-width="0.5"
            filter="url(#sketch-rough)"/>
      ${placeholder ? `<text x="${pos.x + 12}" y="${pos.y + 20}"
            font-family="${this.fontFamily}"
            font-size="14"
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
    const fontSize = this.tokens.heading.fontSize;
    const fontWeight = this.tokens.heading.fontWeight;
    const lineHeightPx = Math.ceil(fontSize * 1.25);
    const lines = this.wrapTextToLines(text, pos.width, fontSize);

    if (lines.length <= 1) {
      return `<g${this.getDataNodeId(node)}>
    <text x="${pos.x}" y="${pos.y + pos.height / 2 + 6}"
          font-family="${this.fontFamily}"
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
          font-family="${this.fontFamily}"
          font-size="${fontSize}"
          font-weight="${fontWeight}"
          fill="${this.renderTheme.text}">${tspans}</text>
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

    const titleLineHeight = 18;
    const paddingTop = 24;

    let titleY: number;
    let subtitleY: number = 0;

    if (subtitle) {
      titleY = pos.y + paddingTop;
      subtitleY = titleY + 20;
    } else {
      titleY = pos.y + pos.height / 2 + titleLineHeight / 2 - 4;
    }

    let svg = `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${pos.y}"
          width="${pos.width}" height="${pos.height}"
          fill="${this.renderTheme.cardBg}"
          stroke="#2D3748"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>

    <!-- Title -->
    <text x="${pos.x + 16}" y="${titleY}"
          font-family="${this.fontFamily}"
          font-size="18"
          font-weight="600"
          fill="${this.renderTheme.text}">${this.escapeXml(title)}</text>`;

    if (subtitle) {
      svg += `
    <text x="${pos.x + 16}" y="${subtitleY}"
          font-family="${this.fontFamily}"
          font-size="13"
          fill="${this.renderTheme.textMuted}">${this.escapeXml(subtitle)}</text>`;
    }

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
          stroke="#2D3748"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>
    <text x="${badgeX + badgePaddingX + user.length * 3.75}" y="${badgeY + badgeHeight / 2 + 4}"
          font-family="${this.fontFamily}"
          font-size="12"
          fill="${this.renderTheme.text}"
          text-anchor="middle">${this.escapeXml(user)}</text>`;
    }

    if (actions) {
      const actionList = actions.split(',').map((a) => a.trim()).filter(Boolean);
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
          fill="none"
          stroke="#3B82F6"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>
    <text x="${bx + buttonWidth / 2}" y="${buttonY + buttonHeight / 2 + 4}"
          font-family="${this.fontFamily}"
          font-size="12"
          font-weight="600"
          fill="#3B82F6"
          text-anchor="middle">${this.escapeXml(action)}</text>`;
      });
    }

    svg += '\n  </g>';
    return svg;
  }

  /**
   * Render table with sketch filter and Comic Sans
   */
  protected renderTable(node: IRComponentNode, pos: any): string {
    const title = String(node.props.title || '');
    const columnsStr = String(node.props.columns || 'Col1,Col2,Col3');
    const columns = columnsStr.split(',').map((c) => c.trim());
    const rowCount = Number(node.props.rows || 5);
    const mockStr = String(node.props.mock || '');

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
          stroke="#2D3748"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>`;

    if (title) {
      svg += `
    <text x="${pos.x + 16}" y="${pos.y + 24}"
          font-family="${this.fontFamily}"
          font-size="13"
          font-weight="600"
          fill="${this.renderTheme.text}">${this.escapeXml(title)}</text>`;
    }

    // Header row
    const headerY = pos.y + (title ? 32 : 0);
    svg += `
    <line x1="${pos.x}" y1="${headerY + headerHeight}" x2="${pos.x + pos.width}" y2="${headerY + headerHeight}"
          stroke="#2D3748" stroke-width="0.5" filter="url(#sketch-rough)"/>`;

    columns.forEach((col, i) => {
      svg += `
    <text x="${pos.x + i * colWidth + 12}" y="${headerY + 26}"
          font-family="${this.fontFamily}"
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
          stroke="#2D3748" stroke-width="0.5" filter="url(#sketch-rough)"/>`;

      // Row data
      columns.forEach((col, colIdx) => {
        const cellValue = row[col] || '';
        svg += `
    <text x="${pos.x + colIdx * colWidth + 12}" y="${rowY + 22}"
          font-family="${this.fontFamily}"
          font-size="12"
          fill="${this.renderTheme.text}">${this.escapeXml(cellValue)}</text>`;
      });
    });

    svg += '\n  </g>';
    return svg;
  }

  /**
   * Render text with Comic Sans
   */
  protected renderText(node: IRComponentNode, pos: any): string {
    const text = String(node.props.content || 'Text content');
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
          font-family="${this.fontFamily}"
          font-size="${fontSize}"
          fill="${this.renderTheme.text}">${tspans}</text>
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

    return `<g${this.getDataNodeId(node)}>
    ${
      label
        ? `<text x="${pos.x}" y="${pos.y - 6}"
          font-family="${this.fontFamily}"
          font-size="12"
          fill="${this.renderTheme.text}">${this.escapeXml(label)}</text>`
        : ''
    }
    <rect x="${pos.x}" y="${pos.y}"
          width="${pos.width}" height="${pos.height}"
          rx="6"
          fill="${this.renderTheme.cardBg}"
          stroke="#2D3748"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>
    <text x="${pos.x + 12}" y="${pos.y + pos.height / 2 + 5}"
          font-family="${this.fontFamily}"
          font-size="14"
          fill="${this.renderTheme.textMuted}">${this.escapeXml(placeholder)}</text>
    <text x="${pos.x + pos.width - 20}" y="${pos.y + pos.height / 2 + 5}"
          font-family="${this.fontFamily}"
          font-size="16"
          fill="${this.renderTheme.textMuted}">▼</text>
  </g>`;
  }

  /**
   * Render checkbox with sketch filter and Comic Sans
   */
  protected renderCheckbox(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || 'Checkbox');
    const checked = String(node.props.checked || 'false').toLowerCase() === 'true';

    const checkboxSize = 18;
    const checkboxY = pos.y + pos.height / 2 - checkboxSize / 2;

    return `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${checkboxY}"
          width="${checkboxSize}" height="${checkboxSize}"
          rx="4"
          fill="${checked ? '#3B82F6' : this.renderTheme.cardBg}"
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
            fill="#3B82F6"/>`
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

    const toggleWidth = 40;
    const toggleHeight = 20;
    const toggleY = pos.y + pos.height / 2 - toggleHeight / 2;

    return `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${toggleY}"
          width="${toggleWidth}" height="${toggleHeight}"
          rx="10"
          fill="${enabled ? '#3B82F6' : '#2D3748'}"
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
    const tabWidth = pos.width / tabs.length;

    let svg = `<g${this.getDataNodeId(node)}>
    <!-- Tab headers -->`;

    tabs.forEach((tab, i) => {
      const tabX = pos.x + i * tabWidth;
      const isActive = i === 0;

      svg += `
    <rect x="${tabX}" y="${pos.y}"
          width="${tabWidth}" height="44"
          fill="${isActive ? '#3B82F6' : 'transparent'}"
          stroke="${isActive ? '#3B82F6' : '#2D3748'}"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>
    <text x="${tabX + tabWidth / 2}" y="${pos.y + 28}"
          font-family="${this.fontFamily}"
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
          stroke="#2D3748"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>
  </g>`;
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
  protected renderStatCard(node: IRComponentNode, pos: any): string {
    const title = String(node.props.title || 'Metric');
    const value = String(node.props.value || '0');
    const caption = String(node.props.caption || '');

    // Inline spacing resolution
    const spacingMap: Record<string, number> = { none: 0, xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
    const padding = node.style.padding ? (spacingMap[node.style.padding] || 16) : 16;
    const innerX = pos.x + padding;
    const innerY = pos.y + padding;

    const valueSize = 32;
    const titleSize = 14;
    const captionSize = 12;
    const topGap = 8;
    const valueGap = 12;
    const captionGap = 12;

    const titleY = innerY + topGap + titleSize;
    const valueY = titleY + valueGap + valueSize;
    const captionY = valueY + captionGap + captionSize;

    let svg = `<g${this.getDataNodeId(node)}>
    <!-- StatCard Background -->
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
          fill="${this.renderTheme.textMuted}">${this.escapeXml(title)}</text>

    <!-- Value (Large) -->
    <text x="${innerX}" y="${valueY}"
          font-family="${this.fontFamily}"
          font-size="${valueSize}"
          font-weight="700"
          fill="${this.renderTheme.primary}">${this.escapeXml(value)}</text>`;

    if (caption) {
      svg += `
    <!-- Caption -->
    <text x="${innerX}" y="${captionY}"
          font-family="${this.fontFamily}"
          font-size="${captionSize}"
          fill="${this.renderTheme.textMuted}">${this.escapeXml(caption)}</text>`;
    }

    svg += `
  </g>`;
    return svg;
  }

  /**
   * Render image with sketch filter
   */
  protected renderImage(node: IRComponentNode, pos: any): string {
    return `<g${this.getDataNodeId(node)}>
    <!-- Image Background -->
    <rect x="${pos.x}" y="${pos.y}"
          width="${pos.width}" height="${pos.height}"
          fill="#E8E8E8"
          stroke="#2D3748"
          stroke-width="0.5"
          rx="4"
          filter="url(#sketch-rough)"/>

    <!-- Placeholder icon -->
    <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2}"
          font-family="${this.fontFamily}"
          font-size="24"
          fill="#666"
          text-anchor="middle">🖼</text>
  </g>`;
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
    const items = itemsStr.split(',').map((s) => s.trim());

    const itemHeight = 40;
    const fontSize = 14;
    const activeIndex = Number(node.props.active || 0);

    let svg = `<g${this.getDataNodeId(node)}>`;

    items.forEach((item, index) => {
      const itemY = pos.y + index * itemHeight;
      const isActive = index === activeIndex;
      const bgColor = isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent';
      const textColor = isActive ? '#3B82F6' : '#2D3748';
      const fontWeight = isActive ? '500' : '400';

      if (isActive) {
        svg += `
    <rect x="${pos.x}" y="${itemY}"
          width="${pos.width}" height="${itemHeight}"
          rx="6"
          fill="${bgColor}"
          filter="url(#sketch-rough)"/>`;
      }

      svg += `
    <text x="${pos.x + 12}" y="${itemY + itemHeight / 2 + 5}"
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
    const iconType = String(node.props.type || 'help-circle');
    const size = String(node.props.size || 'md');
    const iconSvg = getIcon(iconType);

    if (!iconSvg) {
      return `<g${this.getDataNodeId(node)}>
    <circle cx="${pos.x + pos.width / 2}" cy="${pos.y + pos.height / 2}"
            r="${Math.min(pos.width, pos.height) / 2 - 2}"
            fill="none" stroke="#2D3748" stroke-width="0.5"
            filter="url(#sketch-rough)"/>
    <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 4}"
          font-family="${this.fontFamily}"
          font-size="12" fill="#2D3748" text-anchor="middle">?</text>
  </g>`;
    }

    const sizeMap = { 'sm': 14, 'md': 18, 'lg': 24 };
    const iconSize = sizeMap[size as keyof typeof sizeMap] || 18;
    const iconColor = '#2D3748';
    const offsetX = pos.x + (pos.width - iconSize) / 2;
    const offsetY = pos.y + (pos.height - iconSize) / 2;

    return `<g${this.getDataNodeId(node)} transform="translate(${offsetX}, ${offsetY})">
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round">
      ${this.extractSvgContent(iconSvg)}
    </svg>
  </g>`;
  }

  /**
   * Render chart placeholder with sketch filter and Comic Sans
   */
  protected renderChartPlaceholder(node: IRComponentNode, pos: any): string {
    const type = String(node.props.type || 'bar');

    return `<g${this.getDataNodeId(node)}>
    <rect x="${pos.x}" y="${pos.y}"
          width="${pos.width}" height="${pos.height}"
          rx="8"
          fill="${this.renderTheme.cardBg}"
          stroke="#2D3748"
          stroke-width="0.5"
          filter="url(#sketch-rough)"/>
    <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2}"
          font-family="${this.fontFamily}"
          font-size="14"
          fill="${this.renderTheme.textMuted}"
          text-anchor="middle">[${this.escapeXml(type.toUpperCase())} CHART]</text>
  </g>`;
  }

  /**
   * Helper method to get icon SVG
   */
  private getIconSvg(iconName: string): string {
    return getIcon(iconName) || '';
  }
}
