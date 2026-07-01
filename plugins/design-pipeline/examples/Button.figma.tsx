// Example Code Connect mapping — forge emits one of these per component.
// Modelled on the library's real Button (variants Primary/Secondary/Outline/
// Neutral/Inverse/Destructive/Banner; sizes Small/Medium/Large; states as real
// interactive states; slots: leading/trailing icon, icon-only).
//
// Replace FIGMA_NODE_URL with the Button component-set URL. Map only props that
// exist on Button's real API (per docs/component-specs/button.md). A Figma
// variant with no matching prop is a forge UNKNOWN — never invent a prop.

import figma from "@figma/code-connect";
import { Button } from "./Button";

figma.connect(Button, "FIGMA_NODE_URL", {
  props: {
    variant: figma.enum("variant", {
      Primary: "primary",
      Secondary: "secondary",
      Outline: "outline",
      Neutral: "neutral",
      Inverse: "inverse",
      Destructive: "destructive",
      Banner: "banner",
    }),
    size: figma.enum("size", {
      Small: "small",
      Medium: "medium",
      Large: "large",
    }),
    // Interactive states (hover/pressed/focus) are real CSS states, not props —
    // they are intentionally NOT mapped. Only "disabled" is a prop.
    disabled: figma.enum("state", { Disabled: true }),
    leadingIcon: figma.boolean("leadingIcon", {
      true: figma.instance("leadingIcon"),
      false: undefined,
    }),
    trailingIcon: figma.boolean("trailingIcon", {
      true: figma.instance("trailingIcon"),
      false: undefined,
    }),
    label: figma.string("label"),
  },
  example: ({ variant, size, disabled, leadingIcon, trailingIcon, label }) => (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      leadingIcon={leadingIcon}
      trailingIcon={trailingIcon}
    >
      {label}
    </Button>
  ),
});
