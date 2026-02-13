import { describe, it, expect } from 'vitest';
import { parseWireDSL } from '../parser/index';
import { generateIR } from '../ir/index';
import { calculateLayout } from './index';

describe('Layout Engine', () => {
  it('should calculate basic stack layout', () => {
    const input = `
      project "Test" {
        screen Main {
          layout stack(direction: vertical, gap: md) {
            component Heading text: "Title"
            component Button text: "Click"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    // Should have positions for all nodes
    const nodeIds = Object.keys(ir.project.nodes);
    nodeIds.forEach((id) => {
      expect(layout[id]).toBeDefined();
      expect(layout[id].x).toBeGreaterThanOrEqual(0);
      expect(layout[id].y).toBeGreaterThanOrEqual(0);
      expect(layout[id].width).toBeGreaterThan(0);
      expect(layout[id].height).toBeGreaterThan(0);
    });
  });

  it('should stack vertically with correct spacing', () => {
    const input = `
      project "Vertical" {
        screen Main {
          layout stack(direction: vertical, gap: md) {
            component Button text: "First"
            component Button text: "Second"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    // Get component nodes (kind: component)
    const components = Object.entries(ir.project.nodes)
      .filter(([_, node]) => node.kind === 'component')
      .map(([id]) => layout[id]);

    // Second component should be below first
    expect(components[1].y).toBeGreaterThan(components[0].y);

    // Gap should be 16 (md = 16)
    const gap = components[1].y - (components[0].y + components[0].height);
    expect(gap).toBe(16);
  });

  it('should stack horizontally with correct spacing', () => {
    const input = `
      project "Horizontal" {
        screen Main {
          layout stack(direction: horizontal, gap: lg) {
            component Button text: "First"
            component Button text: "Second"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const components = Object.entries(ir.project.nodes)
      .filter(([_, node]) => node.kind === 'component')
      .map(([id]) => layout[id]);

    // Second component should be to the right of first
    expect(components[1].x).toBeGreaterThan(components[0].x);

    // Gap should be 24 (lg = 24)
    const gap = components[1].x - (components[0].x + components[0].width);
    expect(gap).toBe(24);
  });

  it('should apply padding to containers', () => {
    const input = `
      project "Padding" {
        screen Main {
          layout stack(padding: xl) {
            component Button text: "Inside"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const container = Object.entries(ir.project.nodes)
      .filter(([_, node]) => node.kind === 'container')
      .map(([id]) => layout[id])[0];

    const component = Object.entries(ir.project.nodes)
      .filter(([_, node]) => node.kind === 'component')
      .map(([id]) => layout[id])[0];

    // Component should be offset by padding (xl = 32)
    expect(component.x).toBe(container.x + 32);
    expect(component.y).toBe(container.y + 32);
  });

  it('should calculate grid layout with 12 columns', () => {
    const input = `
      project "Grid" {
        screen Main {
          layout grid(columns: 12, gap: md) {
            cell span: 4 {
              component Card title: "A"
            }
            cell span: 4 {
              component Card title: "B"
            }
            cell span: 4 {
              component Card title: "C"
            }
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    // Get cells (containers with source: cell)
    const cells = Object.entries(ir.project.nodes)
      .filter(([_, node]) => node.kind === 'container' && node.meta?.source === 'cell')
      .map(([id]) => layout[id]);

    expect(cells).toHaveLength(3);

    // All cells should be on same row (same y)
    expect(cells[0].y).toBe(cells[1].y);
    expect(cells[1].y).toBe(cells[2].y);

    // Each cell should span 4 columns (33.33% of grid width minus gaps)
    // Second cell should be to right of first
    expect(cells[1].x).toBeGreaterThan(cells[0].x);
    expect(cells[2].x).toBeGreaterThan(cells[1].x);
  });

  it('should wrap grid cells to next row', () => {
    const input = `
      project "GridWrap" {
        screen Main {
          layout grid(columns: 12, gap: md) {
            cell span: 6 {
              component Card title: "1"
            }
            cell span: 6 {
              component Card title: "2"
            }
            cell span: 6 {
              component Card title: "3"
            }
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const cells = Object.entries(ir.project.nodes)
      .filter(([_, node]) => node.kind === 'container' && node.meta?.source === 'cell')
      .map(([id]) => layout[id]);

    // First two cells on same row
    expect(cells[0].y).toBe(cells[1].y);

    // Third cell on next row
    expect(cells[2].y).toBeGreaterThan(cells[0].y);
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
    const layout = calculateLayout(ir);

    // All nodes should have positions
    const allNodes = Object.keys(ir.project.nodes);
    allNodes.forEach((id) => {
      expect(layout[id]).toBeDefined();
    });

    // Grid should be below heading
    const heading = Object.entries(ir.project.nodes)
      .filter(([_, n]) => n.kind === 'component' && n.componentType === 'Heading')
      .map(([id]) => layout[id])[0];

    const grid = Object.entries(ir.project.nodes)
      .filter(([_, n]) => n.kind === 'container' && n.containerType === 'grid')
      .map(([id]) => layout[id])[0];

    expect(grid.y).toBeGreaterThan(heading.y);
  });

  it('should respect component density from config', () => {
    const input = `
      project "Density" {
        config {
          density: "comfortable"
        }
        
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

    const button = Object.entries(ir.project.nodes)
      .filter(([_, n]) => n.kind === 'component')
      .map(([id]) => layout[id])[0];

    // Comfortable density = 48px height
    expect(button.height).toBe(48);
  });

  it('should use custom component dimensions', () => {
    const input = `
      project "Custom" {
        screen Main {
          layout stack {
            component ChartPlaceholder height: 300 width: 600
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const chart = Object.entries(ir.project.nodes)
      .filter(([_, n]) => n.kind === 'component')
      .map(([id]) => layout[id])[0];

    expect(chart.height).toBe(300);
    expect(chart.width).toBe(600);
  });

  it('should calculate split layout', () => {
    const input = `
      project "Split" {
        screen Main {
          layout split(sidebar: 260, gap: md) {
            layout stack {
              component Button text: "Sidebar"
            }
            layout stack {
              component Heading text: "Content"
            }
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const containers = Object.entries(ir.project.nodes)
      .filter(([_, n]) => n.kind === 'container' && n.containerType === 'stack')
      .map(([id]) => layout[id]);

    expect(containers).toHaveLength(2);

    // First container (sidebar) should be 260px wide
    expect(containers[0].width).toBe(260);

    // Second container should be to the right
    expect(containers[1].x).toBeGreaterThan(containers[0].x);
  });

  it('should handle complete dashboard example', () => {
    const input = `
      project "Dashboard" {
        config {
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
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    // All nodes should have valid positions
    const positions = Object.values(layout);
    expect(positions.length).toBeGreaterThan(5);
    
    positions.forEach((pos) => {
      expect(pos.x).toBeGreaterThanOrEqual(0);
      expect(pos.y).toBeGreaterThanOrEqual(0);
      expect(pos.width).toBeGreaterThan(0);
      expect(pos.height).toBeGreaterThan(0);
    });
  });

  it('should layout split layout with sidebar', () => {
    const input = `
      project "SidebarLayout" {
        config {
          spacing: "md"
        }
        
        screen Dashboard {
          layout stack(direction: vertical, gap: md) {
            component Heading text: "Menu"
            component Button text: "Item 1"
            component Button text: "Item 2"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    // Verify layout was calculated
    expect(ir.project.screens).toHaveLength(1);
    const positions = Object.values(layout);
    expect(positions.length).toBeGreaterThan(0);
    
    positions.forEach((pos) => {
      expect(pos.width).toBeGreaterThan(0);
      expect(pos.height).toBeGreaterThan(0);
    });
  });

  it('should layout card with padding and border', () => {
    const input = `
      project "CardLayout" {
        config {
          spacing: "lg"
        }
        
        screen Settings {
          layout stack(direction: vertical, gap: lg, padding: xl) {
            component Heading text: "Settings"
            component Input label: "Email" placeholder: "user@example.com"
            component Button text: "Save"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    // Verify all nodes have valid positions
    const positions = Object.values(layout);
    expect(positions.length).toBeGreaterThan(0);

    positions.forEach((pos) => {
      expect(pos.x).toBeGreaterThanOrEqual(0);
      expect(pos.y).toBeGreaterThanOrEqual(0);
      expect(pos.width).toBeGreaterThan(0);
      expect(pos.height).toBeGreaterThan(0);
    });
  });

  it('should layout form components with proper spacing', () => {
    const input = `
      project "FormLayout" {
        config {
          spacing: "md"
        }
        
        screen Form {
          layout stack(direction: vertical, gap: md, padding: lg) {
            component Heading text: "User Registration"
            
            component Input label: "Full Name" placeholder: "John Doe"
            component Input label: "Email" placeholder: "john@example.com"
            component Textarea label: "Bio" rows: 4 placeholder: "Tell us about yourself..."
            component Select label: "Country" items: "USA,Canada,Mexico,UK"
            
            layout stack(direction: vertical, gap: sm) {
              component Checkbox label: "Subscribe to newsletter"
              component Checkbox label: "Enable notifications"
            }
            
            component Button text: "Register"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const inputs = Object.entries(ir.project.nodes)
      .filter(([_, n]) => n.kind === 'component' && n.componentType === 'Input');

    expect(inputs.length).toBeGreaterThanOrEqual(2);

    const positions = Object.values(layout);
    positions.forEach((pos) => {
      expect(pos.height).toBeGreaterThan(0);
      expect(pos.width).toBeGreaterThan(0);
    });
  });

  it('should layout grid with stat cards', () => {
    const input = `
      project "Dashboard" {
        config {
          spacing: "lg"
        }
        
        screen Analytics {
          layout stack(direction: vertical, gap: lg) {
            component Heading text: "Analytics"
            
            layout grid(columns: 3, gap: lg) {
              cell span: 1 {
                component StatCard title: "Total Users" value: "2,543" color: "#3B82F6"
              }
              cell span: 1 {
                component StatCard title: "Revenue" value: "$45.2K" color: "#10B981"
              }
              cell span: 1 {
                component StatCard title: "Active Sessions" value: "856" color: "#F59E0B"
              }
            }
            
            component ChartPlaceholder type: "line" height: 400
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const statCards = Object.entries(ir.project.nodes)
      .filter(([_, n]) => n.kind === 'component' && n.componentType === 'StatCard');

    expect(statCards).toHaveLength(3);

    const positions = Object.values(layout);
    expect(positions.length).toBeGreaterThan(5);
  });

  it('should layout sidebar menu with proper dimensions', () => {
    const input = `
      project "AdminApp" {
        config {
          spacing: "md"
        }
        
        screen Dashboard {
          layout stack(direction: vertical, gap: md, padding: md) {
            component Heading text: "Menu"
            component SidebarMenu items: "Dashboard,Users,Roles,Settings" active: 0
            component Heading text: "Dashboard"
            component Text content: "Welcome to admin panel"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    // Verify screen exists
    expect(ir.project.screens).toHaveLength(1);

    // Verify SidebarMenu component was created
    const sidebarMenu = Object.entries(ir.project.nodes)
      .find(([_, n]) => n.kind === 'component' && n.componentType === 'SidebarMenu');

    expect(sidebarMenu).toBeDefined();

    const positions = Object.values(layout);
    positions.forEach((pos) => {
      expect(pos.width).toBeGreaterThan(0);
      expect(pos.height).toBeGreaterThan(0);
    });
  });
});
