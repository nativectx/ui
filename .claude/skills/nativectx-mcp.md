---
description: How to use the @nativectx/ui MCP server tools to answer questions and generate code accurately
---

# NativeCtx UI AI Tools

NativeCtx UI ships two AI tools via its CLI:
- `npx @nativectx/ui skills` — installs 8 Claude Skill files into `.claude/skills/` (Claude Code reads these automatically)
- `npx @nativectx/ui mcp` — starts the MCP server for live tool access mid-conversation

The MCP server exposes 7 tools and 6 resources. Use them proactively — do not guess component props or token names from memory.

---

## When to call which tool

### `get_component(name)`
Call whenever you need accurate props for a specific component. Use this before writing any JSX that uses a @nativectx/ui component.

```
get_component("Button")       → props, variants, JSDoc examples
get_component("AppTabs")      → tabs config shape, platform notes
get_component("ThemedView")   → variant options, elevation range
```

### `search_components(query)`
Call when the user describes a need but hasn't named a component. Returns the top 5 matches with key props.

```
search_components("expandable section")   → Collapsible
search_components("image with fallback")  → ThemedImage, Avatar
search_components("tab bar navigation")   → AppTabs
```

### `list_components(category?)`
Call at the start of a screen-building task to see all available components. Filter by category to narrow results.

```
list_components()               → all 28 components grouped by category
list_components("navigation")   → AppTabs, Sidebar, NativeHeader, etc.
list_components("controls")     → Button, Chip, FAB, Switch, Slider, etc.
```

Categories: `layout`, `display`, `controls`, `input`, `feedback`, `collections`, `navigation`

### `get_theme_tokens(component?)`
Call when writing inline styles or applying semantic colors. Pass a component name to get its specific token group.

```
get_theme_tokens()           → full token tree
get_theme_tokens("button")   → theme.tokens.button.filledBg, etc.
get_theme_tokens("input")    → theme.tokens.input.background, border, etc.
```

### `generate_palette(primaryHex, secondaryHex?, tertiaryHex?)`
Call when the user provides a color and wants a full M3 palette. Returns both light and dark Colors objects as TypeScript code.

```
generate_palette("#1B5E20")              → full palette from seed
generate_palette("#0D47A1", "#880E4F")   → with explicit secondary
```

### `generate_brand_config(name, primaryHex, spacing?, borderRadius?)`
Call when starting a new app or brand. Returns a complete `createBrand({...})` snippet ready to paste.

```
generate_brand_config("Acme", "#6750A4")
generate_brand_config("Fintech", "#1B5E20", "compact", "sharp")
```

Spacing presets: `compact`, `default`, `comfortable`
Border radius presets: `sharp`, `default`, `rounded`

### `generate_navigation(pattern, tabs?)`
Call when setting up navigation. Patterns map to common expo-router layouts.

```
generate_navigation("flat-tabs")       → simple tab bar, no stack
generate_navigation("tabs-sidebar")    → tabs on mobile, sidebar on tablet
generate_navigation("tabs-stack")      → tabs with nested detail screens
```

Pass `tabs` to customize tab names, labels, and icons. Defaults to Home / Explore / Settings.

---

## Resources

Six skill files are available as resources. Claude reads these automatically when relevant context is needed:

| Resource URI | Content |
|---|---|
| `@nativectx/ui://setup` | Installation, provider setup, troubleshooting |
| `@nativectx/ui://components` | Component reference table |
| `@nativectx/ui://theme` | Theme hooks, tokens, responsive patterns |
| `@nativectx/ui://navigation` | Navigation pattern examples |
| `@nativectx/ui://dev` | Development commands and repo structure |
| `@nativectx/ui://contributing` | Checklist for adding new components |
| `@nativectx/ui://mcp` | This file |

---

## Common patterns

### Building a new screen
1. `search_components("...")` or `list_components(category)` to find the right components
2. `get_component(name)` for each component used — get real prop names before writing JSX
3. `get_theme_tokens("button")` etc. if applying custom styles

### Starting a new app
1. `generate_brand_config(name, hex)` → paste into `brand.ts`
2. `generate_navigation(pattern)` → paste into `app/_layout.tsx` and `app/(tabs)/_layout.tsx`
3. Use `@nativectx/ui://setup` resource to confirm provider wiring

### Theming a color
1. `generate_palette(hex)` → see full 30-token palette before choosing
2. Use the output in `createBrand({ colors: { colorSeed: { primary: hex } } })`

---

## Do not

- Guess prop names from memory — call `get_component()` first
- Invent token names — call `get_theme_tokens()` to get real names
- Use `SchemeContent` or other `@material/material-color-utilities` internals directly — use `createBrand({ colors: { colorSeed: { primary: hex } } })` instead
