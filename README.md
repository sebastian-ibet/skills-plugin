# Design Pipeline

This repo is **the tooling**, not the design system. It is a Claude Code
*marketplace* containing one plugin, `design-pipeline`, that turns Figma
components into a Storybook library, assembles high-fidelity prototypes from
that library, and hands engineering a clean frontend.

It does **not** contain any components, tokens, or product code. Those live in
the design-system library repo. This separation is the whole point: the plugin
is tooling that operates *on* repos, so it can serve many of them — the
library, every prototype, and every brand skin — without being copied into each
one by hand.

## The two repos, and how they relate

```
┌─────────────────────────────┐         installs as a Claude Code plugin
│  design-pipeline      │  ───────────────────────────────────────►  (this repo)
│  (THIS REPO — the tooling)   │                                            forge · audit ·
│  forge / audit / weave /     │                                            screen assembly ·
│  strip + manifest template   │                                            QA · strip
└─────────────────────────────┘
              │ operates on
              ▼
┌─────────────────────────────┐         publishes a versioned npm package
│  nt-token-component-framework│  ───────────────────────────────────────►  nt-design-system
│  (THE LIBRARY — the product) │                                            + Storybook on Chromatic
│  tokens · components ·       │
│  stories · Code Connect      │
└─────────────────────────────┘
              │ installed by  (npm install nt-design-system)
              ▼
┌─────────────────────────────┐
│  a prototype repo            │   imports components from the library,
│  (THE PITCH — disposable)    │   adds simulated state, presents to stakeholders,
│  screens · mock layer ·      │   then strips the mock layer for engineering.
│  scenario switcher           │
└─────────────────────────────┘
```

The library is a dependency the prototype **installs**, exactly like
`react-router-dom` — you are simply the author on both sides of the install this
time. Nothing is ever merged or copied between repos; the connection is a
versioned package plus Code Connect mappings.

## Install the plugin

```bash
# one-time: register this marketplace (must be a public or org-accessible repo)
/plugin marketplace add REPLACE-ME-ORG/design-pipeline

# install the plugin (project scope = shared with the team via .claude/settings.json)
/plugin install design-pipeline@design-tooling --scope project

# reload so the skills/agents load
/reload-plugins
```

To iterate locally before publishing:

```bash
claude --plugin-dir ./plugins/design-pipeline
```

## What's inside the plugin

See `plugins/design-pipeline/README.md` for the full pipeline. In short:

| Piece | Type | Role |
|---|---|---|
| `figma-to-chromatic-design-system` | skill | **Forge / the bridge.** Figma component → tokenized React component + Storybook story + **Code Connect** → Chromatic. Runs in the *library* repo. |
| `figma-audit` | skill | Pre-flight gate. Refuses to forge a Figma component that isn't built to spec (no variants / no auto-layout / unbound variables). |
| `handoff-strip` | skill | Removes the mock layer from a signed-off prototype, leaving the real frontend. |
| `spec-extractor` | agent | Distills one Figma screen into a clean spec (keeps noisy MCP output out of the orchestrator). |
| `screen-implementer` | agent | Assembles one screen **from the published library only** (allow-list; flags unmapped nodes). Runs in the *prototype* repo. |
| `fidelity-qa` | agent | Playwright screenshot vs Figma node; structured gap list. Read-only. |
| `docs-keeper` | agent | Mechanical doc/registry sync. |
| `templates/prototype.config.md` | template | The per-repo manifest every consuming repo copies into `.claude/` and fills in. |

## Setup notes before first push

- Replace `REPLACE-ME-ORG` in `.claude-plugin/marketplace.json` and in this
  README with your GitHub org/user.
- The repo must be reachable by your team (public, or private with access) for
  `/plugin marketplace add` to fetch it.
- Bump `version` in `plugins/design-pipeline/.claude-plugin/plugin.json` on each
  meaningful change; consumers update with `/plugin update`.
