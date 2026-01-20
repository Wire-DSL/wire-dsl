import type { IRContract, IRNode, IRComponentNode } from '../ir/index';
import type { LayoutResult } from '../layout/index';

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
  },
  dark: {
    bg: '#0F172A',
    cardBg: '#1E293B',
    border: '#334155',
    text: '#F1F5F9',
    textMuted: '#94A3B8',
    primary: '#60A5FA',
    primaryHover: '#3B82F6',
  },
};

// ============================================================================
// SVG RENDERER CLASS
// ============================================================================

export class SVGRenderer {
  private ir: IRContract;
  private layout: LayoutResult;
  private options: Required<SVGRenderOptions>;
  private theme: typeof THEMES.light;

  constructor(ir: IRContract, layout: LayoutResult, options?: SVGRenderOptions) {
    this.ir = ir;
    this.layout = layout;
    this.options = {
      width: options?.width || 1280,
      height: options?.height || 720,
      theme: options?.theme || 'light',
      includeLabels: options?.includeLabels ?? true,
    };
    this.theme = THEMES[this.options.theme];
  }

  render(): string {
    const screen = this.ir.project.screens[0];
    if (!screen) return '<svg></svg>';

    const rootId = screen.root.ref;
    const children: string[] = [];

    // Render root and all children
    this.renderNode(rootId, children);

    // Build SVG
    return `<svg width="${this.options.width}" height="${this.options.height}" viewBox="0 0 ${this.options.width} ${this.options.height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${this.theme.bg}"/>
  ${children.join('\n  ')}
</svg>`;
  }

  private renderNode(nodeId: string, output: string[]): void {
    const node = this.ir.project.nodes[nodeId];
    const pos = this.layout[nodeId];

    if (!node || !pos) return;

    if (node.kind === 'container') {
      // Render container (usually invisible, just layout)
      node.children.forEach((childRef) => {
        this.renderNode(childRef.ref, output);
      });
    } else if (node.kind === 'component') {
      // Render component
      const componentSvg = this.renderComponent(node, pos);
      if (componentSvg) {
        output.push(componentSvg);
      }
    }
  }

  private renderComponent(
    node: IRComponentNode,
    pos: { x: number; y: number; width: number; height: number }
  ): string {
    switch (node.componentType) {
      case 'Heading':
        return this.renderHeading(node, pos);
      case 'Button':
        return this.renderButton(node, pos);
      case 'Input':
        return this.renderInput(node, pos);
      case 'Card':
        return this.renderCard(node, pos);
      case 'Topbar':
        return this.renderTopbar(node, pos);
      case 'Table':
        return this.renderTable(node, pos);
      case 'ChartPlaceholder':
        return this.renderChartPlaceholder(node, pos);
      default:
        return this.renderGenericComponent(node, pos);
    }
  }

  private renderHeading(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || 'Heading');
    const fontSize = 20;

