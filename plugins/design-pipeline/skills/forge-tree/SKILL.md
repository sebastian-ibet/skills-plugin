---
name: forge-tree
description: Given a target Figma component that composes other components as nested instances (e.g. a Card that contains a Button), resolves the full dependency graph, forges the dependencies bottom-up — children before parents — skips any already forged, and only then forges the target. Detects and refuses cycles, stops on unreachable or ambiguous dependencies, and shows the resolved forge order for human approval before forging anything. Orchestrates the existing figma-audit and figma-to-chromatic-design-system skills; it does not replace them or reimplement forging.
---

# Forge Tree

## Why this exists

The manual loop and `forge-batch` both treat components as a flat list: each
node is audited and forged on its own, in whatever order it arrives. But real
components compose — a `Card` contains a `Button`, which contains an `Icon`.
Forging the `Card` before the `Button` exists produces a component that imports
something not in the library yet. Today the only fix is for a human to already
know the dependency order and paste links bottom-up by hand, one at a time.

This skill resolves that order automatically. It walks a target component's
nested instances into a full dependency graph, forges the leaves first and the
target last, and skips anything already forged — without loosening a single gate
the manual loop relies on. It **orchestrates** `figma-audit` and
`figma-to-chromatic-design-system`; it does not reimplement auditing or forging,
and it never forges a parent whose children aren't safely in place first.

## Inputs

A single target Figma component node ID (the main component / component set, not
a screen instance). Read the manifest (`.claude/prototype.config.md` or the
library repo's equivalent) for the Figma `mcp_server_name`, file key, and the
`tokens_only` / `never_invent` / `approval_gate` gates.

## Method

### 1. Dependency discovery (read-only)

Inspect the target node's structure through `mcp__<server>__get_design_context`
and `get_metadata`. Find every nested **component instance** it contains. Each
nested instance is one direct dependency.

A real nested component instance is a dependency. Flattened graphics, vectors,
and detached shapes are **not** dependencies. In this library, composed
components are always built as real nested instances, so this signal is
reliable — do not try to infer dependencies from anything but real instances.

### 2. Recursive graph build (read-only)

For each dependency, recurse the same way to find *its* dependencies, down to
leaf components that contain no nested component instances. Build the full
dependency graph for the target.

### 3. Cycle detection (critical)

Track the nodes on the current recursion path. If a node reappears on its own
path (A depends on B depends on A), the graph has a cycle. **Stop immediately**
and report the cycle plainly — the exact node chain — rather than recursing
forever. Cycles should be rare or nonexistent in a well-built library, but this
skill must detect and refuse them, never hang.

### 4. Skip already-forged

Cross-reference every node in the graph against the repo's real
`component-index.md` — the per-repo file that `figma-to-chromatic-design-system`
maintains wherever it's been instantiated in *this* repo (e.g.
`.claude/skills/figma-to-chromatic-design-system/references/component-index.md`
or the path that repo's manifest defines). This is **not** the plugin's own
`skills/figma-to-chromatic-design-system/references/component-index.md`, which is
a template and stays empty. Any node already recorded there is a satisfied
dependency — mark it skipped, do not re-forge it.

### 5. Topological order

Produce a forge order from the graph: leaves first, target last — every child
before any parent that depends on it. Already-forged nodes stay in the listing,
marked as satisfied/skipped, so the order reads honestly end to end.

### 6. Reachability check

If a dependency appears in a node's structure but its component *definition* is
not reachable through the Figma MCP (e.g. it lives only in a different library
file the current view doesn't expose), **stop and report it as a blocker**. Do
not forge the parent with a missing child. This is a real MCP limitation — the
server only sees what the current view exposes — and forging around it would
produce a component importing something that can't be built.

### 7. Ambiguity / exclusion gates

If a dependency resolves to a duplicate-named component set (same name,
different `componentKey`s) or to a kitchen-sink / overview frame, **stop and hold
for a human** — the same gate `figma-page-scan` and `forge-batch` apply. Never
auto-pick a canonical duplicate by recency, order, or any heuristic.

### 8. Show the plan, then gate

Before forging anything, output the resolved forge order as a clear, ordered
list that names what is new and what is already satisfied, e.g.:

> To forge **Card**, this will forge in order: **Icon** (new), **Button** (new);
> **Badge** already exists, skipped. Target **Card** forged last.

Then **wait for explicit human approval**. This is an approval gate, honoring the
manifest's `approval_gate` — not an automatic run. Do not forge until approved.

### 9. Execute on approval

On approval, walk the ordered list. For each node not already forged:

1. Invoke `figma-audit` on the node and read its verdict and full findings.
2. **Only** if the audit is a genuinely clean `READY TO FORGE` with **zero**
   findings at WARNING or BLOCKER severity, invoke
   `figma-to-chromatic-design-system` to forge it.
3. If any node in the chain fails its audit (any WARNING or BLOCKER) or fails to
   forge, **stop the whole tree** and report which node failed and why. Forging
   the parent is pointless once a child won't build — do not continue up the
   graph, and do not forge the target.

## Output

- The resolved forge order (from step 8), shown before any forging.
- After an approved run: which nodes were forged, which were skipped as
  already-existing, and — if the run stopped — exactly which node failed, at
  which stage (audit or forge), with that step's own text attached verbatim.
- If the run stopped in discovery: the cycle, the unreachable dependency, or the
  ambiguous/excluded dependency that halted it, named specifically.

## Hard rules

- **Never forge a node whose audit isn't a clean pass.** Any WARNING or BLOCKER
  disqualifies it — no "forge anyway with a note."
- **Never re-forge an existing component.** Anything already in the repo's real
  `component-index.md` is a satisfied dependency and is skipped.
- **Never invent tokens.** A node that would require a token
  `figma-to-chromatic-design-system` can't find is a forge failure — never patch
  it with an invented or hardcoded value.
- **Never auto-pick a duplicate-named component.** Duplicate sets go to a human;
  this skill does not choose a canonical one.
- **Never forge a parent when a child is unreachable or failed.** A missing or
  failed dependency stops the whole tree, not just that node.
- **Halt on cycles.** A dependency cycle is a full stop with the node chain
  named — never an infinite recursion.
- **Read dependency state from the repo's real `component-index.md`**, not the
  plugin's empty template copy.
- **Write only to the library repo** — the exact boundary
  `figma-to-chromatic-design-system` already respects. Never write to the plugin
  itself.
- **Never mark anything "validated."** This skill forges in dependency order; it
  does not tick a validation checklist, set any component's status to
  "Validated," or claim visual correctness. Visual validation stays a human step.
- **It orchestrates existing skills.** It invokes `figma-audit` and
  `figma-to-chromatic-design-system`; it does not reimplement forging or auditing
  itself.
