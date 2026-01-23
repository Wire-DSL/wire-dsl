import * as vscode from 'vscode';
import { COMPONENTS, LAYOUTS, PROPERTY_VALUES, KEYWORDS } from './data/components';

/**
 * Wire DSL Completion Provider - Intelligent Context-Aware Completions
 */
export class WireCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): vscode.CompletionItem[] {
    const lineText = document.lineAt(position).text.substring(0, position.character);
    const documentText = document.getText();
    const cursorOffset = document.offsetAt(position);
    const textBeforeCursor = documentText.substring(0, cursorOffset);

    // HIGHEST PRIORITY: Check if we're in a component definition (before anything else)
    const componentContext = this.detectComponentPropertyContext(lineText);
    if (componentContext) {
      return this.getComponentPropertiesCompletions(componentContext, lineText);
    }

    // Check immediate line context (layout types, component names, property values)
    if (/layout\s+\w*$/.test(lineText)) {
      return this.getLayoutTypeCompletions();
    }
    // Only show component names if we haven't finished typing a component name yet
    // i.e., "component " or "component B" but NOT "component Button text:"
    // Allow for indentation at the start of the line
    if (/component\s+[A-Z]?\w*$/.test(lineText)) {
      return this.getComponentCompletions();
    }
    if (/:\s+\w*$/.test(lineText)) {
      return this.getPropertyValueCompletions(lineText);
    }

    // Determine broader document scope
    const scope = this.determineScope(textBeforeCursor);
    
    if (scope === 'empty-file') {
      return this.getProjectOnlyCompletion();
    }
    if (scope === 'inside-project') {
      return this.getProjectLevelCompletions();
    }
    if (scope === 'inside-screen') {
      return this.getScreenLevelCompletions();
    }
    if (scope === 'inside-layout') {
      return this.getLayoutBodyCompletions();
    }

