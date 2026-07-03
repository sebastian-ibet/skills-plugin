---
name: figma-page-scan
description: Read-only enumerator that builds a forge backlog from a whole Figma library page instead of one node at a time. Scans component sets via search_design_system / get_metadata, keeps only those marked Ready for Development in Figma and not already in the repo's component-index.md, excludes kitchen-sink/overview frames whose children span multiple componentKeys, and flags same-name-different-componentKey duplicates as needing a human canonical pick rather than guessing. Forges nothing and writes nothing — it only produces a queue for forge-batch (or a human) to act on. Use when a human wants "what in this Figma page is actually ready to forge" instead of pasting links one at a time.
---

# Figma Page Scan

## Why this exists

Auditing one link at a time only finds problems a human already suspected —
the wrong node ("Game Carousel" turning out to be a kitchen-sink frame
bundling three unrelated components), duplicate definitions (two separate
plain-named "Accordion" component sets in the same library), and stale
mappings all surfaced this way, by accident, one link at a time. This skill
turns that into a deliberate first pass over an entire page: build the real
backlog, and put the ambiguous cases in front of a human explicitly instead
of leaving them to be discovered one paste at a time.

## Inputs

A Figma library page (or the whole file, if no page is specified) — enough
context to call `search_design_system` and `get_metadata` against it.

## Method

1. Enumerate component sets on the target page via `search_design_system` and
   `get_metadata`.
2. For each component set found:
   - **Readiness.** Check whether Figma marks it Ready for Development
     (however that status is actually surfaced for this library — a status
     field, a naming convention, a page/section location, whatever the
     library's own convention is). If no such signal is discoverable for a
     given node, do not guess readiness — bucket it `Not-ready` with the
     reason "no readiness signal found," rather than assuming ready.
   - **Already forged?** Cross-reference against the repo's real
     `component-index.md` (the per-repo file, not this plugin's own template
     copy under `skills/figma-to-chromatic-design-system/references/` — see
     that skill's own docs for where the real one lives in a given repo).
     Skip anything already listed there, unless the component set's Figma
     `updatedAt` is newer than the index's recorded forge date — in that
     case it's a re-forge candidate, not a fresh one, and should be called
     out distinctly rather than silently merged into `Queued`.
   - **Kitchen-sink exclusion.** If a node's children (the instances inside
     it) resolve to more than one distinct `componentKey`, it's an
     overview/documentation frame bundling multiple real components, not a
     single component to forge — exclude it. (This is exactly the shape
     found and documented this session for a "Game Carousel" frame that
     turned out to combine Game Carousel, Sports, and Latest Winners
     instances.) Name which distinct components were found bundled inside it
     in the exclusion reason.
   - **Duplicate-name detection.** If `search_design_system` returns more
     than one component set with the same name but different `componentKey`s,
     none of them get auto-queued — all go to `Ambiguous`, tagged "needs
     canonical pick." (This is exactly the shape found this session with two
     separate plain-named "Accordion" component sets.) Do not guess which one
     is canonical based on `updatedAt`, alphabetical order, or any other
     heuristic — only a human (or design, directly) can resolve which
     definition is the real one.

## Output

Exactly five buckets, each listing node ID + component name + one-line
reason:

| Bucket | Meaning |
|---|---|
| `Queued` | Ready for development, not already forged, unambiguous — safe to hand to `forge-batch`. |
| `Ambiguous` | Duplicate-named component sets found; needs a human canonical pick before anything in this group can be queued. |
| `Excluded` | Kitchen-sink/overview frame spanning multiple componentKeys — name the bundled components found inside it. |
| `Skipped-existing` | Already in the repo's `component-index.md` and not newer than the recorded forge. |
| `Not-ready` | Not marked ready for development in Figma, or no readiness signal could be found. |

## Hard rules

- **Read-only. No Write or Edit tools by design** — matches this plugin's
  existing read-only agents (`fidelity-qa`, `docs-keeper`). This skill only
  produces a report/queue; it never edits `component-index.md`, never writes
  a component spec, and never invokes `figma-to-chromatic-design-system`
  itself.
- **Never auto-resolve an `Ambiguous` entry.** Not by recency, not by
  guessing which one "looks more complete." Surface it and stop.
- **Never guess readiness.** Absence of a discoverable ready-for-dev signal
  is `Not-ready`, not an assumption either way.
