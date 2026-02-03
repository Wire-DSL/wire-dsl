import * as monaco from 'monaco-editor';
import { 
  ALL_KEYWORDS, 
  getCompletions, 
  getScopeBasedCompletions,
  COMPONENTS,
  LAYOUTS,
  PROPERTY_VALUES,
  getAvailableComponents,
  getComponentProperties,
  getPropertyValueSuggestions,
} from '@wire-dsl/language-support';
import { determineScope } from '@wire-dsl/language-support/context-detection';

// Registrar el lenguaje Wire DSL en Monaco
export function registerWireLanguage() {
  // Registrar el lenguaje
  monaco.languages.register({ id: 'wire' });

  // Construir patrones de keywords desde language-support
  const keywordPattern = ALL_KEYWORDS
    .map(kw => kw.name)
    .join('|');

  // Definir el tokenizer
  monaco.languages.setMonarchTokensProvider('wire', {
    tokenizer: {
      root: [
        // Keywords y componentes
        [
          new RegExp(`\\b(${keywordPattern})\\b`),
          'keyword',
        ],
        [/\b(true|false|null)\b/, 'constant'],
        [/\b(let|const|var|if|else|for|while|return|function)\b/, 'keyword.control'],

        // Strings
        [/"(?:\\.|[^"\\])*"/, 'string'],
        [/'(?:\\.|[^'\\])*'/, 'string'],

        // Comments
        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment'],

        // Numbers
        [/\d+(\.\d+)?/, 'number'],

        // Operators
        [/[=+\-*/%&|^<>!]=?|[(){}\[\];:.,]/, 'operator'],

        // Whitespace
        [/\s+/, 'white'],
      ],
      comment: [
        [/[^*/]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[*/]/, 'comment'],
      ],
    },
  });

  // Configurar color de sintaxis (theme)
  monaco.editor.defineTheme('wire-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '7928ca', fontStyle: 'bold' },
      { token: 'keyword.control', foreground: '7928ca', fontStyle: 'bold' },
      { token: 'constant', foreground: 'c41a16' },
      { token: 'string', foreground: '2a7e20' },
      { token: 'number', foreground: '098658' },
      { token: 'comment', foreground: '999999', fontStyle: 'italic' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#333333',
      'editor.lineNumbersColumn.background': '#f8f8f8',
      'editorCursor.foreground': '#333333',
      'editor.selectionBackground': '#d4d4d450',
      'editorLineNumber.foreground': '#999999',
    },
  });

  // Configurar autocompletar con lógica de Wire DSL
  monaco.languages.registerCompletionItemProvider('wire', {
    provideCompletionItems: (model, position) => {
      const lineText = model.getLineContent(position.lineNumber).substring(0, position.column - 1);
      const documentText = model.getValue();
      const cursorOffset = model.getOffsetAt(position);
      const textBeforeCursor = documentText.substring(0, cursorOffset);

      // HIGHEST PRIORITY: Check if we're in a component definition (before anything else)
      const componentContext = detectComponentPropertyContext(lineText);
      if (componentContext) {
        return {
          suggestions: getComponentPropertiesCompletions(componentContext, lineText),
        };
      }

      // Check immediate line context (layout types, component names, property values)
      if (/layout\s+\w*$/.test(lineText)) {
        return {
          suggestions: getLayoutTypeCompletions(),
        };
      }

      if (/component\s+[A-Z]?\w*$/.test(lineText)) {
        return {
          suggestions: getComponentCompletions(),
        };
      }

      if (/:\s+\w*$/.test(lineText)) {
        return {
          suggestions: getPropertyValueCompletions(lineText),
        };
      }

      // Determine broader document scope
      const scope = determineScope(textBeforeCursor);

      if (scope === 'empty-file') {
        return {
          suggestions: getProjectOnlyCompletion(),
        };
      }
      if (scope === 'inside-project') {
        return {
          suggestions: getProjectLevelCompletions(),
        };
      }
      if (scope === 'inside-screen') {
        return {
          suggestions: getScreenLevelCompletions(),
        };
      }
      if (scope === 'inside-layout') {
        return {
          suggestions: getLayoutBodyCompletions(),
        };
      }

      return {
        suggestions: [],
      };
    },
    triggerCharacters: [' ', '{', ':', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
  });

  // Helper functions for completion logic
  function detectComponentPropertyContext(lineText: string): string | null {
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

  function getProjectOnlyCompletion(): any[] {
    return [
      {
        label: 'project',
        kind: monaco.languages.CompletionItemKind.Keyword,
        detail: 'Define a new Wire DSL project (root element)',
        insertText: 'project "${1:ProjectName}" {\n\t${2:}\n}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      }
    ];
  }

  function getProjectLevelCompletions(): any[] {
    return [
      {
        label: 'tokens',
        kind: monaco.languages.CompletionItemKind.Keyword,
        detail: 'Define design tokens',
        insertText: 'tokens ',
      },
      {
        label: 'colors',
        kind: monaco.languages.CompletionItemKind.Keyword,
        detail: 'Define custom color palette',
        insertText: 'colors {\n\t${1:}\n}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: 'mocks',
        kind: monaco.languages.CompletionItemKind.Keyword,
        detail: 'Define mock data',
        insertText: 'mocks {\n\t${1:}\n}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: 'screen',
        kind: monaco.languages.CompletionItemKind.Keyword,
        detail: 'Define a new screen/view',
        insertText: 'screen ${1:ScreenName} {\n\t${2:}\n}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
    ];
  }

  function getScreenLevelCompletions(): any[] {
    return [
      {
        label: 'layout',
        kind: monaco.languages.CompletionItemKind.Keyword,
        detail: 'Define a layout for this screen',
        insertText: 'layout ',
      },
    ];
  }

  function getLayoutBodyCompletions(): any[] {
    return [
      {
        label: 'component',
        kind: monaco.languages.CompletionItemKind.Keyword,
        detail: 'Add a component',
        insertText: 'component ',
        sortText: '1-component',
      },
      {
        label: 'layout',
        kind: monaco.languages.CompletionItemKind.Keyword,
        detail: 'Add a nested layout',
        insertText: 'layout ',
        sortText: '2-layout',
      },
      {
        label: 'cell',
        kind: monaco.languages.CompletionItemKind.Keyword,
        detail: 'Define a cell in a grid',
        insertText: 'cell span: ',
        sortText: '3-cell',
      },
    ];
  }

  function getLayoutTypeCompletions(): any[] {
    const items: any[] = [];

    for (const [key, layout] of Object.entries(LAYOUTS)) {
      const item: any = {
        label: key,
        kind: monaco.languages.CompletionItemKind.Keyword,
        detail: layout.description,
      };

      // Monaco no soporta choice lists como VS Code, así que usamos insertText simple
      if (key === 'stack') {
        item.insertText = 'stack(direction: vertical, gap: md, padding: md) {\n\t${1:}\n}';
      } else if (key === 'grid') {
        item.insertText = 'grid(columns: 12, gap: md) {\n\t${1:}\n}';
      } else if (key === 'split') {
        item.insertText = 'split(sidebar: 260, gap: md) {\n\t${1:}\n}';
      } else if (key === 'panel') {
        item.insertText = 'panel(padding: md) {\n\t${1:}\n}';
      } else if (key === 'card') {
        item.insertText = 'card(padding: md, gap: md) {\n\t${1:}\n}';
      }
      item.insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;

      items.push(item);
    }

    return items;
  }

  function getComponentCompletions(): any[] {
    const items: any[] = [];

    for (const [name, metadata] of Object.entries(COMPONENTS)) {
      // Only uppercase names are components
      if (!/^[A-Z]/.test(name)) continue;

      const item = {
        label: name,
        kind: monaco.languages.CompletionItemKind.Class,
        detail: metadata.description,
        insertText: name + ' ',
      };

      items.push(item);
    }

    return items;
  }

  function getComponentPropertiesCompletions(componentName: string, lineText: string): any[] {
    const items: any[] = [];
    const component = COMPONENTS[componentName as keyof typeof COMPONENTS];

    if (!component) {
      return items;
    }

    // Get component-specific properties
    const properties = component.properties || [];

    // Extract already-declared properties from the line
    const declaredPropsMatch = lineText.matchAll(/(\w+):\s*/g);
    const declaredProps = new Set<string>();
    for (const match of declaredPropsMatch) {
      declaredProps.add(match[1]);
    }

    for (const propName of properties) {
      // Skip if this property is already declared on this line
      if (declaredProps.has(propName)) {
        continue;
      }

      const item = {
        label: propName,
        kind: monaco.languages.CompletionItemKind.Property,
        detail: `Property of ${componentName}`,
        insertText: propName + ': ',
      };

      items.push(item);
    }

    return items;
  }

  function getPropertyValueCompletions(lineText: string): any[] {
    const items: any[] = [];

    // Extract property name
    const propertyMatch = lineText.match(/(\w+):\s*\w*$/);
    if (!propertyMatch) {
      return items;
    }

    const propertyName = propertyMatch[1];
    const values = PROPERTY_VALUES[propertyName];

    if (values && Array.isArray(values)) {
      for (const value of values) {
        const item = {
          label: String(value),
          kind: monaco.languages.CompletionItemKind.Value,
          insertText: String(value),
        };
        items.push(item);
      }
    }

    return items;
  }
}
