import { describe, it, expect } from 'vitest';
import { parseWireDSL } from '../parser/index';
import { generateIR } from '../ir/index';
import { calculateLayout } from '../layout/index';
import { renderToSVG } from './index';

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
    expect(svg).toContain('#3B82F6'); // Primary blue color
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
            component Card title: "Total Users"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);
    const svg = renderToSVG(ir, layout);

    expect(svg).toContain('Total Users');
    expect(svg).toContain('1,234'); // Mock number
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
        tokens spacing: lg
        
        screen Main {
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
});
