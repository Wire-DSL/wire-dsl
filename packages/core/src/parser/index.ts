import { Lexer, createToken, CstParser, TokenType } from 'chevrotain';

/**
 * WireDSL Parser
 *
 * Converts .wire files to AST using Chevrotain
 *
 * Example:
 * ```
 * project "Dashboard" {
 *   screen Main {
 *     layout stack(direction: vertical, gap: md) {
 *       component Heading text: "Hello"
 *       component Button text: "Click Me"
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
const Tokens = createToken({ name: 'Tokens', pattern: /tokens/ });
const Mocks = createToken({ name: 'Mocks', pattern: /mocks/ });
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

// Comment (ignored)
const Comment = createToken({
  name: 'Comment',
  pattern: /\/\/[^\n]*/,
  group: Lexer.SKIPPED,
});

// Token order matters! Keywords before Identifier
const allTokens = [
  WhiteSpace,
  Comment,
  // Keywords (must come before Identifier)
  Project,
  Screen,
  Layout,
  Component,
  Tokens,
  Mocks,
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
        { ALT: () => this.SUBRULE(this.tokensDecl) },
        { ALT: () => this.SUBRULE(this.mocksDecl) },
        { ALT: () => this.SUBRULE(this.screen) },
      ]);
    });
    this.CONSUME(RCurly);
  });

  // tokens density: normal
  private tokensDecl = this.RULE('tokensDecl', () => {
    this.CONSUME(Tokens);
    this.CONSUME(Identifier, { LABEL: 'tokenKey' });
    this.CONSUME(Colon);
    this.CONSUME2(Identifier, { LABEL: 'tokenValue' });
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

  // screen Main { ... }
  private screen = this.RULE('screen', () => {
    this.CONSUME(Screen);
    this.CONSUME(Identifier, { LABEL: 'screenName' });
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
  tokens: Record<string, string>;
  mocks: Record<string, string>;
  screens: ASTScreen[];
}

export interface ASTScreen {
  type: 'screen';
  name: string;
  layout: ASTLayout;
}

export interface ASTLayout {
  type: 'layout';
  layoutType: string;
  params: Record<string, string | number>;
  children: (ASTComponent | ASTLayout | ASTCell)[];
}

export interface ASTCell {
  type: 'cell';
  props: Record<string, string | number>;
  children: (ASTComponent | ASTLayout)[];
}

export interface ASTComponent {
  type: 'component';
  componentType: string;
  props: Record<string, string | number>;
}

// ============================================================================
// CST VISITOR (Converts CST to AST)
// ============================================================================

const parserInstance = new WireDSLParser();
const BaseCstVisitor = parserInstance.getBaseCstVisitorConstructor();

class WireDSLVisitor extends BaseCstVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  project(ctx: any): AST {
    const projectName = ctx.projectName[0].image.slice(1, -1); // Remove quotes
    const tokens: Record<string, string> = {};
    const mocks: Record<string, string> = {};
    const screens: ASTScreen[] = [];

    if (ctx.tokensDecl) {
      ctx.tokensDecl.forEach((tokenDecl: any) => {
        const result = this.visit(tokenDecl);
        tokens[result.key] = result.value;
      });
    }

    if (ctx.mocksDecl && ctx.mocksDecl.length > 0) {
      const mocksBlock = this.visit(ctx.mocksDecl[0]);
      Object.assign(mocks, mocksBlock);
    }

    if (ctx.screen) {
      ctx.screen.forEach((screen: any) => {
        screens.push(this.visit(screen));
      });
    }

    return {
      type: 'project',
      name: projectName,
      tokens,
      mocks,
      screens,
    };
  }

  tokensDecl(ctx: any) {
    return {
      key: ctx.tokenKey[0].image,
      value: ctx.tokenValue[0].image,
    };
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

  screen(ctx: any): ASTScreen {
    return {
      type: 'screen',
      name: ctx.screenName[0].image,
      layout: this.visit(ctx.layout),
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

    if (ctx.component) {
      ctx.component.forEach((comp: any) => {
        children.push(this.visit(comp));
      });
    }

    if (ctx.layout) {
      ctx.layout.forEach((layout: any) => {
        children.push(this.visit(layout));
      });
    }

    if (ctx.cell) {
      ctx.cell.forEach((cell: any) => {
        children.push(this.visit(cell));
      });
    }

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

    if (ctx.component) {
      ctx.component.forEach((comp: any) => {
        children.push(this.visit(comp));
      });
    }

    if (ctx.layout) {
      ctx.layout.forEach((layout: any) => {
        children.push(this.visit(layout));
      });
    }

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
  return ast;
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
