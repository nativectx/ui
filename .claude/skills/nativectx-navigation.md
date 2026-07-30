---
description: Use when working with @nativectx/ui navigation — AppTabs, Sidebar, ThemedStack, NativeHeader, or expo-router layouts
---

# NativeCtx UI Navigation

**Context:** Helping build navigation with `@nativectx/ui` (requires `expo-router`).

---

## Navigation components at a glance

| Component | What it does |
|-----------|-------------|
| `AppTabs` | Root tab navigator — native on iOS/Android, custom top bar on web |
| `ThemedStack` | expo-router Stack with automatic header theming |
| `NativeHeader` | SF Symbol / Feather icon buttons in the native header bar |
| `Sidebar` | Persistent panel (desktop web) or slide-in drawer (mobile web + native) |
| `useSidebar()` | Open/close state for the nearest Sidebar |
| `useRouteNavigation()` | `isActive()` + `navigateTo()` helpers |

---

## Scenario 1 — Simple tabs (most common)

Flat tab routes at the root. Use when tabs are self-contained and don't need push navigation.

```
src/app/
  _layout.tsx          ← NativeCtxProvider provider + AppTabs
  index.tsx            ← Home tab content
  explore.tsx          ← Explore tab content
  settings.tsx         ← Settings tab content
```

**`_layout.tsx`:**
```tsx
import { NativeCtxProvider, AppTabs, createBrand } from '@nativectx/ui';

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
            name: 'explore',
            href: '/explore',
            label: 'Explore',
            sfSymbol: { default: 'safari', selected: 'safari.fill' },
            materialIcon: { default: 'explore', selected: 'explore' },
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
}
```

**Flat tab screen — must include top safe area since there is no Stack header:**
```tsx
// settings.tsx
<Screen variant="background" edges={['top', 'bottom']}>
  <Container>
    <Typography variant="headlineMedium">Settings</Typography>
  </Container>
</Screen>
```

---

## Scenario 2 — Tabs + Sidebar (native hamburger menu)

The most common production pattern: native tab bar on mobile with a slide-in sidebar for secondary navigation, custom app bar on web with optional persistent sidebar.

```
src/app/
  _layout.tsx          ← NativeCtxProvider + AppTabs + Sidebar
  index.tsx
  explore.tsx
```

**`_layout.tsx`:**
```tsx
import { NativeCtxProvider, AppTabs, createBrand, Sidebar, SidebarHeader, SidebarSection, SidebarItem, useSidebar, useRouteNavigation } from '@nativectx/ui';
import { Platform, View } from 'react-native';

const brand = createBrand({ ... });

function AppLayout() {
  const { toggle } = useSidebar();
  const { isActive, navigateTo } = useRouteNavigation();

  return (
    <View style={{ flex: 1 }}>
      {/* Sidebar only renders on native — web handles it through AppTabs */}
      {Platform.OS !== 'web' && (
        <Sidebar
          anchor="right"
          header={<SidebarHeader title="My App" onPress={() => navigateTo('/')} />}
        >
          <SidebarSection title="Main">
            <SidebarItem label="Home" active={isActive('/', { exact: true })} onPress={() => navigateTo('/')} />
            <SidebarItem label="Explore" active={isActive('/explore')} onPress={() => navigateTo('/explore')} />
          </SidebarSection>
        </Sidebar>
      )}

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
            name: 'explore',
            href: '/explore',
            label: 'Explore',
            sfSymbol: { default: 'safari', selected: 'safari.fill' },
            materialIcon: { default: 'explore', selected: 'explore' },
          },
        ]}
        onPrimaryMenuPress={toggle}   // wires hamburger → sidebar on native
      />
    </View>
  );
}

export default function Layout() {
  return (
    <NativeCtxProvider brand={brand}>
      <AppLayout />
    </NativeCtxProvider>
  );
}
```

> `useSidebar()` requires being inside `NativeCtxProvider`, so `AppLayout` must be a separate inner component.

---

## Scenario 3 — Tabs with nested Stack (push screens + NativeHeader)

Use when a tab needs its own screen stack (list → detail, push navigation, NativeHeader buttons).

```
src/app/
  _layout.tsx                    ← NativeCtxProvider + AppTabs
  (tabs)/
    _layout.tsx                  ← expo-router route group (no content)
    items/
      _layout.native.tsx         ← ThemedStack (native: gives the tab a Stack context)
      _layout.tsx                ← Slot (web fallback — required)
      index.tsx                  ← List screen
      [id].tsx                   ← Detail push screen
    settings.tsx                 ← Flat tab (no nested Stack needed)
```

