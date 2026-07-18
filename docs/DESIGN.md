# Design System Documentation: Editorial Playfulness

## 1. Overview & Creative North Star
**Creative North Star: "The Kinetic Curator"**
This design system moves away from the sterile, modular "SaaS" look and embraces a high-end, editorial approach to utility. While the core function is "Text Repeating," the visual identity treats every character and repetition as an art object. We achieve this through **Intentional Asymmetry**—breaking the predictable grid to create a sense of movement—and **Tonal Depth**, using color shifts rather than structural lines to define space.

The experience should feel like a premium boutique stationery shop: tactile, bold, and unapologetically confident. We use oversized typography and generous white space to ensure that "playful" never feels "cheap."

---

## 2. Colors
Our palette is anchored by a vibrant, high-energy orange and balanced by a sophisticated charcoal gray. To achieve a premium feel, we strictly follow the **"No-Line" Rule**.

### Color Roles
- **Primary (`#a63300` / `primary`):** Used for the core brand "soul." Use this for high-impact CTAs and key interactive moments.
- **Surface & Background (`#f7f5ff` / `surface`):** Our canvas is not pure white, but a slightly "air-filled" tint that allows the **Surface Container Lowest (`#ffffff`)** to appear as elevated, physical sheets of paper.
- **On-Surface (`#2a2e3f` / `on-surface`):** Our dark gray. Never use pure black. This provides a softer, more editorial contrast.

### The "No-Line" Rule & Surface Hierarchy
Traditional UI uses 1px borders to separate content. In this system, **borders are prohibited.** Boundaries must be defined by background shifts:
1.  **Level 0 (Base):** `surface` (#f7f5ff)
2.  **Level 1 (Sections):** `surface-container-low` (#eff0ff)
3.  **Level 2 (Interactive Cards):** `surface-container-lowest` (#ffffff)
4.  **Level 3 (Accents/Popovers):** `surface-container-high` (#dde1fe)

**Signature Texture:** To add "visual soul," use a subtle gradient transition from `primary` (#a63300) to `primary_container` (#ff7949) only on the largest action button or the Hero background. This creates a soft, 3D volume that flat color cannot replicate.

---

## 3. Typography
We utilize a pairing of **Plus Jakarta Sans** (for character and impact) and **Be Vietnam Pro** (for functional clarity).

- **Display & Headlines (Plus Jakarta Sans):** These are our "editorial voice." Use `display-lg` (3.5rem) with tight letter spacing for hero sections. Headlines should be bold and act as visual anchors.
- **Body & Labels (Be Vietnam Pro):** Chosen for its modern, clean geometry. Use `body-lg` (1rem) for main text and `label-md` (0.75rem) for technical metadata or small repeated text previews.
- **Intentional Scale:** Create a "loud/quiet" dynamic. A huge `display-md` headline next to a tiny, perfectly tracked `label-sm` creates the high-end editorial contrast we're aiming for.

---

## 4. Elevation & Depth
We eschew traditional drop shadows for **Tonal Layering** and **Ambient Glows.**

- **The Layering Principle:** Depth is achieved by stacking. A `surface-container-lowest` card placed on a `surface-container-low` background creates a natural, soft lift.
- **Ambient Shadows:** Only use shadows for "floating" elements (like a FAB or a modal). Shadows must be extremely diffused: `box-shadow: 0 20px 40px rgba(42, 46, 63, 0.06);`. The shadow color is a tinted version of `on-surface`, never pure black.
- **The "Ghost Border":** If a separation is absolutely required for accessibility, use the `outline-variant` token at **15% opacity**. It should be felt, not seen.
- **Glassmorphism:** For top navigation bars or floating settings panels, use `surface` at 80% opacity with a `backdrop-filter: blur(12px)`. This integrates the UI into the background rather than sitting "on top" of it.

---

## 5. Components

### Buttons
- **Shape:** Use `rounded-full` (9999px) for primary actions to lean into the "playful" aesthetic.
- **Primary:** `primary` background with `on-primary` text. No border.
- **Secondary:** `surface-container-highest` background. Soft, tactile, and low-contrast.
- **State:** On hover, shift the background to `primary_dim`. Do not use a shadow to indicate hover; use a subtle scale-up (1.02x).

### Input Fields (The "Repeater" Box)
- **Styling:** Use `surface-container-low` for the input background. High roundness (`xl`: 3rem).
- **Focus State:** Instead of a heavy border, use a 2px `outline` of `primary` with a 4px outer "glow" (a 10% opacity version of the primary color).
- **Typography:** Placeholder text should use `title-md` for a bold, friendly entry point.

### Chips & Controls
- **Action Chips:** Use for "Copy," "Clear," or "Share." `rounded-md` (1.5rem) to differentiate from the "full" roundness of buttons.
- **Layout:** Group chips in an asymmetric cluster rather than a rigid horizontal line to maintain the kinetic feel.

### Cards & Lists
- **Rule:** Absolute prohibition of divider lines.
- **Separation:** Use `spacing-8` (2rem) of vertical white space or shift the background from `surface` to `surface-container-lowest`.
- **Text Blocks:** For the repeated text output, use a `surface-container-lowest` card with `rounded-lg` (2rem) and an oversized `display-sm` glyph as a background watermark (opacity 3%).

---

## 6. Do's and Don'ts

### Do:
- **Use Asymmetry:** Place your main input on the left and a larger, offset "Result" area on the right. Avoid 50/50 splits.
- **Embrace White Space:** Use `spacing-20` (5rem) between major sections to let the typography breathe.
- **Linear Icons:** Use thin-stroke (1.5pt) linear icons. They should feel like "doodles" drawn by an architect—precise but playful.

### Don't:
- **No Symmetric 3-Column Layouts:** These feel like templates. Use a 2-column "Hero/Sidekick" layout or a single-column centered focus.
- **No Emojis as Icons:** Emojis are for content, not UI navigation. Use the designated linear icon set to maintain a "Studio" feel.
- **No High-Contrast Borders:** If the user can see the line clearly, it’s too heavy. Soften it or remove it in favor of a color shift.
- **No Purple-Blue Gradients:** Stick to the warmth of the orange and the cool sophistication of the gray-blue neutrals.