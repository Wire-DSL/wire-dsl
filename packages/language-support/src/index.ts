/**
 * Wire DSL Language Support
 * Shared language definitions, syntax, and code intelligence for Monaco, VS Code, and other editors
 */

// Import for internal use
import { COMPONENTS, KEYWORDS } from './components.js';

// Re-export new core modules
export {
  COMPONENTS,
  LAYOUTS,
  PROPERTY_VALUES,
  KEYWORDS,
  type ComponentMetadata,
  type ComponentCategory,
  type LayoutMetadata,
  type PropertyMetadata,
} from './components.js';
export { ICON_NAMES, ICON_NAME_OPTIONS, type IconName } from './icon-names.js';

export {
  getComponentDocumentation,
  getLayoutDocumentation,
  getPropertyDocumentation,
  getKeywordDocumentation,
} from './documentation.js';

export {
  extractComponentDefinitions,
  extractLayoutDefinitions,
  getTokenAtPosition,
  isComponentReference,
  extractComponentReferences,
  extractScreenDefinitions,
  getPositionOfDefinition,
  findComponentReferences,
  type ComponentDefinition,
  type LayoutDefinition,
} from './document-parser.js';

export {
  determineScope,
  detectComponentContext,
  getComponentPropertiesForCompletion as getAvailableProperties,
  getAlreadyDeclaredProperties,
  type DocumentScope,
  type CompletionItem,
} from './context-detection.js';

export {
  KEYWORD_COMPLETIONS,
  CONTAINER_COMPLETIONS,
  COMPONENT_COMPLETIONS,
  PROPERTY_COMPLETIONS,
  isPropertyContext,
  getComponentPropertiesForCompletion,
  getPropertyValueSuggestions,
  getScopeBasedCompletions,
  detectComponentKeyword,
  detectPropertyValueContext,
  getAvailableComponents,
  getComponentProperties,
} from './completions.js';

// Legacy interface support
export interface KeywordDefinition {
  name: string;
  type: 'keyword' | 'component' | 'property';
  description?: string;
}

export interface CompletionSuggestion {
  label: string;
  kind: string;
  detail?: string;
  documentation?: string;
  sortText?: string;
}

// Build ALL_KEYWORDS using ACTUAL Wire DSL keywords
export const ALL_KEYWORDS: KeywordDefinition[] = [
  // Top-level keywords
  ...KEYWORDS.topLevel.map(name => ({
    name,
    type: 'keyword' as const,
    description: `Wire DSL keyword: ${name}`,
  })),
  // Screen keyword
  ...KEYWORDS.screen.map(name => ({
    name,
    type: 'keyword' as const,
    description: `Wire DSL keyword: ${name}`,
  })),
  // Layout keyword
  ...KEYWORDS.layout.map(name => ({
    name,
    type: 'keyword' as const,
    description: `Wire DSL keyword: ${name}`,
  })),
  // Component keyword
  ...KEYWORDS.component.map(name => ({
    name,
    type: 'keyword' as const,
    description: `Wire DSL keyword: ${name}`,
  })),
  // Cell keyword
  ...KEYWORDS.cell.map(name => ({
    name,
    type: 'keyword' as const,
    description: `Wire DSL keyword: ${name}`,
  })),
  // Special keywords
  ...KEYWORDS.special.map(name => ({
    name,
    type: 'keyword' as const,
    description: `Wire DSL keyword: ${name}`,
  })),
  // Components from metadata
  ...Object.entries(COMPONENTS).map(([name, meta]) => ({
    name,
    type: 'component' as const,
    description: meta.description || `Component: ${name}`,
  })),
];

/**
 * Get completions for a given prefix
 * @param prefix Filter by prefix (e.g., 'but' → ['button', ...])
 * @returns Array of completion suggestions
 */
export function getCompletions(prefix: string = ''): CompletionSuggestion[] {
  const lowerPrefix = prefix.toLowerCase();
  return ALL_KEYWORDS
    .filter(kw => kw.name.toLowerCase().startsWith(lowerPrefix))
    .map(kw => ({
      label: kw.name,
      kind: kw.type === 'component' ? 'Class' : 'Keyword',
      detail: kw.description,
      documentation: kw.description,
      sortText: kw.name,
    }));
}
