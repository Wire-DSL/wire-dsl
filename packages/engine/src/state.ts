/**
 * Wire DSL Play Test State Management
 *
 * Provides the `applyStateChange` function for mutating a copy of the IR
 * during play test sessions. The engine stays 100% static — this module
 * produces a NEW IR (immutable pattern) from a change descriptor.
 *
 * The Wire source is never touched during play test. The canvas keeps a
 * mutable copy of the IR per session and discards it when play test ends.
 *
 * Usage (Wire Studio / Canvas):
 *   const newIR = applyStateChange(currentIR, { type: 'setVisible', targetId: 'confirmModal', visible: true });
 *   const newSVG = render(newIR, screenName);
 */

import type { IRContract, IRNode, IRComponentNode, IRContainerNode } from './ir/index';
import { SELF_TARGET } from './ir/index';

// ============================================================================
// STATE CHANGE TYPES
// ============================================================================

export type IRStateChange =
  /** Show or hide a node by its userDefinedId (or '_self' resolved from originNodeId) */
  | { type: 'setVisible'; targetId: string; visible: boolean }
  /** Toggle visibility of a node by its userDefinedId (or '_self') */
  | { type: 'toggleVisible'; targetId: string }
  /** Change the active tab index in a layout tabs container */
  | { type: 'setActiveTab'; tabsId: string; index: number }
  /** Set checked state on Checkbox / Radio controls */
  | { type: 'setChecked'; targetId: string; checked: boolean }
  /** Toggle checked state on Checkbox / Radio controls */
  | { type: 'toggleChecked'; targetId: string }
  /** Set enabled state on Toggle controls */
  | { type: 'setEnabled'; targetId: string; enabled: boolean }
  /** Toggle enabled state on Toggle controls */
  | { type: 'toggleEnabled'; targetId: string }
  /** Navigate to a different screen (changes the active screen id in the IR) */
  | { type: 'navigateTo'; screen: string };

// ============================================================================
// APPLY STATE CHANGE
// ============================================================================

/**
 * Apply a state change to a copy of the IR, returning a new IR object.
 *
 * - Does NOT mutate the input IR
 * - Returns a new IR with the minimal change applied
 * - `originNodeId` is required when `targetId === '_self'` to resolve the self reference
 *
 * @param ir           The current IR (from the canvas's mutable session copy)
 * @param change       The state change to apply
 * @param originNodeId The nodeId of the element that triggered the event (required for self-target)
 * @returns A new IR with the change applied
 */
