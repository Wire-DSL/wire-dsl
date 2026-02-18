/**
 * Wire DSL Document Parser
 * Extracts component definitions and references from Wire DSL documents
 */

/**
 * Represents a component definition in the document
 */
export interface ComponentDefinition {
  name: string;
  line: number;
  character: number;
  endLine: number;
  documentation?: string; // Optional JSDoc-style documentation
}

export interface LayoutDefinition {
  name: string;
  line: number;
  character: number;
  endLine: number;
  documentation?: string;
}

/**
 * Extract all component definitions from document text
 * Syntax: define Component "ComponentName" { ... }
 * Supports documentation via block comments before the definition
 */
export function extractComponentDefinitions(text: string): ComponentDefinition[] {
  const definitions: ComponentDefinition[] = [];
  const lines = text.split('\n');

  // Regex to match: define Component "ComponentName"
  const regex = /define\s+Component\s+"([^"]+)"/gm;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const componentName = match[1];
    const matchIndex = match.index;

    // Calculate line and character position
    const lineNumber = text.substring(0, matchIndex).split('\n').length - 1;
    const lastLineBreak = text.lastIndexOf('\n', matchIndex);
    const character = matchIndex - (lastLineBreak + 1);

    // Find end line by locating the closing brace
    const afterName = matchIndex + match[0].length;
    let braceCount = 0;
    let foundOpening = false;
    let endLine = lineNumber;

    for (let i = afterName; i < text.length; i++) {
      const char = text[i];

      if (char === '{') {
        braceCount++;
        foundOpening = true;
      } else if (char === '}') {
        braceCount--;
        if (foundOpening && braceCount === 0) {
          // Found the closing brace
          endLine = text.substring(0, i).split('\n').length - 1;
          break;
        }
      }
    }

    // Extract documentation from block comments before the definition
    let documentation: string | undefined;
    if (lineNumber > 0) {
      // Look backwards for /* ... */ block comment immediately before the definition
      let currentLine = lineNumber - 1;

      // Skip empty lines
      while (currentLine >= 0 && lines[currentLine].trim() === '') {
        currentLine--;
      }

      if (currentLine >= 0) {
        const prevLine = lines[currentLine];
        const prevTrimmed = prevLine.trim();

        // Check if the previous line contains the end of a block comment
        if (prevTrimmed.endsWith('*/')) {
          // Find the start of the block comment
          let blockStart = currentLine;
          let foundStart = false;

          // Look backwards for /*
          for (let i = currentLine; i >= 0; i--) {
            const lineText = lines[i];
            if (lineText.includes('/*')) {
              blockStart = i;
              foundStart = true;
              break;
            }
          }

          if (foundStart) {
            // Extract the block comment content
            const commentLines: string[] = [];
            for (let i = blockStart; i <= currentLine; i++) {
              let lineText = lines[i].trim();

              // Remove /* from the beginning and */ from the end
              if (i === blockStart) {
                lineText = lineText.replace(/^\/\*\s*/, '');
              }
              if (i === currentLine) {
                lineText = lineText.replace(/\s*\*\/$/, '');
              }

              // Remove leading * from continuation lines
              lineText = lineText.replace(/^\*\s*/, '');

              if (lineText) {
                commentLines.push(lineText);
              }
            }

            if (commentLines.length > 0) {
              documentation = commentLines.join('\n');
            }
          }
        }
      }
    }

    definitions.push({
      name: componentName,
      line: lineNumber,
      character: character,
      endLine: endLine,
      documentation,
    });
  }

  return definitions;
}

/**
 * Extract all layout definitions from document text
 * Syntax: define Layout "layout_name" { ... }
 */
export function extractLayoutDefinitions(text: string): LayoutDefinition[] {
  const definitions: LayoutDefinition[] = [];
  const regex = /define\s+Layout\s+"([^"]+)"/gm;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const layoutName = match[1];
    const matchIndex = match.index;
    const lineNumber = text.substring(0, matchIndex).split('\n').length - 1;
    const lastLineBreak = text.lastIndexOf('\n', matchIndex);
    const character = matchIndex - (lastLineBreak + 1);

    const afterName = matchIndex + match[0].length;
    let braceCount = 0;
    let foundOpening = false;
    let endLine = lineNumber;

    for (let i = afterName; i < text.length; i++) {
      const char = text[i];
      if (char === '{') {
        braceCount++;
        foundOpening = true;
      } else if (char === '}') {
        braceCount--;
        if (foundOpening && braceCount === 0) {
          endLine = text.substring(0, i).split('\n').length - 1;
          break;
        }
      }
    }

    definitions.push({
      name: layoutName,
      line: lineNumber,
      character,
      endLine,
    });
  }

  return definitions;
}

/**
 * Get the token at a specific position in the document
 * Returns the word and its range
 */
