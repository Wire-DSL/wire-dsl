import { Lexer, createToken, CstParser, TokenType } from 'chevrotain';
import { COMPONENTS, LAYOUTS, type PropertyMetadata } from '@wire-dsl/language-support/components';
import { SourceMapBuilder } from '../sourcemap/builder';
import type {
  ParseResult,
  ParseDiagnosticsResult,
  ParseError,
  SourceMapEntry,
  CodeRange,
  CapturedTokens,
} from '../sourcemap/types';

/**
 * WireDSL Parser
 *
 * Converts .wire files to AST using Chevrotain
 *
 * Supported layout types: stack, grid, split, panel, card
 * Component example: StatCard, Image, Button, Heading, Text, etc.
 *
 * Example:
 * ```
 * project "Dashboard" {
 *   screen Main {
 *     layout grid(columns: 3) {
 *       component StatCard
 *         title: "Revenue"
 *         value: "45,230"
 *         padding: lg
 *         gap: md
 *       
 *       component StatCard
 *         title: "Users"
 *         value: "1,234"
 *     }
 *     
 *     layout card(padding: lg, gap: md, radius: md) {
 *       component Image placeholder: "landscape"
 *       component Heading text: "Product Name"
 *       component Button text: "Learn More"
 *     }
 *   }
 * }
 * ```
 */

// ============================================================================
// TOKENS (Lexer)
// ============================================================================

// Keywords
const Project = createToken({ name: 'Project', pattern: /project\b/ });
const Screen = createToken({ name: 'Screen', pattern: /screen\b/ });
const Layout = createToken({ name: 'Layout', pattern: /layout\b/ });
const Component = createToken({ name: 'Component', pattern: /component\b/ });
const ComponentKeyword = createToken({
  name: 'ComponentKeyword',
  pattern: /Component\b/,
});
const LayoutKeyword = createToken({
  name: 'LayoutKeyword',
  pattern: /Layout\b/,
});
const Define = createToken({ name: 'Define', pattern: /define\b/ });
const Style = createToken({ name: 'Style', pattern: /style\b/ });
const Mocks = createToken({ name: 'Mocks', pattern: /mocks\b/ });
const Colors = createToken({ name: 'Colors', pattern: /colors(?=\s*\{)/ });
const Cell = createToken({ name: 'Cell', pattern: /cell\b/ });

// Punctuation
const LCurly = createToken({ name: 'LCurly', pattern: /{/ });
const RCurly = createToken({ name: 'RCurly', pattern: /}/ });
const LParen = createToken({ name: 'LParen', pattern: /\(/ });
const RParen = createToken({ name: 'RParen', pattern: /\)/ });
const Colon = createToken({ name: 'Colon', pattern: /:/ });
const Comma = createToken({ name: 'Comma', pattern: /,/ });

// Literals
const StringLiteral = createToken({
  name: 'StringLiteral',
  pattern: /"(?:[^"\\]|\\.)*"/,
});

const NumberLiteral = createToken({
  name: 'NumberLiteral',
  pattern: /\d+(\.\d+)?/,
});

const HexColor = createToken({
  name: 'HexColor',
  pattern: /#[0-9A-Fa-f]{6}/,
});

const Identifier = createToken({
  name: 'Identifier',
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*/,
});

// Whitespace (ignored)
const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

// Line Comment (ignored)
const LineComment = createToken({
  name: 'LineComment',
  pattern: /\/\/[^\n]*/,
  group: Lexer.SKIPPED,
});

// Block Comment (ignored) - supports /* ... */
const BlockComment = createToken({
  name: 'BlockComment',
  pattern: /\/\*[\s\S]*?\*\//,
  group: Lexer.SKIPPED,
});

// Token order matters! Keywords before Identifier
const allTokens = [
  WhiteSpace,
  BlockComment, // Must come before LineComment to avoid conflicts
  LineComment,
  // Keywords (must come before Identifier)
  Project,
  Screen,
  Layout,
  LayoutKeyword,
  ComponentKeyword,
  Component,
  Define,
  Style,
  Mocks,
  Colors,
  Cell,
  // Punctuation
  LCurly,
  RCurly,
  LParen,
  RParen,
  Colon,
  Comma,
  // Literals
  StringLiteral,
  NumberLiteral,
  HexColor,
  Identifier,
];

const WireDSLLexer = new Lexer(allTokens);

// ============================================================================
// PARSER (Grammar Rules)
// ============================================================================

class WireDSLParser extends CstParser {
  constructor() {
    super(allTokens);
    this.performSelfAnalysis();
  }

  // Root rule: project definition
  public project = this.RULE('project', () => {
    this.CONSUME(Project);
    this.CONSUME(StringLiteral, { LABEL: 'projectName' });
    this.CONSUME(LCurly);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.definedComponent) },
        { ALT: () => this.SUBRULE(this.definedLayout) },
        { ALT: () => this.SUBRULE(this.styleDecl) },
        { ALT: () => this.SUBRULE(this.mocksDecl) },
        { ALT: () => this.SUBRULE(this.colorsDecl) },
        { ALT: () => this.SUBRULE(this.screen) },
      ]);
    });
    this.CONSUME(RCurly);
  });

  // style { density: "normal" }
  private styleDecl = this.RULE('styleDecl', () => {
    this.CONSUME(Style);
    this.CONSUME(LCurly);
    this.MANY(() => {
      this.SUBRULE(this.styleProperty);
    });
    this.CONSUME(RCurly);
  });

  // density: "normal"
  private styleProperty = this.RULE('styleProperty', () => {
    this.CONSUME(Identifier, { LABEL: 'styleKey' });
    this.CONSUME(Colon);
    this.CONSUME(StringLiteral, { LABEL: 'styleValue' });
  });

  // mocks { status: "A,B,C" ... }
  private mocksDecl = this.RULE('mocksDecl', () => {
    this.CONSUME(Mocks);
    this.CONSUME(LCurly);
    this.MANY(() => {
      this.SUBRULE(this.mockEntry);
    });
    this.CONSUME(RCurly);
  });

  // status: "A,B,C"
  private mockEntry = this.RULE('mockEntry', () => {
    this.CONSUME(Identifier, { LABEL: 'mockKey' });
    this.CONSUME(Colon);
    this.CONSUME(StringLiteral, { LABEL: 'mockValue' });
  });

  // colors { primary: #3B82F6, ... }
  private colorsDecl = this.RULE('colorsDecl', () => {
    this.CONSUME(Colors);
    this.CONSUME(LCurly);
    this.MANY(() => {
      this.SUBRULE(this.colorEntry);
    });
    this.CONSUME(RCurly);
  });

  // primary: #3B82F6 or primary: lightBlue
  private colorEntry = this.RULE('colorEntry', () => {
    this.CONSUME(Identifier, { LABEL: 'colorKey' });
    this.CONSUME(Colon);
    this.OR([
      { ALT: () => this.CONSUME(HexColor, { LABEL: 'colorValue' }) },
      { ALT: () => this.CONSUME2(Identifier, { LABEL: 'colorValue' }) },
    ]);
  });

  // define Component "ButtonGroup" { layout stack { ... } }
  private definedComponent = this.RULE('definedComponent', () => {
    this.CONSUME(Define);
    this.CONSUME(ComponentKeyword, { LABEL: 'componentKeyword' });
    this.CONSUME(StringLiteral, { LABEL: 'componentName' });
    this.CONSUME(LCurly);
    this.OR([
      { ALT: () => this.SUBRULE(this.layout) },
      { ALT: () => this.SUBRULE(this.component) },
    ]);
    this.CONSUME(RCurly);
  });

  // define Layout "ScreenShell" { layout split { ... } }
  private definedLayout = this.RULE('definedLayout', () => {
    this.CONSUME(Define);
    this.CONSUME(LayoutKeyword, { LABEL: 'layoutKeyword' });
    this.CONSUME(StringLiteral, { LABEL: 'layoutName' });
    this.CONSUME(LCurly);
    this.SUBRULE(this.layout);
    this.CONSUME(RCurly);
  });

  // screen Main(background: white) { ... }
  private screen = this.RULE('screen', () => {
    this.CONSUME(Screen);
    this.CONSUME(Identifier, { LABEL: 'screenName' });
    this.OPTION(() => {
      this.SUBRULE(this.paramList);
    });
    this.CONSUME(LCurly);
    this.SUBRULE(this.layout);
    this.CONSUME(RCurly);
  });

  // layout stack(...) { ... }
  private layout = this.RULE('layout', () => {
    this.CONSUME(Layout);
    this.CONSUME(Identifier, { LABEL: 'layoutType' });
    this.OPTION(() => {
      this.SUBRULE(this.paramList);
    });
    this.CONSUME(LCurly);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.component) },
        { ALT: () => this.SUBRULE2(this.layout) },
        { ALT: () => this.SUBRULE(this.cell) },
      ]);
    });
    this.CONSUME(RCurly);
  });

  // cell span: 4 { ... }
  private cell = this.RULE('cell', () => {
    this.CONSUME(Cell);
    this.MANY(() => {
      this.SUBRULE(this.property);
    });
    this.CONSUME(LCurly);
    this.MANY2(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.component) },
        { ALT: () => this.SUBRULE(this.layout) },
      ]);
    });
    this.CONSUME(RCurly);
  });

  // component Heading text: "Hello"
  private component = this.RULE('component', () => {
    this.CONSUME(Component);
    this.CONSUME(Identifier, { LABEL: 'componentType' });
    this.MANY(() => {
      this.SUBRULE(this.property);
    });
  });

  // property: key: value
  private property = this.RULE('property', () => {
    this.CONSUME(Identifier, { LABEL: 'propKey' });
    this.CONSUME(Colon);
    this.OR([
      { ALT: () => this.CONSUME(StringLiteral, { LABEL: 'propValue' }) },
      { ALT: () => this.CONSUME(NumberLiteral, { LABEL: 'propValue' }) },
      { ALT: () => this.CONSUME2(Identifier, { LABEL: 'propValue' }) },
    ]);
  });

  // (param1: value1, param2: value2)
  private paramList = this.RULE('paramList', () => {
    this.CONSUME(LParen);
    this.MANY_SEP({
      SEP: Comma,
      DEF: () => {
        this.SUBRULE(this.property);
      },
    });
    this.CONSUME(RParen);
  });
}

