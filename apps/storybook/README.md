# @nativectx/ui Storybook

Isolated component development for **@nativectx/ui** — the fastest loop for work
on a single component. For navigation, expo-router layouts, or native-platform
behaviour, use `apps/demo` instead.

## Running

```bash
# From the monorepo root — each builds @nativectx/ui first
pnpm dev:storybook          # Storybook on web, the usual loop
pnpm dev:storybook:native   # Storybook inside the Expo native shell
```

Storybook consumes `@nativectx/ui` from its compiled `dist/`, not from source, so
run `pnpm build` after changing the library if you start Expo directly from this
directory.

## Adding a story

Stories live at `components/<Name>/<Name>.stories.tsx`. On native the story list
is generated rather than globbed, so regenerate it after adding a file:

```bash
pnpm --filter @nativectx/storybook storybook-generate
```

Stories are wrapped by the `withNativeCtxProvider` decorator in
`.storybook/decorators.tsx`, which supplies `BrandProvider` and the theme
context. A component that renders unthemed here is usually missing from that
decorator rather than broken.
