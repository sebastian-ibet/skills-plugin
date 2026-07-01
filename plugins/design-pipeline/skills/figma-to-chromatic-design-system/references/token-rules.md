# Token Rules

## Tier 1: Primitive tokens

Primitive tokens are raw values.

Do not use Tier 1 primitive tokens directly in components.

## Tier 2: Semantic tokens

Semantic tokens describe reusable product-level meaning.

Use these for shared surfaces, text, borders, radius, spacing, typography, and layout decisions.

## Tier 3: Component tokens

Component tokens describe styling for a specific component.

Prefer Tier 3 component tokens when a component-specific token group exists.

## Missing tokens

Do not invent tokens.

If a token is missing, document the gap in the component spec and validation notes.

## Implementation values

Implementation values are allowed only when documented in TOKEN_CONTRACT.md or the component spec.

A value should become a token only when it needs theming control, system-wide reuse, cross-component consistency, or designer control through Figma variables.