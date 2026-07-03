---
name: forge-batch
description: Orchestrator for running the audit-then-forge loop across many Figma components unattended. Takes a list of Figma node IDs (or a queue produced by figma-page-scan), runs figma-audit on each, and auto-forges via figma-to-chromatic-design-system only the nodes that come back a clean PASS with zero warnings. Anything with a WARNING or BLOCKER is stopped and collected — with the audit's own text — for human review, never forged automatically. Skips anything already recorded in the repo's component-index.md. Runs the token-refresh drift guard before the loop and halts the whole batch if tokens are stale. Never marks anything visually validated. Use when a human wants to process a backlog of components instead of pasting one Figma link at a time.
---

# Forge Batch

## Why this exists

The manual loop this plugin already teaches — inspect a Figma node with
`figma-audit`, then forge it with `figma-to-chromatic-design-system` — works,
but only scales to as many components as a human is willing to paste links
for, one at a time. This skill runs that same loop across a list, without
loosening any gate that makes the manual version trustworthy. It does not
replace judgment on ambiguous components; it removes the *toil* of running
the loop on the unambiguous ones so a human's attention goes to the ones that
actually need it.

## Inputs

Either of:
- A list of Figma node IDs or node-specific URLs, provided directly.
- A queue handed off from `figma-page-scan` (its `Queued` bucket only — never
  its `Ambiguous` bucket; those are not this skill's to resolve).

## Preflight — run before touching any node

Invoke `token-refresh` once, before the loop starts. If its verdict is
**STALE**, halt the entire batch immediately — do not process a single node —
and surface `token-refresh`'s report verbatim (which token group(s) are
missing and what needs re-export). A batch run against stale tokens is worse
than no run: it will either silently mis-forge or fail loudly mid-batch on
whichever node happens to need the missing token first.

## Per-node loop

For each node in the input list, in order:

1. **Skip check.** Read the repo's real `component-index.md` — the per-repo
   file that `figma-to-chromatic-design-system` maintains wherever it's been
   instantiated in *this* repo (e.g.
   `.claude/skills/figma-to-chromatic-design-system/references/component-index.md`
   or equivalent per that repo's manifest). This is **not** the plugin's own
   `skills/figma-to-chromatic-design-system/references/component-index.md`,
   which is a template and stays empty. If the node's component name is
   already recorded there, skip it — bucket: `skipped-existing`.
2. **Audit.** Invoke `figma-audit` on the node. Read its verdict and full
   findings.
3. **Clean pass → forge.** Only if the audit comes back with **zero**
   findings at WARNING or BLOCKER severity (a genuinely clean `READY TO
   FORGE`, not "ready with warnings") invoke `figma-to-chromatic-design-system`
   to forge it. This is intentionally stricter than ad hoc manual sessions,
   where a human sometimes chooses to forge through documented warnings —
   batch mode has no per-node human judgment available, so it requires the
   audit to have nothing left to judge. Bucket: `forged`.
4. **Any WARNING → stop, don't forge.** Do not forge. Record the node's ID,
   name, and the audit's findings verbatim (do not paraphrase or summarize
   away specifics) for the human review list. Bucket: `stopped-on-warnings`.
5. **BLOCKER → stop, don't forge.** Same as above. Bucket: `blocked`.

Process nodes independently — one node's audit or forge failure does not stop
the batch from continuing to the next node (only a STALE `token-refresh`
verdict halts the whole batch, in preflight).

## Output

A summary table with exactly these buckets, each listing node ID + component
name + one-line reason:

| Bucket | Meaning |
|---|---|
| `forged` | Clean audit, forged successfully. |
| `stopped-on-warnings` | Audit had ≥1 WARNING; not forged; full audit text attached for review. |
| `blocked` | Audit had ≥1 BLOCKER; not forged; full audit text attached for review. |
| `skipped-existing` | Already in the repo's `component-index.md`. |

Followed by the **Storybook build result**: run the repo's build-storybook
command (e.g. `npm run build-storybook`) once, after the loop, covering
everything forged in this run, and report pass/fail plus any new story count.

## Hard rules

- **Never forge a non-clean audit.** WARNING and BLOCKER both disqualify a
  node from auto-forge, no exceptions, no "forge anyway with a note."
- **Never re-forge an existing component.** The skip check runs before the
  audit, not after — an already-recorded component is never even audited
  again by this skill (a human re-running `figma-audit` directly on it, for a
  known Figma change, is a separate, deliberate action outside this loop).
- **Never invent tokens.** If forging a node would require inventing a token
  `figma-to-chromatic-design-system` can't find, that is a forge failure for
  that node — move it out of `forged` and into a reported failure, never
  patch over it with an invented or hardcoded value.
- **Write only to the repo's `docs/` and component directories** — the exact
  boundary `figma-to-chromatic-design-system` already respects. Never write
  to the plugin itself, and never write outside the paths that skill's own
  manifest/contract defines for the repo it's running in.
- **Never mark anything "validated."** Every component spec this plugin
  produces ends with build/typecheck confirmed but visual/computed-style
  validation left to a human — this skill does not change that. Do not tick
  a validation checklist item, do not set a component's status to
  "Validated," and do not claim visual correctness anywhere in its output.
