import { z } from 'zod';
import {
  COMPONENTS,
  LAYOUTS,
  type ComponentMetadata,
  type LayoutMetadata,
  type PropertyMetadata,
} from '@wire-dsl/language-support/components';
import type {
  AST,
  ASTScreen,
  ASTLayout,
  ASTComponent,
  ASTCell,
  ASTDefinedComponent,
  ASTDefinedLayout,
} from '../parser/index';
import { resolveDevicePreset } from './device-presets';

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
  style: IRStyle;
  mocks: Record<string, unknown>;
  colors: Record<string, string>;
  screens: IRScreen[];
  nodes: Record<string, IRNode>;
}

export interface IRStyle {
  density: 'compact' | 'normal' | 'comfortable';
  spacing: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  stroke: 'thin' | 'normal' | 'thick';
  font: 'sm' | 'base' | 'lg';
  background?: string;
  theme?: string;  // Color scheme: "light" | "dark"
  device?: string;  // Device preset: "mobile" | "tablet" | "desktop" | "print" | "a4"
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
  style: IRNodeStyle;
  meta: IRMeta;
}

export interface IRComponentNode {
  id: string;
  kind: 'component';
  componentType: string;
  props: Record<string, string | number>;
  style: IRNodeStyle;
  meta: IRMeta;
}

export interface IRNodeStyle {
  padding?: string;
  gap?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  justify?: 'start' | 'center' | 'end';
  background?: string;
}

export interface IRMeta {
  source?: string;
  nodeId?: string;  // SourceMap nodeId for bidirectional selection
}

// Zod validation schemas
const IRStyleSchema = z.object({
  density: z.enum(['compact', 'normal', 'comfortable']),
  spacing: z.enum(['xs', 'sm', 'md', 'lg', 'xl']),
  radius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
  stroke: z.enum(['thin', 'normal', 'thick']),
  font: z.enum(['sm', 'base', 'lg']),
  background: z.string().optional(),
  theme: z.string().optional(),
  device: z.string().optional(),
});

const IRNodeStyleSchema = z.object({
  padding: z.string().optional(),
  gap: z.string().optional(),
  align: z.enum(['left', 'center', 'right', 'justify']).optional(),
  justify: z.enum(['start', 'center', 'end']).optional(),
  background: z.string().optional(),
});

const IRMetaSchema = z.object({
  source: z.string().optional(),
  nodeId: z.string().optional(),
});

const IRContainerNodeSchema = z.object({
  id: z.string(),
  kind: z.literal('container'),
  containerType: z.enum(['stack', 'grid', 'split', 'panel', 'card']),
  params: z.record(z.string(), z.union([z.string(), z.number()])),
  children: z.array(z.object({ ref: z.string() })),
  style: IRNodeStyleSchema,
  meta: IRMetaSchema,
});

