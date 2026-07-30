import { View } from 'react-native';
import {
  Typography,
  SidebarHeader,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
  useTheme,
} from '@nativectx/ui';
import { DocsPage } from '../../components/docs-page';
import { DocsPagination } from '../../components/docs-pagination';
import { CodeBlock } from '../../components/code-block';
import { DemoSection } from '../../components/demo-section';
import { ApiSection } from '../../components/api-section';
import { Callout } from '../../components/callout';
import type { PropDefinition } from '../../components/props-table';

const sidebarProps: PropDefinition[] = [
  { name: 'header', type: 'ReactNode', description: 'Slot for SidebarHeader or custom content' },
  { name: 'footer', type: 'ReactNode', description: 'Slot for SidebarFooter or custom content' },
  { name: 'children', type: 'ReactNode', description: 'SidebarSection and SidebarItem components' },
  { name: 'anchor', type: "'left' | 'right'", default: "'left'", description: 'Side the drawer slides from' },
];

const sidebarItemProps: PropDefinition[] = [
  { name: 'label', type: 'string', description: 'Item label text' },
  { name: 'icon', type: 'IconConfig', description: 'Optional icon' },
  { name: 'active', type: 'boolean', description: 'Highlights item as the current route' },
  { name: 'disabled', type: 'boolean', description: 'Dims and disables interaction' },
  { name: 'onPress', type: '() => void', description: 'Navigation handler — automatically closes the sidebar on mobile' },
];

function SidebarDemo() {
  const theme = useTheme();
  return (
    <View style={{ gap: 4 }}>
      <SidebarHeader title="My App" subtitle="v1.0" />
      <View style={{ height: 1, backgroundColor: theme.outlineVariant, marginVertical: 4 }} />
      <SidebarSection title="Main">
        <SidebarItem
          label="Home"
          icon={{ library: 'Feather', name: 'home' }}
          active
          onPress={() => {}}
        />
        <SidebarItem
          label="Explore"
          icon={{ library: 'Feather', name: 'compass' }}
          onPress={() => {}}
        />
        <SidebarItem
          label="Settings"
          icon={{ library: 'Feather', name: 'settings' }}
          onPress={() => {}}
        />
      </SidebarSection>
      <View style={{ height: 1, backgroundColor: theme.outlineVariant, marginVertical: 4 }} />
      <SidebarFooter>
        <Typography variant="bodySmall" muted>NativeCtx UI</Typography>
      </SidebarFooter>
    </View>
  );
}

export default function NavSidebarPage() {
  return (
    <DocsPage
      title="Sidebar"
      description="Persistent panel on web desktop, slide-in drawer on web mobile, and a modal drawer on native. Controlled by useSidebar() which NativeCtxProvider provides automatically."
      importLine="{ Sidebar, SidebarHeader, SidebarSection, SidebarItem, SidebarFooter, useSidebar } from '@nativectx/ui'"
    >
      <View style={{ gap: 8 }}>
        <Typography variant="titleLarge" weight="bold">Wiring to AppTabs</Typography>
        <Typography variant="bodyMedium" muted>
          useSidebar() must be called inside a component rendered under NativeCtxProvider. Create an inner component so the hook resolves the provider context.
        </Typography>
        <CodeBlock
          variant="code"
          filename="app/_layout.tsx"
          code={`import { NativeCtxProvider, AppTabs, Sidebar, SidebarHeader, SidebarSection,
  SidebarItem, useSidebar, useRouteNavigation } from '@nativectx/ui';
import { Platform, View } from 'react-native';

function AppLayout() {
  const { toggle } = useSidebar();
  const { isActive, navigateTo } = useRouteNavigation();

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS !== 'web' && (
        <Sidebar header={<SidebarHeader title="My App" />} anchor="right">
          <SidebarSection title="Main">
            <SidebarItem
              label="Home"
              active={isActive('/', { exact: true })}
              onPress={() => navigateTo('/')}
            />
          </SidebarSection>
        </Sidebar>
      )}
      <AppTabs tabs={tabs} onPrimaryMenuPress={toggle} />
    </View>
  );
}

export default function Layout() {
  return (
    <NativeCtxProvider brand={brand}>
      <AppLayout />
    </NativeCtxProvider>
  );
}`}
        />
        <Callout type="info">
          On web the Sidebar renders itself — no Platform.OS check needed. The Platform check in the example prevents a second sidebar drawer on native where the Sidebar is already wired to AppTabs via onPrimaryMenuPress.
        </Callout>
      </View>

      <View style={{ gap: 8 }}>
        <Typography variant="titleLarge" weight="bold">Platform behaviour</Typography>
        <View style={{ gap: 8 }}>
          {[
            { label: 'Web desktop (≥1024px)', desc: 'Persistent panel pinned to the left or right, fixed below the app bar.' },
            { label: 'Web mobile (<1024px)', desc: 'Hidden by default. A FAB trigger opens an animated drawer overlay.' },
            { label: 'iOS / Android', desc: 'Modal drawer controlled by useSidebar(). Wire useSidebar().toggle to AppTabs onPrimaryMenuPress to show the hamburger button.' },
          ].map(({ label, desc }) => (
            <View key={label} style={{ gap: 2 }}>
              <Typography variant="labelLarge" weight="medium">{label}</Typography>
              <Typography variant="bodyMedium" muted>{desc}</Typography>
            </View>
          ))}
        </View>
      </View>

      <DemoSection title="Sub-components" description="SidebarHeader, SidebarSection, SidebarItem, and SidebarFooter can be composed freely.">
        <SidebarDemo />
      </DemoSection>

      <ApiSection props={sidebarProps} title="Sidebar props" />
      <ApiSection props={sidebarItemProps} title="SidebarItem props" />

      <DocsPagination />
    </DocsPage>
  );
}
