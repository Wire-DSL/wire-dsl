import { describe, it, expect } from 'vitest';
import { parseWireDSLWithSourceMap } from '../parser/index';
import { SourceMapResolver } from './resolver';

describe('SourceMap Performance', () => {
  // Helper to generate large wireframes
  function generateLargeWireframe(componentCount: number): string {
    const components = [];
    for (let i = 0; i < componentCount; i++) {
      const type = ['Button', 'Input', 'Heading', 'Text', 'Label'][i % 5];
      components.push(`      component ${type} text: "Item ${i}"`);
    }

    return `
      project "Performance Test" {
        screen Main {
          layout stack(gap: md) {
${components.join('\n')}
          }
        }
      }
    `;
  }

  describe('Parsing Performance', () => {
    it('should parse small wireframes quickly (< 50ms)', () => {
      const code = generateLargeWireframe(10);

      const start = performance.now();
      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const end = performance.now();

      expect(sourceMap.length).toBeGreaterThan(0);
      expect(end - start).toBeLessThan(50);
    });

    it('should parse medium wireframes efficiently (< 200ms)', () => {
      const code = generateLargeWireframe(100);

      const start = performance.now();
      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const end = performance.now();

      expect(sourceMap.length).toBeGreaterThan(100);
      expect(end - start).toBeLessThan(200);
    });

    it('should parse large wireframes acceptably (< 500ms)', () => {
      const code = generateLargeWireframe(500);

      const start = performance.now();
      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const end = performance.now();

      expect(sourceMap.length).toBeGreaterThan(500);
      expect(end - start).toBeLessThan(500);
    });
  });

  describe('Resolver Construction Performance', () => {
    it('should build resolver quickly for small maps (< 10ms)', () => {
      const code = generateLargeWireframe(10);
      const { sourceMap } = parseWireDSLWithSourceMap(code);

      const start = performance.now();
      const resolver = new SourceMapResolver(sourceMap);
      const end = performance.now();

      expect(resolver).toBeDefined();
      expect(end - start).toBeLessThan(10);
    });

    it('should build resolver efficiently for large maps (< 50ms)', () => {
      const code = generateLargeWireframe(500);
      const { sourceMap } = parseWireDSLWithSourceMap(code);

      const start = performance.now();
      const resolver = new SourceMapResolver(sourceMap);
      const end = performance.now();

      expect(resolver).toBeDefined();
      expect(end - start).toBeLessThan(50);
    });
  });

  describe('Query Performance', () => {
    it('should perform getNodeById in O(1) time', () => {
      const code = generateLargeWireframe(500);
      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      // Warm up
      resolver.getNodeById('component-button-0');

      // Benchmark 1000 lookups
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        resolver.getNodeById('component-button-100');
      }
      const end = performance.now();

      const avgTime = (end - start) / 1000;
      expect(avgTime).toBeLessThan(0.1); // < 0.1ms per lookup
    });

    it('should perform getNodeByPosition efficiently', () => {
      const code = generateLargeWireframe(500);
      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      // Warm up
      resolver.getNodeByPosition(10, 10);

      // Benchmark 100 lookups (position search is O(n) but should be fast)
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        resolver.getNodeByPosition(50, 10);
      }
      const end = performance.now();

      const avgTime = (end - start) / 100;
      expect(avgTime).toBeLessThan(5); // < 5ms per lookup even for 500 components
    });

    it('should perform getChildren in O(1) time', () => {
      const code = generateLargeWireframe(500);
      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      // Warm up
      resolver.getChildren('layout-stack-0');

      // Benchmark 1000 lookups
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        resolver.getChildren('layout-stack-0');
      }
      const end = performance.now();

      const avgTime = (end - start) / 1000;
      expect(avgTime).toBeLessThan(0.1); // < 0.1ms per lookup
    });

    it('should perform getParent in O(1) time', () => {
      const code = generateLargeWireframe(500);
      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);

      // Warm up
      resolver.getParent('component-button-0');

      // Benchmark 1000 lookups
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        resolver.getParent('component-button-100');
      }
      const end = performance.now();

      const avgTime = (end - start) / 1000;
      expect(avgTime).toBeLessThan(0.1); // < 0.1ms per lookup
    });
  });

  describe('Memory Overhead', () => {
    it('should have minimal memory footprint', () => {
      const code = generateLargeWireframe(100);
      const { sourceMap } = parseWireDSLWithSourceMap(code);

      const sourceMapSize = JSON.stringify(sourceMap).length;
      const codeSize = code.length;

      // SourceMap should be reasonable size compared to code
      // Phase 2 & 3 added: isUserDefined, insertionPoint, keywordRange, nameRange, bodyRange
      // This increased size slightly but provides full editing capabilities
      expect(sourceMapSize).toBeLessThan(codeSize * 25); // Increased from 20 to accommodate new features
    });

    it('should scale linearly with component count', () => {
      const small = generateLargeWireframe(10);
      const large = generateLargeWireframe(100);

      const { sourceMap: smallMap } = parseWireDSLWithSourceMap(small);
      const { sourceMap: largeMap } = parseWireDSLWithSourceMap(large);

      const smallSize = JSON.stringify(smallMap).length;
      const largeSize = JSON.stringify(largeMap).length;

      // Large should be roughly 10x small (allowing for some overhead)
      const ratio = largeSize / smallSize;
      expect(ratio).toBeGreaterThan(5);
      expect(ratio).toBeLessThan(15);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle typical dashboard (50 components) efficiently', () => {
      const code = `
        project "Dashboard" {
          config {
            density: "normal"
            spacing: "md"
          }
          
          screen Main {
            layout split(sidebar: 260, gap: md) {
              layout stack(gap: md, padding: lg) {
                component Heading text: "Navigation"
                component Button text: "Dashboard"
                component Button text: "Analytics"
                component Button text: "Reports"
                component Button text: "Settings"
              }
              
              layout stack(gap: lg, padding: lg) {
                component Topbar
                
                layout grid(columns: 12, gap: md) {
                  component StatCard title: "Users" value: "1,234" span: 3
                  component StatCard title: "Revenue" value: "$12.3K" span: 3
                  component StatCard title: "Active" value: "89%" span: 3
                  component StatCard title: "Growth" value: "+12%" span: 3
                }
                
                layout grid(columns: 12, gap: md) {
                  layout panel(padding: md) {
                    layout stack(gap: md) {
                      component Heading text: "Recent Activity"
                      component Table columns: "User,Action,Time" rows: 8
                    }
                  }
                  
                  layout panel(padding: md) {
                    layout stack(gap: md) {
                      component Heading text: "Quick Actions"
                      component Button text: "New User" variant: primary
                      component Button text: "Export Data"
                      component Button text: "Generate Report"
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const start = performance.now();
      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should be very fast
      expect(sourceMap.length).toBeGreaterThan(20);

      // Quick queries should be instant
      const queryStart = performance.now();
      resolver.getNodeById('component-button-0');
      resolver.getNodesByType('component', 'Button');
      resolver.getStats();
      const queryEnd = performance.now();

      expect(queryEnd - queryStart).toBeLessThan(5);
    });

    it('should handle form-heavy wireframe efficiently', () => {
      const inputComponents = [];
      for (let i = 0; i < 30; i++) {
        inputComponents.push(`        component Input label: "Field ${i}" placeholder: "Enter value"`);
      }

      const code = `
        project "Form" {
          screen Registration {
            layout stack(gap: md, padding: lg) {
              component Heading text: "Registration Form"
${inputComponents.join('\n')}
              layout stack(direction: horizontal, gap: md) {
                component Button text: "Submit" variant: primary
                component Button text: "Cancel" variant: secondary
              }
            }
          }
        }
      `;

      const start = performance.now();
      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);
      const end = performance.now();

      expect(end - start).toBeLessThan(100);
      
      const inputNodes = resolver.getNodesByType('component', 'Input');
      expect(inputNodes.length).toBe(30);
    });
  });

  describe('Stress Tests', () => {
    it('should handle deeply nested structures (20 levels)', () => {
      let code = 'project "Nested" { screen Main {';
      
      // Create 20 levels of nesting
      for (let i = 0; i < 20; i++) {
        code += 'layout stack {';
      }
      
      code += 'component Button text: "Deep"';
      
      for (let i = 0; i < 20; i++) {
        code += '}';
      }
      
      code += '}}';

      const start = performance.now();
      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);
      const end = performance.now();

      expect(end - start).toBeLessThan(100);

      const stats = resolver.getStats();
      expect(stats.maxDepth).toBeGreaterThanOrEqual(20);

      const button = resolver.getNodeById('component-button-0');
      const path = resolver.getPath(button!.nodeId);
      expect(path.length).toBeGreaterThan(20);
    });

    it('should handle wide structures (100 siblings)', () => {
      const components = [];
      for (let i = 0; i < 100; i++) {
        components.push(`      component Button text: "Button ${i}"`);
      }

      const code = `
        project "Wide" {
          screen Main {
            layout stack {
${components.join('\n')}
            }
          }
        }
      `;

      const start = performance.now();
      const { sourceMap } = parseWireDSLWithSourceMap(code);
      const resolver = new SourceMapResolver(sourceMap);
      const end = performance.now();

      expect(end - start).toBeLessThan(200);

      const button = resolver.getNodeById('component-button-50');
      const siblings = resolver.getSiblings(button!.nodeId);
      expect(siblings.length).toBe(99); // All siblings except itself
    });
  });
});
