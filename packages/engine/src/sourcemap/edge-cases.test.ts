import { describe, it, expect } from 'vitest';
import { parseWireDSL, parseWireDSLWithSourceMap } from '../parser/index';
import { SourceMapResolver } from './resolver';

describe('SourceMap Edge Cases', () => {
  describe('Empty and Minimal Cases', () => {
    it('should handle empty project', () => {
      const code = `project "Empty" {}`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      expect(sourceMap.length).toBe(1); // Just project
      const stats = resolver.getStats();
      expect(stats.totalNodes).toBe(1);
      expect(stats.byType.project).toBe(1);
    });

    it('should handle screen with empty layout', () => {
      const code = `
        project "Test" {
          screen Empty {
            layout stack {}
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const screen = resolver.getNodeById('screen-0');
      expect(screen).toBeDefined();
      
      const layout = resolver.getNodeById('layout-stack-0');
      expect(layout).toBeDefined();
      
      const children = resolver.getChildren(layout!.nodeId);
      expect(children).toEqual([]);
    });

    it('should handle layout with no children', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {}
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const stack = resolver.getNodeById('layout-stack-0');
      expect(stack).toBeDefined();

      const children = resolver.getChildren(stack!.nodeId);
      expect(children).toEqual([]);
    });
  });

  describe('Position Edge Cases', () => {
    it('should return null for position outside code', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const node = resolver.getNodeByPosition(999, 999);
      expect(node).toBeNull();
    });

    it('should return null for negative position', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const node = resolver.getNodeByPosition(-1, -1);
      expect(node).toBeNull();
    });

    it('should return null for position at (0, 0)', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      // Positions are 1-indexed, so (0, 0) is invalid
      const node = resolver.getNodeByPosition(0, 0);
      expect(node).toBeNull();
    });

    it('should handle position at start of file', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const node = resolver.getNodeByPosition(1, 1);
      expect(node).toBeDefined();
      expect(node?.type).toBe('project');
    });

    it('should handle position at end of file', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const lastLine = 1;
      const lastColumn = code.length;
      
      const node = resolver.getNodeByPosition(lastLine, lastColumn);
      // Should find a node (likely project or layout)
      expect(node).toBeDefined();
    });
  });

  describe('ID Edge Cases', () => {
    it('should return null for non-existent ID', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const node = resolver.getNodeById('component-nonexistent-999');
      expect(node).toBeNull();
    });

    it('should return null for empty string ID', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const node = resolver.getNodeById('');
      expect(node).toBeNull();
    });

    it('should handle IDs with special characters safely', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      // These IDs don't exist but shouldn't crash
      expect(resolver.getNodeById('component-<script>-0')).toBeNull();
      expect(resolver.getNodeById('layout-../../-0')).toBeNull();
      expect(resolver.getNodeById('component-\0-0')).toBeNull();
    });
  });

  describe('Hierarchy Edge Cases', () => {
    it('should return null parent for root node', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const parent = resolver.getParent('project');
      expect(parent).toBeNull();
    });

    it('should return empty siblings for only child', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "Only child"
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const siblings = resolver.getSiblings('component-button-0');
      expect(siblings).toEqual([]);
    });

    it('should return empty siblings for root node', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const siblings = resolver.getSiblings('project');
      expect(siblings).toEqual([]);
    });

    it('should return single-element path for root', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const path = resolver.getPath('project');
      expect(path.length).toBe(1);
      expect(path[0].type).toBe('project');
    });

    it('should return empty path for non-existent node', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const path = resolver.getPath('nonexistent');
      expect(path).toEqual([]);
    });
  });

  describe('Component Type Edge Cases', () => {
    it('should handle components without properties', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Divider
              component Spinner
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const divider = resolver.getNodeById('component-divider-0');
      expect(divider).toBeDefined();
      // Components without properties may not have properties object or it's empty
      const propCount = Object.keys(divider?.properties || {}).length;
      expect(propCount).toBe(0);
    });

    it('should return empty array when no components of type exist', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "Only button"
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const inputs = resolver.getNodesByType('component', 'Input');
      expect(inputs).toEqual([]);

      const headings = resolver.getNodesByType('component', 'Heading');
      expect(headings).toEqual([]);
    });

    it('should handle case-sensitive component types', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "Test"
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      // Exact case match
      const buttons = resolver.getNodesByType('component', 'Button');
      expect(buttons.length).toBe(1);

      // Wrong case should not match (assuming case-sensitive implementation)
      const wrongCase = resolver.getNodesByType('component', 'button');
      expect(wrongCase.length).toBe(0);
    });
  });

  describe('Multi-line and Whitespace Cases', () => {
    it('should handle components split across multiple lines', () => {
      const code = `project "Test" {
  screen Main {
    layout stack {
      component Button
        text: "Multi-line"
        variant: primary
    }
  }
}`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const button = resolver.getNodeById('component-button-0');
      expect(button).toBeDefined();
      expect(button?.properties?.text).toBeDefined();
      expect(button?.properties?.variant).toBeDefined();
    });

    it('should handle excessive whitespace', () => {
      const code = `project    "Test"    {
        screen    Main    {
          layout    stack    {
            component    Button    text:    "Spaces"
          }
        }
      }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const button = resolver.getNodeById('component-button-0');
      expect(button).toBeDefined();
    });
  });

  describe('Identical Components', () => {
    it('should assign unique IDs to identical components', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "Click"
              component Button text: "Click"
              component Button text: "Click"
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const buttons = resolver.getNodesByType('component', 'Button');
      expect(buttons.length).toBe(3);

      // All should have different IDs
      expect(buttons[0].nodeId).toBe('component-button-0');
      expect(buttons[1].nodeId).toBe('component-button-1');
      expect(buttons[2].nodeId).toBe('component-button-2');
    });

    it('should maintain unique IDs across multiple types', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "A"
              component Input placeholder: "B"
              component Button text: "C"
              component Input placeholder: "D"
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const buttons = resolver.getNodesByType('component', 'Button');
      const inputs = resolver.getNodesByType('component', 'Input');

      expect(buttons[0].nodeId).toBe('component-button-0');
      expect(buttons[1].nodeId).toBe('component-button-1');
      expect(inputs[0].nodeId).toBe('component-input-0');
      expect(inputs[1].nodeId).toBe('component-input-1');
    });
  });

  describe('Special Characters in Properties', () => {
    it('should handle quotes in text values', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "Click \\"here\\""
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const button = resolver.getNodeById('component-button-0');
      expect(button?.properties?.text).toBeDefined();
    });

    it('should handle empty string values', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Input placeholder: ""
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const input = resolver.getNodeById('component-input-0');
      expect(input?.properties?.placeholder).toBeDefined();
      expect(input?.properties?.placeholder?.value).toBe('');
    });
  });

  describe('Backward Compatibility', () => {
    it('should not break parseWireDSL without SourceMap', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "No SourceMap"
            }
          }
        }
      `;

      // Old API should still work
      const ast = parseWireDSL(code);
      expect(ast).toBeDefined();
      expect(ast.type).toBe('project');
      expect(ast.name).toBe('Test');
      
      // AST without SourceMap should not have nodeId in _meta
      expect(ast._meta?.nodeId).toBeUndefined();
    });

    it('should handle mixed parsing (with and without SourceMap)', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      // Parse without SourceMap
      const ast1 = parseWireDSL(code);
      expect(ast1._meta?.nodeId).toBeUndefined();

      // Parse with SourceMap
      const result2 = parseWireDSLWithSourceMap(code);
      expect(result2.ast._meta?.nodeId).toBe('project');
      expect(result2.sourceMap).toBeDefined();

      // Both should produce valid ASTs with same project name
      expect(ast1.name).toBe(result2.ast.name);
      expect(ast1.name).toBe('Test');
    });
  });

  describe('Statistics Edge Cases', () => {
    it('should handle statistics for empty project', () => {
      const code = `project "Empty" {}`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const stats = resolver.getStats();
      expect(stats.totalNodes).toBe(1);
      expect(stats.byType.project).toBe(1);
      expect(stats.byType.screen).toBeUndefined();
      // maxDepth for a single project node is 0 (implementation is 0-indexed)
      expect(stats.maxDepth).toBe(0);
    });

    it('should calculate correct max depth', () => {
      let code = 'project "Deep" { screen Main {';
      
      for (let i = 0; i < 10; i++) {
        code += 'layout stack {';
      }
      
      code += 'component Button text: "Deep"';
      
      for (let i = 0; i < 10; i++) {
        code += '}';
      }
      
      code += '}}';

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const stats = resolver.getStats();
      expect(stats.maxDepth).toBeGreaterThanOrEqual(10);
    });
  });
});
