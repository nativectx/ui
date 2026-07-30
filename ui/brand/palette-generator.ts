/**
 * Material Design 3 Color Palette Generator
 * Uses @material/material-color-utilities to generate tonal palettes from seed colors
 * Reference: https://m3.material.io/styles/color/the-color-system/color-roles
 */

import {
  argbFromHex,
  hexFromArgb,
  TonalPalette,
  Hct,
} from '@material/material-color-utilities';
import type { Colors } from './brand-types';

export interface PaletteOptions {
  /** Seed color for primary palette (hex format) */
  primary: string;
  /** Optional seed color for secondary palette (generated from primary if not provided) */
  secondary?: string;
  /** Optional seed color for tertiary palette (generated from primary if not provided) */
  tertiary?: string;
  /** Optional seed color for error palette (uses M3 default if not provided) */
  error?: string;
  /** Optional seed color for neutral palette (generated from primary if not provided) */
  neutral?: string;
  /** Optional seed color for neutral variant palette (generated from primary if not provided) */
  neutralVariant?: string;
}

/**
 * Generates a tonal palette from a seed color
 * @param seedColor Hex color string (e.g., '#6750A4')
 * @returns TonalPalette with tones 0-100
 */
function generateTonalPalette(seedColor: string): TonalPalette {
  const argb = argbFromHex(seedColor);
  const hct = Hct.fromInt(argb);
  return TonalPalette.fromHueAndChroma(hct.hue, hct.chroma);
}

/**
 * Generates secondary palette from primary
 * Uses same hue with reduced chroma for harmony
 */
function generateSecondaryPalette(primaryColor: string): TonalPalette {
  const argb = argbFromHex(primaryColor);
  const hct = Hct.fromInt(argb);
  // Secondary uses same hue but lower chroma (16 is M3 standard)
  return TonalPalette.fromHueAndChroma(hct.hue, Math.min(16, hct.chroma));
}

/**
 * Generates tertiary palette from primary
 * Uses complementary hue for contrast
 */
function generateTertiaryPalette(primaryColor: string): TonalPalette {
  const argb = argbFromHex(primaryColor);
  const hct = Hct.fromInt(argb);
  // Tertiary uses complementary hue (+60 degrees)
  const tertiaryHue = (hct.hue + 60) % 360;
  return TonalPalette.fromHueAndChroma(tertiaryHue, Math.max(24, hct.chroma));
}

/**
 * Generates neutral palette from primary
 * Uses very low chroma for subtle tinting
 */
function generateNeutralPalette(primaryColor: string): TonalPalette {
  const argb = argbFromHex(primaryColor);
  const hct = Hct.fromInt(argb);
  // Chroma 0 = pure achromatic gray — no hue bleed into surfaces regardless of seed
  return TonalPalette.fromHueAndChroma(hct.hue, 0);
}

/**
 * Generates neutral variant palette from primary
 * Uses low chroma for subtle variation
 */
function generateNeutralVariantPalette(primaryColor: string): TonalPalette {
  const argb = argbFromHex(primaryColor);
  const hct = Hct.fromInt(argb);
  // Chroma 3 keeps subtle tinting on outlines/muted text without washing surfaces
  return TonalPalette.fromHueAndChroma(hct.hue, 3);
}

/**
 * Generates M3 error palette
 * Uses standard red hue with appropriate chroma
 */
function generateErrorPalette(): TonalPalette {
  // M3 standard error color: red with hue ~25, chroma ~84
  return TonalPalette.fromHueAndChroma(25, 84);
}

/**
 * Generates a complete Material Design 3 light theme color scheme from seed colors
 * @param options Seed colors for generating palettes
 * @returns Complete Colors object for light theme
 */
