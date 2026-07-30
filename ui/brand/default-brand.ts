import { createBrand } from './brand-config';

/**
 * Default brand configuration using Material Design 3 reference colors.
 * Uses seed-based palette generation for automatic light/dark theme creation.
 *
 * Seed color: #6750A4 (Material Design 3 reference purple)
 * This generates a complete, accessible color palette following M3 guidelines.
 *
 * Reference: https://m3.material.io/styles/color/the-color-system/color-roles
 */
export const defaultBrand = createBrand({
  name: 'Zero to App',
  // Use seed-based palette generation (recommended)
  // This automatically generates all 26 M3 color tokens and matching dark theme
  colors: {
    colorSeed: {
      primary: '#4f46e5', // Modern indigo
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 40,
  },
  borderRadius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 28, full: 9999 },
  shape: { surfaceBorderRadius: 10, buttonBorderRadius: 10 },
});

