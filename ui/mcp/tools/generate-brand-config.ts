const SPACING_PRESETS = {
  compact:     { xs: 2,  sm: 4,  md: 8,  lg: 12, xl: 16, xxl: 20, xxxl: 28 },
  default:     { xs: 4,  sm: 8,  md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 40 },
  comfortable: { xs: 6,  sm: 10, md: 16, lg: 20, xl: 28, xxl: 36, xxxl: 56 },
};

const RADIUS_PRESETS = {
  sharp:   { xs: 2,  sm: 4,  md: 6,  lg: 8,  xl: 12, full: 9999 },
  default: { xs: 4,  sm: 8,  md: 12, lg: 16, xl: 28, full: 9999 },
  rounded: { xs: 8,  sm: 12, md: 16, lg: 24, xl: 32, full: 9999 },
};

export function generateBrandConfig(
  name: string,
  primaryHex: string,
  spacing: 'compact' | 'default' | 'comfortable' = 'default',
  borderRadius: 'sharp' | 'default' | 'rounded' = 'default',
): string {
  let hex = primaryHex.trim();
  if (!hex.startsWith('#')) hex = `#${hex}`;

  const sp = SPACING_PRESETS[spacing];
  const br = RADIUS_PRESETS[borderRadius];

  const lines: string[] = [
    `import { createBrand } from '@nativectx/ui';`,
    `import { NativeCtxProvider } from '@nativectx/ui';`,
    '',
    `// Brand: ${name}`,
    `// Primary color: ${hex} | Spacing: ${spacing} | Border radius: ${borderRadius}`,
    `export const brand = createBrand({`,
    `  name: '${name}',`,
    '',
    `  // M3 palette auto-generated from seed color`,
    `  colors: {`,
    `    colorSeed: {`,
    `      primary: '${hex}',`,
    `      // Optionally override secondary and tertiary:`,
    `      // secondary: '#625B71',`,
    `      // tertiary: '#7D5260',`,
    `    },`,
    `  },`,
    `  // Dark theme auto-generated from the same seed`,
    '',
    `  spacing: {`,
    `    xs: ${sp.xs}, sm: ${sp.sm}, md: ${sp.md}, lg: ${sp.lg},`,
    `    xl: ${sp.xl}, xxl: ${sp.xxl}, xxxl: ${sp.xxxl},`,
    `  },`,
    '',
    `  borderRadius: {`,
    `    xs: ${br.xs}, sm: ${br.sm}, md: ${br.md}, lg: ${br.lg},`,
    `    xl: ${br.xl}, full: ${br.full},`,
    `  },`,
    '',
    `  shape: {`,
    `    surfaceBorderRadius: ${br.md},`,
    `    buttonBorderRadius: ${br.sm},`,
    `  },`,
    `});`,
    '',
    `// Wrap your app root:`,
    `// <NativeCtxProvider brand={brand}>`,
    `//   <App />`,
    `// </NativeCtxProvider>`,
  ];

  return lines.join('\n');
}