// ============================================================================
// AST TYPES
// ============================================================================

export interface AST {
  type: 'project';
  name: string;
  style: Record<string, string>;
  mocks: Record<string, string>;
  colors: Record<string, string>;
  definedComponents: ASTDefinedComponent[];
  definedLayouts: ASTDefinedLayout[];
  screens: ASTScreen[];
  _meta?: {
    nodeId: string;
  };
}

export interface ASTDefinedComponent {
  type: 'definedComponent';
  name: string;
  body: ASTLayout | ASTComponent;
  _meta?: {
    nodeId: string;
  };
}

export interface ASTScreen {
  type: 'screen';
  name: string;
  params: Record<string, string | number>;
  layout: ASTLayout;
  _meta?: {
    nodeId: string;
  };
}

export interface ASTLayout {
  type: 'layout';
  layoutType: string;
  params: Record<string, string | number>;
  children: (ASTComponent | ASTLayout | ASTCell)[];
  _meta?: {
    nodeId: string;
  };
}

export interface ASTCell {
  type: 'cell';
  props: Record<string, string | number>;
  children: (ASTComponent | ASTLayout)[];
  _meta?: {
    nodeId: string;
  };
}

export interface ASTComponent {
  type: 'component';
  componentType: string;
  props: Record<string, string | number>;
  _meta?: {
    nodeId: string;
  };
}

// ============================================================================
// CST VISITOR (Converts CST to AST)
// ============================================================================

const parserInstance = new WireDSLParser();
const BaseCstVisitor = parserInstance.getBaseCstVisitorConstructor();

class WireDSLVisitor extends BaseCstVisitor {
  protected sourceMapBuilder?: SourceMapBuilder;

  constructor() {
    super();
    this.validateVisitor();
  }

  project(ctx: any): AST {
    const projectName = ctx.projectName[0].image.slice(1, -1); // Remove quotes
    const style: Record<string, string> = {};
    const mocks: Record<string, string> = {};
    const colors: Record<string, string> = {};
    const definedComponents: ASTDefinedComponent[] = [];
    const definedLayouts: ASTDefinedLayout[] = [];
    const screens: ASTScreen[] = [];

    if (ctx.styleDecl && ctx.styleDecl.length > 0) {
      const styleBlock = this.visit(ctx.styleDecl[0]);
      Object.assign(style, styleBlock);
    }

    if (ctx.mocksDecl && ctx.mocksDecl.length > 0) {
      const mocksBlock = this.visit(ctx.mocksDecl[0]);
      Object.assign(mocks, mocksBlock);
    }

    if (ctx.colorsDecl && ctx.colorsDecl.length > 0) {
      const colorsBlock = this.visit(ctx.colorsDecl[0]);
      Object.assign(colors, colorsBlock);
    }

    if (ctx.definedComponent) {
      ctx.definedComponent.forEach((comp: any) => {
        definedComponents.push(this.visit(comp));
      });
    }
    if (ctx.definedLayout) {
      ctx.definedLayout.forEach((layoutDef: any) => {
        definedLayouts.push(this.visit(layoutDef));
      });
    }

    if (ctx.screen) {
      ctx.screen.forEach((screen: any) => {
        screens.push(this.visit(screen));
      });
    }

    return {
      type: 'project',
      name: projectName,
      style,
      mocks,
      colors,
      definedComponents,
      definedLayouts,
      screens,
    };
  }

  styleDecl(ctx: any) {
    const style: Record<string, string> = {};
    if (ctx.styleProperty) {
      ctx.styleProperty.forEach((prop: any) => {
        const { key, value } = this.visit(prop);
        style[key] = value;
      });
    }
    return style;
  }

  styleProperty(ctx: any) {
    const key = ctx.styleKey[0].image;
    const value = ctx.styleValue[0].image.slice(1, -1); // Remove quotes
    return { key, value };
  }

  mocksDecl(ctx: any) {
    const mocks: Record<string, string> = {};
    if (ctx.mockEntry) {
      ctx.mockEntry.forEach((entry: any) => {
        const { key, value } = this.visit(entry);
        mocks[key] = value;
      });
    }
    return mocks;
  }

  mockEntry(ctx: any) {
    const key = ctx.mockKey[0].image;
    const value = ctx.mockValue[0].image.slice(1, -1); // Remove quotes
    return { key, value };
  }

  colorsDecl(ctx: any) {
    const colors: Record<string, string> = {};
    if (ctx.colorEntry) {
      ctx.colorEntry.forEach((entry: any) => {
        const { key, value } = this.visit(entry);
        colors[key] = value;
      });
    }
    return colors;
  }

  colorEntry(ctx: any) {
    const key = ctx.colorKey[0].image;
    const value = ctx.colorValue[0].image; // Keep as-is (hex or identifier)
    return { key, value };
  }

  definedComponent(ctx: any): ASTDefinedComponent {
    const name = ctx.componentName[0].image.slice(1, -1); // Remove quotes

    // Body can be either a layout or a component
    let body: ASTLayout | ASTComponent;
    if (ctx.layout && ctx.layout.length > 0) {
      body = this.visit(ctx.layout[0]);
    } else if (ctx.component && ctx.component.length > 0) {
      body = this.visit(ctx.component[0]);
    } else {
      throw new Error(`Defined component "${name}" must contain either a layout or component`);
    }

    return {
      type: 'definedComponent',
      name,
      body,
    };
  }

  definedLayout(ctx: any): ASTDefinedLayout {
    const name = ctx.layoutName[0].image.slice(1, -1); // Remove quotes
    const body = this.visit(ctx.layout[0]);
    return {
      type: 'definedLayout',
      name,
      body,
    };
  }

  screen(ctx: any): ASTScreen {
    const params = ctx.paramList ? this.visit(ctx.paramList[0]) : {};
    return {
      type: 'screen',
      name: ctx.screenName[0].image,
      params,
      layout: this.visit(ctx.layout[0]),
    };
  }

