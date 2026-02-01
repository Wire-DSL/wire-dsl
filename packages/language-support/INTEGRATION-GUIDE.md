# Reutilizando Wire DSL Language Support Across Tools

## Resumen

Hemos creado el package `@wire-dsl/language-support` como una fuente centralizada de definiciones de lenguaje. Esto permite que VS Code Extension, Monaco Editor, y otros editores usen las mismas definiciones sin duplicación.

## Estructura

```
packages/
├── language-support/          ← Nueva fuente centralizada
│   ├── src/
│   │   ├── index.ts          # Keywords, componentes, propiedades
│   │   ├── grammar.ts        # Configuración de tokens para Monaco
│   │   └── completions.ts    # Lógica de autocompletado
│   ├── dist/                 # JavaScript compilado
│   └── package.json
│
├── web/                       # Wire Live Editor
│   ├── src/
│   │   └── monaco/
│   │       └── wireLanguage.ts    # Usa @wire-dsl/language-support
│   └── package.json              # Dependencia: @wire-dsl/language-support
│
└── vscode-extension/          # (Futuro) Usar language-support también
    └── src/
        ├── completionProvider.ts
        └── data/
            └── components.ts
```

## Cómo Usar en Monaco (Web)

```typescript
// packages/web/src/monaco/wireLanguage.ts
import { ALL_KEYWORDS, getCompletions } from '@wire-dsl/language-support';

export function registerWireLanguage() {
  // Usar keywords dinámicamente
  const keywordPattern = ALL_KEYWORDS.map(kw => kw.name).join('|');
  
  // Tokenizer usa el patrón
  monaco.languages.setMonarchTokensProvider('wire', {
    tokenizer: {
      root: [
        [new RegExp(`\\b(${keywordPattern})\\b`), 'keyword'],
        // ...
      ],
    },
  });
  
  // Autocompletado usa language-support
  monaco.languages.registerCompletionItemProvider('wire', {
    provideCompletionItems: (model, position) => {
      const word = getWord(model, position);
      return {
        suggestions: getCompletions(word).map(item => ({
          label: item.label,
          kind: getKind(item.kind),
          detail: item.documentation,
        })),
      };
    },
  });
}
```

## Cómo Usar en VS Code Extension

### Opción 1: Reutilizar directamente (Recomendado)

```typescript
// vscode-extension/src/completionProvider.ts
import { 
  getCompletions, 
  getContextualCompletions,
  getCurrentWord 
} from '@wire-dsl/language-support/completions';

export class WireCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(document, position) {
    const line = document.lineAt(position.line).text;
    const word = getCurrentWord(line, position.character);
    
    // Usar completions del language-support
    const suggestions = getContextualCompletions(line, word);
    
    return suggestions.map(item => ({
      label: item.label,
      kind: vscode.CompletionItemKind[item.kind],
      detail: item.detail,
      documentation: item.documentation,
      range: new vscode.Range(position, position),
    }));
  }
}
```

### Opción 2: Usar metadatos para documentación

```typescript
// vscode-extension/src/hoverProvider.ts
import { ALL_KEYWORDS } from '@wire-dsl/language-support';

export class WireHoverProvider implements vscode.HoverProvider {
  provideHover(document, position) {
    const word = document.getWordRangeAtPosition(position);
    const text = document.getText(word);
    
    // Buscar en language-support
    const keyword = ALL_KEYWORDS.find(k => k.name === text);
    if (!keyword) return null;
    
    return new vscode.Hover(
      `**${keyword.type}**: ${keyword.description}`
    );
  }
}
```

## Instalación en VS Code Extension

### 1. Agregar dependencia

```bash
cd packages/vscode-extension
npm install @wire-dsl/language-support
```

### 2. Actualizar datos

**Antes (hardcoded):**
```typescript
const COMPONENTS = ['button', 'text', 'input', ...];
const KEYWORDS = ['project', 'screen', 'component', ...];
```

**Después (dinámico):**
```typescript
import { ALL_KEYWORDS, getKeywordsByType } from '@wire-dsl/language-support';

const components = getKeywordsByType('component');
const keywords = getKeywordsByType('keyword');
```

## Ventajas

✅ **Single Source of Truth** - Una única definición de lenguaje
✅ **Menos duplicación** - Cambios se propagan automáticamente
✅ **Consistencia** - Todos los editores usan las mismas definiciones
✅ **Fácil mantenimiento** - Agregar componentes en un solo lugar
✅ **OSS-friendly** - Package público y reutilizable
✅ **Type-safe** - TypeScript types compartidos

## Proceso de Actualización

### Agregar un nuevo componente

1. **Editar `packages/language-support/src/index.ts`:**
```typescript
export const KEYWORDS: KeywordDefinition[] = [
  // ... existing ...
  { name: 'new-component', type: 'component', description: 'New component' },
];
```

2. **Compilar el package:**
```bash
cd packages/language-support
pnpm build
```

3. **Actualizar todos los dependientes:**
```bash
cd ../web && pnpm dev    # Monaco lo carga automáticamente
cd ../vscode-extension && npm run compile  # VS Code Extension
```

## Exportes Disponibles

```typescript
// Main package
import {
  KEYWORDS,
  PROPERTIES,
  ALL_KEYWORDS,
  getKeywordsByType,
  getCompletions,
} from '@wire-dsl/language-support';

// Grammar (Monarch tokenizer)
import { MONACO_GRAMMAR, TOKENIZE_RULES } from '@wire-dsl/language-support/grammar';

// Completions (with snippets)
import {
  KEYWORD_COMPLETIONS,
  CONTAINER_COMPLETIONS,
  COMPONENT_COMPLETIONS,
  PROPERTY_COMPLETIONS,
  getContextualCompletions,
  isPropertyContext,
  getCurrentWord,
} from '@wire-dsl/language-support/completions';
```

## Proximos Pasos

1. ✅ Crear `@wire-dsl/language-support` (HECHO)
2. ✅ Integrar con Monaco Editor (HECHO)
3. ⏳ Integrar con VS Code Extension (Futuro)
4. ⏳ Publicar en NPM (Futuro)
5. ⏳ Crear Language Server Protocol (LSP) para mejor soporte

## Recursos

- [Language Support Package](../../packages/language-support/README.md)
- [VS Code Extension Repo](https://github.com/Wire-DSL/vscode-extension)
- [Monaco Editor Docs](https://microsoft.github.io/monaco-editor/)
