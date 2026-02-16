import { describe, it, expect } from 'vitest';
import { parseWireDSL, parseWireDSLWithSourceMap } from '../parser/index';
import { generateIR } from '../ir/index';
import { calculateLayout } from '../layout/index';
import { renderToSVG } from './index';
import { SkeletonSVGRenderer } from './skeleton';

describe('SVG Renderer', () => {
  it('should render basic SVG', () => {
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
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('Hello');
  });

  it('should render heading component', () => {
    const input = `
      project "Heading" {
        screen Main {
          layout stack {
            component Heading text: "My Title"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('My Title');
    expect(svg).toContain('<text');
  });

  it('should render button component', () => {
    const input = `
      project "Button" {
        screen Main {
          layout stack {
            component Button text: "Click Me"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Click Me');
    expect(svg).toContain('<rect');
  });

  it('should render primary button with different style', () => {
    const input = `
      project "Primary" {
        screen Main {
          layout stack {
            component Button text: "Submit" variant: "primary"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Submit');
    expect(svg).toContain('rgba(59, 130, 246'); // Primary blue color with opacity
  });

  it('should render link component as underlined text without button background', () => {
    const input = `
      project "Link" {
        screen Main {
          layout stack {
            component Link text: "Learn more"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Learn more');
    expect(svg).toContain('<line');
  });

  it('should render link component with variant color', () => {
    const input = `
      project "LinkVariant" {
        screen Main {
          layout stack {
            component Link text: "Delete" variant: "danger"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Delete');
    expect(svg).toContain('rgba(239, 68, 68, 0.9)');
  });

  it('should override built-in and custom variants using colors block', () => {
    const input = `
      project "VariantOverrides" {
        colors {
          primary: #00FF00
          error: #FF0000
        }

        screen Main {
          layout stack {
            component Button text: "Save" variant: primary
            component Button text: "Fail" variant: error
            component Link text: "Go" variant: error
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('rgba(0, 255, 0, 0.85)');
    expect(svg).toContain('rgba(255, 0, 0, 0.85)');
    expect(svg).toContain('stroke="#FF0000"');
  });

  it('should render Separate component as invisible spacer (no divider line)', () => {
    const input = `
      project "Separate" {
        screen Main {
          layout stack {
            component Heading text: "Above"
            component Separate
            component Heading text: "Below"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Above');
    expect(svg).toContain('Below');
    expect(svg).not.toContain('stroke-width="1"/>');
  });

  it('should render alert with variant, title and text', () => {
    const input = `
      project "AlertNewProps" {
        screen Main {
          layout stack {
            component Alert variant: "warning" title: "Warning" text: "Check this action"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Warning');
    expect(svg).toContain('Check this action');
    expect(svg).toContain('#F59E0B');
  });

  it('should wrap alert text into multiple lines when content is long', () => {
    const input = `
      project "AlertWrap" {
        style {
          device: "mobile"
        }
        screen Main {
          layout stack {
            component Alert variant: "info" title: "Heads up" text: "This is a long alert message that should wrap to a new line instead of overflowing outside the alert box"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Heads up');
    expect((svg.match(/<tspan/g) || []).length).toBeGreaterThan(2);
  });

  it('should render input component', () => {
    const input = `
      project "Input" {
        screen Main {
          layout stack {
            component Input label: "Email" placeholder: "user@example.com"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Email');
    expect(svg).toContain('user@example.com');
  });

  it('should render card component', () => {
    const input = `
      project "Card" {
        screen Main {
          layout stack {
            layout card(padding: md, gap: md) {
              component Heading text: "Total Users"
            }
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Total Users');
  });

  it('should render topbar component', () => {
    const input = `
      project "Topbar" {
        screen Main {
          layout stack {
            component Topbar title: "Dashboard"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Dashboard');
  });

  it('should render table component', () => {
    const input = `
      project "Table" {
        screen Main {
          layout stack {
            component Table columns: "Name,Email,Status" rowsMock: 5
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Name');
    expect(svg).toContain('Email');
    expect(svg).toContain('Status');
  });

  it('should render chart placeholder', () => {
    const input = `
      project "Chart" {
        screen Main {
          layout stack {
            component ChartPlaceholder type: "bar" height: 300
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('[BAR CHART]');
  });

  it('should render multiple components', () => {
    const input = `
      project "Multiple" {
        screen Main {
          layout stack(direction: vertical, gap: md) {
            component Heading text: "Title"
            component Button text: "Action"
            component Input label: "Email"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Title');
    expect(svg).toContain('Action');
    expect(svg).toContain('Email');
  });

  it('should use light theme by default', () => {
    const input = `
      project "Theme" {
        screen Main {
          layout stack {
            component Button text: "Test"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('#F8FAFC'); // Light theme background
  });

  it('should render with dark theme', () => {
    const input = `
      project "DarkTheme" {
        screen Main {
          layout stack {
            component Button text: "Test"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout, { theme: 'dark' });

    expect(svg).toContain('#0F172A'); // Dark theme background
  });

  it('should respect custom dimensions', () => {
    const input = `
      project "Custom" {
        screen Main {
          layout stack {
            component Heading text: "Test"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout, { width: 800, height: 600 });

    expect(svg).toContain('width="800"');
    expect(svg).toContain('height="600"');
    expect(svg).toContain('viewBox="0 0 800 600"');
  });

  it('should escape XML special characters', () => {
    const input = `
      project "Escape" {
        screen Main {
          layout stack {
            component Heading text: "A & B < C > D"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('&amp;');
    expect(svg).toContain('&lt;');
    expect(svg).toContain('&gt;');
    expect(svg).not.toContain('A & B');
  });

  it('should render complete dashboard example', () => {
    const input = `
      project "Dashboard" {
        style {
          spacing: "lg"
        }
        
        screen Main {
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
            component Table columns: "Date,Event,User" rowsMock: 5
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Dashboard');
    expect(svg).toContain('Users');
    expect(svg).toContain('Sessions');
    expect(svg).toContain('Revenue');
    expect(svg).toContain('[BAR CHART]');
    expect(svg).toContain('Date');
    expect(svg).toContain('Event');
  });

  it('should be valid SVG', () => {
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
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    // Basic SVG structure validation
    expect(svg).toMatch(/^<svg/);
    expect(svg).toMatch(/<\/svg>$/);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('should render StatCard components', () => {
    const input = `
      project "Dashboard" {
        screen Analytics {
          layout grid(columns: 3, gap: lg) {
            cell span: 1 {
              component StatCard title: "Total Users" value: "2,543" color: "#3B82F6"
            }
            cell span: 1 {
              component StatCard title: "Revenue" value: "$45.2K" color: "#10B981"
            }
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Total Users');
    expect(svg).toContain('2,543');
    expect(svg).toContain('Revenue');
    expect(svg).toContain('$45.2K');
  });

  it('should render form components with labels', () => {
    const input = `
      project "Forms" {
        screen FormScreen {
          layout stack(direction: vertical, gap: md, padding: lg) {
            component Input label: "Email" placeholder: "user@example.com"
            component Textarea label: "Bio" rows: 4 placeholder: "Tell us..."
            component Select label: "Country" items: "USA,Canada,Mexico"
            component Checkbox label: "I agree to terms"
            component Toggle label: "Notifications"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Email');
    expect(svg).toContain('Bio');
    expect(svg).toContain('Country');
    expect(svg).toContain('I agree to terms');
    expect(svg).toContain('Notifications');
  });

  it('should render split layout with sidebar', () => {
    const input = `
      project "Admin" {
        screen Dashboard {
          layout split(sidebar: 240, gap: lg) {
            layout stack(direction: vertical, gap: md) {
              component Heading text: "Menu"
              component SidebarMenu items: "Users,Settings"
            }
            
            layout stack(direction: vertical) {
              component Heading text: "Content"
              component Text content: "Main area"
            }
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Menu');
    expect(svg).toContain('Content');
    expect(svg).toContain('Main area');
  });

  it('should render panel layout with border', () => {
    const input = `
      project "Panels" {
        screen Settings {
          layout stack(direction: vertical, gap: lg, padding: xl) {
            component Heading text: "Account Settings"
            
            layout panel(padding: lg, border: true) {
              layout stack(direction: vertical, gap: md) {
                component Input label: "Email"
                component Button text: "Save"
              }
            }
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Account Settings');
    expect(svg).toContain('Email');
    expect(svg).toContain('Save');
  });

  it('should render Breadcrumbs and Divider', () => {
    const input = `
      project "Navigation" {
        screen Details {
          layout stack(direction: vertical, gap: md, padding: lg) {
            component Breadcrumbs items: "Home,Users,User Details"
            component Divider
            component Heading text: "User Information"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Home');
    expect(svg).toContain('User Information');
  });

  it('should render Image component', () => {
    const input = `
      project "Gallery" {
        screen Products {
          layout grid(columns: 2, gap: lg) {
            cell span: 1 {
              layout card(padding: md, gap: md) {
                component Image placeholder: "landscape" height: 200
                component Heading text: "Product A"
              }
            }
            cell span: 1 {
              layout card(padding: md, gap: md) {
                component Image placeholder: "square" height: 200
                component Heading text: "Product B"
              }
            }
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Product A');
    expect(svg).toContain('Product B');
  });

  it('should render complete form example', () => {
    const input = `
      project "UserForm" {
        style {
          spacing: "md"
        }
        
        screen Register {
          layout stack(direction: vertical, gap: md, padding: lg) {
            component Heading text: "User Registration"
            component Text content: "Please fill in all fields"
            
            component Input label: "Full Name" placeholder: "John Doe"
            component Input label: "Email" placeholder: "john@example.com"
            component Select label: "Department" items: "Sales,Engineering,Support,Marketing"
            component Textarea label: "Bio" rows: 4 placeholder: "Tell us..."
            
            layout stack(direction: vertical, gap: sm) {
              component Heading text: "Preferences"
              component Checkbox label: "Subscribe to newsletter"
              component Checkbox label: "Receive email updates"
            }
            
            component Divider
            
            layout stack(direction: horizontal, gap: md) {
              component Button text: "Submit" variant: primary
              component Button text: "Cancel"
            }
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('User Registration');
    expect(svg).toContain('Full Name');
    expect(svg).toContain('Department');
    expect(svg).toContain('Bio');
    expect(svg).toContain('Preferences');
    expect(svg).toContain('Subscribe to newsletter');
    expect(svg).toContain('Submit');
    expect(svg).toContain('Cancel');
  });
});

describe('SVG Renderer - SourceMap Integration (data-node-id)', () => {
  it('should include data-node-id for components when parsed with SourceMap', () => {
    const input = `
      project "Test" {
        screen Main {
          layout stack {
            component Heading text: "Title"
            component Button text: "Click"
          }
        }
      }
    `;

    const { ast } = parseWireDSLWithSourceMap(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    // Should include data-node-id attributes for components
    expect(svg).toMatch(/data-node-id="component-heading-\d+"/);
    expect(svg).toMatch(/data-node-id="component-button-\d+"/);
  });

  it('should include data-node-id for different component types', () => {
    const input = `
      project "Components" {
        screen Main {
          layout stack {
            component Heading text: "Welcome"
            component Input placeholder: "Enter name"
            component Button text: "Submit"
            component Text content: "Description"
          }
        }
      }
    `;

    const { ast } = parseWireDSLWithSourceMap(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    // All components should have data-node-id
    expect(svg).toMatch(/data-node-id="component-heading-\d+"/);
    expect(svg).toMatch(/data-node-id="component-input-\d+"/);
    expect(svg).toMatch(/data-node-id="component-button-\d+"/);
    expect(svg).toMatch(/data-node-id="component-text-\d+"/);
  });

  it('should have unique data-node-id for identical components', () => {
    const input = `
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

    const { ast } = parseWireDSLWithSourceMap(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    // Extract all data-node-id values for buttons
    const buttonIds = svg.match(/data-node-id="component-button-\d+"/g) || [];
    
    // Should have 3 button data-node-ids
    expect(buttonIds.length).toBe(3);
    
    // All IDs should be unique
    const uniqueIds = new Set(buttonIds);
    expect(uniqueIds.size).toBe(3);
  });

  it('should not include data-node-id when parsed without SourceMap', () => {
    const input = `
      project "Test" {
        screen Main {
          layout stack {
            component Heading text: "Title"
          }
        }
      }
    `;

    // Use parseWireDSL (without SourceMap)
    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    // Should NOT include data-node-id (no SourceMap generated)
    expect(svg).not.toContain('data-node-id');
  });

  it('should include data-node-id for nested layouts', () => {
    const input = `
      project "Nested" {
        screen Main {
          layout stack {
            layout stack {
              component Heading text: "Nested Title"
            }
            layout stack {
              component Button text: "Action"
            }
          }
        }
      }
    `;

    const { ast } = parseWireDSLWithSourceMap(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    // Components in nested layouts should have data-node-id
    expect(svg).toMatch(/data-node-id="component-heading-\d+"/);
    expect(svg).toMatch(/data-node-id="component-button-\d+"/);
  });

  it('should include data-node-id for layout containers', () => {
    const input = `
      project "App" {
        screen Dashboard {
          layout stack {
            component Heading text: "Dashboard"
            layout grid(columns: 2, gap: md) {
              component Button text: "A"
              component Button text: "B"
            }
          }
        }
      }
    `;

    const { ast } = parseWireDSLWithSourceMap(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    // Layouts should have data-node-id
    expect(svg).toMatch(/data-node-id="layout-stack-\d+"/);
    expect(svg).toMatch(/data-node-id="layout-grid-\d+"/);

    // Layouts should have transparent clickable rect
    expect(svg).toContain('fill="transparent"');
    expect(svg).toContain('pointer-events="all"');
  });

  it('should render with default standard style', () => {
    const input = `
      project "Test" {
        screen Main {
          layout card {
            component Button text: "Click"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    // Standard style: no shadow filters in defs
    expect(svg).not.toContain('<filter');
    expect(svg).not.toContain('shadow-sm');

    // Standard style: button with rx="6" (standard buttonRadius)
    expect(svg).toContain('rx="6"');
  });

});

describe('Skeleton SVG Renderer', () => {
  it('should render button with same appearance as standard but no text', () => {
    const input = `
      project "Test" {
        screen Main {
          layout card {
            component Button text: "Click me"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    // Instantiate SkeletonSVGRenderer directly
    const renderer = new SkeletonSVGRenderer(ir, layout);
    const svg = renderer.render();

    // Button should have same fill color as standard renderer
    expect(svg).toContain('fill="rgba(226, 232, 240, 0.9)"');
    // Button should not have text
    expect(svg).not.toContain('>Click me<');
  });

  it('should render heading as gray block', () => {
    const input = `
      project "Test" {
        screen Main {
          layout stack {
            component Heading text: "Dashboard"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const renderer = new SkeletonSVGRenderer(ir, layout);
    const svg = renderer.render();

    // Heading should be gray block, not text
    expect(svg).not.toContain('>Dashboard<');
    expect(svg).toMatch(/<rect[^>]*fill="[^"]*"/);
  });

  it('should render text as gray block', () => {
    const input = `
      project "Test" {
        screen Main {
          layout stack {
            component Text content: "Some content"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const renderer = new SkeletonSVGRenderer(ir, layout);
    const svg = renderer.render();

    expect(svg).not.toContain('>Some content<');
    expect(svg).toMatch(/<rect[^>]*fill="[^"]*"/);
  });

  it('should render wrapped text as multiple skeleton blocks', () => {
    const input = `
      project "Test" {
        style {
          device: "mobile"
        }
        screen Main {
          layout stack {
            component Text content: "This is a very long text content that should wrap into multiple lines in skeleton mode before reaching the viewport edge"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const renderer = new SkeletonSVGRenderer(ir, layout);
    const svg = renderer.render();

    expect(svg).not.toContain('This is a very long text content');
    expect((svg.match(/<rect /g) || []).length).toBeGreaterThan(2);
  });

  it('should render alert title/text as wrapped skeleton blocks', () => {
    const input = `
      project "Test" {
        style {
          device: "mobile"
        }
        screen Main {
          layout stack {
            component Alert variant: "warning" title: "Very important warning title that must wrap" text: "This alert body should also wrap and render multiple placeholder rows in skeleton mode"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const renderer = new SkeletonSVGRenderer(ir, layout);
    const svg = renderer.render();

    expect(svg).not.toContain('Very important warning');
    expect(svg).not.toContain('This alert body should also wrap');
    expect((svg.match(/<rect /g) || []).length).toBeGreaterThan(4);
  });

  it('should render link as skeleton placeholder and underline with variant tint', () => {
    const input = `
      project "Test" {
        screen Main {
          layout stack {
            component Link text: "Delete account" variant: "danger"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const renderer = new SkeletonSVGRenderer(ir, layout);
    const svg = renderer.render();

    expect(svg).not.toContain('>Delete account<');
    expect(svg).toContain('<line');
    expect(svg).toContain('rgba(239, 68, 68, 0.55)');
  });

  it('should hide icons', () => {
    const input = `
      project "Test" {
        screen Main {
          layout stack {
            component Icon type: "user"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const renderer = new SkeletonSVGRenderer(ir, layout);
    const svg = renderer.render();

    // Icon should not appear
    expect(svg).not.toContain('viewBox="0 0 24 24"');
  });

  it('should render form inputs without text', () => {
    const input = `
      project "Test" {
        screen Main {
          layout card {
            component Input placeholder: "Enter text"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const renderer = new SkeletonSVGRenderer(ir, layout);
    const svg = renderer.render();

    // Input should render as shape only (no placeholder text)
    expect(svg).toContain('<rect');  // Input box
    expect(svg).not.toContain('>Enter text<');  // Placeholder text should not appear
  });
});
