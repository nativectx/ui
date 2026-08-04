# NativeCtx UI

### A React Native UI library optimized for LLMs.

[![npm](https://img.shields.io/npm/v/@nativectx/ui?color=cb3837&logo=npm)](https://www.npmjs.com/package/@nativectx/ui)
[![downloads](https://img.shields.io/npm/dw/@nativectx/ui?color=cb3837)](https://www.npmjs.com/package/@nativectx/ui)
[![license](https://img.shields.io/npm/l/@nativectx/ui?color=blue)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-nativectx.com-6750A4)](https://nativectx.com)

29 Material Design 3 components for iOS, Android, and web — shipped with an MCP server and Claude Skills, so Claude writes against your real props and tokens instead of guessing.

---

## Why

LLMs write better code when they can see your design system. NativeCtx UI ships an MCP server and Claude Skills next to the components, so Claude reads your real props and tokens instead of guessing at them — and reuses your accessible, theme-aware primitives instead of rebuilding them.

- **MCP server** — live tools for props, tokens, palette generation, and navigation scaffolding
- **Claude Skills** — context files Claude Code picks up automatically, no configuration
- **Material Design 3** — semantic color tokens, type scale, and spacing across 29 components
- **Cross-platform** — iOS, Android, and web from a single component tree

---

## Install

```bash
npx expo install @nativectx/ui @expo/vector-icons
npx nativectx init
```

`init` installs the Claude Skills, merges the `nativectx` MCP server into `.mcp.json`, and finds your root layout to tell you where the provider goes. `--dry-run` previews the whole thing; re-running is a no-op.

<details>
<summary><b>Peer dependencies</b></summary>

<br>

On the current Expo template that's all you need — `@expo/ui`, `react-native-reanimated`, `react-native-safe-area-context` and `expo-router` already ship with it. On an older or hand-rolled project, add whichever of those four are missing.

`init` never overwrites a config it can't merge safely, and it names any peer still missing.

`@expo/vector-icons` is separate because most apps want icons; skip it and icons simply don't render, with a warning telling you how to add them. The remaining optional peers matter only for the components that use them: `@react-native-community/slider` (`Slider`), `expo-image` (`ThemedImage`), `expo-symbols` and `sf-symbols-typescript` (SF Symbols) — the current template already ships `expo-image` and `expo-symbols`, so `init` will only ask for what your project actually lacks.

</details>

---

## Quick Start

```tsx
// src/app/_layout.tsx  (or app/_layout.tsx, depending on your template)
import { NativeCtxProvider, createBrand } from '@nativectx/ui';

const brand = createBrand({
  name: 'My App',
  colors: { colorSeed: { primary: '#6750A4' } }, // Auto-generates the M3 palette
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 40 },
  borderRadius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 28, full: 9999 },
});

export default function RootLayout() {
  return <NativeCtxProvider brand={brand}>{/* Your app */}</NativeCtxProvider>;
}
```

```tsx
import { Button, Typography, ThemedView } from '@nativectx/ui';

function MyScreen() {
  return (
    <ThemedView variant="surface">
      <Typography variant="headlineMedium">Welcome</Typography>
      <Button title="Get Started" variant="filled" onPress={() => {}} />
    </ThemedView>
  );
}
```

Component reference, theme tokens, hooks, and live examples: **[nativectx.com](https://nativectx.com)**.

---

## AI Integration

[`npx nativectx init`](#install) sets up both of the following in one pass. The individual commands below are there when you want just one of them.

### Claude Skills

```bash
npx nativectx skills
```

Copies the six app-building skills — setup, components, theme, navigation, mcp, migration — into `.claude/skills/`. Claude Code reads them automatically. Re-run after upgrading to refresh them.

Two further skills cover developing @nativectx/ui itself. They are held back by default so they don't compete for context in your app:

```bash
npx nativectx skills --contributor
```

Re-running without the flag prunes contributor skills a previous install left behind. Nothing else in `.claude/skills/` is touched.

### MCP Server

To wire it up by hand instead, add this to your Claude Code `.mcp.json` or Claude Desktop config:

```json
{
  "mcpServers": {
    "nativectx": {
      "command": "npx",
      "args": ["-y", "nativectx", "mcp"]
    }
  }
}
```

Already installed locally? Point at the bundled CLI instead: `node ./node_modules/@nativectx/ui/dist/mcp/cli.mjs mcp`.

| Tool | What Claude can do |
|------|--------------------|
| `list_components` | Browse all components by category |
| `get_component` | Get real props, variants, and examples for any component |
| `search_components` | Find the right component by use case |
| `get_theme_tokens` | Look up semantic token names for any component |
| `generate_palette` | Generate a full M3 palette from a hex seed color |
| `generate_brand_config` | Output a complete `createBrand()` snippet |
| `generate_navigation` | Scaffold flat tabs, tabs + sidebar, or tabs + stack |

All eight skills are also readable on demand as MCP resources, whichever set you installed.

---

## Upgrading from `zero-to-app`

This library was formerly published as `zero-to-app`:

```bash
npx nativectx migrate
```

Rewrites the dependency, import specifiers, the renamed `ZeroToApp` → `NativeCtxProvider` provider, your `.mcp.json` entry, and the stale `zero-to-app-*.md` skill files. `--dry-run` previews; anything it can't safely automate is printed as a review list.

`ZeroToApp` still works as a deprecated alias, so a dependency bump alone won't break your build — but it is removed in 0.2.0.

---

## Development

```bash
pnpm setup           # Install deps and build the library — start here
pnpm dev:storybook   # Component development
pnpm dev             # Demo app, full navigation
pnpm verify          # Everything CI runs: build, check, lint, typecheck, test
```

- `ui/` — component library (`@nativectx/ui` on npm)
- `nativectx/` — thin CLI alias package (`nativectx` on npm)
- `apps/storybook/` — isolated component development
- `apps/demo/` — the docs site, built with expo-router

Publishing runs from the `Release` workflow on a `v*` tag; there is no local publish script, so a release always goes out from a green, committed tree.

---

## Resources

- [Docs & Live Demo](https://nativectx.com)
- [NPM Package](https://www.npmjs.com/package/@nativectx/ui)
- [GitHub](https://github.com/nativectx/ui)
- [Material Design 3](https://m3.material.io)

---

MIT License
