/**
 * Skeleton SVG Renderer
 *
 * Renders wireframes in a skeleton/loading state style:
 * - Text/Heading: Gray rectangular blocks instead of text
 * - Buttons: Shape outline only (no text, no fill)
 * - Icons: Hidden completely
 * - Tables: Gray blocks where text would appear
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
   * Render button as outline only (no text)
   */
  protected renderButton(node: IRComponentNode, pos: any): string {
    const variant = String(node.props.variant || 'default');
    const buttonWidth = Math.max(pos.width, 60);

    const borderColor = variant === 'primary'
      ? 'rgba(59, 130, 246, 0.7)'
      : 'rgba(100, 116, 139, 0.4)';

    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${pos.y}"
            width="${buttonWidth}" height="${pos.height}"
            rx="${this.tokens.button.radius}"
            fill="none"
            stroke="${borderColor}"
            stroke-width="1"/>
    </g>`;
  }

  /**
   * Render heading as gray block
   */
  protected renderHeading(node: IRComponentNode, pos: any): string {
    return this.renderSkeletonBlock(node, pos, 'heading');
  }

  /**
   * Render text as gray block
   */
  protected renderText(node: IRComponentNode, pos: any): string {
    return this.renderSkeletonBlock(node, pos, 'text');
  }

  /**
   * Hide icons in skeleton mode
   */
  protected renderIcon(node: IRComponentNode, pos: any): string {
    return '';
  }

  /**
   * Private helper: Render skeleton block (gray rectangle)
   */
  private renderSkeletonBlock(
    node: IRComponentNode,
    pos: any,
    type: 'heading' | 'text'
  ): string {
    const text = String(
      type === 'heading'
        ? node.props.text
        : node.props.content || 'Text content'
    );

    // Calculate dimensions based on text length and density tokens
    const fontSize = type === 'heading' ? this.tokens.heading.fontSize : this.tokens.text.fontSize;
    const charWidth = fontSize * 0.6;
    const blockWidth = Math.min(text.length * charWidth, pos.width);
    const blockHeight = fontSize + 4;

    // Use theme border color for skeleton blocks
    const blockColor = this.renderTheme.border;

    return `<g${this.getDataNodeId(node)}>
      <rect x="${pos.x}" y="${pos.y + (pos.height - blockHeight) / 2}"
            width="${blockWidth}" height="${blockHeight}"
            rx="4"
            fill="${blockColor}"/>
    </g>`;
  }
}