const IRComponentNodeSchema = z.object({
  id: z.string(),
  kind: z.literal('component'),
  componentType: z.string(),
  props: z.record(z.string(), z.union([z.string(), z.number()])),
  style: IRNodeStyleSchema,
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
  style: IRStyleSchema,
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

type ExpansionTargetKind = 'component-property' | 'layout-parameter';

interface ExpansionContext {
  args: Record<string, string | number>;
  providedArgNames: Set<string>;
  usedArgNames: Set<string>;
  definitionName: string;
  definitionKind: 'component' | 'layout';
  allowChildrenSlot: boolean;
  childrenSlot?: ASTComponent | ASTLayout | ASTCell;
}

export class IRGenerator {
  private idGen = new IDGenerator();
  private nodes: Record<string, IRNode> = {};
  private definedComponents: Map<string, ASTDefinedComponent> = new Map();
  private definedLayouts: Map<string, ASTDefinedLayout> = new Map();
  private definedComponentIndices: Map<string, number> = new Map();
  private undefinedComponentsUsed: Set<string> = new Set();
  private warnings: Array<{ message: string; type: string }> = [];
  private errors: Array<{ message: string; type: string }> = [];
  private style: IRStyle = {
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
    this.definedLayouts.clear();
    this.definedComponentIndices.clear();
    this.undefinedComponentsUsed.clear();
    this.warnings = [];
    this.errors = [];

    // Register defined components first (symbol table) with their indices
    if (ast.definedComponents && ast.definedComponents.length > 0) {
      ast.definedComponents.forEach((def, index) => {
        this.definedComponents.set(def.name, def);
        this.definedComponentIndices.set(def.name, index);
      });
    }
    if (ast.definedLayouts && ast.definedLayouts.length > 0) {
      ast.definedLayouts.forEach((def) => {
        this.definedLayouts.set(def.name, def);
      });
    }

    // Apply style from AST
    this.applyStyle(ast.style);

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

    if (this.errors.length > 0) {
      const messages = this.errors.map((e) => `- [${e.type}] ${e.message}`).join('\n');
      throw new Error(`IR generation failed with semantic errors:\n${messages}`);
    }

    const project: IRProject = {
      id: this.sanitizeId(ast.name),
      name: ast.name,
      style: this.style,
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

  private applyStyle(astStyle: Record<string, string>): void {
    if (astStyle.density) {
      this.style.density = astStyle.density as IRStyle['density'];
    }
    if (astStyle.spacing) {
      this.style.spacing = astStyle.spacing as IRStyle['spacing'];
    }
    if (astStyle.radius) {
      this.style.radius = astStyle.radius as IRStyle['radius'];
    }
    if (astStyle.stroke) {
      this.style.stroke = astStyle.stroke as IRStyle['stroke'];
    }
    if (astStyle.font) {
      this.style.font = astStyle.font as IRStyle['font'];
    }
    if (astStyle.background) {
      this.style.background = astStyle.background;
    }
    if (astStyle.theme) {
      this.style.theme = astStyle.theme;
    }
    if (astStyle.device) {
      this.style.device = astStyle.device;
    }
  }

  private convertScreen(screen: ASTScreen, screenIndex: number): IRScreen {
    const rootNodeId = this.convertLayout(screen.layout);

    // Resolve viewport dimensions from device preset or use desktop default.
    const viewport = this.style.device
      ? resolveDevicePreset(this.style.device)
      : resolveDevicePreset('desktop');

    const irScreen: IRScreen = {
      id: this.sanitizeId(screen.name),
      name: screen.name,
      viewport: {
        width: viewport.width,
        height: viewport.minHeight,
      }, // Height is a minimum baseline; final render height remains dynamic
      root: { ref: rootNodeId },
    };

    // Add background if specified on screen, otherwise use style default
    if (screen.params.background) {
      irScreen.background = String(screen.params.background);
    } else if (this.style.background) {
      irScreen.background = this.style.background;
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

  private convertLayout(layout: ASTLayout, context?: ExpansionContext): string {
    const layoutParams = this.resolveLayoutParams(layout.layoutType, layout.params, context);
    const layoutChildren = layout.children;

    const layoutDefinition = this.definedLayouts.get(layout.layoutType);
    if (layoutDefinition) {
      return this.expandDefinedLayout(layoutDefinition, layoutParams, layoutChildren, context);
    }

    const nodeId = this.idGen.generate('node');
    const childRefs: Array<{ ref: string }> = [];

    // Process children
    for (const child of layoutChildren) {
      if (child.type === 'layout') {
        const childId = this.convertLayout(child, context);
        if (childId) childRefs.push({ ref: childId });
      } else if (child.type === 'component') {
        const childId = this.convertComponent(child, context);
        if (childId) childRefs.push({ ref: childId });
      } else if (child.type === 'cell') {
        const childId = this.convertCell(child, context);
        if (childId) childRefs.push({ ref: childId });
      }
    }

    // Extract style properties
    const style: IRNodeStyle = {};
    if (layoutParams.padding !== undefined) {
      style.padding = String(layoutParams.padding);
    } else {
      // Layouts without explicit padding have no padding by default
      style.padding = 'none';
    }
    if (layoutParams.gap !== undefined) {
      style.gap = String(layoutParams.gap);
    }
    if (layoutParams.align !== undefined) {
      style.align = layoutParams.align as IRNodeStyle['align'];
    }
    if (layoutParams.background !== undefined) {
      style.background = String(layoutParams.background);
    }

    const containerNode: IRContainerNode = {
      id: nodeId,
      kind: 'container',
      containerType: layout.layoutType as 'stack' | 'grid' | 'split' | 'panel' | 'card',
      params: this.cleanParams(layoutParams),
      children: childRefs,
      style,
      meta: {
        nodeId: layout._meta?.nodeId,  // Pass SourceMap nodeId from AST
      },
    };

    this.nodes[nodeId] = containerNode;
    return nodeId;
  }

  private convertCell(cell: ASTCell, context?: ExpansionContext): string {
    const nodeId = this.idGen.generate('node');
    const childRefs: Array<{ ref: string }> = [];

    // Process children
    for (const child of cell.children) {
      if (child.type === 'layout') {
        const childId = this.convertLayout(child, context);
        if (childId) childRefs.push({ ref: childId });
      } else if (child.type === 'component') {
        const childId = this.convertComponent(child, context);
        if (childId) childRefs.push({ ref: childId });
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
      meta: { 
        source: 'cell',
        nodeId: cell._meta?.nodeId,  // Pass SourceMap nodeId from AST
      },
    };

    this.nodes[nodeId] = containerNode;
    return nodeId;
  }

  private convertComponent(component: ASTComponent, context?: ExpansionContext): string | null {
    if (component.componentType === 'Children') {
      if (!context?.allowChildrenSlot) {
        this.errors.push({
          type: 'children-slot-outside-layout-definition',
          message: '"Children" placeholder can only be used inside a define Layout body.',
        });
        return null;
      }
      if (!context.childrenSlot) {
        this.errors.push({
          type: 'children-slot-missing-child',
          message: `Layout "${context.definitionName}" requires exactly one child for "Children".`,
        });
        return null;
      }
      return this.convertASTNode(context.childrenSlot, context);
    }

    const resolvedProps = this.resolveComponentProps(component.componentType, component.props, context);

    // Check if this component is a defined component (should be expanded)
    const definition = this.definedComponents.get(component.componentType);
    if (definition) {
      // Expand the defined component
      return this.expandDefinedComponent(definition, resolvedProps, context);
    }

    // Check if it's a known built-in component
    const builtInComponents = new Set([
      'Button', 'Input', 'Heading', 'Text', 'Label', 'Image', 
      'Card', 'StatCard', 'Topbar', 'Table', 'Chart', 'ChartPlaceholder',
      'Textarea', 'Select', 'Checkbox', 'Toggle', 'Divider', 'Breadcrumbs',
      'SidebarMenu', 'Radio', 'Icon', 'IconButton', 'Alert', 'Badge', 'Modal', 'List', 'Sidebar', 'Tabs', 'Code', 'Link', 'Separate'
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
      props: resolvedProps,
      style: {},
      meta: {
        nodeId: component._meta?.nodeId,  // Pass SourceMap nodeId from AST
      },
    };

    this.nodes[nodeId] = componentNode;
    return nodeId;
  }

  private expandDefinedComponent(
    definition: ASTDefinedComponent,
    invocationArgs: Record<string, string | number>,
    parentContext?: ExpansionContext
  ): string | null {
    const context: ExpansionContext = {
      args: invocationArgs,
      providedArgNames: new Set(Object.keys(invocationArgs)),
      usedArgNames: new Set<string>(),
      definitionName: definition.name,
      definitionKind: 'component',
      allowChildrenSlot: false,
    };

    // A defined component's body is either a layout or a component
    // We need to expand it recursively
    if (definition.body.type === 'layout') {
      const result = this.convertLayout(definition.body, context);
      this.reportUnusedArguments(context);
      return result;
    } else if (definition.body.type === 'component') {
      const result = this.convertComponent(definition.body, context);
      this.reportUnusedArguments(context);
      return result;
    } else {
      throw new Error(`Invalid defined component body type for "${definition.name}"`);
    }
  }

  private expandDefinedLayout(
    definition: ASTDefinedLayout,
    invocationParams: Record<string, string | number>,
    invocationChildren: (ASTComponent | ASTLayout | ASTCell)[],
    parentContext?: ExpansionContext
  ): string {
    if (invocationChildren.length !== 1) {
      this.errors.push({
        type: 'layout-children-arity',
        message: `Layout "${definition.name}" expects exactly one child, received ${invocationChildren.length}.`,
      });
    }

    const rawSlot = invocationChildren[0];
    const resolvedSlot = rawSlot
      ? this.resolveChildrenSlot(rawSlot, parentContext)
      : undefined;

    const context: ExpansionContext = {
      args: invocationParams,
      providedArgNames: new Set(Object.keys(invocationParams)),
      usedArgNames: new Set<string>(),
      definitionName: definition.name,
      definitionKind: 'layout',
      allowChildrenSlot: true,
      childrenSlot: resolvedSlot,
    };

    const nodeId = this.convertLayout(definition.body, context);
    this.reportUnusedArguments(context);
    return nodeId;
  }

  private resolveChildrenSlot(
    slot: ASTComponent | ASTLayout | ASTCell,
    parentContext?: ExpansionContext
  ): ASTComponent | ASTLayout | ASTCell | undefined {
    if (slot.type === 'component' && slot.componentType === 'Children') {
      if (parentContext?.allowChildrenSlot) {
        return parentContext.childrenSlot;
      }
      this.errors.push({
        type: 'children-slot-outside-layout-definition',
        message: '"Children" placeholder forwarding is only valid inside define Layout bodies.',
      });
      return undefined;
    }
    return slot;
  }

  private convertASTNode(node: ASTLayout | ASTComponent | ASTCell, context?: ExpansionContext): string | null {
    if (node.type === 'layout') return this.convertLayout(node, context);
    if (node.type === 'component') return this.convertComponent(node, context);
    return this.convertCell(node, context);
  }

  private resolveLayoutParams(
    layoutType: string,
    params: Record<string, string | number>,
    context?: ExpansionContext
  ): Record<string, string | number> {
    const resolved: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(params)) {
      const resolvedValue = this.resolveBindingValue(
        value,
        context,
        'layout-parameter',
        layoutType,
        key
      );
      if (resolvedValue !== undefined) {
        resolved[key] = resolvedValue;
      }
    }
    return resolved;
  }

  private resolveComponentProps(
    componentType: string,
    props: Record<string, string | number>,
    context?: ExpansionContext
  ): Record<string, string | number> {
    const resolved: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(props)) {
      const resolvedValue = this.resolveBindingValue(
        value,
        context,
        'component-property',
        componentType,
        key
      );
      if (resolvedValue !== undefined) {
        resolved[key] = resolvedValue;
      }
    }
    return resolved;
  }

  private resolveBindingValue(
    value: string | number,
    context: ExpansionContext | undefined,
    kind: ExpansionTargetKind,
    targetType: string,
    targetName: string
  ): string | number | undefined {
    if (typeof value !== 'string' || !value.startsWith('prop_')) {
      return value;
    }

    const argName = value.slice('prop_'.length);
    if (!context) {
      return value;
    }

    if (Object.prototype.hasOwnProperty.call(context.args, argName)) {
      context.usedArgNames.add(argName);
      return context.args[argName];
    }

    const required = this.isBindingTargetRequired(kind, targetType, targetName);
    const descriptor = kind === 'component-property' ? 'property' : 'parameter';
    const message =
      `Missing required bound ${descriptor} "${targetName}" for ${kind === 'component-property' ? 'component' : 'layout'} ` +
      `"${targetType}" in ${context.definitionKind} "${context.definitionName}" (expected arg "${argName}").`;

    if (required) {
      this.errors.push({ type: 'missing-required-bound-value', message });
    } else {
      this.warnings.push({
        type: 'missing-bound-value',
        message:
          `Optional ${descriptor} "${targetName}" in ${kind === 'component-property' ? 'component' : 'layout'} ` +
          `"${targetType}" was omitted because arg "${argName}" was not provided while expanding ` +
          `${context.definitionKind} "${context.definitionName}".`,
      });
    }

    return undefined;
  }

  private isBindingTargetRequired(
    kind: ExpansionTargetKind,
    targetType: string,
    targetName: string
  ): boolean {
    if (kind === 'component-property') {
      const metadata = COMPONENTS[targetType as keyof typeof COMPONENTS] as ComponentMetadata | undefined;
      const property = metadata?.properties?.[targetName] as PropertyMetadata | undefined;
      if (!property) return false;
      return property.required === true && property.defaultValue === undefined;
    }

    const layoutMetadata = LAYOUTS[targetType as keyof typeof LAYOUTS] as LayoutMetadata | undefined;
    if (!layoutMetadata) return false;
    const property = layoutMetadata.properties?.[targetName] as PropertyMetadata | undefined;
    const requiredFromProperty = property?.required === true && property.defaultValue === undefined;
    const requiredFromLayout = (layoutMetadata.requiredProperties || []).includes(targetName);
    return requiredFromProperty || requiredFromLayout;
  }

  private reportUnusedArguments(context: ExpansionContext): void {
    for (const arg of context.providedArgNames) {
      if (!context.usedArgNames.has(arg)) {
        this.warnings.push({
          type: 'unused-definition-argument',
          message:
            `Argument "${arg}" is not used by ${context.definitionKind} "${context.definitionName}".`,
        });
      }
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
