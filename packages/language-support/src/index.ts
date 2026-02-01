/**
 * Wire DSL Language Support
 * Shared language definitions, syntax, and code intelligence for Monaco, VS Code, and other editors
 */

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

// Wire DSL Keywords
export const KEYWORDS: KeywordDefinition[] = [
  // Project & Screen
  { name: 'project', type: 'keyword', description: 'Declare a Wire project' },
  { name: 'screen', type: 'keyword', description: 'Define a screen/page' },
  { name: 'component', type: 'keyword', description: 'Define a reusable component' },
  
  // Containers
  { name: 'stack', type: 'component', description: 'Vertical/horizontal layout container' },
  { name: 'grid', type: 'component', description: 'Grid layout container' },
  { name: 'split', type: 'component', description: 'Split pane container' },
  { name: 'panel', type: 'component', description: 'Panel container with border' },
  { name: 'card', type: 'component', description: 'Card container with shadow' },
  { name: 'container', type: 'component', description: 'Generic container' },
  
  // UI Components
  { name: 'button', type: 'component', description: 'Interactive button element' },
  { name: 'text', type: 'component', description: 'Text/label element' },
  { name: 'input', type: 'component', description: 'Input field element' },
  { name: 'label', type: 'component', description: 'Label element' },
  { name: 'checkbox', type: 'component', description: 'Checkbox input' },
  { name: 'radio', type: 'component', description: 'Radio button input' },
  { name: 'select', type: 'component', description: 'Dropdown select element' },
  { name: 'textarea', type: 'component', description: 'Multi-line text input' },
  { name: 'divider', type: 'component', description: 'Visual divider' },
  { name: 'icon', type: 'component', description: 'Icon element' },
  { name: 'image', type: 'component', description: 'Image element' },
  { name: 'table', type: 'component', description: 'Data table element' },
  { name: 'form', type: 'component', description: 'Form container' },
  { name: 'link', type: 'component', description: 'Hyperlink element' },
  { name: 'badge', type: 'component', description: 'Badge/tag element' },
  { name: 'tag', type: 'component', description: 'Tag element' },
  { name: 'avatar', type: 'component', description: 'Avatar image element' },
  { name: 'tooltip', type: 'component', description: 'Tooltip element' },
  { name: 'popover', type: 'component', description: 'Popover element' },
  { name: 'modal', type: 'component', description: 'Modal dialog' },
  { name: 'tabs', type: 'component', description: 'Tabbed interface' },
  { name: 'accordion', type: 'component', description: 'Accordion container' },
  { name: 'alert', type: 'component', description: 'Alert/notification element' },
  { name: 'progress', type: 'component', description: 'Progress bar element' },
  { name: 'slider', type: 'component', description: 'Slider input' },
  { name: 'datepicker', type: 'component', description: 'Date picker input' },
  { name: 'timepicker', type: 'component', description: 'Time picker input' },
  { name: 'colorpicker', type: 'component', description: 'Color picker input' },
  { name: 'file-upload', type: 'component', description: 'File upload input' },
  { name: 'stat-card', type: 'component', description: 'Statistics card' },
  
  // Control Flow
  { name: 'if', type: 'keyword', description: 'Conditional rendering' },
  { name: 'for', type: 'keyword', description: 'Loop rendering' },
  { name: 'let', type: 'keyword', description: 'Variable declaration' },
  { name: 'const', type: 'keyword', description: 'Constant declaration' },
  { name: 'state', type: 'keyword', description: 'State management' },
  { name: 'render', type: 'keyword', description: 'Render hook' },
];

// Common Properties
export const PROPERTIES: KeywordDefinition[] = [
  // Layout
  { name: 'width', type: 'property', description: 'Element width (px, %, rem)' },
  { name: 'height', type: 'property', description: 'Element height (px, %, rem)' },
  { name: 'gap', type: 'property', description: 'Space between elements' },
  { name: 'padding', type: 'property', description: 'Internal spacing' },
  { name: 'margin', type: 'property', description: 'External spacing' },
  { name: 'align', type: 'property', description: 'Alignment' },
  { name: 'justify', type: 'property', description: 'Justification' },
  
  // Styling
  { name: 'background', type: 'property', description: 'Background color or image' },
  { name: 'color', type: 'property', description: 'Text color' },
  { name: 'border', type: 'property', description: 'Border style' },
  { name: 'border-color', type: 'property', description: 'Border color' },
  { name: 'border-radius', type: 'property', description: 'Border radius' },
  { name: 'shadow', type: 'property', description: 'Box shadow' },
  { name: 'opacity', type: 'property', description: 'Element opacity' },
  
  // Typography
  { name: 'font-size', type: 'property', description: 'Font size' },
  { name: 'font-weight', type: 'property', description: 'Font weight' },
  { name: 'font-family', type: 'property', description: 'Font family' },
  { name: 'line-height', type: 'property', description: 'Line height' },
  { name: 'text-align', type: 'property', description: 'Text alignment' },
  
  // Interaction
  { name: 'disabled', type: 'property', description: 'Disable element' },
  { name: 'readonly', type: 'property', description: 'Make element read-only' },
  { name: 'hidden', type: 'property', description: 'Hide element' },
  { name: 'required', type: 'property', description: 'Mark field as required' },
  
  // Common
  { name: 'id', type: 'property', description: 'Element ID' },
  { name: 'label', type: 'property', description: 'Element label/text' },
  { name: 'placeholder', type: 'property', description: 'Input placeholder' },
  { name: 'variant', type: 'property', description: 'Style variant' },
  { name: 'size', type: 'property', description: 'Element size' },
];

export const ALL_KEYWORDS = [...KEYWORDS, ...PROPERTIES];

export function getKeywordsByType(type: 'keyword' | 'component' | 'property'): KeywordDefinition[] {
  return ALL_KEYWORDS.filter(kw => kw.type === type);
}

export function getCompletions(prefix: string = ''): CompletionSuggestion[] {
  const lowerPrefix = prefix.toLowerCase();
  
  return ALL_KEYWORDS
    .filter(kw => kw.name.toLowerCase().startsWith(lowerPrefix))
    .map(kw => ({
      label: kw.name,
      kind: kw.type === 'component' ? 'Class' : kw.type === 'property' ? 'Property' : 'Keyword',
      detail: kw.description,
      documentation: kw.description,
      sortText: kw.name,
    }));
}

export default {
  KEYWORDS,
  PROPERTIES,
  ALL_KEYWORDS,
  getKeywordsByType,
  getCompletions,
};
