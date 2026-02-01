import * as monaco from 'monaco-editor';
import { ALL_KEYWORDS, getCompletions } from '@wire-dsl/language-support';

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

  // Configurar autocompletar con language-support
  monaco.languages.registerCompletionItemProvider('wire', {
    provideCompletionItems: (model, position) => {
      const lineContent = model.getLineContent(position.lineNumber);
      const beforeCursor = lineContent.substring(0, position.column - 1);
      
      // Obtener la palabra actual
      const wordMatch = beforeCursor.match(/\w+$/);
      const currentWord = wordMatch ? wordMatch[0] : '';
      
      // Obtener sugerencias del language-support
      const suggestions = getCompletions(currentWord);

      return {
        suggestions: suggestions.map((item) => ({
          label: item.label,
          kind: 
            item.kind === 'Component' ? monaco.languages.CompletionItemKind.Class :
            item.kind === 'Property' ? monaco.languages.CompletionItemKind.Property :
            monaco.languages.CompletionItemKind.Keyword,
          insertText: item.label,
          detail: item.documentation,
          range: new monaco.Range(
            position.lineNumber,
            position.column - currentWord.length,
            position.lineNumber,
            position.column
          ),
        })),
      };
    },
    triggerCharacters: [' ', '{', ':', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
  });
}
