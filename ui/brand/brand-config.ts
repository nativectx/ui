import { BorderRadius, Colors, FooterLinks, LogoConfig, Name, NavigationConfig, Shape, Spacing } from './brand-types';
import { generateLightColors, generateDarkColors, type PaletteOptions } from './palette-generator';

export interface Brand {
  colors: Colors;
  darkColors?: Colors; // Optional dark theme colors
  spacing: Spacing;
  borderRadius: BorderRadius;
  shape: Shape;
  name: Name;
  logo: LogoConfig;
  footerLinks: FooterLinks;
  navigation: NavigationConfig;
}

/**
 * Configuration interface for creating a brand.
 * Supports both manual color specification and seed-based palette generation.
 */
export interface BrandConfig {
  name: string;
  /**
   * Colors for the brand. Can be:
   * 1. Complete Colors object (manual specification)
   * 2. Object with colorSeed for automatic M3 palette generation
   */
  colors: Colors | { colorSeed: PaletteOptions };
  /** Optional dark theme colors (generated from seed if not provided) */
  darkColors?: Colors | { colorSeed: PaletteOptions };
  spacing: Spacing;
  borderRadius: BorderRadius;
  shape?: Shape;
  logo?: LogoConfig;
  footerLinks?: FooterLinks;
  navigation?: NavigationConfig;
}

/**
 * Type guard to check if colors config uses seed-based generation
 */
function isColorSeed(colors: Colors | { colorSeed: PaletteOptions }): colors is { colorSeed: PaletteOptions } {
  return 'colorSeed' in colors && colors.colorSeed !== undefined;
}

/**
 * Creates a brand configuration from the provided config.
 * Supports both manual color specification and automatic M3 palette generation.
 *
 * @param config Configuration with brand values
 * @returns Brand configuration object with generated or manual colors
 *
 * @example
 * // Manual color specification
 * const manualBrand = createBrand({
 *   name: 'My App',
 *   colors: { primary: '#ff0000', secondary: '#00ff00', ... },
 *   spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 40 },
 *   borderRadius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 28, full: 9999 },
 * });
 *
 * @example
 * // Seed-based palette generation (recommended for M3 compliance)
 * const generatedBrand = createBrand({
 *   name: 'My App',
 *   colors: { colorSeed: { primary: '#6750A4' } },
 *   spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 40 },
 *   borderRadius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 28, full: 9999 },
 * });
 */
export const createBrand = (config: BrandConfig): Brand => {
  // Resolve light theme colors
  const lightColors: Colors = isColorSeed(config.colors)
    ? generateLightColors(config.colors.colorSeed)
    : config.colors;

  // Resolve dark theme colors
  let darkColors: Colors | undefined;
  if (config.darkColors) {
    darkColors = isColorSeed(config.darkColors)
      ? generateDarkColors(config.darkColors.colorSeed)
      : config.darkColors;
  } else if (isColorSeed(config.colors)) {
    // Auto-generate dark theme from the same seed
    darkColors = generateDarkColors(config.colors.colorSeed);
  }

  return {
    name: config.name,
    colors: lightColors,
    darkColors,
    spacing: config.spacing,
    borderRadius: config.borderRadius,
    shape: config.shape ?? { surfaceBorderRadius: 12, buttonBorderRadius: 8 },
    logo: config.logo ?? {
      light: undefined,
      dark: undefined,
    },
    footerLinks: config.footerLinks ?? {
      links: [],
    },
    navigation: config.navigation ?? {
      items: [],
    },
  };
};
