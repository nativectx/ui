---
description: Use when setting up @nativectx/ui in a new or existing React Native/Expo project
---

# NativeCtx UI Setup Guide

---

## Scaffolding a New Expo App

```bash
npx create-expo-app@latest my-app --template default@sdk-56
cd my-app
npx expo install @nativectx/ui @expo/vector-icons
```

That is the whole install on the current template: `@expo/ui`,
`react-native-reanimated`, `react-native-safe-area-context` and `expo-router` —
the peers the library needs — already ship with it. On an older or hand-rolled
project, add whichever of those four are missing.

`@expo/vector-icons` is listed separately because most apps want icons, but it is
a genuine optional peer: without it the library still bundles and renders, and
`renderIcon` returns nothing plus a one-time console warning naming the install
command. The remaining optional peers matter only per component —
`@react-native-community/slider` (`Slider`), `expo-image` (`ThemedImage`),
`expo-symbols` + `sf-symbols-typescript` (SF Symbols).

**You do not need a `babel.config.js`.** `babel-preset-expo` adds the
`react-native-worklets/plugin` automatically whenever `react-native-worklets` is
installed, which the template does — see "Automatically add worklets or
reanimated plugin when package is installed" in
`babel-preset-expo/build/configs/expo.js`. Add a `babel.config.js` only if you
need other plugins; `apps/demo` in this repo ships to iOS and Android without
one.

> If you do hit **"react-native-worklets has not been initialized"** on native,
> restart Metro with `--clear` before adding any babel config — a stale
> transform cache is the more common cause.

---

## Provider Setup

The root layout is `src/app/_layout.tsx` on the current template; older projects
put it at `app/_layout.tsx`. Check which one exists before editing.

```tsx
// src/app/_layout.tsx
import { NativeCtxProvider, createBrand } from '@nativectx/ui';

const brand = createBrand({
  name: 'My App',
  colors: { colorSeed: { primary: '#6750A4' } }, // Auto-generates M3 palette
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 40 },
  borderRadius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 28, full: 9999 },
  shape: { surfaceBorderRadius: 12, buttonBorderRadius: 8 },
});

// Wrap app in root layout
<NativeCtxProvider brand={brand}>{children}</NativeCtxProvider>
```

`NativeCtxProvider` automatically includes `SidebarProvider`, `LayoutProvider`, and `ScrollProvider`.

---

## BrandConfig Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | App/brand name |
| `colors` | `Colors \| { colorSeed: PaletteOptions }` | Yes | Color palette or seed for auto-generation |
| `darkColors` | `Colors \| { colorSeed: PaletteOptions }` | No | Dark theme colors (auto-generated from seed if omitted) |
| `spacing` | `{ xs, sm, md, lg, xl, xxl, xxxl }` | Yes | Spacing scale |
| `borderRadius` | `BorderRadius` | Yes | `{ xs, sm, md, lg, xl, full }` — border radius scale |
| `shape` | `Shape` | No | `{ surfaceBorderRadius, buttonBorderRadius }` — defaults to `{ 12, 8 }` |
| `logo` | `LogoConfig` | No | `{ light?: ImageSource, dark?: ImageSource }` |
| `footerLinks` | `FooterLinks` | No | `{ links: Array }` |
| `navigation` | `NavigationConfig` | No | `{ items: Array }` |

---

## Palette Generation

Provide a seed color and the full M3 palette is generated automatically:
```tsx
const brand = createBrand({
  colors: { colorSeed: { primary: '#6750A4' } },
  // darkColors auto-derived from same seed unless provided explicitly
  ...
});
```

To override individual palette roles manually, pass `colors` as a flat object with all M3 token keys instead of `colorSeed`.

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| `useBrandConfig must be used within <NativeCtxProvider>` | Wrap app root with `<NativeCtxProvider brand={brand}>` |
| `Module not found: expo-router` | `npx expo install expo-router @expo/vector-icons` |
| `[@nativectx/ui] <Slider> requires @react-native-community/slider` | `npx expo install @react-native-community/slider` |
| `react-native-worklets has not been initialized` | Restart Metro with `--clear`. `babel-preset-expo` adds the plugin on its own when `react-native-worklets` is installed, so a hand-written `babel.config.js` is not the fix |
| `useCompositionOption must be used within a RouterCompositionOptionsProvider` | `NativeHeader` requires a Stack context — don't use it directly inside NativeTabs tab screens |
| Icons show as boxes | Check icon library name (case-sensitive: `'Feather'`, not `'feather'`) |
| Icons render as nothing, console warns about `@expo/vector-icons` | `npx expo install @expo/vector-icons` — it is an optional peer, so everything else works without it |
| Theme not updating | Use `useTheme()` inside component, not at module level |
