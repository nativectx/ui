interface TabDef {
  name: string;
  label: string;
  icon: string;
}

const DEFAULT_TABS: TabDef[] = [
  { name: 'index', label: 'Home', icon: 'home' },
  { name: 'explore', label: 'Explore', icon: 'search' },
  { name: 'settings', label: 'Settings', icon: 'settings' },
];

function tabConfig(tabs: TabDef[]): string {
  return tabs
    .map(
      t => `      {
        name: '${t.name}',
        href: '/${t.name === 'index' ? '' : t.name}',
        label: '${t.label}',
        sfSymbol: { default: '${t.icon}', selected: '${t.icon}.fill' },
        materialIcon: '${t.icon}',
      }`,
    )
    .join(',\n');
}

function tabFiles(tabs: TabDef[]): string {
  return tabs
    .map(t => `// app/(tabs)/${t.name}.tsx\nexport default function ${t.label}Screen() {\n  return <Screen>{/* ${t.label} content */}</Screen>;\n}`)
    .join('\n\n');
}

function flatTabs(tabs: TabDef[]): string {
  return `// app/_layout.tsx
import { NativeCtxProvider } from '@nativectx/ui';
import { brand } from '../brand';

export default function RootLayout() {
  return (
    <NativeCtxProvider brand={brand}>
      <Stack screenOptions={{ headerShown: false }} />
    </NativeCtxProvider>
  );
}

// app/(tabs)/_layout.tsx
import { AppTabs } from '@nativectx/ui';

const TABS = [
${tabConfig(tabs)}
];

export default function TabLayout() {
  return <AppTabs tabs={TABS} brandName={brand.name} />;
}

${tabFiles(tabs)}
`;
}

function tabsSidebar(tabs: TabDef[]): string {
  return `// app/_layout.tsx
import { NativeCtxProvider } from '@nativectx/ui';
import { brand } from '../brand';

export default function RootLayout() {
  return (
    <NativeCtxProvider brand={brand}>
      <Stack screenOptions={{ headerShown: false }} />
    </NativeCtxProvider>
  );
}

// app/(tabs)/_layout.tsx
import { AppTabs, Sidebar, SidebarItem, useBreakpoint } from '@nativectx/ui';
import { View } from 'react-native';

const TABS = [
${tabConfig(tabs)}
];

export default function TabLayout() {
  const isTablet = useBreakpoint('large');

  if (isTablet) {
    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Sidebar>
${tabs.map(t => `          <SidebarItem href="/${t.name === 'index' ? '' : t.name}" label="${t.label}" icon={{ name: '${t.icon}' }} />`).join('\n')}
        </Sidebar>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </View>
    );
  }

  return <AppTabs tabs={TABS} brandName={brand.name} sidebarAdaptable />;
}

${tabFiles(tabs)}
`;
}

function tabsStack(tabs: TabDef[]): string {
  const firstTab = tabs[0];
  return `// app/_layout.tsx
import { NativeCtxProvider } from '@nativectx/ui';
import { brand } from '../brand';

export default function RootLayout() {
  return (
    <NativeCtxProvider brand={brand}>
      <Stack screenOptions={{ headerShown: false }} />
    </NativeCtxProvider>
  );
}

// app/(tabs)/_layout.tsx
import { AppTabs } from '@nativectx/ui';

const TABS = [
${tabConfig(tabs)}
];

export default function TabLayout() {
  return <AppTabs tabs={TABS} brandName={brand.name} />;
}

${tabFiles(tabs)}

// app/(tabs)/${firstTab.name}/[id].tsx  — nested stack screen example
import { ThemedStack, NativeHeader, Typography } from '@nativectx/ui';
import { useLocalSearchParams } from 'expo-router';

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  return (
    <>
      <ThemedStack.Screen options={{ title: 'Detail' }} />
      <Screen>
        <Typography variant="headlineMedium">Item {id}</Typography>
      </Screen>
    </>
  );
}
`;
}

export function generateNavigation(
  pattern: 'flat-tabs' | 'tabs-sidebar' | 'tabs-stack',
  tabs?: TabDef[],
): string {
  const resolvedTabs = tabs && tabs.length > 0 ? tabs : DEFAULT_TABS;

  const header = `# Navigation pattern: ${pattern}\n\nFiles to create:\n`;
  let body: string;

  switch (pattern) {
    case 'flat-tabs':
      body = flatTabs(resolvedTabs);
      break;
    case 'tabs-sidebar':
      body = tabsSidebar(resolvedTabs);
      break;
    case 'tabs-stack':
      body = tabsStack(resolvedTabs);
      break;
  }

  return `${header}\`\`\`tsx\n${body}\n\`\`\``;
}
