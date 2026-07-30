import React from 'react';
import { View } from 'react-native';
import { Typography, Screen, useTheme, NativeHeader, useSidebar } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';

function ColorSwatch({ label, color }: { label: string; color: string }) {
  const { spacing, borderRadius, onSurface } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: spacing.xs }}>
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: borderRadius.sm,
          backgroundColor: color,
          borderWidth: 1,
          borderColor: onSurface + '1A',
        }}
      />
      <Typography variant="labelSmall" style={{ textAlign: 'center' }}>
        {label}
      </Typography>
      <Typography variant="labelSmall" muted style={{ textAlign: 'center' }}>
        {color}
      </Typography>
    </View>
  );
}

function TokenRow({ label, value }: { label: string; value: string | number }) {
  const { spacing, outlineVariant } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: outlineVariant + '33',
      }}
    >
      <Typography variant="bodySmall">{label}</Typography>
      <Typography variant="labelMedium" muted>
        {String(value)}
      </Typography>
    </View>
  );
}

export default function TokensPage() {
  const theme = useTheme();
  const { spacing, borderRadius } = theme;
  const { open } = useSidebar();

  const colorGroups = [
    {
      title: 'Primary',
      colors: [
        { label: 'primary', color: theme.primary },
        { label: 'onPrimary', color: theme.onPrimary },
        { label: 'primaryContainer', color: theme.primaryContainer },
        { label: 'onPrimaryContainer', color: theme.onPrimaryContainer },
      ],
    },
    {
      title: 'Secondary',
      colors: [
        { label: 'secondary', color: theme.secondary },
        { label: 'onSecondary', color: theme.onSecondary },
        { label: 'secondaryContainer', color: theme.secondaryContainer },
        { label: 'onSecondaryContainer', color: theme.onSecondaryContainer },
      ],
    },
    {
      title: 'Tertiary',
      colors: [
        { label: 'tertiary', color: theme.tertiary },
        { label: 'onTertiary', color: theme.onTertiary },
        { label: 'tertiaryContainer', color: theme.tertiaryContainer },
        { label: 'onTertiaryContainer', color: theme.onTertiaryContainer },
      ],
    },
    {
      title: 'Error',
      colors: [
        { label: 'error', color: theme.error },
        { label: 'onError', color: theme.onError },
        { label: 'errorContainer', color: theme.errorContainer },
        { label: 'onErrorContainer', color: theme.onErrorContainer },
      ],
    },
    {
      title: 'Surface',
      colors: [
        { label: 'surface', color: theme.surface },
        { label: 'onSurface', color: theme.onSurface },
        { label: 'surfaceVariant', color: theme.surfaceVariant },
        { label: 'onSurfaceVariant', color: theme.onSurfaceVariant },
      ],
    },
    {
      title: 'Surface Containers',
      colors: [
        { label: 'Lowest', color: theme.surfaceContainerLowest },
        { label: 'Low', color: theme.surfaceContainerLow },
        { label: 'Container', color: theme.surfaceContainer },
        { label: 'High', color: theme.surfaceContainerHigh },
        { label: 'Highest', color: theme.surfaceContainerHighest },
      ],
    },
  ];

  const spacingEntries = Object.entries(spacing) as [string, number][];

  const borderRadiusEntries = Object.entries(borderRadius) as [string, number][];

  const typographyVariants = [
    { name: 'displayLarge', size: theme.typography.displayLarge },
    { name: 'displayMedium', size: theme.typography.displayMedium },
    { name: 'displaySmall', size: theme.typography.displaySmall },
    { name: 'headlineLarge', size: theme.typography.headlineLarge },
    { name: 'headlineMedium', size: theme.typography.headlineMedium },
    { name: 'headlineSmall', size: theme.typography.headlineSmall },
    { name: 'titleLarge', size: theme.typography.titleLarge },
    { name: 'titleMedium', size: theme.typography.titleMedium },
    { name: 'titleSmall', size: theme.typography.titleSmall },
    { name: 'bodyLarge', size: theme.typography.bodyLarge },
    { name: 'bodyMedium', size: theme.typography.bodyMedium },
    { name: 'bodySmall', size: theme.typography.bodySmall },
    { name: 'labelLarge', size: theme.typography.labelLarge },
    { name: 'labelMedium', size: theme.typography.labelMedium },
    { name: 'labelSmall', size: theme.typography.labelSmall },
  ];

  const componentTokenGroups = [
    { section: 'Button', tokens: theme.tokens.button },
    { section: 'Input', tokens: theme.tokens.input },
    { section: 'Appbar', tokens: theme.tokens.appbar },
    { section: 'Sidebar', tokens: theme.tokens.sidebar },
    { section: 'Chip', tokens: theme.tokens.chip },
    { section: 'Modal', tokens: theme.tokens.modal },
  ];

  return (
    <>
      <NativeHeader rightIcon="sidebar.left" onRightPress={open} />
      <Screen scrollable variant="background" edges={['bottom']}>
        <View style={{ paddingHorizontal: spacing.xxl, paddingTop: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.xxl, maxWidth: 760, alignSelf: 'center', width: '100%' }}>
          <View style={{ gap: spacing.xs, paddingBottom: spacing.xl, borderBottomWidth: 1, borderBottomColor: theme.outlineVariant }}>
            <Typography variant="headlineLarge" weight="bold">
              Design Tokens
            </Typography>
            <Typography variant="bodyLarge" muted>
              Live reference of all theme tokens. Values update automatically with the current theme.
            </Typography>
          </View>

          {/* Color Tokens */}
          <DemoSection title="Color Tokens" description="M3 color roles from the active theme">
            {colorGroups.map((group) => (
              <View key={group.title} style={{ gap: spacing.sm }}>
                <Typography variant="labelMedium" weight="medium">
                  {group.title}
                </Typography>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
                  {group.colors.map((c) => (
                    <ColorSwatch key={c.label} label={c.label} color={c.color} />
                  ))}
                </View>
              </View>
            ))}
          </DemoSection>

          {/* Spacing Scale */}
          <DemoSection title="Spacing Scale" description="Consistent spacing values used throughout the system">
            {spacingEntries.map(([key, value]) => (
              <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Typography variant="labelMedium" style={{ width: 40 }}>
                  {key}
                </Typography>
                <View
                  style={{
                    width: value,
                    height: 20,
                    backgroundColor: theme.primary,
                    borderRadius: borderRadius.xs,
                  }}
                />
                <Typography variant="labelSmall" muted>
                  {value}px
                </Typography>
              </View>
            ))}
          </DemoSection>

          {/* Border Radius */}
          <DemoSection title="Border Radius" description="Border radius scale for consistent rounding">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
              {borderRadiusEntries.map(([key, value]) => (
                <View key={key} style={{ alignItems: 'center', gap: spacing.xs }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: Math.min(value, 24),
                      backgroundColor: theme.primaryContainer,
                      borderWidth: 2,
                      borderColor: theme.primary,
                    }}
                  />
                  <Typography variant="labelSmall">{key}</Typography>
                  <Typography variant="labelSmall" muted>
                    {value}px
                  </Typography>
                </View>
              ))}
            </View>
          </DemoSection>

          {/* Typography Scale */}
          <DemoSection title="Typography Scale" description="M3 type scale with font sizes">
            {typographyVariants.map((v) => (
              <View
                key={v.name}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <Typography variant={v.name as any}>{v.name}</Typography>
                <Typography variant="labelSmall" muted>
                  {v.size}px
                </Typography>
              </View>
            ))}
          </DemoSection>

          {/* Component Tokens */}
          <DemoSection title="Component Tokens" description="Semantic tokens mapped to component usage">
            {componentTokenGroups.map((group) => (
              <View key={group.section} style={{ gap: spacing.xs }}>
                <Typography variant="labelLarge" weight="medium">
                  {group.section}
                </Typography>
                {Object.entries(group.tokens).map(([key, value]) => (
                  <TokenRow key={key} label={key} value={value as string | number} />
                ))}
              </View>
            ))}
          </DemoSection>
          <DocsPagination />
        </View>
      </Screen>
    </>
  );
}
