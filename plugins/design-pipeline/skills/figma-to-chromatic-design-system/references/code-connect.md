# Code Connect emission (forge addendum)

Code Connect makes the Figma↔code link **machine-readable**. Without it, the
mapping lives in prose (component-index, node IDs) and the screen agent
re-derives it every run. With it, `screen-implementer` resolves a Figma node to
the exact library component and props, and Figma Dev Mode shows your real
component snippet instead of generated guesses.

Forge already inspects the Figma node *and* writes the React component in the
same pass, so emitting the mapping is nearly free — it is step 14a in the forge
workflow, run right after the component + story are validated.

## What forge emits

For component `<Name>`, write `src/components/<Name>/<Name>.figma.tsx`:

- `figma.connect(<Name>, "<FIGMA_NODE_URL>", { ... })`
- Map every Figma **variant property** to the React prop via `figma.enum(...)`.
- Map boolean Figma props via `figma.boolean(...)`.
- Map text/slot layers via `figma.string(...)` / `figma.children(...)`.
- The `example` returns the real component with the mapped props.

Map only props that exist on the component's real API (from the component spec).
If a Figma variant has no corresponding prop, that is a forge finding — log it as
a `never_invent` UNKNOWN, do not invent a prop.

## Setup (once per library repo)

```bash
npm i -D @figma/code-connect
npx figma connect --help   # verify CLI
```

Publishing mappings to Figma (so Dev Mode shows them) is a CI step alongside the
Chromatic publish, using the same Figma access token pattern as a **secret** —
never hardcoded, never pasted into chat (same rule as CHROMATIC_PROJECT_TOKEN).

## Validation

- `npx figma connect parse` must succeed for every `*.figma.tsx`.
- Every component in the component-index has a matching `.figma.tsx`. Missing
  mappings are the root cause of `screen-implementer` substitution bugs, so
  treat Code Connect coverage as a gate, exactly like token coverage.

See `examples/Button.figma.tsx` for a worked example.
