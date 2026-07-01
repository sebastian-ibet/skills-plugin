---
name: handoff-strip
description: Use on a signed-off prototype to produce the clean frontend engineering will build on. Removes the simulated/mock layer (mock API, fixtures, scenario switcher, fake-auth) while preserving every library-component import and the visual JSX exactly as presented. Produces a deviation report of everything removed and every seam left for the real data layer.
---

# Handoff Strip

## Why this exists

The prototype was the pitch; once stakeholders sign off, engineering needs the
real frontend — the same screens and components, minus the throwaway simulation.
If the mock logic was woven through the screens, this step is surgery. If the
prototype kept clean boundaries (it should have — see below), this step is
mechanical: delete three known things and rewire the seams.

This skill assumes the prototype consumed components from the published library
(`nt-design-system`). Those components are production code already and
are **never** touched here. Only prototype-local scaffolding is removed.

## Preconditions

Read the manifest (`.claude/prototype.config.md`). Confirm:
- `library_package` is set and screens import components from it (not from a
  local `components_dir`). If screens contain locally-built components, STOP —
  this prototype violated the consume-only rule and needs review, not a strip.
- The prototype is marked signed-off.

## What gets removed (the throwaway layer)

1. **Mock API layer** — the MSW handlers / fake fetch layer. Replace with the
   real data-fetching seam: leave typed, clearly-marked `// TODO: real endpoint`
   stubs with the same function signatures the screens already call, so wiring
   real data is fill-in-the-blanks, not re-architecture.
2. **Fixtures / seed data** — `/fixtures`, hardcoded balances/lists, sessionStorage
   seeding. Removed; the data seam above replaces it.
3. **Scenario switcher + harness** — the dev controls panel, screen-jump,
   `NotYetImplemented` placeholders, `?controls=false` presentation plumbing.
4. **Faked behaviour** — fake-auth that always succeeds, simulated timers that
   stand in for server round-trips. Replace each with a marked seam, not a guess
   at the real flow.

## What is preserved exactly

- Every import from the library package, untouched.
- All visual JSX / layout / token usage as presented and signed off.
- Routing and screen structure (minus harness-only routes).
- Component composition.

## Method

1. Inventory the mock layer from the manifest's documented boundaries
   (`shared_state`, fixtures dir, mock API dir, harness dir).
2. Remove each, replacing data-producing mocks with typed seams (same signatures).
3. Leave state that is genuinely UI state; remove only state that simulated a
   backend.
4. Run `typecheck` and `lint`; fix only what the strip introduced.
5. Produce a **deviation report**: every file/層 removed, every seam left (with
   its expected real data shape), and anything that could not be cleanly
   separated (flag for engineering rather than guessing).

## Hard rules

- Never modify library-package components.
- Never invent the real data flow — leave a typed seam and a TODO, and report it.
- One clean pass + report; do not also start building the real backend.

## The design dependency

This skill is only mechanical if the prototype was built with clean boundaries
from the start: mock API behind one layer, fixtures in one dir, harness behind a
provider. That is a requirement on `screen-implementer` / the prototype scaffold,
not something this skill can retrofit. If the boundaries weren't kept, the
deviation report will be long — which is itself the signal to tighten the
scaffold next time.
