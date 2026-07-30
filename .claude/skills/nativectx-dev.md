---
description: Use when developing, building, or testing the @nativectx/ui library itself — commands, repo structure, and troubleshooting
---

# NativeCtx UI Development

> For the full step-by-step workflow to add a new component, load **nativectx-contributing**.

---

## Commands

Run every command from the repo root.

```bash
# Develop
pnpm dev                 # Demo app on web — expo-router, navigation, docs pages
pnpm dev:storybook       # Storybook on web — isolated component work, fastest loop
pnpm dev:ios             # Demo on an iOS simulator
pnpm dev:android         # Demo on an Android emulator

# Check
pnpm typecheck           # Type-check every workspace
pnpm test                # Jest suite for the library
pnpm lint                # ESLint

# Build & ship
pnpm build               # Compile @nativectx/ui to dist/
pnpm deploy:web          # Export the docs site and deploy it to EAS Hosting
```

`pnpm dev` and `pnpm dev:storybook` both run `pnpm build` first, so the
library is always current. If you run `expo` directly from `apps/demo`
instead, build first — the demo imports `@nativectx/ui` from `dist/`, not
from source, so a stale or missing `dist/` gives you
`Cannot find module '@nativectx/ui'` or silently old components.

**When to use which:**
- Storybook → isolated UI work (Button, Typography, inputs, display components)
- Demo → navigation, expo-router layouts, native-platform behaviour

Publishing is handled by the release workflow on a `v*` tag, not by hand.

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
