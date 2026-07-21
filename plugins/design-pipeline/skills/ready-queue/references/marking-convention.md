# Marking components Ready for dev

A one-pager for design: how to mark readiness so `ready-queue` can actually
read it.

## Mark at the component-set level

Set **Ready for development** on each individual component set — not on the
page or section that contains it. Every component set you mark should sit
directly under its category page or section (e.g. "Buttons", "Cards",
"Tooltip"), not nested inside another already-marked node.

## Why it has to be this granular

Figma's API only lets a node's dev status be read individually when that node
sits directly under a page or section. If you mark a whole page or section
ready instead of the component sets inside it, there is no way to tell which
specific components are actually done — the tooling can see "this section is
ready" but can't resolve that down to "these three component sets are ready
and this fourth one isn't." Marking at the wrong level doesn't fail loudly; it
just produces a queue that can't tell you what's really ready, which is worse
than marking nothing at all.

## What happens after you mark something ready

- The next `ready-queue` run picks it up and adds it to the forge queue.
- If you edit a component that's already been forged, Figma automatically
  flips it to **Changed** — you don't need to re-mark it. That's what tells
  `ready-queue` to queue it as a re-forge instead of a fresh one.

## What this does NOT cover

Editing a token, variable, or style value that a component references does
**not** trip Figma's Changed flag — the component node itself hasn't changed,
only the value it points at. That kind of drift is what the `token-refresh`
skill checks separately, before any batch forge run. Don't rely on marking or
re-marking components to catch token drift — it won't.
