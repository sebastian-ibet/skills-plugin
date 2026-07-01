## React API

Document the intended props before implementation.

```ts
type [ComponentName]Props = {
  // Define props here after Figma inspection
};
```

Notes:

- Do not over-engineer the API.
- Start with what is needed to represent the Figma component accurately.
- Add product logic later only if required.

## Accessibility notes

- Keyboard behaviour:
- Focus behaviour:
- ARIA requirements:
- Disabled behaviour:
- Error messaging:
- Screen reader considerations:
- Interaction notes:

## Storybook coverage

Required stories:

- [ ] Default
- [ ] Variants
- [ ] Sizes, if applicable
- [ ] States
- [ ] Disabled
- [ ] Error, if applicable
- [ ] Slot combinations
- [ ] Long content
- [ ] Responsive or narrow container behaviour, if relevant
- [ ] Playground / controls
- [ ] Controlled example, if relevant
- [ ] Uncontrolled example, if relevant

## Validation checklist

- [ ] Figma component was inspected through MCP.
- [ ] Relevant token group was identified.
- [ ] `docs/TOKEN_CONTRACT.md` was followed.
- [ ] No Tier 1 primitive tokens are used directly.
- [ ] No tokens were invented.
- [ ] Missing tokens were documented.
- [ ] Resolver was updated only where needed.
- [ ] Generated token CSS works.
- [ ] React component renders locally.
- [ ] Storybook stories were added.
- [ ] Variants are covered.
- [ ] States are covered.
- [ ] Slots are covered.
- [ ] Accessibility behaviour was considered.
- [ ] Visual validation against Figma was done.
- [ ] `docs/VALIDATION_NOTES.md` was updated.
- [ ] `docs/HANDOFF_CURRENT.md` was updated.
- [ ] `.claude/skills/figma-to-chromatic-design-system/references/component-index.md` was updated.

## Validation notes

Document visual mismatches, token gaps, implementation decisions, and follow-up work.

### Matches Figma

-

### Differences from Figma

-

### Token gaps

-

### Accessibility gaps

-

### Follow-up tasks

-

## Final status

Current status:
[Not started / Work in progress / Implemented locally / Storybook ready / Chromatic validated]

Ready for commit:
[Yes / No]

Ready for Chromatic validation:
[Yes / No]