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

/**
 * Real SF Symbol names for the icon keys we can map with confidence. Anything
 * outside this table is emitted without an `sfSymbol` entry (it is optional on
 * AppTabConfig) rather than guessed — a made-up SF Symbol silently renders
 * nothing on iOS.
 */
const SF_SYMBOLS: Record<string, { default: string; selected: string }> = {
  home: { default: 'house', selected: 'house.fill' },
  search: { default: 'magnifyingglass', selected: 'magnifyingglass' },
  explore: { default: 'safari', selected: 'safari.fill' },
  compass: { default: 'safari', selected: 'safari.fill' },
  settings: { default: 'gearshape', selected: 'gearshape.fill' },
  gear: { default: 'gearshape', selected: 'gearshape.fill' },
  person: { default: 'person.crop.circle', selected: 'person.crop.circle.fill' },
  profile: { default: 'person.crop.circle', selected: 'person.crop.circle.fill' },
  account: { default: 'person.crop.circle', selected: 'person.crop.circle.fill' },
  heart: { default: 'heart', selected: 'heart.fill' },
  star: { default: 'star', selected: 'star.fill' },
  bell: { default: 'bell', selected: 'bell.fill' },
  calendar: { default: 'calendar', selected: 'calendar' },
  cart: { default: 'cart', selected: 'cart.fill' },
  message: { default: 'bubble.left', selected: 'bubble.left.fill' },
  chat: { default: 'bubble.left', selected: 'bubble.left.fill' },
};

function href(tab: TabDef): string {
  return tab.name === 'index' ? '/' : `/${tab.name}`;
}

/** Renders the `tabs` array passed to <AppTabs tabs={...} /> (AppTabConfig[]). */
function tabConfig(tabs: TabDef[]): string {
  return tabs
    .map(t => {
      const sf = SF_SYMBOLS[t.icon.toLowerCase()];
      const iconLines = sf
        ? `    sfSymbol: { default: '${sf.default}', selected: '${sf.selected}' },`
        : `    // sfSymbol: { default: '<SF Symbol>', selected: '<SF Symbol>' }, // iOS icon`;
      return `  {
    name: '${t.name}',
    href: '${href(t)}',
    label: '${t.label}',
${iconLines}
    materialIcon: '${t.icon}',
  }`;
    })
    .join(',\n');
}

function screenComponentName(tab: TabDef): string {
  const base = tab.label.replace(/[^A-Za-z0-9]/g, '') || 'Tab';
  return `${base.charAt(0).toUpperCase()}${base.slice(1)}Screen`;
}

/**
 * Flat tab screens sit directly under the root layout, so there is no Stack
 * header above them — they must claim the top safe area themselves.
 */
function flatTabScreens(tabs: TabDef[]): string {
  return tabs
    .map(
      t => `// src/app/${t.name}.tsx
import { Screen, Typography } from '@nativectx/ui';

export default function ${screenComponentName(t)}() {
  return (
    <Screen edges={['top', 'bottom']}>
      <Typography variant="headlineMedium">${t.label}</Typography>
    </Screen>
  );
}`,
    )
    .join('\n\n');
}

const BRAND_NOTE = `// src/brand.ts — generate this with the generate_brand_config tool
// export const brand = createBrand({ ... });`;

function flatTabs(tabs: TabDef[]): string {
  return `${BRAND_NOTE}

// src/app/_layout.tsx
import { NativeCtxProvider, AppTabs } from '@nativectx/ui';
import { brand } from '../brand';

const TABS = [
${tabConfig(tabs)},
];

export default function RootLayout() {
  return (
    <NativeCtxProvider brand={brand}>
      <AppTabs brandName={brand.name} tabs={TABS} />
    </NativeCtxProvider>
  );
}

${flatTabScreens(tabs)}
`;
}

