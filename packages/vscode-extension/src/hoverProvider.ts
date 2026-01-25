/**
 * Wire DSL Hover Provider
 * Displays hover documentation for components, layouts, properties, and keywords
 */

import * as vscode from 'vscode';
import { COMPONENTS, LAYOUTS, KEYWORDS } from './data/components';
import {
  getComponentDocumentation,
  getLayoutDocumentation,
  getKeywordDocumentation,
} from './data/documentation';
import { extractComponentDefinitions } from './utils/documentParser';

/**
 * Extract token at cursor position
 */
function getTokenAtPosition(
  document: vscode.TextDocument,
  position: vscode.Position
): { token: string; range: vscode.Range; type: string } | null {
  const line = document.lineAt(position);
  const text = line.text;
  const offset = position.character;

  // Skip if in comment
  if (text.includes('//')) {
    const commentIndex = text.indexOf('//');
    if (offset > commentIndex) {
      return null;
    }
  }

  // Skip if in string
  if (text.includes('"') || text.includes("'")) {
    const doubleQuoteStart = text.lastIndexOf('"', offset);
    const doubleQuoteEnd = text.indexOf('"', offset);
    const singleQuoteStart = text.lastIndexOf("'", offset);
    const singleQuoteEnd = text.indexOf("'", offset);

    const inDoubleQuotes =
      doubleQuoteStart !== -1 &&
      (doubleQuoteEnd === -1 || doubleQuoteEnd > offset);
    const inSingleQuotes =
      singleQuoteStart !== -1 &&
      (singleQuoteEnd === -1 || singleQuoteEnd > offset);

    if (inDoubleQuotes || inSingleQuotes) {
      return null;
    }
  }

  // Extract word boundaries (alphanumeric, underscore)
  let start = offset;
  while (start > 0 && /[a-zA-Z0-9_]/.test(text[start - 1])) {
    start--;
  }

  let end = offset;
  while (end < text.length && /[a-zA-Z0-9_]/.test(text[end])) {
    end++;
  }

  if (start === end) {
    return null;
  }

  const token = text.substring(start, end);
  const range = new vscode.Range(
    new vscode.Position(position.line, start),
    new vscode.Position(position.line, end)
  );

  // Determine token type
  let type = 'unknown';

  // Check if it's a keyword
  const allKeywords = Object.values(KEYWORDS).flat();
  if (allKeywords.includes(token)) {
    type = 'keyword';
  }
  // Check if it's a component
  else if (COMPONENTS[token as keyof typeof COMPONENTS]) {
    type = 'component';
  }
  // Check if it's a layout
  else if (LAYOUTS[token as keyof typeof LAYOUTS]) {
    type = 'layout';
  }

  return { token, range, type };
}

export class WireHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const tokenInfo = getTokenAtPosition(document, position);
    if (!tokenInfo) {
      return null;
    }

    const { token: tokenText, range, type } = tokenInfo;

    let documentation: string | null = null;

    if (type === 'component') {
      // First check if it's a built-in component
      documentation = getComponentDocumentation(tokenText);

      // If not built-in, check if it's a user-defined component
      if (!documentation) {
        const definitions = extractComponentDefinitions(document.getText());
        const userDefinition = definitions.find((def) => def.name === tokenText);

        if (userDefinition && userDefinition.documentation) {
          // Create markdown for user-defined component with its documentation
          documentation = `## ${tokenText}\n\n_User-defined component_\n\n${userDefinition.documentation}`;
        }
      }
    } else if (type === 'layout') {
      documentation = getLayoutDocumentation(tokenText);
    } else if (type === 'keyword') {
      documentation = getKeywordDocumentation(tokenText);
    } else if (type === 'unknown') {
      // For unknown tokens, check if it's a user-defined component
      const definitions = extractComponentDefinitions(document.getText());
      const userDefinition = definitions.find((def) => def.name === tokenText);

      if (userDefinition && userDefinition.documentation) {
        // Create markdown for user-defined component with its documentation
        documentation = `## ${tokenText}\n\n_User-defined component_\n\n${userDefinition.documentation}`;
      }
    }

    if (!documentation) {
      return null;
    }

    const markdown = new vscode.MarkdownString(documentation);
    markdown.isTrusted = true;
    const hover = new vscode.Hover(markdown, range);

    return hover;
  }
}
