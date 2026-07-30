---
description: Use when working with @nativectx/ui navigation — choosing an expo-router layout shape, wiring AppTabs, Sidebar, ThemedStack or NativeHeader, and the platform gotchas each one carries
---

# NativeCtx UI Navigation

**Context:** Helping build navigation with `@nativectx/ui` (requires `expo-router`).

This skill covers **which layout shape to build and why**. For exact props on a named component, call `get_component("AppTabs")` etc. Two exceptions where the MCP manifest is blind and this file is the only reference: **`Sidebar`** and **`ThemedStack`** both report zero props. Their sections below are authoritative.

---

## Navigation surface at a glance

| Component | What it does |
|-----------|-------------|
| `AppTabs` | Root tab navigator — native on iOS/Android, custom top bar on web |
| `ThemedStack` | expo-router Stack with automatic header theming |
| `NativeHeader` | SF Symbol / Feather icon buttons in the native header bar |
| `Sidebar` | Persistent panel (desktop web) or slide-in drawer (mobile web + native) |
| `Drawer` | Low-level animated side drawer — what `Sidebar` and `AppTabs` build on |
| `useSidebar()` | Open/close state for the nearest Sidebar |
| `useRouteNavigation()` | `isActive()` + `navigateTo()` helpers |

**Picking a shape:**

| If the app… | Build |
|---|---|
| has 2–5 top-level sections, each self-contained | Scenario 1 — flat tabs |
| needs secondary nav beyond what fits in a tab bar | Scenario 2 — tabs + sidebar |
| has list → detail push navigation inside a tab | Scenario 3 — tabs + nested stack |
| has a documentation/settings/admin section with its own nav tree | Scenario 4 — nested-route sidebar |
| is a login / onboarding / modal flow with no tabs | Scenario 5 — plain stack |

---

## Scenario 1 — Simple tabs (most common)

Flat tab routes at the root. Use when tabs are self-contained and don't need push navigation.

```
src/app/
  _layout.tsx          ← NativeCtxProvider + AppTabs
  index.tsx            ← Home tab content
  explore.tsx          ← Explore tab content
  settings.tsx         ← Settings tab content
```

Each tab is one route file at the root, and each `AppTabConfig.name` must match its filename.

**`_layout.tsx`:**
```tsx
import { NativeCtxProvider, AppTabs, createBrand } from '@nativectx/ui';

const brand = createBrand({ ... });

const TABS = [
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
  // …one entry per tab route file
];

export default function Layout() {
  return (
    <NativeCtxProvider brand={brand}>
      <AppTabs brandName="My App" tabs={TABS} />
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

The most common production pattern: native tab bar on mobile with a slide-in sidebar for secondary navigation; on web `AppTabs` renders its own app bar and hamburger drawer, so the `Sidebar` is native-only here.

```
src/app/
  _layout.tsx          ← NativeCtxProvider + AppTabs + Sidebar
  index.tsx
  explore.tsx
```

**`_layout.tsx`:**
```tsx
import {
  NativeCtxProvider, AppTabs, createBrand,
  Sidebar, SidebarHeader, SidebarSection, SidebarItem,
  useSidebar, useRouteNavigation,
} from '@nativectx/ui';
import { Platform, View } from 'react-native';

const brand = createBrand({ ... });
const TABS = [ /* as in Scenario 1 */ ];

function AppLayout() {
  const { toggle } = useSidebar();
  const { isActive, navigateTo } = useRouteNavigation();

  return (
    <View style={{ flex: 1 }}>
      {/* Sidebar only renders on native — web handles it through AppTabs */}
      {Platform.OS !== 'web' && (
        <Sidebar header={<SidebarHeader title="My App" onPress={() => navigateTo('/')} />}>
          <SidebarSection title="Main">
            <SidebarItem label="Home" active={isActive('/', { exact: true })} onPress={() => navigateTo('/')} />
            <SidebarItem label="Explore" active={isActive('/explore')} onPress={() => navigateTo('/explore')} />
          </SidebarSection>
        </Sidebar>
      )}

      <AppTabs
        brandName="My App"
        tabs={TABS}
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

> `useSidebar()` requires being inside `NativeCtxProvider`, so `AppLayout` must be a separate inner component. Calling it directly in the default-exported root layout throws.

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

> The `_layout.native.tsx` here exists **only** so `NativeHeader` has a Stack context. `NativeTabs` provides none. See the NativeHeader section for the two failure modes this avoids.

---

## Scenario 4 — Nested-route sidebar layout (docs, settings, admin)

Persistent sidebar on web desktop, drawer on mobile/native. Use for secondary-level navigation within a section.

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
import {
  Sidebar, SidebarHeader, SidebarSection, SidebarItem,
  ThemedView, useRouteNavigation, useDimensions, breakpoints,
} from '@nativectx/ui';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';

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
  // Sidebar is position:fixed on web desktop — it does NOT push content.
  // The layout must offset by the sidebar width itself. See "Sidebar" below.
  contentWithSidebar: { marginLeft: 280 }, // tokens.sidebar.width
});
```

**`docs/_layout.native.tsx` — native screens need ThemedStack for headers:**
```tsx
import { Stack } from 'expo-router';
import { ThemedStack, Sidebar, SidebarHeader } from '@nativectx/ui';