**`(tabs)/items/_layout.native.tsx`:**
```tsx
import { Stack } from 'expo-router';
import { ThemedStack } from '@nativectx/ui';

export default function ItemsLayout() {
  return (
    <ThemedStack>
      <Stack.Screen name="index" options={{ title: 'Items' }} />
      <Stack.Screen name="[id]" options={{ title: 'Item' }} />
    </ThemedStack>
  );
}
```

**`(tabs)/items/_layout.tsx` — web fallback, always required alongside `.native.tsx`:**
```tsx
import { Slot } from 'expo-router';
export default function ItemsLayout() {
  return <Slot />;
}
```

**`(tabs)/items/index.tsx`:**
```tsx
import { Screen, NativeHeader } from '@nativectx/ui';
import { useRouter } from 'expo-router';

export default function ItemsScreen() {
  const router = useRouter();
  return (
    // ThemedStack handles top safe area — only bottom needed here
    <Screen variant="background" edges={['bottom']}>
      <NativeHeader
        rightIcon="plus"
        onRightPress={() => router.push('/items/new')}
        androidRightIcon="plus"
      />
      {/* list content */}
    </Screen>
  );
}
```

> **CRITICAL:** `NativeHeader` must be used inside a screen that is within a Stack navigator. Using it in a tab screen that has **no** nested `ThemedStack` will throw: `useCompositionOption must be used within a RouterCompositionOptionsProvider`. If a tab doesn't have a nested Stack, do not use `NativeHeader` in it.

> **Do NOT use `headerShown: false` on Stack screens that use `NativeHeader` on Android.** Android injects buttons via `headerRight`/`headerLeft` — the header must be visible.

---

## Scenario 4 — Nested-route sidebar layout (docs, settings, admin)

Persistent sidebar on web desktop, drawer on mobile/native. Use for secondary-level navigation within a section (e.g. docs, settings, profile sections).

```
src/app/
  docs/
    _layout.tsx          ← Sidebar + content row layout (all platforms)
    _layout.native.tsx   ← ThemedStack inside sidebar layout (native only)
    index.tsx
    getting-started.tsx
    api.tsx
```

**`docs/_layout.tsx` — works on all platforms:**
```tsx
import { Sidebar, SidebarHeader, SidebarSection, SidebarItem, ThemedView, useRouteNavigation } from '@nativectx/ui';
import { useDimensions, breakpoints } from '@nativectx/ui';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { NAV_ITEMS } from '../config/nav';

export default function DocsLayout() {
  const { width } = useDimensions();
  const isDesktop = width >= breakpoints.large;
  const { isActive, navigateTo } = useRouteNavigation();

  return (
    <View style={styles.container}>
      <Sidebar
        avoidAppBar
        header={<SidebarHeader title="Docs" onPress={() => navigateTo('/docs')} />}
      >
        <SidebarSection title="Getting Started">
          <SidebarItem
            label="Introduction"
            active={isActive('/docs', { exact: true })}
            onPress={() => navigateTo('/docs')}
          />
          <SidebarItem
            label="API Reference"
            active={isActive('/docs/api')}
            onPress={() => navigateTo('/docs/api')}
          />
        </SidebarSection>
      </Sidebar>

      <ThemedView
        variant="background"
        rounded={false}
        style={[styles.content, isDesktop && styles.contentWithSidebar]}
      >
        <Slot />
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  content: { flex: 1 },
  contentWithSidebar: { marginLeft: 280 }, // matches sidebar width token
});
```

**`docs/_layout.native.tsx` — native screens need ThemedStack for headers:**
```tsx
import { Stack } from 'expo-router';
import { ThemedStack, Sidebar, SidebarHeader, SidebarSection, SidebarItem, useRouteNavigation } from '@nativectx/ui';
import { NAV_ITEMS } from '../config/nav';

export default function DocsNativeLayout() {
  const { isActive, navigateTo } = useRouteNavigation();

  return (
    <>
      <Sidebar header={<SidebarHeader title="Docs" />}>
        {/* same nav items as web layout */}
      </Sidebar>
      <ThemedStack>
        <Stack.Screen name="index" options={{ title: 'Introduction' }} />
        <Stack.Screen name="api" options={{ title: 'API Reference' }} />
      </ThemedStack>
    </>
  );
}
```

---

## Scenario 5 — Auth / modal stack (no tabs)

Full-screen stack for login, onboarding, or modal flows. No tab bar.

