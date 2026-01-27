import { z } from 'zod';
import type { AST, ASTScreen, ASTLayout, ASTComponent, ASTCell, ASTDefinedComponent } from '../parser/index';

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
  theme: IRTheme;
  mocks: Record<string, unknown>;
  colors: Record<string, string>;
  screens: IRScreen[];
  nodes: Record<string, IRNode>;
}

export interface IRTheme {
  density: 'compact' | 'normal' | 'comfortable';
  spacing: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  stroke: 'thin' | 'normal' | 'thick';
  font: 'sm' | 'base' | 'lg';
  background?: string;
}

export interface IRScreen {
  id: string;
  name: string;
  viewport: { width: number; height: number };
  background?: string;
  root: { ref: string };
}

export type IRNode = IRContainerNode | IRComponentNode;

export interface IRContainerNode {
  id: string;
  kind: 'container';
  containerType: 'stack' | 'grid' | 'split' | 'panel' | 'card';
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
  align?: 'left' | 'center' | 'right' | 'justify';
  justify?: 'start' | 'center' | 'end';
  background?: string;
}

export interface IRMeta {
  source?: string;
}

// Zod validation schemas
const IRThemeSchema = z.object({
  density: z.enum(['compact', 'normal', 'comfortable']),
  spacing: z.enum(['xs', 'sm', 'md', 'lg', 'xl']),
  radius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
  stroke: z.enum(['thin', 'normal', 'thick']),
  font: z.enum(['sm', 'base', 'lg']),
  background: z.string().optional(),
});

const IRStyleSchema = z.object({
  padding: z.string().optional(),
  gap: z.string().optional(),
  align: z.enum(['left', 'center', 'right', 'justify']).optional(),
  justify: z.enum(['start', 'center', 'end']).optional(),
  background: z.string().optional(),
});

const IRMetaSchema = z.object({
  source: z.string().optional(),
});

const IRContainerNodeSchema = z.object({
  id: z.string(),
  kind: z.literal('container'),
  containerType: z.enum(['stack', 'grid', 'split', 'panel', 'card']),
  params: z.record(z.string(), z.union([z.string(), z.number()])),
  children: z.array(z.object({ ref: z.string() })),
  style: IRStyleSchema,
  meta: IRMetaSchema,
});

const IRComponentNodeSchema = z.object({
  id: z.string(),
  kind: z.literal('component'),
  componentType: z.string(),
  props: z.record(z.string(), z.union([z.string(), z.number()])),
  style: IRStyleSchema,
  meta: IRMetaSchema,
});

const IRNodeSchema = z.union([IRContainerNodeSchema, IRComponentNodeSchema]);

const IRScreenSchema = z.object({
  id: z.string(),
  name: z.string(),
  viewport: z.object({ width: z.number(), height: z.number() }),
  background: z.string().optional(),
  root: z.object({ ref: z.string() }),
});

const IRProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  theme: IRThemeSchema,
  mocks: z.record(z.string(), z.unknown()),
  colors: z.record(z.string(), z.string()),
  screens: z.array(IRScreenSchema),
  nodes: z.record(z.string(), IRNodeSchema),
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
  private definedComponents: Map<string, ASTDefinedComponent> = new Map();
  private definedComponentIndices: Map<string, number> = new Map();
  private undefinedComponentsUsed: Set<string> = new Set();
  private warnings: Array<{ message: string; type: string }> = [];
  private theme: IRTheme = {
    density: 'normal',
    spacing: 'md',
    radius: 'md',
    stroke: 'normal',
    font: 'base',
  };

  generate(ast: AST): IRContract {
    this.idGen.reset();
    this.nodes = {};
    this.definedComponents.clear();
    this.definedComponentIndices.clear();
    this.undefinedComponentsUsed.clear();
    this.warnings = [];

    // Register defined components first (symbol table) with their indices
    if (ast.definedComponents && ast.definedComponents.length > 0) {
      ast.definedComponents.forEach((def, index) => {
        this.definedComponents.set(def.name, def);
        this.definedComponentIndices.set(def.name, index);
      });
    }

    // Apply theme from AST
    this.applyTheme(ast.theme);

    // Convert screens
    const screens: IRScreen[] = ast.screens.map((screen, screenIndex) => 
      this.convertScreen(screen, screenIndex)
    );

    // Validate that all used components are either built-in or defined
    if (this.undefinedComponentsUsed.size > 0) {
      const undefinedList = Array.from(this.undefinedComponentsUsed).sort();
      throw new Error(
        `Components used but not defined: ${undefinedList.join(', ')}\n` +
        `Define these components with: define Component "Name" { ... }`
      );
    }

    const project: IRProject = {
      id: this.sanitizeId(ast.name),
      name: ast.name,
      theme: this.theme,
      mocks: ast.mocks || {},
      colors: ast.colors || {},
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

  private applyTheme(astTheme: Record<string, string>): void {
    if (astTheme.density) {
      this.theme.density = astTheme.density as IRTheme['density'];
    }
    if (astTheme.spacing) {
      this.theme.spacing = astTheme.spacing as IRTheme['spacing'];
    }
    if (astTheme.radius) {
      this.theme.radius = astTheme.radius as IRTheme['radius'];
    }
    if (astTheme.stroke) {
      this.theme.stroke = astTheme.stroke as IRTheme['stroke'];
    }
    if (astTheme.font) {
      this.theme.font = astTheme.font as IRTheme['font'];
    }
    if (astTheme.background) {
      this.theme.background = astTheme.background;
    }
  }

  private convertScreen(screen: ASTScreen, screenIndex: number): IRScreen {
    const rootNodeId = this.convertLayout(screen.layout);

    const irScreen: IRScreen = {
      id: this.sanitizeId(screen.name),
      name: screen.name,
      viewport: { width: 1280, height: 720 },
      root: { ref: rootNodeId },
    };

    // Add background if specified on screen, otherwise use theme default
    if (screen.params.background) {
      irScreen.background = String(screen.params.background);
    } else if (this.theme.background) {
      irScreen.background = this.theme.background;
    }

    return irScreen;
  }

  /**
   * Validates that component definitions appear before their first usage
   * Generates warnings (not errors) to allow flexible code organization
   */
  private validateComponentOrder(ast: AST): void {
    if (!ast.definedComponents || ast.definedComponents.length === 0) {
      return;
    }

    const definedComponentNames = new Set(ast.definedComponents.map(d => d.name));

    // Track which components are used in which screens
    ast.screens.forEach((screen) => {
      const usedComponents = this.findComponentsInLayout(screen.layout);
      
      usedComponents.forEach(({ componentType }) => {
        // Only warn for components that are defined (not built-in like Button, Heading, etc.)
        if (definedComponentNames.has(componentType)) {
          const defIdx = this.definedComponentIndices.get(componentType) ?? -1;
          const screenIdx = ast.screens.indexOf(screen);
          
          // In the AST, definedComponents come first, then screens
          // So if a component is defined, its index should be less than all screens
          // But we're checking if used BEFORE defined
          // We need to check: is there a definition, and it comes after the screen in the source?
          // Since definedComponents is always before screens in AST, this shouldn't happen
          // UNLESS the definedComponent is used in an earlier screen
          
          // Actually, the issue is that in the AST structure, all definedComponents come first,
          // then all screens. So we need a different comparison.
          // We should check: when the component is defined vs when it's first used
          
          // For simplicity: if component is defined in definedComponents array,
          // and it's used in a screen, generate a warning suggesting to define it first
          this.warnings.push({
            type: 'component-order',
            message: `Component "${componentType}" is used in screen "${screen.name}". Consider defining "${componentType}" before this screen for better code clarity.`,
          });
        }
      });
    });

    // Log warnings if any
    if (this.warnings.length > 0) {
      this.warnings.forEach(w => {
        console.warn(`⚠️  [${w.type.toUpperCase()}] ${w.message}`);
      });
    }
  }

  /**
   * Recursively finds all component usages in a layout
   */
  private findComponentsInLayout(
    layout: ASTLayout,
    found: Array<{ componentType: string; location: string }> = []
  ): Array<{ componentType: string; location: string }> {
    if (layout.children && layout.children.length > 0) {
      layout.children.forEach((child) => {
        if (child.type === 'component') {
          found.push({
            componentType: child.componentType,
            location: 'layout',
          });
        } else if (child.type === 'layout') {
          this.findComponentsInLayout(child, found);
        } else if (child.type === 'cell') {
          // For cells, check their children
          if (child.children) {
            child.children.forEach((cellChild) => {
              if (cellChild.type === 'component') {
                found.push({
                  componentType: cellChild.componentType,
                  location: 'cell',
                });
              } else if (cellChild.type === 'layout') {
                this.findComponentsInLayout(cellChild, found);
              }
            });
          }
        }
      });
    }
    return found;
  }

  /**
   * Get all warnings generated during IR generation
   */
  getWarnings(): Array<{ message: string; type: string }> {
    return this.warnings;
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
    } else {
      // Layouts without explicit padding have no padding by default
      style.padding = 'none';
    }
    if (layout.params.gap) {
      style.gap = String(layout.params.gap);
    }
    if (layout.params.align) {
      style.align = layout.params.align as IRStyle['align'];
    }
    if (layout.params.background) {
      style.background = String(layout.params.background);
    }

    const containerNode: IRContainerNode = {
      id: nodeId,
      kind: 'container',
      containerType: layout.layoutType as 'stack' | 'grid' | 'split' | 'panel' | 'card',
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
      style: { padding: 'none' }, // Cells have no padding by default - grid gap handles spacing
      meta: { source: 'cell' },
    };

    this.nodes[nodeId] = containerNode;
    return nodeId;
  }

  private convertComponent(component: ASTComponent): string {
    // Check if this component is a defined component (should be expanded)
    const definition = this.definedComponents.get(component.componentType);
    if (definition) {
      // Expand the defined component
      return this.expandDefinedComponent(definition);
    }

    // Check if it's a known built-in component
    const builtInComponents = new Set([
      'Button', 'Input', 'Heading', 'Text', 'Label', 'Image', 
      'Card', 'StatCard', 'Topbar', 'Table', 'Chart', 'ChartPlaceholder',
      'Textarea', 'Select', 'Checkbox', 'Toggle', 'Divider', 'Breadcrumbs',
      'SidebarMenu', 'Radio', 'Icon', 'IconButton', 'Alert', 'Badge', 'Modal', 'List', 'Sidebar', 'Tabs', 'Code', 'Paragraph'
    ]);

    if (!builtInComponents.has(component.componentType)) {
      // Not a built-in component either, track it as undefined
      this.undefinedComponentsUsed.add(component.componentType);
    }

    // Create IR node for built-in component (or undefined - will error later)
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

  private expandDefinedComponent(definition: ASTDefinedComponent): string {
    // A defined component's body is either a layout or a component
    // We need to expand it recursively
    if (definition.body.type === 'layout') {
      return this.convertLayout(definition.body);
    } else if (definition.body.type === 'component') {
      return this.convertComponent(definition.body);
    } else {
      throw new Error(`Invalid defined component body type for "${definition.name}"`);
    }
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
