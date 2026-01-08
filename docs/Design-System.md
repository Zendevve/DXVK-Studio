# Design System

> Apple Human Interface Guidelines (HIG) adapted for DXVK Studio

---

## Core Principles

### 1. Clarity

Every element must be immediately understandable.

| Element | Requirement |
|---------|-------------|
| **Text** | Legible at all sizes, semantic hierarchy (title → body → caption) |
| **Icons** | Instantly recognizable, consistent style, no obscure metaphors |
| **Layout** | Uncluttered, focused, purposeful whitespace |

**Implementation:**
- Use Inter or system sans-serif fonts
- Limit UI text to essential information only
- One primary action per screen/context

### 2. Deference

Content is the hero; UI chrome recedes.

- Navigation and controls should not compete with content for attention
- Use translucent/blur materials to create depth without visual weight
- Show contextual controls only when relevant (hover states, selection modes)

### 3. Depth

Visual layering communicates hierarchy and relationships.

| Technique | Purpose |
|-----------|---------|
| **Shadows** | Elevation, floating elements |
| **Blur** | Background separation, focus |
| **Motion** | Transition between states, spatial relationships |

### 4. Consistency

Users leverage existing platform knowledge.

- Use standard UI patterns (hierarchical nav, tab bars, modals)
- Maintain consistent interaction behaviors across the app
- Follow platform conventions (Windows: title bar, menus, keyboard shortcuts)

---

## Visual Foundations

### Color Palette

We utilize Apple's dynamic system colors which adapt to Light and Dark modes.

#### Base Colors

| Color | Light Mode (Default) | Dark Mode (Default) | Use Case |
|-------|----------------------|---------------------|----------|
| **Red** | `#FF383C` (255, 56, 60) | `#FF4245` (255, 66, 69) | Destructive, Error |
| **Orange** | `#FF8D28` (255, 141, 40) | `#FF9230` (255, 146, 48) | Warning |
| **Yellow** | `#FFCC00` (255, 204, 0) | `#FFD600` (255, 214, 0) | Attention |
| **Green** | `#34C759` (52, 199, 89) | `#30D158` (48, 209, 88) | Success |
| **Mint** | `#00C8B3` (0, 200, 179) | `#00DAC3` (0, 218, 195) | Secondary Success/Info |
| **Teal** | `#00C3D0` (0, 195, 208) | `#00D2E0` (0, 210, 224) | Info |
| **Cyan** | `#00C0E8` (0, 192, 232) | `#3CD3FE` (60, 211, 254) | Info |
| **Blue** | `#0088FF` (0, 136, 255) | `#0091FF` (0, 145, 255) | Primary Action |
| **Indigo** | `#6155F5` (97, 85, 245) | `#6D7CFF` (109, 124, 255) | Accent |
| **Purple** | `#CB30E0` (203, 48, 224) | `#DB34F2` (219, 52, 242) | Accent |
| **Pink** | `#FF2D55` (255, 45, 85) | `#FF375F` (255, 55, 95) | Accent |
| **Brown** | `#AC7F5E` (172, 127, 94) | `#B78A66` (183, 138, 102) | Neutral Accent |

#### Gray Scale (System Gray)

| Name | Light Mode | Dark Mode |
|------|------------|-----------|
| **Gray (1)** | `#8E8E93` (142, 142, 147) | `#8E8E93` (142, 142, 147) |
| **Gray 2** | `#AEAEB2` (174, 174, 178) | `#636366` (99, 99, 102) |
| **Gray 3** | `#C7C7CC` (199, 199, 204) | `#48484A` (72, 72, 74) |
| **Gray 4** | `#D1D1D6` (209, 209, 214) | `#3A3A3C` (58, 58, 60) |
| **Gray 5** | `#E5E5EA` (229, 229, 234) | `#2C2C2E` (44, 44, 46) |
| **Gray 6** | `#F2F2F7` (242, 242, 247) | `#1C1C1E` (28, 28, 30) |

### Typography

| Style | Size | Weight | Line Height |
|-------|------|--------|-------------|
| **Large Title** | 28px+ | 700 | 1.2 |
| **Title 1** | 22px | 600 | 1.3 |
| **Title 2** | 18px | 600 | 1.3 |
| **Headline** | 16px | 600 | 1.4 |
| **Body** | 14px | 400 | 1.5 |
| **Caption** | 12px | 400 | 1.4 |

**Accessibility Rules:**
- **Bold Text**: Always use for importance, not just aesthetics.
- **Dynamic Type**: All text must be resizeable.

### Materials & Liquid Glass

**Liquid Glass** is our primary material for surfaces. It has no inherent color by default, taking on colors from content behind it, but can be tinted for emphasis.

- **Default Material**: Neutral, translucent, allows background to show through.
- **Tinted Material**: Used for active states or primary actions (e.g., a "Done" button with Blue tint).
- **Adaptivity**: Symbols and text on Liquid Glass adapt to the underlying content (Dark text on light background, Light text on dark).

**Implementation:**
```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.05); /* Base opacity */
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Spacing (8pt Grid)

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  24px;
--space-6:  32px;
--space-8:  48px;
```

