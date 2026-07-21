# design-pipeline

The Figma → Storybook → prototype → handoff pipeline, as Claude Code skills and
agents. The shape it enforces:

> **Storybook is the product. The prototype is the pitch. Forge is the bridge.
> The page-build escape hatch needs a written rule.**

## The pipeline, end to end

```
            ┌────────────── runs in the LIBRARY repo ──────────────┐
  Figma     │  figma-audit  →  figma-to-chromatic-design-system     │  → Chromatic
  component │  (structure   │  (forge: tokens + React + story +      │     (published
            │   gate)       │   Code Connect)                        │      Storybook)
            └───────────────────────────────────────────────────────┘
                                     │  publishes  nt-design-system
                                     ▼
            ┌────────────── runs in a PROTOTYPE repo ──────────────┐
  Figma     │  spec-extractor → screen-implementer → fidelity-qa    │  → preview URL
  screens   │  (distill)       (assemble from         (Playwright   │     (stakeholder
            │                   library ONLY)          vs Figma)     │      sign-off)
            └───────────────────────────────────────────────────────┘
                                     │  on sign-off
                                     ▼
                               handoff-strip
                         (remove mock layer → clean frontend → engineering)
```

## Which piece runs where

**Library repo** (`nt-token-component-framework` and any future brand library):
- `figma-audit` — pre-flight; refuses to forge an ill-formed Figma component.
- `figma-to-chromatic-design-system` — the forge. Emits component + story +
  **Code Connect mapping**, publishes via Chromatic, and (new) publishes the
  versioned npm package consumers install.

**Prototype repo** (one per pitch; disposable):
- `spec-extractor`, `screen-implementer`, `fidelity-qa`, `docs-keeper` — author
  the prototype from the *published library only*.
- `handoff-strip` — on sign-off, strips the mock layer.

The five process gates (`approval_gate`, `tokens_only`, `never_invent`,
`one_screen_at_a_time`, `spec_first`) live in each repo's
`.claude/prototype.config.md`, copied from `templates/prototype.config.md`.

## The one rule that holds it together

`screen-implementer` may **not** create components. It imports from the
published library and flags anything missing as `UNMAPPED`. Screen-first
component creation is forbidden and is written into the manifest's *Known traps*
so a future session can't reintroduce it. The reason is proven in the library
repo itself: components forged from the Figma library (e.g. `InputField`) are
fully tokenized; components created ad hoc inside screens drift to inline hex.
Library-first is the quality mechanism, not a preference.

## The escape hatch (write this rule for your team)

When a dev building a non-prototype page needs a component design hasn't
authored yet, the default is: route it back to design, who authors it in Figma
(optionally via the upstream `mobbin-pattern-to-figma-workflow` skill), then
forge regenerates it into the library. A dev may build a *provisional* component
only if it is clearly flagged un-blessed in Storybook and is not canonical until
design authors the Figma version. Decide and document this explicitly — under
deadline pressure, an unwritten rule defaults to "dev builds it locally," and
within a year you have two sources of truth.

## Code Connect

Forge emits a `<Component>.figma.tsx` mapping per component
(`@figma/code-connect`). This makes the Figma↔code link machine-readable, lets
`screen-implementer` resolve a Figma node to the exact library component, and
makes Figma Dev Mode show your real component snippet. See
`skills/figma-to-chromatic-design-system/references/code-connect.md` and
`examples/Button.figma.tsx`.

## The automation layer

The library-repo half of the pipeline (`figma-audit` → forge) works one
Figma link at a time by design — a human decides which node to point it at.
The automation layer runs that same loop across many components without
touching either of `figma-audit` or `figma-to-chromatic-design-system`
themselves, and without weakening either gate that makes the manual loop
trustworthy: a non-clean audit is never forged, and nothing is ever marked
visually validated by a machine.

```
  trigger                    loop                        guard              delivery
┌──────────────┐   ┌─────────────────────────┐   ┌────────────────┐   ┌──────────────────┐
│ schedule /    │──▶│ figma-page-scan          │   │ token-refresh  │   │ forge-batch opens │
│ workflow_     │   │ (enumerate a Figma page, │──▶│ (halts the     │──▶│ a PR: summary +   │
│ dispatch, via │   │  exclude kitchen-sink    │   │  batch if      │   │ human review      │
│ templates/    │   │  frames, flag duplicate- │   │  tokens are    │   │ checklist —       │
│ forge.yml     │   │  named sets as Ambiguous)│   │  stale)        │   │ visual check      │
└──────────────┘   └─────────────────────────┘   └────────────────┘   │ stays a human step │
                                                                        └──────────────────┘
```

- **`token-refresh`** — runs before anything else touches Figma. Verdict
  `FRESH` or `STALE`; a stale token pipeline halts the whole run rather than
  forging blind against it.
- **`figma-page-scan`** — read-only. Turns "audit whatever link a human
  pastes" into a real backlog: `Queued / Ambiguous / Excluded /
  Skipped-existing / Not-ready`. Never resolves an `Ambiguous` duplicate
  itself — that's a canonical-pick decision for a human or design.
- **`forge-batch`** — the orchestrator. Runs `figma-audit` on each queued
  node and auto-forges via `figma-to-chromatic-design-system` only a
  genuinely clean, zero-warning `PASS`. Anything with a WARNING or BLOCKER is
  stopped, not forged, and collected with the audit's own text for review.
  Skips anything already in the repo's `component-index.md`.
- **`templates/forge.yml`** — a GitHub Actions template wiring the three
  above together on a schedule or `workflow_dispatch`, ending in a PR with a
  human review checklist (visual check, resolve warnings/blockers, confirm
  Code Connect, mark validated). It ships inert — every secret and trigger is
  a `# TODO:`; nothing runs until a human fills it in and enables it.

Same rule as the rest of this pipeline, just automated: a component is not
done because it built. It's done when a human has looked at it next to
Figma.

### `forge-tree` — compose-aware forging

`forge-batch` processes a flat backlog; `forge-tree` handles a single target
component that *composes* others as nested instances (a `Card` containing a
`Button` containing an `Icon`). It resolves the full nested-instance dependency
graph, forges children before parents, skips anything already in the repo's
`component-index.md`, and only then forges the target. It detects and refuses
dependency cycles, stops if a dependency is unreachable through the Figma MCP or
is an ambiguous duplicate/kitchen-sink frame, and shows the resolved forge order
for human approval before forging anything. Like the rest of the layer it only
orchestrates `figma-audit` and `figma-to-chromatic-design-system` — it never
reimplements them, never forges a non-clean audit, and never marks anything
validated.
