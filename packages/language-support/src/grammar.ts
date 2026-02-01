/**
 * Monaco Editor Grammar Configuration
 * TextMate grammar for Wire DSL syntax highlighting
 */

export interface MonacoGrammarConfig {
  keywords: string[];
  components: string[];
  properties: string[];
  operators: string[];
}

export const MONACO_GRAMMAR: MonacoGrammarConfig = {
  keywords: [
    'project',
    'screen',
    'component',
    'state',
    'render',
    'if',
    'else',
    'for',
    'while',
    'let',
    'const',
    'var',
    'return',
    'function',
    'true',
    'false',
    'null',
    'undefined',
  ],
  components: [
    'stack',
    'grid',
    'split',
    'panel',
    'card',
    'container',
    'button',
    'text',
    'input',
    'label',
    'checkbox',
    'radio',
    'select',
    'textarea',
    'divider',
    'icon',
    'image',
    'table',
    'form',
    'link',
    'badge',
    'tag',
    'avatar',
    'tooltip',
    'popover',
    'modal',
    'tabs',
    'accordion',
    'alert',
    'progress',
    'slider',
    'datepicker',
    'timepicker',
    'colorpicker',
    'file-upload',
    'stat-card',
  ],
  properties: [
    'id',
    'label',
    'placeholder',
    'width',
    'height',
    'gap',
    'padding',
    'margin',
    'align',
    'justify',
    'background',
    'color',
    'border',
    'border-color',
    'border-radius',
    'shadow',
    'opacity',
    'font-size',
    'font-weight',
    'font-family',
    'line-height',
    'text-align',
    'disabled',
    'readonly',
    'hidden',
    'required',
    'variant',
    'size',
    'columns',
    'rows',
    'direction',
    'wrap',
    'theme',
    'mode',
  ],
  operators: [
    '=',
    ':',
    '+',
    '-',
    '*',
    '/',
    '%',
    '==',
    '!=',
    '===',
    '!==',
    '<',
    '>',
    '<=',
    '>=',
    '&&',
    '||',
    '!',
    '?',
    '.',
    ',',
    ';',
    '{',
    '}',
    '[',
    ']',
    '(',
    ')',
  ],
};

export interface MonarcTokenizeRule {
  regex: string;
  token: string;
}

export const TOKENIZE_RULES: MonarcTokenizeRule[] = [
  // Comments
  { regex: '/\\*', token: 'comment' },
  { regex: '/\\/.*$', token: 'comment' },
  
  // Strings
  { regex: '"(?:[^"\\\\]|\\\\.)*"', token: 'string' },
  { regex: "'(?:[^'\\\\]|\\\\.)*'", token: 'string' },
  
  // Numbers
  { regex: '\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b', token: 'number' },
  
  // Keywords
  { regex: '\\b(?:project|screen|component|state|render|if|else|for|while|let|const|var|return|function|true|false|null|undefined)\\b', token: 'keyword' },
  
  // Components (capitalized)
  { regex: '\\b(?:Stack|Grid|Split|Panel|Card|Button|Text|Input|Label|Checkbox|Select|Table|Form|Link|Modal|Tabs|Accordion|Alert|Progress|Slider)\\b', token: 'type' },
  
  // Properties
  { regex: '\\b(?:id|label|placeholder|width|height|gap|padding|margin|color|background|border|size|variant)\\b(?=\\s*:)', token: 'variable' },
];

export default {
  MONACO_GRAMMAR,
  TOKENIZE_RULES,
};
