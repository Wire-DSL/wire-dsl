/**
 * Wire-DSL Code Wrapper
 * 
 * Intelligently wraps incomplete Wire-DSL code snippets with required structure.
 * Handles components, layouts, screens, and projects automatically.
 */

/**
 * Intelligently wraps incomplete Wire-DSL code snippets with required structure
 * 
 * @param code - User's Wire-DSL code (may be partial)
 * @returns Complete, renderable Wire-DSL code
 * 
 * @example
 * // Input: Single component
 * prepareCodeForRendering('text { label: "Hello" }')
 * // Output: 
 * // project "Default" {
 * //   screen Main {
 * //     layout stack {
 * //       text { label: "Hello" }
 * //     }
 * //   }
 * // }
 */
export function prepareCodeForRendering(code: string): string {
  const trimmed = code.trim();
  
  if (!trimmed) {
    throw new Error('Code snippet cannot be empty');
  }

  // Helper: Add consistent indentation
  const indent = (text: string, spaces: number): string => {
    const indentStr = ' '.repeat(spaces);
    return text
      .split('\n')
      .map((line, idx) => {
        // First line doesn't get indented (it's already positioned)
        if (idx === 0) return line;
        // Empty lines stay empty
        if (line.trim() === '') return '';
        // Other lines get indented
        return indentStr + line;
      })
      .join('\n');
  };

  // Check what keyword the code starts with (ignoring comments)
  const firstKeyword = extractFirstKeyword(trimmed);

  // Case 1: Already has project - return as-is
  if (firstKeyword === 'project') {
    return code;
  }

  // Case 2: Has screen but missing project
  if (firstKeyword === 'screen') {
    return `project "Default" {
  ${indent(code, 2)}
}`;
  }

  // Case 3: Has layout but missing project + screen
  if (firstKeyword === 'layout') {
    return `project "Default" {
  screen Main {
    ${indent(code, 4)}
  }
}`;
  }

  // Case 4: Component, text, image, or other statement
  // Default: wrap in project → screen → layout stack
  return `project "Default" {
  screen Main {
    layout stack {
      ${indent(code, 6)}
    }
  }
}`;
}

/**
 * Extract the first non-comment keyword from code
 * Handles:
 * - Comments starting with //
 * - Whitespace and newlines
 * 
 * @example
 * extractFirstKeyword('// comment\nproject { }') // Returns 'project'
 * extractFirstKeyword('  layout stack { }') // Returns 'layout'
 */
function extractFirstKeyword(code: string): string {
  const lines = code.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) continue;
    
    // Skip comment lines
    if (trimmed.startsWith('//')) continue;
    
    // Extract first word (keyword)
    const match = trimmed.match(/^(\w+)/);
    if (match) {
      return match[1].toLowerCase();
    }
  }
  
  return '';
}

/**
 * Validation to ensure code is well-formed
 * (Safety check before rendering)
 */
export function validateWireCode(code: string): { valid: boolean; error?: string } {
  if (!code.trim()) {
    return { valid: false, error: 'Code cannot be empty' };
  }

  // Check for balanced braces
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    return { 
      valid: false, 
      error: `Unbalanced braces: ${openBraces} open, ${closeBraces} close` 
    };
  }

  return { valid: true };
}

/**
 * Utility to sanitize and extract metadata from code fence
 */
export interface CodeMetadata {
  canPreview: boolean;
  language: string;
}

export function parseCodeFenceMetadata(metaString: string): CodeMetadata {
  const canPreview = metaString.includes('canPreview') && 
                    metaString.includes('true');
  
  return {
    canPreview,
    language: 'wire',
  };
}

/**
 * Escape HTML characters for safe display
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