```
src/app/
  _layout.tsx         ← NativeCtxProvider + ThemedStack
  index.tsx           ← Login / onboarding entry
  verify.tsx          ← Push screen
```

**`_layout.tsx`:**
```tsx
import { NativeCtxProvider, ThemedStack, createBrand } from '@nativectx/ui';
import { Stack } from 'expo-router';

const brand = createBrand({ ... });

export default function AuthLayout() {
  return (
    <NativeCtxProvider brand={brand}>
      <ThemedStack>
        <Stack.Screen name="index" options={{ title: 'Sign In', headerShown: false }} />
        <Stack.Screen name="verify" options={{ title: 'Verify' }} />
      </ThemedStack>
    </NativeCtxProvider>
  );
}
```

---

## AppTabs reference

```tsx
<AppTabs
  brandName="My App"
  logoImage={<Image source={...} />}          // shown in top bar (web) and hamburger drawer
  tabs={tabs}
  externalLinks={[{ label: 'Docs', href: '...' }]}  // web top bar only
  onPrimaryMenuPress={toggle}                        // native hamburger → useSidebar
  sidebarAdaptable                                   // iPadOS 18+: promotes to sidebar
  backgroundColor="#1C1C1E"                          // native only — overrides tab bar bg
  blurEffect="dark"                                  // iOS only — UIBlurEffectStyle value
/>
```

### AppTabConfig

| Field | Type | Notes |
|-------|------|-------|
| `name` | `string` | Must match the route file/folder name |
| `href` | `string` | Tab route path |
| `label` | `string` | Display label |
| `sfSymbol` | `{ default: string, selected: string }` | iOS SF Symbol names |
| `materialIcon` | `string \| { default?: string, selected: string }` | Android — string uses same icon for both states; object form shows distinct selected icon (requires RN Screens 4.25+, available from SDK 56) |
| `webIcon` | `PlatformIcon \| string` | Web top bar icon only |

**AppTabs appearance props (native only):**

| Prop | Type | Notes |
|------|------|-------|
| `backgroundColor` | `string` | Overrides the system default tab bar background on iOS and Android. No-op on web. |
| `blurEffect` | `string` | iOS only — `UIBlurEffectStyle` value (e.g. `'light'`, `'dark'`, `'regular'`, `'prominent'`, `'systemUltraThinMaterial'`). No-op on Android and web. |

**Platform behaviour:**
- **iOS** — NativeTabs via `expo-router/unstable-native-tabs`. Real native UITabBarController with Liquid Glass effect on iOS 26+. Hamburger button appears when `onPrimaryMenuPress` is provided.
- **Android** — NativeTabs, Material 3 navigation bar. Distinct selected icons supported from SDK 56.
- **Web** — Fixed top app bar. Desktop: tab links inline. Mobile: hamburger → `Drawer` overlay.

> `NativeTabs` provides no Stack context. All push navigation must come from a per-tab nested `ThemedStack` or the root Stack.

---

## ThemedStack reference

Wraps expo-router `Stack` with automatic token-based header styling (background, tint colour, back button).

```tsx
<ThemedStack>
  <Stack.Screen name="index" options={{ title: 'Home' }} />
  <Stack.Screen name="detail" options={{ title: 'Detail' }} />
</ThemedStack>
```

**Rules:**
- Use in `_layout.native.tsx` files when a route group needs its own Stack context
- **Always pair** with a `_layout.tsx` sibling (`<Slot />`) as the web fallback — expo-router requires a non-platform-suffixed layout file
- Override individual screen options via `<Stack.Screen>` children — they merge with the theme defaults

---

## NativeHeader reference

Adds icon buttons to the native navigation bar. Place inside screen files, not layouts.

```tsx
<NativeHeader
  rightIcon="plus"            // iOS: SF Symbol name
  onRightPress={handleAdd}
  leftIcon="chevron.left"
  onLeftPress={() => router.back()}
  androidRightIcon="plus"     // Android: Feather icon name
  androidLeftIcon="arrow-left"
/>
```

| Platform | Behaviour |
|----------|-----------|
| iOS | `Stack.Toolbar` + SF Symbol buttons |
| Android | `headerRight` / `headerLeft` Pressable with Feather icons |
| Web | Renders nothing — safe to include unconditionally |

> **Must be used inside a Stack context.** If the screen has no `ThemedStack` ancestor, `NativeHeader` will throw at runtime.

> **Android:** The Stack header must be visible (`headerShown` must not be `false`) for `headerRight`/`headerLeft` to appear.

