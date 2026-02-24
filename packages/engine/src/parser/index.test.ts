import { describe, it, expect } from 'vitest';
import { parseWireDSL, parseWireDSLWithSourceMap } from './index';

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

  it('should parse Button block property', () => {
    const input = `
      project "ButtonBlock" {
        screen Main {
          layout stack {
            component Button text: "Continue" block: true
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const button = ast.screens[0].layout.children[0];

    expect(button.type).toBe('component');
    if (button.type === 'component') {
      expect(button.componentType).toBe('Button');
      expect(button.props).toEqual({
        text: 'Continue',
        block: 'true',
      });
    }
  });

  it('should parse Heading level property', () => {
    const input = `
      project "HeadingLevel" {
        screen Main {
          layout stack {
            component Heading text: "Page title" level: h1
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const heading = ast.screens[0].layout.children[0];

    expect(heading.type).toBe('component');
    if (heading.type === 'component') {
      expect(heading.componentType).toBe('Heading');
      expect(heading.props).toEqual({
        text: 'Page title',
        level: 'h1',
      });
    }
  });

  it('should parse Topbar icon/avatar/user/actions properties', () => {
    const input = `
      project "TopbarProps" {
        screen Main {
          layout stack {
            component Topbar title: "Dashboard" subtitle: "Overview" icon: "menu" actions: "Help,Logout" user: "john_doe" avatar: true
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const topbar = ast.screens[0].layout.children[0];

    expect(topbar.type).toBe('component');
    if (topbar.type === 'component') {
      expect(topbar.componentType).toBe('Topbar');
      expect(topbar.props).toEqual({
        title: 'Dashboard',
        subtitle: 'Overview',
        icon: 'menu',
        actions: 'Help,Logout',
        user: 'john_doe',
        avatar: 'true',
      });
    }
  });

  it('should parse Heading spacing property', () => {
    const input = `
      project "HeadingSpacing" {
        screen Main {
          layout stack {
            component Heading text: "Card title" spacing: sm
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const heading = ast.screens[0].layout.children[0];

    expect(heading.type).toBe('component');
    if (heading.type === 'component') {
      expect(heading.componentType).toBe('Heading');
      expect(heading.props).toEqual({
        text: 'Card title',
        spacing: 'sm',
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

  it('should parse Chart component with type and height', () => {
    const input = `
      project "Chart" {
        screen Main {
          layout stack {
            component Chart type: "pie" height: 240
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const component = ast.screens[0].layout.children[0];

    expect(component.type).toBe('component');
    if (component.type === 'component') {
      expect(component.componentType).toBe('Chart');
      expect(component.props).toEqual({
        type: 'pie',
        height: 240,
      });
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

  it('should parse Stat component', () => {
    const input = `
      project "Stats" {
        screen Dashboard {
          layout grid(columns: 3) {
            cell span: 1 {
              component Stat title: "Total Users" value: "2,543"
            }
            cell span: 1 {
              component Stat title: "Revenue" value: "$45.2K"
            }
            cell span: 1 {
              component Stat title: "Active" value: "856" color: "#3B82F6"
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
      const stat = cell1.children[0];
      expect(stat.type).toBe('component');
      if (stat.type === 'component') {
        expect(stat.componentType).toBe('Stat');
        expect(stat.props.title).toBe('Total Users');
        expect(stat.props.value).toBe('2,543');
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
          layout split(left: 240, gap: lg) {
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
    expect(split.params.left).toBe(240);
    
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

  it('should parse Image icon property when placeholder is icon', () => {
    const input = `
      project "IconImage" {
        screen Main {
          layout stack {
            component Image placeholder: "icon" icon: "search" height: 120
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const image = ast.screens[0].layout.children[0];

    expect(image.type).toBe('component');
    if (image.type === 'component') {
      expect(image.componentType).toBe('Image');
      expect(image.props).toEqual({
        placeholder: 'icon',
        icon: 'search',
        height: 120,
      });
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

  it('should return lexer diagnostics with range in tolerant mode', () => {
    const input = `
      project "Broken {
        screen Main {
          layout stack {
            component Heading text: "Test"
          }
        }
      }
    `;

    const result = parseWireDSLWithSourceMap(input, '<input>', { throwOnError: false });

    expect(result.hasErrors).toBe(true);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].phase).toBe('lexer');
    expect(result.errors[0].range.start.line).toBeGreaterThan(0);
  });

  it('should return parser diagnostics with range in tolerant mode', () => {
    const input = `
      project "Invalid" {
        screen Main {
          layout stack
            component Heading text: "Missing braces"
          }
        }
      }
    `;

    const result = parseWireDSLWithSourceMap(input, '<input>', { throwOnError: false });

    expect(result.hasErrors).toBe(true);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].phase).toBe('parser');
    expect(result.errors[0].range.start.line).toBeGreaterThan(0);
  });

  it('should return semantic warnings for unsupported component properties', () => {
    const input = `
      project "Warnings" {
        screen Main {
          layout stack {
            component Button text: "Save" unknownProp: "foo"
          }
        }
      }
    `;

    const result = parseWireDSLWithSourceMap(input);
    const warning = result.warnings.find((d) => d.code === 'COMPONENT_UNKNOWN_PROPERTY');

    expect(result.hasErrors).toBe(false);
    expect(warning).toBeDefined();
    expect(warning?.severity).toBe('warning');
    expect(warning?.range.start.line).toBeGreaterThan(0);
  });

  it('should return semantic warnings for invalid enum values', () => {
    const input = `
      project "Warnings" {
        screen Main {
          layout stack(direction: diagonal) {
            component Heading text: "Title"
          }
        }
      }
    `;

    const result = parseWireDSLWithSourceMap(input);
    const warning = result.warnings.find((d) => d.code === 'LAYOUT_INVALID_PARAMETER_VALUE');

    expect(result.hasErrors).toBe(false);
    expect(warning).toBeDefined();
    expect(warning?.severity).toBe('warning');
    expect(warning?.range.start.line).toBeGreaterThan(0);
  });

  it('should return semantic warnings for missing required layout parameters', () => {
    const input = `
      project "Warnings" {
        screen Main {
          layout grid {
            component Heading text: "Title"
          }
        }
      }
    `;

    const result = parseWireDSLWithSourceMap(input);
    const warning = result.warnings.find((d) => d.code === 'LAYOUT_MISSING_REQUIRED_PARAMETER');

    expect(result.hasErrors).toBe(false);
    expect(warning).toBeDefined();
    expect(warning?.message).toContain('columns');
    expect(warning?.severity).toBe('warning');
    expect(warning?.range.start.line).toBeGreaterThan(0);
  });

  it('should return semantic errors for invalid split side contract', () => {
    const input = `
      project "Warnings" {
        screen Main {
          layout split {
            component Heading text: "Title"
          }
        }
      }
    `;

    const result = parseWireDSLWithSourceMap(input);
    const missingSideError = result.errors.find((d) => d.code === 'LAYOUT_SPLIT_SIDE_REQUIRED');
    const arityError = result.errors.find((d) => d.code === 'LAYOUT_SPLIT_CHILDREN_ARITY');

    expect(result.hasErrors).toBe(true);
    expect(missingSideError).toBeDefined();
    expect(arityError).toBeDefined();
    expect(missingSideError?.range.start.line).toBeGreaterThan(0);
  });

  it('should return semantic error when split uses deprecated sidebar parameter', () => {
    const input = `
      project "Warnings" {
        screen Main {
          layout split(sidebar: 240) {
            layout stack { component Heading text: "Left" }
            layout stack { component Heading text: "Right" }
          }
        }
      }
    `;

    const result = parseWireDSLWithSourceMap(input);
    const deprecatedError = result.errors.find((d) => d.code === 'LAYOUT_SPLIT_SIDEBAR_DEPRECATED');

    expect(result.hasErrors).toBe(true);
    expect(deprecatedError).toBeDefined();
  });

  it('should return semantic error when split uses both left and right parameters', () => {
    const input = `
      project "Warnings" {
        screen Main {
          layout split(left: 240, right: 320) {
            layout stack { component Heading text: "Left" }
            layout stack { component Heading text: "Right" }
          }
        }
      }
    `;

    const result = parseWireDSLWithSourceMap(input);
    const conflictError = result.errors.find((d) => d.code === 'LAYOUT_SPLIT_SIDE_CONFLICT');

    expect(result.hasErrors).toBe(true);
    expect(conflictError).toBeDefined();
  });

  it('should warn when split width is invalid and fallback is applied semantically', () => {
    const input = `
      project "Warnings" {
        screen Main {
          layout split(left: 0) {
            layout stack { component Heading text: "Left" }
            layout stack { component Heading text: "Right" }
          }
        }
      }
    `;

    const result = parseWireDSLWithSourceMap(input);
    const widthWarning = result.warnings.find((d) => d.code === 'LAYOUT_SPLIT_WIDTH_INVALID');

    expect(widthWarning).toBeDefined();
    expect(widthWarning?.message).toContain('Falling back to 250');
  });

  it('should warn when Table caption and pagination resolve to same alignment', () => {
    const input = `
      project "Warnings" {
        screen Main {
          layout stack {
            component Table columns: "A,B" rows: 3 pagination: true caption: "Showing 1-3" paginationAlign: right captionAlign: right
          }
        }
      }
    `;

    const result = parseWireDSLWithSourceMap(input);
    const collisionWarning = result.warnings.find((d) => d.code === 'TABLE_FOOTER_ALIGNMENT_COLLISION');

    expect(collisionWarning).toBeDefined();
  });

  it('should return semantic warning when layout has no children', () => {
    const input = `
      project "Warnings" {
        screen Main {
          layout stack {
          }
        }
      }
    `;

    const result = parseWireDSLWithSourceMap(input);
    const warning = result.warnings.find((d) => d.code === 'LAYOUT_EMPTY');

    expect(result.hasErrors).toBe(false);
    expect(warning).toBeDefined();
    expect(warning?.severity).toBe('warning');
    expect(warning?.range.start.line).toBeGreaterThan(0);
  });

  it('should parse define Layout and keyword-like identifiers', () => {
    const input = `
      project "Layouts" {
        define Layout "screen_default" {
          layout stack {
            component Children
          }
        }

        screen Main {
          layout screen_default {
            layout stack {
              component Heading text: "Main"
            }
          }
        }
      }
    `;

    const ast = parseWireDSL(input);

    expect(ast.definedLayouts).toHaveLength(1);
    expect(ast.definedLayouts[0].name).toBe('screen_default');
    expect(ast.screens[0].layout.layoutType).toBe('screen_default');
  });

  it('should parse keyword prefix names as identifiers', () => {
    const input = `
      project "KeywordPrefix" {
        screen Main {
          layout screen_default {
            component Heading text: "Works"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    expect(ast.screens[0].layout.layoutType).toBe('screen_default');
  });

  it('should return semantic error when Children is used outside define Layout', () => {
    const input = `
      project "ChildrenOutside" {
        screen Main {
          layout stack {
            component Children
          }
        }
      }
    `;

    const result = parseWireDSLWithSourceMap(input, '<input>', { throwOnError: false });
    const error = result.errors.find((d) => d.code === 'CHILDREN_SLOT_OUTSIDE_LAYOUT_DEFINITION');

    expect(result.hasErrors).toBe(true);
    expect(error).toBeDefined();
  });

  it('should return semantic error when define Layout does not have exactly one Children slot', () => {
    const input = `
      project "ChildrenCount" {
        define Layout "screen_default" {
          layout stack {
            component Heading text: "No slot"
          }
        }

        screen Main {
          layout screen_default {
            layout stack {
              component Heading text: "Body"
            }
          }
        }
      }
    `;

    const result = parseWireDSLWithSourceMap(input, '<input>', { throwOnError: false });
    const error = result.errors.find((d) => d.code === 'LAYOUT_DEFINITION_CHILDREN_SLOT_COUNT');

    expect(result.hasErrors).toBe(true);
    expect(error).toBeDefined();
  });

  it('should return semantic error when using define Layout without exactly one child', () => {
    const input = `
      project "LayoutArity" {
        define Layout "screen_default" {
          layout stack {
            component Children
          }
        }

        screen Main {
          layout screen_default {
          }
        }
      }
    `;

    const result = parseWireDSLWithSourceMap(input, '<input>', { throwOnError: false });
    const error = result.errors.find((d) => d.code === 'LAYOUT_DEFINITION_CHILDREN_ARITY');

    expect(result.hasErrors).toBe(true);
    expect(error).toBeDefined();
  });

  it('should return semantic error for invalid define Layout name', () => {
    const input = `
      project "BadLayoutName" {
        define Layout "ScreenDefault" {
          layout stack {
            component Children
          }
        }

        screen Main {
          layout ScreenDefault {
            layout stack {
              component Heading text: "Body"
            }
          }
        }
      }
    `;

    const result = parseWireDSLWithSourceMap(input, '<input>', { throwOnError: false });
    const error = result.errors.find((d) => d.code === 'LAYOUT_DEFINITION_INVALID_NAME');

    expect(result.hasErrors).toBe(true);
    expect(error).toBeDefined();
  });

  it('should return warning for non-PascalCase define Component name', () => {
    const input = `
      project "ComponentStyle" {
        define Component "my_button" {
          component Button text: "Save"
        }

        screen Main {
          layout stack {
            component my_button
          }
        }
      }
    `;

    const result = parseWireDSLWithSourceMap(input, '<input>', { throwOnError: false });
    const warning = result.warnings.find((d) => d.code === 'COMPONENT_DEFINITION_NAME_STYLE');

    expect(result.hasErrors).toBe(false);
    expect(warning).toBeDefined();
  });

  it('should detect circular references across component and layout definitions', () => {
    const input = `
      project "CrossCycle" {
        define Component "A" {
          layout app_shell {
            component Heading text: "Inner"
          }
        }

        define Layout "app_shell" {
          layout stack {
            component A
            component Children
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
    expect(() => parseWireDSL(input)).toThrow(/A → app_shell → A/);
  });
});
