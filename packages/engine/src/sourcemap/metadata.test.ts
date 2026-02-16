import { describe, it, expect } from 'vitest';
import { parseWireDSLWithSourceMap } from '../parser/index';
import { SourceMapResolver } from './resolver';

describe('SourceMap Mocks Support', () => {
  it('should capture mocks block in SourceMap', () => {
    const code = `
      project "Test" {
        mocks {
          status: "Pending,Active,Completed"
          priority: "Low,Medium,High"
        }
        
        screen Main {
          layout stack {
            component Select options: "status"
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    // Mocks should be in SourceMap
    const mocksNode = resolver.getNodeById('mocks');
    expect(mocksNode).toBeDefined();
    expect(mocksNode?.type).toBe('mocks');
    expect(mocksNode?.parentId).toBe('project');
  });

  it('should capture mocks properties with ranges', () => {
    const code = `
      project "App" {
        mocks {
          status: "Draft,Review,Published"
          category: "Tech,Design,Marketing"
          tags: "urgent,normal,low-priority"
        }
        
        screen Dashboard {
          layout stack {}
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    const mocksNode = resolver.getNodeById('mocks');
    expect(mocksNode).toBeDefined();

    // Check properties exist
    const properties = mocksNode?.properties || {};
    expect(Object.keys(properties)).toContain('status');
    expect(Object.keys(properties)).toContain('category');
    expect(Object.keys(properties)).toContain('tags');

    // Check property values
    expect(properties.status?.value).toBe('Draft,Review,Published');
    expect(properties.category?.value).toBe('Tech,Design,Marketing');
    expect(properties.tags?.value).toBe('urgent,normal,low-priority');

    // Check ranges exist
    expect(properties.status?.range).toBeDefined();
    expect(properties.status?.nameRange).toBeDefined();
    expect(properties.status?.valueRange).toBeDefined();
  });

  it('should handle project without mocks block', () => {
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

    // Mocks should not exist
    const mocksNode = resolver.getNodeById('mocks');
    expect(mocksNode).toBeNull();
  });

  it('should include mocks in hierarchy navigation', () => {
    const code = `
      project "Test" {
        mocks {
          status: "A,B,C"
        }
        screen Main {
          layout stack {}
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    const projectNode = resolver.getNodeById('project');
    const children = resolver.getChildren(projectNode!.nodeId);

    // Project should have mocks and screen as children
    const childTypes = children.map(c => c.type);
    expect(childTypes).toContain('mocks');
    expect(childTypes).toContain('screen');
  });
});

describe('SourceMap Colors Support', () => {
  it('should capture colors block in SourceMap', () => {
    const code = `
      project "Test" {
        colors {
          primary: #3B82F6
          secondary: #10B981
          accent: #F59E0B
        }
        
        screen Main {
          layout stack {
            component Button text: "Click" color: primary
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    // Colors should be in SourceMap
    const colorsNode = resolver.getNodeById('colors');
    expect(colorsNode).toBeDefined();
    expect(colorsNode?.type).toBe('colors');
    expect(colorsNode?.parentId).toBe('project');
  });

  it('should capture colors properties with hex values', () => {
    const code = `
      project "App" {
        colors {
          primary: #3B82F6
          secondary: #10B981
          danger: #EF4444
          warning: #F59E0B
          success: #22C55E
        }
        
        screen Main {
          layout stack {}
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    const colorsNode = resolver.getNodeById('colors');
    expect(colorsNode).toBeDefined();

    // Check properties exist
    const properties = colorsNode?.properties || {};
    expect(Object.keys(properties)).toContain('primary');
    expect(Object.keys(properties)).toContain('secondary');
    expect(Object.keys(properties)).toContain('danger');

    // Check property values (hex codes)
    expect(properties.primary?.value).toBe('#3B82F6');
    expect(properties.secondary?.value).toBe('#10B981');
    expect(properties.danger?.value).toBe('#EF4444');

    // Check ranges exist
    expect(properties.primary?.range).toBeDefined();
    expect(properties.primary?.nameRange).toBeDefined();
    expect(properties.primary?.valueRange).toBeDefined();
  });

  it('should capture colors properties with identifier values', () => {
    const code = `
      project "App" {
        colors {
          primary: blue
          secondary: green
          text: slate
        }
        
        screen Main {
          layout stack {}
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    const colorsNode = resolver.getNodeById('colors');
    const properties = colorsNode?.properties || {};

    // Check identifier values
    expect(properties.primary?.value).toBe('blue');
    expect(properties.secondary?.value).toBe('green');
    expect(properties.text?.value).toBe('slate');
  });

  it('should handle project without colors block', () => {
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

    // Colors should not exist
    const colorsNode = resolver.getNodeById('colors');
    expect(colorsNode).toBeNull();
  });

  it('should include colors in hierarchy navigation', () => {
    const code = `
      project "Test" {
        colors {
          primary: #3B82F6
        }
        screen Main {
          layout stack {}
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    const projectNode = resolver.getNodeById('project');
    const children = resolver.getChildren(projectNode!.nodeId);

    // Project should have colors and screen as children
    const childTypes = children.map(c => c.type);
    expect(childTypes).toContain('colors');
    expect(childTypes).toContain('screen');
  });
});

describe('SourceMap Combined Metadata Support', () => {
  it('should handle all metadata blocks together', () => {
    const code = `
      project "Complete App" {
        style {
          density: "compact"
          spacing: "md"
        }
        
        mocks {
          status: "Active,Pending,Done"
        }
        
        colors {
          primary: #3B82F6
          secondary: #10B981
        }
        
        screen Dashboard {
          layout stack {
            component Heading text: "Dashboard"
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    // All metadata blocks should exist
    const configNode = resolver.getNodeById('style');
    const mocksNode = resolver.getNodeById('mocks');
    const colorsNode = resolver.getNodeById('colors');

    expect(configNode).toBeDefined();
    expect(mocksNode).toBeDefined();
    expect(colorsNode).toBeDefined();

    // All should be children of project
    const projectNode = resolver.getNodeById('project');
    const children = resolver.getChildren(projectNode!.nodeId);
    const childTypes = children.map(c => c.type);

    expect(childTypes).toContain('style');
    expect(childTypes).toContain('mocks');
    expect(childTypes).toContain('colors');
    expect(childTypes).toContain('screen');
  });

  it('should include all metadata in statistics', () => {
    const code = `
      project "App" {
        style { density: "normal" }
        mocks { status: "A,B" }
        colors { primary: #3B82F6 }
        
        screen Main {
          layout stack {}
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    const stats = resolver.getStats();
    
    expect(stats.byType.style).toBe(1);
    expect(stats.byType.mocks).toBe(1);
    expect(stats.byType.colors).toBe(1);
    expect(stats.byType.screen).toBe(1);
    expect(stats.totalNodes).toBeGreaterThanOrEqual(5); // project + theme + mocks + colors + screen + layout
  });

  it('should allow jump-to-code for all metadata blocks', () => {
    const code = `project "App" {
  style {
    density: "compact"
  }
  
  mocks {
    status: "A,B,C"
  }
  
  colors {
    primary: #3B82F6
  }
  
  screen Main {
    layout stack {}
  }
}`;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    const configNode = resolver.getNodeById('style');
    const mocksNode = resolver.getNodeById('mocks');
    const colorsNode = resolver.getNodeById('colors');

    // Each should have a valid range for jump-to-code
    expect(configNode?.range.start.line).toBe(2);
    expect(mocksNode?.range.start.line).toBe(6);
    expect(colorsNode?.range.start.line).toBe(10);
  });
});
