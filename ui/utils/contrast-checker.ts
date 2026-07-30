/**
 * WCAG 2.1 Contrast Checker
 * Automated accessibility contrast validation
 */

import { contrastRatio, hasContrastRatio } from '../brand/palette-generator';
import type { Colors } from '../brand/brand-types';

export interface ContrastCheck {
  pair: string;
  foreground: string;
  background: string;
  ratio: number;
  passes: boolean;
  level: 'AAA' | 'AA' | 'Fail';
}

/**
 * WCAG 2.1 contrast requirements
 * - AAA: 7:1 for normal text, 4.5:1 for large text
 * - AA: 4.5:1 for normal text, 3:1 for large text
 */
export const WCAG_LEVELS = {
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5,
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
} as const;

/**
 * Check all critical color pairs in a theme for WCAG compliance
 * @param colors Color scheme to validate
 * @param largeText Whether to use large text criteria (default: false)
 * @returns Array of contrast check results
 */
export function checkThemeContrast(
  colors: Colors,
  largeText: boolean = false
): ContrastCheck[] {
  const minRatio = largeText ? WCAG_LEVELS.AA_LARGE : WCAG_LEVELS.AA_NORMAL;
  const aaaRatio = largeText ? WCAG_LEVELS.AAA_LARGE : WCAG_LEVELS.AAA_NORMAL;

  const checks: ContrastCheck[] = [];

  // Critical color pairs that must have good contrast
  const pairs: Array<{ pair: string; fg: string; bg: string }> = [
    { pair: 'primary/onPrimary', fg: colors.onPrimary, bg: colors.primary },
    { pair: 'primaryContainer/onPrimaryContainer', fg: colors.onPrimaryContainer, bg: colors.primaryContainer },
    { pair: 'secondary/onSecondary', fg: colors.onSecondary, bg: colors.secondary },
    { pair: 'secondaryContainer/onSecondaryContainer', fg: colors.onSecondaryContainer, bg: colors.secondaryContainer },
    { pair: 'tertiary/onTertiary', fg: colors.onTertiary, bg: colors.tertiary },
    { pair: 'tertiaryContainer/onTertiaryContainer', fg: colors.onTertiaryContainer, bg: colors.tertiaryContainer },
    { pair: 'error/onError', fg: colors.onError, bg: colors.error },
    { pair: 'errorContainer/onErrorContainer', fg: colors.onErrorContainer, bg: colors.errorContainer },
    { pair: 'surface/onSurface', fg: colors.onSurface, bg: colors.surface },
    { pair: 'surfaceVariant/onSurfaceVariant', fg: colors.onSurfaceVariant, bg: colors.surface },
    { pair: 'inverseSurface/inverseOnSurface', fg: colors.inverseOnSurface, bg: colors.inverseSurface },
  ];

  for (const { pair, fg, bg } of pairs) {
    const ratio = contrastRatio(fg, bg);
    const passesAA = ratio >= minRatio;
    const passesAAA = ratio >= aaaRatio;

    checks.push({
      pair,
      foreground: fg,
      background: bg,
      ratio,
      passes: passesAA,
      level: passesAAA ? 'AAA' : passesAA ? 'AA' : 'Fail',
    });
  }

  return checks;
}

/**
 * Validate theme and return failing pairs
 * @param colors Color scheme to validate
 * @returns Array of failing contrast pairs
 */
export function validateThemeContrast(colors: Colors): ContrastCheck[] {
  const checks = checkThemeContrast(colors);
  return checks.filter(check => !check.passes);
}

/**
 * Generate a contrast report for a theme
 * @param colors Color scheme to validate
 * @returns Human-readable report string
 */
export function generateContrastReport(colors: Colors): string {
  const checks = checkThemeContrast(colors);
  const failures = checks.filter(check => !check.passes);

  if (failures.length === 0) {
    return '✅ All color pairs pass WCAG AA contrast requirements';
  }

  let report = `❌ ${failures.length} color pair(s) failing WCAG AA:\n\n`;
  for (const failure of failures) {
    report += `  • ${failure.pair}\n`;
    report += `    Foreground: ${failure.foreground}\n`;
    report += `    Background: ${failure.background}\n`;
    report += `    Level: ${failure.level}\n\n`;
  }

  return report;
}

/**
 * Assert theme contrast passes WCAG AA
 * Useful for automated tests
 * @param colors Color scheme to validate
 * @throws Error if any pairs fail
 */
export function assertThemeContrast(colors: Colors): void {
  const failures = validateThemeContrast(colors);

  if (failures.length > 0) {
    throw new Error(
      `Theme contrast validation failed:\n${generateContrastReport(colors)}`
    );
  }
}
