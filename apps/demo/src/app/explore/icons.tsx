import React from 'react';
import { View } from 'react-native';
import {
  Typography,
  ThemedView,
  useTheme,
  renderIcon,
} from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { DocsPage } from '../../components/docs-page';

const iconLibraries = [
  { name: 'Feather', description: 'Clean, minimal line icons (default)' },
  { name: 'MaterialIcons', description: 'Google Material Design icons' },
  { name: 'Ionicons', description: 'Premium icons for Ionic Framework' },
  { name: 'FontAwesome', description: 'Classic web icon set' },
  { name: 'AntDesign', description: 'Ant Design System icons' },
  { name: 'Entypo', description: 'Entypo+ icon set' },
  { name: 'EvilIcons', description: 'Lightweight SVG icons' },
  { name: 'Foundation', description: 'Foundation framework icons' },
  { name: 'MaterialCommunityIcons', description: 'Extended Material icons' },
  { name: 'Octicons', description: 'GitHub Octicons' },
  { name: 'SimpleLineIcons', description: 'Simple line-styled icons' },
  { name: 'Zocial', description: 'Social and brand icons' },
] as const;

const commonFeatherIcons = [
  'home', 'search', 'settings', 'user', 'heart', 'star',
  'bell', 'mail', 'camera', 'image', 'edit', 'trash-2',
  'plus', 'minus', 'x', 'check', 'chevron-right', 'chevron-down',
  'arrow-left', 'arrow-right', 'external-link', 'download',
  'upload', 'share', 'copy', 'eye', 'eye-off', 'lock',
  'unlock', 'globe', 'map-pin', 'clock', 'calendar', 'filter',
  'menu', 'more-horizontal', 'more-vertical', 'refresh-cw', 'log-out', 'info',
];