export function generateLightColors(options: PaletteOptions): Colors {
  // Generate tonal palettes
  const primaryPalette = generateTonalPalette(options.primary);
  const secondaryPalette = options.secondary
    ? generateTonalPalette(options.secondary)
    : generateSecondaryPalette(options.primary);
  const tertiaryPalette = options.tertiary
    ? generateTonalPalette(options.tertiary)
    : generateTertiaryPalette(options.primary);
  const errorPalette = options.error
    ? generateTonalPalette(options.error)
    : generateErrorPalette();
  const neutralPalette = options.neutral
    ? generateTonalPalette(options.neutral)
    : generateNeutralPalette(options.primary);
  const neutralVariantPalette = options.neutralVariant
    ? generateTonalPalette(options.neutralVariant)
    : generateNeutralVariantPalette(options.primary);

  // Build light theme using M3 tone mappings
  // Reference: https://m3.material.io/styles/color/the-color-system/tokens
  return {
    // Primary — M3 tone 40 for light theme
    primary: hexFromArgb(primaryPalette.tone(40)),
    onPrimary: hexFromArgb(primaryPalette.tone(100)),
    primaryContainer: hexFromArgb(primaryPalette.tone(90)),
    onPrimaryContainer: hexFromArgb(primaryPalette.tone(10)),

    // Secondary
    secondary: hexFromArgb(secondaryPalette.tone(40)),
    onSecondary: hexFromArgb(secondaryPalette.tone(100)),
    secondaryContainer: hexFromArgb(secondaryPalette.tone(90)),
    onSecondaryContainer: hexFromArgb(secondaryPalette.tone(10)),

    // Tertiary
    tertiary: hexFromArgb(tertiaryPalette.tone(40)),
    onTertiary: hexFromArgb(tertiaryPalette.tone(100)),
    tertiaryContainer: hexFromArgb(tertiaryPalette.tone(90)),
    onTertiaryContainer: hexFromArgb(tertiaryPalette.tone(10)),

    // Error
    error: hexFromArgb(errorPalette.tone(40)),
    onError: hexFromArgb(errorPalette.tone(100)),
    errorContainer: hexFromArgb(errorPalette.tone(90)),
    onErrorContainer: hexFromArgb(errorPalette.tone(10)),

    // Surface
    surface: hexFromArgb(neutralPalette.tone(98)),
    onSurface: hexFromArgb(neutralPalette.tone(10)),
    onSurfaceVariant: hexFromArgb(neutralVariantPalette.tone(30)),

    // Surface containers
    surfaceContainerLowest: hexFromArgb(neutralPalette.tone(100)),
    surfaceContainerLow: hexFromArgb(neutralPalette.tone(96)),
    surfaceContainer: hexFromArgb(neutralPalette.tone(94)),
    surfaceContainerHigh: hexFromArgb(neutralPalette.tone(92)),
    surfaceContainerHighest: hexFromArgb(neutralPalette.tone(90)),

    // Outline
    outline: hexFromArgb(neutralVariantPalette.tone(50)),
    outlineVariant: hexFromArgb(neutralVariantPalette.tone(80)),

    // Inverse
    inverseSurface: hexFromArgb(neutralPalette.tone(20)),
    inverseOnSurface: hexFromArgb(neutralPalette.tone(95)),
    inversePrimary: hexFromArgb(primaryPalette.tone(80)),

    // Semantic
    scrim: hexFromArgb(neutralPalette.tone(0)),
    shadow: hexFromArgb(neutralPalette.tone(0)),
  };
}

/**
 * Generates a complete Material Design 3 dark theme color scheme from seed colors
 * @param options Seed colors for generating palettes
 * @returns Complete Colors object for dark theme
 */
export function generateDarkColors(options: PaletteOptions): Colors {
  // Generate tonal palettes (same as light)
  const primaryPalette = generateTonalPalette(options.primary);
  const secondaryPalette = options.secondary
    ? generateTonalPalette(options.secondary)
    : generateSecondaryPalette(options.primary);
  const tertiaryPalette = options.tertiary
    ? generateTonalPalette(options.tertiary)
    : generateTertiaryPalette(options.primary);
  const errorPalette = options.error
    ? generateTonalPalette(options.error)
    : generateErrorPalette();
  const neutralPalette = options.neutral
    ? generateTonalPalette(options.neutral)
    : generateNeutralPalette(options.primary);
  const neutralVariantPalette = options.neutralVariant
    ? generateTonalPalette(options.neutralVariant)
    : generateNeutralVariantPalette(options.primary);

  // Build dark theme using M3 tone mappings
  // Dark theme uses inverted tone values
  return {
    // Primary — M3 tone 80 for dark theme
    primary: hexFromArgb(primaryPalette.tone(80)),
    onPrimary: hexFromArgb(primaryPalette.tone(20)),
    primaryContainer: hexFromArgb(primaryPalette.tone(30)),
    onPrimaryContainer: hexFromArgb(primaryPalette.tone(90)),

    // Secondary
    secondary: hexFromArgb(secondaryPalette.tone(80)),
    onSecondary: hexFromArgb(secondaryPalette.tone(20)),
    secondaryContainer: hexFromArgb(secondaryPalette.tone(30)),
    onSecondaryContainer: hexFromArgb(secondaryPalette.tone(90)),

    // Tertiary
    tertiary: hexFromArgb(tertiaryPalette.tone(80)),
    onTertiary: hexFromArgb(tertiaryPalette.tone(20)),
    tertiaryContainer: hexFromArgb(tertiaryPalette.tone(30)),
    onTertiaryContainer: hexFromArgb(tertiaryPalette.tone(90)),

    // Error
    error: hexFromArgb(errorPalette.tone(80)),
    onError: hexFromArgb(errorPalette.tone(20)),
    errorContainer: hexFromArgb(errorPalette.tone(30)),
    onErrorContainer: hexFromArgb(errorPalette.tone(90)),

    // Surface
    surface: hexFromArgb(neutralPalette.tone(6)),
    onSurface: hexFromArgb(neutralPalette.tone(90)),
    onSurfaceVariant: hexFromArgb(neutralVariantPalette.tone(80)),

    // Surface containers
    surfaceContainerLowest: hexFromArgb(neutralPalette.tone(4)),
    surfaceContainerLow: hexFromArgb(neutralPalette.tone(10)),
    surfaceContainer: hexFromArgb(neutralPalette.tone(12)),
    surfaceContainerHigh: hexFromArgb(neutralPalette.tone(17)),
    surfaceContainerHighest: hexFromArgb(neutralPalette.tone(22)),

    // Outline
    outline: hexFromArgb(neutralVariantPalette.tone(60)),
    outlineVariant: hexFromArgb(neutralVariantPalette.tone(30)),

    // Inverse
    inverseSurface: hexFromArgb(neutralPalette.tone(90)),
    inverseOnSurface: hexFromArgb(neutralPalette.tone(20)),
    inversePrimary: hexFromArgb(primaryPalette.tone(40)),

    // Semantic
    scrim: hexFromArgb(neutralPalette.tone(0)),
    shadow: hexFromArgb(neutralPalette.tone(0)),
  };
}

