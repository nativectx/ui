import React from 'react';
import { View } from 'react-native';
import { Typography, ThemedView, useTheme } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const sidebarProps: PropDefinition[] = [
  {
    name: 'header',
    type: 'React.ReactNode',
    description: 'Header content — typically a SidebarHeader component',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'Sidebar content — typically SidebarSection components',
  },
  {
    name: 'footer',
    type: 'React.ReactNode',
    description: 'Optional footer content — typically a SidebarFooter component',
  },
  {
    name: 'avoidAppBar',
    type: 'boolean',
    default: 'false',
    description: 'Offsets the sidebar below the app bar and subtracts its height. Pass when AppTabs is present. No-op on native.',
  },
  {
    name: 'anchor',
    type: "'left' | 'right'",
    default: "'left'",
    description: 'Which side the sidebar anchors to (web desktop and mobile drawer)',
  },
];

const sidebarHeaderProps: PropDefinition[] = [
  {
    name: 'title',
    type: 'string',
    description: 'Header title text',
  },
  {
    name: 'subtitle',
    type: 'string',
    description: 'Optional subtitle text',
  },
  {
    name: 'logo',
    type: 'ImageSourcePropType',
    description: 'Optional logo image source',
  },
  {
    name: 'onPress',
    type: '() => void',
    description: 'Optional press handler — makes the header tappable',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'Custom content — overrides title/subtitle/logo when provided',
  },
];

const sidebarSectionProps: PropDefinition[] = [
  {
    name: 'title',
    type: 'string',
    description: 'Optional section header label (rendered uppercase)',
  },
  {
    name: 'icon',
    type: 'SidebarSectionIconConfig',
    description: 'Optional icon displayed beside the section title',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'Section content — typically SidebarItem components',
  },
];

const sidebarItemProps: PropDefinition[] = [
  {
    name: 'label',
    type: 'string',
    description: 'Item label text',
  },
  {
    name: 'icon',
    type: 'SidebarItemIconConfig',
    description: 'Optional icon configuration (library, name, size)',
  },
  {
    name: 'active',
    type: 'boolean',
    default: 'false',
    description: 'Whether this item is currently selected',
  },
  {
    name: 'onPress',
    type: '(event?) => void',
    description: 'Press handler — auto-closes the sidebar on mobile after press',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the item',
  },
];

