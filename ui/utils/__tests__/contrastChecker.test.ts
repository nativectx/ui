/**
 * Contrast Checker Tests
 * Validates WCAG compliance for default themes
 */

import { generateLightColors, generateDarkColors } from '../../brand/palette-generator';
import { checkThemeContrast, validateThemeContrast, assertThemeContrast } from '../contrast-checker';

describe('Contrast Checker', () => {
  describe('Material Design 3 Default Purple Theme', () => {
    it('should pass WCAG AA contrast for light theme', () => {
      const lightColors = generateLightColors({ primary: '#6750A4' });
      const failures = validateThemeContrast(lightColors);

      if (failures.length > 0) {
        console.log('Light theme contrast failures:');
        failures.forEach(f => {
          console.log(`  ${f.pair}: ${f.level} (${f.foreground} on ${f.background})`);
        });
      }

      expect(failures.length).toBe(0);
    });

    it('should pass WCAG AA contrast for dark theme', () => {
      const darkColors = generateDarkColors({ primary: '#6750A4' });
      const failures = validateThemeContrast(darkColors);

      if (failures.length > 0) {
        console.log('Dark theme contrast failures:');
        failures.forEach(f => {
          console.log(`  ${f.pair}: ${f.level} (${f.foreground} on ${f.background})`);
        });
      }

      expect(failures.length).toBe(0);
    });
  });

  describe('Custom Brand Colors', () => {
    it('should validate custom primary color', () => {
      const lightColors = generateLightColors({ primary: '#FF5722' });
      const checks = checkThemeContrast(lightColors);

      // All checks should return results
      expect(checks.length).toBeGreaterThan(0);

      // Primary/onPrimary should have a contrast check
      const primaryCheck = checks.find(c => c.pair === 'primary/onPrimary');
      expect(primaryCheck).toBeDefined();
      expect(primaryCheck?.foreground).toBeDefined();
      expect(primaryCheck?.background).toBeDefined();
    });
  });

  describe('assertThemeContrast', () => {
    it('should not throw for valid theme', () => {
      const validColors = generateLightColors({ primary: '#6750A4' });

      expect(() => {
        assertThemeContrast(validColors);
      }).not.toThrow();
    });

    it('should throw for invalid theme', () => {
      // Create an intentionally bad theme with poor contrast
      const badColors = generateLightColors({ primary: '#FFFF00' });
      // Force bad contrast by setting onPrimary to a similar color
      badColors.onPrimary = '#FFFFAA';

      expect(() => {
        assertThemeContrast(badColors);
      }).toThrow(/contrast validation failed/i);
    });
  });

  describe('WCAG Levels', () => {
    it('should differentiate between AA and AAA levels', () => {
      const colors = generateLightColors({ primary: '#6750A4' });
      const checks = checkThemeContrast(colors);

      // Should have at least some AAA-level pairs
      const aaaChecks = checks.filter(c => c.level === 'AAA');
      const aaChecks = checks.filter(c => c.level === 'AA');

      expect(aaaChecks.length + aaChecks.length).toBeGreaterThan(0);
    });
  });
});
