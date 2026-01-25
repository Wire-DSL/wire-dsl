/**
 * Wire DSL Reference Provider
 * Enables Go-to-References for user-defined components
 * - From definition of Component X → find all usages of Component X
 * - Ctrl+Shift+H or right-click "Go to References"
 */

import * as vscode from 'vscode';
import {
  extractComponentDefinitions,
  extractComponentReferences,
  ComponentDefinition,
} from './utils/documentParser';

/**
 * Check if position is inside a component definition statement
 * Pattern: define Component "ComponentName"
 */
function isInComponentDefinition(
  text: string,
  line: number,
  character: number
): { name: string; definitionLine: number } | null {
  const lines = text.split('\n');

  if (line >= lines.length) {
    return null;
  }

  const lineText = lines[line];

  // Check if this line contains a component definition
  const defRegex = /define\s+Component\s+"([^"]+)"/;
  const match = lineText.match(defRegex);

  if (!match) {
    return null;
  }

  const componentName = match[1];
  const definitionStart = lineText.indexOf('define');
  const definitionEnd = lineText.indexOf('"') + componentName.length + 1;

  // Check if cursor is within the definition statement
  if (character >= definitionStart && character <= definitionEnd) {
    return { name: componentName, definitionLine: line };
  }

  return null;
}

export class WireReferenceProvider implements vscode.ReferenceProvider {
  provideReferences(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.ReferenceContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Location[]> {
    const text = document.getText();
    const line = position.line;
    const character = position.character;

    // Check if we're on a component definition
    const definitionInfo = isInComponentDefinition(text, line, character);
    if (!definitionInfo) {
      return null;
    }

    const componentName = definitionInfo.name;
    const locations: vscode.Location[] = [];

    // Add the definition itself if includeDeclaration is true
    if (context.includeDeclaration) {
      const definitions = extractComponentDefinitions(text);
      const definition = definitions.find((def) => def.name === componentName);

      if (definition) {
        const defPosition = new vscode.Position(definition.line, definition.character);
        locations.push(new vscode.Location(document.uri, defPosition));
      }
    }

    // Find all references to this component
    const references = extractComponentReferences(text);
    const componentReferences = references.filter((ref: { name: string; line: number; character: number }) => ref.name === componentName);

    // Convert references to locations
    componentReferences.forEach((ref: { name: string; line: number; character: number }) => {
      const refPosition = new vscode.Position(ref.line, ref.character);
      locations.push(new vscode.Location(document.uri, refPosition));
    });

    return locations.length > 0 ? locations : null;
  }
}
