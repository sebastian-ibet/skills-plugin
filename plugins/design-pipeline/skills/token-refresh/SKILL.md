---
name: token-refresh
description: Drift guard that runs before any batch or CI forge. Runs the repo's token-resolve script and captures any missing-token error verbatim; if MCP access to live Figma variables is available, diffs live variable groups against the checked-in raw token export and reports any group present in Figma but absent from the export. Renders a FRESH (proceed) or STALE (halt) verdict. On STALE, names exactly what needs re-exporting and is explicit that the actual Figma-to-JSON re-export is very likely a design-tool-side, human step it cannot perform headlessly. Never hardcodes a missing token to unblock a run. Use before forge-batch, in CI, or any time token drift is suspected.
---

# Token Refresh

## Why this exists

Two real, silent failure modes surfaced during manual forging this pattern is
built from:

1. A CSS custom property (`--body-lg-emphasis-*`, referenced by a component's
   styles since the component was first forged) was never actually wired
   into the token resolver. Nothing caught it — a missing CSS custom property
   isn't a typecheck error or a build failure, it just silently falls back to
   inherited/default styling. It was only found by coincidence, months later,
   while wiring an unrelated component that happened to need the same token.
2. A Figma component (`Button`'s "Link" type) referenced a live Tier 3 token
   group (`button/link/*`) that didn't exist yet in the checked-in raw JSON
   export at all — the live Figma file had moved ahead of the last export.

Both are drift the resolver's own build step cannot see, because both fail
by producing *nothing* rather than an error. This skill exists to check for
exactly these two shapes of silence before a batch run trusts the token
pipeline blind.

## Method

1. **Run the resolver.** Run the repo's token-resolve command (e.g.
   `npm run tokens`, or whatever the repo's `package.json` defines for this —
   check it rather than assuming the exact script name). Capture any
   `Token not found` (or equivalent) error verbatim — do not swallow or
   summarize it away.
2. **Diff live vs. exported, if possible.** If this session has MCP access to
   the live Figma file's variables (`search_design_system`,
   `get_variable_defs`, or equivalent), enumerate the Tier 2/Tier 3 variable
   groups actually referenced by the component(s) in scope and diff them
   against the groups present in the repo's checked-in raw token export
   (`tokens/raw/*.json` or equivalent per the repo's manifest). Report any
   group that exists live but not in the export — this is the "Link" failure
   mode, caught proactively instead of by accident.
3. **Verdict.**
   - **FRESH** — the resolver ran clean and (when checkable) no live group is
     missing from the export. Safe for a batch run to proceed.
   - **STALE** — either the resolver errored, or a live-vs-export diff found
     a gap. Halt.

## On STALE

State plainly and specifically:
- Exactly which token(s)/group(s) are missing (the dot-path or CSS variable
  name, not just "something's wrong").
- That **re-exporting Figma's variables to the raw JSON is very likely a
  design-tool-side step this skill cannot perform headlessly** — no MCP tool
  available in a typical session exports Figma's variables panel to JSON;
  that's usually a manual step in Figma itself (or whatever export tooling
  the team uses) performed by a person with design-file access.
- What file is expected to receive that re-export (the repo's
  `tokens/raw/*.json` path, per its manifest), so the person doing the
  re-export knows exactly where the result needs to land.

Then stop. Do not proceed with a partial or estimated token set.

## Hard rules

- **Never hardcode a missing token to unblock a run.** This is the rule the
  manual sessions this skill is modeled on never broke, and the entire point
  of running this before a batch is to keep that true at scale, without a
  human watching every node.
- **Halt loud, not silent.** A STALE verdict is a full stop with a specific,
  actionable report — never a warning that gets logged and ignored while the
  batch continues anyway.
- **Do not attempt the Figma-side re-export yourself.** If no MCP tool in
  this session can perform it, say so and name the manual step — don't
  fabricate a workaround.
