---
description: Use when working with @nativectx/ui theming, design tokens, colors, spacing, or responsive hooks
---

# NativeCtx UI Theme System

**Context:** Assisting users with `@nativectx/ui` theming, tokens, and responsive hooks.

---

## Core Hooks

### useTheme()
Full theme object — palette colors, type scale, semantic tokens, spacing, shape.

```tsx
const theme = useTheme();

// Palette — M3 color roles
theme.primary, theme.onPrimary, theme.primaryContainer, theme.onPrimaryContainer
theme.secondary, theme.onSecondary, theme.secondaryContainer, theme.onSecondaryContainer
theme.surface, theme.onSurface, theme.onSurfaceVariant
theme.surfaceContainerLowest, theme.surfaceContainerLow, theme.surfaceContainer
theme.surfaceContainerHigh, theme.surfaceContainerHighest
theme.outline, theme.outlineVariant
theme.error, theme.onError

// Surfaces are achromatic neutral grays — no hue bleed regardless of seed color.
// Accent colors (primary, secondary, tertiary) carry the brand hue.

// Type scale — top-level, not inside tokens
theme.typography.bodyMedium    // 14
theme.typography.titleLarge    // 22
theme.typography.labelSmall    // 11
theme.typography.weightMedium  // 500
theme.typography.lineHeightNormal // 1.5
// Full scale: display{Large|Medium|Small}, headline{...}, title{...}, body{...}, label{...}

// Spacing scale
theme.spacing.xs   // 4     theme.spacing.xl   // 20
theme.spacing.sm   // 8     theme.spacing.xxl  // 24
theme.spacing.md   // 12    theme.spacing.xxxl // 40
theme.spacing.lg   // 16

// Shape — use these first for standard components
theme.shape.surfaceBorderRadius  // 10 — cards, containers, inputs
theme.shape.buttonBorderRadius   // 10 — buttons, interactive elements

// Border radius scale — for multi-tier sizing (FAB variants, etc.)
theme.borderRadius.xs   // 4     theme.borderRadius.lg   // 16
theme.borderRadius.sm   // 8     theme.borderRadius.xl   // 28
theme.borderRadius.md   // 12    theme.borderRadius.full // 9999

theme.isDark  // boolean
```

### useTokens()
Convenience hook — returns `theme.tokens` directly (component-specific decisions).

```tsx
const { button, input, focusRing } = useTokens();

// Button variants
button.filledBg, button.filledText
button.elevatedBg, button.elevatedText
button.tonalBg, button.tonalText
button.outlinedBorder, button.outlinedText
button.textColor
button.disabledBg, button.disabledText

// Input
input.background, input.border, input.focusBorder, input.errorColor
```

### useThemeMode()

```tsx
const { mode, toggleTheme } = useThemeMode();
// mode: 'light' | 'dark'
```

---

## Semantic Token Map

Tokens encode non-obvious component-specific decisions. For straightforward palette
values (e.g. `onSurface` for body text) use `theme.*` directly.

```tsx
tokens.button    // filledBg, filledText,
                 // elevatedBg, elevatedText,
                 // tonalBg, tonalText,
                 // outlinedBorder, outlinedText,
                 // textColor,
                 // disabledBg, disabledText

tokens.input     // background, text, border, placeholder,
                 // labelColor, labelFocusedColor, errorColor, focusBorder

tokens.list      // itemText, itemSubtextColor, divider,
                 // selectedBg, selectedText, pressedBg

tokens.modal     // background, scrim, headerBorder

tokens.appbar    // background, border

tokens.chip      // filledBg, filledText, outlinedBorder, outlinedText,
                 // selectedBg, selectedText, disabledBg, disabledText, disabledBorder

tokens.sidebar   // background, itemText, itemActiveText, itemActiveBg,
                 // itemHoverBg, divider, width (280)

tokens.elevation // level0(0), level1(1), level2(3), level3(6), level4(8), level5(12)
tokens.focusRing // color, width(2), offset(2)
```

> `theme.typography` lives at the top level, not inside `tokens`.
> `tokens.card`, `tokens.link`, `tokens.badge`, `tokens.slider` were removed —
> use `theme.surfaceContainer`, `theme.primary`, etc. directly.

---

## Palette Generation

Surfaces (`surface`, `surfaceContainer*`, `outline*`) are generated as **achromatic neutral grays** (chroma 0) — no hue bleed regardless of the seed color. Brand color is carried only by primary/secondary/tertiary roles.

```tsx
const brand = createBrand({
  colors: { colorSeed: { primary: '#4f46e5' } }, // seed drives the whole palette
  // darkColors auto-generated unless provided
  ...
});
```

---

## High-Contrast Theme

```tsx
import { createHighContrastLightTheme, createHighContrastDarkTheme } from '@nativectx/ui';
```

Same `ThemeValuesType` shape — swap in via `NativeCtxProvider brand` prop.

---

## Responsive Hooks

### useDimensions()

```tsx
const { width, height, breakpoint } = useDimensions();
// breakpoint: 'small' | 'medium' | 'large' | 'xlarge'
```

### useBreakpoint()

```tsx
const isLarge = useBreakpoint('large'); // width >= 1024
```

| Breakpoint | Min width |
|------------|-----------|
| `small` | 480px |
| `medium` | 768px |
| `large` | 1024px |
| `xlarge` | 1280px |

```tsx
// Size-based decisions
const columns = breakpoint === 'small' ? 1 : 3;

// Platform logic uses Platform.OS, not hooks
if (Platform.OS === 'web' && breakpoint === 'small') { ... }
```

---

## Context Hooks

```tsx
const { appBarHeight, setAppBarHeight } = useLayout();     // app bar height
const scrollY = useScrollContext();                         // shared scroll SharedValue
```
