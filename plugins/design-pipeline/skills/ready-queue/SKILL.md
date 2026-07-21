---
name: ready-queue
description: Read-only readiness scanner that reads each component set's Figma Dev Mode devStatus (Ready for development / Changed / unset) via the plugin API, cross-references the repo's real component-index.md, and produces the forge queue (new / re-forge / done / not-ready / ambiguous) that feeds forge-batch — replacing the manual link-paste step figma-page-scan's readiness guess otherwise falls back to. Detects and warns when readiness is marked at the wrong granularity (a whole page/section instead of per component set). Writes nothing, forges nothing.
---

# Ready Queue

## Why this exists

`figma-page-scan` is honest about a real limit: "if no readiness signal is
discoverable, bucket `Not-ready` — never guess." That's the right call when no
signal exists. But Figma Dev Mode's own "Ready for development" status *is* a
real, checkable signal when a library actually uses it — this skill reads it
directly instead of falling back to a guess. It exists specifically for
libraries that mark readiness in Figma itself, so the forge queue comes from
that signal, not from a human re-deciding "is this actually ready?" for every
node on a page.

## The API constraint (read this first)

`devStatus` can only be set on a node sitting directly under a page or
section — it cannot be set on a node nested inside another node that already
carries a `devStatus`. Consequence: a component set is only individually
queryable if it sits directly under a page or section.

If readiness is marked at the section or page level instead of per component
set, this skill must:
1. Still detect it — a page/section carrying `devStatus` is a valid, real
   signal, not noise.
2. Enumerate every component set nested under that ready page/section.
3. Emit a **WARNING**: *"section marked ready — cannot resolve per-component
   readiness; mark at component-set level"* rather than treating those
   component sets as individually confirmed ready.

**Never silently return an empty queue when a page/section is marked ready.**
That combination — a real ready signal present, zero items queued — must
always surface as a WARNING, never as a quiet no-op that looks identical to
"nothing is ready yet."

## What it reads

Via `use_figma` (the same mechanism `figma-page-scan` relies on in practice to
walk pages — not the copilot-style `get_design_context`, which depends on a
live desktop selection and cannot enumerate a page programmatically):

1. For the target library file, execute a script that walks each page/section
   and reads every component set's `devStatus` — `READY_FOR_DEV`, `READY_FOR_DEV`
   with a "Changed" state, or unset.
2. Cross-reference each `READY_FOR_DEV` component set's name against the
   repo's real `component-index.md` — the per-repo file
   `figma-to-chromatic-design-system` maintains wherever it's been
   instantiated in *this* repo. This is **not** the plugin's own
   `skills/figma-to-chromatic-design-system/references/component-index.md`,
   which is a template and stays empty (same distinction `figma-page-scan`
   and `forge-batch` already draw).

## On an API-level read failure

If reading `devStatus` throws an error at the API level — not a per-node
absence, an actual failure (e.g. "not yet supported" on this bridge/Figma
desktop version) — **halt the scan** and report the error plainly as a
tooling/bridge blocker, the same way `token-refresh` halts loud on a STALE
verdict rather than proceeding on a partial or estimated result. Do not let an
API failure silently present as "nothing is ready" — those are different
facts and must never look the same in the output.

## The buckets (exact output)

| Bucket | Rule |
|---|---|
| **Queue (new forge)** | `READY_FOR_DEV`, not in `component-index.md`. |
| **Queue (re-forge)** | `READY_FOR_DEV` with Figma's own "Changed" state, already in the index. Trust Figma's `Changed` flag directly — never compute drift from `updatedAt` timestamps. |
| **Skip (done)** | `READY_FOR_DEV`, in the index, not changed. |
| **Not ready (still in design)** | No `devStatus` set. Ignore — not a finding, just excluded from the queue. |
| **Ambiguous (hold for human)** | Duplicate-named component sets with different `componentKey`s (e.g. two same-named "Tooltip" sets found this session, or the two same-named "Accordion" sets `figma-page-scan`'s own docs cite). Never auto-queued, regardless of `devStatus`. |
| **Excluded (not a component)** | Kitchen-sink/overview frame whose children span multiple `componentKey`s — the same exclusion `figma-page-scan` already applies. Name the bundled components found inside it. |

## Output format

A table with the six buckets above, each row listing component name + node ID
+ one-line reason. End with a single line:

```
Queue for forge-batch: [node IDs from Queue (new forge) + Queue (re-forge)]
```

Followed by a **WARNINGS** section covering:
- Any page/section marked ready at the wrong granularity (per "The API
  constraint" above), naming every component set resolved under it.
- Every `Ambiguous` duplicate found, with both node IDs and the shared name.

## Hard rules

- **Read-only.** Writes nothing, forges nothing — no Write or Edit tools by
  design, matching this plugin's existing read-only skills (`figma-page-scan`,
  `figma-audit`).
- **Never auto-queue an `Ambiguous` duplicate.** Not by recency, not by
  guessing which one "looks more complete" — surface it and stop, same
  standard `figma-page-scan` holds.
- **Never queue a kitchen-sink frame.**
- **Never queue something with no `devStatus`.** Absence of the signal is
  `Not ready`, never an assumption either way.
- **Always read the repo's real `component-index.md`, never the plugin's
  template copy.**
- **Never silently return an empty queue when a page/section is marked
  ready** — resolve it to its component sets and warn about the granularity
  instead.
- **Never silently treat an API-level `devStatus` read failure as "nothing is
  ready."** Halt and report the tooling blocker plainly.
- **Hand the queue to `forge-batch`; never invoke forging itself.**
