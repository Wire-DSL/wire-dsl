import { describe, it, expect } from 'vitest';
import { parseWireDSL, parseWireDSLWithSourceMap } from '../parser/index';

describe('SourceMap - Semantic IDs', () => {
  it('generates semantic IDs for each node type', () => {
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

    // Verify semantic IDs
    expect(sourceMap.find(e => e.type === 'project')?.nodeId).toBe('project');
    expect(sourceMap.find(e => e.type === 'screen')?.nodeId).toBe('screen-0');
    expect(sourceMap.find(e => e.type === 'layout')?.nodeId).toBe('layout-stack-0');
    
    const components = sourceMap.filter(e => e.type === 'component');
    expect(components[0].nodeId).toBe('component-button-0');
    expect(components[1].nodeId).toBe('component-input-0');
    expect(components[2].nodeId).toBe('component-button-1');  // Second button
  });

  it('generates different IDs for identical components', () => {
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

    const buttons = sourceMap.filter(e => e.type === 'component');
    expect(buttons.length).toBe(3);
    expect(buttons[0].nodeId).toBe('component-button-0');
    expect(buttons[1].nodeId).toBe('component-button-1');
    expect(buttons[2].nodeId).toBe('component-button-2');
    
    // All IDs should be unique
    const uniqueIds = new Set(buttons.map(b => b.nodeId));
    expect(uniqueIds.size).toBe(3);
  });
});

