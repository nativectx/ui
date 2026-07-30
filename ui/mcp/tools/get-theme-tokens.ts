const TOKEN_TREE = `# @nativectx/ui Theme Tokens

## Palette (M3 system colors — all from useTheme())
primary, onPrimary, primaryContainer, onPrimaryContainer
secondary, onSecondary, secondaryContainer, onSecondaryContainer
tertiary, onTertiary, tertiaryContainer, onTertiaryContainer
error, onError, errorContainer, onErrorContainer
surface, surfaceVariant, surfaceTint, onSurface, onSurfaceVariant
surfaceContainerLowest, surfaceContainerLow, surfaceContainer, surfaceContainerHigh, surfaceContainerHighest
outline, outlineVariant
inverseSurface, inverseOnSurface, inversePrimary
scrim, shadow

## Semantic tokens (via theme.tokens.*)

### button
filledBg, filledText, elevatedBg, elevatedText, tonalBg, tonalText
outlinedBorder, outlinedText, textColor
disabledBg, disabledText

### input
background, text, border, placeholder, focusedBorder, errorBorder
labelColor, helperColor, errorColor, iconColor

### list
background, itemBackground, itemText, itemSubText, dividerColor

### modal
background, overlay, handleColor

### appbar
background, text, iconColor, borderColor

### chip
filledBg, filledText, outlinedBorder, outlinedText
selectedBg, selectedText, disabledBg, disabledText

### sidebar
background, borderColor
itemText, itemIcon, itemActiveBg, itemActiveText, itemActiveIcon
sectionText

### elevation
level0, level1, level2, level3, level4, level5

### focusRing
color, width, offset

### typography
(mirrors M3 type scale — displayLarge through labelSmall)
weightLight, weightRegular, weightMedium, weightBold

### link
color, visitedColor

### badge
background, text

## Layout tokens (via useTheme())
spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 40 }
borderRadius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 28, full: 9999 }
shape: { surfaceBorderRadius: 12, buttonBorderRadius: 8 }
isDark: boolean

## Usage
\`\`\`tsx
const theme = useTheme();

// Palette color
<View style={{ backgroundColor: theme.primary }} />

// Semantic token
<View style={{ backgroundColor: theme.tokens.button.filledBg }} />

// Spacing
<View style={{ padding: theme.spacing.md }} />
\`\`\`
`;

const COMPONENT_TOKENS: Record<string, string> = {
  button: `## Button tokens (theme.tokens.button)
filledBg       — background for filled variant
filledText     — text color for filled variant
elevatedBg     — background for elevated variant
elevatedText   — text color for elevated variant
tonalBg        — background for tonal variant
tonalText      — text color for tonal variant
outlinedBorder — border color for outlined variant
outlinedText   — text color for outlined variant
textColor      — text color for text variant
disabledBg     — background when disabled
disabledText   — text color when disabled`,

  input: `## Input tokens (theme.tokens.input)
background     — input background color
text           — input text color
border         — default border color
placeholder    — placeholder text color
focusedBorder  — border color when focused
errorBorder    — border color on error state
labelColor     — floating label color
helperColor    — helper text color
errorColor     — error message color
iconColor      — leading/trailing icon color`,

  sidebar: `## Sidebar tokens (theme.tokens.sidebar)
background     — sidebar surface background
borderColor    — sidebar border
itemText       — nav item label color
itemIcon       — nav item icon color
itemActiveBg   — active item background
itemActiveText — active item label color
itemActiveIcon — active item icon color
sectionText    — section header label color`,

  appbar: `## Appbar tokens (theme.tokens.appbar)
background     — header background
text           — header title color
iconColor      — header icon color
borderColor    — bottom border color`,

  chip: `## Chip tokens (theme.tokens.chip)
filledBg, filledText
outlinedBorder, outlinedText
selectedBg, selectedText
disabledBg, disabledText`,

  elevation: `## Elevation tokens (theme.tokens.elevation)
level0 — no shadow (flat)
level1 — subtle shadow (cards)
level2 — moderate shadow (menus)
level3 — medium shadow (dialogs)
level4 — strong shadow (modals)
level5 — maximum shadow (tooltips)

Usage: <ThemedView elevation={2} />`,
};

export function getThemeTokens(component?: string): string {
  if (!component) return TOKEN_TREE;

  const key = component.toLowerCase().replace(/tokens?$/, '').trim();
  const specific = COMPONENT_TOKENS[key];
  if (specific) return specific;

  const available = Object.keys(COMPONENT_TOKENS).join(', ');
  return `No specific tokens for "${component}". Available component token groups: ${available}\n\nFor the full token tree, call get_theme_tokens() with no arguments.`;
}