  layout(ctx: any): ASTLayout {
    const layoutType = ctx.layoutType[0].image;
    const params: Record<string, string | number> = {};
    const children: (ASTComponent | ASTLayout | ASTCell)[] = [];

    if (ctx.paramList) {
      const paramResult = this.visit(ctx.paramList);
      Object.assign(params, paramResult);
    }

    // Process children in the order they appear in the input
    // We need to merge component, layout, and cell arrays while preserving order
    const childNodes: Array<{ type: string; node: any; index: number }> = [];

    if (ctx.component) {
      ctx.component.forEach((comp: any) => {
        // Get the token position from the CST node (always present in Chevrotain)
        const startToken = comp.children?.Component?.[0] || comp.children?.componentType?.[0];
        childNodes.push({ type: 'component', node: comp, index: startToken.startOffset });
      });
    }
    if (ctx.layout) {
      ctx.layout.forEach((layout: any) => {
        const startToken = layout.children?.Layout?.[0] || layout.children?.layoutType?.[0];
        childNodes.push({ type: 'layout', node: layout, index: startToken.startOffset });
      });
    }
    if (ctx.cell) {
      ctx.cell.forEach((cell: any) => {
        const startToken = cell.children?.Cell?.[0];
        childNodes.push({ type: 'cell', node: cell, index: startToken.startOffset });
      });
    }

    // Sort by token position in source
    childNodes.sort((a, b) => a.index - b.index);

    childNodes.forEach((item) => {
      if (item.type === 'component') {
        children.push(this.visit(item.node));
      } else if (item.type === 'layout') {
        children.push(this.visit(item.node));
      } else if (item.type === 'cell') {
        children.push(this.visit(item.node));
      }
    });

    return {
      type: 'layout',
      layoutType,
      params,
      children,
    };
  }

  cell(ctx: any): ASTCell {
    const props: Record<string, string | number> = {};
    const children: (ASTComponent | ASTLayout)[] = [];

    if (ctx.property) {
      ctx.property.forEach((prop: any) => {
        const result = this.visit(prop);
        props[result.key] = result.value;
      });
    }

    // Process children in the order they appear in the input
    const childNodes: Array<{ type: string; node: any; index: number }> = [];

    if (ctx.component) {
      ctx.component.forEach((comp: any) => {
        const startToken = comp.children?.Component?.[0] || comp.children?.componentType?.[0];
        childNodes.push({ type: 'component', node: comp, index: startToken.startOffset });
      });
    }
    if (ctx.layout) {
      ctx.layout.forEach((layout: any) => {
        const startToken = layout.children?.Layout?.[0] || layout.children?.layoutType?.[0];
        childNodes.push({ type: 'layout', node: layout, index: startToken.startOffset });
      });
    }

    // Sort by token position in source
    childNodes.sort((a, b) => a.index - b.index);

    childNodes.forEach((item) => {
      if (item.type === 'component') {
        children.push(this.visit(item.node));
      } else if (item.type === 'layout') {
        children.push(this.visit(item.node));
      }
    });

    return {
      type: 'cell',
      props,
      children,
    };
  }

  component(ctx: any): ASTComponent {
    const componentType = ctx.componentType[0].image;
    const props: Record<string, string | number> = {};

    if (ctx.property) {
      ctx.property.forEach((prop: any) => {
        const result = this.visit(prop);
        props[result.key] = result.value;
      });
    }

    return {
      type: 'component',
      componentType,
      props,
    };
  }

  property(ctx: any) {
    const key = ctx.propKey[0].image;
    const rawValue: string = ctx.propValue[0].image;
    let value: string | number = rawValue;

    // Remove quotes from strings
    if (typeof rawValue === 'string' && rawValue.startsWith('"')) {
      value = rawValue.slice(1, -1);
    }
    // Parse numbers
    else if (!isNaN(Number(rawValue))) {
      value = Number(rawValue);
    }

    return { key, value };
  }

  paramList(ctx: any): Record<string, string | number> {
    const params: Record<string, string | number> = {};

    if (ctx.property) {
      ctx.property.forEach((prop: any) => {
        const result = this.visit(prop);
        params[result.key] = result.value;
      });
    }

    return params;
  }
}

// ============================================================================
// VISITOR WITH SOURCEMAP SUPPORT
// ============================================================================

class WireDSLVisitorWithSourceMap extends WireDSLVisitor {
  private definedComponentNames = new Set<string>();
  private definedLayoutNames = new Set<string>();

  constructor(sourceMapBuilder: SourceMapBuilder) {
    super();
    this.sourceMapBuilder = sourceMapBuilder;
  }

  project(ctx: any): AST {
    const projectName = ctx.projectName[0].image.slice(1, -1); // Remove quotes
    const style: Record<string, string> = {};
    const mocks: Record<string, string> = {};
    const colors: Record<string, string> = {};
    const definedComponents: ASTDefinedComponent[] = [];
    const definedLayouts: ASTDefinedLayout[] = [];
    const screens: ASTScreen[] = [];

    // Capture tokens for project node
    const tokens: CapturedTokens = {
      keyword: ctx.Project[0],
      name: ctx.projectName[0],
      body: ctx.RCurly[0],
    };

    const ast: AST = {
      type: 'project',
      name: projectName,
      style: {},
      mocks: {},
      colors: {},
      definedComponents: [],  // Will be filled after push
      definedLayouts: [],  // Will be filled after push
      screens: [],  // Will be filled after push
    };

    // Add to SourceMap BEFORE visiting children
    if (this.sourceMapBuilder) {
      const nodeId = this.sourceMapBuilder.addNode(
        'project',
        tokens,
        { name: projectName }
      );
      // Inject nodeId into AST
      ast._meta = { nodeId };
      // Project is root, so we push it as parent for style/screens/components
      this.sourceMapBuilder.pushParent(nodeId);
    }

    // Process style, mocks, colors AFTER pushParent so they have project as parent
    if (ctx.styleDecl && ctx.styleDecl.length > 0) {
      const styleBlock = this.visit(ctx.styleDecl[0]);
      Object.assign(ast.style, styleBlock);
    }

    if (ctx.mocksDecl && ctx.mocksDecl.length > 0) {
      const mocksBlock = this.visit(ctx.mocksDecl[0]);
      Object.assign(ast.mocks, mocksBlock);
    }

    if (ctx.colorsDecl && ctx.colorsDecl.length > 0) {
      const colorsBlock = this.visit(ctx.colorsDecl[0]);
      Object.assign(ast.colors, colorsBlock);
    }

    // Now visit defined components and screens (children will have correct parent)
    if (ctx.definedComponent) {
      ctx.definedComponent.forEach((comp: any) => {
        ast.definedComponents.push(this.visit(comp));
      });
    }
    if (ctx.definedLayout) {
      ctx.definedLayout.forEach((layoutDef: any) => {
        ast.definedLayouts.push(this.visit(layoutDef));
      });
    }

    if (ctx.screen) {
      ctx.screen.forEach((screen: any) => {
        ast.screens.push(this.visit(screen));
      });
    }

    // Don't pop parent for project (it's root)

    return ast;
  }

  screen(ctx: any): ASTScreen {
    // Build AST manually (same as parent, but with SourceMap tracking)
    const params = ctx.paramList ? this.visit(ctx.paramList[0]) : {};
    const screenName = ctx.screenName[0].image;
    
    // Capture tokens
    const tokens: CapturedTokens = {
      keyword: ctx.Screen[0],
      name: ctx.screenName[0],
      paramList: ctx.paramList?.[0],
      body: ctx.RCurly[0],
    };

    const ast: ASTScreen = {
      type: 'screen',
      name: screenName,
      params,
      layout: {} as any,  // Will be filled after push
    };

    // Add to SourceMap BEFORE visiting children
    if (this.sourceMapBuilder) {
      const nodeId = this.sourceMapBuilder.addNode(
        'screen',
        tokens,
        { name: screenName }
      );
      // Inject nodeId into AST
      ast._meta = { nodeId };
      // Push as parent for layout/components inside
      this.sourceMapBuilder.pushParent(nodeId);
    }
    
    // Now visit layout (children will have correct parent)
    ast.layout = this.visit(ctx.layout[0]);
    
    // Pop parent after processing
    if (this.sourceMapBuilder) {
      this.sourceMapBuilder.popParent();
    }

    return ast;
  }

