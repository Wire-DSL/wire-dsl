import { describe, it, expect } from 'vitest';
import { parseWireDSLWithSourceMap } from '../parser/index';
import { SourceMapResolver } from './resolver';

describe('SourceMap Theme Support', () => {
  it('should capture theme block in SourceMap', () => {
    const code = `
      project "Test" {
        theme {
          density: "compact"
          spacing: "lg"
          radius: "md"
        }
        
        screen Main {
          layout stack {
            component Button text: "Click"
          }
        }
      }
    `;

    const { ast, sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    // Theme should be in SourceMap
    const themeNode = resolver.getNodeById('theme');
    expect(themeNode).toBeDefined();
    expect(themeNode?.type).toBe('theme');
    expect(themeNode?.parentId).toBe('project');
  });

  it('should capture theme properties with ranges', () => {
    const code = `
      project "Test" {
        theme {
          density: "compact"
          spacing: "md"
          radius: "lg"
          stroke: "thin"
          font: "base"
        }
        
        screen Main {
          layout stack {
            component Heading text: "Title"
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    const themeNode = resolver.getNodeById('theme');
    expect(themeNode).toBeDefined();

    // Check properties exist
    const properties = themeNode?.properties || {};
    expect(Object.keys(properties)).toContain('density');
    expect(Object.keys(properties)).toContain('spacing');
    expect(Object.keys(properties)).toContain('radius');
    expect(Object.keys(properties)).toContain('stroke');
    expect(Object.keys(properties)).toContain('font');

    // Check property values
    expect(properties.density?.value).toBe('compact');
    expect(properties.spacing?.value).toBe('md');
    expect(properties.radius?.value).toBe('lg');
    expect(properties.stroke?.value).toBe('thin');
    expect(properties.font?.value).toBe('base');

    // Check ranges exist
    expect(properties.density?.range).toBeDefined();
    expect(properties.density?.nameRange).toBeDefined();
    expect(properties.density?.valueRange).toBeDefined();
  });

  it('should allow clicking theme in canvas to jump to code', () => {
    const code = `project "Dashboard" {
  theme {
    density: "normal"
    spacing: "md"
  }
  screen Home {
    layout stack {
      component Button text: "Home"
    }
  }
}`;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    // Simulate: User clicks "Theme Settings" button in canvas
    const themeNode = resolver.getNodeById('theme');
    expect(themeNode).toBeDefined();

    // Should be able to get range for jump-to-code
    expect(themeNode?.range.start.line).toBe(2); // Line with "theme {"
    expect(themeNode?.range.end.line).toBe(5);   // Line with "}"
  });

  it('should allow editing theme property values', () => {
    const code = `
      project "App" {
        theme {
          density: "compact"
          spacing: "sm"
        }
        screen Main {
          layout stack {
            component Text text: "Hello"
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    const themeNode = resolver.getNodeById('theme');
    const densityProp = themeNode?.properties?.density;

    expect(densityProp).toBeDefined();
    
    // Can get exact range of the value "compact" for replacement
    expect(densityProp?.valueRange).toBeDefined();
    expect(densityProp?.value).toBe('compact');

    // Simulate editor replacing "compact" with "normal"
    const startLine = densityProp!.valueRange.start.line;
    const startCol = densityProp!.valueRange.start.column;
    const endLine = densityProp!.valueRange.end.line;
    const endCol = densityProp!.valueRange.end.column;

    expect(startLine).toBeGreaterThan(0);
    expect(startCol).toBeGreaterThanOrEqual(0);
    expect(endLine).toBe(startLine); // Single line
  });

  it('should handle project without theme block', () => {
    const code = `
      project "Minimal" {
        screen Main {
          layout stack {
            component Button text: "Click"
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    // Theme should not exist
    const themeNode = resolver.getNodeById('theme');
    expect(themeNode).toBeNull();

    // Project should still exist
    const projectNode = resolver.getNodeById('project');
    expect(projectNode).toBeDefined();
  });

  it('should include theme in hierarchy navigation', () => {
    const code = `
      project "Test" {
        theme {
          density: "normal"
        }
        screen Main {
          layout stack {
            component Button text: "A"
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    const projectNode = resolver.getNodeById('project');
    const children = resolver.getChildren(projectNode!.nodeId);

    // Project should have theme and screen as children
    const childTypes = children.map(c => c.type);
    expect(childTypes).toContain('theme');
    expect(childTypes).toContain('screen');
  });

  it('should include theme in statistics', () => {
    const code = `
      project "Dashboard" {
        theme {
          density: "compact"
          spacing: "md"
        }
        screen Analytics {
          layout stack {
            component StatCard title: "Users" value: "1234"
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    const stats = resolver.getStats();
    
    // Should have theme node
    expect(stats.byType.theme).toBe(1);
    expect(stats.totalNodes).toBeGreaterThan(3); // project + theme + screen + layout + component
  });

  it('should handle line-by-line property positioning', () => {
    const code = `project "App" {
  theme {
    density: "compact"
    spacing: "md"
    radius: "lg"
  }
  screen Main {
    layout stack {}
  }
}`;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    const themeNode = resolver.getNodeById('theme');
    const props = themeNode?.properties || {};

    // Each property should be on a different line
    expect(props.density?.range.start.line).toBe(3);
    expect(props.spacing?.range.start.line).toBe(4);
    expect(props.radius?.range.start.line).toBe(5);
  });
});