export default function DocsNativeLayout() {
  return (
    <>
      <Sidebar header={<SidebarHeader title="Docs" />}>
        {/* same SidebarSection / SidebarItem tree as the web layout */}
      </Sidebar>
      <ThemedStack>
        <Stack.Screen name="index" options={{ title: 'Introduction' }} />
        <Stack.Screen name="api" options={{ title: 'API Reference' }} />
      </ThemedStack>
    </>
  );
}
```

> Factor the nav item list into a shared module and map over it in both layouts — keeping two hand-written copies in sync is the usual source of a stale sidebar on one platform.

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

## AppTabs

Props: `get_component("AppTabs")`. The annotated call below names all of them:

```tsx
<AppTabs
  brandName="My App"
  logoImage={<Image source={...} />}          // shown in top bar (web) and hamburger drawer
  tabs={TABS}
  externalLinks={[{ label: 'Docs', href: '...' }]}  // web top bar only
  height={64}                                        // app bar height, web only
  onPrimaryMenuPress={toggle}                        // native hamburger → useSidebar
  sidebarAdaptable                                   // iPadOS 18+: promotes tab bar to a sidebar
  backgroundColor="#1C1C1E"                          // iOS + Android only, no-op on web
  blurEffect="dark"                                  // iOS only — UIBlurEffectStyle value
/>
```

### AppTabConfig

The shape of each entry in `tabs`. **Not covered by `get_component`** — it only reports `tabs: AppTabConfig[]`.

| Field | Type | Notes |
|-------|------|-------|
| `name` | `string` | Required. Must exactly match the route file/folder name |
| `href` | `string` | Required. Tab route path |
| `label` | `string` | Required. Display label |
| `sfSymbol` | `{ default: string, selected: string }` | iOS SF Symbol names |
| `materialIcon` | `string \| { default?: string, selected: string }` | Android — string uses one icon for both states; object form shows a distinct selected icon (requires RN Screens 4.25+, available from SDK 56) |
| `webIcon` | `PlatformIcon \| string` | Web top bar icon only |

### Platform behaviour

- **iOS** — NativeTabs via `expo-router/unstable-native-tabs`. Real native `UITabBarController` with Liquid Glass effect on iOS 26+. Hamburger button appears when `onPrimaryMenuPress` is provided.
- **Android** — NativeTabs, Material 3 navigation bar. Distinct selected icons supported from SDK 56.
- **Web** — Fixed top app bar. Desktop: tab links inline. Mobile: hamburger → `Drawer` overlay.

> `NativeTabs` provides **no Stack context**. All push navigation must come from a per-tab nested `ThemedStack` (Scenario 3) or a root Stack.

---

## ThemedStack

> `get_component("ThemedStack")` returns nothing — it has no `ThemedStackProps` interface. This is the reference.

Wraps expo-router `Stack`, accepting all of its props, and applies token-based header styling by default: `headerStyle.backgroundColor` from `tokens.appbar.background`, `headerTintColor` from `theme.onSurface`, `headerBackVisible: true`, `headerBackButtonDisplayMode: 'minimal'`.

```tsx
<ThemedStack>
  <Stack.Screen name="index" options={{ title: 'Home' }} />
  <Stack.Screen name="detail" options={{ title: 'Detail' }} />
