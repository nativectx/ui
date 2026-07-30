---
description: How to wire up the @nativectx/ui MCP server, which tool to reach for when, and where its answers are incomplete
---

# NativeCtx UI MCP Server

NativeCtx UI ships two AI integrations from one CLI:

| Command | What it does |
|---|---|
| `npx nativectx skills` | Copies 8 skill files into `.claude/skills/` — static, read automatically by Claude Code |
| `npx nativectx mcp` | Starts the MCP server — live tools that read a manifest generated from component source |

The skills stand alone. The MCP server is enrichment: it answers *lookups* (exact props, real token names, generated palettes) that would go stale if written down. When it's connected, prefer it over recalling props from memory.

---

## Wiring it up

**Claude Code** — add to `.mcp.json` in the project root:

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

**Claude Desktop** — same block, in `claude_desktop_config.json` (`~/Library/Application Support/Claude/` on macOS). This file lives outside the project, so it isn't touched by `npx nativectx skills` or `npx nativectx migrate`.

Restart the client after editing. Verify with `list_components()` — it should return 28 components.

`nativectx` is a thin alias package that forwards to `@nativectx/ui`; `npx -y @nativectx/ui mcp` is equivalent. If the project already depends on `@nativectx/ui`, the server runs against the installed version, so its answers track the version actually in `node_modules`.

---

## Which tool to reach for

Full parameter schemas come from the server — this is the routing, not the signatures.

| Situation | Tool |
|---|---|
| About to write JSX using a component | `get_component` — before writing, not after a type error |
| User described a need but named no component | `search_components` — top 5 by use case |
| Starting a screen and need the vocabulary | `list_components`, optionally by category |
| Writing inline styles or picking a semantic colour | **nativectx-theme** first; `get_theme_tokens` has drifted (below) |
| User gave a brand colour and wants a palette | `generate_palette` |
| New app / new brand from scratch | `generate_brand_config` → paste into `brand.ts` |
| Need expo-router navigation boilerplate | `generate_navigation` — but see the caveat below |

Categories for `list_components`: `layout`, `display`, `controls`, `input`, `feedback`, `collections`, `navigation`.
Presets for `generate_brand_config`: spacing `compact` / `default` / `comfortable`, radius `sharp` / `default` / `rounded`.
Patterns for `generate_navigation`: `flat-tabs`, `tabs-sidebar`, `tabs-stack`.

---

## Where the tools are incomplete

The manifest is extracted from source by `build-manifest.ts`. It reads the `<Name>Props` interface declared in each component's own file, and only that interface's **own** properties. So:

- **Inherited props never appear.** `Button` really does accept `disabled` and `loading`; `Chip` and `ListItem` accept `onPress` and `disabled`. See **nativectx-components** for the shared base interfaces.
- **`Sidebar` and `ThemedStack` report zero props.** Their props live in a platform file or come from expo-router. **nativectx-navigation** is the reference for both.
- **`AppTabConfig` is not expanded.** `get_component("AppTabs")` shows `tabs: AppTabConfig[]` without the field list. It's in **nativectx-navigation**.
- **`IconButton` is missing entirely** — exported from the package, absent from the manifest.
- **`get_theme_tokens` is not generated from source.** It is a hand-maintained string and has drifted: it reports `input.focusedBorder`, `list.itemSubText`, `modal.overlay`, `appbar.iconColor` and `link` / `badge` groups that no longer exist in `ThemeValuesType`. **nativectx-theme** is authoritative for token names.
- **`generate_navigation` output is boilerplate, not a reviewed pattern.** It has emitted `<SidebarItem href=...>` and `<ThemedStack.Screen>`, neither of which exists. Treat its output as a starting sketch and reconcile it against the scenarios in **nativectx-navigation**, which are the authoritative layouts.

A prop being absent from tool output is not evidence the prop doesn't exist. Check the skill, then the source.

---

## Resources

The 8 skill files are also served as MCP resources, so a client without `.claude/skills/` can still read them:

| Resource URI | Content |
|---|---|
| `nativectx://setup` | Installation, provider setup, troubleshooting |
| `nativectx://components` | Choosing and composing components |
| `nativectx://theme` | Theme hooks, tokens, responsive patterns |
| `nativectx://navigation` | Navigation patterns and layout shapes |
| `nativectx://dev` | Development commands and repo structure |
| `nativectx://contributing` | Checklist for adding new components |
| `nativectx://migration` | Upgrading from `zero-to-app` |
| `nativectx://mcp` | This file |

---

## Workflows

**Building a new screen**
1. `search_components(...)` or `list_components(category)` to find the right pieces
2. `get_component(name)` for each one — real prop names before writing JSX
3. **nativectx-theme** for token names if applying custom styles

**Starting a new app**
1. `generate_brand_config(name, hex)` → `brand.ts`
2. Pick a layout shape from **nativectx-navigation**, optionally seeding it with `generate_navigation(pattern)`
3. Confirm provider wiring against **nativectx-setup**

**Theming a colour**
1. `generate_palette(hex)` to see the full palette before committing
2. Use the seed in `createBrand({ colors: { colorSeed: { primary: hex } } })`

---

## Do not

- Guess prop names from memory — call `get_component()` first
- Invent token names — take them from **nativectx-theme**, not from memory
- Assume a prop is unsupported because the tool didn't list it — see "Where the tools are incomplete"
- Paste `generate_navigation` output unreviewed
- Use `SchemeContent` or other `@material/material-color-utilities` internals directly — use `createBrand({ colors: { colorSeed: { primary: hex } } })`
