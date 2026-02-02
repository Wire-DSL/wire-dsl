/**
 * Wire DSL Language Support
 * Shared language definitions, syntax, and code intelligence for Monaco, VS Code, and other editors
 */

// Re-export new core modules
export {
  COMPONENTS,
  LAYOUTS,
  PROPERTY_VALUES,
  KEYWORDS,
  type ComponentMetadata,
  type LayoutMetadata,
} from './components';

export {
  getComponentDocumentation,
  getLayoutDocumentation,
  getPropertyDocumentation,
  getKeywordDocumentation,
} from './documentation';

export {
  extractComponentDefinitions,
  getTokenAtPosition,
  isComponentReference,
  extractComponentReferences,
  extractScreenDefinitions,
  getPositionOfDefinition,
  findComponentReferences,
  type ComponentDefinition,
} from './document-parser';

export {
  determineScope,
  detectComponentContext,
  getComponentPropertiesForCompletion as getAvailableProperties,
  getAlreadyDeclaredProperties,
  type DocumentScope,
  type CompletionItem,
} from './context-detection';

export {
  KEYWORD_COMPLETIONS,
  CONTAINER_COMPLETIONS,
  COMPONENT_COMPLETIONS,
  PROPERTY_COMPLETIONS,
  getContextualCompletions,
  isPropertyContext,
  getCurrentWord,
  getComponentPropertiesForCompletion,
  getPropertyValueSuggestions,
} from './completions';

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