export function applyStateChange(
  ir: IRContract,
  change: IRStateChange,
  originNodeId?: string
): IRContract {
  switch (change.type) {
    case 'setVisible':
      return applySetVisible(ir, change.targetId, change.visible, originNodeId);

    case 'toggleVisible':
      return applyToggleVisible(ir, change.targetId, originNodeId);

    case 'setActiveTab':
      return applySetActiveTab(ir, change.tabsId, change.index);

    case 'setChecked':
      return applySetBooleanProp(ir, change.targetId, 'checked', change.checked, originNodeId);

    case 'toggleChecked':
      return applyToggleBooleanProp(ir, change.targetId, 'checked', originNodeId);

    case 'setEnabled':
      return applySetBooleanProp(ir, change.targetId, 'enabled', change.enabled, originNodeId);

    case 'toggleEnabled':
      return applyToggleBooleanProp(ir, change.targetId, 'enabled', originNodeId);

    case 'navigateTo':
      return applyNavigateTo(ir, change.screen);
  }
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

function applySetVisible(
  ir: IRContract,
  targetId: string,
  visible: boolean,
  originNodeId?: string
): IRContract {
  const resolvedId = resolveTargetId(ir, targetId, originNodeId);
  if (!resolvedId) return ir;

  const nodes = mutateNodeVisible(ir.project.nodes, resolvedId, visible);
  return { ...ir, project: { ...ir.project, nodes } };
}

function applyToggleVisible(
  ir: IRContract,
  targetId: string,
  originNodeId?: string
): IRContract {
  const resolvedId = resolveTargetId(ir, targetId, originNodeId);
  if (!resolvedId) return ir;

  // Find current visible state — check both component and container nodes
  const targetNodeEntry = findNodeByUserDefinedId(ir.project.nodes, resolvedId) ||
    (resolvedId === originNodeId ? findNodeByMetaNodeId(ir.project.nodes, resolvedId) : null);
  const targetContainerEntry = !targetNodeEntry
    ? Object.values(ir.project.nodes).find(
        n => n.kind === 'container' && (String(n.params.id) === resolvedId || n.meta.nodeId === resolvedId)
      ) as IRContainerNode | undefined
    : undefined;

  let currentVisible = true;
  if (targetNodeEntry?.kind === 'component') {
    currentVisible = targetNodeEntry.props?.visible !== 'false';
  } else if (targetContainerEntry?.kind === 'container') {
    currentVisible = String(targetContainerEntry.params.visible) !== 'false';
  }

  const nodes = mutateNodeVisible(ir.project.nodes, resolvedId, !currentVisible);
  return { ...ir, project: { ...ir.project, nodes } };
}

function applySetActiveTab(ir: IRContract, tabsId: string, index: number): IRContract {
  let found = false;
  const nodes: Record<string, IRNode> = {};

  for (const [nodeKey, node] of Object.entries(ir.project.nodes)) {
    if (
      node.kind === 'container' &&
      node.containerType === 'tabs' &&
      node.params.id === tabsId
    ) {
      nodes[nodeKey] = {
        ...node,
        params: { ...node.params, active: index },
      };
      found = true;
    } else if (
      node.kind === 'component' &&
      node.componentType === 'Tabs' &&
      node.props.tabsId === tabsId
    ) {
      nodes[nodeKey] = {
        ...node,
        props: { ...node.props, active: index },
      };
      found = true;
    } else {
      nodes[nodeKey] = node;
    }
  }

  if (!found) {
    console.warn(`[applyStateChange] setActiveTab: no layout tabs found with id "${tabsId}"`);
    return ir;
  }

  return { ...ir, project: { ...ir.project, nodes } };
}

function applySetBooleanProp(
  ir: IRContract,
  targetId: string,
  propName: 'checked' | 'enabled',
  value: boolean,
  originNodeId?: string
): IRContract {
  const resolvedId = resolveTargetId(ir, targetId, originNodeId);
  if (!resolvedId) return ir;

  const nodes = mutateNodeBooleanProp(ir.project.nodes, resolvedId, propName, value);
  return { ...ir, project: { ...ir.project, nodes } };
}

function applyToggleBooleanProp(
  ir: IRContract,
  targetId: string,
  propName: 'checked' | 'enabled',
  originNodeId?: string
): IRContract {
  const resolvedId = resolveTargetId(ir, targetId, originNodeId);
  if (!resolvedId) return ir;

  const targetNodeEntry = findTargetComponentNode(ir.project.nodes, resolvedId);
  const currentValue = targetNodeEntry
    ? String(targetNodeEntry.props[propName] || 'false').toLowerCase() === 'true'
    : false;

  const nodes = mutateNodeBooleanProp(ir.project.nodes, resolvedId, propName, !currentValue);
  return { ...ir, project: { ...ir.project, nodes } };
}

function applyNavigateTo(ir: IRContract, screenName: string): IRContract {
  // Mark the target screen as active in the IR
  // Screens don't have an explicit "active" flag; the canvas controls which screen to render.
  // We add/update an `activeScreen` field on the project for the canvas to read.
  const updatedProject = {
    ...ir.project,
    activeScreen: screenName,
  } as typeof ir.project & { activeScreen?: string };

  return { ...ir, project: updatedProject };
}

// ============================================================================
// NODE LOOKUP HELPERS
// ============================================================================

function resolveTargetId(
  ir: IRContract,
  targetId: string,
  originNodeId?: string
): string | null {
  if (targetId === SELF_TARGET) {
    if (!originNodeId) {
      console.warn('[applyStateChange] targetId is _self but no originNodeId was provided');
      return null;
    }
    return originNodeId;
  }
  return targetId;
}

function findNodeByUserDefinedId(
  nodes: Record<string, IRNode>,
  userDefinedId: string
): IRComponentNode | null {
  for (const node of Object.values(nodes)) {
    if (node.kind === 'component' && node.userDefinedId === userDefinedId) {
      return node;
    }
  }
  return null;
}

function findNodeByMetaNodeId(
  nodes: Record<string, IRNode>,
  metaNodeId: string
): IRComponentNode | null {
  for (const node of Object.values(nodes)) {
    if (node.kind === 'component' && node.meta.nodeId === metaNodeId) {
      return node;
    }
  }
  return null;
}

function findTargetComponentNode(
  nodes: Record<string, IRNode>,
  targetId: string
): IRComponentNode | null {
  return findNodeByUserDefinedId(nodes, targetId) || findNodeByMetaNodeId(nodes, targetId);
}

function mutateNodeVisible(
  nodes: Record<string, IRNode>,
  targetId: string,
  visible: boolean
): Record<string, IRNode> {
  // targetId can be a userDefinedId, params.id (for containers), or a meta.nodeId (for _self)
  let found = false;
  const result: Record<string, IRNode> = {};

  for (const [key, node] of Object.entries(nodes)) {
    if (node.kind === 'component') {
      const matchByUserDefined = node.userDefinedId === targetId;
      const matchByMetaNodeId = node.meta.nodeId === targetId;

      if (matchByUserDefined || matchByMetaNodeId) {
        result[key] = {
          ...node,
          props: { ...node.props, visible: visible ? 'true' : 'false' },
        };
        found = true;
      } else {
        result[key] = node;
      }
    } else if (node.kind === 'container') {
      const matchByParamsId = node.params.id !== undefined && String(node.params.id) === targetId;
      const matchByMetaNodeId = node.meta.nodeId === targetId;

      if (matchByParamsId || matchByMetaNodeId) {
        result[key] = {
          ...node,
          params: { ...node.params, visible: visible ? 'true' : 'false' },
        };
        found = true;
      } else {
        result[key] = node;
      }
    } else {
      result[key] = node;
    }
  }

  if (!found) {
    console.warn(`[applyStateChange] setVisible: no node found with id "${targetId}"`);
  }

  return result;
}

function mutateNodeBooleanProp(
  nodes: Record<string, IRNode>,
  targetId: string,
  propName: 'checked' | 'enabled',
  value: boolean
): Record<string, IRNode> {
  let found = false;
  const result: Record<string, IRNode> = {};

  for (const [key, node] of Object.entries(nodes)) {
    if (node.kind === 'component') {
      const matchByUserDefined = node.userDefinedId === targetId;
      const matchByMetaNodeId = node.meta.nodeId === targetId;

      if (matchByUserDefined || matchByMetaNodeId) {
        result[key] = {
          ...node,
          props: { ...node.props, [propName]: value ? 'true' : 'false' },
        };
        found = true;
      } else {
        result[key] = node;
      }
    } else {
      result[key] = node;
    }
  }

  if (!found) {
    console.warn(`[applyStateChange] ${propName}: no node found with id "${targetId}"`);
  }

  return result;
}
