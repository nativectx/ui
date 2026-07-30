import { Brand } from '../brand';

export interface ThemeValuesType {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  surface: string;
  surfaceVariant: string;
  surfaceTint: string;
  onSurface: string;
  onSurfaceVariant: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  outline: string;
  outlineVariant: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
  scrim: string;
  shadow: string;
  spacing: import('../brand').Spacing;
  borderRadius: import('../brand').BorderRadius;
  shape: import('../brand').Shape;
  isDark: boolean;
  // Type scale — moved to top level, not a component token
  typography: {
    displayLarge: number;
    displayMedium: number;
    displaySmall: number;
    headlineLarge: number;
    headlineMedium: number;
    headlineSmall: number;
    titleLarge: number;
    titleMedium: number;
    titleSmall: number;
    bodyLarge: number;
    bodyMedium: number;
    bodySmall: number;
    labelLarge: number;
    labelMedium: number;
    labelSmall: number;
    weightLight: number;
    weightRegular: number;
    weightMedium: number;
    weightBold: number;
    lineHeightTight: number;
    lineHeightNormal: number;
    lineHeightRelaxed: number;
  };
  // Semantic tokens — encode non-obvious component-specific colour decisions
  tokens: {
    button: {
      filledBg: string;
      filledText: string;
      elevatedBg: string;
      elevatedText: string;
      tonalBg: string;
      tonalText: string;
      outlinedBorder: string;
      outlinedText: string;
      textColor: string;
      disabledBg: string;
      disabledText: string;
    };
    input: {
      background: string;
      text: string;
      border: string;
      placeholder: string;
      labelColor: string;
      labelFocusedColor: string;
      errorColor: string;
      focusBorder: string;
    };
    list: {
      itemText: string;
      itemSubtextColor: string;
      divider: string;
      selectedBg: string;
      selectedText: string;
      pressedBg: string;
    };
    modal: {
      background: string;
      scrim: string;
      headerBorder: string;
    };
    appbar: {
      background: string;
      border: string;
    };
    chip: {
      filledBg: string;
      filledText: string;
      outlinedBorder: string;
      outlinedText: string;
      selectedBg: string;
      selectedText: string;
      disabledBg: string;
      disabledText: string;
      disabledBorder: string;
    };
    sidebar: {
      background: string;
      itemText: string;
      itemActiveText: string;
      itemActiveBg: string;
      itemHoverBg: string;
      divider: string;
      width: number;
    };
    elevation: {
      level0: number;
      level1: number;
      level2: number;
      level3: number;
      level4: number;
      level5: number;
    };
    focusRing: {
      color: string;
      width: number;
      offset: number;
    };
  };
}

// Export token types for consumers
export type ThemeTokens = ThemeValuesType['tokens'];