describe('SourceMap - Basic Generation', () => {
  it('generates SourceMap for minimal project', () => {
    const code = `
      project "Test Project" {
        screen Main {
          layout stack {
            component Heading text: "Hello"
          }
        }
      }
    `;

    const { ast, sourceMap } = parseWireDSLWithSourceMap(code);

    expect(ast.type).toBe('project');
    expect(sourceMap).toBeDefined();
    expect(sourceMap.length).toBeGreaterThan(0);
  });

  it('creates SourceMap entry for each node', () => {
    const code = `
      project "Test" {
        screen Main {
          layout stack {
            component Icon
            component Button
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);

    // Should have: project, screen, layout, 2 components
    expect(sourceMap.length).toBe(5);
    
    const types = sourceMap.map(e => e.type);
    expect(types).toContain('project');
    expect(types).toContain('screen');
    expect(types).toContain('layout');
    expect(types.filter(t => t === 'component').length).toBe(2);
  });

  it('generates unique nodeIds', () => {
    const code = `
      project "Test" {
        screen Main {
          layout stack {
            component Icon
            component Button
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);

    const nodeIds = sourceMap.map(e => e.nodeId);
    const uniqueIds = new Set(nodeIds);
    
    expect(uniqueIds.size).toBe(nodeIds.length);
  });

  it('assigns correct parent relationships', () => {
    const code = `
      project "Test" {
        screen Main {
          layout stack {
            component Icon
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);

    const project = sourceMap.find(e => e.type === 'project');
    const screen = sourceMap.find(e => e.type === 'screen');
    const layout = sourceMap.find(e => e.type === 'layout');
    const component = sourceMap.find(e => e.type === 'component');

    expect(project?.parentId).toBeNull();  // Project has no parent
    expect(screen?.parentId).toBe(project?.nodeId);
    expect(layout?.parentId).toBe(screen?.nodeId);
    expect(component?.parentId).toBe(layout?.nodeId);
  });

  it('captures correct ranges', () => {
    const code = `project "Test" {
  screen Main {
    layout stack {
      component Icon
    }
  }
}`;

    const { sourceMap } = parseWireDSLWithSourceMap(code);

    const screen = sourceMap.find(e => e.type === 'screen');
    expect(screen).toBeDefined();
    expect(screen?.range.start.line).toBe(2);  // "screen Main" starts at line 2
    expect(screen?.range.start.column).toBeGreaterThanOrEqual(0);
  });

  it('includes metadata (name, types)', () => {
    const code = `
      project "MyApp" {
        screen Dashboard {
          layout stack {
            component Icon
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);

    const project = sourceMap.find(e => e.type === 'project');
    expect(project?.name).toBe('MyApp');

    const screen = sourceMap.find(e => e.type === 'screen');
    expect(screen?.name).toBe('Dashboard');

    const layout = sourceMap.find(e => e.type === 'layout');
    expect(layout?.layoutType).toBe('stack');

    const component = sourceMap.find(e => e.type === 'component');
    expect(component?.componentType).toBe('Icon');
  });

  it('injects nodeId into AST _meta', () => {
    const code = `
      project "Test" {
        screen Main {
          layout stack {
            component Button text: "Click"
          }
        }
      }
    `;

    const { ast, sourceMap } = parseWireDSLWithSourceMap(code);

    // Verify AST has _meta.nodeId
    expect(ast._meta?.nodeId).toBeDefined();
    expect(ast.screens[0]._meta?.nodeId).toBeDefined();
    
    // Verify SourceMap nodeIds match AST _meta.nodeId
    const projectEntry = sourceMap.find(e => e.type === 'project');
    expect(projectEntry?.nodeId).toBe(ast._meta?.nodeId);
    
    const screenEntry = sourceMap.find(e => e.type === 'screen');
    expect(screenEntry?.nodeId).toBe(ast.screens[0]._meta?.nodeId);
    
    // Verify we can find AST node by nodeId
    const layout = ast.screens[0].layout;
    const layoutEntry = sourceMap.find(e => e.type === 'layout');
    expect(layout._meta?.nodeId).toBe(layoutEntry?.nodeId);
    
    const component = layout.children[0];
    const componentEntry = sourceMap.find(e => e.type === 'component');
    expect(component._meta?.nodeId).toBe(componentEntry?.nodeId);
  });
});

describe('SourceMap - Backward Compatibility', () => {
  it('parseWireDSL() still works without SourceMap', () => {
    const code = `
      project "Test" {
        screen Main {
          layout stack {
            component Heading text: "Hello"
          }
        }
      }
    `;

    const ast = parseWireDSL(code);

    expect(ast.type).toBe('project');
    expect(ast.name).toBe('Test');
    expect(ast.screens).toHaveLength(1);
    // parseWireDSL should NOT add _meta
    expect(ast._meta).toBeUndefined();
  });

  it('AST from both methods has same structure (except _meta)', () => {
    const code = `
      project "Test" {
        screen Main {
          layout stack {
            component Heading text: "Hello"
          }
        }
      }
    `;

    const ast1 = parseWireDSL(code);
    const { ast: ast2 } = parseWireDSLWithSourceMap(code);

    // Remove _meta for comparison
    const stripMeta = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(stripMeta);
      }
      if (obj && typeof obj === 'object') {
        const { _meta, ...rest } = obj;
        const result: any = {};
        for (const key in rest) {
          result[key] = stripMeta(rest[key]);
        }
        return result;
      }
      return obj;
    };

    expect(stripMeta(ast1)).toEqual(stripMeta(ast2));
  });
});

describe('SourceMap - Complex Structures', () => {
  it('handles nested layouts', () => {
    const code = `
      project "Test" {
        screen Main {
          layout stack {
            layout grid {
              component Icon
            }
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);

    const layouts = sourceMap.filter(e => e.type === 'layout');
    expect(layouts.length).toBe(2);
    
    const stack = layouts.find(e => e.layoutType === 'stack');
    const grid = layouts.find(e => e.layoutType === 'grid');
    
    expect(grid?.parentId).toBe(stack?.nodeId);
  });

  it('handles grid cells', () => {
    const code = `
      project "Test" {
        screen Main {
          layout grid {
            cell span: 6 {
              component Icon
            }
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);

    const cell = sourceMap.find(e => e.type === 'cell');
    expect(cell).toBeDefined();
    
    const component = sourceMap.find(e => e.type === 'component');
    expect(component?.parentId).toBe(cell?.nodeId);
  });

  it('handles user-defined components', () => {
    const code = `
      project "Test" {
        define Component "CustomButton" {
          layout stack {
            component Icon
            component Button
          }
        }
        
        screen Main {
          layout stack {
            component CustomButton
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);

    const definition = sourceMap.find(e => e.type === 'component-definition');
    expect(definition).toBeDefined();
    expect(definition?.name).toBe('CustomButton');
  });

  it('generates stable IDs across re-parses', () => {
    const code = `
      project "Test" {
        screen Main {
          layout stack {
            component Icon
          }
        }
      }
    `;

    const { sourceMap: map1 } = parseWireDSLWithSourceMap(code, 'test.wire');
    const { sourceMap: map2 } = parseWireDSLWithSourceMap(code, 'test.wire');

    expect(map1.length).toBe(map2.length);
    
    for (let i = 0; i < map1.length; i++) {
      expect(map1[i].nodeId).toBe(map2[i].nodeId);
    }
  });

  it('uses default filePath when not provided', () => {
    const code = `project "Test" { screen Main { layout stack {} } }`;

    const { sourceMap } = parseWireDSLWithSourceMap(code);

    expect(sourceMap[0].filePath).toBe('<input>');
  });

  it('uses custom filePath when provided', () => {
    const code = `project "Test" { screen Main { layout stack {} } }`;

    const { sourceMap } = parseWireDSLWithSourceMap(code, 'screens/Main.wire');

    expect(sourceMap[0].filePath).toBe('screens/Main.wire');
  });

  it('generates unique nodeIds for identical components', () => {
    // Caso del usuario: componentes idénticos deben tener IDs únicos
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

    const buttons = sourceMap.filter(e => e.type === 'component');
    expect(buttons.length).toBe(3);

    // Verificar que todos los nodeIds son únicos
    const nodeIds = buttons.map(b => b.nodeId);
    const uniqueIds = new Set(nodeIds);
    expect(uniqueIds.size).toBe(3);

    // Verificar que ningún ID es duplicado
    expect(nodeIds[0]).not.toBe(nodeIds[1]);
    expect(nodeIds[1]).not.toBe(nodeIds[2]);
    expect(nodeIds[0]).not.toBe(nodeIds[2]);
  });
});

describe('SourceMap - PropertySourceMap', () => {
  it('captures property ranges for component properties', () => {
    const code = `
      project "Test" {
        screen Main {
          layout stack {
            component Button text: "Click" color: "blue"
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);

    const button = sourceMap.find(e => e.componentType === 'Button');
    expect(button).toBeDefined();
    expect(button?.properties).toBeDefined();
    
    // Should have captured both properties
    expect(button?.properties?.text).toBeDefined();
    expect(button?.properties?.color).toBeDefined();
    
    // Verify property values
    expect(button?.properties?.text.value).toBe('Click');
    expect(button?.properties?.color.value).toBe('blue');
    
    // Verify property names
    expect(button?.properties?.text.name).toBe('text');
    expect(button?.properties?.color.name).toBe('color');
  });

  it('captures property ranges with correct positions', () => {
    const code = `project "Test" { screen Main { layout stack { component Button text: "Hello" } } }`;

    const { sourceMap } = parseWireDSLWithSourceMap(code);

    const button = sourceMap.find(e => e.componentType === 'Button');
    expect(button?.properties?.text).toBeDefined();
    
    const textProp = button!.properties!.text;
    
    // Should have ranges for name, value, and full property
    expect(textProp.nameRange).toBeDefined();
    expect(textProp.valueRange).toBeDefined();
    expect(textProp.range).toBeDefined();
    
    // Full range should encompass name and value
    expect(textProp.range.start.line).toBeLessThanOrEqual(textProp.nameRange.start.line);
    expect(textProp.range.end.line).toBeGreaterThanOrEqual(textProp.valueRange.end.line);
  });

  it('captures properties in layout params', () => {
    const code = `
      project "Test" {
        screen Main {
          layout stack(direction: "vertical", spacing: 10) {
            component Text
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);

    const layout = sourceMap.find(e => e.layoutType === 'stack');
    expect(layout).toBeDefined();
    expect(layout?.properties).toBeDefined();
    
    // Should have captured layout params as properties
    expect(layout?.properties?.direction).toBeDefined();
    expect(layout?.properties?.spacing).toBeDefined();
    
    // Verify values
    expect(layout?.properties?.direction.value).toBe('vertical');
    expect(layout?.properties?.spacing.value).toBe(10);
  });

  it('captures properties in cell props', () => {
    const code = `
      project "Test" {
        screen Main {
          layout grid {
            cell span: 2 {
              component Text
            }
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);

    const cell = sourceMap.find(e => e.type === 'cell');
    expect(cell).toBeDefined();
    expect(cell?.properties).toBeDefined();
    
    // Should have captured cell prop
    expect(cell?.properties?.span).toBeDefined();
    expect(cell?.properties?.span.value).toBe(2);
  });

  it('handles components with no properties', () => {
    const code = `
      project "Test" {
        screen Main {
          layout stack {
            component Icon
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);

    const icon = sourceMap.find(e => e.componentType === 'Icon');
    expect(icon).toBeDefined();
    
    // Should either be undefined or empty object
    if (icon?.properties) {
      expect(Object.keys(icon.properties).length).toBe(0);
    }
  });

  it('handles multiple properties with correct order', () => {
    const code = `
      project "Test" {
        screen Main {
          layout stack {
            component Button text: "Submit" color: "blue" size: "large" disabled: "false"
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);

    const button = sourceMap.find(e => e.componentType === 'Button');
    expect(button?.properties).toBeDefined();
    
    // All 4 properties should be captured
    const propNames = Object.keys(button!.properties!);
    expect(propNames).toContain('text');
    expect(propNames).toContain('color');
    expect(propNames).toContain('size');
    expect(propNames).toContain('disabled');
    expect(propNames.length).toBe(4);
  });
});
