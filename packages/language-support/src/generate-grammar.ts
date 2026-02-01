/**
 * Generador de gramática TextMate para Wire DSL
 * Genera automáticamente wire.tmLanguage.json desde language-support
 */

import * as fs from 'fs';
import * as path from 'path';
import { ALL_KEYWORDS } from './index.js';

interface TextMateGrammar {
  $schema: string;
  name: string;
  patterns: Array<{
    name?: string;
    match?: string;
    include?: string;
    begin?: string;
    end?: string;
    patterns?: Array<any>;
  }>;
  repository: Record<string, any>;
}

export function generateGrammar(): TextMateGrammar {
  // Agrupar keywords por tipo
  const keywords = ALL_KEYWORDS.filter(k => k.type === 'keyword').map(k => k.name);
  const components = ALL_KEYWORDS.filter(k => k.type === 'component').map(k => k.name);
  const properties = ALL_KEYWORDS.filter(k => k.type === 'property').map(k => k.name);

  // Crear patrones regex
  const keywordPattern = keywords.join('|');
  const componentPattern = components.join('|');
  const propertyPattern = properties.join('|');

  return {
    $schema: 'https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json',
    name: 'Wire DSL',
    patterns: [
      { include: '#comments' },
      { include: '#strings' },
      { include: '#numbers' },
      { include: '#keywords' },
      { include: '#components' },
      { include: '#properties' },
      { include: '#operators' },
      { include: '#punctuation' },
    ],
    repository: {
      comments: {
        patterns: [
          {
            name: 'comment.line.double-slash.wire',
            match: '//.*?$',
          },
          {
            name: 'comment.block.wire',
            begin: '/\\*',
            end: '\\*/',
          },
        ],
      },
      strings: {
        patterns: [
          {
            name: 'string.quoted.double.wire',
            begin: '"',
            end: '"',
            patterns: [
              {
                name: 'constant.character.escape.wire',
                match: '\\\\.',
              },
            ],
          },
          {
            name: 'string.quoted.single.wire',
            begin: "'",
            end: "'",
            patterns: [
              {
                name: 'constant.character.escape.wire',
                match: '\\\\.',
              },
            ],
          },
        ],
      },
      numbers: {
        patterns: [
          {
            name: 'constant.numeric.wire',
            match: '\\b\\d+(\\.\\d+)?\\b',
          },
        ],
      },
      keywords: {
        patterns: [
          {
            name: 'keyword.wire',
            match: `\\b(${keywordPattern})\\b`,
          },
        ],
      },
      components: {
        patterns: [
          {
            name: 'entity.name.class.wire',
            match: `\\b(${componentPattern})\\b`,
          },
        ],
      },
      properties: {
        patterns: [
          {
            name: 'variable.other.property.wire',
            match: `\\b(${propertyPattern})(?=\\s*:)`,
          },
        ],
      },
      operators: {
        patterns: [
          {
            name: 'keyword.operator.wire',
            match: '[=+\\-*/%&|^<>!]=?|[?:]',
          },
        ],
      },
      punctuation: {
        patterns: [
          {
            name: 'punctuation.wire',
            match: '[{}\\[\\]();,.]',
          },
        ],
      },
    },
  };
}

/**
 * Escribe la gramática generada a un archivo
 */
export function writeGrammar(outputPath: string): void {
  const grammar = generateGrammar();
  const content = JSON.stringify(grammar, null, 2);
  fs.writeFileSync(outputPath, content);
  console.log(`✅ Grammar generated: ${outputPath}`);
}

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const outputPath = path.join(
    path.dirname(import.meta.url.replace('file://', '')),
    '../wire.tmLanguage.json'
  );
  writeGrammar(outputPath);
}

export default { generateGrammar, writeGrammar };
