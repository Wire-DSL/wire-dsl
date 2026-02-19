# Analysis: `split + stack + Separate(size:none)`

## Scope

This document is analysis-only for the reported case.  
No behavior fix is applied in this iteration.

## Reproduction

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

## Current Layout Result (normal density, default spacing `md`)

Using the current layout rules:
- `split.left = 25`
- `split.gap` defaults to `md = 16`
- first stack `gap` defaults to `md = 16`
- `Separate size:none` resolves to height `0`

Approximate positions:
- left stack: `x=0, y=0, w=25`
- `Separate`: `x=0, y=0, w=25, h=0`
- `IconButton`: `x=0, y=16, w=25, h=40` (shifted by stack gap)
- right stack starts at `x=41` (`25 + 16`)

## Why It Looks Like an Unexpected Offset

`Separate size:none` only removes the separator intrinsic height (`h=0`), but it does **not** remove the parent stack gap.  
So in a vertical stack with default gap `md`, the next element still moves by 16px.

In this case it is perceived as a `split + stack` issue, but the primary trigger is:
- `stack` gap defaulting to `md`
- plus `Separate(size:none)` contributing `0` height but still occupying one stack slot between siblings

## Estimated Root Cause

Not a split width math bug by itself.  
The shift comes from stack spacing semantics:
- child spacing is applied independently from child intrinsic height
- `Separate` participates as a normal child node

## Proposed Next Iteration (no implementation here)

1. Decide semantic intent for `Separate size:none`:
   - option A: keep current behavior (0 height, parent gap still applies)
   - option B: treat `size:none` as a true no-op spacer (skip additional sibling gap impact)
2. If option B is chosen, implement in vertical/horizontal stack placement:
   - special-case `Separate(size:none)` when computing inter-item spacing
3. Add regression tests for:
   - `stack(gap: md)` + `Separate(size:none)`
   - `stack(gap: none)` + `Separate(size:none)`
   - same scenarios inside `split(left|right)`
