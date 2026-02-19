---
title: Split + Stack + Separate Analysis
description: Technical analysis of offset behavior with Separate(size:none) inside split layouts
---

This page documents the current behavior of:

```wire
layout split(left: 25) {
  layout stack(direction: vertical) {
    component Separate size: none
    component IconButton icon: "home" variant: primary
  }
  layout stack(direction: vertical, gap: none) {
    component Heading text: "Totalnet Authz"
    component Heading text: "ADMIN CONSOLE" level: h6 spacing: none
  }
}
```

## Current Behavior

- `Separate size:none` resolves to intrinsic height `0`
- the parent `stack` still applies its sibling `gap` (default `md = 16` unless overridden)
- result: the next element appears shifted by the stack gap even when separator height is `0`

## Interpretation

The observed offset is mainly a stack spacing rule effect, not a split geometry defect.

## Status

Analysis-only in this iteration.  
No runtime/layout fix is applied yet.

## Next Iteration Proposal

Evaluate whether `Separate size:none` should:
1. keep current behavior (height `0`, parent gap preserved), or
2. behave as a true no-op spacer (no extra sibling spacing impact).
