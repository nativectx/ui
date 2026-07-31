import React from 'react';
import { View } from 'react-native';
import { Typography, ThemedView, useTheme } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const appTabsProps: PropDefinition[] = [
  {
    name: 'tabs',
    type: 'AppTabConfig[]',
    description: 'Array of tab configurations (name, href, label, icons)',
  },
  {
    name: 'brandName',
    type: 'string',
    description: 'App or brand name shown in the web header',
  },
  {
    name: 'logoImage',
    type: 'React.ReactNode',
    description: 'Optional logo displayed beside the brand name (web only)',
  },
  {
    name: 'externalLinks',
    type: 'AppTabsExternalLink[]',
    description: 'External links shown in the web header beside tabs',
  },
  {
    name: 'height',
    type: 'number',
    default: '64',
    description: 'App bar height in pixels (web only)',
  },
  {
    name: 'onPrimaryMenuPress',
    type: '() => void',
    description: 'Called when the hamburger icon is pressed (native only)',
  },
  {
    name: 'backgroundColor',
    type: 'string',
    description: 'Background color of the native tab bar. Ignored on web. (iOS, Android)',
  },
  {
    name: 'blurEffect',
    type: 'string',
    description: "iOS blur effect behind the tab bar (e.g. 'light', 'dark', 'regular'). Ignored on Android and web. (iOS)",
  },
];

const tabConfigProps: PropDefinition[] = [
  {
    name: 'name',
    type: 'string',
    description: 'Unique tab name used for routing',
  },
  {
    name: 'href',
    type: 'string',
    description: 'Full route path for this tab',
  },
  {
    name: 'label',
    type: 'string',
    description: 'Display label shown in the tab bar',
  },
  {
    name: 'sfSymbol',
    type: '{ default: string; selected: string }',
    description: 'iOS SF Symbol names for default and selected states',
  },
  {
    name: 'materialIcon',
    type: 'string',
    description: 'Android Material Design icon name',
  },
  {
    name: 'webIcon',
    type: 'IconConfig',
    description: 'Web icon configuration (Feather or other library)',
  },
];

export default function AppTabsPage() {
  const { spacing } = useTheme();

  return (
    <DocsPage
      title="AppTabs"
      description="Top-level navigation component. Native tab bar on iOS and Android. Branded header with tabs, external links, and a responsive drawer on web."
    >
      <DemoSection
        title="Platform Behaviour"
        description="AppTabs renders a fundamentally different UI per platform."
      >
        <View style={{ gap: spacing.md }}>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">iOS / Android</Typography>
            <Typography variant="bodySmall" muted>
              Native tab bar at the bottom using expo-router/unstable-native-tabs.
              Tinted with theme.primary. Supports SF Symbols (iOS) and Material icons (Android).
            </Typography>
          </ThemedView>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">Web — Desktop (≥1024dp)</Typography>
            <Typography variant="bodySmall" muted>
              Fixed top header with logo, brand name, tab buttons, and external link buttons.
              Height defaults to 64px, configurable via the height prop.
            </Typography>
          </ThemedView>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">Web — Mobile (&lt;1024dp)</Typography>
            <Typography variant="bodySmall" muted>
              Compact header with brand name and a hamburger icon. Tapping the hamburger
              opens an animated drawer containing the tab links.
            </Typography>
          </ThemedView>
        </View>
      </DemoSection>

      <DemoSection
        title="Root Layout Setup"
        description="Place AppTabs inside your root _layout.tsx, wrapped by NativeCtxProvider."
        code={`// app/_layout.tsx
import { AppTabs } from '@nativectx/ui';
import { useSidebar } from '@nativectx/ui';

const tabs = [
  {
    name: 'home',
    href: '/(tabs)/home',
    label: 'Home',
    sfSymbol: { default: 'house', selected: 'house.fill' },
    materialIcon: 'home',
    webIcon: { library: 'Feather', name: 'home' },
  },
  {
    name: 'explore',
    href: '/(tabs)/explore',
    label: 'Explore',
    sfSymbol: { default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' },
    materialIcon: 'explore',
    webIcon: { library: 'Feather', name: 'grid' },
  },
];

export default function RootLayout() {
  const { toggle } = useSidebar();

  return (
    <NativeCtxProvider>
      <AppTabs
        brandName="My App"
        logoImage={<MyLogo />}
        tabs={tabs}
        externalLinks={[
          { label: 'GitHub', href: 'https://github.com/...', icon: { name: 'github' } },
        ]}
        onPrimaryMenuPress={toggle}
      />
    </NativeCtxProvider>
  );
}`}
      >
        <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
          <Typography variant="labelLarge" weight="medium">onPrimaryMenuPress</Typography>
          <Typography variant="bodySmall" muted>
            Wire this to useSidebar().toggle to connect the native hamburger button
            to your Sidebar drawer on iOS and Android.
          </Typography>
        </ThemedView>
      </DemoSection>

      <DemoSection
        title="Tab Icons"
        description="Each tab supports platform-specific icons. All icon fields are optional."
        code={`{
  name: 'settings',
  href: '/(tabs)/settings',
  label: 'Settings',

  // iOS — SF Symbol names for default and selected states
  sfSymbol: {
    default: 'gearshape',
    selected: 'gearshape.fill',
  },

  // Android — Material Design icon name
  materialIcon: 'settings',

  // Web — any supported icon library
  webIcon: { library: 'Feather', name: 'settings' },
}`}
      >
        <View style={{ gap: spacing.md }}>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">SF Symbols require both states</Typography>
            <Typography variant="bodySmall" muted>
              sfSymbol must include both default and selected — e.g. &apos;house&apos; and &apos;house.fill&apos;.
              Browse symbols at developer.apple.com/sf-symbols.
            </Typography>
          </ThemedView>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">Icons are optional</Typography>
            <Typography variant="bodySmall" muted>
              Tabs render label-only if icon fields are omitted. You can mix icon and label-only tabs.
            </Typography>
          </ThemedView>
        </View>
      </DemoSection>

      <DemoSection
        title="Tab Bar Appearance (native only)"
        description="Customise the native tab bar background colour and iOS blur effect. Both props are no-ops on web."
        code={`<AppTabs
  tabs={tabs}
  // Solid colour background (overrides system default)
  backgroundColor="#1C1C1E"

  // iOS only — blur effect behind the bar
  // Values: 'light' | 'dark' | 'regular' | 'prominent' | 'systemUltraThinMaterial' | etc.
  blurEffect="dark"
/>`}
      >
        <View style={{ gap: spacing.md }}>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">backgroundColor</Typography>
            <Typography variant="bodySmall" muted>
              Accepts any CSS/React Native color string. When set, it overrides the system default tab bar background on iOS and Android.
            </Typography>
          </ThemedView>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">blurEffect (iOS only)</Typography>
            <Typography variant="bodySmall" muted>
              Maps to UIBlurEffectStyle. Common values: &apos;light&apos;, &apos;dark&apos;, &apos;regular&apos;, &apos;prominent&apos;,
              &apos;systemUltraThinMaterial&apos;, &apos;systemThinMaterial&apos;, &apos;systemMaterial&apos;, &apos;systemThickMaterial&apos;.
              Has no effect on Android or web.
            </Typography>
          </ThemedView>
        </View>
      </DemoSection>

      <ApiSection props={appTabsProps} />

      <ApiSection props={tabConfigProps} />

      <DocsPagination />
    </DocsPage>
  );
}
