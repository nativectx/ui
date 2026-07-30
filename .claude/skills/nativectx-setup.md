---
description: Use when setting up @nativectx/ui in a new or existing React Native/Expo project
---

# NativeCtx UI Setup Guide

---

## Scaffolding a New Expo App

```bash
npx create-expo-app@latest --template default@sdk-56
```

After scaffolding, add a `babel.config.js` at the project root — **required** for `react-native-worklets` (used by @nativectx/ui animations) on native:

```js
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};
```

> Without this, iOS/Android will throw **"react-native-worklets has not been initialized"** at runtime.
> After adding/changing `babel.config.js`, restart Metro with `--clear`: `npm start -- --clear`

---

## Provider Setup

```tsx
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
| `react-native-worklets has not been initialized` | Add `babel.config.js` with `plugins: ['react-native-worklets/plugin']` and restart with `--clear` |
| `useCompositionOption must be used within a RouterCompositionOptionsProvider` | `NativeHeader` requires a Stack context — don't use it directly inside NativeTabs tab screens |
| Icons show as boxes | Check icon library name (case-sensitive: `'Feather'`, not `'feather'`) |
| Theme not updating | Use `useTheme()` inside component, not at module level |
