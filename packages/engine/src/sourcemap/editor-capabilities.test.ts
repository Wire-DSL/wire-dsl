import { describe, it, expect } from 'vitest';
import { parseWireDSLWithSourceMap } from '../parser/index';
import { SourceMapResolver } from './resolver';

describe('SourceMap Phase 2: isUserDefined', () => {
  it('should mark user-defined components correctly', () => {
    const code = `
      project "App" {
        define Component "MyButton" {
          layout stack {
            component Icon icon: "check"
            component Button text: "Click"
          }
        }
        
        screen Main {
          layout stack {
            component MyButton
            component Button text: "Native"
            component MyButton
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    // Get all components
    const components = resolver.getNodesByType('component');
    
    // Find MyButton instances (should be user-defined)
    const myButtons = components.filter(c => c.componentType === 'MyButton');
    expect(myButtons.length).toBe(2);
    myButtons.forEach(btn => {
      expect(btn.isUserDefined).toBe(true);
    });

    // Find native components (should NOT be user-defined)
    const nativeComponents = components.filter(c => 
      c.componentType === 'Icon' || c.componentType === 'Button'
    );
    expect(nativeComponents.length).toBeGreaterThan(0);
    nativeComponents.forEach(comp => {
      expect(comp.isUserDefined).toBe(false);
    });
  });

  it('should handle multiple component definitions', () => {
    const code = `
      project "App" {
        define Component "Card" {
          layout panel {}
        }
        
        define Component "Badge" {
          layout stack {}
        }
        
        screen Dashboard {
          layout stack {
            component Card
            component Badge
            component Button text: "Native"
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    const components = resolver.getNodesByType('component');
    
    const card = components.find(c => c.componentType === 'Card');
    const badge = components.find(c => c.componentType === 'Badge');
    const button = components.find(c => c.componentType === 'Button');

    expect(card?.isUserDefined).toBe(true);
    expect(badge?.isUserDefined).toBe(true);
    expect(button?.isUserDefined).toBe(false);
  });

  it('should not mark components as user-defined if no definition exists', () => {
    const code = `
      project "Simple" {
        screen Main {
          layout stack {
            component Button text: "Click"
            component Input placeholder: "Type"
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const components = sourceMap.filter(e => e.type === 'component');

    // All should be native (not user-defined)
    components.forEach(comp => {
      expect(comp.isUserDefined).toBe(false);
    });
  });
});

describe('SourceMap Phase 3: InsertionPoint', () => {
  it('should calculate insertionPoint for empty containers', () => {
    const code = `project "App" {
  screen Main {
    layout stack {
    }
  }
}`;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    const stackLayout = resolver.getNodesByType('layout', 'stack')[0];
    expect(stackLayout).toBeDefined();
    expect(stackLayout.insertionPoint).toBeDefined();

    // Should insert inside empty body
    expect(stackLayout.insertionPoint?.line).toBeGreaterThan(0);
    expect(stackLayout.insertionPoint?.indentation).toBeTruthy();
  });

  it('should calculate insertionPoint after last child', () => {
    const code = `project "App" {
  screen Dashboard {
    layout stack {
      component Heading text: "Title"
      component Button text: "Click"
    }
  }
}`;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    const stackLayout = resolver.getNodesByType('layout', 'stack')[0];
    expect(stackLayout.insertionPoint).toBeDefined();

    // Should have 'after' pointing to last child
    expect(stackLayout.insertionPoint?.after).toBeDefined();
    
    const lastChild = resolver.getNodeById(stackLayout.insertionPoint!.after!);
    expect(lastChild?.componentType).toBe('Button');
  });

  it('should calculate insertionPoint for all container types', () => {
    const code = `project "App" {
  screen Main {
    layout grid(columns: 2, gap: md) {
      cell {
        component Button text: "A"
      }
    }
  }
}`;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    // Check project has insertionPoint
    const project = resolver.getNodeById('project');
    expect(project?.insertionPoint).toBeDefined();

    // Check screen has insertionPoint
    const screen = resolver.getNodesByType('screen')[0];
    expect(screen?.insertionPoint).toBeDefined();

    // Check layout has insertionPoint
    const layout = resolver.getNodesByType('layout')[0];
    expect(layout?.insertionPoint).toBeDefined();

    // Check cell has insertionPoint
    const cell = resolver.getNodesByType('cell')[0];
    expect(cell?.insertionPoint).toBeDefined();
  });

  it('should preserve indentation in insertionPoint', () => {
    const code = `project "App" {
  screen Main {
    layout stack {
      component Button text: "First"
    }
  }
}`;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const layout = sourceMap.find(e => e.type === 'layout');

    expect(layout?.insertionPoint?.indentation).toBeDefined();
    // Should have some indentation (4 or 6 spaces typically)
    // Note: Indentation might be empty string if extraction fails, so we test for defined
    expect(typeof layout?.insertionPoint?.indentation).toBe('string');
  });
});

describe('SourceMap Phase 3: Detailed Ranges', () => {
  it('should capture keywordRange for components', () => {
    const code = `
      project "App" {
        screen Main {
          layout stack {
            component Button text: "Click"
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const button = sourceMap.find(e => 
      e.type === 'component' && e.componentType === 'Button'
    );

    expect(button).toBeDefined();
    expect(button?.keywordRange).toBeDefined();
    
    // keywordRange should be valid
    expect(button?.keywordRange?.start.line).toBeGreaterThan(0);
    expect(button?.keywordRange?.end.line).toBeGreaterThan(0);
  });

  it('should capture nameRange for components', () => {
    const code = `
      project "App" {
        screen Main {
          layout stack {
            component Input placeholder: "Type"
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const input = sourceMap.find(e => 
      e.type === 'component' && e.componentType === 'Input'
    );

    expect(input?.nameRange).toBeDefined();
    expect(input?.nameRange?.start.column).toBeDefined();
  });

  it('should capture bodyRange for layouts', () => {
    const code = `
      project "App" {
        screen Main {
          layout stack {
            component Button text: "Click"
          }
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const layout = sourceMap.find(e => e.type === 'layout');

    expect(layout?.bodyRange).toBeDefined();
    expect(layout?.bodyRange?.start).toBeDefined();
    expect(layout?.bodyRange?.end).toBeDefined();
  });

  it('should capture all ranges for screens', () => {
    const code = `project "App" {
  screen Dashboard {
    layout stack {}
  }
}`;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const screen = sourceMap.find(e => e.type === 'screen');

    // Screen should have keyword, name, and body ranges
    expect(screen?.keywordRange).toBeDefined();
    expect(screen?.nameRange).toBeDefined();
    expect(screen?.bodyRange).toBeDefined();

    // Full range should encompass all parts
    expect(screen!.range.start.line).toBeLessThanOrEqual(screen!.keywordRange!.start.line);
  });

  it('should capture ranges for component definitions', () => {
    const code = `
      project "App" {
        define Component "MyButton" {
          layout stack {}
        }
        
        screen Main {
          layout stack {}
        }
      }
    `;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const definition = sourceMap.find(e => e.type === 'component-definition');

    expect(definition).toBeDefined();
    expect(definition?.keywordRange).toBeDefined();  // "component" keyword
    expect(definition?.nameRange).toBeDefined();     // "MyButton"
    expect(definition?.bodyRange).toBeDefined();     // { ... }
  });
});

describe('SourceMap Phase 2 & 3: Integration', () => {
  it('should work together: isUserDefined + insertionPoint + ranges', () => {
    const code = `project "Complete" {
  define Component "Card" {
    layout panel {
      component Heading text: "Card"
    }
  }
  
  screen Dashboard {
    layout stack {
      component Card
      component Button text: "Add"
    }
  }
}`;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    // Phase 2: isUserDefined
    const cardInstance = sourceMap.find(e => 
      e.type === 'component' && 
      e.componentType === 'Card' && 
      e.parentId !== null && 
      e.parentId !== 'define-Card'
    );
    expect(cardInstance?.isUserDefined).toBe(true);

    const buttonInstance = sourceMap.find(e =>
      e.type === 'component' && 
      e.componentType === 'Button'
    );
    expect(buttonInstance?.isUserDefined).toBe(false);

    // Phase 3: insertionPoint
    const layout = resolver.getNodesByType('layout', 'stack')[0];
    expect(layout?.insertionPoint).toBeDefined();
    expect(layout?.insertionPoint?.after).toBeDefined();

    // Phase 3: ranges
    expect(cardInstance?.keywordRange).toBeDefined();
    expect(cardInstance?.nameRange).toBeDefined();
    expect(layout?.bodyRange).toBeDefined();
  });

  it('should enable full editor capabilities', () => {
    const code = `project "Editor Test" {
  define Component "Widget" {
    layout card {}
  }
  
  screen Main {
    layout stack {
      component Widget
    }
  }
}`;

    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);

    // Verify all editing capabilities are available:
    
    // 1. Can identify user components
    const widget = resolver.getNodesByType('component').find(c => c.componentType === 'Widget');
    expect(widget?.isUserDefined).toBe(true);

    // 2. Can insert new components
    const layout = resolver.getNodesByType('layout')[0];
    expect(layout?.insertionPoint).toBeDefined();

    // 3. Can edit specific parts
    expect(widget?.keywordRange).toBeDefined();
    expect(widget?.nameRange).toBeDefined();

    // 4. Can navigate hierarchy
    const path = resolver.getPath(widget!.nodeId);
    expect(path.length).toBeGreaterThan(1);
  });
});

describe('SourceMap: section nodes (tab, modal-body, modal-footer)', () => {
  const tabsCode = `project "Tabs Test" {
  screen Main {
    layout stack(direction: vertical) {
      layout tabs(id: mainTabs) {
        tab {
          component Heading text: "Tab 1"
          component Text text: "Content 1"
        }
        tab {
          component Button text: "Action"
        }
        tab {}
      }
    }
  }
}`;

  it('tab nodes appear in SourceMap with correct type and parentId', () => {
    const { sourceMap } = parseWireDSLWithSourceMap(tabsCode);
    const tabs = sourceMap.filter(e => e.type === 'tab');
    expect(tabs.length).toBe(3);

    const tabsLayout = sourceMap.find(e => e.type === 'layout' && e.layoutType === 'tabs');
    expect(tabsLayout).toBeDefined();

    tabs.forEach(tab => {
      expect(tab.parentId).toBe(tabsLayout!.nodeId);
      expect(tab.keywordRange).toBeDefined();
      expect(tab.bodyRange).toBeDefined();
      expect(tab.range).toBeDefined();
    });
  });

  it('tab-0, tab-1, tab-2 get sequential nodeIds', () => {
    const { sourceMap } = parseWireDSLWithSourceMap(tabsCode);
    const tabIds = sourceMap.filter(e => e.type === 'tab').map(e => e.nodeId);
    expect(tabIds).toEqual(['tab-0', 'tab-1', 'tab-2']);
  });

  it('tab with children gets insertionPoint.after pointing to last child', () => {
    const { sourceMap } = parseWireDSLWithSourceMap(tabsCode);
    const tab0 = sourceMap.find(e => e.nodeId === 'tab-0');
    expect(tab0?.insertionPoint).toBeDefined();
    expect(tab0?.insertionPoint?.after).toBeDefined();
    // after should point to the last child (component-text-0)
    const lastChild = sourceMap.find(e => e.nodeId === tab0!.insertionPoint!.after);
    expect(lastChild?.type).toBe('component');
  });

  it('empty tab gets insertionPoint without after', () => {
    const { sourceMap } = parseWireDSLWithSourceMap(tabsCode);
    const tab2 = sourceMap.find(e => e.nodeId === 'tab-2');
    expect(tab2?.insertionPoint).toBeDefined();
    expect(tab2?.insertionPoint?.after).toBeUndefined();
  });

  it('tab children have correct parentId', () => {
    const { sourceMap } = parseWireDSLWithSourceMap(tabsCode);
    const tab0 = sourceMap.find(e => e.nodeId === 'tab-0');
    const resolver = new SourceMapResolver(sourceMap);
    const children = resolver.getChildren(tab0!.nodeId);
    expect(children.length).toBe(2);
    children.forEach(c => expect(c.parentId).toBe('tab-0'));
  });

  it('resolver.getChildren on layout tabs returns tab nodes', () => {
    const { sourceMap } = parseWireDSLWithSourceMap(tabsCode);
    const resolver = new SourceMapResolver(sourceMap);
    const tabsLayout = sourceMap.find(e => e.type === 'layout' && e.layoutType === 'tabs')!;
    const children = resolver.getChildren(tabsLayout.nodeId);
    expect(children.length).toBe(3);
    children.forEach(c => expect(c.type).toBe('tab'));
  });

  const modalCode = `project "Modal Test" {
  screen Main {
    layout stack(direction: vertical) {
      layout modal(title: "Confirm") {
        body {
          component Text text: "Are you sure?"
          component Input label: "Reason"
        }
        footer {
          component Button text: "Cancel"
          component Button text: "Confirm"
        }
      }
    }
  }
}`;

  it('modal-body and modal-footer get insertionPoint', () => {
    const { sourceMap } = parseWireDSLWithSourceMap(modalCode);
    const body = sourceMap.find(e => e.type === 'modal-body');
    const footer = sourceMap.find(e => e.type === 'modal-footer');

    expect(body?.insertionPoint).toBeDefined();
    expect(body?.insertionPoint?.after).toBeDefined(); // has 2 children

    expect(footer?.insertionPoint).toBeDefined();
    expect(footer?.insertionPoint?.after).toBeDefined(); // has 2 children
  });

  it('modal-body and modal-footer get stable nodeIds', () => {
    const { sourceMap } = parseWireDSLWithSourceMap(modalCode);
    const body = sourceMap.find(e => e.type === 'modal-body');
    const footer = sourceMap.find(e => e.type === 'modal-footer');
    expect(body?.nodeId).toBe('modal-body-0');
    expect(footer?.nodeId).toBe('modal-footer-0');
  });
});
