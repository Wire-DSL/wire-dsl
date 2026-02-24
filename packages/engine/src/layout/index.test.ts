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

  it('should scale stack gap with density for same token', () => {
    const compactInput = `
      project "GapCompact" {
        style { density: "compact" }
        screen Main {
          layout stack(direction: vertical, gap: md) {
            component Button text: "First"
            component Button text: "Second"
          }
        }
      }
    `;
    const comfortableInput = `
      project "GapComfortable" {
        style { density: "comfortable" }
        screen Main {
          layout stack(direction: vertical, gap: md) {
            component Button text: "First"
            component Button text: "Second"
          }
        }
      }
    `;

    const compactIr = generateIR(parseWireDSL(compactInput));
    const comfortableIr = generateIR(parseWireDSL(comfortableInput));
    const compactLayout = calculateLayout(compactIr);
    const comfortableLayout = calculateLayout(comfortableIr);

    const compactComponents = Object.entries(compactIr.project.nodes)
      .filter(([_, node]) => node.kind === 'component')
      .map(([id]) => compactLayout[id]);
    const comfortableComponents = Object.entries(comfortableIr.project.nodes)
      .filter(([_, node]) => node.kind === 'component')
      .map(([id]) => comfortableLayout[id]);

    const compactGap = compactComponents[1].y - (compactComponents[0].y + compactComponents[0].height);
    const comfortableGap = comfortableComponents[1].y - (comfortableComponents[0].y + comfortableComponents[0].height);

    expect(compactGap).toBeLessThan(comfortableGap);
  });

  it('should scale intrinsic Button width with density in natural horizontal layout', () => {
    const compactInput = `
      project "ButtonWidthCompact" {
        style { density: "compact" }
        screen Main {
          layout stack(direction: horizontal, justify: start, gap: md) {
            component Button text: "Notification preferences center"
            component Button text: "Secondary"
          }
        }
      }
    `;
    const comfortableInput = `
      project "ButtonWidthComfortable" {
        style { density: "comfortable" }
        screen Main {
          layout stack(direction: horizontal, justify: start, gap: md) {
            component Button text: "Notification preferences center"
            component Button text: "Secondary"
          }
        }
      }
    `;

    const compactIr = generateIR(parseWireDSL(compactInput));
    const comfortableIr = generateIR(parseWireDSL(comfortableInput));
    const compactLayout = calculateLayout(compactIr);
    const comfortableLayout = calculateLayout(comfortableIr);

    const compactButton = Object.entries(compactIr.project.nodes).find(
      ([_, n]) => n.kind === 'component' && n.componentType === 'Button'
    );
    const comfortableButton = Object.entries(comfortableIr.project.nodes).find(
      ([_, n]) => n.kind === 'component' && n.componentType === 'Button'
    );

    expect(compactButton).toBeDefined();
    expect(comfortableButton).toBeDefined();
    expect(compactLayout[compactButton![0]].width).toBeLessThan(
      comfortableLayout[comfortableButton![0]].width
    );
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

  it('should make block Button consume remaining width in horizontal natural stack', () => {
    const input = `
      project "ButtonBlockHorizontal" {
        screen Main {
          layout stack(direction: horizontal, justify: start, gap: md, padding: md) {
            component Button text: "Continue" block: true
            component Button text: "Cancel"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const stackEntry = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'container' && node.containerType === 'stack'
    );
    const buttons = Object.entries(ir.project.nodes)
      .filter(([_, node]) => node.kind === 'component' && node.componentType === 'Button')
      .map(([id, node]) => ({ id, node, pos: layout[id] }))
      .sort((a, b) => a.pos.x - b.pos.x);

    expect(stackEntry).toBeDefined();
    expect(buttons).toHaveLength(2);
    expect(buttons[0].pos.width).toBeGreaterThan(buttons[1].pos.width);

    const occupiedWidth = buttons[1].pos.x + buttons[1].pos.width - buttons[0].pos.x;
    const stackInnerWidth = layout[stackEntry![0]].width - 32; // md padding on both sides
    expect(occupiedWidth).toBeCloseTo(stackInnerWidth, 5);
  });

  it('should calculate intrinsic width for Link based on text length', () => {
    const input = `
      project "LinkWidth" {
        screen Main {
          layout stack(direction: horizontal, justify: start, gap: md) {
            component Link text: "Short"
            component Link text: "This is a much longer link"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const links = Object.entries(ir.project.nodes)
      .filter(([_, node]) => node.kind === 'component' && node.componentType === 'Link')
      .map(([id]) => layout[id]);

    expect(links).toHaveLength(2);
    expect(links[1].width).toBeGreaterThan(links[0].width);
  });

  it('should add extra blank space with Separate in vertical stack', () => {
    const input = `
      project "SeparateSpacing" {
        screen Main {
          layout stack(direction: vertical, gap: md) {
            component Heading text: "Top"
            component Separate
            component Heading text: "Bottom"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const components = Object.entries(ir.project.nodes).flatMap(([id, node]) =>
      node.kind === 'component' ? [{ id, type: node.componentType, pos: layout[id] }] : []
    );

    const headings = components
      .filter((c) => c.type === 'Heading')
      .sort((a, b) => a.pos.y - b.pos.y);
    const top = headings[0];
    const separate = components.find((c) => c.type === 'Separate');
    const bottom = headings[1];

    expect(top).toBeDefined();
    expect(separate).toBeDefined();
    expect(bottom).toBeDefined();
    expect(separate!.pos.height).toBe(16);
    expect(bottom!.pos.y).toBe(top!.pos.y + top!.pos.height + 16 + 16 + 16);
  });

  it('should apply Separate size token values', () => {
    const input = `
      project "SeparateSizes" {
        screen Main {
          layout stack(direction: vertical, gap: md) {
            component Separate size: sm
            component Separate size: lg
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const separates = Object.entries(ir.project.nodes)
      .filter(([_, node]) => node.kind === 'component' && node.componentType === 'Separate')
      .map(([id]) => layout[id])
      .sort((a, b) => a.y - b.y);

    expect(separates).toHaveLength(2);
    expect(separates[0].height).toBe(8);
    expect(separates[1].height).toBe(24);
  });

  it('should scale Separate size with density', () => {
    const compactInput = `
      project "SeparateCompact" {
        style { density: "compact" }
        screen Main {
          layout stack {
            component Separate size: md
          }
        }
      }
    `;
    const comfortableInput = `
      project "SeparateComfortable" {
        style { density: "comfortable" }
        screen Main {
          layout stack {
            component Separate size: md
          }
        }
      }
    `;

    const compactLayout = calculateLayout(generateIR(parseWireDSL(compactInput)));
    const comfortableLayout = calculateLayout(generateIR(parseWireDSL(comfortableInput)));

    const compactAlert = Object.entries(generateIR(parseWireDSL(compactInput)).project.nodes)
      .find(([_, n]) => n.kind === 'component' && n.componentType === 'Separate');
    const comfortableAlert = Object.entries(generateIR(parseWireDSL(comfortableInput)).project.nodes)
      .find(([_, n]) => n.kind === 'component' && n.componentType === 'Separate');

    expect(compactAlert).toBeDefined();
    expect(comfortableAlert).toBeDefined();
    expect(compactLayout[compactAlert![0]].height).toBeLessThan(comfortableLayout[comfortableAlert![0]].height);
  });

  it('should scale IconButton size with density', () => {
    const compactInput = `
      project "IconBtnCompact" {
        style { density: "compact" }
        screen Main {
          layout stack(direction: horizontal, justify: start) {
            component IconButton icon: "menu" size: md
          }
        }
      }
    `;
    const comfortableInput = `
      project "IconBtnComfortable" {
        style { density: "comfortable" }
        screen Main {
          layout stack(direction: horizontal, justify: start) {
            component IconButton icon: "menu" size: md
          }
        }
      }
    `;

    const compactIr = generateIR(parseWireDSL(compactInput));
    const comfortableIr = generateIR(parseWireDSL(comfortableInput));
    const compactLayout = calculateLayout(compactIr);
    const comfortableLayout = calculateLayout(comfortableIr);

    const compactIconButton = Object.entries(compactIr.project.nodes)
      .find(([_, n]) => n.kind === 'component' && n.componentType === 'IconButton');
    const comfortableIconButton = Object.entries(comfortableIr.project.nodes)
      .find(([_, n]) => n.kind === 'component' && n.componentType === 'IconButton');

    expect(compactIconButton).toBeDefined();
    expect(comfortableIconButton).toBeDefined();
    expect(compactLayout[compactIconButton![0]].width).toBeLessThan(
      comfortableLayout[comfortableIconButton![0]].width
    );
  });

  it('should increase Alert height when text wraps', () => {
    const input = `
      project "AlertHeight" {
        style {
          device: "mobile"
        }
        screen Main {
          layout stack(direction: vertical, gap: md) {
            component Alert variant: "warning" title: "Warning" text: "This alert contains a very long message that should wrap and therefore increase the intrinsic component height"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const alertEntry = Object.entries(ir.project.nodes)
      .find(([_, node]) => node.kind === 'component' && node.componentType === 'Alert');
    expect(alertEntry).toBeDefined();

    const alertPos = layout[alertEntry![0]];
    expect(alertPos.height).toBeGreaterThan(40);
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
        style {
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

    // Comfortable density: Button uses action control height (md = 40px)
    expect(button.height).toBe(40);
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

  it('should use default intrinsic height for Chart component', () => {
    const input = `
      project "ChartDefaultHeight" {
        screen Main {
          layout stack {
            component Chart type: "bar"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const chart = Object.entries(ir.project.nodes)
      .filter(([_, n]) => n.kind === 'component' && n.componentType === 'Chart')
      .map(([id]) => layout[id])[0];

    expect(chart.height).toBe(250);
  });

  it('should calculate split layout', () => {
    const input = `
      project "Split" {
        screen Main {
          layout split(left: 260, gap: md) {
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

    // First container (left fixed panel) should be 260px wide
    expect(containers[0].width).toBe(260);

    // Second container should be to the right
    expect(containers[1].x).toBeGreaterThan(containers[0].x);
  });

  it('should calculate split layout with fixed right panel', () => {
    const input = `
      project "SplitRight" {
        screen Main {
          layout split(right: 300, gap: md) {
            layout stack { component Heading text: "Main" }
            layout stack { component Heading text: "Right" }
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
    expect(containers[1].width).toBe(300);
    expect(containers[0].x).toBeLessThan(containers[1].x);
  });

  it('should handle complete dashboard example', () => {
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
        style {
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
        style {
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
        style {
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

  it('should reserve additional intrinsic height for labeled Input controls', () => {
    const input = `
      project "LabeledInputHeight" {
        screen Main {
          layout stack(direction: vertical, gap: md) {
            component Input placeholder: "No label"
            component Input label: "Email" placeholder: "user@example.com"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const inputPositions = Object.entries(ir.project.nodes)
      .filter(([_, node]) => node.kind === 'component' && node.componentType === 'Input')
      .map(([id]) => layout[id])
      .sort((a, b) => a.y - b.y);

    expect(inputPositions).toHaveLength(2);
    expect(inputPositions[1].height).toBeGreaterThan(inputPositions[0].height);
    expect(inputPositions[1].height - inputPositions[0].height).toBe(18);
  });

  it('should reserve extra bottom padding when Table footer is enabled', () => {
    const input = `
      project "TableFooterPaddingHeight" {
        screen Main {
          layout stack(direction: vertical, gap: sm) {
            component Table columns: "Name,Status" rows: 1
            component Table columns: "Name,Status" rows: 1 pagination: true pages: 3
            component Table columns: "Name,Status" rows: 1 caption: "Showing 1 - 1"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const tablePositions = Object.entries(ir.project.nodes)
      .filter(([_, node]) => node.kind === 'component' && node.componentType === 'Table')
      .map(([id]) => layout[id])
      .sort((a, b) => a.y - b.y);

    expect(tablePositions).toHaveLength(3);

    const plain = tablePositions[0];
    const withPagination = tablePositions[1];
    const withCaption = tablePositions[2];

    expect(withPagination.height - plain.height).toBe(60);
    expect(withCaption.height - plain.height).toBe(46);
  });

  it('should align control heights for Input/Select with Button/IconButton when actions use size lg + labelSpace', () => {
    const input = `
      project "ControlHeightAlignment" {
        screen Main {
          layout stack(direction: horizontal, justify: start, gap: sm) {
            component Input label: "Email" placeholder: "user@example.com" size: md
            component Select label: "Role" items: "Admin,User" size: md
            component Button text: "Save" size: lg labelSpace: true
            component IconButton icon: "check" size: lg labelSpace: true
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const inputPos = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'component' && node.componentType === 'Input'
    );
    const selectPos = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'component' && node.componentType === 'Select'
    );
    const buttonPos = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'component' && node.componentType === 'Button'
    );
    const iconButtonPos = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'component' && node.componentType === 'IconButton'
    );

    expect(inputPos).toBeDefined();
    expect(selectPos).toBeDefined();
    expect(buttonPos).toBeDefined();
    expect(iconButtonPos).toBeDefined();

    const inputHeight = layout[inputPos![0]].height;
    const selectHeight = layout[selectPos![0]].height;
    const buttonHeight = layout[buttonPos![0]].height;
    const iconButtonHeight = layout[iconButtonPos![0]].height;

    expect(inputHeight).toBe(selectHeight);
    expect(inputHeight).toBe(buttonHeight);
    expect(inputHeight).toBe(iconButtonHeight);
  });

  it('should keep default Button and Link heights aligned', () => {
    const input = `
      project "ButtonLinkHeightAlignment" {
        screen Main {
          layout stack(direction: horizontal, justify: start, gap: sm) {
            component Button text: "Save"
            component Link text: "Learn more"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const buttonPos = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'component' && node.componentType === 'Button'
    );
    const linkPos = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'component' && node.componentType === 'Link'
    );

    expect(buttonPos).toBeDefined();
    expect(linkPos).toBeDefined();
    expect(layout[buttonPos![0]].height).toBe(layout[linkPos![0]].height);
  });

  it('should increase Button width with padding without affecting control height', () => {
    const input = `
      project "ButtonPaddingSizing" {
        screen Main {
          layout stack(direction: horizontal, justify: start, gap: sm) {
            component Button text: "Save" size: md padding: none
            component Button text: "Save" size: md padding: xl
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const buttons = Object.entries(ir.project.nodes)
      .filter(([_, node]) => node.kind === 'component' && node.componentType === 'Button')
      .map(([id]) => layout[id])
      .sort((a, b) => a.x - b.x);

    expect(buttons).toHaveLength(2);
    expect(buttons[1].width).toBeGreaterThan(buttons[0].width);
    expect(buttons[1].height).toBe(buttons[0].height);
  });

  it('should layout grid with stat cards', () => {
    const input = `
      project "Dashboard" {
        style {
          spacing: "lg"
        }
        
        screen Analytics {
          layout stack(direction: vertical, gap: lg) {
            component Heading text: "Analytics"
            
            layout grid(columns: 3, gap: lg) {
              cell span: 1 {
                component Stat title: "Total Users" value: "2,543" color: "#3B82F6"
              }
              cell span: 1 {
                component Stat title: "Revenue" value: "$45.2K" color: "#10B981"
              }
              cell span: 1 {
                component Stat title: "Active Sessions" value: "856" color: "#F59E0B"
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

    const stats = Object.entries(ir.project.nodes)
      .filter(([_, n]) => n.kind === 'component' && n.componentType === 'Stat');

    expect(stats).toHaveLength(3);

    const positions = Object.values(layout);
    expect(positions.length).toBeGreaterThan(5);
  });

  it('should layout sidebar menu with proper dimensions', () => {
    const input = `
      project "AdminApp" {
        style {
          spacing: "md"
        }
        
        screen Dashboard {
          layout stack(direction: vertical, gap: md, padding: md) {
            component Heading text: "Menu"
            component SidebarMenu items: "Dashboard,Users,Roles,Settings" active: 0
            component Heading text: "Dashboard"
            component Text text: "Welcome to admin panel"
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

  it('should allocate SidebarMenu height based on items and avoid overlap', () => {
    const input = `
      project "Sidebar Menu Height" {
        style {
          spacing: "md"
        }

        screen Main {
          layout stack(direction: vertical, gap: md, padding: md) {
            component SidebarMenu items: "Dashboard,Users,Roles,Settings"
            component Heading text: "Content"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const menuEntry = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'component' && node.componentType === 'SidebarMenu'
    );
    const headingEntry = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'component' && node.componentType === 'Heading'
    );

    expect(menuEntry).toBeDefined();
    expect(headingEntry).toBeDefined();

    const menuPos = layout[menuEntry![0]];
    const headingPos = layout[headingEntry![0]];

    // 4 items * 40px
    expect(menuPos.height).toBe(160);
    // Next component should be below menu + md gap (16px)
    expect(headingPos.y).toBe(menuPos.y + menuPos.height + 16);
  });

  it('should wrap long Text content and push following components down', () => {
    const input = `
      project "Text Wrap" {
        style {
          spacing: "md"
          device: "mobile"
        }

        screen Main {
          layout stack(direction: vertical, gap: md, padding: md) {
            component Text text: "Este es un texto largo que debe hacer wrap automaticamente para no salirse del viewport ni pisar componentes siguientes en el layout."
            component Button text: "Siguiente"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const textEntry = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'component' && node.componentType === 'Text'
    );
    const buttonEntry = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'component' && node.componentType === 'Button'
    );

    expect(textEntry).toBeDefined();
    expect(buttonEntry).toBeDefined();

    const textPos = layout[textEntry![0]];
    const buttonPos = layout[buttonEntry![0]];

    // Should grow beyond the default component height (normal density = 40)
    expect(textPos.height).toBeGreaterThan(40);
    // Next component should be placed after wrapped text + stack gap (md = 16)
    expect(buttonPos.y).toBe(textPos.y + textPos.height + 16);
  });

  it('should size List height based on title and item count', () => {
    const input = `
      project "List Height" {
        screen Main {
          layout stack(direction: vertical, gap: md, padding: md) {
            component List title: "Technologies" items: "JavaScript,TypeScript,Python,Rust,Go,Swift"
            component Button text: "Next"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const listEntry = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'component' && node.componentType === 'List'
    );
    const buttonEntry = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'component' && node.componentType === 'Button'
    );

    expect(listEntry).toBeDefined();
    expect(buttonEntry).toBeDefined();

    const listPos = layout[listEntry![0]];
    const buttonPos = layout[buttonEntry![0]];

    // title (40) + 6 items * 36 = 256
    expect(listPos.height).toBe(256);
    expect(buttonPos.y).toBe(listPos.y + listPos.height + 16);
  });

  it('should wrap long Heading content and push following components down', () => {
    const input = `
      project "Heading Wrap" {
        style {
          spacing: "md"
        }

        screen Main {
          layout stack(direction: vertical, gap: md, padding: md) {
            component Heading text: "Este heading es suficientemente largo para requerir salto de linea automatico sin desbordar horizontalmente"
            component Button text: "Siguiente"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const headingEntry = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'component' && node.componentType === 'Heading'
    );
    const buttonEntry = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'component' && node.componentType === 'Button'
    );

    expect(headingEntry).toBeDefined();
    expect(buttonEntry).toBeDefined();

    const headingPos = layout[headingEntry![0]];
    const buttonPos = layout[buttonEntry![0]];

    expect(headingPos.height).toBeGreaterThan(40);
    expect(buttonPos.y).toBe(headingPos.y + headingPos.height + 16);
  });

  it('should use Heading level to compute larger height for larger titles', () => {
    const input = `
      project "Heading Levels Layout" {
        style {
          device: "mobile"
        }
        screen Main {
          layout stack(direction: vertical, gap: md, padding: md) {
            component Heading text: "Main title with enough content to wrap in mobile viewport" level: h1
            component Heading text: "Main title with enough content to wrap in mobile viewport" level: h4
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const headings = Object.entries(ir.project.nodes)
      .filter(([_, node]) => node.kind === 'component' && node.componentType === 'Heading')
      .map(([id]) => layout[id])
      .sort((a, b) => a.y - b.y);

    expect(headings).toHaveLength(2);
    expect(headings[0].height).toBeGreaterThan(headings[1].height);
    expect(headings[1].y).toBe(headings[0].y + headings[0].height + 16);
  });

  it('should allow Heading spacing override to reduce intrinsic vertical space', () => {
    const input = `
      project "Heading Spacing" {
        screen Main {
          layout stack(direction: vertical, gap: md) {
            component Heading text: "Default heading"
            component Heading text: "Compact heading" spacing: none
            component Button text: "After heading"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const headingEntries = Object.entries(ir.project.nodes)
      .filter(([_, node]) => node.kind === 'component' && node.componentType === 'Heading')
      .map(([id]) => layout[id])
      .sort((a, b) => a.y - b.y);
    const buttonEntry = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'component' && node.componentType === 'Button'
    );

    expect(headingEntries).toHaveLength(2);
    expect(buttonEntry).toBeDefined();

    const [defaultHeading, compactHeading] = headingEntries;
    const buttonPos = layout[buttonEntry![0]];

    expect(defaultHeading.height).toBe(40);
    expect(compactHeading.height).toBeLessThan(defaultHeading.height);
    expect(buttonPos.y).toBe(compactHeading.y + compactHeading.height + 16);
  });

  it('should avoid overlap between cards in single-column grid and next stack elements', () => {
    const input = `
      project "Mobile Grid No Overlap" {
        style {
          device: "mobile"
          density: "comfortable"
        }

        screen Home {
          layout stack(direction: vertical, gap: md, padding: md) {
            component Heading text: "Features"

            layout grid(columns: 1, gap: sm) {
              layout card(padding: md) {
                component Heading text: "Fast"
                component Text text: "Built for speed and performance on mobile devices."
              }

              layout card(padding: md) {
                component Heading text: "Simple"
                component Text text: "Intuitive interface designed for touch interactions."
              }

              layout card(padding: md) {
                component Heading text: "Secure"
                component Text text: "Your data is protected with industry-standard encryption."
              }
            }

            component Divider
            component Text text: "Mobile-optimized wireframe for touch devices"
          }
        }
      }
    `;

    const ast = parseWireDSL(input);
    const ir = generateIR(ast);
    const layout = calculateLayout(ir);

    const cards = Object.entries(ir.project.nodes)
      .filter(([_, node]) => node.kind === 'container' && node.containerType === 'card')
      .map(([id]) => layout[id])
      .sort((a, b) => a.y - b.y);

    expect(cards).toHaveLength(3);

    // comfortable density + sm gap => 10px effective gap (8 * 1.25).
    const expectedGridGap = 10;
    expect(cards[1].y).toBeGreaterThanOrEqual(cards[0].y + cards[0].height + expectedGridGap);
    expect(cards[2].y).toBeGreaterThanOrEqual(cards[1].y + cards[1].height + expectedGridGap);

    const gridEntry = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'container' && node.containerType === 'grid'
    );
    const dividerEntry = Object.entries(ir.project.nodes).find(
      ([_, node]) => node.kind === 'component' && node.componentType === 'Divider'
    );

    expect(gridEntry).toBeDefined();
    expect(dividerEntry).toBeDefined();

    const gridPos = layout[gridEntry![0]];
    const dividerPos = layout[dividerEntry![0]];

    // comfortable density + md stack gap => 20px effective gap (16 * 1.25).
    const expectedStackGap = 20;
    expect(dividerPos.y).toBeGreaterThanOrEqual(gridPos.y + gridPos.height + expectedStackGap);
  });

  describe('stack justify (main axis)', () => {
    it('justify: start positions children from left edge with natural widths', () => {
      const input = `
        project "JustifyStart" {
          screen Main {
            layout stack(direction: horizontal, justify: start, gap: sm) {
              component Button text: "A"
              component Button text: "B"
            }
          }
        }
      `;
      const ir = generateIR(parseWireDSL(input));
      const layout = calculateLayout(ir);
      const stack = Object.entries(ir.project.nodes).find(([_, n]) => n.kind === 'container')!;
      const buttons = Object.entries(ir.project.nodes)
        .filter(([_, n]) => n.kind === 'component')
        .map(([id]) => layout[id])
        .sort((a, b) => a.x - b.x);

      expect(buttons).toHaveLength(2);
      // First button anchored at stack left edge (x of stack)
      expect(buttons[0].x).toBe(layout[stack[0]].x);
      // Buttons use natural widths — total width is less than container
      expect(buttons[1].x + buttons[1].width).toBeLessThan(layout[stack[0]].x + layout[stack[0]].width);
    });

    it('justify: end positions children flush to right edge', () => {
      const input = `
        project "JustifyEnd" {
          screen Main {
            layout stack(direction: horizontal, justify: end, gap: sm) {
              component Button text: "Cancel"
              component Button text: "Save"
            }
          }
        }
      `;
      const ir = generateIR(parseWireDSL(input));
      const layout = calculateLayout(ir);
      const stack = Object.entries(ir.project.nodes).find(([_, n]) => n.kind === 'container')!;
      const buttons = Object.entries(ir.project.nodes)
        .filter(([_, n]) => n.kind === 'component')
        .map(([id]) => layout[id])
        .sort((a, b) => a.x - b.x);

      const stackRight = layout[stack[0]].x + layout[stack[0]].width;
      const lastButton = buttons[buttons.length - 1];
      // Last child's right edge should equal stack right edge
      expect(lastButton.x + lastButton.width).toBe(stackRight);
    });

    it('justify: center positions children in horizontal center', () => {
      const input = `
        project "JustifyCenter" {
          screen Main {
            layout stack(direction: horizontal, justify: center, gap: sm) {
              component Button text: "OK"
            }
          }
        }
      `;
      const ir = generateIR(parseWireDSL(input));
      const layout = calculateLayout(ir);
      const stack = Object.entries(ir.project.nodes).find(([_, n]) => n.kind === 'container')!;
      const button = Object.entries(ir.project.nodes)
        .find(([_, n]) => n.kind === 'component')!;

      const stackMidX = layout[stack[0]].x + layout[stack[0]].width / 2;
      const btnMidX = layout[button[0]].x + layout[button[0]].width / 2;
      expect(Math.round(btnMidX)).toBe(Math.round(stackMidX));
    });

    it('justify: spaceBetween spreads children to fill container - first at left, last at right', () => {
      const input = `
        project "JustifySpaceBetween" {
          screen Main {
            layout stack(direction: horizontal, justify: spaceBetween) {
              component Button text: "Cancel"
              component Button text: "Save"
            }
          }
        }
      `;
      const ir = generateIR(parseWireDSL(input));
      const layout = calculateLayout(ir);
      const stack = Object.entries(ir.project.nodes).find(([_, n]) => n.kind === 'container')!;
      const buttons = Object.entries(ir.project.nodes)
        .filter(([_, n]) => n.kind === 'component')
        .map(([id]) => layout[id])
        .sort((a, b) => a.x - b.x);

      const stackLeft = layout[stack[0]].x;
      const stackRight = layout[stack[0]].x + layout[stack[0]].width;
      // First child starts at left edge
      expect(buttons[0].x).toBe(stackLeft);
      // Last child ends at right edge
      expect(buttons[buttons.length - 1].x + buttons[buttons.length - 1].width).toBe(stackRight);
    });

    it('justify: spaceBetween with single child behaves like start', () => {
      const input = `
        project "SpaceBetweenSingle" {
          screen Main {
            layout stack(direction: horizontal, justify: spaceBetween) {
              component Button text: "Only"
            }
          }
        }
      `;
      const ir = generateIR(parseWireDSL(input));
      const layout = calculateLayout(ir);
      const stack = Object.entries(ir.project.nodes).find(([_, n]) => n.kind === 'container')!;
      const button = Object.entries(ir.project.nodes)
        .find(([_, n]) => n.kind === 'component')!;

      // Single child: no gap to distribute, starts at left
      expect(layout[button[0]].x).toBe(layout[stack[0]].x);
    });

    it('justify: spaceAround distributes equal margins around each child', () => {
      const input = `
        project "JustifySpaceAround" {
          screen Main {
            layout stack(direction: horizontal, justify: spaceAround) {
              component Button text: "A"
              component Button text: "B"
            }
          }
        }
      `;
      const ir = generateIR(parseWireDSL(input));
      const layout = calculateLayout(ir);
      const stack = Object.entries(ir.project.nodes).find(([_, n]) => n.kind === 'container')!;
      const buttons = Object.entries(ir.project.nodes)
        .filter(([_, n]) => n.kind === 'component')
        .map(([id]) => layout[id])
        .sort((a, b) => a.x - b.x);

      const stackLeft = layout[stack[0]].x;
      const stackRight = layout[stack[0]].x + layout[stack[0]].width;
      const leftMargin = buttons[0].x - stackLeft;
      const rightMargin = stackRight - (buttons[1].x + buttons[1].width);
      // Left and right outer margins should be equal
      expect(leftMargin).toBeCloseTo(rightMargin, 0);
      // Each child has equal margin on both sides
      expect(leftMargin).toBeGreaterThan(0);
    });

    it('justify: stretch (default) gives all children equal widths', () => {
      const input = `
        project "JustifyStretch" {
          screen Main {
            layout stack(direction: horizontal, justify: stretch, gap: md) {
              component Button text: "A"
              component Button text: "B"
              component Button text: "C"
            }
          }
        }
      `;
      const ir = generateIR(parseWireDSL(input));
      const layout = calculateLayout(ir);
      const buttons = Object.entries(ir.project.nodes)
        .filter(([_, n]) => n.kind === 'component')
        .map(([id]) => layout[id]);

      expect(buttons).toHaveLength(3);
      expect(buttons[0].width).toBe(buttons[1].width);
      expect(buttons[1].width).toBe(buttons[2].width);
    });
  });

  describe('stack align (cross axis)', () => {
    it('align: start (default) - all children top-aligned in row', () => {
      const input = `
        project "AlignStart" {
          screen Main {
            layout stack(direction: horizontal, justify: start, align: start, gap: sm) {
              component Button text: "Tall" height: 80
              component Button text: "Short"
            }
          }
        }
      `;
      const ir = generateIR(parseWireDSL(input));
      const layout = calculateLayout(ir);
      const stack = Object.entries(ir.project.nodes).find(([_, n]) => n.kind === 'container')!;
      const children = Object.entries(ir.project.nodes)
        .filter(([_, n]) => n.kind === 'component')
        .map(([id]) => layout[id]);

      const stackY = layout[stack[0]].y;
      // Both children start at the top of the row
      children.forEach((c) => expect(c.y).toBe(stackY));
    });

    it('align: center - shorter child vertically centered within row height', () => {
      const input = `
        project "AlignCenter" {
          screen Main {
            layout stack(direction: horizontal, justify: start, align: center, gap: sm) {
              component Button text: "Tall" height: 80
              component Button text: "Short"
            }
          }
        }
      `;
      const ir = generateIR(parseWireDSL(input));
      const layout = calculateLayout(ir);
      const stack = Object.entries(ir.project.nodes).find(([_, n]) => n.kind === 'container')!;
      const components = Object.entries(ir.project.nodes)
        .filter(([_, n]) => n.kind === 'component')
        .map(([id]) => ({ id, ...layout[id] }))
        .sort((a, b) => a.height - b.height);

      const taller = components[components.length - 1];
      const shorter = components[0];
      const stackY = layout[stack[0]].y;
      const stackHeight = taller.height; // row height = max child height

      // Shorter child should not start at top
      expect(shorter.y).toBeGreaterThan(stackY);
      // Shorter child should be vertically centered
      const expectedY = stackY + Math.round((stackHeight - shorter.height) / 2);
      expect(shorter.y).toBe(expectedY);
    });

    it('align: end - shorter child bottom-aligned within row height', () => {
      const input = `
        project "AlignEnd" {
          screen Main {
            layout stack(direction: horizontal, justify: start, align: end, gap: sm) {
              component Button text: "Tall" height: 80
              component Button text: "Short"
            }
          }
        }
      `;
      const ir = generateIR(parseWireDSL(input));
      const layout = calculateLayout(ir);
      const stack = Object.entries(ir.project.nodes).find(([_, n]) => n.kind === 'container')!;
      const components = Object.entries(ir.project.nodes)
        .filter(([_, n]) => n.kind === 'component')
        .map(([id]) => ({ id, ...layout[id] }))
        .sort((a, b) => a.height - b.height);

      const taller = components[components.length - 1];
      const shorter = components[0];
      const stackY = layout[stack[0]].y;
      const stackHeight = taller.height;

      // Shorter child bottom edge should equal taller child bottom edge
      const expectedY = stackY + stackHeight - shorter.height;
      expect(shorter.y).toBe(expectedY);
      expect(shorter.y + shorter.height).toBe(taller.y + taller.height);
    });
  });
});
