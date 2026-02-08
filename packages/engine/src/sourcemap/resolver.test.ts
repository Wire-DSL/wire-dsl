import { describe, it, expect } from 'vitest';
import { parseWireDSLWithSourceMap } from '../parser/index';
import { SourceMapResolver } from './resolver';

describe('SourceMapResolver', () => {
  describe('getNodeById', () => {
    it('should find node by ID', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "Click"
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const button = resolver.getNodeById('component-button-0');
      expect(button).toBeDefined();
      expect(button?.type).toBe('component');
      expect(button?.componentType).toBe('Button');
    });

    it('should return null for non-existent ID', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {}
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const node = resolver.getNodeById('component-nonexistent-99');
      expect(node).toBeNull();
    });

    it('should find different node types', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Heading text: "Title"
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const project = resolver.getNodeById('project');
      expect(project?.type).toBe('project');

      const screen = resolver.getNodeById('screen-0');
      expect(screen?.type).toBe('screen');

      const layout = resolver.getNodeById('layout-stack-0');
      expect(layout?.type).toBe('layout');
      expect(layout?.layoutType).toBe('stack');

      const heading = resolver.getNodeById('component-heading-0');
      expect(heading?.type).toBe('component');
      expect(heading?.componentType).toBe('Heading');
    });
  });

  describe('getNodeByPosition', () => {
    it('should find node at specific position', () => {
      const code = `project "Test" {
  screen Main {
    layout stack {
      component Button text: "Click"
    }
  }
}`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      // Position inside "component Button" line (line 4, should be 1-indexed)
      const node = resolver.getNodeByPosition(4, 15);
      
      expect(node).toBeDefined();
      expect(node?.type).toBe('component');
      expect(node?.componentType).toBe('Button');
    });

    it('should return most specific (deepest) node when nested', () => {
      const code = `project "Test" {
  screen Main {
    layout stack {
      component Button text: "Click"
    }
  }
}`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      // Click on Button line - should return Button, not layout or screen
      const node = resolver.getNodeByPosition(4, 18);
      
      expect(node).toBeDefined();
      // Should be the most specific node (Button, not layout/screen/project)
      expect(node?.type).toBe('component');
      expect(node?.nodeId).toContain('button');
    });

    it('should return null for position outside any node', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      // Position way outside the code
      const node = resolver.getNodeByPosition(999, 999);
      expect(node).toBeNull();
    });

    it('should handle multi-line nodes correctly', () => {
      const code = `project "Test" {
  screen Main {
    layout stack {
      component Button text: "Click"
      component Input placeholder: "Name"
    }
  }
}`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      // Position on Input line
      const node = resolver.getNodeByPosition(5, 20);
      
      expect(node).toBeDefined();
      expect(node?.componentType).toBe('Input');
    });
  });

  describe('getChildren', () => {
    it('should return all children of a node', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "A"
              component Input text: "B"
              component Heading text: "C"
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const children = resolver.getChildren('layout-stack-0');
      
      expect(children.length).toBe(3);
      expect(children[0].componentType).toBe('Button');
      expect(children[1].componentType).toBe('Input');
      expect(children[2].componentType).toBe('Heading');
    });

    it('should return empty array for node with no children', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "Click"
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const children = resolver.getChildren('component-button-0');
      expect(children).toEqual([]);
    });

    it('should return empty array for non-existent node', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const children = resolver.getChildren('nonexistent-id');
      expect(children).toEqual([]);
    });
  });

  describe('getParent', () => {
    it('should return parent node', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "Click"
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const parent = resolver.getParent('component-button-0');
      
      expect(parent).toBeDefined();
      expect(parent?.type).toBe('layout');
      expect(parent?.layoutType).toBe('stack');
      expect(parent?.nodeId).toBe('layout-stack-0');
    });

    it('should return null for root node', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const parent = resolver.getParent('project');
      expect(parent).toBeNull();
    });

    it('should return null for non-existent node', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const parent = resolver.getParent('nonexistent-id');
      expect(parent).toBeNull();
    });
  });

  describe('getAllNodes', () => {
    it('should return all nodes in SourceMap', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "A"
              component Input text: "B"
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const allNodes = resolver.getAllNodes();
      
      // Should have: project, screen, layout, 2 components = 5 nodes
      expect(allNodes.length).toBe(5);
    });
  });

  describe('getNodesByType', () => {
    it('should filter nodes by type', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "A"
              component Input text: "B"
              component Button text: "C"
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const components = resolver.getNodesByType('component');
      expect(components.length).toBe(3);

      const layouts = resolver.getNodesByType('layout');
      expect(layouts.length).toBe(1);
    });

    it('should filter by component type', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "A"
              component Input text: "B"
              component Button text: "C"
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const buttons = resolver.getNodesByType('component', 'Button');
      expect(buttons.length).toBe(2);
      expect(buttons[0].componentType).toBe('Button');
      expect(buttons[1].componentType).toBe('Button');

      const inputs = resolver.getNodesByType('component', 'Input');
      expect(inputs.length).toBe(1);
      expect(inputs[0].componentType).toBe('Input');
    });
  });

  describe('getSiblings', () => {
    it('should return all siblings of a node', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "A"
              component Input text: "B"
              component Heading text: "C"
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const siblings = resolver.getSiblings('component-input-0');
      
      expect(siblings.length).toBe(2);
      expect(siblings[0].componentType).toBe('Button');
      expect(siblings[1].componentType).toBe('Heading');
    });

    it('should return empty array for node with no siblings', () => {
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

    it('should return empty array for root node', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const siblings = resolver.getSiblings('project');
      expect(siblings).toEqual([]);
    });
  });

  describe('getPath', () => {
    it('should return path from root to node', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "Click"
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const path = resolver.getPath('component-button-0');
      
      expect(path.length).toBe(4);
      expect(path[0].type).toBe('project');
      expect(path[1].type).toBe('screen');
      expect(path[2].type).toBe('layout');
      expect(path[3].type).toBe('component');
      expect(path[3].nodeId).toBe('component-button-0');
    });

    it('should return single element for root', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const path = resolver.getPath('project');
      
      expect(path.length).toBe(1);
      expect(path[0].type).toBe('project');
    });

    it('should return empty array for non-existent node', () => {
      const code = `project "Test" { screen Main { layout stack {} } }`;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const path = resolver.getPath('nonexistent-id');
      expect(path).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should return statistics about SourceMap', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "A"
              component Input text: "B"
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const stats = resolver.getStats();
      
      expect(stats.totalNodes).toBe(5);
      expect(stats.byType.project).toBe(1);
      expect(stats.byType.screen).toBe(1);
      expect(stats.byType.layout).toBe(1);
      expect(stats.byType.component).toBe(2);
      expect(stats.maxDepth).toBeGreaterThan(0);
    });
  });

  describe('Complex scenarios', () => {
    it('should handle nested layouts correctly', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              layout grid {
                component Button text: "A"
              }
              component Heading text: "B"
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      // Check nested layout children
      const stackChildren = resolver.getChildren('layout-stack-0');
      expect(stackChildren.length).toBe(2);
      expect(stackChildren[0].layoutType).toBe('grid');
      expect(stackChildren[1].componentType).toBe('Heading');

      // Check grid children
      const gridChildren = resolver.getChildren('layout-grid-0');
      expect(gridChildren.length).toBe(1);
      expect(gridChildren[0].componentType).toBe('Button');

      // Check path for deeply nested button
      const path = resolver.getPath('component-button-0');
      expect(path.length).toBe(5); // project, screen, stack, grid, button
    });

    it('should handle multiple components of same type', () => {
      const code = `
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "First"
              component Button text: "Second"
              component Button text: "Third"
            }
          }
        }
      `;

      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      const buttons = resolver.getNodesByType('component', 'Button');
      expect(buttons.length).toBe(3);
      
      // All should have unique IDs
      const ids = buttons.map(b => b.nodeId);
      expect(new Set(ids).size).toBe(3);
      
      // All should have same parent
      const parents = buttons.map(b => resolver.getParent(b.nodeId));
      expect(parents[0]?.nodeId).toBe(parents[1]?.nodeId);
      expect(parents[1]?.nodeId).toBe(parents[2]?.nodeId);
    });
  });
});