export const createLightTheme = (brand: Brand): ThemeValuesType => {
  const c = brand.colors;
  return {
    primary: c.primary,
    onPrimary: c.onPrimary,
    primaryContainer: c.primaryContainer,
    onPrimaryContainer: c.onPrimaryContainer,
    secondary: c.secondary,
    onSecondary: c.onSecondary,
    secondaryContainer: c.secondaryContainer,
    onSecondaryContainer: c.onSecondaryContainer,
    tertiary: c.tertiary,
    onTertiary: c.onTertiary,
    tertiaryContainer: c.tertiaryContainer,
    onTertiaryContainer: c.onTertiaryContainer,
    error: c.error,
    onError: c.onError,
    errorContainer: c.errorContainer,
    onErrorContainer: c.onErrorContainer,
    surface: c.surface,
    surfaceVariant: c.surfaceContainer,
    surfaceTint: c.primary,
    onSurface: c.onSurface,
    onSurfaceVariant: c.onSurfaceVariant,
    surfaceContainerLowest: c.surfaceContainerLowest,
    surfaceContainerLow: c.surfaceContainerLow,
    surfaceContainer: c.surfaceContainer,
    surfaceContainerHigh: c.surfaceContainerHigh,
    surfaceContainerHighest: c.surfaceContainerHighest,
    outline: c.outline,
    outlineVariant: c.outlineVariant,
    inverseSurface: c.inverseSurface,
    inverseOnSurface: c.inverseOnSurface,
    inversePrimary: c.inversePrimary,
    scrim: c.scrim,
    shadow: c.shadow,
    spacing: brand.spacing,
    borderRadius: brand.borderRadius,
    shape: brand.shape,
    isDark: false,
    typography: {
      displayLarge: 57, displayMedium: 45, displaySmall: 36,
      headlineLarge: 32, headlineMedium: 28, headlineSmall: 24,
      titleLarge: 22, titleMedium: 16, titleSmall: 14,
      bodyLarge: 16, bodyMedium: 14, bodySmall: 12,
      labelLarge: 14, labelMedium: 12, labelSmall: 11,
      weightLight: 300, weightRegular: 400, weightMedium: 500, weightBold: 700,
      lineHeightTight: 1.2, lineHeightNormal: 1.5, lineHeightRelaxed: 1.75,
    },
    tokens: {
      button: {
        filledBg: c.primary,
        filledText: c.onPrimary,
        elevatedBg: c.surfaceContainerHigh,
        elevatedText: c.onSurface,
        tonalBg: c.secondaryContainer,
        tonalText: c.onSecondaryContainer,
        outlinedBorder: c.outlineVariant ?? c.outline,
        outlinedText: c.primary,
        textColor: c.primary,
        disabledBg: c.surfaceContainerLow,
        disabledText: c.onSurfaceVariant,
      },
      input: {
        background: c.surfaceContainerLow,
        text: c.onSurface,
        border: c.outlineVariant ?? c.outline,
        placeholder: c.onSurfaceVariant,
        labelColor: c.onSurfaceVariant,
        labelFocusedColor: c.primary,
        errorColor: c.error,
        focusBorder: c.primary,
      },
      list: {
        itemText: c.onSurface,
        itemSubtextColor: c.onSurfaceVariant,
        divider: c.outlineVariant ?? c.outline,
        selectedBg: c.secondaryContainer,
        selectedText: c.onSecondaryContainer,
        pressedBg: c.surfaceContainerHigh,
      },
      modal: {
        background: c.surfaceContainerHigh,
        scrim: 'rgba(0,0,0,0.5)',
        headerBorder: c.outlineVariant ?? c.outline,
      },
      appbar: {
        background: c.surface,
        border: c.outlineVariant ?? c.outline,
      },
      chip: {
        filledBg: c.secondaryContainer,
        filledText: c.onSecondaryContainer,
        outlinedBorder: c.outline,
        outlinedText: c.onSurface,
        selectedBg: c.secondaryContainer,
        selectedText: c.onSecondaryContainer,
        disabledBg: c.surfaceContainerLow,
        disabledText: c.onSurfaceVariant,
        disabledBorder: c.outlineVariant ?? c.outline,
      },
      sidebar: {
        background: c.surface,
        itemText: c.onSurface,
        itemActiveText: c.primary,
        itemActiveBg: c.primaryContainer,
        itemHoverBg: c.surfaceContainerHigh,
        divider: c.outlineVariant ?? c.outline,
        width: 280,
      },
      elevation: {
        level0: 0, level1: 1, level2: 3, level3: 6, level4: 8, level5: 12,
      },
      focusRing: {
        color: c.primary,
        width: 2,
        offset: 2,
      },
    },
  };
};

