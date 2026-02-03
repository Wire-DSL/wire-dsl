/**
 * Wire DSL Context Detection
 * Agnóstic logic for detecting document scope and completion context
 * Used by Monaco, VS Code, and other editors
 */

import { COMPONENTS } from './components';

export type DocumentScope = 'empty-file' | 'inside-project' | 'inside-screen' | 'inside-layout';

export interface CompletionContext {
  scope: DocumentScope;
  componentName?: string;
  lineText: string;
  word?: string;
}

/**
 * Determine document scope by analyzing text structure
 * Returns: empty-file | inside-project | inside-screen | inside-layout
 * 
 * Hierarchy:
 * project { ... }          <- empty-file → inside-project
 *   screen Name { ... }    <- inside-project → inside-screen
 *     layout stack(...) {  <- inside-screen → inside-layout
 *       component Button   <- inside-layout
 */
export function determineScope(textBeforeCursor: string): DocumentScope {
  const cleanText = textBeforeCursor.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  if (cleanText.trim().length === 0) {
    return 'empty-file';
  }

  // Track nesting depth by analyzing braces and keywords
  let projectBraceCount = 0;
  let screenBraceCount = 0;
  let layoutBraceCount = 0;
  
  let hasProject = false;
  let hasScreen = false;
  let hasLayout = false;

  const lines = cleanText.split('\n');
  for (const line of lines) {
    // Track keywords
    if (line.match(/\bproject\s+"?[^{]*{/)) {
      hasProject = true;
    }
    if (line.match(/\bscreen\s+[A-Za-z_][A-Za-z0-9_]*\s*{/)) {
      hasScreen = true;
    }
    if (line.match(/\blayout\s+(?:stack|grid|card|panel|split)\s*\(/)) {
      hasLayout = true;
    }

    // Count opening braces
    if (line.includes('project') && line.includes('{')) projectBraceCount++;
    if (line.includes('screen') && line.includes('{')) screenBraceCount++;
    if (line.includes('layout') && line.includes('{')) layoutBraceCount++;

    // Count closing braces to track nesting level
    projectBraceCount -= (line.match(/}/g) || []).length;
    screenBraceCount -= (line.match(/}/g) || []).length;
    layoutBraceCount -= (line.match(/}/g) || []).length;
  }

  // Determine scope based on nesting hierarchy
  if (!hasProject) {
    return 'empty-file';
  }

  // We're inside a layout (deepest level)
  if (hasLayout && layoutBraceCount > 0) {
    return 'inside-layout';
  }

  // We're inside a screen but not in a layout
  if (hasScreen && screenBraceCount > 0) {
    return 'inside-screen';
  }

  // We're inside project level
  if (hasProject && projectBraceCount > 0) {
    return 'inside-project';
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
 * - "component Button text: "Save"" → returns "Button"
 * - "component B" → returns null (still typing component name)
 */
export function detectComponentContext(lineText: string): string | null {
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
 * Get the current word being typed at the end of a line
 */
export function getCurrentWord(lineText: string): string {
  const match = lineText.match(/[\w-]*$/);
  return match ? match[0] : '';
}

/**
 * Get component properties available for completion
 * Filters out properties that are already declared
 */
export interface CompletionItem {
  label: string;
  kind: 'Keyword' | 'Component' | 'Property' | 'Value' | 'Variable';
  detail?: string;
  documentation?: string;
  insertText?: string;
}

export function getComponentPropertiesForCompletion(
  componentName: string,
  alreadyDeclared: Set<string> = new Set()
): CompletionItem[] {
  const component = COMPONENTS[componentName as keyof typeof COMPONENTS];
  if (!component) return [];

  const items: CompletionItem[] = [];
  const properties = component.properties || [];

  for (const propName of properties) {
    // Skip if this property is already declared
    if (alreadyDeclared.has(propName)) {
      continue;
    }

    const item: CompletionItem = {
      label: propName,
      kind: 'Property',
      detail: `Property of ${componentName}`,
      insertText: `${propName}: `,
    };

    // Add property values if available
    if (component.propertyValues && component.propertyValues[propName]) {
      const values = component.propertyValues[propName];
      item.insertText = `${propName}: ${values.length === 1 ? values[0] : ''}`;
    }

    items.push(item);
  }

  return items;
}

/**
 * Extract already-declared properties from a component line
 * Patterns: propertyName: or propertyName: value
 */
export function getAlreadyDeclaredProperties(lineText: string): Set<string> {
  const declaredProps = new Set<string>();
  const matches = lineText.matchAll(/(\w+):\s*/g);

  for (const match of matches) {
    declaredProps.add(match[1]);
  }

  return declaredProps;
}
