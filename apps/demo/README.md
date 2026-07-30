# @nativectx/ui Demo App

This is the demo Expo app for testing **@nativectx/ui** components that require expo-router or complex native dependencies.

## Purpose

Use this app to test:
- **AppTabs** and navigation components (requires expo-router)
- Components with file system dependencies
- Full app integration testing
- Platform-specific behaviors (iOS NativeTabs, Android Navigation, Web app bar)

For isolated UI components (Button, Typography, Cards), use **Storybook** instead (faster iteration).

## Running the Demo

```bash
# From monorepo root
pnpm dev:demo              # Start Expo dev server
pnpm dev:demo:ios          # Run on iOS simulator
pnpm dev:demo:android      # Run on Android emulator
pnpm dev:demo:web          # Run in web browser
```

## Usage Reference

For using @nativectx/ui in your own project, see the main [@nativectx/ui README](../../README.md).