### Border Radius

```css
--radius-sm:   4px;
--radius-md:   8px;
--radius-lg:   12px;
--radius-xl:   16px;
--radius-full: 9999px;
```

---

## Interaction Patterns

### Touch/Click Targets

| Context | Minimum Size |
|---------|--------------|
| **Primary buttons** | 44×44px |
| **Icon buttons** | 44×44px (icon can be smaller, hit area must not) |
| **List items** | 44px height minimum |
| **Inline links** | 24px height minimum |

### States

Every interactive element needs these states:

| State | Visual Treatment |
|-------|------------------|
| **Default** | Base appearance |
| **Hover** | Subtle background change, cursor pointer |
| **Focus** | Visible ring (2px solid primary color) |
| **Active/Pressed** | Slightly darker, scale(0.98) |
| **Disabled** | 50% opacity, cursor not-allowed |
| **Loading** | Spinner or skeleton, disabled interaction |

### Animation

```css
/* Timing */
--duration-instant: 100ms;
--duration-fast:    150ms;
--duration-normal:  250ms;
--duration-slow:    400ms;

/* Easing */
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);     /* Entrances */
--ease-in:     cubic-bezier(0.7, 0, 0.84, 0);     /* Exits */
--ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);    /* State changes */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy feedback */
```

**Rules:**
- Entrances: ease-out (fast start, slow finish)
- Exits: ease-in (slow start, fast finish)
- Always respect `prefers-reduced-motion: reduce`

---

## Component Specifications

## Component Specifications

### Buttons & Controls

| Type | Use Case | Visual |
|------|----------|--------|
| **Primary** | Main action | Liquid Glass (Tinted) or Solid Brand Color |
| **Secondary** | Alternative actions | Liquid Glass (Default) or Bordered |
| **Ghost** | Tertiary actions | Transparent background |
| **Destructive** | Remove/Delete | Red Tint (Liquid Glass) or Solid Red |

**Touch & Click Targets:**
- **Standard:** 44x44px minimum for all pointer interactions.
- **Compact:** 28x28px absolute minimum (use sparingly).
- **Padding:** 12pt internal padding for bezel buttons, 24pt clearance for borderless.

### Icons

We use patterns derived from SF Symbols.

| Category | Common Actions |
|----------|----------------|
| **Editing** | `pencil`, `trash`, `plus`, `xmark` |
| **Navigation** | `chevron.left`, `house`, `gear` |
| **Media** | `play.fill`, `pause.fill` |
| **Search** | `magnifyingglass` |

**Rules:**
- **Vector First:** Always use SVG.
- **Optical Alignment:** Center icons based on visual weight, not just distinct geometry.
- **Stroke Weight:** Match the stroke width of icons to adjacent Typography (e.g., Medium weight icon with Medium text).

### Dark Mode Layering

Dark mode is not just inverted colors; it uses **Elevation** to denote hierarchy.

- **Base Background:** The darkest layer (`#000000` or very dark gray). Used for the main app window.
- **Elevated Background:** Slightly lighter gray. Used for Modals, Popovers, and floating panels.
- **Highlight:** Used for selection states.

### Modals & Overlays

- Use **Elevated** background colors.
- Always provide a clear dismiss action.

---

## Accessibility Checklist

### Required (WCAG AA + HIG)

- [ ] **Contrast**:
    - Normal Text: 4.5:1 minimum.
    - Large Text (18pt+) or Bold: 3:1 minimum.
- [ ] **Touch Targets**: All interactive elements are at least 44x44px.
- [ ] **Focus Rings**: Visible focus state (`2px` solid ring) for keyboard users.
- [ ] **Alt Text**: All meaningful icons and images have `aria-label` or `alt`.
- [ ] **State Indicators**: Don't rely on color alone (use shapes/icons for errors/success).

### Recommended

- [ ] Support `prefers-reduced-motion` for animations.
- [ ] Support Dynamic Type (rem-based patterns).
- [ ] Ensure "Liquid Glass" materials do not compromise readability (use background blur to separate text from noisy backgrounds).

---

## Platform Considerations (Windows)

DXVK Studio runs on Windows, so we adapt HIG principles to Windows conventions:

| Apple HIG | Windows Equivalent |
|-----------|-------------------|
| Navigation bar | Title bar with menu |
| Tab bar | Sidebar navigation or tabs |
| Sheet/Action sheet | Modal dialog or command bar |
| SF Symbols | Fluent UI icons or custom SVG |

**Windows-specific:**
- Support native title bar controls (minimize, maximize, close)
- Support high-contrast themes
- Honor Windows accent colors where appropriate
- Keyboard shortcuts should follow Windows conventions (Ctrl+, not Cmd+)

---

## Quick Reference

### Do

✓ Use semantic colors consistently
✓ Animate with purpose
✓ Make touch targets at least 44px
✓ Provide visible focus states
✓ Support keyboard navigation
✓ Use the 8pt spacing system

### Don't

✗ Use color as the only state indicator
✗ Add decorative animations
✗ Make targets smaller than 44px
✗ Skip focus states
✗ Require mouse for all interactions
✗ Use arbitrary spacing values
