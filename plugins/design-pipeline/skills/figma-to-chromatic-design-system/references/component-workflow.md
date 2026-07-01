# Component Creation Workflow

For every new component:

1. Confirm component scope.
2. Run `pwd`.
3. Run `git status`.
4. Inspect the Figma component through MCP.
5. Identify anatomy, variants, states, slots, and layout.
6. Identify the relevant Tier 3 token group.
7. Read `docs/TOKEN_CONTRACT.md`.
8. Create or update `docs/component-specs/[component-name].md`.
9. Define anatomy.
10. Define props/API.
11. Extend resolver only if needed.
12. Generate tokens.
13. Build incrementally.
14. Add Storybook stories.
15. Run locally.
16. Validate against Figma.
17. Update `docs/VALIDATION_NOTES.md`.
18. Update `docs/HANDOFF_CURRENT.md`.
19. Update `references/component-index.md`.
20. Commit and push only after local validation.