---
description: How to wire up the @nativectx/ui MCP server, which tool to reach for when, and where its answers are incomplete
---

# NativeCtx UI MCP Server

NativeCtx UI ships two AI integrations from one CLI:

| Command | What it does |
|---|---|
| `npx nativectx init` | Sets up both of the below in one pass — installs the skills, merges the server entry into `.mcp.json`, and reports missing peers and provider wiring. `--dry-run` previews |
| `npx nativectx skills` | Copies 6 skill files into `.claude/skills/` — static, read automatically by Claude Code. Add `--contributor` for the 2 about developing the library itself |
| `npx nativectx mcp` | Starts the MCP server — live tools that read a manifest generated from component source |

The skills stand alone. The MCP server is enrichment: it answers *lookups* (exact props, real token names, generated palettes) that would go stale if written down. When it's connected, prefer it over recalling props from memory.

---

## Wiring it up

**Claude Code** — `npx nativectx init` writes this for you, merging into an existing `.mcp.json` without disturbing the other servers. By hand, add to `.mcp.json` in the project root:

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

Restart the client after editing. Verify with `list_components()` — it should return 29 components.

`nativectx` is a thin alias package that forwards to `@nativectx/ui`; `npx -y @nativectx/ui mcp` is equivalent. If the project already depends on `@nativectx/ui`, the server runs against the installed version, so its answers track the version actually in `node_modules`.

---

## Which tool to reach for

Full parameter schemas come from the server — this is the routing, not the signatures.

| Situation | Tool |
|---|---|
| About to write JSX using a component | `get_component` — before writing, not after a type error |
| User described a need but named no component | `search_components` — top 5 by use case |
| Starting a screen and need the vocabulary | `list_components`, optionally by category |
| Writing inline styles or picking a semantic colour | `get_theme_tokens` — scoped to a component, or omit for the full tree |
| User gave a brand colour and wants a palette | `generate_palette` |
| New app / new brand from scratch | `generate_brand_config` → paste into `brand.ts` |
| Need expo-router navigation boilerplate | `generate_navigation` — then read **nativectx-navigation** for why that shape |

Categories for `list_components`: `layout`, `display`, `controls`, `input`, `feedback`, `collections`, `navigation`.
Presets for `generate_brand_config`: spacing `compact` / `default` / `comfortable`, radius `sharp` / `default` / `rounded`.
Patterns for `generate_navigation`: `flat-tabs`, `tabs-sidebar`, `tabs-stack`.

---

## What the tools do and don't cover

Both the component manifest and the token tree are derived from source, and the build fails if either drifts — so tool output is trustworthy for names, types and defaults.

Two deliberate boundaries:

- **React Native pass-through props are not enumerated.** `get_component` lists everything a component accepts from this library, including inherited base props, but stops at the RN boundary. `Typography`, `ThemedTextInput`, `ThemedImage` and `Collapsible` also accept their wrapped primitive's props; check the RN docs for those.
- **`AppTabConfig` is not expanded.** `get_component("AppTabs")` shows `tabs: AppTabConfig[]` without the field list. It's in **nativectx-navigation**.

Where the skills and the tools overlap, the tools win on *facts* — prop names, token names, defaults. The skills win on *judgement* — which component to reach for, which layout shape fits, what not to do.

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
- Assume a prop is unsupported because the tool didn't list it — see "What the tools do and don't cover"
- Paste `generate_navigation` output unreviewed
- Use `SchemeContent` or other `@material/material-color-utilities` internals directly — use `createBrand({ colors: { colorSeed: { primary: hex } } })`