---

## Sidebar reference

```tsx
<Sidebar
  anchor="left"                         // 'left' (default) | 'right'
  header={<SidebarHeader title="App" subtitle="v1" onPress={() => navigateTo('/')} />}
  footer={<SidebarFooter><Typography muted>v1.0.0</Typography></SidebarFooter>}
>
  <SidebarSection title="Main" icon={{ library: 'Feather', name: 'grid' }}>
    <SidebarItem
      label="Home"
      icon={{ library: 'Feather', name: 'home' }}
      active={isActive('/', { exact: true })}
      onPress={() => navigateTo('/')}
    />
  </SidebarSection>
</Sidebar>
```

**Platform behaviour:**
| Context | Behaviour |
|---------|-----------|
| Web desktop (≥1024px) | Persistent panel, `position: fixed` below app bar |
| Web mobile (<1024px) | Hidden; FAB trigger opens animated drawer overlay |
| iOS / Android | Modal drawer; controlled by `useSidebar()` |

**IMPORTANT — content offset on web desktop:**
The web desktop sidebar uses `position: fixed`. It does **not** push content — it renders outside the normal flex flow entirely. The layout that contains the Sidebar is responsible for applying `marginLeft` equal to the sidebar width on the content area:

```tsx
const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  content: { flex: 1 },
  contentWithSidebar: { marginLeft: 280 }, // tokens.sidebar.width = 280
});

const isDesktop = width >= breakpoints.large;

<View style={styles.container}>
  <Sidebar avoidAppBar>{/* nav */}</Sidebar>
  <ThemedView style={[styles.content, isDesktop && styles.contentWithSidebar]}>
    <Slot />
  </ThemedView>
</View>
```

On mobile web and native, the sidebar is an overlay drawer — no `marginLeft` needed.

**`avoidAppBar` prop:**
- Default is `false` — sidebar fills `100vh` from `top: 0`
- Pass `avoidAppBar` when `AppTabs` is present — reads `appBarHeight` from layout context and applies `top: appBarHeight` + `height: calc(100vh - appBarHeight)` so the sidebar starts below the bar and fills the remaining viewport
- No-op on native (native sidebar is a modal overlay unaffected by app bar height)

**Sub-components:**
- `SidebarItem` — `label`, `icon`, `active`, `disabled`, `onPress`
- `SidebarSection` — `title`, `icon`, `children` (renders divider after)
- `SidebarHeader` — `title`, `subtitle`, `logo`, `onPress`, or custom `children`
- `SidebarFooter` — `children`, `style` (top-bordered content area)

---

## useSidebar()

```tsx
const { isOpen, open, close, toggle } = useSidebar();
```

Controls the nearest `Sidebar`. Provided by `NativeCtxProvider`. Requires being inside `NativeCtxProvider` — if you need it alongside `AppTabs`, create an inner component so the hook can resolve the context.

---

## useRouteNavigation()

```tsx
const { isActive, navigateTo, pathname } = useRouteNavigation();

isActive('/items')                 // true on /items AND /items/new (startsWith)
isActive('/items', { exact: true }) // true only on /items
navigateTo('/items/new')
```

Use `exact: true` for index routes that would otherwise stay highlighted on every sub-page.

---

## Safe area rules

| Screen type | `edges` | Reason |
|------------|---------|--------|
| Tab screen with nested Stack (`index` inside `ThemedStack`) | `['bottom']` (default) | ThemedStack header handles top |
| Push screen inside a tab Stack | `['bottom']` (default) | Stack header handles top |
| Flat tab (no Stack) | `['top', 'bottom']` | Nothing handles top — notch conflict |
| Auth/modal screen with `headerShown: false` | `['top', 'bottom']` | No header, must handle top manually |

---

## Common mistakes

| Mistake | Fix |
|---------|-----|
| `NativeHeader` in a tab screen with no `ThemedStack` | Add `_layout.native.tsx` with `ThemedStack` inside the tab folder |
| `headerShown: false` on Android screen using `NativeHeader` | Remove `headerShown: false` — Android header must be visible |
| Missing `_layout.tsx` alongside `_layout.native.tsx` | Add `export default () => <Slot />` as web fallback |
| Flat tab screen missing top safe area | Use `edges={['top', 'bottom']}` on `Screen` |
| `useSidebar()` called directly in root layout | Move to an inner component rendered inside `<NativeCtxProvider>` |
| Tab `name` doesn't match the file/folder | `name` must exactly match the route name (e.g. `name: 'index'` for `index.tsx`) |
