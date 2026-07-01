# Validated Figma to Chromatic Workflow

The validated workflow is:

Figma component inspection
→ Figma variable JSON export
→ TOKEN_CONTRACT.md
→ token resolver
→ React component
→ local preview
→ Storybook
→ GitHub
→ Chromatic

The workflow is intentionally sequential.

Do not jump straight from Figma to a finished React component.

The system exists to preserve the relationship between Figma, tokens, code, Storybook, and Chromatic.