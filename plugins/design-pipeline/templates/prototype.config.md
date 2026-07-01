# Prototype Process Config

> This is the **contract** the prototyping agents read to learn about THIS project.
> It is the only thing they assume exists. Generated/edited by `prototype-bootstrap`.
> Keep it in version control. If a field is unknown, write `UNKNOWN` — never delete the field.

## Project
- **name:** PUBS FIAT/Crypto Deposit Prototype
- **description:** High-fidelity interactive prototype of the FIAT and crypto deposit flow for the PUBS gaming platform (38 screens).
- **kind:** interactive design-spec-driven prototype

## Stack
- **framework:** React 19
- **language:** TypeScript
- **bundler:** Vite
- **styling:** Tailwind (token-mapped via CSS variables in src/styles/tokens.css)
- **state:** React Context (src/context/PrototypeContext.tsx)
- **routing:** React Router v7 (react-router-dom)
- **package manager:** npm

## Design source
- **tool:** Figma
- **mcp_server_name:** figma-desktop
  - The worker agents' design tools resolve to `mcp__<mcp_server_name>__*`.
  - NOTE: this server name is a UUID inferred from the permission allowlist in
    `.claude/settings.local.json`. MCP server names/UUIDs can change between sessions.
    Confirm the live name with `/mcp` before running the worker agents and update this
    field (and the agent `tools:` lines) if it differs.
- **design_tools:** get_design_context, get_variable_defs, get_screenshot, search_design_system, download_assets, use_figma, get_libraries
- **file_key / project ref:** R3hBfsMU2Kh343eahT0XhS  (Figma file: "PS - FIAT payments design")
- **page / root node:** node 69:10937 (page "Iteration 1")

## Browser (for fidelity QA)
- **browser_mcp_server_name:** playwright
  - Registered in `.mcp.json` at project scope (stdio: `npx @playwright/mcp@latest`).
    Exposes `browser_navigate`, `browser_resize`, `browser_take_screenshot`,
    `browser_snapshot` (`mcp__playwright__*`), wired into the `fidelity-qa` agent.
  - First invocation per machine downloads a browser binary (~1 min). Requires the
    dev server running at `dev_url`.
  - History: the original allowlist referenced a `Claude_Preview` / `preview_start`
    server that does not exist in this environment; replaced with Playwright 2026-06-17.
- **dev_url:** http://localhost:5173

## Paths (relative to project root)
- **context_doc:** docs/PROJECT_CONTEXT.md
- **token_mapping:** docs/TOKEN_MAPPING.md
- **specs_dir:** docs/SCREEN_SPECS/
- **component_registry:** docs/COMPONENT_REGISTRY.md
- **impl_log:** docs/IMPLEMENTATION_LOG.md
- **unknowns:** docs/UNKNOWNS.md
- **screens_dir:** src/screens/
- **components_dir:** src/components/   # in a PROTOTYPE repo this holds prototype-only glue, NOT design-system components
- **library_package:** nt-design-system   # the published design-system library the prototype consumes (omit in the library repo itself)
- **routes_file:** src/App.tsx
- **screen_registry:** src/types/index.ts   # SCREENS[] array powers the screen-jump panel
- **shared_state:** src/context/PrototypeContext.tsx

## Commands
- **install:** npm install
- **dev:** npm run dev
- **build:** npm run build
- **lint:** npm run lint
- **typecheck:** npx tsc -b --noEmit

## Process rules (gates) — set true/false per project
- **approval_gate:** true        # a human must approve each spec before implementation
- **tokens_only:** true          # styling values must trace to a token; no raw hex / default palette
- **never_invent:** true         # missing values are logged as UNKNOWN and stop work — never guessed
- **one_screen_at_a_time:** true # finish + log a screen before starting the next
- **spec_first:** true           # every screen needs an approved spec before code

## Project-specific conventions (free text — fill in what matters)
- Token system lives in `src/styles/tokens.css` as CSS variables (`--color-*`), sourced from
  the "PS Token & component library" Figma collections `2-semantic-colour` and `3-component`.
  Tokens whose hex is not yet resolved are written `UNKNOWN` — never estimate them.
- Screens render inside a centred `MobileFrame` (src/components/shared/layout/MobileFrame.tsx).
- A `PrototypeControls` panel (src/prototype/PrototypeControls.tsx) provides screen
  jumping and auth/wallet state toggles, driven by the `SCREENS[]` array in src/types/index.ts.
- Not-yet-built routes render `<NotYetImplemented nodeId=... label=... />`
  (src/prototype/NotYetImplemented.tsx) — these are placeholders, not finished screens.
- Shared prototype state (auth, accountMenu, walletConnected, activeCurrencyType, activeCryptoTab)
  lives in PrototypeContext.
- No animations unless a screen spec explicitly defines them.
- A future task is a `?controls=false` mode for mobile-device access on the local network
  (deferred until prototype completion).

## Known traps (free text — things a fresh agent could get wrong)
- **FORBIDDEN: screen-first component creation.** In a prototype repo, screens must
  import components ONLY from `library_package`. An agent must never create a new
  component under `components_dir` to satisfy a screen — if a needed component or
  variant is missing from the published library, STOP and emit an `UNMAPPED`
  blocker. New components are authored in Figma and forged into the LIBRARY repo,
  then the prototype installs the new library version. (Evidence this matters:
  components forged from the Figma library are fully tokenized; components created
  ad hoc inside screens drift to inline hex and slip `tokens_only`.)
- The unified `DepositScreen` (src/screens/deposit/DepositScreen.tsx) intentionally serves
  MULTIPLE routes by design — FIAT card, crypto transfer no-wallet, and crypto transfer
  with-wallet all render it; the route path is an input that drives its branch/state. This is
  NOT a bug. Do not split or "fix" it. (It was previously refactored from separate
  fiat-deposit / crypto-deposit screen files into this single component.)
- Two duplicate success-screen pairs exist by design (FIAT success 200:52431 vs 200:47407;
  crypto success variants). Each member needs distinct inbound navigation — do not merge them.
- The canonical agent names used by this skill/orchestrator are `spec-extractor`,
  `screen-implementer`, `fidelity-qa`, `docs-keeper`. The project docs
  (PROJECT_CONTEXT.md "Skill Workflow") still reference older names
  `figma-screen-inspector` and `screen-spec-implementer` — treat those as aliases for
  `spec-extractor` and `screen-implementer` respectively.