    return `<g>
    <text x="${pos.x + 8}" y="${pos.y + pos.height / 2 + 6}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="${fontSize}" 
          font-weight="600" 
          fill="${this.theme.text}">${this.escapeXml(text)}</text>
  </g>`;
  }

  private renderButton(node: IRComponentNode, pos: any): string {
    const text = String(node.props.text || 'Button');
    const variant = String(node.props.variant || 'default');

    const bgColor = variant === 'primary' ? this.theme.primary : this.theme.cardBg;
    const textColor = variant === 'primary' ? '#FFFFFF' : this.theme.text;
    const borderColor = variant === 'primary' ? this.theme.primary : this.theme.border;

    return `<g>
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          rx="6" 
          fill="${bgColor}" 
          stroke="${borderColor}" 
          stroke-width="1"/>
    <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 5}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="14" 
          font-weight="500" 
          fill="${textColor}" 
          text-anchor="middle">${this.escapeXml(text)}</text>
  </g>`;
  }

  private renderInput(node: IRComponentNode, pos: any): string {
    const label = String(node.props.label || '');
    const placeholder = String(node.props.placeholder || '');

    return `<g>
    ${
      label
        ? `<text x="${pos.x}" y="${pos.y - 6}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="12" 
          fill="${this.theme.text}">${this.escapeXml(label)}</text>`
        : ''
    }
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          rx="6" 
          fill="${this.theme.cardBg}" 
          stroke="${this.theme.border}" 
          stroke-width="1"/>
    <text x="${pos.x + 12}" y="${pos.y + pos.height / 2 + 5}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="14" 
          fill="${this.theme.textMuted}">${this.escapeXml(placeholder)}</text>
  </g>`;
  }

  private renderCard(node: IRComponentNode, pos: any): string {
    const title = String(node.props.title || 'Card');

    return `<g>
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          rx="8" 
          fill="${this.theme.cardBg}" 
          stroke="${this.theme.border}" 
          stroke-width="1"/>
    <text x="${pos.x + 16}" y="${pos.y + 28}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="14" 
          font-weight="600" 
          fill="${this.theme.text}">${this.escapeXml(title)}</text>
    <text x="${pos.x + 16}" y="${pos.y + 56}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="24" 
          font-weight="700" 
          fill="${this.theme.text}">1,234</text>
  </g>`;
  }

  private renderTopbar(node: IRComponentNode, pos: any): string {
    const title = String(node.props.title || 'App');

    return `<g>
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          fill="${this.theme.cardBg}" 
          stroke="${this.theme.border}" 
          stroke-width="1"/>
    <text x="${pos.x + 16}" y="${pos.y + pos.height / 2 + 6}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="16" 
          font-weight="600" 
          fill="${this.theme.text}">${this.escapeXml(title)}</text>
  </g>`;
  }

  private renderTable(node: IRComponentNode, pos: any): string {
    const columns = String(node.props.columns || 'Col1,Col2,Col3').split(',');
    const rowsMock = Number(node.props.rowsMock || 3);

    const headerHeight = 40;
    const rowHeight = 36;
    const colWidth = pos.width / columns.length;

    let svg = `<g>
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          rx="8" 
          fill="${this.theme.cardBg}" 
          stroke="${this.theme.border}" 
          stroke-width="1"/>`;

    // Header
    columns.forEach((col, i) => {
      svg += `
    <text x="${pos.x + i * colWidth + 16}" y="${pos.y + 26}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="12" 
          font-weight="600" 
          fill="${this.theme.textMuted}">${this.escapeXml(col.trim())}</text>`;
    });

    // Rows
    for (let row = 0; row < rowsMock; row++) {
      const rowY = pos.y + headerHeight + row * rowHeight;
      svg += `
    <line x1="${pos.x}" y1="${rowY}" x2="${pos.x + pos.width}" y2="${rowY}" 
          stroke="${this.theme.border}" stroke-width="1"/>`;
    }

    svg += '\n  </g>';
    return svg;
  }

  private renderChartPlaceholder(node: IRComponentNode, pos: any): string {
    const type = String(node.props.type || 'bar');

    return `<g>
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          rx="8" 
          fill="${this.theme.cardBg}" 
          stroke="${this.theme.border}" 
          stroke-width="1"/>
    <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="14" 
          fill="${this.theme.textMuted}" 
          text-anchor="middle">[${this.escapeXml(type.toUpperCase())} CHART]</text>
  </g>`;
  }

  private renderGenericComponent(node: IRComponentNode, pos: any): string {
    return `<g>
    <rect x="${pos.x}" y="${pos.y}" 
          width="${pos.width}" height="${pos.height}" 
          rx="4" 
          fill="${this.theme.cardBg}" 
          stroke="${this.theme.border}" 
          stroke-width="1" 
          stroke-dasharray="4 4"/>
    <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="12" 
          fill="${this.theme.textMuted}" 
          text-anchor="middle">${node.componentType}</text>
  </g>`;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
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
