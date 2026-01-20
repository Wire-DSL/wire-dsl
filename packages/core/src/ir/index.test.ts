import { describe, it, expect } from 'vitest';
import { parseWireDSL } from '../parser/index';
import { generateIR } from './index';

describe('IR Generator', () => {
  it('should generate basic IR from AST', () => {
    const input = `
      project "Test" {
        screen Main {
          layout stack {
            component Heading text: "Hello"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    expect(ir.irVersion).toBe('1.0');
    expect(ir.project.name).toBe('Test');
    expect(ir.project.id).toBe('test');
    expect(ir.project.screens).toHaveLength(1);
  });

  it('should apply default tokens', () => {
    const input = `
      project "Defaults" {
        screen Main {
          layout stack {
            component Button text: "Click"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    expect(ir.project.tokens).toEqual({
      density: 'normal',
      spacing: 'md',
      radius: 'md',
      stroke: 'normal',
      font: 'base',
    });
  });

  it('should apply custom tokens', () => {
    const input = `
      project "Custom" {
        tokens density: comfortable
        tokens spacing: lg

        screen Main {
          layout stack {
            component Button text: "Click"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    expect(ir.project.tokens.density).toBe('comfortable');
    expect(ir.project.tokens.spacing).toBe('lg');
    expect(ir.project.tokens.radius).toBe('md'); // default
  });

  it('should generate unique node IDs', () => {
    const input = `
      project "IDs" {
        screen Main {
          layout stack {
            component Heading text: "Title"
            component Button text: "Action"
            component Input label: "Email"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    const nodeIds = Object.keys(ir.project.nodes);
    expect(nodeIds.length).toBeGreaterThan(0);

    // All IDs should be unique
    const uniqueIds = new Set(nodeIds);
    expect(uniqueIds.size).toBe(nodeIds.length);

    // IDs should follow pattern node_N
    nodeIds.forEach((id) => {
      expect(id).toMatch(/^node_\d+$/);
    });
  });

  it('should create node dictionary', () => {
    const input = `
      project "Nodes" {
        screen Main {
          layout stack {
            component Heading text: "Hello"
            component Button text: "Click"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    // Should have 3 nodes: 1 container (stack) + 2 components
    expect(Object.keys(ir.project.nodes)).toHaveLength(3);

    const nodes = Object.values(ir.project.nodes);
    const containers = nodes.filter((n) => n.kind === 'container');
    const components = nodes.filter((n) => n.kind === 'component');

    expect(containers).toHaveLength(1);
    expect(components).toHaveLength(2);
  });

  it('should convert container nodes correctly', () => {
    const input = `
      project "Container" {
        screen Main {
          layout stack(direction: vertical, gap: md) {
            component Heading text: "Title"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    const containerNode = Object.values(ir.project.nodes).find((n) => n.kind === 'container');

    expect(containerNode).toBeDefined();
    if (containerNode?.kind === 'container') {
      expect(containerNode.containerType).toBe('stack');
      expect(containerNode.params.direction).toBe('vertical');
      expect(containerNode.style.gap).toBe('md');
      expect(containerNode.children).toHaveLength(1);
    }
  });

  it('should convert component nodes correctly', () => {
    const input = `
      project "Component" {
        screen Main {
          layout stack {
            component Button text: "Click Me" variant: "primary"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    const componentNode = Object.values(ir.project.nodes).find((n) => n.kind === 'component');

    expect(componentNode).toBeDefined();
    if (componentNode?.kind === 'component') {
      expect(componentNode.componentType).toBe('Button');
      expect(componentNode.props).toEqual({
        text: 'Click Me',
        variant: 'primary',
      });
    }
  });

  it('should handle nested layouts', () => {
    const input = `
      project "Nested" {
        screen Main {
          layout stack(direction: vertical) {
            component Heading text: "Header"
            
            layout grid(columns: 12) {
              cell span: 6 {
                component Button text: "Left"
              }
              cell span: 6 {
                component Button text: "Right"
              }
            }
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    // Should have: 1 stack + 1 heading + 1 grid + 2 cells + 2 buttons = 7 nodes
    expect(Object.keys(ir.project.nodes)).toHaveLength(7);

    const containers = Object.values(ir.project.nodes).filter((n) => n.kind === 'container');
    expect(containers.length).toBeGreaterThan(2); // stack + grid + cells
  });

  it('should create screen with root reference', () => {
    const input = `
      project "Screen" {
        screen Dashboard {
          layout stack {
            component Heading text: "Dashboard"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    const screen = ir.project.screens[0];
    expect(screen.id).toBe('dashboard');
    expect(screen.name).toBe('Dashboard');
    expect(screen.root.ref).toBeDefined();
    expect(screen.viewport).toEqual({ width: 1280, height: 720 });

    // Root ref should point to existing node
    const rootNodeId = screen.root.ref;
    expect(ir.project.nodes[rootNodeId]).toBeDefined();
  });

  it('should handle multiple screens', () => {
    const input = `
      project "Multi" {
        screen Home {
          layout stack {
            component Heading text: "Home"
          }
        }
        
        screen Settings {
          layout stack {
            component Heading text: "Settings"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    expect(ir.project.screens).toHaveLength(2);
    expect(ir.project.screens[0].name).toBe('Home');
    expect(ir.project.screens[1].name).toBe('Settings');
  });

  it('should separate style params from container params', () => {
    const input = `
      project "Style" {
        screen Main {
          layout grid(columns: 12, gap: lg, padding: xl) {
            component Card title: "Test"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    const gridNode = Object.values(ir.project.nodes).find((n) => n.kind === 'container');

    if (gridNode?.kind === 'container') {
      // Style params should be in style object
      expect(gridNode.style.gap).toBe('lg');
      expect(gridNode.style.padding).toBe('xl');

      // Non-style params should be in params
      expect(gridNode.params.columns).toBe(12);
      expect(gridNode.params.gap).toBeUndefined();
      expect(gridNode.params.padding).toBeUndefined();
    }
  });

  it('should validate IR schema', () => {
    const input = `
      project "Valid" {
        screen Main {
          layout stack {
            component Button text: "Test"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);

    // Should not throw validation error
    expect(() => generateIR(ast)).not.toThrow();
  });

  it('should handle complete example', () => {
    const input = `
      project "Complete Dashboard" {
        tokens density: comfortable
        tokens spacing: lg

        screen Dashboard {
          layout stack(direction: vertical, gap: lg, padding: xl) {
            component Topbar title: "Dashboard"
            
            layout grid(columns: 12, gap: lg) {
              cell span: 4 {
                component Card title: "Users"
              }
              cell span: 4 {
                component Card title: "Sessions"
              }
              cell span: 4 {
                component Card title: "Revenue"
              }
            }

            component ChartPlaceholder type: "bar" height: 300
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    expect(ir.project.name).toBe('Complete Dashboard');
    expect(ir.project.tokens.density).toBe('comfortable');
    expect(ir.project.screens).toHaveLength(1);
    expect(Object.keys(ir.project.nodes).length).toBeGreaterThan(5);

    // Verify structure
    const screen = ir.project.screens[0];
    const rootNode = ir.project.nodes[screen.root.ref];
    expect(rootNode.kind).toBe('container');
  });
});
