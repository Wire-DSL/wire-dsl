import { z } from 'zod';
import type { AST, ASTScreen, ASTLayout, ASTComponent, ASTCell } from '../parser/index';

/**
 * Intermediate Representation (IR) Generator
 *
 * Transforms AST to normalized IR (JSON format)
 * - Applies defaults from tokens
 * - Generates unique IDs
 * - Validates structure with Zod
 */

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export interface IRContract {
  irVersion: string;
  project: IRProject;
}

export interface IRProject {
  id: string;
  name: string;
  tokens: IRTokens;
  screens: IRScreen[];
  nodes: Record<string, IRNode>;
}

export interface IRTokens {
  density: 'compact' | 'normal' | 'comfortable';
  spacing: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  stroke: 'thin' | 'normal' | 'thick';
  font: 'sm' | 'base' | 'lg';
}

export interface IRScreen {
  id: string;
  name: string;
  viewport: { width: number; height: number };
  root: { ref: string };
}

export type IRNode = IRContainerNode | IRComponentNode;

export interface IRContainerNode {
  id: string;
  kind: 'container';
  containerType: 'stack' | 'grid' | 'split';
  params: Record<string, string | number>;
  children: Array<{ ref: string }>;
  style: IRStyle;
  meta: IRMeta;
}

export interface IRComponentNode {
  id: string;
  kind: 'component';
  componentType: string;
  props: Record<string, string | number>;
  style: IRStyle;
  meta: IRMeta;
}

export interface IRStyle {
  padding?: string;
  gap?: string;
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end';
}

export interface IRMeta {
  source?: string;
}

// Zod validation schemas
const IRTokensSchema = z.object({
  density: z.enum(['compact', 'normal', 'comfortable']),
  spacing: z.enum(['xs', 'sm', 'md', 'lg', 'xl']),
  radius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
  stroke: z.enum(['thin', 'normal', 'thick']),
  font: z.enum(['sm', 'base', 'lg']),
});

const IRStyleSchema = z.object({
  padding: z.string().optional(),
  gap: z.string().optional(),
  align: z.enum(['start', 'center', 'end']).optional(),
  justify: z.enum(['start', 'center', 'end']).optional(),
});

const IRMetaSchema = z.object({
  source: z.string().optional(),
});

const IRContainerNodeSchema = z.object({
  id: z.string(),
  kind: z.literal('container'),
  containerType: z.enum(['stack', 'grid', 'split']),
  params: z.record(z.union([z.string(), z.number()])),
  children: z.array(z.object({ ref: z.string() })),
  style: IRStyleSchema,
  meta: IRMetaSchema,
});

const IRComponentNodeSchema = z.object({
  id: z.string(),
  kind: z.literal('component'),
  componentType: z.string(),
  props: z.record(z.union([z.string(), z.number()])),
  style: IRStyleSchema,
  meta: IRMetaSchema,
});

const IRNodeSchema = z.union([IRContainerNodeSchema, IRComponentNodeSchema]);

const IRScreenSchema = z.object({
  id: z.string(),
  name: z.string(),
  viewport: z.object({ width: z.number(), height: z.number() }),
  root: z.object({ ref: z.string() }),
});

const IRProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  tokens: IRTokensSchema,
  screens: z.array(IRScreenSchema),
  nodes: z.record(IRNodeSchema),
});

const IRContractSchema = z.object({
  irVersion: z.string(),
  project: IRProjectSchema,
});

// ============================================================================
// ID GENERATOR
// ============================================================================

class IDGenerator {
  private counters: Map<string, number> = new Map();

  generate(prefix: string): string {
    const current = this.counters.get(prefix) || 0;
    const next = current + 1;
    this.counters.set(prefix, next);
    return `${prefix}_${next}`;
  }

  reset(): void {
    this.counters.clear();
  }
}

// ============================================================================
// IR GENERATOR
// ============================================================================

export class IRGenerator {
  private idGen = new IDGenerator();
  private nodes: Record<string, IRNode> = {};
  private tokens: IRTokens = {
    density: 'normal',
    spacing: 'md',
    radius: 'md',
    stroke: 'normal',
    font: 'base',
  };

  generate(ast: AST): IRContract {
    this.idGen.reset();
    this.nodes = {};

    // Apply tokens from AST
    this.applyTokens(ast.tokens);

    // Convert screens
    const screens: IRScreen[] = ast.screens.map((screen) => this.convertScreen(screen));

    const project: IRProject = {
      id: this.sanitizeId(ast.name),
      name: ast.name,
      tokens: this.tokens,
      screens,
      nodes: this.nodes,
    };

    const ir: IRContract = {
      irVersion: '1.0',
      project,
    };

    // Validate with Zod
    return IRContractSchema.parse(ir);
  }