export default function SidebarPage() {
  const { spacing } = useTheme();

  return (
    <DocsPage
      title="Sidebar"
      description="Responsive navigation sidebar. Persistent panel on desktop (≥1024dp), animated modal drawer on mobile. Built from composable sub-components."
    >
      <DemoSection
        title="Basic Setup"
        description="Compose a sidebar from SidebarHeader, SidebarSection, SidebarItem, and optionally SidebarFooter."
        code={`import {
  Sidebar, SidebarHeader, SidebarSection,
  SidebarItem, SidebarFooter, useRouteNavigation,
} from '@nativectx/ui';

const { isActive, navigateTo } = useRouteNavigation();

<Sidebar
  header={
    <SidebarHeader
      title="My App"
      subtitle="Docs"
      onPress={() => navigateTo('/home')}
    />
  }
  footer={
    <SidebarFooter>
      <Typography variant="bodySmall" muted>v1.0.0</Typography>
    </SidebarFooter>
  }
>
  <SidebarSection title="Getting Started" icon={{ name: 'code' }}>
    <SidebarItem
      label="Installation"
      icon={{ name: 'download' }}
      active={isActive('/install', { exact: true })}
      onPress={() => navigateTo('/install')}
    />
    <SidebarItem
      label="Theming"
      icon={{ name: 'sliders' }}
      active={isActive('/theming')}
      onPress={() => navigateTo('/theming')}
    />
  </SidebarSection>
</Sidebar>`}
      >
        <View style={{ gap: spacing.md }}>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">Desktop (≥1024dp)</Typography>
            <Typography variant="bodySmall" muted>
              Persistent left panel, 280dp wide. Content area sits beside it via marginLeft.
            </Typography>
          </ThemedView>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">Mobile (&lt;1024dp)</Typography>
            <Typography variant="bodySmall" muted>
              Modal drawer sliding in from the left. A FAB trigger appears automatically.
              SidebarItem presses auto-close the drawer.
            </Typography>
          </ThemedView>
        </View>
      </DemoSection>

      <DemoSection
        title="Sidebar Context"
        description="Use useSidebar() to control the sidebar programmatically from anywhere in the tree."
        code={`import { useSidebar } from '@nativectx/ui';

const { open, close, toggle, isOpen } = useSidebar();

// Open from a button
<Button title="Open menu" onPress={open} />

// Toggle from a header icon
<NativeHeader
  rightIcon="sidebar.left"
  onRightPress={toggle}
  androidRightIcon="menu"
/>`}
      >
        <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
          <Typography variant="labelLarge" weight="medium">Provided by NativeCtxProvider</Typography>
          <Typography variant="bodySmall" muted>
            The sidebar context is set up automatically by the NativeCtxProvider provider.
            No extra setup needed — just call useSidebar() in any screen or component.
          </Typography>
        </ThemedView>
      </DemoSection>

      <DemoSection
        title="Active Route Matching"
        description="Use useRouteNavigation() for isActive checks with exact matching for index routes."
        code={`const { isActive, navigateTo } = useRouteNavigation();

// Prefix match (default) — matches /explore and /explore/button
<SidebarItem
  label="Components"
  active={isActive('/explore')}
  onPress={() => navigateTo('/explore')}
/>

// Exact match — use for index routes that are a prefix of sub-routes
<SidebarItem
  label="Installation"
  active={isActive('/explore', { exact: true })}
  onPress={() => navigateTo('/explore')}
/>`}
      >
        <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
          <Typography variant="labelLarge" weight="medium">exact: true for index routes</Typography>
          <Typography variant="bodySmall" muted>
            Without exact, /explore would match /explore/button — always use exact on routes
            that are a prefix of sub-routes.
          </Typography>
        </ThemedView>
      </DemoSection>

      <DemoSection
        title="How content spacing works"
        description="On web desktop the sidebar is position: fixed — it does not participate in the flex layout and does not push content. The consuming layout is responsible for offsetting content by the sidebar width."
        code={`// The sidebar is position: fixed and renders outside the normal flex flow.
// Content behind it must be manually offset by the sidebar width (280dp).

// Pass avoidAppBar when AppTabs is present — offsets the sidebar below the
// app bar and subtracts its height so the sidebar fills the remaining viewport.

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  content: { flex: 1 },
  // marginLeft equals tokens.sidebar.width (280dp)
  // Only applied at breakpoints.large (≥1024dp)
  contentWithSidebar: { marginLeft: 280 },
});

const isDesktop = width >= breakpoints.large;

// With AppTabs:
<View style={styles.container}>
  <Sidebar avoidAppBar header={...}>{/* nav items */}</Sidebar>
  <ThemedView
    variant="background"
    style={[styles.content, isDesktop && styles.contentWithSidebar]}
  >
    <Slot />
  </ThemedView>
</View>

// Without AppTabs (sidebar fills 100vh from top: 0):
<View style={styles.container}>
  <Sidebar header={...}>{/* nav items */}</Sidebar>
  <ThemedView style={[styles.content, isDesktop && styles.contentWithSidebar]}>
    <Slot />
  </ThemedView>
</View>`}
      >
        <View style={{ gap: spacing.md }}>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">Default — 100vh from top: 0</Typography>
            <Typography variant="bodySmall" muted>
              Sidebar fills the full viewport height. Use when there is no app bar above it.
            </Typography>
          </ThemedView>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">avoidAppBar — offset below app bar</Typography>
            <Typography variant="bodySmall" muted>
              Reads appBarHeight from layout context. Applies top: appBarHeight and height: calc(100vh - appBarHeight). Use whenever AppTabs is present.
            </Typography>
          </ThemedView>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">Mobile / Native — overlay, no offset</Typography>
            <Typography variant="bodySmall" muted>
              Drawer sits above the content. No marginLeft is applied — content stays full width. avoidAppBar is a no-op on native.
            </Typography>
          </ThemedView>
        </View>
      </DemoSection>

      <DemoSection
        title="Layout Pattern"
        description="Place Sidebar alongside a Slot (web) or Stack (native) in your layout file."
        code={`// _layout.tsx (web/default)
export default function Layout() {
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <Sidebar header={<SidebarHeader title="Docs" />}>
        {/* nav items */}
      </Sidebar>
      <ThemedView variant="background" style={{ flex: 1 }}>
        <Slot />
      </ThemedView>
    </View>
  );
}

// _layout.native.tsx (iOS + Android)
export default function Layout() {
  return (
    <>
      <Sidebar header={<SidebarHeader title="Docs" />}>
        {/* nav items */}
      </Sidebar>
      <ThemedStack>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
      </ThemedStack>
    </>
  );
}`}
      >
        <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
          <Typography variant="labelLarge" weight="medium">Fragment on native</Typography>
          <Typography variant="bodySmall" muted>
            On native, wrap Sidebar and ThemedStack in a fragment — Sidebar overlays the stack
            as a modal drawer, so no flex row layout is needed.
          </Typography>
        </ThemedView>
      </DemoSection>

      <ApiSection props={sidebarProps} />

      <ApiSection props={sidebarHeaderProps} />

      <ApiSection props={sidebarSectionProps} />

      <ApiSection props={sidebarItemProps} />

      <DocsPagination />
    </DocsPage>
  );
}
