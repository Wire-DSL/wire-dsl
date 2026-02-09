import { Lexer, createToken, CstParser, TokenType } from 'chevrotain';
import { SourceMapBuilder } from '../sourcemap/builder';
import type { ParseResult, CapturedTokens } from '../sourcemap/types';

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
 *     layout grid(cols: 3) {
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
const Project = createToken({ name: 'Project', pattern: /project/ });
const Screen = createToken({ name: 'Screen', pattern: /screen/ });
const Layout = createToken({ name: 'Layout', pattern: /layout/ });
const Component = createToken({ name: 'Component', pattern: /component/ });
const ComponentKeyword = createToken({
  name: 'ComponentKeyword',
  pattern: /Component\b/,
});
const Define = createToken({ name: 'Define', pattern: /define/ });
const Theme = createToken({ name: 'Theme', pattern: /theme/ });
const Mocks = createToken({ name: 'Mocks', pattern: /mocks/ });
const Colors = createToken({ name: 'Colors', pattern: /colors/ });
const Cell = createToken({ name: 'Cell', pattern: /cell/ });

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
  ComponentKeyword,
  Component,
  Define,
  Theme,
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
        { ALT: () => this.SUBRULE(this.themeDecl) },
        { ALT: () => this.SUBRULE(this.mocksDecl) },
        { ALT: () => this.SUBRULE(this.colorsDecl) },
        { ALT: () => this.SUBRULE(this.screen) },
      ]);
    });
    this.CONSUME(RCurly);
  });

  // theme { density: "normal" }
  private themeDecl = this.RULE('themeDecl', () => {
    this.CONSUME(Theme);
    this.CONSUME(LCurly);
    this.MANY(() => {
      this.SUBRULE(this.themeProperty);
    });
    this.CONSUME(RCurly);
  });

  // density: "normal"
  private themeProperty = this.RULE('themeProperty', () => {
    this.CONSUME(Identifier, { LABEL: 'themeKey' });
    this.CONSUME(Colon);
    this.CONSUME(StringLiteral, { LABEL: 'themeValue' });
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
  theme: Record<string, string>;
  mocks: Record<string, string>;
  colors: Record<string, string>;
  definedComponents: ASTDefinedComponent[];
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
    const theme: Record<string, string> = {};
    const mocks: Record<string, string> = {};
    const colors: Record<string, string> = {};
    const definedComponents: ASTDefinedComponent[] = [];
    const screens: ASTScreen[] = [];

    if (ctx.themeDecl && ctx.themeDecl.length > 0) {
      const themeBlock = this.visit(ctx.themeDecl[0]);
      Object.assign(theme, themeBlock);
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

    if (ctx.screen) {
      ctx.screen.forEach((screen: any) => {
        screens.push(this.visit(screen));
      });
    }

    return {
      type: 'project',
      name: projectName,
      theme,
      mocks,
      colors,
      definedComponents,
      screens,
    };
  }

  themeDecl(ctx: any) {
    const theme: Record<string, string> = {};
    if (ctx.themeProperty) {
      ctx.themeProperty.forEach((prop: any) => {
        const { key, value } = this.visit(prop);
        theme[key] = value;
      });
    }
    return theme;
  }

  themeProperty(ctx: any) {
    const key = ctx.themeKey[0].image;
    const value = ctx.themeValue[0].image.slice(1, -1); // Remove quotes
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
  constructor(sourceMapBuilder: SourceMapBuilder) {
    super();
    this.sourceMapBuilder = sourceMapBuilder;
  }

  project(ctx: any): AST {
    const projectName = ctx.projectName[0].image.slice(1, -1); // Remove quotes
    const theme: Record<string, string> = {};
    const mocks: Record<string, string> = {};
    const colors: Record<string, string> = {};
    const definedComponents: ASTDefinedComponent[] = [];
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
      theme: {},
      mocks: {},
      colors: {},
      definedComponents: [],  // Will be filled after push
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
      // Project is root, so we push it as parent for theme/screens/components
      this.sourceMapBuilder.pushParent(nodeId);
    }

    // Process theme, mocks, colors AFTER pushParent so they have project as parent
    if (ctx.themeDecl && ctx.themeDecl.length > 0) {
      const themeBlock = this.visit(ctx.themeDecl[0]);
      Object.assign(ast.theme, themeBlock);
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
      const nodeId = this.sourceMapBuilder.addNode(
        'component',
        tokens,
        { componentType: ast.componentType }
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

  // Override themeDecl to capture theme block in SourceMap
  themeDecl(ctx: any): Record<string, string> {
    const theme: Record<string, string> = {};
    
    // Capture tokens for theme block
    const tokens: CapturedTokens = {
      keyword: ctx.Theme[0],
      body: ctx.RCurly[0],
    };

    // Add theme node to SourceMap
    if (this.sourceMapBuilder) {
      const nodeId = this.sourceMapBuilder.addNode(
        'theme',
        tokens,
        { name: 'theme' }
      );

      // Process theme properties
      if (ctx.themeProperty) {
        ctx.themeProperty.forEach((propCtx: any) => {
          const { key, value } = this.visit(propCtx);
          theme[key] = value;

          // Add property to SourceMap with precise ranges
          this.sourceMapBuilder!.addProperty(
            nodeId,
            key,
            value,
            {
              name: propCtx.children.themeKey[0],
              value: propCtx.children.themeValue[0],
            }
          );
        });
      }
    } else {
      // No SourceMap builder, just collect properties
      if (ctx.themeProperty) {
        ctx.themeProperty.forEach((prop: any) => {
          const { key, value } = this.visit(prop);
          theme[key] = value;
        });
      }
    }

    return theme;
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
  validateComponentDefinitionCycles(ast);
  
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
export function parseWireDSLWithSourceMap(
  input: string, 
  filePath: string = '<input>'
): ParseResult {
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

  // Create SourceMap builder
  const sourceMapBuilder = new SourceMapBuilder(filePath);
  const visitorWithSourceMap = new WireDSLVisitorWithSourceMap(sourceMapBuilder);

  // Convert CST to AST with SourceMap
  const ast = visitorWithSourceMap.visit(cst);
  
  // Validate no circular references in component definitions
  validateComponentDefinitionCycles(ast);

  // Build SourceMap
  const sourceMap = sourceMapBuilder.build();

  return {
    ast,
    sourceMap,
    errors: [],  // No errors if we got here (errors throw exceptions)
  };
}

/**
 * Validates that component definitions don't have circular references
 * Uses depth-first search to detect cycles in the component dependency graph
 */
function validateComponentDefinitionCycles(ast: AST): void {
  if (!ast.definedComponents || ast.definedComponents.length === 0) {
    return;
  }

  const components = new Map<string, ASTDefinedComponent>();
  ast.definedComponents.forEach(comp => {
    components.set(comp.name, comp);
  });

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function getComponentDependencies(node: ASTLayout | ASTComponent): Set<string> {
    const deps = new Set<string>();

    if (node.type === 'layout') {
      const layout = node as ASTLayout;
      if (layout.children) {
        layout.children.forEach(child => {
          if (child.type === 'component') {
            const component = child as ASTComponent;
            deps.add(component.componentType);
          } else if (child.type === 'layout') {
            const nested = getComponentDependencies(child);
            nested.forEach(d => deps.add(d));
          } else if (child.type === 'cell') {
            const cell = child as ASTCell;
            if (cell.children) {
              cell.children.forEach(cellChild => {
                if (cellChild.type === 'component') {
                  deps.add((cellChild as ASTComponent).componentType);
                } else if (cellChild.type === 'layout') {
                  const nested = getComponentDependencies(cellChild);
                  nested.forEach(d => deps.add(d));
                }
              });
            }
          }
        });
      }
    }

    return deps;
  }

  function hasCycle(componentName: string, path: string[] = []): string[] | null {
    if (recursionStack.has(componentName)) {
      // Found a cycle
      const cycleStart = path.indexOf(componentName);
      const cycle = path.slice(cycleStart).concat(componentName);
      return cycle;
    }

    if (visited.has(componentName)) {
      return null; // Already validated, no cycle from this path
    }

    const component = components.get(componentName);
    if (!component) {
      return null; // Not a defined component, skip
    }

    recursionStack.add(componentName);
    const currentPath = [...path, componentName];

    const dependencies = getComponentDependencies(component.body);

    for (const dep of dependencies) {
      const definedDep = components.has(dep);
      if (definedDep) {
        const cycle = hasCycle(dep, currentPath);
        if (cycle) {
          return cycle;
        }
      }
    }

    recursionStack.delete(componentName);
    visited.add(componentName);
    return null;
  }

  // Check each component for cycles
  for (const [componentName] of components) {
    visited.clear();
    recursionStack.clear();
    const cycle = hasCycle(componentName);
    if (cycle) {
      throw new Error(
        `Circular component definition detected: ${cycle.join(' → ')}\n` +
        `Components cannot reference each other in a cycle.`
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
