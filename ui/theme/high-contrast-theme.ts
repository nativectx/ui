/**
 * High Contrast Theme Support
 * Provides enhanced contrast for accessibility
 */

import { generateHighContrastColors } from '../brand/palette-generator';
import { ThemeValuesType } from './theme-config';
import type { Brand } from '../brand';

const TYPOGRAPHY = {
  displayLarge: 57, displayMedium: 45, displaySmall: 36,
  headlineLarge: 32, headlineMedium: 28, headlineSmall: 24,
  titleLarge: 22, titleMedium: 16, titleSmall: 14,
  bodyLarge: 16, bodyMedium: 14, bodySmall: 12,
  labelLarge: 14, labelMedium: 12, labelSmall: 11,
  weightLight: 300, weightRegular: 400, weightMedium: 600, weightBold: 700,
  lineHeightTight: 1.2, lineHeightNormal: 1.5, lineHeightRelaxed: 1.75,
};

export function createHighContrastLightTheme(brand: Brand): ThemeValuesType {
  const baseColors = brand.colors;
  const hc = generateHighContrastColors(baseColors);

  return {
    ...hc,
    surfaceVariant: hc.surface,
    surfaceTint: hc.primary,
    spacing: brand.spacing,
    borderRadius: brand.borderRadius,
    shape: brand.shape,
    isDark: false,
    typography: TYPOGRAPHY,
    tokens: {
      button: {
        filledBg: hc.primary,
        filledText: '#FFFFFF',
        elevatedBg: hc.surfaceContainerHigh,
        elevatedText: '#000000',
        tonalBg: hc.secondaryContainer,
        tonalText: '#000000',
        outlinedBorder: '#000000',
        outlinedText: '#000000',
        textColor: '#000000',
        disabledBg: hc.surfaceContainerLow,
        disabledText: '#666666',
      },
      input: {
        background: '#FFFFFF',
        text: '#000000',
        border: '#000000',
        placeholder: '#666666',
        labelColor: '#000000',
        labelFocusedColor: '#000000',
        errorColor: '#B00020',
        focusBorder: '#000000',
      },
      list: {
        itemText: '#000000',
        itemSubtextColor: '#000000',
        divider: '#000000',
        selectedBg: '#000000',
        selectedText: '#FFFFFF',
        pressedBg: '#E0E0E0',
      },
      modal: {
        background: '#FFFFFF',
        scrim: 'rgba(0,0,0,0.7)',
        headerBorder: '#000000',
      },
      appbar: {
        background: hc.surfaceContainerHighest,
        border: hc.outline,
      },
      chip: {
        filledBg: hc.secondaryContainer,
        filledText: '#000000',
        outlinedBorder: '#000000',
        outlinedText: '#000000',
        selectedBg: hc.secondaryContainer,
        selectedText: '#000000',
        disabledBg: '#F5F5F5',
        disabledText: '#666666',
        disabledBorder: '#999999',
      },
      sidebar: {
        background: hc.surfaceContainer,
        itemText: '#000000',
        itemActiveText: hc.primary,
        itemActiveBg: hc.primaryContainer,
        itemHoverBg: hc.surfaceContainerHigh,
        divider: '#000000',
        width: 280,
      },
      elevation: {
        level0: 0, level1: 1, level2: 3, level3: 6, level4: 8, level5: 12,
      },
      focusRing: { color: '#000000', width: 3, offset: 2 },
    },
  };
}

export function createHighContrastDarkTheme(brand: Brand): ThemeValuesType {
  const baseColors = brand.darkColors ?? brand.colors;
  const hc = generateHighContrastColors(baseColors);

  return {
    ...hc,
    surfaceVariant: '#000000',
    surfaceTint: hc.primary,
    surface: '#000000',
    onSurface: '#FFFFFF',
    spacing: brand.spacing,
    borderRadius: brand.borderRadius,
    shape: brand.shape,
    isDark: true,
    typography: TYPOGRAPHY,
    tokens: {
      button: {
        filledBg: hc.primary,
        filledText: '#000000',
        elevatedBg: '#1A1A1A',
        elevatedText: '#FFFFFF',
        tonalBg: hc.secondaryContainer,
        tonalText: '#FFFFFF',
        outlinedBorder: '#FFFFFF',
        outlinedText: '#FFFFFF',
        textColor: '#FFFFFF',
        disabledBg: '#1A1A1A',
        disabledText: '#999999',
      },
      input: {
        background: '#000000',
        text: '#FFFFFF',
        border: '#FFFFFF',
        placeholder: '#999999',
        labelColor: '#FFFFFF',
        labelFocusedColor: '#FFFFFF',
        errorColor: '#FF6B6B',
        focusBorder: '#FFFFFF',
      },
      list: {
        itemText: '#FFFFFF',
        itemSubtextColor: '#CCCCCC',
        divider: '#FFFFFF',
        selectedBg: '#FFFFFF',
        selectedText: '#000000',
        pressedBg: '#1A1A1A',
      },
      modal: {
        background: '#000000',
        scrim: 'rgba(0,0,0,0.8)',
        headerBorder: '#FFFFFF',
      },
      appbar: {
        background: '#000000',
        border: '#FFFFFF',
      },
      chip: {
        filledBg: hc.secondaryContainer,
        filledText: '#FFFFFF',
        outlinedBorder: '#FFFFFF',
        outlinedText: '#FFFFFF',
        selectedBg: hc.secondaryContainer,
        selectedText: '#FFFFFF',
        disabledBg: '#1A1A1A',
        disabledText: '#999999',
        disabledBorder: '#666666',
      },
      sidebar: {
        background: hc.surfaceContainer,
        itemText: '#FFFFFF',
        itemActiveText: hc.primary,
        itemActiveBg: hc.primaryContainer,
        itemHoverBg: hc.surfaceContainerHigh,
        divider: '#FFFFFF',
        width: 280,
      },
      elevation: {
        level0: 0, level1: 1, level2: 3, level3: 6, level4: 8, level5: 12,
      },
      focusRing: { color: '#FFFFFF', width: 3, offset: 2 },
    },
  };
}
