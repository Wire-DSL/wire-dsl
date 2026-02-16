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

  it('should render Heading levels with different font sizes', () => {
    const input = `
      project "HeadingLevels" {
        screen Main {
          layout stack {
            component Heading text: "Main title" level: h1
            component Heading text: "Section title" level: h3
            component Heading text: "Small title" level: h6
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('font-size="28"');
    expect(svg).toContain('font-size="17"');
    expect(svg).toContain('font-size="11"');
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

  it('should keep Link underline tied to visible text width in wide containers', () => {
    const input = `
      project "LinkUnderlineWidth" {
        screen Main {
          layout stack(direction: horizontal, gap: md) {
            component Link text: "iii"
            component Link text: "another"
          }
        }
      }
    `;

    const { ast } = parseWireDSLWithSourceMap(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    const linkEntries = Object.entries(ir.project.nodes)
      .filter(([_, node]) => node.kind === 'component' && node.componentType === 'Link');

    expect(linkEntries.length).toBeGreaterThanOrEqual(1);

    const [firstLinkId, firstLinkNode] = linkEntries[0];
    const firstLinkPos = layout[firstLinkId];
    const nodeId = firstLinkNode.meta?.nodeId;
    expect(nodeId).toBeTruthy();

    const match = svg.match(
      new RegExp(`data-node-id="${nodeId}"[\\s\\S]*?<line[^>]*x1="([^"]+)"[^>]*x2="([^"]+)"`)
    );
    expect(match).toBeTruthy();
    const underlineWidth = Math.abs(Number(match![2]) - Number(match![1]));

    // Underline should not span the full component width for short text.
    expect(underlineWidth).toBeLessThan(firstLinkPos.width * 0.75);
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

    expect((svg.match(/<rect/g) || []).length).toBeGreaterThan(2);
    expect(svg).not.toContain('[BAR CHART]');
  });

  it('should render Chart component with line/bar/pie variants', () => {
    const input = `
      project "ChartVariants" {
        screen Main {
          layout stack {
            component Chart type: "bar" height: 220
            component Chart type: "line" height: 220
            component Chart type: "pie" height: 220
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('<polyline');
    expect(svg).toContain('<path');
  });

  it('should render line chart with upward trend and local fluctuations', () => {
    const input = `
      project "ChartLineTrend" {
        screen Main {
          layout stack {
            component Chart type: "line" height: 220
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    const pointsMatch = svg.match(/<polyline[^>]*points="([^"]+)"/);
    expect(pointsMatch).toBeTruthy();

    const yValues = pointsMatch![1]
      .trim()
      .split(/\s+/)
      .map((pair) => Number(pair.split(',')[1]))
      .filter((n) => !Number.isNaN(n));

    expect(yValues.length).toBeGreaterThan(3);
    expect(yValues[0]).toBeGreaterThan(yValues[yValues.length - 1]);

    const hasDip = yValues.slice(1).some((y, i) => y > yValues[i]);
    expect(hasDip).toBe(true);
  });

  it('should infer table mock data from column names when mock is not provided', () => {
    const input = `
      project "TableMockInference" {
        screen Main {
          layout stack {
            component Table columns: "User,City,Amount" rows: 3
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Juan');
    expect(svg).toContain('Buenos Aires');
    expect(svg).toContain('$5,000');
  });

  it('should use list mock type when items are not provided', () => {
    const input = `
      project "ListMock" {
        screen Main {
          layout stack {
            component List title: "Cities" itemsMock: 4 mock: "city"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Buenos Aires');
    expect(svg).toContain('Madrid');
  });

  it('should support custom mocks in Table and List', () => {
    const input = `
      project "CustomMocks" {
        mocks {
          city: "Rosario,Cordoba,Mendoza"
          team: "Falcons,Wolves,Tigers"
        }
        screen Main {
          layout stack {
            component Table columns: "City,Team" rows: 3 mock: "city,team"
            component List itemsMock: 3 mock: "team"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Rosario');
    expect(svg).toContain('Cordoba');
    expect(svg).toContain('Falcons');
    expect(svg).toContain('Wolves');
  });

  it('should remain deterministic for Table/List when random is not enabled', () => {
    const input = `
      project "DeterministicMocks" {
        screen Main {
          layout stack {
            component Table columns: "User,City,Amount" rows: 4
            component List itemsMock: 4 mock: "city"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svgA = renderToSVG(ir, layout);
    const svgB = renderToSVG(ir, layout);

    expect(svgA).toBe(svgB);
  });

  it('should vary Table/List data when random is true', () => {
    const input = `
      project "RandomMocks" {
        screen Main {
          layout stack {
            component Table columns: "User,City,Amount" rows: 6 random: true
            component List itemsMock: 6 mock: "city" random: true
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const outputs = [renderToSVG(ir, layout), renderToSVG(ir, layout), renderToSVG(ir, layout)];
    const unique = new Set(outputs);

    expect(unique.size).toBeGreaterThan(1);
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

  it('should render StatCard icon when provided', () => {
    const input = `
      project "StatCardIcon" {
        screen Main {
          layout stack {
            component StatCard title: "Users" value: "1,234" icon: "users"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Users');
    expect(svg).toContain('1,234');
    expect(svg).toContain('viewBox="0 0 24 24"');
    expect(svg).toContain('stroke-linecap="round"');
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

  it('should render Input label inside component vertical bounds', () => {
    const input = `
      project "InputLabelBounds" {
        screen Main {
          layout stack(direction: vertical, gap: md, padding: md) {
            component Input label: "Email" placeholder: "user@example.com"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    const inputEntry = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'component' && node.componentType === 'Input'
    );
    expect(inputEntry).toBeDefined();

    const inputPos = layout[inputEntry![0]];
    const labelMatch = svg.match(/<text x="[^"]+" y="([^"]+)"[^>]*>Email<\/text>/);
    const controlMatch = svg.match(
      /<text x="[^"]+" y="[^"]+"[^>]*>Email<\/text>\s*<rect x="[^"]+" y="([^"]+)"/
    );

    expect(labelMatch).toBeTruthy();
    expect(controlMatch).toBeTruthy();

    const labelY = Number(labelMatch![1]);
    const controlY = Number(controlMatch![1]);

    expect(labelY).toBeGreaterThanOrEqual(inputPos.y);
    expect(controlY).toBe(inputPos.y + 18);
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

  it('should not render Button wider than its layout width in narrow grid cells', () => {
    const input = `
      project "GridButtonClamp" {
        style {
          device: "mobile"
          density: "comfortable"
        }
        screen Main {
          layout grid(columns: 12, gap: sm) {
            cell span: 2 {
              component Button text: "Very long button label that should be truncated"
            }
          }
        }
      }
    `;

    const { ast } = parseWireDSLWithSourceMap(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);
    const buttonEntry = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'component' && node.componentType === 'Button'
    );

    expect(buttonEntry).toBeTruthy();
    const buttonNode = buttonEntry![1];
    const buttonPos = layout[buttonEntry![0]];
    const nodeId = buttonNode.meta?.nodeId;
    expect(nodeId).toBeTruthy();

    const match = svg.match(new RegExp(`data-node-id="${nodeId}"[\\s\\S]*?<rect[^>]*width="([^"]+)"`));
    expect(match).toBeTruthy();
    const renderedWidth = Number(match![1]);
    expect(renderedWidth).toBeLessThanOrEqual(buttonPos.width + 0.01);
  });

  it('should not truncate Button text in comfortable density when width is unconstrained', () => {
    const input = `
      project "ButtonNoTruncateComfortable" {
        style {
          density: "comfortable"
        }
        screen Main {
          layout stack(direction: horizontal, align: left, gap: md) {
            component Button text: "Notification preferences center"
            component Button text: "Secondary action"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Notification preferences center');
    expect(svg).not.toContain('Notification preferences ce...');
  });

  it('should not render Link wider than its layout width in narrow grid cells', () => {
    const input = `
      project "GridLinkClamp" {
        style {
          device: "mobile"
          density: "comfortable"
        }
        screen Main {
          layout grid(columns: 12, gap: sm) {
            cell span: 2 {
              component Link text: "Very long link label that should be truncated"
            }
          }
        }
      }
    `;

    const { ast } = parseWireDSLWithSourceMap(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);
    const linkEntry = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'component' && node.componentType === 'Link'
    );

    expect(linkEntry).toBeTruthy();
    const linkNode = linkEntry![1];
    const linkPos = layout[linkEntry![0]];
    const nodeId = linkNode.meta?.nodeId;
    expect(nodeId).toBeTruthy();

    const match = svg.match(new RegExp(`data-node-id="${nodeId}"[\\s\\S]*?<line[^>]*x1="([^"]+)"[^>]*x2="([^"]+)"`));
    expect(match).toBeTruthy();
    const x1 = Number(match![1]);
    const x2 = Number(match![2]);
    const renderedWidth = Math.abs(x2 - x1);
    expect(renderedWidth).toBeLessThanOrEqual(linkPos.width + 0.01);
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

  it('should render StatCard icon as a skeleton placeholder block', () => {
    const input = `
      project "Test" {
        screen Main {
          layout stack {
            component StatCard title: "Users" value: "1,234" icon: "users"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const renderer = new SkeletonSVGRenderer(ir, layout);
    const svg = renderer.render();

    expect(svg).not.toContain('Users');
    expect(svg).not.toContain('1,234');
    expect(svg).toContain('width="20" height="20"');
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
