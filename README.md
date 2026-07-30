# NativeCtx UI

The React Native UI library built for AI development.

Includes a built-in MCP server and Claude Skills that give AI the context to generate consistent, theme-aware code instead of generic boilerplate.

🌐 **[Live Demo](https://nativectx.com)** &nbsp;·&nbsp; 📦 **[NPM](https://www.npmjs.com/package/@nativectx/ui)**

---

## MCP Server & Claude Skills

NativeCtx UI ships a CLI with two AI tools: an MCP server that gives Claude live access to component props, tokens, and code generation, and a skills installer that drops context files into your project for Claude Code to pick up automatically.

### Install Claude Skills

```bash
npx nativectx skills
```

Copies 8 skill files into `.claude/skills/` in your project. Claude Code reads these automatically — no further configuration needed. Re-run after upgrading @nativectx/ui to get updated skills.

### MCP Server

Add to your Claude Code `.mcp.json` or Claude Desktop config:

```json
{
  "mcpServers": {
    "nativectx": {
      "command": "npx",
      "args": ["nativectx", "mcp"]
    }
  }
}
```

Or if @nativectx/ui is already installed locally:

```json
{
  "mcpServers": {
    "nativectx": {
      "command": "node",
      "args": ["./node_modules/@nativectx/ui/dist/mcp/cli.mjs", "mcp"]
    }
  }
}
```

### Tools

| Tool | What Claude can do |
|------|--------------------|
| `list_components` | Browse all components by category |
| `get_component` | Get real props, variants, and examples for any component |
| `search_components` | Find the right component by use case |
| `get_theme_tokens` | Look up semantic token names for any component |
| `generate_palette` | Generate a full M3 palette from a hex seed color |
| `generate_brand_config` | Output a complete `createBrand()` snippet |
| `generate_navigation` | Scaffold flat tabs, tabs + sidebar, or tabs + stack |

Skill docs (setup, components, theme, navigation) are also exposed as resources Claude reads automatically.

---

## Why NativeCtx UI

LLMs produce better code when they understand your design system. NativeCtx UI ships with an MCP server and Claude Skills — live tools and structured context that teach Claude your tokens, component API, and conventions. Generated code uses the right values from the first prompt.

- **MCP Server** — Claude calls live tools for props, tokens, and code generation mid-conversation
- **Claude Skills** — Structured context files for components, theming, and navigation patterns
- **Material Design 3** — Semantic color tokens, type scale, and spacing across every component
- **Cross-platform** — iOS, Android, and web from a single component tree

---

## Installation

```bash
npx expo install @nativectx/ui

# Required peer dependencies
npx expo install react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-screens expo-router @expo/vector-icons
```

### Upgrading from `zero-to-app`

This library was formerly published as `zero-to-app`. To move an existing project over:

```bash
npx nativectx migrate
```

That rewrites the dependency, import specifiers, the renamed `ZeroToApp` → `NativeCtxProvider` provider, your `.mcp.json` server entry, and replaces the stale `zero-to-app-*.md` skill files. Pass `--dry-run` to preview. Anything it can't safely automate is printed as a review list at the end.

`ZeroToApp` still works as a deprecated alias, so a dependency bump alone won't break your build — but it is removed in 0.2.0.

---

## Quick Start

### 1. Setup Provider

```tsx
// app/_layout.tsx
import { NativeCtxProvider, createBrand } from '@nativectx/ui';

const brand = createBrand({
  name: 'My App',
  colors: { colorSeed: { primary: '#6750A4' } }, // Auto-generates M3 palette
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 40 },
  borderRadius: 8,
});

export default function RootLayout() {
  return <NativeCtxProvider brand={brand}>{/* Your app */}</NativeCtxProvider>;
}
```

### 2. Use Components

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

---

## Claude Skills

Claude Skills are context files that teach Claude your design system. Install them with:

```bash
npx nativectx skills
```

Skills cover components, theming, navigation patterns, and responsive layout — so Claude generates code that uses your actual tokens and follows your conventions from the first prompt. Run the command once after install, and again after any upgrade.

---

## Components

### Button
```tsx
<Button title="Primary" variant="filled" onPress={handlePress} />
<Button title="Save" icon={{ library: 'Feather', name: 'save' }} />
```
**Variants:** `filled` · `tonal` · `outlined` · `text` · `elevated`

### Typography
```tsx
<Typography variant="headlineMedium" weight="bold">Title</Typography>
<Typography variant="bodyMedium" muted>Description</Typography>
```
**Variants:** `display{Large|Medium|Small}` · `headline{...}` · `title{...}` · `body{...}` · `label{...}`

### ThemedView
```tsx
<ThemedView variant="card" columns={2} gap={16}>{content}</ThemedView>
```
**Variants:** `background` · `surface` · `surfaceContainer` · `card` · `appbar` · `primary`

### Screen
```tsx
<Screen variant="background" scrollable>{content}</Screen>
```

### Container
```tsx
<Container maxWidth={800}>{content}</Container>
```

### AppTabs
```tsx
<AppTabs
  brandName="My App"
  tabs={[{ name: 'index', href: '/', label: 'Home', materialIcon: 'home' }]}
/>
```

### Sidebar
```tsx
const { open } = useSidebar();
<Sidebar header={<SidebarHeader title="App" />}>
  <SidebarItem label="Home" onPress={() => {}} />
</Sidebar>
```

---

## Hooks

```tsx
const theme = useTheme();                     // Colors, spacing, tokens
const { mode, toggleTheme } = useThemeMode(); // Light/dark control
const { width } = useDimensions();            // Responsive layout
const isLarge = useBreakpoint('large');        // Breakpoint helper
const { isOpen, open, toggle } = useSidebar();
```

**Breakpoints:** `small` (<768px) · `medium` (≥768px) · `large` (≥1024px) · `xlarge` (≥1280px)

---

## Theme Tokens

```tsx
const theme = useTheme();

theme.primary          // Palette tokens
theme.surface
theme.onSurfaceVariant

theme.tokens.button.filledBg   // Semantic tokens
theme.tokens.card.background
theme.tokens.input.border

theme.spacing.lg       // Layout
theme.borderRadius.md
```

---

## Development

```bash
pnpm install              # Install deps
pnpm dev:storybook       # Component development
pnpm dev                 # Full app testing
pnpm typecheck            # Type check
pnpm test                 # Run tests
pnpm build                # Build package
pnpm release              # Publish to npm
```

**Structure:**
- `ui/` — Component library (`@nativectx/ui` on npm)
- `nativectx/` — Thin CLI alias package (`nativectx` on npm)
- `apps/storybook/` — Isolated component development
- `apps/demo/` — Integrated testing with expo-router

---

## Resources

- [Live Demo](https://nativectx.com)
- [Material Design 3](https://m3.material.io)
- [NPM Package](https://www.npmjs.com/package/@nativectx/ui)
- [GitHub](https://github.com/nativectx/ui)

---

MIT License
