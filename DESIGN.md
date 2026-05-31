---
version: alpha
name: Pulse
description: >-
  The visual identity of Pulse, the Core Web Vitals dashboard —
  a warm, editorial system pairing a cream paper canvas with a serif display
  voice, an olive-lime accent, and soft pill-shaped controls.
colors:
  primary: "#b2c248" # Olive — brand accent, links, active states
  primary-bright: "#b2c248" # Lime — highlight wash, "dancing bars", chips
  ink: "#292929" # Near-black — body ink and primary (dark) buttons
  surface: "#f7f7f2" # Cream paper — dominant page background
  surface-elevated: "#ffffff" # White — cards, inputs, raised panels
  surface-sunken: "#f2f2ec" # Faint warm gray — recessed wells
  on-surface: "#292929" # Primary text on cream / white
  secondary: "#72726e" # Muted warm gray — secondary text, lead copy
  neutral: "#acada8" # Soft taupe — tertiary text, placeholders, icons
  border: "#d5d5d2" # Hairline dividers and control outlines
  accent-tint: "#f2f6e1" # Pale green wash — accent surfaces, callouts
  warning: "#febe29" # Amber — sparing highlight / status accent
  danger: "#e95d3d" # Warm red — destructive actions, errors
typography:
  display:
    fontFamily: "'Poppins', sans-serif"
    fontSize: 68px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: -1.02px
  headline-lg:
    fontFamily: "'Poppins', sans-serif"
    fontSize: 48px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: -0.72px
  headline-md:
    fontFamily: "'Poppins', sans-serif"
    fontSize: 36px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -0.54px
  headline-sm:
    fontFamily: "'Poppins', sans-serif"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: -0.3px
  lead:
    fontFamily: "'Open Sans', system-ui, sans-serif"
    fontSize: 24px
    fontWeight: 300
    lineHeight: 1.33
    letterSpacing: 0.24px
  body-lg:
    fontFamily: "'Open Sans', system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-md:
    fontFamily: "'Open Sans', system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.33
  body-sm:
    fontFamily: "'Open Sans', system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
  label-sm:
    fontFamily: "'Open Sans', system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.23
    letterSpacing: 0.13px
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  section: 48px
  section-lg: 80px
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "#fcfcf8"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 10px 20px
    height: 36px
  button-primary-hover:
    backgroundColor: "#4e4d4b"
    textColor: "#fcfcf8"
  button-secondary:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.ink}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 8px 16px
    height: 36px
  button-accent:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 10px 20px
    height: 36px
  chip:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.ink}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 6px 12px
  input:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.ink}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.md}"
    padding: 10px 16px
  card:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 16px
  nav:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.ink}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.full}"
    padding: 0 8px
    height: 56px
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
    width: 100%
  panel-sunken:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 16px
  text-muted:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: 4px 8px
  status-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.ink}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 6px 12px
  status-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#000000"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 6px 12px
---

# Pulse Design System

## Overview

Pulse looks less like a SaaS performance dashboard and more like a beautifully
typeset engineering notebook. The brand's whole conceit — a self-hosted,
strictly eHealth-branded alternative to SpeedCurve — is carried by the visual
language: a warm cream paper canvas (`surface` `#f7f7f2`), generous whitespace,
and a confident serif display face that reads like the title page of a
well-made internal report. It is calm, precise, and unhurried, the opposite of
the dense, neon dashboards that dominate web performance tooling.

The personality is **editorial and technical**. The scorecard leads with clear
green/yellow/red signal; diagnostics and trend charts layer underneath for
developers who need the full depth. Color is used sparingly and with intent:
most of the interface is ink-on-cream, and a single **olive-lime accent**
(`primary` `#b2c248`, brightening to `primary-bright` `#b2c248`) signals
life — metric highlights, trend lines, the AI review trigger, active states.
The green feels organic and grounded rather than the cold blue of typical
developer tooling.

Emotionally the system sits at the **professional-but-warm** and **spacious**
end of the spectrum. Controls are fully rounded pills, surfaces are soft white
cards floating on cream with barely-there hairline borders, and shadows are
almost absent — depth comes from tone and outline, not drama. The audience
ranges from front-end developers chasing render-blocking resources to eng leads
tracking regressions week-over-week; the design earns their trust by being
quiet, legible, and unmistakably crafted.

## Colors

The palette is a warm neutral foundation activated by one expressive accent.

- **Primary — Olive `#b2c248`.** The brand's signature green. Used for links,
  active and accent states, and the `button-accent` fill. Its brighter sibling
  **Primary-bright — Lime `#b2c248`** appears as highlight washes, the audio
  waveform bars, and decorative emphasis. A pale **Accent-tint `#f2f6e1`**
  backs chips, badges, and soft callout surfaces.
- **Ink `#292929`.** The near-black used for almost all text and for the
  _primary_ (dark) call-to-action buttons. It is warm rather than pure black,
  keeping the page friendly.
