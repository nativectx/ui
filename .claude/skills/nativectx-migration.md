---
description: Use when a project still depends on the old `zero-to-app` package and needs upgrading to `@nativectx/ui` — renamed package, renamed provider, renamed skills and MCP server
---

# Migrating zero-to-app → @nativectx/ui

`zero-to-app` was renamed to `@nativectx/ui`, which restarts at 0.1.0 as a fresh package. The old package is deprecated on npm and receives no further updates.

## Detecting that a migration is needed

Any one of these means the project is still on the old name:

- `zero-to-app` in any `package.json` dependency field
- `from 'zero-to-app'` or `from 'zero-to-app/...'` in source
- `<ZeroToApp>` in the component tree
- `.claude/skills/zero-to-app-*.md` files present
- a `"zero-to-app"` server entry in `.mcp.json`

## Do this first — run the codemod

**Do not hand-edit these renames.** Run the codemod; it is deterministic and idempotent:

```bash
npx nativectx migrate
```

Preview first if the working tree is dirty:

```bash
npx nativectx migrate --dry-run
```

It handles:

| Change | From | To |
|---|---|---|
| Dependency | `zero-to-app` | `@nativectx/ui` |
| Import specifiers | `'zero-to-app'`, `'zero-to-app/ui'` | `'@nativectx/ui'`, `'@nativectx/ui/ui'` |
| Provider symbol | `ZeroToApp` | `NativeCtxProvider` |
| MCP server entry | `"zero-to-app"` | `"nativectx"` |
| Skill files | `zero-to-app-*.md` (deleted) | `nativectx-*.md` (installed) |

Then reinstall dependencies and restart Metro with `--clear`.

## What the codemod leaves for you

It prints a residual list on completion. Handle those manually — they are the cases where a blind replace would produce wrong text:

- **Prose in READMEs and docs.** Use **NativeCtx UI** for the brand, `@nativectx/ui` for the package. Do not write `@nativectx/ui` in a sentence where a product name belongs.
- **Local identifiers** derived from the old name (`zeroToAppTheme`, `ZeroToAppWrapper`, custom wrappers around the provider). Rename to match the surrounding convention.
- **URLs.** `github.com/Alex-Amayo/zero-to-app` → `github.com/nativectx/ui`. Never build a URL by substituting the package specifier into a hostname — `demo-@nativectx/ui.expo.app` is not a valid host.
- **Claude Desktop config**, which lives outside the project (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS). The codemod does not touch files outside the project; update it yourself.

## Compatibility notes

- `ZeroToApp` is still exported as a deprecated alias for `NativeCtxProvider`, so a project that only swaps the dependency keeps compiling. It is still present in 0.2.x and will be removed in 0.3.0 — migrate rather than relying on it.
- The CLI is `npx nativectx <command>`. The `nativectx` package is a thin alias that forwards to `@nativectx/ui`, so `npx @nativectx/ui <command>` is equivalent. Install the library itself as `@nativectx/ui`.
- Everything else — component names, props, theme tokens, `createBrand`, all hooks — is unchanged. This rename is not an API redesign; if a component appears to be missing, look it up with the MCP `get_component` tool rather than assuming it was removed.
