/**
 * Wire DSL Definition Provider
 * Enables Go-to-Definition for user-defined components
 * - Ctrl+Click or F12 on component name → jump to define statement
 */

import * as vscode from 'vscode';
import { COMPONENTS } from './data/components';
import {
  extractComponentDefinitions,
  getTokenAtPosition,
  isComponentReference,
} from './utils/documentParser';

export class WireDefinitionProvider implements vscode.DefinitionProvider {
  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Definition> {
    const text = document.getText();
    const line = position.line;
    const character = position.character;

    // Check if we're on a component reference
    if (!isComponentReference(text, line, character)) {
      return null;
    }

    // Get the token (component name) at cursor position
    const tokenInfo = getTokenAtPosition(text, line, character);
    if (!tokenInfo) {
      return null;
    }

    const componentName = tokenInfo.token;

    // Built-in components don't have definitions to jump to
    if (COMPONENTS[componentName as keyof typeof COMPONENTS]) {
      return null;
    }

    // Extract all component definitions from document
    const definitions = extractComponentDefinitions(text);

    // Find matching definition
    const definition = definitions.find((def) => def.name === componentName);
    if (!definition) {
      return null;
    }

    // Return location of the definition
    const definitionPosition = new vscode.Position(definition.line, definition.character);
    const location = new vscode.Location(document.uri, definitionPosition);

    return location;
  }
}