  layout(ctx: any): ASTLayout {
    // Build AST manually
    const layoutType = ctx.layoutType[0].image;
    const params: Record<string, string | number> = {};

    if (ctx.paramList) {
      const paramResult = this.visit(ctx.paramList);
      Object.assign(params, paramResult);
    }

    // Capture tokens
    const tokens: CapturedTokens = {
      keyword: ctx.Layout[0],
      name: ctx.layoutType[0],
      paramList: ctx.paramList?.[0],
      body: ctx.RCurly[0],
    };

    const ast: ASTLayout = {
      type: 'layout',
      layoutType,
      params,
      children: [],  // Will be filled after push
    };

    // Add to SourceMap BEFORE visiting children
    if (this.sourceMapBuilder) {
      const nodeId = this.sourceMapBuilder.addNode(
        'layout',
        tokens,
        { layoutType }
      );
      // Inject nodeId into AST
      ast._meta = { nodeId };

      // Add properties from paramList to SourceMap
      if (ctx.paramList && ctx.paramList[0]?.children?.property) {
        ctx.paramList[0].children.property.forEach((propCtx: any) => {
          const propResult = this.visit(propCtx);
          this.sourceMapBuilder!.addProperty(
            nodeId,
            propResult.key,
            propResult.value,
            {
              name: propCtx.children.propKey[0],
              value: propCtx.children.propValue[0],
            }
          );
        });
      }

      // Push as parent for children
      this.sourceMapBuilder.pushParent(nodeId);
    }

    // Process children in order (same logic as parent)
    const childNodes: Array<{ type: string; node: any; index: number }> = [];

    if (ctx.component) {
      ctx.component.forEach((comp: any) => {
        const startToken = comp.children?.Component?.[0] || comp.children?.componentType?.[0];
        childNodes.push({ type: 'component', node: comp, index: startToken.startOffset });
      });
    }
    if (ctx.layout) {
      ctx.layout.forEach((layout: any) => {
        const startToken = layout.children?.Layout?.[0] || layout.children?.layoutType?.[0];
        childNodes.push({ type: 'layout', node: layout, index: startToken.startOffset });
      });
    }
    if (ctx.cell) {
      ctx.cell.forEach((cell: any) => {
        const startToken = cell.children?.Cell?.[0];
        childNodes.push({ type: 'cell', node: cell, index: startToken.startOffset });
      });
    }

    // Sort by position
    childNodes.sort((a, b) => a.index - b.index);

    // Visit children (will have correct parent from stack)
    childNodes.forEach((item) => {
      ast.children.push(this.visit(item.node));
    });

    // Pop parent
    if (this.sourceMapBuilder) {
      this.sourceMapBuilder.popParent();
    }

    return ast;
  }

  cell(ctx: any): ASTCell {
    // Build AST manually
    const props: Record<string, string | number> = {};

    if (ctx.property) {
      ctx.property.forEach((prop: any) => {
        const result = this.visit(prop);
        props[result.key] = result.value;
      });
    }

    // Capture tokens
    const tokens: CapturedTokens = {
      keyword: ctx.Cell[0],
      properties: ctx.property || [],
      body: ctx.RCurly[0],
    };

    const ast: ASTCell = {
      type: 'cell',
      props,
      children: [],  // Will be filled after push
    };

    // Add to SourceMap BEFORE visiting children
    if (this.sourceMapBuilder) {
      const nodeId = this.sourceMapBuilder.addNode(
        'cell',
        tokens
      );
      // Inject nodeId into AST
      ast._meta = { nodeId };

      // Add properties to SourceMap
      if (ctx.property) {
        ctx.property.forEach((propCtx: any) => {
          const propResult = this.visit(propCtx);
          this.sourceMapBuilder!.addProperty(
            nodeId,
            propResult.key,
            propResult.value,
            {
              name: propCtx.children.propKey[0],
              value: propCtx.children.propValue[0],
            }
          );
        });
      }

      // Push as parent for children
      this.sourceMapBuilder.pushParent(nodeId);
    }

    // Process children in order
    const childNodes: Array<{ type: string; node: any; index: number }> = [];

    if (ctx.component) {
      ctx.component.forEach((comp: any) => {
        const startToken = comp.children?.Component?.[0] || comp.children?.componentType?.[0];
        childNodes.push({ type: 'component', node: comp, index: startToken.startOffset });
      });
    }
    if (ctx.layout) {
      ctx.layout.forEach((layout: any) => {
        const startToken = layout.children?.Layout?.[0] || layout.children?.layoutType?.[0];
        childNodes.push({ type: 'layout', node: layout, index: startToken.startOffset });
      });
    }

    childNodes.sort((a, b) => a.index - b.index);

    childNodes.forEach((item) => {
      ast.children.push(this.visit(item.node));
    });

    // Pop parent
    if (this.sourceMapBuilder) {
      this.sourceMapBuilder.popParent();
    }

    return ast;
  }

  component(ctx: any): ASTComponent {
    // Capture tokens
    const tokens: CapturedTokens = {
      keyword: ctx.Component[0],
      name: ctx.componentType[0],
      properties: ctx.property || [],
    };

    // Call parent to get AST
    const ast = super.component(ctx);

    // Add to SourceMap
    if (this.sourceMapBuilder) {
      // Check if this is a user-defined component
      const isUserDefined = this.definedComponentNames.has(ast.componentType);

      const nodeId = this.sourceMapBuilder.addNode(
        'component',
        tokens,
        { 
          componentType: ast.componentType,
          isUserDefined
        }
      );
      // Inject nodeId into AST
      ast._meta = { nodeId };

      // Add properties to SourceMap
      if (ctx.property) {
        ctx.property.forEach((propCtx: any) => {
          const propResult = this.visit(propCtx);
          this.sourceMapBuilder!.addProperty(
            nodeId,
            propResult.key,
            propResult.value,
            {
              name: propCtx.children.propKey[0],
              value: propCtx.children.propValue[0],
            }
          );
        });
      }
    }

    return ast;
  }

  definedComponent(ctx: any): ASTDefinedComponent {
    // Build AST manually
    const name = ctx.componentName[0].image.slice(1, -1); // Remove quotes

    // Track this component as user-defined
    this.definedComponentNames.add(name);

    // Capture tokens
    const tokens: CapturedTokens = {
      keyword: ctx.Define[0],
      name: ctx.componentName[0],
      body: ctx.RCurly[0],
    };

    // Body can be either a layout or a component
    let body: ASTLayout | ASTComponent;

    const ast: ASTDefinedComponent = {
      type: 'definedComponent',
      name,
      body: {} as any,  // Will be filled after push
    };

    // Add to SourceMap BEFORE visiting body
    if (this.sourceMapBuilder) {
      const nodeId = this.sourceMapBuilder.addNode(
        'component-definition',
        tokens,
        { name }
      );
      // Inject nodeId into AST
      ast._meta = { nodeId };
      // Push as parent for body
      this.sourceMapBuilder.pushParent(nodeId);
    }

    // Visit body
    if (ctx.layout && ctx.layout.length > 0) {
      body = this.visit(ctx.layout[0]);
    } else if (ctx.component && ctx.component.length > 0) {
      body = this.visit(ctx.component[0]);
    } else {
      throw new Error(`Defined component "${name}" must contain either a layout or component`);
    }

    ast.body = body;

    // Pop parent
    if (this.sourceMapBuilder) {
      this.sourceMapBuilder.popParent();
    }

    return ast;
  }

