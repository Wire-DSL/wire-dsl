import { describe, it, expect } from 'vitest';
import { parseWireDSL } from './index';

describe('WireDSL Parser', () => {
  it('should parse minimal project', () => {
    const input = `
      project "Test Project" {
        screen Main {
          layout stack {
            component Heading text: "Hello World"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);

    expect(ast.type).toBe('project');
    expect(ast.name).toBe('Test Project');
    expect(ast.screens).toHaveLength(1);
    expect(ast.screens[0].name).toBe('Main');
  });

  it('should parse tokens declarations', () => {
    const input = `
      project "Dashboard" {
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

    expect(ast.tokens).toEqual({
      density: 'comfortable',
      spacing: 'lg',
    });
  });

  it('should parse layout with parameters', () => {
    const input = `
      project "Test" {
        screen Main {
          layout stack(direction: vertical, gap: md) {
            component Heading text: "Title"
            component Button text: "Action"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const layout = ast.screens[0].layout;

    expect(layout.layoutType).toBe('stack');
    expect(layout.params).toEqual({
      direction: 'vertical',
      gap: 'md',
    });
    expect(layout.children).toHaveLength(2);
  });

  it('should parse nested layouts', () => {
    const input = `
      project "Nested" {
        screen Main {
          layout stack(direction: vertical) {
            component Heading text: "Header"
            
            layout grid(columns: 12, gap: md) {
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
    const mainLayout = ast.screens[0].layout;

    expect(mainLayout.children).toHaveLength(2);
    expect(mainLayout.children[0].type).toBe('component');
    expect(mainLayout.children[1].type).toBe('layout');

    const gridLayout = mainLayout.children[1];
    if (gridLayout.type === 'layout') {
      expect(gridLayout.layoutType).toBe('grid');
      expect(gridLayout.params.columns).toBe(12);
      expect(gridLayout.children).toHaveLength(2);
    }
  });

  it('should parse component properties', () => {
    const input = `
      project "Props" {
        screen Main {
          layout stack {
            component Input label: "Email" placeholder: "user@example.com"
            component Button text: "Submit" variant: "primary"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const components = ast.screens[0].layout.children;

    expect(components[0].type).toBe('component');
    if (components[0].type === 'component') {
      expect(components[0].componentType).toBe('Input');
      expect(components[0].props).toEqual({
        label: 'Email',
        placeholder: 'user@example.com',
      });
    }

    if (components[1].type === 'component') {
      expect(components[1].componentType).toBe('Button');
      expect(components[1].props).toEqual({
        text: 'Submit',
        variant: 'primary',
      });
    }
  });

  it('should parse numeric values', () => {
    const input = `
      project "Numbers" {
        screen Main {
          layout grid(columns: 12, gap: 16) {
            component ChartPlaceholder height: 300 width: 600
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const layout = ast.screens[0].layout;

    expect(layout.params.columns).toBe(12);
    expect(layout.params.gap).toBe(16);

    const component = layout.children[0];
    if (component.type === 'component') {
      expect(component.props.height).toBe(300);
      expect(component.props.width).toBe(600);
    }
  });

  it('should handle comments', () => {
    const input = `
      // This is a dashboard
      project "Dashboard" {
        screen Main {
          layout stack {
            // Header component
            component Heading text: "Dashboard"
            // Action button
            component Button text: "New Item"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);

    expect(ast.name).toBe('Dashboard');
    expect(ast.screens[0].layout.children).toHaveLength(2);
  });

  it('should throw error on invalid syntax', () => {
    const input = `
      project "Invalid" {
        screen Main {
          layout stack
            component Heading text: "Missing braces"
          }
        }
      }
    `;

    expect(() => parseWireDSL(input)).toThrow();
  });

  it('should parse complete example', () => {
    const input = `
      project "Simple Dashboard" {
        tokens density: comfortable
        tokens spacing: lg

        screen Dashboard {
          layout stack(direction: vertical, gap: lg, padding: xl) {
            component Topbar title: "Dashboard"
            
            layout grid(columns: 12, gap: lg) {
              cell span: 4 {
                component Card title: "Total Users"
              }
              cell span: 4 {
                component Card title: "Active Sessions"
              }
              cell span: 4 {
                component Card title: "Revenue"
              }
            }

            component ChartPlaceholder type: "bar" height: 300

            component Table
              columns: "Date,Event,User"
              rowsMock: 5
          }
        }
      }
    `;

    const ast = parseWireDSL(input);

    expect(ast.name).toBe('Simple Dashboard');
    expect(ast.tokens).toEqual({
      density: 'comfortable',
      spacing: 'lg',
    });
    expect(ast.screens).toHaveLength(1);

    const mainLayout = ast.screens[0].layout;
    expect(mainLayout.layoutType).toBe('stack');
    expect(mainLayout.children.length).toBeGreaterThan(0);
  });

  it('should detect simple circular component references', () => {
    const input = `
      project "Circular" {
        define Component "A" {
          layout stack {
            component B
          }
        }

        define Component "B" {
          layout stack {
            component A
          }
        }

        screen Main {
          layout stack {
            component A
          }
        }
      }
    `;

    expect(() => parseWireDSL(input)).toThrow(/Circular component definition/);
    expect(() => parseWireDSL(input)).toThrow(/A → B → A/);
  });

  it('should detect complex circular component references', () => {
    const input = `
      project "ComplexCycle" {
        define Component "A" {
          layout stack {
            component B
          }
        }

        define Component "B" {
          layout stack {
            component C
          }
        }

        define Component "C" {
          layout stack {
            component A
          }
        }

        screen Main {
          layout stack {
            component A
          }
        }
      }
    `;

    expect(() => parseWireDSL(input)).toThrow(/Circular component definition/);
    expect(() => parseWireDSL(input)).toThrow(/A → B → C → A/);
  });

  it('should allow self-reference detection', () => {
    const input = `
      project "SelfRef" {
        define Component "A" {
          layout stack {
            component A
          }
        }

        screen Main {
          layout stack {
            component A
          }
        }
      }
    `;

    expect(() => parseWireDSL(input)).toThrow(/Circular component definition/);
    expect(() => parseWireDSL(input)).toThrow(/A → A/);
  });

  it('should allow multiple non-circular components', () => {
    const input = `
      project "NoCycle" {
        define Component "Button" {
          component Button text: "Click"
        }

        define Component "ButtonGroup" {
          layout stack(direction: horizontal) {
            component Button
            component Button
          }
        }

        define Component "FormWithButtons" {
          layout stack {
            component Input
            component ButtonGroup
          }
        }

        screen Main {
          layout stack {
            component FormWithButtons
          }
        }
      }
    `;

    // Should not throw
    const ast = parseWireDSL(input);
    expect(ast.definedComponents).toHaveLength(3);
  });
});

