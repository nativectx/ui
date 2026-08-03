# @nativectx/ui Demo App

The Expo app behind **[nativectx.com](https://nativectx.com)** — it is both the published docs site and where components needing expo-router or real native dependencies get exercised.

## Purpose

Use this app to test:
- **AppTabs** and navigation components (requires expo-router)
- Components with file system dependencies
- Full app integration testing
- Platform-specific behaviors (iOS NativeTabs, Android Navigation, Web app bar)

For isolated UI components (Button, Typography, Cards), use **Storybook** instead (faster iteration).

## Running the Demo

```bash
# From the monorepo root — each builds @nativectx/ui first
pnpm dev                   # Web browser
pnpm dev:ios               # iOS simulator
pnpm dev:android           # Android emulator
pnpm export:web            # Static web bundle, as deployed to nativectx.com
```

## Usage Reference

For using @nativectx/ui in your own project, see the main [@nativectx/ui README](../../README.md).