- **Surfaces.** `surface` `#f7f7f2` is the dominant cream page background;
  `surface-elevated` `#ffffff` lifts cards, inputs, and the floating nav;
  `surface-sunken` `#f2f2ec` recesses wells and grouped fields.
- **Text tones.** `on-surface` `#292929` for primary copy, `secondary`
  `#72726e` for lead/secondary text, and `neutral` `#acada8` for tertiary
  labels, placeholders, and icons.
- **Lines.** `border` `#d5d5d2` draws the hairline outlines and dividers that
  define structure in place of shadow.
- **Status.** `warning` amber `#febe29` and `danger` warm red `#e95d3d` are
  reserved for state — used in tiny doses so they never compete with the green.

## Typography

Two families do all the work, and the contrast between them _is_ the brand.

- **Quadrant** — a high-contrast serif — owns every headline. `display` (68px,
  tight `-1.02px` tracking, 1.0 line-height) anchors the hero; `headline-lg`
  (48px) and `headline-md` (36px) carry section titles; `headline-sm` (20px) is
  used for card and note titles like "Intro call: AllFound".
- **Melange** — a humanist sans — handles everything else. `lead` (24px,
  weight 300) is the airy sub-headline voice. Body runs at `body-lg` (16px,
  1.5) as the base, stepping down to `body-md` (15px) and `body-sm` (14px) for
  dense UI. `label-sm` (13px, weight 500, slight positive tracking) sets button
  text, chips, and metadata.

The rhythm is deliberate: serif for _what we say_, sans for _how we explain it_.
Headlines lean on negative letter-spacing for a tight, printed feel; body text
stays at default or slightly open tracking for comfortable reading.

## Layout

The page is a centered single column on an expansive cream field, with content
held to a comfortable reading measure and wide outer margins. A floating,
pill-shaped navigation bar sits detached from the top edge rather than spanning
full-width — emphasizing the document-like, uncluttered feel.

Spacing follows a **4px base grid**: `xs` 4 / `sm` 8 / `md` 12 / `lg` 16 are
the everyday increments for padding and gaps, `xl` 24 / `xxl` 32 group related
blocks, and `section` 48 / `section-lg` 80 open up the vertical breathing room
between major page sections. Whitespace is treated as a first-class material —
when in doubt, add more.

## Elevation & Depth

This is a near-flat system. Depth is expressed through **tone and hairline
borders**, not heavy shadows: white cards (`surface-elevated`) sit on the cream
`surface`, separated by a 1px `border` `#d5d5d2`. The only real shadow in the
system is a soft, wide, low-opacity drop reserved for true overlays — modals and
popovers use roughly `0 8px 48px rgba(0,0,0,0.15)` to lift cleanly off the page.
Some inputs carry a barely-perceptible inset (`0 0 2px rgba(0,0,0,0.03) inset`).
Avoid stacked or colored shadows; they break the calm, papery aesthetic.

## Shapes

The shape language is **soft and rounded**. Buttons, chips, badges, the nav bar,
and avatars are full pills (`rounded.full` `9999px`). Containers and inputs use
gentler radii — `md` 8px for inputs, `lg` 12px for cards, `xl` 16px for larger
panels, and `sm` 4px for the smallest elements. Nothing in the interface has a
hard 0px corner; the consistent curvature is core to the friendly, hand-made
feel.

## Components

- **button-primary** — the dark CTA. Ink `#292929` fill, off-white `#fcfcf8`
  text, full pill, ~36px tall. Hover deepens to `#4e4d4b`. This is the highest-
  emphasis action (e.g. "Download", "Save and continue").
- **button-secondary** — white pill with a hairline `border`, ink text. Used
  for the nav download affordance and lower-emphasis actions.
- **button-accent** — olive `primary` fill with off-white text, for moments
  that should read as distinctly "Pulse green".
- **chip / badge** — pale `accent-tint` background, `primary` green text, full
  pill, small `label-sm` type (e.g. "Introducing Briefs", "AI enhanced").
- **input** — white surface, 8px radius, 1px `border`, 16px body text and
  comfortable 10–16px padding.
- **card** — white surface on cream, 12px radius, hairline border, 16px padding;
  used for note panels and testimonial tiles.
- **nav** — a floating white pill bar, 56px tall, hairline border, body-size
  links with generous horizontal spacing.

## Do's and Don'ts

- **Do** lead with the serif (Quadrant) for headlines and let Melange carry the
  rest — the type pairing is the brand.
- **Do** keep the cream `surface` as the default canvas; reserve pure white for
  elevated cards and inputs.
- **Do** use the olive-lime accent surgically — for links, highlights, and a
  single accent action per view.
- **Do** define structure with hairline borders and whitespace rather than
  heavy shadows.
- **Don't** introduce cool blues or saturated "tech" gradients; they fight the
  warm, organic palette.
- **Don't** use hard 0px corners — keep controls as pills and containers gently
  rounded.
- **Don't** crowd the layout; generous spacing on the 4px grid is part of the
  calm, editorial feel.
- **Don't** let green dominate — it should feel like a single highlighter pass
  on an otherwise ink-and-paper page.
