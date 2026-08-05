import React from 'react';
import { View, Linking, Pressable } from 'react-native';
import { Typography, ThemedView, useTheme } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { CodeBlock } from '../../components/code-block';
import { DocsPagination } from '../../components/docs-pagination';
import { DocsPage } from '../../components/docs-page';

export default function ThemingPage() {
  const theme = useTheme();
  const { spacing } = theme;

  return (
    <DocsPage
      title="Theming"
      description="NativeCtx UI uses a Brand config to drive the entire design system — colors, spacing, shape, and dark mode."
    >
      <DemoSection
        title="Brand config"
        description="Pass a Brand object to NativeCtxProvider at the root of your app. Everything in the design system reads from it."
      >
        <CodeBlock
          variant="code"
          code={"import { NativeCtxProvider, createBrand } from '@nativectx/ui';\n\nconst brand = createBrand({ ... });\n\nexport default function RootLayout() {\n  return (\n    <NativeCtxProvider brand={brand}>\n      <Stack />\n    </NativeCtxProvider>\n  );\n}"}
        />
      </DemoSection>

      <DemoSection
        title="How palette generation works"
        description="Material 3 does not rely on hand-picked colors. Algorithms generate accessible, harmonious schemes from a single input using Material Color Utilities."
      >
        <View style={{ gap: spacing.lg }}>
          <Typography variant="bodyMedium" color={theme.onSurfaceVariant}>
            Rather than manually selecting every shade, M3&apos;s dynamic color system uses color algorithms to derive a complete, accessible scheme from one seed. NativeCtx UI implements this via{' '}
            <Pressable onPress={() => Linking.openURL('https://github.com/material-foundation/material-color-utilities')}>
              <Typography variant="bodyMedium" color={theme.primary} style={{ textDecorationLine: 'underline' }}>material-color-utilities</Typography>
            </Pressable>
            {' '}— Google&apos;s open source library powering dynamic color across the Material ecosystem.
          </Typography>
          <Typography variant="bodyMedium" color={theme.onSurfaceVariant}>
            Your primary hex is converted into HCT — a perceptually uniform color space (Hue, Chroma, Tone). From that single value, five tonal palettes are generated:
          </Typography>

          {[
            { label: 'Primary', swatch: theme.primary, description: 'Your seed color, same hue and chroma.' },
            { label: 'Secondary', swatch: theme.secondary, description: 'Same hue, chroma reduced to 16. Harmonious and muted.' },
            { label: 'Tertiary', swatch: theme.tertiary, description: 'Hue rotated +60°. A complementary accent that contrasts without clashing.' },
            { label: 'Neutral', swatch: theme.surface, description: 'Same hue, chroma reduced to 4. Drives all surface and background colors.' },
            { label: 'Error', swatch: theme.error, description: 'Fixed M3 standard red. Not derived from your seed.' },
          ].map(({ label, swatch, description }) => (
            <View key={label} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
              <View style={{ width: 32, height: 32, borderRadius: theme.borderRadius.sm, backgroundColor: swatch, borderWidth: 1, borderColor: theme.outlineVariant, flexShrink: 0, marginTop: 2 }} />
              <View style={{ flex: 1, gap: 2 }}>
                <Typography variant="labelLarge" weight="bold">{label}</Typography>
                <Typography variant="bodySmall" muted>{description}</Typography>
              </View>
            </View>
          ))}

          <Typography variant="bodyMedium" color={theme.onSurfaceVariant}>
            Each palette spans tones 0–100 (dark to light). M3 assigns specific tones to each color role — for example, light theme primary is tone 40, dark theme primary is tone 80 — so contrast ratios are guaranteed in both modes without any manual work.
          </Typography>

          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: theme.shape.surfaceBorderRadius, gap: spacing.sm }}>
            <Typography variant="labelMedium" weight="bold">You can override any palette seed</Typography>
            <Typography variant="bodySmall" muted>
              {'colorSeed accepts optional secondary, tertiary, and neutral overrides if you need precise control. Start with just primary — add overrides later when your brand is defined.'}
            </Typography>
            <CodeBlock
              variant="code"
              code={"colors: {\n  colorSeed: {\n    primary: '#6750A4',\n    secondary: '#B0C4DE', // optional\n    tertiary: '#E8A87C',  // optional\n  },\n}"}
            />
          </ThemedView>
        </View>
      </DemoSection>

      <DemoSection
        title="Seed-based colors (recommended)"
        description="Provide a single primary hex color. NativeCtx UI generates all 26 M3 color tokens for both light and dark themes automatically — contrast ratios guaranteed."
      >
        <CodeBlock
          variant="code"
          code={"const brand = createBrand({\n  name: 'My App',\n  colors: {\n    colorSeed: {\n      primary: '#6750A4',\n    },\n  },\n  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 40 },\n  borderRadius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 28, full: 9999 },\n});"}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>
          {[
            { label: 'primary', color: theme.primary },
            { label: 'primaryContainer', color: theme.primaryContainer },
            { label: 'secondary', color: theme.secondary },
            { label: 'secondaryContainer', color: theme.secondaryContainer },
            { label: 'tertiary', color: theme.tertiary },
            { label: 'surface', color: theme.surface },
            { label: 'surfaceContainer', color: theme.surfaceContainer },
            { label: 'error', color: theme.error },
          ].map(({ label, color }) => (
            <View key={label} style={{ alignItems: 'center', gap: spacing.xs }}>
              <View style={{ width: 40, height: 40, borderRadius: theme.borderRadius.sm, backgroundColor: color, borderWidth: 1, borderColor: theme.outlineVariant }} />
              <Typography variant="labelSmall" muted>{label}</Typography>
            </View>
          ))}
        </View>
      </DemoSection>

      <DemoSection
        title="Manual colors"
        description="Provide all 26 M3 color tokens directly. Use this when you have an existing design system or need precise control over every color."
      >
        <CodeBlock
          variant="code"
          code={"const brand = createBrand({\n  name: 'My App',\n  colors: {\n    primary: '#6750A4',\n    onPrimary: '#FFFFFF',\n    primaryContainer: '#EADDFF',\n    onPrimaryContainer: '#21005D',\n    // ... all 26 tokens required\n  },\n  // Optionally provide separate dark colors:\n  darkColors: {\n    primary: '#D0BCFF',\n    // ...\n  },\n  spacing: { ... },\n  borderRadius: { ... },\n});"}
        />
      </DemoSection>

      <DemoSection
        title="Shape"
        description="shape controls the two most common border radii. Use theme.shape in your components rather than the full borderRadius scale for consistent rounding."
      >
        <CodeBlock
          variant="code"
          code={"createBrand({\n  // ...\n  shape: {\n    surfaceBorderRadius: 12, // cards, containers, collapsibles\n    buttonBorderRadius: 8,   // buttons, interactive elements\n  },\n});"}
        />
        <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md }}>
          <View style={{ gap: spacing.xs, alignItems: 'center' }}>
            <ThemedView variant="surfaceContainer" style={{ width: 80, height: 48, borderRadius: theme.shape.surfaceBorderRadius }} />
            <Typography variant="labelSmall" muted>surfaceBorderRadius</Typography>
            <Typography variant="labelSmall" muted>{theme.shape.surfaceBorderRadius}px</Typography>
          </View>
          <View style={{ gap: spacing.xs, alignItems: 'center' }}>
            <ThemedView variant="primary" style={{ width: 80, height: 48, borderRadius: theme.shape.buttonBorderRadius }} />
            <Typography variant="labelSmall" muted>buttonBorderRadius</Typography>
            <Typography variant="labelSmall" muted>{theme.shape.buttonBorderRadius}px</Typography>
          </View>
        </View>
      </DemoSection>

      <DemoSection
        title="Spacing scale"
        description="Seven named steps used throughout the system. Override to match your design grid."
      >
        <CodeBlock
          variant="code"
          code={"createBrand({\n  // ...\n  spacing: {\n    xs: 4,\n    sm: 8,\n    md: 12,\n    lg: 16,\n    xl: 20,\n    xxl: 24,\n    xxxl: 40,\n  },\n});"}
        />
        <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
          {(Object.entries(theme.spacing) as [string, number][]).map(([key, value]) => (
            <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Typography variant="labelMedium" style={{ width: 32 }}>{key}</Typography>
              <View style={{ width: value, height: 16, backgroundColor: theme.primary, borderRadius: theme.borderRadius.xs }} />
              <Typography variant="labelSmall" muted>{value}px</Typography>
            </View>
          ))}
        </View>
      </DemoSection>

      <DemoSection
        title="Dark mode"
        description="Dark theme is generated automatically from the same seed. The provider follows the OS setting by default; useThemeMode() overrides it at runtime."
      >
        <CodeBlock
          variant="code"
          code={"import { useThemeMode } from '@nativectx/ui';\n\nconst { mode, setMode, toggleTheme, isFollowingSystem } = useThemeMode();\n// mode: 'light' | 'dark' — resolved, never 'system'\n\nsetMode('dark');    // sticky override, survives system changes\nsetMode('system');  // back to following the OS"}
        />
      </DemoSection>

      <DemoSection
        title="defaultBrand"
        description="NativeCtx UI ships a ready-to-use brand using M3 reference purple (#6750A4). Import it directly to get started without any configuration."
      >
        <CodeBlock
          variant="code"
          code={"import { NativeCtxProvider, defaultBrand } from '@nativectx/ui';\n\n<NativeCtxProvider brand={defaultBrand}>\n  <Stack />\n</NativeCtxProvider>"}
        />
      </DemoSection>

      <DocsPagination />
    </DocsPage>
  );
}