    return [];
  }

  /**
   * Determine document scope by analyzing structure
   */
  private determineScope(textBeforeCursor: string): string {
    const cleanText = textBeforeCursor
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');

    if (cleanText.trim().length === 0) {
      return 'empty-file';
    }

    // Count braces and track keywords
    let projectCount = 0;
    let screenCount = 0;
    let layoutCount = 0;
    let braceCount = 0;

    const lines = cleanText.split('\n');
    for (const line of lines) {
      if (line.match(/\bproject\s+/)) projectCount++;
      if (line.match(/\bscreen\s+/)) screenCount++;
      if (line.match(/\blayout\s+/)) layoutCount++;
      
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
    }

    if (projectCount === 0) {
      return 'empty-file';
    }

    // Inside project but haven't entered screen yet
    if (screenCount === 0 && braceCount > 0) {
      return 'inside-project';
    }

    // Inside a screen but no layout yet
    if (screenCount > 0 && layoutCount === 0 && braceCount > 0) {
      return 'inside-screen';
    }

    // Inside a layout
    if (layoutCount > 0 && braceCount > 0) {
      return 'inside-layout';
    }

    return 'inside-project';
  }

  /**
   * Detect if we're inside a component definition (after component keyword)
   * and return the component name if found.
   * 
   * Examples:
   * - "component Button" → returns "Button"
   * - "component Button text:" → returns "Button"
   * - "component Button text: \"Save\"" → returns "Button"
   * - "component B" → returns null (still typing component name)
   */
  private detectComponentPropertyContext(lineText: string): string | null {
    // Match "component ComponentName" where ComponentName starts with uppercase
    // This ensures we have a complete, recognized component name
    const match = lineText.match(/component\s+([A-Z]\w*)/);
    if (!match) {
      return null;
    }

    const componentName = match[1];
    
    // Check if this is a valid component
    if (!COMPONENTS[componentName as keyof typeof COMPONENTS]) {
      return null;
    }

    // Get text after the component name
    const afterComponent = lineText.substring(match.index! + match[0].length);
    
    // If there's nothing after, or only spaces, we're at the end - show properties
    // Or if we have properties already (word followed by colon), show properties
    if (afterComponent.match(/^\s*$/) || afterComponent.match(/^\s+[\w-]+:/)) {
      return componentName;
    }

    return null;
  }

  /**
   * Only suggest "project" for empty file
   */
  private getProjectOnlyCompletion(): vscode.CompletionItem[] {
    const item = new vscode.CompletionItem('project', vscode.CompletionItemKind.Keyword);
    item.detail = 'Define a new Wire DSL project (root element)';
    item.insertText = new vscode.SnippetString('project "${1:ProjectName}" {\n\t$0\n}');
    item.sortText = '0-project'; // Prioritize
    return [item];
  }

  /**
   * Inside project: suggest tokens, colors, mocks, screen (NOT project)
   */
  private getProjectLevelCompletions(): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    const tokensItem = new vscode.CompletionItem('tokens', vscode.CompletionItemKind.Keyword);
    tokensItem.detail = 'Define design tokens';
    tokensItem.insertText = new vscode.SnippetString('tokens ${1:density}: ${2:normal}');
    tokensItem.sortText = '1-tokens';
    items.push(tokensItem);

    const colorsItem = new vscode.CompletionItem('colors', vscode.CompletionItemKind.Keyword);
    colorsItem.detail = 'Define custom color palette';
    colorsItem.insertText = new vscode.SnippetString('colors {\n\t${1:primary}: #${2:3B82F6}\n}');
    colorsItem.sortText = '2-colors';
    items.push(colorsItem);

    const mocksItem = new vscode.CompletionItem('mocks', vscode.CompletionItemKind.Keyword);
    mocksItem.detail = 'Define mock data';
    mocksItem.insertText = new vscode.SnippetString('mocks {\n\t${1:key}: "${2:value}"\n}');
    mocksItem.sortText = '3-mocks';
    items.push(mocksItem);

    const screenItem = new vscode.CompletionItem('screen', vscode.CompletionItemKind.Keyword);
    screenItem.detail = 'Define a new screen/view';
    screenItem.insertText = new vscode.SnippetString('screen ${1:ScreenName} {\n\tlayout ${2:stack}() {\n\t\t$0\n\t}\n}');
    screenItem.sortText = '4-screen';
    items.push(screenItem);

    return items;
  }

  /**
   * Inside screen: suggest only "layout" keyword
   */
  private getScreenLevelCompletions(): vscode.CompletionItem[] {
    const item = new vscode.CompletionItem('layout', vscode.CompletionItemKind.Keyword);
    item.detail = 'Define a layout for this screen';
    item.insertText = 'layout ';
    return [item];
  }

  /**
   * Inside layout: suggest component, nested layout, or cell
   */
  private getLayoutBodyCompletions(): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    const componentItem = new vscode.CompletionItem('component', vscode.CompletionItemKind.Keyword);
    componentItem.detail = 'Add a component';
    componentItem.insertText = 'component ';
    componentItem.sortText = '1-component';
    items.push(componentItem);

    const layoutItem = new vscode.CompletionItem('layout', vscode.CompletionItemKind.Keyword);
    layoutItem.detail = 'Add a nested layout';
    layoutItem.insertText = 'layout ';
    layoutItem.sortText = '2-layout';
    items.push(layoutItem);

    const cellItem = new vscode.CompletionItem('cell', vscode.CompletionItemKind.Keyword);
    cellItem.detail = 'Define a cell in a grid';
    cellItem.insertText = new vscode.SnippetString('cell span: ${1:6} {\n\t$0\n}');
    cellItem.sortText = '3-cell';
    items.push(cellItem);

    return items;
  }

  /**
   * Top-level completions (project block)
   */
  private getTopLevelCompletions(): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    // project keyword
    const projectItem = new vscode.CompletionItem('project', vscode.CompletionItemKind.Keyword);
    projectItem.detail = 'Define a new Wire DSL project';
    projectItem.insertText = new vscode.SnippetString('project "${1:ProjectName}" {\n\t$0\n}');
    items.push(projectItem);

    // tokens keyword
    const tokensItem = new vscode.CompletionItem('tokens', vscode.CompletionItemKind.Keyword);
    tokensItem.detail = 'Define design tokens (density, spacing, radius, etc.)';
    tokensItem.insertText = new vscode.SnippetString('tokens ${1:density}: ${2:normal}');
    items.push(tokensItem);

    // colors block
    const colorsItem = new vscode.CompletionItem('colors', vscode.CompletionItemKind.Keyword);
    colorsItem.detail = 'Define custom color palette';
    colorsItem.insertText = new vscode.SnippetString('colors {\n\t${1:primary}: #${2:3B82F6}\n}');
    items.push(colorsItem);

    // mocks block
    const mocksItem = new vscode.CompletionItem('mocks', vscode.CompletionItemKind.Keyword);
    mocksItem.detail = 'Define mock data for table/list components';
    mocksItem.insertText = new vscode.SnippetString('mocks {\n\t${1:key}: "${2:value}"\n}');
    items.push(mocksItem);

    // screen keyword
    const screenItem = new vscode.CompletionItem('screen', vscode.CompletionItemKind.Keyword);
    screenItem.detail = 'Define a new screen/view';
    screenItem.insertText = new vscode.SnippetString('screen ${1:ScreenName} {\n\tlayout ${2:stack}() {\n\t\t$0\n\t}\n}');
    items.push(screenItem);

    return items;
  }

  /**
   * Screen-level completions
   */
  private getScreenCompletions(): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    // layout types
    items.push(...this.getLayoutTypeCompletions());

    return items;
  }

  /**
   * Layout type completions (stack, grid, split, panel, card)
   */
  private getLayoutTypeCompletions(): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    for (const [key, layout] of Object.entries(LAYOUTS)) {
      const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Keyword);
      item.detail = layout.description;

      if (key === 'stack') {
        item.insertText = new vscode.SnippetString('stack(direction: ${1|vertical,horizontal|}, gap: ${2|xs,sm,md,lg,xl|}, padding: ${3|xs,sm,md,lg,xl|}) {\n\t$0\n}');
      } else if (key === 'grid') {
        item.insertText = new vscode.SnippetString('grid(columns: ${1:12}, gap: ${2|xs,sm,md,lg,xl|}) {\n\tcell span: ${3:3} {\n\t\t$0\n\t}\n}');
      } else if (key === 'split') {
        item.insertText = new vscode.SnippetString('split(sidebar: ${1:260}, gap: ${2|xs,sm,md,lg,xl|}) {\n\tlayout stack() {\n\t\t$0\n\t}\n\tlayout stack() {\n\t\t\n\t}\n}');
      } else if (key === 'panel') {
        item.insertText = new vscode.SnippetString('panel(padding: ${1|xs,sm,md,lg,xl|}, background: ${2:white}) {\n\t$0\n}');
      } else if (key === 'card') {
        item.insertText = new vscode.SnippetString('card(padding: ${1|xs,sm,md,lg,xl|}, gap: ${2|xs,sm,md,lg,xl|}, radius: ${3|xs,sm,md,lg,xl|}) {\n\t$0\n}');
      }

      items.push(item);
    }

    return items;
  }

  /**
   * Component type completions
   */
  private getComponentCompletions(): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    for (const [name, metadata] of Object.entries(COMPONENTS)) {
      const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Class);
      item.detail = metadata.description;
      item.documentation = new vscode.MarkdownString(
        `**${metadata.name}**\n\n${metadata.description}\n\n**Example:**\n\`\`\`wire\n${metadata.example}\n\`\`\``
      );
      item.insertText = new vscode.SnippetString(name + ' $0');
      items.push(item);
    }

    return items;
  }

  /**
   * After "component ComponentName ": suggest properties for that component
   * Filters out properties that are already declared on the current line
   */
  private getComponentPropertiesCompletions(componentName: string, lineText: string): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];
    const component = COMPONENTS[componentName as keyof typeof COMPONENTS];

    if (!component) {
      return items;
    }

    // Get component-specific properties
    const properties = component.properties || [];

    // Extract already-declared properties from the line
    // Match patterns like "propertyName: " or "propertyName: value"
    const declaredPropsMatch = lineText.matchAll(/(\w+):\s*/g);
    const declaredProps = new Set<string>();
    for (const match of declaredPropsMatch) {
      declaredProps.add(match[1]);
    }

    for (const propName of properties) {
      // Skip if this property is already declared on this line
      if (declaredProps.has(propName)) {
        continue;
      }

      const item = new vscode.CompletionItem(propName, vscode.CompletionItemKind.Property);
      item.detail = `Property of ${componentName}`;
      
      // Check component-specific property values first
      const componentSpecificValues = component.propertyValues?.[propName];
      if (componentSpecificValues && componentSpecificValues.length > 0) {
        const valuesStr = componentSpecificValues.join(',');
        item.insertText = new vscode.SnippetString(`${propName}: \${1|${valuesStr}|}`);
      } else {
        // Fall back to global property values
        const globalValues = PROPERTY_VALUES[propName];
        if (globalValues && globalValues.length > 0) {
          const valuesStr = globalValues.join(',');
          item.insertText = new vscode.SnippetString(`${propName}: \${1|${valuesStr}|}`);
        } else {
          // Default: text input
          item.insertText = new vscode.SnippetString(`${propName}: "\${1:value}"`);
        }
      }
      
      items.push(item);
    }

    return items;
  }

  /**
   * Cell completion for grid layouts
   */
  private getCellCompletions(): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    const spanItem = new vscode.CompletionItem('span', vscode.CompletionItemKind.Property);
    spanItem.detail = 'Number of columns this cell spans';
    spanItem.insertText = new vscode.SnippetString('span: ${1:6}');
    items.push(spanItem);

    const alignItem = new vscode.CompletionItem('align', vscode.CompletionItemKind.Property);
    alignItem.detail = 'Alignment within cell';
    alignItem.insertText = new vscode.SnippetString('align: ${1|start,center,end|}');
    items.push(alignItem);

    return items;
  }

  /**
   * Property value completions based on property name
   */
  private getPropertyValueCompletions(lineText: string): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    // Extract property name
    const propertyMatch = lineText.match(/(\w+):\s*\w*$/);
    if (!propertyMatch) {
      return items;
    }

    const propertyName = propertyMatch[1];
    const values = PROPERTY_VALUES[propertyName];

    if (values) {
      for (const value of values) {
        const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value);
        item.insertText = value;
        items.push(item);
      }
    }

    return items;
  }
}