  definedLayout(ctx: any): ASTDefinedLayout {
    const name = ctx.layoutName[0].image.slice(1, -1); // Remove quotes
    this.definedLayoutNames.add(name);

    const tokens: CapturedTokens = {
      keyword: ctx.Define[0],
      name: ctx.layoutName[0],
      body: ctx.RCurly[0],
    };

    const ast: ASTDefinedLayout = {
      type: 'definedLayout',
      name,
      body: {} as any, // Will be filled after push
    };

    if (this.sourceMapBuilder) {
      const nodeId = this.sourceMapBuilder.addNode(
        'layout-definition',
        tokens,
        { name }
      );
      ast._meta = { nodeId };
      this.sourceMapBuilder.pushParent(nodeId);
    }

    ast.body = this.visit(ctx.layout[0]);

    if (this.sourceMapBuilder) {
      this.sourceMapBuilder.popParent();
    }

    return ast;
  }

  // Override styleDecl to capture style block in SourceMap
  styleDecl(ctx: any): Record<string, string> {
    const style: Record<string, string> = {};

    // Capture tokens for style block
    const tokens: CapturedTokens = {
      keyword: ctx.Style[0],
      body: ctx.RCurly[0],
    };

    // Add style node to SourceMap
    if (this.sourceMapBuilder) {
      const nodeId = this.sourceMapBuilder.addNode(
        'style',
        tokens,
        { name: 'style' }
      );

      // Process style properties
      if (ctx.styleProperty) {
        ctx.styleProperty.forEach((propCtx: any) => {
          const { key, value } = this.visit(propCtx);
          style[key] = value;

          // Add property to SourceMap with precise ranges
          this.sourceMapBuilder!.addProperty(
            nodeId,
            key,
            value,
            {
              name: propCtx.children.styleKey[0],
              value: propCtx.children.styleValue[0],
            }
          );
        });
      }
    } else {
      // No SourceMap builder, just collect properties
      if (ctx.styleProperty) {
        ctx.styleProperty.forEach((prop: any) => {
          const { key, value } = this.visit(prop);
          style[key] = value;
        });
      }
    }

    return style;
  }

  // Override mocksDecl to capture mocks block in SourceMap
  mocksDecl(ctx: any): Record<string, string> {
    const mocks: Record<string, string> = {};
    
    // Capture tokens for mocks block
    const tokens: CapturedTokens = {
      keyword: ctx.Mocks[0],
      body: ctx.RCurly[0],
    };

    // Add mocks node to SourceMap
    if (this.sourceMapBuilder) {
      const nodeId = this.sourceMapBuilder.addNode(
        'mocks',
        tokens,
        { name: 'mocks' }
      );

      // Process mock entries
      if (ctx.mockEntry) {
        ctx.mockEntry.forEach((entryCtx: any) => {
          const { key, value } = this.visit(entryCtx);
          mocks[key] = value;

          // Add property to SourceMap with precise ranges
          this.sourceMapBuilder!.addProperty(
            nodeId,
            key,
            value,
            {
              name: entryCtx.children.mockKey[0],
              value: entryCtx.children.mockValue[0],
            }
          );
        });
      }
    } else {
      // No SourceMap builder, just collect entries
      if (ctx.mockEntry) {
        ctx.mockEntry.forEach((entry: any) => {
          const { key, value } = this.visit(entry);
          mocks[key] = value;
        });
      }
    }

    return mocks;
  }

