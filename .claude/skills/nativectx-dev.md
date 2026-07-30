---
description: Use when developing, building, or testing the @nativectx/ui library itself — commands, repo structure, and troubleshooting
---

# NativeCtx UI Development

> For the full step-by-step workflow to add a new component, load **nativectx-contributing**.

---

## Commands

```bash
pnpm dev:storybook:web   # Isolated component dev — fastest inner loop
pnpm dev:demo            # Full app (expo-router, navigation, native features)
pnpm typecheck           # Type-check all workspaces
pnpm build               # Build the @nativectx/ui package (required before demo picks up changes)
pnpm release             # Publish to npm
```

**When to use which:**
- Storybook → isolated UI work (Button, Typography, inputs, display components)
- Demo → navigation, expo-router layouts, native-platform behaviour

---

## Repository Structure

```
nativectx-ui/
├── ui/                     # npm package source
│   ├── components/ui/              # UI components (platform splits: .ios.tsx, .android.tsx, .tsx)
│   ├── components/navigation/      # Navigation components
│   ├── theme/theme-config.ts       # Token types + createLightTheme / createDarkTheme
│   ├── hooks/                      # useDimensions, useBreakpoint, useRouteNavigation
│   ├── context/                    # SidebarProvider, LayoutProvider, ScrollProvider
│   ├── brand/brand-config.ts       # createBrand()
│   ├── icons/                      # renderIcon() helper
│   └── index.ts                    # Public barrel export
├── apps/storybook/                 # Component stories
│   └── components/<Name>/<Name>.stories.tsx
└── apps/demo/                      # Demo / docs app
    └── src/
        ├── app/explore/            # One .tsx per component doc page
        ├── components/             # docs-page.tsx, demo-section.tsx, props-table.tsx, docs-pagination.tsx
        └── config/nav.ts           # NAV_SECTIONS + NAV_PAGES — sidebar and pagination source of truth
```

---

## Key Files

| Purpose | Path |
|---------|------|
| Public exports | `@nativectx/ui/index.ts` |
| Theme tokens + types | `@nativectx/ui/theme/theme-config.ts` |
| Brand config | `@nativectx/ui/brand/brand-config.ts` |
| Demo nav config | `apps/demo/src/config/nav.ts` |
| Native stack layout | `apps/demo/src/app/explore/_layout.native.tsx` |

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Cannot find module '@nativectx/ui'` | Run `pnpm build` — demo consumes from `dist/`, not source |
| `Property 'tokens' does not exist` | Token added to type but missing from `createLightTheme` or `createDarkTheme` |
| Component not themed in Storybook | Check `apps/storybook/.storybook/decorators.tsx` wraps stories with `<NativeCtxProvider>` |
| expo-router error in Storybook | Use Demo app — Storybook doesn't support expo-router |
| Type error in platform-specific file | Check both `.ios.tsx` and `.android.tsx` define the same exported interface |
