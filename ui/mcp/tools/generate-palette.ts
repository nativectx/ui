import { generateLightPalette, generateDarkPalette, colorsToCodeString } from '../utils/palette.js';

export function generatePalette(primaryHex: string, secondaryHex?: string, tertiaryHex?: string): string {
  let hex = primaryHex.trim();
  if (!hex.startsWith('#')) hex = `#${hex}`;

  try {
    const light = generateLightPalette(hex);
    const dark = generateDarkPalette(hex);

    const lines: string[] = [
      `# M3 Palette generated from ${hex}`,
      '',
      '## Light theme colors',
      '```typescript',
      colorsToCodeString(light, 'lightColors'),
      '```',
      '',
      '## Dark theme colors',
      '```typescript',
      colorsToCodeString(dark, 'darkColors'),
      '```',
      '',
      '## Usage in createBrand()',
      '```typescript',
      `import { createBrand } from '@nativectx/ui';`,
      '',
      `const brand = createBrand({`,
      `  name: 'My App',`,
      `  colors: { colorSeed: { primary: '${hex}' } },`,
      `  // dark colors auto-generated from the same seed`,
      `  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 40 },`,
      `  borderRadius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 28, full: 9999 },`,
      `});`,
      '```',
    ];

    return lines.join('\n');
  } catch (err) {
    return `Failed to generate palette from "${primaryHex}": ${err instanceof Error ? err.message : String(err)}`;
  }
}
