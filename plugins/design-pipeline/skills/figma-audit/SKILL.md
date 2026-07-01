---
name: figma-audit
description: Use BEFORE forging a Figma component into code. Inspects a Figma component node through MCP and checks it is built to design-system spec — real component with variants, auto-layout, and bound variables — before figma-to-chromatic-design-system runs. Returns a pass/fail readiness report. Refuses to pass a loose or ad-hoc component. Read-only; never writes code.
---

# Figma Audit (pre-flight gate)

## Why this exists

Forge quality is almost entirely a function of how the component is *built* in
Figma, not how clever the agent is. A component made of real Figma component
properties, variants, auto-layout, and bound variables generates clean,
tokenized, DRY code — because that structure *is* the spec. The same shape drawn
as loose frames and groups generates garbage that needs rewriting, and silently
slips the `tokens_only` gate (inline hex instead of bound variables).

This skill is the cheap gate that catches that *before* any code is written. It
turns "designers must build rigorously" from a document nobody reads into an
automatic check that reports exactly what's wrong, in the designer's own terms.

Run it before `figma-to-chromatic-design-system` on every new or changed
component. It is read-only — it reports, it never fixes.

## Inputs

A single Figma component node ID (the main component / component set in the
library, not a screen instance). Read the manifest (`.claude/prototype.config.md`
or the library repo's equivalent) for the Figma `mcp_server_name`, file key, and
the `tokens_only` / `never_invent` gates.

## Checks (run all, then report)

Inspect the node through `mcp__<server>__get_design_context`,
`get_variable_defs`, and `search_design_system`, then check:

1. **It is a real component.** The node is a Component or Component Set, not a
   frame/group dressed up to look like one. Detached instances fail.
2. **Variants are defined as variant properties.** States/types the design needs
   (e.g. default/hover/pressed/disabled, standard/destructive) exist as Figma
   variant properties, not as separate hand-placed frames. Report the variant
   matrix found.
3. **Auto-layout is used.** The component and its meaningful containers use auto
   layout (so spacing/direction are structural, not absolute positions).
4. **Variables are bound.** Colour, radius, spacing, and typography read from
   bound Figma variables, not raw literal values. List any property carrying a
   raw literal — each is a future inline-hex / off-token bug.
5. **Variables resolve to a known token tier.** Each bound variable maps to a
   Tier 2 (semantic) or Tier 3 (component) token per the token contract. Tier 1
   primitives bound directly are a finding (components must not consume Tier 1).
6. **Slots / nested instances are real instances.** Icons and sub-parts are
   component instances (mappable), not flattened vectors.
7. **Naming is consistent** with the component-index conventions.

## Output — a readiness report

Group findings by severity:

- **BLOCKER** — not a real component; no variants where the design clearly has
  states; no auto-layout. Forge should NOT run; the component must be rebuilt in
  Figma first.
- **WARNING** — some values are raw literals rather than bound variables; a
  variable resolves to no known token. Forge MAY run, but every warning becomes a
  `never_invent` UNKNOWN that forge must log rather than guess.
- **PASS** — ready to forge.

End with a one-line verdict: `READY TO FORGE` or `NOT READY — rebuild in Figma`,
the node ID, and the variant matrix discovered. Do not write code, do not edit
Figma, do not log UNKNOWNs yourself (forge owns that) — just report.

## Hard rules

- Read-only. No Write/Edit tools by design.
- Judge against the token contract and component conventions, not personal taste.
- If you cannot read the node, say so plainly rather than guessing a verdict.
