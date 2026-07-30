import { View } from 'react-native';
import { Typography } from '@nativectx/ui';
import { DocsPage } from '../../components/docs-page';
import { DocsPagination } from '../../components/docs-pagination';
import { CodeBlock } from '../../components/code-block';
import { ApiSection } from '../../components/api-section';
import type { PropDefinition } from '../../components/props-table';

const tabConfigProps: PropDefinition[] = [
  { name: 'name', type: 'string', description: 'Route name — must match the file/folder name in your app directory' },
  { name: 'href', type: 'string', description: 'Tab route path (e.g. "/" or "/settings")' },
  { name: 'label', type: 'string', description: 'Display label shown in the tab bar' },
  { name: 'sfSymbol', type: "{ default: string; selected: string }", description: 'iOS SF Symbol names for unselected/selected states' },
  { name: 'materialIcon', type: "string | { default?: string; selected: string }", description: 'Android Material icon. String uses same icon for both states; object form shows distinct selected icon (SDK 56+)' },
  { name: 'webIcon', type: 'PlatformIcon | string', description: 'Icon shown in the web top bar only' },
];

const appTabsProps: PropDefinition[] = [
  { name: 'tabs', type: 'AppTabConfig[]', description: 'Tab route configurations' },
  { name: 'brandName', type: 'string', description: 'App name shown in the web top bar' },
  { name: 'logoImage', type: 'ReactNode', description: 'Logo shown alongside brandName on web' },
  { name: 'externalLinks', type: 'AppTabsExternalLink[]', description: 'External links shown in the web top bar (web only)' },
  { name: 'onPrimaryMenuPress', type: '() => void', description: 'Called when the hamburger is pressed on native — wire to useSidebar().toggle' },
  { name: 'sidebarAdaptable', type: 'boolean', description: 'Promote tab bar to collapsible sidebar on iPadOS 18+ / macOS' },
];

export default function NavTabsPage() {
  return (
    <DocsPage
      title="Tabs"
      description="AppTabs is the root navigator. On native it renders true UITabBarController (iOS) or NavigationBar (Android). On web it renders a fixed top app bar using expo-router/ui."
      importLine="{ AppTabs } from '@nativectx/ui'"
    >
      <View style={{ gap: 8 }}>
        <Typography variant="titleLarge" weight="bold">Setup</Typography>
        <Typography variant="bodyMedium" muted>
          Place AppTabs in your root <Typography variant="bodyMedium" style={{ fontFamily: 'monospace' }}>_layout.tsx</Typography>, wrapped in NativeCtxProvider. The tab names must match your route file or folder names.
        </Typography>
        <CodeBlock
          variant="code"
          filename="app/_layout.tsx"
          code={`import { NativeCtxProvider, AppTabs, createBrand } from '@nativectx/ui';

const brand = createBrand({ ... });

export default function Layout() {
  return (
    <NativeCtxProvider brand={brand}>
      <AppTabs
        brandName="My App"
        tabs={[
          {
            name: 'index',
            href: '/',
            label: 'Home',
            sfSymbol: { default: 'house', selected: 'house.fill' },
            materialIcon: { default: 'home', selected: 'home' },
          },
          {
            name: 'settings',
            href: '/settings',
            label: 'Settings',
            sfSymbol: { default: 'gearshape', selected: 'gearshape.fill' },
            materialIcon: { default: 'settings', selected: 'settings' },
          },
        ]}
      />
    </NativeCtxProvider>
  );
}`}
        />
      </View>

      <View style={{ gap: 8 }}>
        <Typography variant="titleLarge" weight="bold">Platform behaviour</Typography>
        <View style={{ gap: 12 }}>
          <View style={{ gap: 4 }}>
            <Typography variant="labelLarge" weight="medium">iOS / Android</Typography>
            <Typography variant="bodyMedium" muted>
              NativeTabs via <Typography variant="bodyMedium" style={{ fontFamily: 'monospace' }}>expo-router/unstable-native-tabs</Typography>. True native tab bar — UITabBarController on iOS (including Liquid Glass on iOS 26+), Material NavigationBar on Android. Provides no Stack context — push navigation requires a nested ThemedStack per tab.
            </Typography>
          </View>
          <View style={{ gap: 4 }}>
            <Typography variant="labelLarge" weight="medium">Web</Typography>
            <Typography variant="bodyMedium" muted>
              Fixed top app bar built on <Typography variant="bodyMedium" style={{ fontFamily: 'monospace' }}>expo-router/ui</Typography> Tabs. Desktop shows tab links inline; mobile shows a hamburger that opens a slide-in drawer.
            </Typography>
          </View>
        </View>
      </View>

      <ApiSection props={appTabsProps} title="AppTabs props" />

      <View style={{ gap: 8, paddingTop: 24, marginTop: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0' }}>
        <Typography variant="titleLarge" weight="bold">AppTabConfig</Typography>
        <ApiSection props={tabConfigProps} title="Tab configuration" />
      </View>

      <DocsPagination />
    </DocsPage>
  );
}
