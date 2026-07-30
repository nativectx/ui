import { argbFromHex, hexFromArgb, TonalPalette, Hct } from '@material/material-color-utilities';

export interface M3Colors {
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
}

function tonalPalette(hex: string): TonalPalette {
  const hct = Hct.fromInt(argbFromHex(hex));
  return TonalPalette.fromHueAndChroma(hct.hue, hct.chroma);
}

function secondaryPalette(primaryHex: string): TonalPalette {
  const hct = Hct.fromInt(argbFromHex(primaryHex));
  return TonalPalette.fromHueAndChroma(hct.hue, Math.min(16, hct.chroma));
}

function tertiaryPalette(primaryHex: string): TonalPalette {
  const hct = Hct.fromInt(argbFromHex(primaryHex));
  return TonalPalette.fromHueAndChroma((hct.hue + 60) % 360, Math.max(24, hct.chroma));
}

function neutralPalette(primaryHex: string): TonalPalette {
  const hct = Hct.fromInt(argbFromHex(primaryHex));
  return TonalPalette.fromHueAndChroma(hct.hue, 0);
}

function neutralVariantPalette(primaryHex: string): TonalPalette {
  const hct = Hct.fromInt(argbFromHex(primaryHex));
  return TonalPalette.fromHueAndChroma(hct.hue, 3);
}

export function generateLightPalette(primaryHex: string, secondaryHex?: string, tertiaryHex?: string): M3Colors {
  const primary = tonalPalette(primaryHex);
  const secondary = secondaryHex ? tonalPalette(secondaryHex) : secondaryPalette(primaryHex);
  const tertiary = tertiaryHex ? tonalPalette(tertiaryHex) : tertiaryPalette(primaryHex);
  const error = TonalPalette.fromHueAndChroma(25, 84);
  const neutral = neutralPalette(primaryHex);
  const neutralVariant = neutralVariantPalette(primaryHex);
  const h = hexFromArgb;

  return {
    primary: h(primary.tone(40)),
    onPrimary: h(primary.tone(100)),
    primaryContainer: h(primary.tone(90)),
    onPrimaryContainer: h(primary.tone(10)),
    secondary: h(secondary.tone(40)),
    onSecondary: h(secondary.tone(100)),
    secondaryContainer: h(secondary.tone(90)),
    onSecondaryContainer: h(secondary.tone(10)),
    tertiary: h(tertiary.tone(40)),
    onTertiary: h(tertiary.tone(100)),
    tertiaryContainer: h(tertiary.tone(90)),
    onTertiaryContainer: h(tertiary.tone(10)),
    error: h(error.tone(40)),
    onError: h(error.tone(100)),
    errorContainer: h(error.tone(90)),
    onErrorContainer: h(error.tone(10)),
    surface: h(neutral.tone(98)),
    onSurface: h(neutral.tone(10)),
    onSurfaceVariant: h(neutralVariant.tone(30)),
    surfaceContainerLowest: h(neutral.tone(100)),
    surfaceContainerLow: h(neutral.tone(96)),
    surfaceContainer: h(neutral.tone(94)),
    surfaceContainerHigh: h(neutral.tone(92)),
    surfaceContainerHighest: h(neutral.tone(90)),
    outline: h(neutralVariant.tone(50)),
    outlineVariant: h(neutralVariant.tone(80)),
    inverseSurface: h(neutral.tone(20)),
    inverseOnSurface: h(neutral.tone(95)),
    inversePrimary: h(primary.tone(80)),
    scrim: h(neutral.tone(0)),
    shadow: h(neutral.tone(0)),
  };
}

export function generateDarkPalette(primaryHex: string, secondaryHex?: string, tertiaryHex?: string): M3Colors {
  const primary = tonalPalette(primaryHex);
  const secondary = secondaryHex ? tonalPalette(secondaryHex) : secondaryPalette(primaryHex);
  const tertiary = tertiaryHex ? tonalPalette(tertiaryHex) : tertiaryPalette(primaryHex);
  const error = TonalPalette.fromHueAndChroma(25, 84);
  const neutral = neutralPalette(primaryHex);
  const neutralVariant = neutralVariantPalette(primaryHex);
  const h = hexFromArgb;

  return {
    primary: h(primary.tone(80)),
    onPrimary: h(primary.tone(20)),
    primaryContainer: h(primary.tone(30)),
    onPrimaryContainer: h(primary.tone(90)),
    secondary: h(secondary.tone(80)),
    onSecondary: h(secondary.tone(20)),
    secondaryContainer: h(secondary.tone(30)),
    onSecondaryContainer: h(secondary.tone(90)),
    tertiary: h(tertiary.tone(80)),
    onTertiary: h(tertiary.tone(20)),
    tertiaryContainer: h(tertiary.tone(30)),
    onTertiaryContainer: h(tertiary.tone(90)),
    error: h(error.tone(80)),
    onError: h(error.tone(20)),
    errorContainer: h(error.tone(30)),
    onErrorContainer: h(error.tone(90)),
    surface: h(neutral.tone(6)),
    onSurface: h(neutral.tone(90)),
    onSurfaceVariant: h(neutralVariant.tone(80)),
    surfaceContainerLowest: h(neutral.tone(4)),
    surfaceContainerLow: h(neutral.tone(10)),
    surfaceContainer: h(neutral.tone(12)),
    surfaceContainerHigh: h(neutral.tone(17)),
    surfaceContainerHighest: h(neutral.tone(22)),
    outline: h(neutralVariant.tone(60)),
    outlineVariant: h(neutralVariant.tone(30)),
    inverseSurface: h(neutral.tone(90)),
    inverseOnSurface: h(neutral.tone(20)),
    inversePrimary: h(primary.tone(40)),
    scrim: h(neutral.tone(0)),
    shadow: h(neutral.tone(0)),
  };
}

export function colorsToCodeString(colors: M3Colors, varName = 'colors'): string {
  const entries = Object.entries(colors)
    .map(([k, v]) => `  ${k}: '${v}',`)
    .join('\n');
  return `const ${varName} = {\n${entries}\n};`;
}
