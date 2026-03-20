import { describe, it, expect } from 'vitest';
import { parseWireDSL, parseWireDSLWithSourceMap } from './parser/index';
import { generateIR } from './ir/index';
import { applyStateChange } from './state';

function buildIR(input: string) {
  const ast = parseWireDSL(input);
  return generateIR(ast);
}

function buildIRWithSourceMap(input: string) {
  const { ast } = parseWireDSLWithSourceMap(input);
  return generateIR(ast);
}

describe('applyStateChange', () => {
  describe('setVisible', () => {
    it('should set visible: true on a node matched by userDefinedId', () => {
      const ir = buildIR(`
        project "Test" {
          screen Main {
            layout stack {
              component Modal id: confirmModal title: "Sure?"
            }
          }
        }
      `);

      const newIR = applyStateChange(ir, { type: 'setVisible', targetId: 'confirmModal', visible: true });

      const modal = Object.values(newIR.project.nodes).find(
        (n) => n.kind === 'component' && n.userDefinedId === 'confirmModal'
      );
      expect(modal).toBeDefined();
      if (modal?.kind === 'component') {
        expect(modal.props.visible).toBe('true');
      }
    });

    it('should set visible: false on a node matched by userDefinedId', () => {
      const ir = buildIR(`
        project "Test" {
          screen Main {
            layout stack {
              component Modal id: myModal title: "Hello"
            }
          }
        }
      `);

      const newIR = applyStateChange(ir, { type: 'setVisible', targetId: 'myModal', visible: false });

      const modal = Object.values(newIR.project.nodes).find(
        (n) => n.kind === 'component' && n.userDefinedId === 'myModal'
      );
      if (modal?.kind === 'component') {
        expect(modal.props.visible).toBe('false');
      }
    });

    it('should NOT mutate the original IR', () => {
      const ir = buildIR(`
        project "Test" {
          screen Main {
            layout stack {
              component Modal id: myModal title: "Hello"
            }
          }
        }
      `);

      const originalModal = Object.values(ir.project.nodes).find(
        (n) => n.kind === 'component' && n.userDefinedId === 'myModal'
      );
      const originalVisible = originalModal?.kind === 'component' ? originalModal.props.visible : undefined;

      applyStateChange(ir, { type: 'setVisible', targetId: 'myModal', visible: false });

      // Original should be unchanged
      const stillOriginal = Object.values(ir.project.nodes).find(
        (n) => n.kind === 'component' && n.userDefinedId === 'myModal'
      );
      if (stillOriginal?.kind === 'component') {
        expect(stillOriginal.props.visible).toBe(originalVisible);
      }
    });

    it('should resolve _self via originNodeId', () => {
      const ir = buildIRWithSourceMap(`
        project "Test" {
          screen Main {
            layout stack {
              component Modal id: confirmModal title: "Sure?" onClose: hide(self)
            }
          }
        }
      `);

      const modal = Object.values(ir.project.nodes).find(
        (n) => n.kind === 'component' && n.userDefinedId === 'confirmModal'
      );
      const nodeId = modal?.meta.nodeId;
      expect(nodeId).toBeDefined();

      const newIR = applyStateChange(
        ir,
        { type: 'setVisible', targetId: '_self', visible: false },
        nodeId
      );

      const updatedModal = Object.values(newIR.project.nodes).find(
        (n) => n.kind === 'component' && n.meta.nodeId === nodeId
      );
      if (updatedModal?.kind === 'component') {
        expect(updatedModal.props.visible).toBe('false');
      }
    });

    it('should return IR with same content when targetId not found', () => {
      const ir = buildIR(`
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "Click"
            }
          }
        }
      `);

      const newIR = applyStateChange(ir, { type: 'setVisible', targetId: 'nonExistent', visible: true });
      // Node visible props should remain unchanged
      const btn = Object.values(newIR.project.nodes).find(
        (n) => n.kind === 'component' && n.componentType === 'Button'
      );
      if (btn?.kind === 'component') {
        expect(btn.props.visible).toBeUndefined();
      }
    });
  });

  describe('toggleVisible', () => {
    it('should toggle visible from default (true) to false', () => {
      const ir = buildIR(`
        project "Test" {
          screen Main {
            layout stack {
              component Modal id: myPanel title: "Panel"
            }
          }
        }
      `);

      const newIR = applyStateChange(ir, { type: 'toggleVisible', targetId: 'myPanel' });

      const panel = Object.values(newIR.project.nodes).find(
        (n) => n.kind === 'component' && n.userDefinedId === 'myPanel'
      );
      if (panel?.kind === 'component') {
        expect(panel.props.visible).toBe('false');
      }
    });

    it('should toggle visible from false to true', () => {
      const ir = buildIR(`
        project "Test" {
          screen Main {
            layout stack {
              component Modal id: myPanel title: "Panel"
            }
          }
        }
      `);

      // First hide it
      const hiddenIR = applyStateChange(ir, { type: 'setVisible', targetId: 'myPanel', visible: false });
      // Then toggle — should become true
      const toggledIR = applyStateChange(hiddenIR, { type: 'toggleVisible', targetId: 'myPanel' });

      const panel = Object.values(toggledIR.project.nodes).find(
        (n) => n.kind === 'component' && n.userDefinedId === 'myPanel'
      );
      if (panel?.kind === 'component') {
        expect(panel.props.visible).toBe('true');
      }
    });
  });

  describe('setActiveTab', () => {
    it('should update active param on tabs container', () => {
      const ir = buildIR(`
        project "Tabs" {
          screen Main {
            layout tabs(id: mainTabs) {
              tab { component Heading text: "Tab A" }
              tab { component Heading text: "Tab B" }
              tab { component Heading text: "Tab C" }
            }
          }
        }
      `);

      const newIR = applyStateChange(ir, { type: 'setActiveTab', tabsId: 'mainTabs', index: 2 });

      const tabsNode = Object.values(newIR.project.nodes).find(
        (n) => n.kind === 'container' && n.containerType === 'tabs' && n.params.id === 'mainTabs'
      );
      expect(tabsNode).toBeDefined();
      if (tabsNode?.kind === 'container') {
        expect(tabsNode.params.active).toBe(2);
      }
    });

    it('should return original IR when tabsId not found', () => {
      const ir = buildIR(`
        project "Tabs" {
          screen Main {
            layout stack {
              component Button text: "Click"
            }
          }
        }
      `);

      const newIR = applyStateChange(ir, { type: 'setActiveTab', tabsId: 'nonExistent', index: 0 });
      // No tabs container was modified
      const tabsNode = Object.values(newIR.project.nodes).find(
        (n) => n.kind === 'container' && n.containerType === 'tabs'
      );
      expect(tabsNode).toBeUndefined();
    });
  });

  describe('navigateTo', () => {
    it('should set activeScreen on the project', () => {
      const ir = buildIR(`
        project "Test" {
          screen Main {
            layout stack {
              component Button text: "Go" onClick: navigate(Detail)
            }
          }
          screen Detail {
            layout stack { component Heading text: "Detail" }
          }
        }
      `);

      const newIR = applyStateChange(ir, { type: 'navigateTo', screen: 'Detail' });

      const project = newIR.project as typeof ir.project & { activeScreen?: string };
      expect(project.activeScreen).toBe('Detail');
    });

    it('should NOT mutate the original IR on navigateTo', () => {
      const ir = buildIR(`
        project "Test" {
          screen Main {
            layout stack { component Heading text: "Main" }
          }
          screen Detail {
            layout stack { component Heading text: "Detail" }
          }
        }
      `);

      applyStateChange(ir, { type: 'navigateTo', screen: 'Detail' });

      const project = ir.project as typeof ir.project & { activeScreen?: string };
      expect(project.activeScreen).toBeUndefined();
    });
  });
});
