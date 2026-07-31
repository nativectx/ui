import React from 'react';
import { View } from 'react-native';
import { Typography, ThemedView, useTheme } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const themedViewProps: PropDefinition[] = [
  {
    name: 'variant',
    type: "'surface' | 'surfaceContainer' | 'card' | 'appbar' | 'primary' | 'background'",
    default: "'surface'",
    description: 'Semantic background variant from the theme',
  },
  {
    name: 'color',
    type: 'string',
    description: 'Override with a specific background color',
  },
  {
    name: 'columns',
    type: 'number',
    description: 'Number of columns on medium+ screens (1 column on small). Enables responsive grid layout.',
  },
  {
    name: 'gap',
    type: 'number',
    description: 'Gap between items when columns is set',
  },
  {
    name: 'elevation',
    type: '0 | 1 | 2 | 3 | 4 | 5',
    description: 'M3 elevation level. Card variant defaults to 1, all others default to 0.',
  },
  {
    name: 'rounded',
    type: 'boolean',
    default: 'true',
    description: 'Apply border radius from theme',
  },
  {
    name: 'style',
    type: 'ViewStyle',
    description: 'Additional styles to apply',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'Content to render inside the themed view',
  },
];

export default function ThemedViewPage() {
  const theme = useTheme();
  const { spacing } = theme;
  const rowStyle = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: spacing.md };

  return (
    <DocsPage
      title="ThemedView"
      description="Theme-aware View component with semantic background variants for consistent styling."
      sidebarIcon="right"
    >
      <DemoSection
        title="Surface Variants"
        description="Different surface levels for visual hierarchy"
        code={`<ThemedView variant="background" style={{ padding: 16 }}>
  <Typography>background</Typography>
</ThemedView>
<ThemedView variant="surface" style={{ padding: 16 }}>
  <Typography>surface</Typography>
</ThemedView>
<ThemedView variant="surfaceContainer" style={{ padding: 16 }}>
  <Typography>surfaceContainer</Typography>
</ThemedView>
<ThemedView variant="card" style={{ padding: 16 }}>
  <Typography>card</Typography>
</ThemedView>
<ThemedView variant="primary" style={{ padding: 16 }}>
  <Typography color={theme.onPrimary}>primary</Typography>
</ThemedView>`}
      >
        <View style={rowStyle}>
          <ThemedView variant="background" style={{ padding: spacing.lg, borderRadius: spacing.md, minWidth: 140, gap: spacing.xs }}>
            <Typography variant="labelMedium" weight="medium">background</Typography>
            <Typography variant="labelSmall" muted>Page backgrounds</Typography>
          </ThemedView>

          <ThemedView variant="surface" style={{ padding: spacing.lg, borderRadius: spacing.md, minWidth: 140, gap: spacing.xs }}>
            <Typography variant="labelMedium" weight="medium">surface</Typography>
            <Typography variant="labelSmall" muted>Default surface</Typography>
          </ThemedView>

          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.md, minWidth: 140, gap: spacing.xs }}>
            <Typography variant="labelMedium" weight="medium">surfaceContainer</Typography>
            <Typography variant="labelSmall" muted>Container surfaces</Typography>
          </ThemedView>

          <ThemedView variant="card" style={{ padding: spacing.lg, borderRadius: spacing.md, minWidth: 140, gap: spacing.xs }}>
            <Typography variant="labelMedium" weight="medium">card</Typography>
            <Typography variant="labelSmall" muted>Card backgrounds</Typography>
          </ThemedView>

          <ThemedView variant="appbar" style={{ padding: spacing.lg, borderRadius: spacing.md, minWidth: 140, gap: spacing.xs }}>
            <Typography variant="labelMedium" weight="medium">appbar</Typography>
            <Typography variant="labelSmall" muted>App bar backgrounds</Typography>
          </ThemedView>

          <ThemedView variant="primary" style={{ padding: spacing.lg, borderRadius: spacing.md, minWidth: 140, gap: spacing.xs }}>
            <Typography variant="labelMedium" weight="medium" color={theme.onPrimary}>
              primary
            </Typography>
            <Typography variant="labelSmall" color={theme.onPrimary} style={{ opacity: 0.8 }}>
              Primary brand color
            </Typography>
          </ThemedView>
        </View>
      </DemoSection>

      <DemoSection
        title="Custom Colors"
        description="Override the variant with a specific color"
        code={`<ThemedView color="#E8DEF8" style={{ padding: 16 }}>
  <Typography>#E8DEF8</Typography>
</ThemedView>
<ThemedView color="#D0BCFF" style={{ padding: 16 }}>
  <Typography>#D0BCFF</Typography>
</ThemedView>
<ThemedView color="#6750A4" style={{ padding: 16 }}>
  <Typography color="#FFFFFF">#6750A4</Typography>
</ThemedView>`}
      >
        <View style={rowStyle}>
          <ThemedView color="#E8DEF8" style={{ padding: spacing.lg, borderRadius: spacing.sm, minWidth: 100, alignItems: 'center' }}>
            <Typography variant="labelMedium">#E8DEF8</Typography>
          </ThemedView>
          <ThemedView color="#D0BCFF" style={{ padding: spacing.lg, borderRadius: spacing.sm, minWidth: 100, alignItems: 'center' }}>
            <Typography variant="labelMedium">#D0BCFF</Typography>
          </ThemedView>
          <ThemedView color="#6750A4" style={{ padding: spacing.lg, borderRadius: spacing.sm, minWidth: 100, alignItems: 'center' }}>
            <Typography variant="labelMedium" color="#FFFFFF">#6750A4</Typography>
          </ThemedView>
        </View>
      </DemoSection>

      <DemoSection
        title="Responsive Grid"
        description="Use columns prop for automatic responsive layouts (2 columns on medium+, 1 on small)"
        code={`<ThemedView columns={2} gap={16}>
  <ThemedView variant="card" style={{ padding: 16 }}>
    <Typography variant="titleSmall" weight="medium">Card 1</Typography>
  </ThemedView>
  <ThemedView variant="card" style={{ padding: 16 }}>
    <Typography variant="titleSmall" weight="medium">Card 2</Typography>
  </ThemedView>
</ThemedView>`}
      >
        <ThemedView columns={2} gap={spacing.lg}>
          <ThemedView variant="card" style={{ padding: spacing.lg, gap: spacing.xs }}>
            <Typography variant="titleSmall" weight="medium">Card 1</Typography>
            <Typography variant="bodySmall" muted>Automatically responsive</Typography>
          </ThemedView>
          <ThemedView variant="card" style={{ padding: spacing.lg, gap: spacing.xs }}>
            <Typography variant="titleSmall" weight="medium">Card 2</Typography>
            <Typography variant="bodySmall" muted>No manual breakpoint logic</Typography>
          </ThemedView>
          <ThemedView variant="card" style={{ padding: spacing.lg, gap: spacing.xs }}>
            <Typography variant="titleSmall" weight="medium">Card 3</Typography>
            <Typography variant="bodySmall" muted>Just set columns={'{2}'}</Typography>
          </ThemedView>
          <ThemedView variant="card" style={{ padding: spacing.lg, gap: spacing.xs }}>
            <Typography variant="titleSmall" weight="medium">Card 4</Typography>
            <Typography variant="bodySmall" muted>Children get responsive styles</Typography>
          </ThemedView>
        </ThemedView>
      </DemoSection>

      <DemoSection
        title="Use Cases"
        description="Common patterns for using ThemedView"
        code={`<ThemedView variant="card" style={{ padding: 20, borderRadius: 16, gap: 8 }}>
  <Typography variant="titleMedium" weight="medium">Card Component</Typography>
  <Typography variant="bodySmall" muted>Use the card variant for elevated content</Typography>
</ThemedView>

<ThemedView variant="surface" style={{ padding: 16, borderRadius: 12, gap: 12 }}>
  <Typography variant="labelMedium" weight="medium">Surface</Typography>
  <ThemedView variant="surfaceContainer" style={{ padding: 12, borderRadius: 8 }}>
    <Typography variant="labelSmall">surfaceContainer (nested)</Typography>
  </ThemedView>
</ThemedView>`}
      >
        <View style={{ gap: spacing.lg }}>
          <ThemedView variant="card" style={{ padding: spacing.xl, borderRadius: spacing.lg, gap: spacing.sm }}>
            <Typography variant="titleMedium" weight="medium">Card Component</Typography>
            <Typography variant="bodySmall" muted>
              Use the card variant for elevated content cards
            </Typography>
          </ThemedView>

          <ThemedView variant="surface" style={{ padding: spacing.lg, borderRadius: spacing.md, gap: spacing.md }}>
            <Typography variant="labelMedium" weight="medium">Surface</Typography>
            <ThemedView variant="surfaceContainer" style={{ padding: spacing.md, borderRadius: spacing.sm }}>
              <Typography variant="labelSmall">surfaceContainer (nested)</Typography>
            </ThemedView>
          </ThemedView>
        </View>
      </DemoSection>

      <DemoSection
        title="Elevation"
        description="M3 elevation levels 0–5. The card variant defaults to level 1."
        code={`<ThemedView variant="card" elevation={0} style={{ padding: 16 }}>
  <Typography>Level 0 — flat</Typography>
</ThemedView>
<ThemedView variant="card" elevation={1} style={{ padding: 16 }}>
  <Typography>Level 1 — default card</Typography>
</ThemedView>
<ThemedView variant="card" elevation={3} style={{ padding: 16 }}>
  <Typography>Level 3 — dialog</Typography>
</ThemedView>`}
      >
        <View style={rowStyle}>
          {([0, 1, 2, 3, 4, 5] as const).map((level) => (
            <ThemedView
              key={level}
              variant="card"
              elevation={level}
              style={{ padding: spacing.lg, borderRadius: spacing.md, minWidth: 100, alignItems: 'center', gap: spacing.xs }}
            >
              <Typography variant="labelMedium" weight="medium">Level {level}</Typography>
            </ThemedView>
          ))}
        </View>
      </DemoSection>

      <ApiSection props={themedViewProps} />
      <DocsPagination />
    </DocsPage>
  );
}