function tabsSidebar(tabs: TabDef[]): string {
  const items = tabs
    .map(t => {
      const exact = t.name === 'index' ? ", { exact: true }" : '';
      return `            <SidebarItem
              label="${t.label}"
              icon={{ name: '${t.icon}' }}
              active={isActive('${href(t)}'${exact})}
              onPress={() => navigateTo('${href(t)}')}
            />`;
    })
    .join('\n');

  return `${BRAND_NOTE}

// src/app/_layout.tsx
import {
  NativeCtxProvider,
  AppTabs,
  Sidebar,
  SidebarHeader,
  SidebarSection,
  SidebarItem,
  useSidebar,
  useRouteNavigation,
} from '@nativectx/ui';
import { Platform, View } from 'react-native';
import { brand } from '../brand';

const TABS = [
${tabConfig(tabs)},
];

// useSidebar() must run inside NativeCtxProvider, so the layout body lives in
// its own component.
function AppLayout() {
  const { toggle } = useSidebar();
  const { isActive, navigateTo } = useRouteNavigation();

  return (
    <View style={{ flex: 1 }}>
      {/* Native only — on web AppTabs renders its own drawer. */}
      {Platform.OS !== 'web' && (
        <Sidebar
          anchor="right"
          header={<SidebarHeader title={brand.name} onPress={() => navigateTo('/')} />}
        >
          <SidebarSection title="Main">
${items}
          </SidebarSection>
        </Sidebar>
      )}

      <AppTabs
        brandName={brand.name}
        tabs={TABS}
        onPrimaryMenuPress={toggle}
      />
    </View>
  );
}

export default function RootLayout() {
  return (
    <NativeCtxProvider brand={brand}>
      <AppLayout />
    </NativeCtxProvider>
  );
}

${flatTabScreens(tabs)}
`;
}

function tabsStack(tabs: TabDef[]): string {
  // The stacked tab needs its own route folder, so 'index' cannot be it.
  const stackTab = tabs.find(t => t.name !== 'index') ?? tabs[0];
  const flatTabs_ = tabs.filter(t => t !== stackTab);

  return `${BRAND_NOTE}

// src/app/_layout.tsx
import { NativeCtxProvider, AppTabs } from '@nativectx/ui';
import { brand } from '../brand';

const TABS = [
${tabConfig(tabs)},
];

export default function RootLayout() {
  return (
    <NativeCtxProvider brand={brand}>
      <AppTabs brandName={brand.name} tabs={TABS} />
    </NativeCtxProvider>
  );
}

// src/app/${stackTab.name}/_layout.native.tsx
// ThemedStack is a themed wrapper around expo-router's Stack. Screens are
// declared with Stack.Screen from expo-router — ThemedStack has no .Screen.
import { Stack } from 'expo-router';
import { ThemedStack } from '@nativectx/ui';

export default function ${screenComponentName(stackTab).replace('Screen', '')}Layout() {
  return (
    <ThemedStack>
      <Stack.Screen name="index" options={{ title: '${stackTab.label}' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detail' }} />
    </ThemedStack>
  );
}

// src/app/${stackTab.name}/_layout.tsx — web fallback, required alongside _layout.native.tsx
import { Slot } from 'expo-router';

export default function ${screenComponentName(stackTab).replace('Screen', '')}WebLayout() {
  return <Slot />;
}

// src/app/${stackTab.name}/index.tsx — list screen
// NativeHeader only works inside a Stack, which the layout above provides.
import { Screen, Typography, NativeHeader } from '@nativectx/ui';
import { useRouter } from 'expo-router';

export default function ${screenComponentName(stackTab)}() {
  const router = useRouter();

  return (
    // ThemedStack owns the top safe area here, so only 'bottom' is needed.
    <Screen edges={['bottom']}>
      <NativeHeader
        rightIcon="plus"
        androidRightIcon="plus"
        onRightPress={() => router.push('/${stackTab.name}/1')}
      />
      <Typography variant="headlineMedium">${stackTab.label}</Typography>
    </Screen>
  );
}

// src/app/${stackTab.name}/[id].tsx — pushed detail screen
import { Screen, Typography } from '@nativectx/ui';
import { useLocalSearchParams } from 'expo-router';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen edges={['bottom']}>
      <Typography variant="headlineMedium">Item {id}</Typography>
    </Screen>
  );
}

${flatTabScreens(flatTabs_)}
`;
}

const PATTERN_NOTES: Record<string, string> = {
  'flat-tabs':
    'AppTabs is the root navigator — it renders directly inside NativeCtxProvider with no Stack above it. Tab screens are flat files beside _layout.tsx.',
  'tabs-sidebar':
    'AppTabs plus a Sidebar for secondary navigation. SidebarItem is not a link: drive it with active + onPress via useRouteNavigation().',
  'tabs-stack':
    'AppTabs at the root, with one tab promoted to a folder that owns a nested ThemedStack for push navigation.',
};

export function generateNavigation(
  pattern: 'flat-tabs' | 'tabs-sidebar' | 'tabs-stack',
  tabs?: TabDef[],
): string {
  const resolvedTabs = tabs && tabs.length > 0 ? tabs : DEFAULT_TABS;

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

  const header = `# Navigation pattern: ${pattern}\n\n${PATTERN_NOTES[pattern]}\n\nFiles to create:\n`;
  return `${header}\n\`\`\`tsx\n${body}\`\`\``;
}
