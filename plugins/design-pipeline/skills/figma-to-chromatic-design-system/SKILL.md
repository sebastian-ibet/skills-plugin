---
name: figma-to-chromatic-design-system
description: Use when creating, auditing, documenting, or updating Figma-driven React components, design tokens, Storybook stories, Chromatic builds, Figma MCP inspection, or component specs in this repository.
---

# Figma to Chromatic Design System Skill

## Purpose

Use this skill for all work related to this repository's Figma-to-code component workflow.

The goal is not to generate arbitrary UI quickly. The goal is to create frontend-ready component foundations that respect:

- The real Figma design system
- Exported Figma variables
- The project token taxonomy
- TOKEN_CONTRACT.md
- The token resolver
- React component structure
- Storybook review
- Chromatic publishing

The validated chain is:

Figma component inspection
→ Figma variable JSON export
→ TOKEN_CONTRACT.md
→ token resolver
→ React component
→ local preview
→ Storybook
→ GitHub
→ Chromatic

## Optional upstream workflow

For new, undefined, or pattern-heavy components and flows, the `mobbin-pattern-to-figma-workflow` skill (`~/.claude/skills/mobbin-pattern-to-figma-workflow/`) can be used before this skill to research common UX/UI patterns, compare viable directions, create a prototype-level artifact, and prepare a Figma creation checklist.

This upstream workflow is optional. It is not required when the component already exists in the Figma design system.

This `figma-to-chromatic-design-system` skill can be run directly whenever the Figma component is already confirmed as the source of truth and is ready for inspection, token mapping, Storybook implementation, and Chromatic review.

## Authoritative files

These files are the source of truth:

- docs/TOKEN_CONTRACT.md
- docs/VALIDATION_NOTES.md
- docs/HANDOFF_CURRENT.md
- docs/component-specs/[component-name].md
- tokens/raw/[token-export].json
- tokens/scripts/resolve-tokens.mjs
- src/components/
- .storybook/
- .github/workflows/chromatic.yml

The files inside this skill are guidance and summaries. They do not replace the authoritative repo docs.

## When to use this skill

Use this skill when the task involves:

- Inspecting Figma components through MCP
- Reading exported Figma variable JSON
- Applying token rules
- Creating or updating React components
- Creating or updating Storybook stories
- Publishing or validating through Chromatic
- Creating component specs
- Auditing token usage
- Updating design system documentation
- Continuing work on an existing component

## Before editing files

Always do this before making code changes:

1. Run `pwd`.
2. Run `git status`.
3. Read `docs/HANDOFF_CURRENT.md`.
4. Read or reference `docs/TOKEN_CONTRACT.md`.
5. Read `references/component-index.md`.
6. If working on an existing component, read its component spec in `docs/component-specs/`.
7. If working on a new component, create a component spec before implementation.
8. Inspect the real Figma component through MCP.
9. Identify anatomy, variants, states, slots, auto layout behaviour, and relevant token groups.
10. Propose the smallest safe implementation plan before editing.

## Required workflow for every new component

1. Confirm the component scope.
2. Check current folder with `pwd`.
3. Check workspace state with `git status`.
4. Inspect the real Figma component through MCP.
5. Identify variants, states, slots, anatomy, layout, and token references.
6. Identify the relevant Tier 3 component token group in the exported Figma token JSON.
7. Read or reference `docs/TOKEN_CONTRACT.md`.
8. Create or update `docs/component-specs/[component-name].md`.
9. Define component anatomy before implementation.
10. Define the React props/API before implementation.
11. Extend the resolver only if required for this component.
12. Generate or update token CSS.
13. Build the component incrementally.
14. Use resolver-generated CSS variables in component CSS.
15. Add or update Storybook stories.
16. Run the component locally.
17. Validate visually against Figma.
18. Document findings in `docs/VALIDATION_NOTES.md`.
19. Update `docs/HANDOFF_CURRENT.md`.
20. Update `.claude/skills/figma-to-chromatic-design-system/references/component-index.md`.
21. Confirm the component is ready for commit, push, GitHub Actions, and Chromatic validation.

## Token rules

- Never use Tier 1 primitive tokens directly in components.
- Prefer Tier 3 component tokens when a component-specific token group exists.
- Use Tier 2 semantic tokens for shared radius, border width, spacing, typography, surfaces, and layout.
- Do not invent tokens.
- If a token is missing, document the gap instead of hardcoding silently, and give the user the option to create one. The token you propose NEEDS TO FOLLOW the rules established in the TOKEN_CONTRACT.md.
- Component implementation values are allowed only when documented in TOKEN_CONTRACT.md or the component spec.
- Resolver-generated CSS variables are the source consumed by components.
- Do not manually maintain resolved token CSS except for temporary validation.

## Resolver rules

- Keep the resolver small and understandable.
- Read exported Figma token JSON.
- Resolve aliases through Tier 3, Tier 2, and Tier 1.
- Preserve CSS variable names consumed by components unless migrating component CSS at the same time.
- Normalize invalid CSS output where needed.
- Generate token CSS before Storybook or Chromatic builds.
- Only extend the resolver for token groups needed by the current component.
- Do not introduce Style Dictionary or a larger token pipeline unless clearly justified.

## Component implementation rules

- Work one component at a time.
- Do not generate multiple components unless explicitly requested.
- Do not skip Figma inspection.
- Do not assume Figma variants, states, slots, or layout.
- Do not over-engineer the React API.
- Build complex components in controlled passes.
- Validate each major pass before continuing.
- Use documented implementation values only when tokenizing the value would not yet add system-wide value.
- Component specs live only in `docs/component-specs/[component-name].md`.
- Do not create duplicate component spec files inside `src/components/`.
- Component folders should contain implementation files, styles, stories, and tests only unless explicitly agreed otherwise.

## Storybook rules

Every component should include stories for:

- Default
- Variants
- Sizes, if applicable
- States
- Disabled
- Error, if applicable
- Slot combinations
- Long content
- Responsive or narrow container behaviour, if relevant
- Playground or controls-based example
- Controlled and uncontrolled examples, if relevant

Storybook is the team-facing component review layer.

## Chromatic rules

Chromatic publishes Storybook automatically through GitHub Actions.

The GitHub Action must:

1. Install dependencies.
2. Generate tokens.
3. Build and publish Storybook through Chromatic.

The secret name is:

CHROMATIC_PROJECT_TOKEN

Never ask the user to paste this token into chat.
Never hardcode this token into workflow files.

## Before ending any component session

Always check whether these files need updating:

- docs/component-specs/[component-name].md
- docs/VALIDATION_NOTES.md
- docs/HANDOFF_CURRENT.md
- .claude/skills/figma-to-chromatic-design-system/references/component-index.md

Component specs live only in `docs/component-specs/[component-name].md`. Do not create duplicate per-component spec files inside `src/components/` or inside `.claude/skills/.../references/components/`.

A component is not finished until its component spec, validation notes, handoff state, and Skill component index are up to date.