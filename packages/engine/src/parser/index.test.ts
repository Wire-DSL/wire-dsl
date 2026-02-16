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

  it('should parse config declarations', () => {
    const input = `
      project "Dashboard" {
        style {
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

    expect(ast.style).toEqual({
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
        style {
          density: "comfortable"
          spacing: "lg"
        }

        screen Dashboard {
          layout stack(direction: vertical, gap: lg, padding: xl) {
            component Topbar title: "Dashboard"
            
            layout grid(columns: 12, gap: lg) {
              cell span: 4 {
                layout card(padding: md, gap: md) {
                  component Heading text: "Total Users"
                }
              }
              cell span: 4 {
                layout card(padding: md, gap: md) {
                  component Heading text: "Active Sessions"
                }
              }
              cell span: 4 {
                layout card(padding: md, gap: md) {
                  component Heading text: "Revenue"
                }
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
    expect(ast.style).toEqual({
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

  it('should parse StatCard component', () => {
    const input = `
      project "StatCards" {
        screen Dashboard {
          layout grid(columns: 3) {
            cell span: 1 {
              component StatCard title: "Total Users" value: "2,543"
            }
            cell span: 1 {
              component StatCard title: "Revenue" value: "$45.2K"
            }
            cell span: 1 {
              component StatCard title: "Active" value: "856" color: "#3B82F6"
            }
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const grid = ast.screens[0].layout;
    const cell1 = grid.children[0];
    
    expect(cell1.type).toBe('cell');
    if (cell1.type === 'cell') {
      const statCard = cell1.children[0];
      expect(statCard.type).toBe('component');
      if (statCard.type === 'component') {
        expect(statCard.componentType).toBe('StatCard');
        expect(statCard.props.title).toBe('Total Users');
        expect(statCard.props.value).toBe('2,543');
      }
    }
  });

  it('should parse Textarea component with rows', () => {
    const input = `
      project "Forms" {
        screen FormScreen {
          layout stack(direction: vertical, gap: md) {
            component Textarea label: "Bio" placeholder: "Tell us about yourself..." rows: 4
            component Textarea label: "Comments" rows: 6
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const stack = ast.screens[0].layout;
    const textarea = stack.children[0];

    expect(textarea.type).toBe('component');
    if (textarea.type === 'component') {
      expect(textarea.componentType).toBe('Textarea');
      expect(textarea.props.label).toBe('Bio');
      expect(textarea.props.rows).toBe(4);
      expect(textarea.props.placeholder).toBe('Tell us about yourself...');
    }
  });

  it('should parse Select component with items', () => {
    const input = `
      project "Selects" {
        screen FormScreen {
          layout stack(direction: vertical, gap: md) {
            component Select label: "Country" items: "USA,Canada,Mexico,UK,Spain"
            component Select label: "Status" items: "Active,Inactive,Pending" default: Active
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const stack = ast.screens[0].layout;
    const select1 = stack.children[0];
    const select2 = stack.children[1];

    expect(select1.type).toBe('component');
    if (select1.type === 'component') {
      expect(select1.componentType).toBe('Select');
      expect(select1.props.items).toBe('USA,Canada,Mexico,UK,Spain');
    }
    if (select2.type === 'component') {
      expect(select2.props.default).toBe('Active');
    }
  });

  it('should parse SidebarMenu with active state', () => {
    const input = `
      project "MenuApp" {
        screen Dashboard {
          layout split(sidebar: 240, gap: lg) {
            layout stack(direction: vertical, gap: md) {
              component SidebarMenu items: "Users,Roles,Permissions,Audit,Settings" active: 0
            }
            layout stack(direction: vertical) {
              component Heading text: "Content"
            }
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const split = ast.screens[0].layout;
    
    expect(split.layoutType).toBe('split');
    expect(split.params.sidebar).toBe(240);
    
    const sidebarStack = split.children[0];
    if (sidebarStack.type === 'layout') {
      const menu = sidebarStack.children[0];
      expect(menu.type).toBe('component');
      if (menu.type === 'component') {
        expect(menu.componentType).toBe('SidebarMenu');
        expect(menu.props.items).toBe('Users,Roles,Permissions,Audit,Settings');
        expect(menu.props.active).toBe(0);
      }
    }
  });

  it('should parse mocks block', () => {
    const input = `
      project "MocksProject" {
        mocks {
          status: "Active,Inactive,Pending"
          role: "Admin,User,Guest"
          countries: "USA,Canada,Mexico"
        }
        
        screen Main {
          layout stack {
            component Select label: "Status" items: "Active,Inactive,Pending"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);

    expect(ast.mocks).toEqual({
      status: 'Active,Inactive,Pending',
      role: 'Admin,User,Guest',
      countries: 'USA,Canada,Mexico',
    });
  });

  it('should parse colors block', () => {
    const input = `
      project "ColorsProject" {
        colors {
          primary: #3B82F6
          secondary: #8B5CF6
          success: #10B981
          danger: #EF4444
        }
        
        screen Main {
          layout stack {
            component Button text: "Primary" variant: primary
          }
        }
      }
    `;

    const ast = parseWireDSL(input);

    expect(ast.colors).toEqual({
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      success: '#10B981',
      danger: '#EF4444',
    });
  });

  it('should reject singular color block alias', () => {
    const input = `
      project "ColorAliasProject" {
        color {
          primary: #00FF00
        }

        screen Main {
          layout stack {
            component Button text: "Save" variant: primary
          }
        }
      }
    `;

    expect(() => parseWireDSL(input)).toThrow();
  });

  it('should parse Checkbox and Toggle components', () => {
    const input = `
      project "InputControls" {
        screen Settings {
          layout stack(direction: vertical, gap: md) {
            component Checkbox label: "Subscribe to newsletter"
            component Checkbox label: "Enable notifications" checked: true
            component Toggle label: "Two-factor authentication"
            component Toggle label: "Dark mode" enabled: true
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const stack = ast.screens[0].layout;

    expect(stack.children).toHaveLength(4);
    if (stack.children[0].type === 'component') {
      expect(stack.children[0].componentType).toBe('Checkbox');
    }
    if (stack.children[1].type === 'component') {
      expect(stack.children[1].props.checked).toBe('true');
    }
    if (stack.children[2].type === 'component') {
      expect(stack.children[2].componentType).toBe('Toggle');
    }
    if (stack.children[3].type === 'component') {
      expect(stack.children[3].props.enabled).toBe('true');
    }
  });

  it('should parse Divider and Breadcrumbs components', () => {
    const input = `
      project "Navigation" {
        screen UserDetail {
          layout stack(direction: vertical, gap: md) {
            component Breadcrumbs items: "Users,User Details"
            component Divider
            component Heading text: "User Information"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const stack = ast.screens[0].layout;

    expect(stack.children).toHaveLength(3);
    if (stack.children[0].type === 'component') {
      expect(stack.children[0].componentType).toBe('Breadcrumbs');
      expect(stack.children[0].props.items).toBe('Users,User Details');
    }
    if (stack.children[1].type === 'component') {
      expect(stack.children[1].componentType).toBe('Divider');
    }
  });

  it('should parse Image component with placeholder', () => {
    const input = `
      project "Gallery" {
        screen ProductCard {
          layout card(padding: md, gap: md) {
            component Image placeholder: "square" height: 200
            component Heading text: "Product Name"
            component Button text: "View Details"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const card = ast.screens[0].layout;
    const image = card.children[0];

    expect(image.type).toBe('component');
    if (image.type === 'component') {
      expect(image.componentType).toBe('Image');
      expect(image.props.placeholder).toBe('square');
      expect(image.props.height).toBe(200);
    }
  });

  it('should parse panel layout', () => {
    const input = `
      project "Panels" {
        screen Settings {
          layout stack(direction: vertical, gap: lg) {
            component Heading text: "Account Settings"
            
            layout panel(padding: lg, border: true) {
              layout stack(direction: vertical, gap: md) {
                component Input label: "Email" placeholder: "user@example.com"
                component Button text: "Save"
              }
            }
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const stack = ast.screens[0].layout;
    const panel = stack.children[1];

    expect(panel.type).toBe('layout');
    if (panel.type === 'layout') {
      expect(panel.layoutType).toBe('panel');
      expect(panel.params.border).toBe('true');
    }
  });
});
