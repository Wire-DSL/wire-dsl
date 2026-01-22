import * as vscode from 'vscode';
import { COMPONENTS, LAYOUTS, PROPERTY_VALUES, KEYWORDS } from './data/components';

/**
 * Wire DSL Completion Provider
 * Provides context-aware code completion for .wire files
 */
export class WireCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];

    // Get the line up to cursor position
    const lineText = document.lineAt(position).text.substring(0, position.character);
    const wholeLine = document.lineAt(position).text;

    // Determine context by looking at previous tokens and lines
    const context = this.detectContext(document, position);

    // Add completions based on context
    if (context === 'top-level' || context === 'project') {
      completions.push(...this.getTopLevelCompletions());
    }

    if (context === 'screen') {
      completions.push(...this.getScreenCompletions());
    }

    if (context === 'layout-start' || lineText.match(/layout\s+\w*$/)) {
      completions.push(...this.getLayoutTypeCompletions());
    }

    if (context === 'component-start' || lineText.match(/component\s+\w*$/)) {
      completions.push(...this.getComponentCompletions());
    }

    if (context === 'property-value') {
      completions.push(...this.getPropertyValueCompletions(lineText));
    }

    if (context === 'cell' || lineText.match(/cell\s+\w*$/)) {
      completions.push(...this.getCellCompletions());
    }

    return completions;
  }

  /**
   * Detect the context where cursor is located
   */
  private detectContext(document: vscode.TextDocument, position: vscode.Position): string {
    const lineText = document.lineAt(position).text;
    const textBefore = lineText.substring(0, position.character);

    // Check what's being typed
    if (textBefore.match(/layout\s+\w*$/)) {
      return 'layout-start';
    }
    if (textBefore.match(/component\s+\w*$/)) {
      return 'component-start';
    }
    if (textBefore.match(/cell\s+\w*$/)) {
      return 'cell';
    }

    // Look at previous lines to determine scope
    let braceCount = 0;
    let inScreen = false;
    let inLayout = false;

    for (let i = Math.max(0, position.line - 20); i < position.line; i++) {
      const line = document.lineAt(i).text;

      if (line.includes('screen ')) {
        inScreen = true;
      }
      if (line.includes('layout ')) {
        inLayout = true;
      }

      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
    }

    if (textBefore.match(/:\s*\w*$/)) {
      return 'property-value';
    }

    if (inScreen && braceCount > 0) {
      return 'screen';
    }
    if (inLayout) {
      return 'layout-body';
    }

    return 'top-level';
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
      item.insertText = name;
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
