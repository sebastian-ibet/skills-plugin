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