  private applyTokens(astTokens: Record<string, string>): void {
    if (astTokens.density) {
      this.tokens.density = astTokens.density as IRTokens['density'];
    }
    if (astTokens.spacing) {
      this.tokens.spacing = astTokens.spacing as IRTokens['spacing'];
    }
    if (astTokens.radius) {
      this.tokens.radius = astTokens.radius as IRTokens['radius'];
    }
    if (astTokens.stroke) {
      this.tokens.stroke = astTokens.stroke as IRTokens['stroke'];
    }
    if (astTokens.font) {
      this.tokens.font = astTokens.font as IRTokens['font'];
    }
  }

  private convertScreen(screen: ASTScreen): IRScreen {
    const rootNodeId = this.convertLayout(screen.layout);

    return {
      id: this.sanitizeId(screen.name),
      name: screen.name,
      viewport: { width: 1280, height: 720 },
      root: { ref: rootNodeId },
    };
  }

  private convertLayout(layout: ASTLayout): string {
    const nodeId = this.idGen.generate('node');
    const childRefs: Array<{ ref: string }> = [];

    // Process children
    for (const child of layout.children) {
      if (child.type === 'layout') {
        const childId = this.convertLayout(child);
        childRefs.push({ ref: childId });
      } else if (child.type === 'component') {
        const childId = this.convertComponent(child);
        childRefs.push({ ref: childId });
      } else if (child.type === 'cell') {
        const childId = this.convertCell(child);
        childRefs.push({ ref: childId });
      }
    }

    // Extract style properties
    const style: IRStyle = {};
    if (layout.params.padding) {
      style.padding = String(layout.params.padding);
    }
    if (layout.params.gap) {
      style.gap = String(layout.params.gap);
    }
    if (layout.params.align) {
      style.align = layout.params.align as IRStyle['align'];
    }

    const containerNode: IRContainerNode = {
      id: nodeId,
      kind: 'container',
      containerType: layout.layoutType as 'stack' | 'grid' | 'split',
      params: this.cleanParams(layout.params),
      children: childRefs,
      style,
      meta: {},
    };

    this.nodes[nodeId] = containerNode;
    return nodeId;
  }

  private convertCell(cell: ASTCell): string {
    const nodeId = this.idGen.generate('node');
    const childRefs: Array<{ ref: string }> = [];

    // Process children
    for (const child of cell.children) {
      if (child.type === 'layout') {
        const childId = this.convertLayout(child);
        childRefs.push({ ref: childId });
      } else if (child.type === 'component') {
        const childId = this.convertComponent(child);
        childRefs.push({ ref: childId });
      }
    }

    // Cell is treated as a container with cell-specific params
    const containerNode: IRContainerNode = {
      id: nodeId,
      kind: 'container',
      containerType: 'stack', // Cells contain content in a stack by default
      params: cell.props,
      children: childRefs,
      style: {},
      meta: { source: 'cell' },
    };

    this.nodes[nodeId] = containerNode;
    return nodeId;
  }

  private convertComponent(component: ASTComponent): string {
    const nodeId = this.idGen.generate('node');

    const componentNode: IRComponentNode = {
      id: nodeId,
      kind: 'component',
      componentType: component.componentType,
      props: component.props,
      style: {},
      meta: {},
    };

    this.nodes[nodeId] = componentNode;
    return nodeId;
  }

  private cleanParams(params: Record<string, string | number>): Record<string, string | number> {
    const cleaned: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(params)) {
      // Skip style-related params (already in style object)
      if (!['padding', 'gap', 'align', 'justify'].includes(key)) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  private sanitizeId(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

export function generateIR(ast: AST): IRContract {
  const generator = new IRGenerator();
  return generator.generate(ast);
}

// Backward compatibility
export interface IRWireframe {
  id: string;
  name: string;
  components: IRComponent[];
  layout: IRLayout;
  metadata: IRMetadata;
}

export interface IRComponent {
  id: string;
  type: string;
  label?: string;
  props?: Record<string, unknown>;
  children?: IRComponent[];
}

export interface IRLayout {
  width: number;
  height: number;
  gridCols: number;
  gridRows: number;
}

export interface IRMetadata {
  version: string;
  created: string;
  author?: string;
  description?: string;
}