/**
 * Pick white or black as the on-color for a given background, based on contrast.
 */
function pickOnColor(background: string): string {
  return contrastRatio('#FFFFFF', background) >= contrastRatio('#000000', background)
    ? '#FFFFFF'
    : '#000000';
}

/**
 * Compute WCAG 2.1 relative luminance for an ARGB integer.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function relativeLuminance(argb: number): number {
  const linearize = (val: number): number =>
    val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  const r = linearize(((argb >> 16) & 0xFF) / 255);
  const g = linearize(((argb >> 8) & 0xFF) / 255);
  const b = linearize((argb & 0xFF) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Compute the WCAG 2.1 contrast ratio between two hex colors.
 * Returns a value between 1 (no contrast) and 21 (black on white).
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export function contrastRatio(foreground: string, background: string): number {
  const fgL = relativeLuminance(argbFromHex(foreground));
  const bgL = relativeLuminance(argbFromHex(background));
  const lighter = Math.max(fgL, bgL);
  const darker = Math.min(fgL, bgL);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if two colors meet a minimum WCAG contrast ratio.
 * @param foreground Foreground color (hex)
 * @param background Background color (hex)
 * @param minRatio Minimum contrast ratio (default: 4.5 for AA compliance)
 * @returns true if contrast meets minimum ratio
 */
export function hasContrastRatio(
  foreground: string,
  background: string,
  minRatio: number = 4.5
): boolean {
  return contrastRatio(foreground, background) >= minRatio;
}

/**
 * Generate high-contrast color adjustments
 * Increases contrast for accessibility compliance
 */
export function generateHighContrastColors(baseColors: Colors): Colors {
  // In high-contrast mode, increase tone differences
  // This is a simplified version - production would use full WCAG calculations
  return {
    ...baseColors,
    // Increase contrast for all on-color pairs
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onError: '#FFFFFF',
    onSurface: '#000000',
    onSurfaceVariant: '#000000',
    onPrimaryContainer: '#000000',
    onSecondaryContainer: '#000000',
    onTertiaryContainer: '#000000',
    onErrorContainer: '#000000',
  };
}

/**
 * Adapter: Convert a TonalPalette into a simple map of tones -> hex strings.
 * This provides a stable, serializable shape consumers in the codebase expect
 * (e.g. lookups by tone value) and isolates callers from potential upstream
 * API changes in the material-color-utilities package.
 */
export function tonalPaletteToHexMap(palette: TonalPalette): Record<number, string> {
  const map: Record<number, string> = {};
  for (let t = 0; t <= 100; t += 10) {
    try {
      map[t] = hexFromArgb(palette.tone(t));
    } catch (e) {
      // if palette.tone is unavailable for some reason, fallback to white/black
      map[t] = t >= 50 ? '#FFFFFF' : '#000000';
    }
  }
  return map;
}

/**
 * Helper: generate a hex-map directly from a seed color
 */
export function generateTonalHexMapFromSeed(seedColor: string): Record<number, string> {
  const palette = generateTonalPalette(seedColor);
  return tonalPaletteToHexMap(palette);
}