</ThemedStack>
```

**Rules:**
- Use in `_layout.native.tsx` files when a route group needs its own Stack context.
- **Always pair** with a `_layout.tsx` sibling exporting `<Slot />` as the web fallback — expo-router requires a non-platform-suffixed layout file.
- `screenOptions` passed as a prop is **merged over** the theme defaults, not replaced. Both the object and function forms work.
- Per-screen overrides go on `<Stack.Screen options={...}>` children.
- There is no `ThemedStack.Screen` — import `Stack` from `expo-router` and use `<Stack.Screen>`.

---

## NativeHeader

Adds icon buttons to the native navigation bar. Place inside **screen** files, not layouts. Props: `get_component("NativeHeader")`.

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

Note the icon names are **not** interchangeable: iOS takes SF Symbols (`chevron.left`), Android takes Feather names (`arrow-left`). Supplying only `rightIcon` gives you a button on iOS and nothing on Android.

> **CRITICAL — must be inside a Stack context.** A tab screen with no `ThemedStack` ancestor throws at runtime: `useCompositionOption must be used within a RouterCompositionOptionsProvider`. Either add a nested `_layout.native.tsx` with `ThemedStack` (Scenario 3) or don't use `NativeHeader` in that tab.

> **CRITICAL — do not set `headerShown: false`** on a Stack screen using `NativeHeader` on Android. Android injects the buttons via `headerRight`/`headerLeft`; with the header hidden they simply never appear.

---

## Sidebar

> `get_component("Sidebar")` returns zero props — `sidebar.tsx` only re-exports the platform implementations. This is the reference.

```tsx
<Sidebar
  anchor="left"                         // 'left' (default) | 'right' — WEB ONLY
  avoidAppBar                           // offset below the AppTabs app bar — web only
  header={<SidebarHeader title="App" subtitle="v1" onPress={() => navigateTo('/')} />}
  footer={<SidebarFooter><Typography muted>v1.0.0</Typography></SidebarFooter>}
  style={...}
  testID="nav"
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
| Web desktop (≥1024px) | Persistent panel, `position: fixed` below the app bar |
| Web mobile (<1024px) | Hidden; floating trigger opens an animated drawer overlay |
| iOS / Android | Modal drawer sliding in from the **left**; open/close via `useSidebar()` |

**`anchor` is web-only.** The native implementation has no `anchor` prop and always slides from the left. It type-checks (the shared type comes from the web build) but is silently ignored on iOS and Android — don't rely on `anchor="right"` inside a native-only branch.

**`avoidAppBar`** — defaults to `false`, in which case the sidebar fills `100vh` from `top: 0`. Pass it whenever `AppTabs` is also present: it reads `appBarHeight` from layout context and applies `top: appBarHeight` with `height: calc(100vh - appBarHeight)`. No-op on native.

**IMPORTANT — content offset on web desktop.** The desktop sidebar is `position: fixed`; it renders outside the flex flow and does **not** push content. The layout containing it must apply `marginLeft` equal to the sidebar width (`tokens.sidebar.width`, 280) to the content area, gated on the desktop breakpoint. Scenario 4 above shows the full pattern. On mobile web and native the sidebar is an overlay drawer and needs no offset.

**Sub-components** — props via `get_component("SidebarItem")` etc.

| Component | Role |
|---|---|
| `SidebarHeader` | Top slot — `title`/`subtitle`/`logo`, or custom `children` which override them |
| `SidebarSection` | Labelled grouping; renders a divider after itself |
| `SidebarItem` | Row — pair `active` with `isActive()` and `onPress` with `navigateTo()`. There is no `href` prop |
| `SidebarFooter` | Bottom slot, top-bordered |

---

## useSidebar()

```tsx
const { isOpen, open, close, toggle } = useSidebar();
```

Controls the nearest `Sidebar`. Provided by `NativeCtxProvider`. Must be called **inside** the provider — if you need it alongside `AppTabs` in a root layout, put it in an inner component (Scenario 2).

---

## useRouteNavigation()

```tsx
const { isActive, navigateTo, pathname } = useRouteNavigation();

isActive('/items')                  // true on /items AND /items/new (prefix match)
isActive('/items', { exact: true }) // true only on /items
navigateTo('/items/new')            // router.push
```

Use `exact: true` for index routes, which would otherwise stay highlighted on every sub-page.

---

## Safe area rules

The rule is: **whatever renders a header owns the top edge.**

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
| `headerShown: false` on an Android screen using `NativeHeader` | Remove it — the Android header must be visible |
| Missing `_layout.tsx` alongside `_layout.native.tsx` | Add `export default () => <Slot />` as the web fallback |
| Flat tab screen missing top safe area | Use `edges={['top', 'bottom']}` on `Screen` |
| `useSidebar()` called directly in the root layout | Move it to an inner component rendered inside `<NativeCtxProvider>` |
| Tab `name` doesn't match the file/folder | `name` must match the route name exactly (`name: 'index'` for `index.tsx`) |
| `<SidebarItem href="/x">` | There is no `href` — use `active={isActive('/x')}` + `onPress={() => navigateTo('/x')}` |
| `<ThemedStack.Screen>` | Doesn't exist — import `Stack` from `expo-router` and use `<Stack.Screen>` |
| Content sits under the desktop sidebar | Apply `marginLeft: 280` to the content area above the `large` breakpoint |
| `anchor="right"` expected to work on native | Web-only; native always slides from the left |