export function getTokenAtPosition(
  text: string,
  line: number,
  character: number
): { token: string; startChar: number; endChar: number } | null {
  const lines = text.split('\n');

  if (line >= lines.length) {
    return null;
  }

  const lineText = lines[line];

  // Skip if in comment
  const commentIndex = lineText.indexOf('//');
  if (commentIndex !== -1 && character > commentIndex) {
    return null;
  }

  // Skip if in string literal (between quotes)
  let inString = false;
  let stringChar = '';
  for (let i = 0; i < character; i++) {
    if ((lineText[i] === '"' || lineText[i] === "'") && lineText[i - 1] !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = lineText[i];
      } else if (lineText[i] === stringChar) {
        inString = false;
      }
    }
  }
  if (inString) {
    return null;
  }

  // Extract word boundaries
  let start = character;
  while (start > 0 && /[a-zA-Z0-9_]/.test(lineText[start - 1])) {
    start--;
  }

  let end = character;
  while (end < lineText.length && /[a-zA-Z0-9_]/.test(lineText[end])) {
    end++;
  }

  if (start === end) {
    return null;
  }

  const token = lineText.substring(start, end);

  return { token, startChar: start, endChar: end };
}

/**
 * Check if a position is inside a component reference
 * Pattern: component SomeComponent (with optional properties after)
 */
export function isComponentReference(text: string, line: number, character: number): boolean {
  const lines = text.split('\n');

  if (line >= lines.length) {
    return false;
  }

  const lineText = lines[line];

  // Skip if in comment
  const commentIndex = lineText.indexOf('//');
  if (commentIndex !== -1 && character > commentIndex) {
    return false;
  }

  // Check if this line contains 'component' keyword
  const componentIndex = lineText.indexOf('component');
  if (componentIndex === -1) {
    return false;
  }

  // Check if cursor is after the 'component' keyword
  const componentKeywordEnd = componentIndex + 'component'.length;
  if (character <= componentKeywordEnd) {
    return false;
  }

  // Extract component name from after 'component' keyword
  const afterComponent = lineText.substring(componentKeywordEnd).trimStart();
  const componentNameMatch = afterComponent.match(/^([a-zA-Z_][a-zA-Z0-9_]*)/);

  if (!componentNameMatch) {
    return false;
  }

  // Calculate position of component name in original line
  const nameStartInSubstring = lineText.substring(componentKeywordEnd).indexOf(componentNameMatch[1]);
  const nameStart = componentKeywordEnd + nameStartInSubstring;
  const nameEnd = nameStart + componentNameMatch[1].length;

  // Check if cursor is within or just after the component name
  return character >= nameStart && character <= nameEnd;
}

/**
 * Extract all component references (usages) from the document
 * Returns array of { name, line, character }
 */
export function extractComponentReferences(
  text: string
): Array<{
  name: string;
  line: number;
  character: number;
}> {
  const references: Array<{
    name: string;
    line: number;
    character: number;
  }> = [];

  const lines = text.split('\n');

  lines.forEach((lineText, lineNum) => {
    // Match: component SomeName (not inside quotes)
    const regex = /component\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let match;

    while ((match = regex.exec(lineText)) !== null) {
      const componentName = match[1];
      const character = match.index + 'component'.length + 1;

      references.push({
        name: componentName,
        line: lineNum,
        character: character,
      });
    }
  });

  return references;
}

/**
 * Extract all screen definitions from document text
 * Syntax: screen ScreenName { ... }
 */
export function extractScreenDefinitions(text: string): ComponentDefinition[] {
  const definitions: ComponentDefinition[] = [];
  const regex = /screen\s+([a-zA-Z_][a-zA-Z0-9_]*)/gm;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const screenName = match[1];
    const matchIndex = match.index;

    const lineNumber = text.substring(0, matchIndex).split('\n').length - 1;
    const lastLineBreak = text.lastIndexOf('\n', matchIndex);
    const character = matchIndex - (lastLineBreak + 1);

    definitions.push({
      name: screenName,
      line: lineNumber,
      character: character,
      endLine: lineNumber,
    });
  }

  return definitions;
}

/**
 * Find the definition position of a component, screen, or layout
 */
export function getPositionOfDefinition(text: string, name: string): { line: number; character: number } | null {
  // First check component definitions
  const componentDefs = extractComponentDefinitions(text);
  const componentDef = componentDefs.find((def) => def.name === name);
  if (componentDef) {
    return { line: componentDef.line, character: componentDef.character };
  }

  // Then check screen definitions
  const screenDefs = extractScreenDefinitions(text);
  const screenDef = screenDefs.find((def) => def.name === name);
  if (screenDef) {
    return { line: screenDef.line, character: screenDef.character };
  }

  // Then check layout definitions
  const layoutDefs = extractLayoutDefinitions(text);
  const layoutDef = layoutDefs.find((def) => def.name === name);
  if (layoutDef) {
    return { line: layoutDef.line, character: layoutDef.character };
  }

  return null;
}

/**
 * Find all references to a component or screen
 */
export function findComponentReferences(
  text: string,
  name: string
): Array<{ line: number; character: number }> {
  const references = extractComponentReferences(text);
  const screenReferences = extractScreenDefinitions(text).filter((s) => s.name === name);
  const layoutDefinitions = extractLayoutDefinitions(text).filter((l) => l.name === name);

  return [
    ...references.filter((ref) => ref.name === name).map((ref) => ({ line: ref.line, character: ref.character })),
    ...screenReferences.map((def) => ({ line: def.line, character: def.character })),
    ...layoutDefinitions.map((def) => ({ line: def.line, character: def.character })),
  ];
}