export const createDarkTheme = (brand: Brand): ThemeValuesType => {
  // Use brand.darkColors if available, otherwise use brand.colors (assumes colors work for both themes)
  const c = brand.darkColors ?? brand.colors;
  return {
    primary: c.primary,
    onPrimary: c.onPrimary,
    primaryContainer: c.primaryContainer,
    onPrimaryContainer: c.onPrimaryContainer,
    secondary: c.secondary,
    onSecondary: c.onSecondary,
    secondaryContainer: c.secondaryContainer,
    onSecondaryContainer: c.onSecondaryContainer,
    tertiary: c.tertiary,
    onTertiary: c.onTertiary,
    tertiaryContainer: c.tertiaryContainer,
    onTertiaryContainer: c.onTertiaryContainer,
    error: c.error,
    onError: c.onError,
    errorContainer: c.errorContainer,
    onErrorContainer: c.onErrorContainer,
    surface: c.surface,
    surfaceVariant: c.surfaceContainer,
    surfaceTint: c.primary,
    onSurface: c.onSurface,
    onSurfaceVariant: c.onSurfaceVariant,
    surfaceContainerLowest: c.surfaceContainerLowest,
    surfaceContainerLow: c.surfaceContainerLow,
    surfaceContainer: c.surfaceContainer,
    surfaceContainerHigh: c.surfaceContainerHigh,
    surfaceContainerHighest: c.surfaceContainerHighest,
    outline: c.outline,
    outlineVariant: c.outlineVariant,
    inverseSurface: c.inverseSurface,
    inverseOnSurface: c.inverseOnSurface,
    inversePrimary: c.inversePrimary,
    scrim: c.scrim,
    shadow: c.shadow,
    spacing: brand.spacing,
    borderRadius: brand.borderRadius,
    shape: brand.shape,
    isDark: true,
    typography: {
      displayLarge: 57, displayMedium: 45, displaySmall: 36,
      headlineLarge: 32, headlineMedium: 28, headlineSmall: 24,
      titleLarge: 22, titleMedium: 16, titleSmall: 14,
      bodyLarge: 16, bodyMedium: 14, bodySmall: 12,
      labelLarge: 14, labelMedium: 12, labelSmall: 11,
      weightLight: 300, weightRegular: 400, weightMedium: 500, weightBold: 700,
      lineHeightTight: 1.2, lineHeightNormal: 1.5, lineHeightRelaxed: 1.75,
    },
    tokens: {
      button: {
        filledBg: c.primary,
        filledText: c.onPrimary,
        elevatedBg: c.surfaceContainerHigh,
        elevatedText: c.onSurface,
        tonalBg: c.secondaryContainer,
        tonalText: c.onSecondaryContainer,
        outlinedBorder: c.outlineVariant ?? c.outline,
        outlinedText: c.primary,
        textColor: c.primary,
        disabledBg: c.surfaceContainerLow,
        disabledText: c.onSurfaceVariant,
      },
      input: {
        background: c.surfaceContainerLow,
        text: c.onSurface,
        border: c.outlineVariant ?? c.outline,
        placeholder: c.onSurfaceVariant,
        labelColor: c.onSurfaceVariant,
        labelFocusedColor: c.primary,
        errorColor: c.error,
        focusBorder: c.primary,
      },
      list: {
        itemText: c.onSurface,
        itemSubtextColor: c.onSurfaceVariant,
        divider: c.outlineVariant ?? c.outline,
        selectedBg: c.secondaryContainer,
        selectedText: c.onSecondaryContainer,
        pressedBg: c.surfaceContainerHigh,
      },
      modal: {
        background: c.surfaceContainerHigh,
        scrim: 'rgba(0,0,0,0.5)',
        headerBorder: c.outlineVariant ?? c.outline,
      },
      appbar: {
        background: c.surface,
        border: c.outlineVariant ?? c.outline,
      },
      chip: {
        filledBg: c.secondaryContainer,
        filledText: c.onSecondaryContainer,
        outlinedBorder: c.outline,
        outlinedText: c.onSurface,
        selectedBg: c.secondaryContainer,
        selectedText: c.onSecondaryContainer,
        disabledBg: c.surfaceContainerLow,
        disabledText: c.onSurfaceVariant,
        disabledBorder: c.outlineVariant ?? c.outline,
      },
      sidebar: {
        background: c.surface,
        itemText: c.onSurface,
        itemActiveText: c.primary,
        itemActiveBg: c.primaryContainer,
        itemHoverBg: c.surfaceContainerHigh,
        divider: c.outlineVariant ?? c.outline,
        width: 280,
      },
      elevation: {
        level0: 0, level1: 1, level2: 3, level3: 6, level4: 8, level5: 12,
      },
      focusRing: {
        color: c.primary,
        width: 2,
        offset: 2,
      },
    },
  };
};