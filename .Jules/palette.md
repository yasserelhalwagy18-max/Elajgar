## 2024-07-09 - Added ARIA labels to icon-only buttons
**Learning:** Found multiple instances where icon-only buttons lacked accessible names.
**Action:** Always verify that interactive elements, especially icon-only buttons, have an `aria-label` attribute if they do not contain visible text content.

## 2026-10-22 - Every form error needs an id, a role and an aria-describedby
**Learning:** The login screen did this correctly and the wizard, the dashboard and the profile page did not. A visible error that is not programmatically associated is invisible to a screen reader: the user hears nothing, and the focus stays on the button they pressed. The pattern that works is three parts - the error element gets an `id` and `role="alert"`, the input gets `aria-describedby` pointing at that id, and the input gets `aria-invalid`.
**Action:** When adding a field, copy the shape from `app/login/login-form.tsx` rather than writing a new one. A new error message without all three parts is a bug even when it looks right on screen.

## 2026-10-22 - `type="number"` throws away Persian digits
**Learning:** `input[type=number].value` returns an empty string for Persian-Indic digits - the browser rejects them outright, so the field looks like it ignored the keyboard. Verified: `"۷۵"` in a number input gives `""`, the same string in a text input gives `"۷۵"`. The phone and OTP fields already normalised their digits with `normalizeDigits()` from `lib/utils.ts`; every other numeric field did not.
**Action:** Use `type="text"` with `inputMode="numeric"` (or `"decimal"`) and run the value through `normalizeDigits()`. Do not use `normalizeDigits` in a handler that also serves free text - it strips spaces, which would ruin a sentence.

## 2026-10-22 - The CSS reduced-motion rule does not reach Motion
**Learning:** `globals.css` sets `animation-duration: 0.001ms` under `prefers-reduced-motion: reduce`, but `motion/react` drives opacity and transform from JavaScript, so the override never applies. Measured: with the media feature emulated, a dialog still ramped from 0 to 1 across fifteen frames.
**Action:** Wrap the app in `<MotionConfig reducedMotion="user">` once, in `app/layout.tsx`. It covers every animation in the product, and there is no per-component fallback to forget.

## 2026-10-22 - `role="img"` around a recharts chart is invalid ARIA
**Learning:** Recharts puts a focusable `<svg role="application" tabindex="0">` inside the chart. Wrapping that in `role="img"` makes the svg a focusable child of a presentational role, which accesslint reports as a serious level-A failure, five times over on one page.
**Action:** Do not put `role="img"` on a chart container. Give the `<figure>` a caption, and give the chart a text alternative - a real `<table>` of the numbers, not an `aria-label` that only repeats the title.

## 2026-10-22 - Match body regions by bucket, not by label
**Learning:** `lib/body-regions.ts` stores 32 region labels, including `زانو راست`, `زانو چپ`, `شانه‌ها`, `شانه چپ` and `شانه راست`. A switch that compares the label against `زانو` or `شانه` never matches any of them, so every specific piece of advice was unreachable. The `bucket` field on each region is the stable grouping.
**Action:** Look the label up in `BODY_REGIONS` and branch on the bucket. A label is a display string and will change; the bucket is a data model.

## 2026-10-22 - A headless browser without a visible window suspends requestAnimationFrame
**Learning:** While auditing, every Motion-driven animation appeared to be broken - modals sat at `opacity: 0`, the wizard's form was invisible, and an automated scan reported absurd contrast ratios (1.28:1). Motion writes the `initial` style synchronously and only advances it from its rAF loop, so with rAF suspended the element stays at `opacity: 0` forever. It was the harness, not the app.
**Action:** Before believing an animation bug, check `requestAnimationFrame` actually fires in the browser you are driving. Drive the checks through a headless Chrome that renders (`accesslint`'s Chrome does), and never trust a contrast ratio computed while an element is mid-animation.
