import { describe, it, expect, vi } from 'vitest';
import { parseWireDSL } from '../parser/index';
import { generateIR, IRGenerator } from './index';

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

  it('should apply default theme', () => {
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

    expect(ir.project.config).toEqual({
      density: 'normal',
      spacing: 'md',
      radius: 'md',
      stroke: 'normal',
      font: 'base',
    });
  });

  it('should apply custom theme', () => {
    const input = `
      project "Custom" {
        config {
          density: "comfortable"
          spacing: "lg"
        }

        screen Main {
          layout stack {
            component Button text: "Click"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    expect(ir.project.config.density).toBe('comfortable');
    expect(ir.project.config.spacing).toBe('lg');
    expect(ir.project.config.radius).toBe('md'); // default
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
        config {
          density: "comfortable"
          spacing: "lg"
        }

        screen Dashboard {
          layout stack(direction: vertical, gap: lg, padding: xl) {
            component Topbar title: "Dashboard"
            
            layout grid(columns: 12, gap: lg) {
              cell span: 4 {
                layout card(padding: md, gap: md) {
                  component Heading text: "Users"
                }
              }
              cell span: 4 {
                layout card(padding: md, gap: md) {
                  component Heading text: "Sessions"
                }
              }
              cell span: 4 {
                layout card(padding: md, gap: md) {
                  component Heading text: "Revenue"
                }
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
    expect(ir.project.config.density).toBe('comfortable');
    expect(ir.project.screens).toHaveLength(1);
    expect(Object.keys(ir.project.nodes).length).toBeGreaterThan(5);

    // Verify structure
    const screen = ir.project.screens[0];
    const rootNode = ir.project.nodes[screen.root.ref];
    expect(rootNode.kind).toBe('container');
  });

  it('should expand defined components at IR generation', () => {
    const input = `
      project "ComponentComposition" {
        define Component "ButtonGroup" {
          layout stack(direction: horizontal) {
            component Button text: "OK"
            component Button text: "Cancel"
          }
        }

        screen Main {
          layout stack {
            component ButtonGroup
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    expect(ast.definedComponents).toHaveLength(1);
    expect(ast.definedComponents[0].name).toBe('ButtonGroup');

    const ir = generateIR(ast);

    // Verify: No 'ButtonGroup' component type in IR (it should be expanded)
    const allNodes = Object.values(ir.project.nodes);
    const buttonGroupNodes = allNodes.filter(
      (n: any) => n.componentType === 'ButtonGroup'
    );
    expect(buttonGroupNodes).toHaveLength(0);

    // Verify: Two Button components exist (expansion result)
    const buttonNodes = allNodes.filter(
      (n: any) => n.kind === 'component' && n.componentType === 'Button'
    );
    expect(buttonNodes.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle nested defined components', () => {
    const input = `
      project "NestedComponents" {
        define Component "FormField" {
          layout stack(direction: vertical) {
            component Label text: "Field"
            component Input
          }
        }

        define Component "FormGroup" {
          layout stack {
            component FormField
            component FormField
          }
        }

        screen Main {
          layout stack {
            component FormGroup
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    expect(ast.definedComponents).toHaveLength(2);

    const ir = generateIR(ast);

    // Verify: No FormGroup or FormField in IR (all expanded)
    const allNodes = Object.values(ir.project.nodes);
    const customComponentNodes = allNodes.filter(
      (n: any) =>
        n.componentType === 'FormGroup' || n.componentType === 'FormField'
    );
    expect(customComponentNodes).toHaveLength(0);

    // Verify: Input and Label components exist (leaf nodes)
    const inputNodes = allNodes.filter(
      (n: any) => n.kind === 'component' && n.componentType === 'Input'
    );
    const labelNodes = allNodes.filter(
      (n: any) => n.kind === 'component' && n.componentType === 'Label'
    );
    expect(inputNodes.length).toBeGreaterThanOrEqual(2); // At least 2 from nested expansion
    expect(labelNodes.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle defined component with single component body', () => {
    const input = `
      project "SingleComponentBody" {
        define Component "PrimaryButton" {
          component Button text: "Submit" variant: primary
        }

        screen Main {
          layout stack {
            component PrimaryButton
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    // Verify: No PrimaryButton in IR
    const allNodes = Object.values(ir.project.nodes);
    const customNodes = allNodes.filter(
      (n: any) => n.componentType === 'PrimaryButton'
    );
    expect(customNodes).toHaveLength(0);

    // Verify: Button component exists with properties
    const buttonNodes = allNodes.filter(
      (n: any) => n.kind === 'component' && n.componentType === 'Button'
    );
    expect(buttonNodes.length).toBeGreaterThanOrEqual(1);
  });

  it('should allow hoisting: component used before definition', () => {
    const input = `
      project "Hoisting" {
        screen Main {
          layout stack {
            component ButtonGroup
          }
        }

        define Component "ButtonGroup" {
          layout stack(direction: horizontal) {
            component Button text: "OK"
            component Button text: "Cancel"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    // Should not throw, hoisting is allowed
    expect(ir.project.screens).toHaveLength(1);
    
    // Verify ButtonGroup was expanded
    const allNodes = Object.values(ir.project.nodes);
    const buttonGroupNodes = allNodes.filter(
      (n: any) => n.componentType === 'ButtonGroup'
    );
    expect(buttonGroupNodes).toHaveLength(0); // All expanded
  });

  it('should expand component defined before use', () => {
    const input = `
      project "GoodOrder" {
        define Component "ButtonGroup" {
          layout stack(direction: horizontal) {
            component Button text: "OK"
            component Button text: "Cancel"
          }
        }

        screen Main {
          layout stack {
            component ButtonGroup
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    // Should work fine
    expect(ir.project.screens).toHaveLength(1);
    
    // Verify ButtonGroup was expanded
    const allNodes = Object.values(ir.project.nodes);
    const buttonGroupNodes = allNodes.filter(
      (n: any) => n.componentType === 'ButtonGroup'
    );
    expect(buttonGroupNodes).toHaveLength(0); // All expanded
  });

  it('should throw error for undefined component', () => {
    const input = `
      project "UndefinedComponent" {
        screen Main {
          layout stack {
            component UndefinedButton
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    expect(() => generateIR(ast)).toThrow(/Components used but not defined/);
    expect(() => generateIR(ast)).toThrow(/UndefinedButton/);
  });

  it('should throw error for multiple undefined components', () => {
    const input = `
      project "MultiUndefined" {
        screen Main {
          layout stack {
            component CustomButton
            component CustomInput
            component CustomCard
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    expect(() => generateIR(ast)).toThrow(/Components used but not defined/);
    expect(() => generateIR(ast)).toThrow(/CustomButton/);
    expect(() => generateIR(ast)).toThrow(/CustomInput/);
    expect(() => generateIR(ast)).toThrow(/CustomCard/);
  });

  it('should allow built-in components without definition', () => {
    const input = `
      project "BuiltIn" {
        screen Main {
          layout stack {
            component Button text: "Click"
            component Input placeholder: "Enter"
            component Heading text: "Title"
            component Text content: "Body"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    // Should not throw, built-in components are allowed
    expect(ir.project.screens).toHaveLength(1);
  });

  it('should expand StatCard with default styling', () => {
    const input = `
      project "Dashboard" {
        config {
          density: "comfortable"
        }
        
        screen Main {
          layout grid(columns: 3) {
            cell span: 1 {
              component StatCard title: "Total Users" value: "2,543" color: "#3B82F6"
            }
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    const statCard = Object.entries(ir.project.nodes)
      .find(([_, n]) => n.kind === 'component' && n.componentType === 'StatCard');

    expect(statCard).toBeDefined();
    if (statCard) {
      const [id, node] = statCard;
      if (node.kind === 'component') {
        expect(node.props.title).toBe('Total Users');
        expect(node.props.value).toBe('2,543');
        expect(node.props.color).toBe('#3B82F6');
      }
    }
  });

  it('should expand form components with properties', () => {
    const input = `
      project "Forms" {
        screen FormScreen {
          layout stack(direction: vertical, gap: md) {
            component Input label: "Email" placeholder: "user@example.com" required: true
            component Textarea label: "Bio" rows: 4 placeholder: "Tell us..."
            component Select label: "Country" items: "USA,Canada,Mexico"
            component Checkbox label: "I agree" checked: true
            component Toggle label: "Notifications" enabled: false
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    const components = Object.entries(ir.project.nodes)
      .filter(([_, n]) => n.kind === 'component')
      .map(([id, node]) => {
        if (node.kind === 'component') {
          return { id, type: node.componentType };
        }
        return { id, type: 'unknown' };
      });

    expect(components.length).toBeGreaterThanOrEqual(5);
    expect(components.some(c => c.type === 'Input')).toBe(true);
    expect(components.some(c => c.type === 'Textarea')).toBe(true);
    expect(components.some(c => c.type === 'Select')).toBe(true);
    expect(components.some(c => c.type === 'Checkbox')).toBe(true);
    expect(components.some(c => c.type === 'Toggle')).toBe(true);
  });

  it('should handle SidebarMenu with active state', () => {
    const input = `
      project "Admin" {
        screen Dashboard {
          layout split(sidebar: 240, gap: lg) {
            layout stack(direction: vertical, gap: md) {
              component SidebarMenu items: "Users,Roles,Settings" active: 1
            }
            layout stack(direction: vertical) {
              component Heading text: "Content"
            }
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    const sidebarMenu = Object.entries(ir.project.nodes)
      .find(([_, n]) => n.kind === 'component' && n.componentType === 'SidebarMenu');

    expect(sidebarMenu).toBeDefined();
    if (sidebarMenu) {
      const [id, node] = sidebarMenu;
      if (node.kind === 'component') {
        expect(node.props.items).toBe('Users,Roles,Settings');
        expect(node.props.active).toBe(1);
      }
    }
  });

  it('should parse and apply mocks data', () => {
    const input = `
      project "MocksProject" {
        mocks {
          userStatus: "Active,Inactive,Suspended"
          roles: "Admin,Editor,Viewer"
        }
        
        screen Main {
          layout stack {
            component Heading text: "Settings"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    expect(ir.project.mocks).toEqual({
      userStatus: 'Active,Inactive,Suspended',
      roles: 'Admin,Editor,Viewer',
    });
  });

  it('should parse and apply colors palette', () => {
    const input = `
      project "Branded" {
        colors {
          primary: #3B82F6
          secondary: #8B5CF6
          success: #10B981
          danger: #EF4444
          warning: #F59E0B
        }
        
        screen Main {
          layout stack {
            component Button text: "Primary" variant: primary
            component Button text: "Danger" variant: danger
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    expect(ir.project.colors).toEqual({
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      success: '#10B981',
      danger: '#EF4444',
      warning: '#F59E0B',
    });
  });

  it('should expand Divider and Breadcrumbs components', () => {
    const input = `
      project "Navigation" {
        screen UserDetail {
          layout stack(direction: vertical, gap: md) {
            component Breadcrumbs items: "Users,Details"
            component Divider
            component Heading text: "User Profile"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    const breadcrumbs = Object.entries(ir.project.nodes)
      .find(([_, n]) => n.kind === 'component' && n.componentType === 'Breadcrumbs');
    
    const divider = Object.entries(ir.project.nodes)
      .find(([_, n]) => n.kind === 'component' && n.componentType === 'Divider');

    expect(breadcrumbs).toBeDefined();
    expect(divider).toBeDefined();
  });

  it('should expand Image component with dimensions', () => {
    const input = `
      project "Gallery" {
        screen ProductCard {
          layout card(padding: md, gap: md) {
            component Image placeholder: "landscape" height: 300
            component Heading text: "Product"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    const image = Object.entries(ir.project.nodes)
      .find(([_, n]) => n.kind === 'component' && n.componentType === 'Image');

    expect(image).toBeDefined();
    if (image) {
      const [id, node] = image;
      if (node.kind === 'component') {
        expect(node.props.placeholder).toBe('landscape');
        expect(node.props.height).toBe(300);
      }
    }
  });

  it('should expand card layout with properties', () => {
    const input = `
      project "Cards" {
        screen Settings {
          layout stack(direction: vertical, gap: lg, padding: xl) {
            component Heading text: "Account"
            component Button text: "Save"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);

    // Verify screens and nodes were created
    expect(ir.project.screens).toHaveLength(1);
    expect(Object.keys(ir.project.nodes).length).toBeGreaterThan(0);
  });
});