export default function IconsPage() {
  const theme = useTheme();
  const { spacing, borderRadius } = theme;

  return (
    <DocsPage
      title="Icons"
      description="Icon system reference with supported libraries, usage patterns, and a gallery of common icons."
    >
      <DemoSection
        title="Supported Libraries"
        description="12 icon libraries available via @expo/vector-icons"
      >
        {iconLibraries.map((lib) => (
          <View
            key={lib.name}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
              paddingVertical: spacing.xs,
            }}
          >
            {renderIcon({ library: lib.name as any, name: getExampleIcon(lib.name) }, 'Feather', 20, theme.primary)}
            <View style={{ flex: 1 }}>
              <Typography variant="bodySmall" weight="medium">
                {lib.name}
              </Typography>
              <Typography variant="labelSmall" muted>
                {lib.description}
              </Typography>
            </View>
          </View>
        ))}
      </DemoSection>

      <DemoSection
        title="Icon Usage"
        description="renderIcon() accepts a PlatformIcon or string, with optional library, size, and color"
        code={`import { renderIcon } from '@nativectx/ui';

// Basic usage
renderIcon({ library: 'Feather', name: 'star' }, 'Feather', 24, theme.primary)

// Different sizes
renderIcon({ library: 'Feather', name: 'star' }, 'Feather', 14, theme.onSurface)
renderIcon({ library: 'Feather', name: 'star' }, 'Feather', 32, theme.onSurface)

// Cross-library
renderIcon({ library: 'MaterialIcons', name: 'home' }, 'Feather', 24, theme.primary)
renderIcon({ library: 'Ionicons', name: 'home' }, 'Feather', 24, theme.primary)`}
      >
        <View style={{ gap: spacing.md }}>
          <Typography variant="labelMedium" weight="medium">Sizes</Typography>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
            {[14, 18, 24, 32, 48].map((size) => (
              <View key={size} style={{ alignItems: 'center', gap: spacing.xs }}>
                {renderIcon({ library: 'Feather', name: 'star' }, 'Feather', size, theme.onSurface)}
                <Typography variant="labelSmall" muted>{size}px</Typography>
              </View>
            ))}
          </View>
        </View>
        <View style={{ gap: spacing.md }}>
          <Typography variant="labelMedium" weight="medium">Colors</Typography>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
            {[
              { label: 'primary', color: theme.primary },
              { label: 'secondary', color: theme.secondary },
              { label: 'tertiary', color: theme.tertiary },
              { label: 'error', color: theme.error },
              { label: 'onSurface', color: theme.onSurface },
            ].map((c) => (
              <View key={c.label} style={{ alignItems: 'center', gap: spacing.xs }}>
                {renderIcon({ library: 'Feather', name: 'heart' }, 'Feather', 24, c.color)}
                <Typography variant="labelSmall" muted>{c.label}</Typography>
              </View>
            ))}
          </View>
        </View>
        <View style={{ gap: spacing.md }}>
          <Typography variant="labelMedium" weight="medium">Cross-Library</Typography>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
            {[
              { library: 'Feather' as const, name: 'home', label: 'Feather' },
              { library: 'MaterialIcons' as const, name: 'home', label: 'Material' },
              { library: 'Ionicons' as const, name: 'home', label: 'Ionicons' },
              { library: 'AntDesign' as const, name: 'home', label: 'AntDesign' },
              { library: 'Octicons' as const, name: 'home', label: 'Octicons' },
            ].map((icon) => (
              <View key={icon.label} style={{ alignItems: 'center', gap: spacing.xs }}>
                {renderIcon({ library: icon.library, name: icon.name }, 'Feather', 24, theme.onSurface)}
                <Typography variant="labelSmall" muted>{icon.label}</Typography>
              </View>
            ))}
          </View>
        </View>
      </DemoSection>

      <DemoSection
        title="IconConfig Reference"
        description="Configuration interfaces for the icon system"
        code={`// PlatformIcon — used with renderIcon()
{ library?: IconLibrary; name: string }

// NavigationIcon — used in navigation components
{ web?: PlatformIcon | string; mobile?: PlatformIcon | string }

// Button IconConfig — used with the Button icon prop
{ library?: IconLibrary; name: string; size?: number; color?: string }`}
      >
        <View style={{ gap: spacing.sm }}>
          <Typography variant="labelLarge" weight="medium">PlatformIcon</Typography>
          <ThemedView
            variant="surfaceContainer"
            style={{ padding: spacing.md, borderRadius: borderRadius.sm }}
          >
            <Typography variant="bodySmall" style={{ fontFamily: 'monospace' }}>
              {'{ library?: IconLibrary; name: string }'}
            </Typography>
          </ThemedView>
        </View>
        <View style={{ gap: spacing.sm }}>
          <Typography variant="labelLarge" weight="medium">NavigationIcon</Typography>
          <ThemedView
            variant="surfaceContainer"
            style={{ padding: spacing.md, borderRadius: borderRadius.sm }}
          >
            <Typography variant="bodySmall" style={{ fontFamily: 'monospace' }}>
              {'{ web?: PlatformIcon | string; mobile?: PlatformIcon | string }'}
            </Typography>
          </ThemedView>
        </View>
        <View style={{ gap: spacing.sm }}>
          <Typography variant="labelLarge" weight="medium">Button IconConfig</Typography>
          <ThemedView
            variant="surfaceContainer"
            style={{ padding: spacing.md, borderRadius: borderRadius.sm }}
          >
            <Typography variant="bodySmall" style={{ fontFamily: 'monospace' }}>
              {'{ library?: IconLibrary; name: string; size?: number; color?: string }'}
            </Typography>
          </ThemedView>
        </View>
      </DemoSection>

      <DemoSection
        title="Common Feather Icons"
        description="Frequently used icons from the default Feather library"
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {commonFeatherIcons.map((name) => (
            <View
              key={name}
              style={{
                width: 72,
                height: 72,
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.xs,
              }}
            >
              {renderIcon({ library: 'Feather', name }, 'Feather', 20, theme.onSurface)}
              <Typography variant="labelSmall" muted style={{ textAlign: 'center', fontSize: 9 }}>
                {name}
              </Typography>
            </View>
          ))}
        </View>
      </DemoSection>

      <DocsPagination />
    </DocsPage>
  );
}

function getExampleIcon(library: string): string {
  const examples: Record<string, string> = {
    Feather: 'feather',
    MaterialIcons: 'star',
    Ionicons: 'logo-ionic',
    FontAwesome: 'font-awesome',
    AntDesign: 'antdesign',
    Entypo: 'star',
    EvilIcons: 'star',
    Foundation: 'star',
    MaterialCommunityIcons: 'star',
    Octicons: 'star',
    SimpleLineIcons: 'star',
    Zocial: 'twitter',
  };
  return examples[library] || 'star';
}