  // Override colorsDecl to capture colors block in SourceMap
  colorsDecl(ctx: any): Record<string, string> {
    const colors: Record<string, string> = {};
    
    // Capture tokens for colors block
    const tokens: CapturedTokens = {
      keyword: ctx.Colors[0],
      body: ctx.RCurly[0],
    };

    // Add colors node to SourceMap
    if (this.sourceMapBuilder) {
      const nodeId = this.sourceMapBuilder.addNode(
        'colors',
        tokens,
        { name: 'colors' }
      );

      // Process color entries
      if (ctx.colorEntry) {
        ctx.colorEntry.forEach((entryCtx: any) => {
          const { key, value } = this.visit(entryCtx);
          colors[key] = value;

          // Add property to SourceMap with precise ranges
          this.sourceMapBuilder!.addProperty(
            nodeId,
            key,
            value,
            {
              name: entryCtx.children.colorKey[0],
              value: entryCtx.children.colorValue[0],
            }
          );
        });
      }
    } else {
      // No SourceMap builder, just collect entries
      if (ctx.colorEntry) {
        ctx.colorEntry.forEach((entry: any) => {
          const { key, value } = this.visit(entry);
          colors[key] = value;
        });
      }
    }

    return colors;
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

const visitor = new WireDSLVisitor();

export interface ParseWireDSLWithSourceMapOptions {
  throwOnError?: boolean;
  includeSemanticWarnings?: boolean;
}

export interface ASTDefinedLayout {
  type: 'definedLayout';
  name: string;
  body: ASTLayout;
  _meta?: {
    nodeId: string;
  };
}

type SemanticComponentRules = {
  allowedProps: string[];
  requiredProps: string[];
  enumProps: Record<string, readonly string[]>;
  booleanProps: Set<string>;
};

type SemanticLayoutRules = {
  allowedParams: string[];
  requiredParams: string[];
  enumParams: Record<string, readonly string[]>;
};

function getEnumOptions(property: PropertyMetadata): readonly string[] | undefined {
  if (property.type === 'enum' && Array.isArray(property.options)) {
    return property.options;
  }
  return undefined;
}

function buildComponentRulesFromMetadata(): Record<string, SemanticComponentRules> {
  return Object.fromEntries(
    Object.entries(COMPONENTS).map(([componentName, metadata]) => {
      const allowedProps = Object.keys(metadata.properties);
      const requiredProps = Object.entries(metadata.properties)
        .filter(([, property]) => property.required === true && property.defaultValue === undefined)
        .map(([propertyName]) => propertyName);
      const enumProps: Record<string, readonly string[]> = {};
      const booleanProps = new Set<string>();

      Object.entries(metadata.properties).forEach(([propertyName, property]) => {
        const enumOptions = getEnumOptions(property);
        if (enumOptions) {
          enumProps[propertyName] = enumOptions;
        }
        if (property.type === 'boolean') {
          booleanProps.add(propertyName);
        }
      });

      return [
        componentName,
        {
          allowedProps,
          requiredProps,
          enumProps,
          booleanProps,
        } satisfies SemanticComponentRules,
      ];
    })
  );
}

function buildLayoutRulesFromMetadata(): Record<string, SemanticLayoutRules> {
  return Object.fromEntries(
    Object.entries(LAYOUTS).map(([layoutName, metadata]) => {
      const allowedParams = Object.keys(metadata.properties);
      const requiredParamsFromProperties = Object.entries(metadata.properties)
        .filter(([, property]) => property.required === true && property.defaultValue === undefined)
        .map(([propertyName]) => propertyName);
      const requiredParams = Array.from(
        new Set([...(metadata.requiredProperties || []), ...requiredParamsFromProperties])
      );
      const enumParams: Record<string, readonly string[]> = {};

      Object.entries(metadata.properties).forEach(([propertyName, property]) => {
        const enumOptions = getEnumOptions(property);
        if (enumOptions) {
          enumParams[propertyName] = enumOptions;
        }
      });

      return [
        layoutName,
        {
          allowedParams,
          requiredParams,
          enumParams,
        } satisfies SemanticLayoutRules,
      ];
    })
  );
}

const BUILT_IN_COMPONENTS = new Set(Object.keys(COMPONENTS));
const COMPONENT_RULES = buildComponentRulesFromMetadata();
const LAYOUT_RULES = buildLayoutRulesFromMetadata();
const BUILT_IN_LAYOUTS = new Set(Object.keys(LAYOUTS));

function isPascalCaseIdentifier(name: string): boolean {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}

function isValidDefinedLayoutName(name: string): boolean {
  return /^[a-z][a-z0-9_]*$/.test(name);
}

function toFallbackRange(): CodeRange {
  return {
    start: { line: 1, column: 0 },
    end: { line: 1, column: 1 },
  };
}

function splitDiagnostics(diagnostics: ParseError[]): { errors: ParseError[]; warnings: ParseError[] } {
  const errors = diagnostics.filter((d) => d.severity === 'error');
  const warnings = diagnostics.filter((d) => d.severity === 'warning');
  return { errors, warnings };
}

function buildParseDiagnosticsResult(
  diagnostics: ParseError[],
  ast?: AST,
  sourceMap?: SourceMapEntry[]
): ParseDiagnosticsResult {
  const { errors, warnings } = splitDiagnostics(diagnostics);
  return {
    ast,
    sourceMap,
    diagnostics,
    errors,
    warnings,
    hasErrors: errors.length > 0,
  };
}

function buildParseResult(ast: AST, sourceMap: SourceMapEntry[], diagnostics: ParseError[]): ParseResult {
  const { errors, warnings } = splitDiagnostics(diagnostics);
  return {
    ast,
    sourceMap,
    diagnostics,
    errors,
    warnings,
    hasErrors: errors.length > 0,
  };
}

function tokenToRange(token: any): CodeRange {
  if (!token) return toFallbackRange();
  const startLine = token.startLine || 1;
  const startColumn = Math.max(0, (token.startColumn || 1) - 1);
  const endLine = token.endLine || startLine;
  const endColumn = token.endColumn ?? token.startColumn ?? startColumn + 1;
  return {
    start: {
      line: startLine,
      column: startColumn,
      offset: token.startOffset,
    },
    end: {
      line: endLine,
      column: endColumn,
      offset: token.endOffset,
    },
  };
}

function createLexerDiagnostic(error: any): ParseError {
  const startLine = error.line || 1;
  const startColumn = Math.max(0, (error.column || 1) - 1);
  const length = Math.max(1, error.length || 1);
  return {
    message: error.message || 'Lexer error',
    severity: 'error',
    phase: 'lexer',
    code: 'LEXER_ERROR',
    range: {
      start: {
        line: startLine,
        column: startColumn,
        offset: error.offset,
      },
      end: {
        line: startLine,
        column: startColumn + length,
        offset: error.offset !== undefined ? error.offset + length : undefined,
      },
    },
  };
}

function createParserDiagnostic(error: any): ParseError {
  const token = error?.token || error?.previousToken || error?.resyncedTokens?.[0];
  const range = token ? tokenToRange(token) : toFallbackRange();
  return {
    message: error?.message || 'Parser error',
    severity: 'error',
    phase: 'parser',
    code: 'PARSER_ERROR',
    range,
  };
}

function isBooleanLike(value: string | number): boolean {
  if (typeof value === 'number') return value === 0 || value === 1;
  const normalized = String(value).trim().toLowerCase();
  return normalized === 'true' || normalized === 'false';
}

function getPropertyRange(
  entry: SourceMapEntry | undefined,
  propertyName: string,
  mode: 'name' | 'value' | 'full' = 'full'
): CodeRange {
  const prop = entry?.properties?.[propertyName];
  if (!prop) return entry?.range || toFallbackRange();
  if (mode === 'name') return prop.nameRange;
  if (mode === 'value') return prop.valueRange;
  return prop.range;
}

function formatAllowedNames(names: string[], emptyMessage: string): string {
  return names.length > 0 ? names.join(', ') : emptyMessage;
}

function getMissingRequiredNames(
  requiredNames: string[],
  providedValues: Record<string, string | number>
): string[] {
  return requiredNames.filter((name) => providedValues[name] === undefined);
}

function validateSemanticDiagnostics(ast: AST, sourceMap: SourceMapEntry[]): ParseError[] {
  const diagnostics: ParseError[] = [];
  const sourceMapByNodeId = new Map(sourceMap.map((entry) => [entry.nodeId, entry]));
  const definedComponents = new Set(ast.definedComponents.map((dc) => dc.name));
  const definedLayouts = new Set(ast.definedLayouts.map((dl) => dl.name));

  const emitDiagnostic = (
    severity: 'warning' | 'error',
    message: string,
    code: string,
    range: CodeRange,
    nodeId?: string,
    suggestion?: string
  ) => {
    diagnostics.push({
      message,
      code,
      severity,
      phase: 'semantic',
      range,
      nodeId,
      suggestion,
    });
  };

  const emitWarning = (
    message: string,
    code: string,
    range: CodeRange,
    nodeId?: string,
    suggestion?: string
  ) => emitDiagnostic('warning', message, code, range, nodeId, suggestion);

  const emitError = (
    message: string,
    code: string,
    range: CodeRange,
    nodeId?: string,
    suggestion?: string
  ) => emitDiagnostic('error', message, code, range, nodeId, suggestion);

  const countChildrenSlots = (layout: ASTLayout): number => {
    let count = 0;
    for (const child of layout.children) {
      if (child.type === 'component') {
        if (child.componentType === 'Children') count += 1;
      } else if (child.type === 'layout') {
        count += countChildrenSlots(child);
      } else if (child.type === 'cell') {
        for (const cellChild of child.children) {
          if (cellChild.type === 'component') {
            if (cellChild.componentType === 'Children') count += 1;
          } else if (cellChild.type === 'layout') {
            count += countChildrenSlots(cellChild);
          }
        }
      }
    }
    return count;
  };

  const checkComponent = (component: ASTComponent, insideDefinedLayout: boolean) => {
    const nodeId = component._meta?.nodeId;
    const entry = nodeId ? sourceMapByNodeId.get(nodeId) : undefined;
    const componentType = component.componentType;

    if (componentType === 'Children') {
      if (!insideDefinedLayout) {
        emitError(
          'Component "Children" can only be used inside a define Layout body.',
          'CHILDREN_SLOT_OUTSIDE_LAYOUT_DEFINITION',
          entry?.nameRange || entry?.range || toFallbackRange(),
          nodeId,
          'Move this placeholder into a define Layout block.',
        );
      }
      return;
    }

    if (!BUILT_IN_COMPONENTS.has(componentType) && !definedComponents.has(componentType)) {
      emitWarning(
        `Component "${componentType}" is not a built-in component and has no local definition.`,
        'COMPONENT_UNRESOLVED',
        entry?.nameRange || entry?.range || toFallbackRange(),
        nodeId,
        `Define it with: define Component "${componentType}" { ... }`,
      );
      return;
    }

    const rules = COMPONENT_RULES[componentType];
    if (!rules) return;

    const missingRequiredProps = getMissingRequiredNames(rules.requiredProps, component.props);
    if (missingRequiredProps.length > 0) {
      emitWarning(
        `Component "${componentType}" is missing required propert${
          missingRequiredProps.length === 1 ? 'y' : 'ies'
        }: ${missingRequiredProps.join(', ')}.`,
        'COMPONENT_MISSING_REQUIRED_PROPERTY',
        entry?.nameRange || entry?.range || toFallbackRange(),
        nodeId,
        `Add: ${missingRequiredProps.map((name) => `${name}: ...`).join(' ')}`,
      );
    }

    const allowed = new Set(rules.allowedProps);

    for (const [propName, propValue] of Object.entries(component.props)) {
      if (!allowed.has(propName)) {
        emitWarning(
          `Property "${propName}" is not recognized for component "${componentType}".`,
          'COMPONENT_UNKNOWN_PROPERTY',
          getPropertyRange(entry, propName, 'name'),
          nodeId,
          `Allowed properties: ${formatAllowedNames(
            rules.allowedProps,
            '(this component does not accept properties)'
          )}`,
        );
        continue;
      }

      const enumValues = rules.enumProps?.[propName];
      if (enumValues) {
        const normalizedValue = String(propValue);
        if (!enumValues.includes(normalizedValue)) {
          emitWarning(
            `Invalid value "${normalizedValue}" for property "${propName}" in component "${componentType}".`,
            'COMPONENT_INVALID_PROPERTY_VALUE',
            getPropertyRange(entry, propName, 'value'),
            nodeId,
            `Expected one of: ${enumValues.join(', ')}`,
          );
        }
      }

      if (rules.booleanProps.has(propName) && !isBooleanLike(propValue)) {
        emitWarning(
          `Property "${propName}" in component "${componentType}" expects a boolean value.`,
          'COMPONENT_BOOLEAN_PROPERTY_EXPECTED',
          getPropertyRange(entry, propName, 'value'),
          nodeId,
          'Use true or false.',
        );
      }
    }
  };

  const checkLayout = (layout: ASTLayout, insideDefinedLayout: boolean) => {
    const nodeId = layout._meta?.nodeId;
    const entry = nodeId ? sourceMapByNodeId.get(nodeId) : undefined;
    const rules = LAYOUT_RULES[layout.layoutType];
    const isDefinedLayoutUsage = definedLayouts.has(layout.layoutType);

    if (isDefinedLayoutUsage && layout.children.length !== 1) {
      emitError(
        `Layout "${layout.layoutType}" expects exactly one child for its Children slot.`,
        'LAYOUT_DEFINITION_CHILDREN_ARITY',
        entry?.bodyRange || entry?.range || toFallbackRange(),
        nodeId,
        'Provide exactly one nested child block when using this layout.',
      );
    }

    if (layout.children.length === 0) {
      emitWarning(
        `Layout "${layout.layoutType}" is empty.`,
        'LAYOUT_EMPTY',
        entry?.bodyRange || entry?.range || toFallbackRange(),
        nodeId,
        'Add at least one child: component, layout, or cell.',
      );
    }

    if (!rules && !isDefinedLayoutUsage) {
      emitWarning(
        `Layout type "${layout.layoutType}" is not recognized by semantic validation rules.`,
        'LAYOUT_UNKNOWN_TYPE',
        entry?.nameRange || entry?.range || toFallbackRange(),
        nodeId,
        `Use one of: ${Object.keys(LAYOUT_RULES).join(', ')}.`,
      );
    } else if (rules) {
      const missingRequiredParams = getMissingRequiredNames(rules.requiredParams, layout.params);
      if (missingRequiredParams.length > 0) {
        emitWarning(
          `Layout "${layout.layoutType}" is missing required parameter${
            missingRequiredParams.length === 1 ? '' : 's'
          }: ${missingRequiredParams.join(', ')}.`,
          'LAYOUT_MISSING_REQUIRED_PARAMETER',
          entry?.nameRange || entry?.range || toFallbackRange(),
          nodeId,
          `Add: ${missingRequiredParams.map((name) => `${name}: ...`).join(', ')}`,
        );
      }

      const allowed = new Set(rules.allowedParams);
      for (const [paramName, paramValue] of Object.entries(layout.params)) {
        if (!allowed.has(paramName)) {
          emitWarning(
            `Parameter "${paramName}" is not recognized for layout "${layout.layoutType}".`,
            'LAYOUT_UNKNOWN_PARAMETER',
            getPropertyRange(entry, paramName, 'name'),
            nodeId,
            `Allowed parameters: ${formatAllowedNames(
              rules.allowedParams,
              '(this layout does not accept parameters)'
            )}`,
          );
          continue;
        }

        const enumValues = rules.enumParams?.[paramName];
        if (enumValues) {
          const normalizedValue = String(paramValue);
          if (!enumValues.includes(normalizedValue)) {
            emitWarning(
              `Invalid value "${normalizedValue}" for parameter "${paramName}" in layout "${layout.layoutType}".`,
              'LAYOUT_INVALID_PARAMETER_VALUE',
              getPropertyRange(entry, paramName, 'value'),
              nodeId,
              `Expected one of: ${enumValues.join(', ')}`,
            );
          }
        }

        if (layout.layoutType === 'grid' && paramName === 'columns') {
          const columns = Number(paramValue);
          if (!Number.isFinite(columns) || columns < 1 || columns > 12) {
            emitWarning(
              `Grid "columns" must be a number between 1 and 12.`,
              'LAYOUT_GRID_COLUMNS_RANGE',
              getPropertyRange(entry, paramName, 'value'),
              nodeId,
              'Use values from 1 to 12.',
            );
          }
        }

        if (layout.layoutType === 'split' && paramName === 'sidebar') {
          const sidebar = Number(paramValue);
          if (!Number.isFinite(sidebar) || sidebar <= 0) {
            emitWarning(
              'Split "sidebar" must be a positive number.',
              'LAYOUT_SPLIT_SIDEBAR_INVALID',
              getPropertyRange(entry, paramName, 'value'),
              nodeId,
              'Use a value like sidebar: 240.',
            );
          }
        }
      }
    }

    for (const child of layout.children) {
      if (child.type === 'component') {
        checkComponent(child, insideDefinedLayout);
      } else if (child.type === 'layout') {
        checkLayout(child, insideDefinedLayout);
      } else if (child.type === 'cell') {
        checkCell(child, insideDefinedLayout);
      }
    }
  };

  const checkCell = (cell: ASTCell, insideDefinedLayout: boolean) => {
    const nodeId = cell._meta?.nodeId;
    const entry = nodeId ? sourceMapByNodeId.get(nodeId) : undefined;

    if (cell.props.span !== undefined) {
      const span = Number(cell.props.span);
      if (!Number.isFinite(span) || span < 1 || span > 12) {
        emitWarning(
          'Cell "span" should be a number between 1 and 12.',
          'CELL_SPAN_RANGE',
          getPropertyRange(entry, 'span', 'value'),
          nodeId,
          'Use values from 1 to 12.',
        );
      }
    }

    for (const child of cell.children) {
      if (child.type === 'component') checkComponent(child, insideDefinedLayout);
      if (child.type === 'layout') checkLayout(child, insideDefinedLayout);
    }
  };

  for (const componentDef of ast.definedComponents) {
    const nodeId = componentDef._meta?.nodeId;
    const entry = nodeId ? sourceMapByNodeId.get(nodeId) : undefined;
    if (!isPascalCaseIdentifier(componentDef.name)) {
      emitWarning(
        `Defined component "${componentDef.name}" should use PascalCase naming.`,
        'COMPONENT_DEFINITION_NAME_STYLE',
        entry?.nameRange || entry?.range || toFallbackRange(),
        nodeId,
        'Use a name like "MyComponent".',
      );
    }

    if (componentDef.body.type === 'component') {
      checkComponent(componentDef.body, false);
    } else {
      checkLayout(componentDef.body, false);
    }
  }

  for (const layoutDef of ast.definedLayouts) {
    const nodeId = layoutDef._meta?.nodeId;
    const entry = nodeId ? sourceMapByNodeId.get(nodeId) : undefined;
    if (!isValidDefinedLayoutName(layoutDef.name)) {
      emitError(
        `Defined layout "${layoutDef.name}" must match /^[a-z][a-z0-9_]*$/.`,
        'LAYOUT_DEFINITION_INVALID_NAME',
        entry?.nameRange || entry?.range || toFallbackRange(),
        nodeId,
        'Use names like "screen_default" or "appShell".',
      );
    }

    const childrenSlotCount = countChildrenSlots(layoutDef.body);
    if (childrenSlotCount !== 1) {
      emitError(
        `Defined layout "${layoutDef.name}" must contain exactly one "component Children" placeholder.`,
        'LAYOUT_DEFINITION_CHILDREN_SLOT_COUNT',
        entry?.bodyRange || entry?.range || toFallbackRange(),
        nodeId,
        'Add exactly one "component Children" in the layout body.',
      );
    }

    checkLayout(layoutDef.body, true);
  }

  ast.screens.forEach((screen) => {
    checkLayout(screen.layout, false);
  });

  return diagnostics;
}

export function parseWireDSL(input: string): AST {
  // Tokenize
  const lexResult = WireDSLLexer.tokenize(input);

  if (lexResult.errors.length > 0) {
    throw new Error(`Lexer errors:\n${lexResult.errors.map((e) => e.message).join('\n')}`);
  }

  // Parse
  parserInstance.input = lexResult.tokens;
  const cst = parserInstance.project();

  if (parserInstance.errors.length > 0) {
    throw new Error(`Parser errors:\n${parserInstance.errors.map((e) => e.message).join('\n')}`);
  }

  // Convert CST to AST
  const ast = visitor.visit(cst);
  
  // Validate no circular references in component definitions
  validateDefinitionCycles(ast);
  
  return ast;
}

/**
 * Parse Wire DSL with SourceMap generation
 * 
 * Returns both AST and SourceMap for bidirectional code-canvas mapping
 * Useful for:
 * - Visual editors (Wire Studio)
 * - Code navigation (click canvas → jump to code)
 * - Error reporting with precise locations
 * - Component inspection and manipulation
 * 
 * @param input - Wire DSL source code
 * @param filePath - Optional file path (default: "<input>") - used for stable nodeIds
 * @returns ParseResult with AST, SourceMap, and errors
 * 
 * @example
 * ```typescript
 * const { ast, sourceMap } = parseWireDSLWithSourceMap(code, 'screens/Main.wire');
 * 
 * // Find node by position
 * const node = sourceMap.find(e => 
 *   e.range.start.line === 5 && e.range.start.column === 4
 * );
 * 
 * // Access AST node
 * console.log(node.astNode.type);  // 'component'
 * ```
 */
export function parseWireDSLWithSourceMap(input: string, filePath?: string): ParseResult;
export function parseWireDSLWithSourceMap(
  input: string,
  filePath: string | undefined,
  options: ParseWireDSLWithSourceMapOptions & { throwOnError: false }
): ParseDiagnosticsResult;
export function parseWireDSLWithSourceMap(
  input: string,
  filePath: string = '<input>',
  options?: ParseWireDSLWithSourceMapOptions
): ParseResult | ParseDiagnosticsResult {
  const throwOnError = options?.throwOnError ?? true;
  const includeSemanticWarnings = options?.includeSemanticWarnings ?? true;
  const diagnostics: ParseError[] = [];

  // Tokenize
  const lexResult = WireDSLLexer.tokenize(input);

  if (lexResult.errors.length > 0) {
    diagnostics.push(...lexResult.errors.map(createLexerDiagnostic));
    if (throwOnError) {
      throw new Error(`Lexer errors:\n${lexResult.errors.map((e) => e.message).join('\n')}`);
    }
    return buildParseDiagnosticsResult(diagnostics);
  }

  // Parse
  parserInstance.input = lexResult.tokens;
  const cst = parserInstance.project();

  if (parserInstance.errors.length > 0) {
    diagnostics.push(...parserInstance.errors.map(createParserDiagnostic));
    if (throwOnError) {
      throw new Error(`Parser errors:\n${parserInstance.errors.map((e) => e.message).join('\n')}`);
    }
    return buildParseDiagnosticsResult(diagnostics);
  }

  // Create SourceMap builder
  const sourceMapBuilder = new SourceMapBuilder(filePath, input);
  const visitorWithSourceMap = new WireDSLVisitorWithSourceMap(sourceMapBuilder);

  // Convert CST to AST with SourceMap
  const ast = visitorWithSourceMap.visit(cst);

  // Build SourceMap
  const sourceMap = sourceMapBuilder.build();
  
  // Validate no circular references in component definitions
  try {
    validateDefinitionCycles(ast);
  } catch (error) {
    const projectEntry = sourceMap.find((entry) => entry.type === 'project');
    diagnostics.push({
      message: error instanceof Error ? error.message : 'Semantic validation error',
      severity: 'error',
      phase: 'semantic',
      code: 'COMPONENT_CIRCULAR_DEFINITION',
      range: projectEntry?.range || toFallbackRange(),
      nodeId: projectEntry?.nodeId,
    });

    if (throwOnError) {
      throw error;
    }
  }

  if (includeSemanticWarnings) {
    diagnostics.push(...validateSemanticDiagnostics(ast, sourceMap));
  }

  if (!throwOnError) {
    return buildParseDiagnosticsResult(diagnostics, ast, sourceMap);
  }

  return buildParseResult(ast, sourceMap, diagnostics);
}

/**
 * Validates that component/layout definitions don't have circular references.
 * Uses depth-first search over a unified graph:
 * - Components depend on components/layouts referenced in their bodies.
 * - Layouts depend on components/layouts referenced in their bodies.
 */
function validateDefinitionCycles(ast: AST): void {
  if (
    (!ast.definedComponents || ast.definedComponents.length === 0) &&
    (!ast.definedLayouts || ast.definedLayouts.length === 0)
  ) {
    return;
  }

  const components = new Map<string, ASTDefinedComponent>();
  const layouts = new Map<string, ASTDefinedLayout>();
  ast.definedComponents.forEach((comp) => {
    components.set(comp.name, comp);
  });
  ast.definedLayouts.forEach((layoutDef) => {
    layouts.set(layoutDef.name, layoutDef);
  });

  type DefinitionKey = `component:${string}` | `layout:${string}`;
  const makeComponentKey = (name: string): DefinitionKey => `component:${name}`;
  const makeLayoutKey = (name: string): DefinitionKey => `layout:${name}`;
  const displayKey = (key: DefinitionKey): string => key.split(':')[1];
  const shouldTrackComponentDependency = (name: string): boolean =>
    components.has(name) && !BUILT_IN_COMPONENTS.has(name);
  const shouldTrackLayoutDependency = (name: string): boolean =>
    layouts.has(name) && !BUILT_IN_LAYOUTS.has(name);

  const visited = new Set<DefinitionKey>();
  const recursionStack = new Set<DefinitionKey>();

  const collectLayoutDependencies = (layout: ASTLayout, deps: Set<DefinitionKey>): void => {
    if (shouldTrackLayoutDependency(layout.layoutType)) {
      deps.add(makeLayoutKey(layout.layoutType));
    }

    for (const child of layout.children) {
      if (child.type === 'component') {
        if (shouldTrackComponentDependency(child.componentType)) {
          deps.add(makeComponentKey(child.componentType));
        }
      } else if (child.type === 'layout') {
        collectLayoutDependencies(child, deps);
      } else if (child.type === 'cell') {
        for (const cellChild of child.children) {
          if (cellChild.type === 'component') {
            if (shouldTrackComponentDependency(cellChild.componentType)) {
              deps.add(makeComponentKey(cellChild.componentType));
            }
          } else if (cellChild.type === 'layout') {
            collectLayoutDependencies(cellChild, deps);
          }
        }
      }
    }
  };

  const getDependencies = (key: DefinitionKey): Set<DefinitionKey> => {
    const deps = new Set<DefinitionKey>();
    if (key.startsWith('component:')) {
      const name = key.slice('component:'.length);
      const def = components.get(name);
      if (!def) return deps;

      if (def.body.type === 'component') {
        if (shouldTrackComponentDependency(def.body.componentType)) {
          deps.add(makeComponentKey(def.body.componentType));
        }
      } else {
        collectLayoutDependencies(def.body, deps);
      }
      return deps;
    }

    const name = key.slice('layout:'.length);
    const def = layouts.get(name);
    if (!def) return deps;
    collectLayoutDependencies(def.body, deps);
    return deps;
  };

  const findCycle = (key: DefinitionKey, path: DefinitionKey[] = []): DefinitionKey[] | null => {
    if (recursionStack.has(key)) {
      const cycleStart = path.indexOf(key);
      return path.slice(cycleStart).concat(key);
    }

    if (visited.has(key)) {
      return null;
    }

    recursionStack.add(key);
    const currentPath = [...path, key];
    const dependencies = getDependencies(key);

    for (const dep of dependencies) {
      const cycle = findCycle(dep, currentPath);
      if (cycle) return cycle;
    }

    recursionStack.delete(key);
    visited.add(key);
    return null;
  };

  const allDefinitions: DefinitionKey[] = [
    ...Array.from(components.keys()).map(makeComponentKey),
    ...Array.from(layouts.keys()).map(makeLayoutKey),
  ];

  for (const key of allDefinitions) {
    visited.clear();
    recursionStack.clear();
    const cycle = findCycle(key);
    if (cycle) {
      throw new Error(
        `Circular component definition detected: ${cycle.map(displayKey).join(' → ')}\n` +
        `Components and layouts cannot reference each other in a cycle.`
      );
    }
  }
}

// Backward compatibility exports
export interface ParsedWireframe {
  name: string;
  components: ParsedComponent[];
}

export interface ParsedComponent {
  type: string;
  id: string;
  children?: ParsedComponent[];
  properties?: Record<string, unknown>;
}
