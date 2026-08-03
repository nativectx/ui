---
description: Use when developing, building, testing, or checking the @nativectx/ui library itself — commands, repo structure, the AI-docs sync checks, and troubleshooting
---

# NativeCtx UI Development

> For the full step-by-step workflow to add a new component, load **nativectx-contributing**.

---

## Commands

Run every command from the repo root.

```bash
# Start here
pnpm setup               # Install deps, then build the library
pnpm verify              # Everything CI runs, in CI's order (under 20s) — build, check, lint, typecheck, test

# Develop
pnpm dev                 # Demo app on web — expo-router, navigation, docs pages
pnpm dev:storybook       # Storybook on web — isolated component work, fastest loop
pnpm dev:ios             # Demo on an iOS simulator
pnpm dev:android         # Demo on an Android emulator
pnpm dev:storybook:native  # Storybook in the Expo native shell

# Check (all of these run in CI on every PR — `pnpm verify` runs the lot)
pnpm check               # AI-docs sync suite: manifest → skills → @example blocks
pnpm typecheck           # Build, then tsc --noEmit across every workspace (ui, nativectx, apps/*)
pnpm typecheck:packages  # …without the build first, when dist/ is already current
pnpm test                # Jest suite for the library
pnpm test:watch          # …in watch mode
pnpm lint                # ESLint over the whole workspace, warnings are errors
pnpm lint:fix            # …with --fix

# Build & ship
pnpm build               # Compile @nativectx/ui to dist/ (includes the MCP bundle + manifest)
pnpm build:watch:types   # tsc --watch on the library — types and JS only, see below
pnpm export:web          # Build, then export the demo as a static web bundle
pnpm deploy:web          # Export the docs site and deploy it to EAS Hosting
pnpm deploy:web:preview  # …to a preview URL
pnpm clean               # Remove build output and Expo scratch dirs
pnpm clean:deps          # …and every node_modules, for a from-scratch reinstall
```

`build:watch:types` is `tsc --watch` against `tsconfig.build.json` only. It does
**not** rebuild the MCP manifest, bundle the CLI, or re-copy the skills into
`dist/mcp/` — the name says `:types` so that gap is visible at the call site. Run
a full `pnpm build` after touching anything under `ui/mcp/` or `.claude/skills/`.

`pnpm dev` and `pnpm dev:storybook` both run `pnpm build` first, so the library
is always current. If you run `expo` directly from `apps/demo` instead, build
first — the demo imports `@nativectx/ui` from `dist/`, not from source, so a
stale or missing `dist/` gives you `Cannot find module '@nativectx/ui'` or
silently old components.

**When to use which:**
- Storybook → isolated UI work (Button, Typography, inputs, display components)
- Demo → navigation, expo-router layouts, native-platform behaviour

Publishing is handled by the release workflow on a `v*` tag, not by hand — there
is deliberately no local `release` script.

Lint config lives in a single root `eslint.config.js` covering `ui/`, `apps/demo`
and `apps/storybook`. `pnpm lint` runs at `--max-warnings 0`, so a new warning
fails CI. The config carries a few documented rule exceptions (the RN
`useRef(new Animated.Value()).current` idiom, Storybook CSF `render:` functions,
guarded `require()` of optional peers, same-binding re-exports in the barrels) —
read the comments there before adding another.

---

## Keeping the AI-facing docs honest

This package ships an MCP server and a set of Claude Skills that describe the
library. None of it is compiled by the library, so nothing else in the build
notices when it stops being true. `pnpm check` is the guard, and it is three
separately callable steps — rerun just the one that failed:

```bash
pnpm check:manifest   # rebuild ui/dist/mcp/component-manifest.json and assert it is complete (~1s)
pnpm check:skills     # assert .claude/skills/*.md still agree with the manifest
pnpm check:examples   # compile-check every JSDoc @example block
```

- `check:manifest` re-derives the manifest from source with ts-morph and hard-fails
  on drift: an exported component missing from the manifest metadata, a component
  whose props came out empty, or a props interface that lost its inherited props.
- The manifest is the *only* thing `get_component`, `list_components`, and
  `search_components` serve, so it is also what component descriptions,
  `@category`, and `@example` blocks come from — all authored as JSDoc on the
  `<Name>Props` interface.
- `check:examples` reads the examples back out of the manifest and type-checks
  each one against the component's *source*, so `@example` blocks must be real
  working code. It runs after `check:manifest` because it needs the manifest the
  latter emits.

CI (`.github/workflows/ci.yml`) runs `pnpm check` on every PR immediately after
the package build, ahead of lint/typecheck/test. The pre-commit hook stays
scoped by path through lint-staged rather than running the whole suite: a commit
touching `*.{ts,tsx}` gets `eslint --fix --max-warnings 0` then `pnpm typecheck`,
and one touching `.claude/skills/*.md` gets `check:manifest && check:skills`.

---

## Tests

`pnpm test` runs Jest from `ui/jest.config.js` (rootDir is the repo root because
pnpm hoists `node_modules` there; test discovery is scoped back to `ui/`).

| Suite | Guards |
|---|---|
| `ui/theme/theme.test.tsx` | Theme construction and token shape |
| `ui/utils/__tests__/contrastChecker.test.ts` | Contrast helpers |
| `ui/mcp/mcp-tools.test.ts` | Drift between the MCP tools and the library — `get_theme_tokens` must document every token in `theme-config.ts`, `generate_navigation` must emit components and props that exist |
| `ui/mcp/skills-command.test.ts` | `nativectx skills` install/prune planning, and the consumer vs `--contributor` split (`CONTRIBUTOR_SKILLS`) |

Add a skill file, or rename one, and `skills-command.test.ts`'s `PACKAGE_SKILLS`
fixture must be updated with it.

Package-scoped variants, when you want a tighter loop:

```bash
pnpm --filter @nativectx/ui test         # same suite, run directly
pnpm --filter @nativectx/ui test:watch   # watch mode
pnpm --filter @nativectx/ui run build:mcp  # manifest + esbuild the CLI + copy skills into dist/
```

---

## Repository Structure

```
nativectx/ui/                       # repo root — pnpm workspace
├── ui/                             # the @nativectx/ui npm package
│   ├── components/index.ts             # public component barrel (the manifest reads this)
│   ├── components/ui/                  # UI components (platform splits: .ios.tsx, .android.tsx, .tsx)
│   ├── components/navigation/          # Navigation components (.web.tsx / .native.tsx splits)
│   ├── components/shared/              # Shared prop base types + utils (blurOnWeb, platformShadow)
│   ├── theme/theme-config.ts           # Token types + createLightTheme / createDarkTheme
│   ├── theme/high-contrast-theme.ts    # High-contrast variants of both themes
│   ├── hooks/                          # useDimensions, useBreakpoint, useRouteNavigation
│   ├── context/                        # SidebarProvider, LayoutProvider, ScrollProvider
│   ├── brand/brand-config.ts           # createBrand()
│   ├── icons/                          # renderIcon() helper
│   ├── mcp/                            # MCP server, CLI, and the manifest extractor
│   │   ├── build-manifest.ts               # ts-morph extractor + build-time drift guard
│   │   ├── cli.ts, server.ts               # `nativectx` CLI and MCP server entry points
│   │   ├── skills-command.ts               # `nativectx skills` install/prune, CONTRIBUTOR_SKILLS
│   │   ├── tools/                          # get_component, list_components, search_components, …
│   │   └── resources/skills.ts             # skills served over MCP
│   └── index.ts                        # Public barrel export
├── nativectx/                      # unscoped CLI alias package that forwards to @nativectx/ui
├── eslint.config.js                # one flat config for every package — see the rule-exception comments
├── .claude/skills/                 # the shipped skill docs (copied into dist/mcp/skills on build)
├── apps/storybook/                 # Component stories
│   └── components/<Name>/<Name>.stories.tsx
└── apps/demo/                      # Demo / docs app
    └── src/
        ├── app/explore/            # One .tsx per component doc page
        ├── components/             # docs-page.tsx, demo-section.tsx, props-table.tsx, docs-pagination.tsx
        └── config/nav.ts           # NAV_SECTIONS + NAV_PAGES — sidebar and pagination source of truth
```

`ui/tsconfig.json` includes `mcp/`, so `pnpm typecheck` covers the MCP server as
well as the component source. `ui/tsconfig.build.json` is the narrower config
that produces the published `dist/`.

---

## Key Files

| Purpose | Path |
|---------|------|
| Public exports | `ui/index.ts` |
| Component barrel the manifest reads | `ui/components/index.ts` |
| Theme tokens + types | `ui/theme/theme-config.ts` |
| Brand config | `ui/brand/brand-config.ts` |
| Manifest extractor + drift guard | `ui/mcp/build-manifest.ts` |
| Skill install/prune logic | `ui/mcp/skills-command.ts` |
| Demo nav config | `apps/demo/src/config/nav.ts` |
| Native stack layout | `apps/demo/src/app/explore/_layout.native.tsx` |
| Lint config (whole workspace) | `eslint.config.js` |
| CI workflow | `.github/workflows/ci.yml` |

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Cannot find module '@nativectx/ui'` | Run `pnpm build` — demo, storybook and the typecheck consume from `dist/`, not source. Only `typecheck:packages` and a bare `expo start` skip that build |
| `Property 'tokens' does not exist` | Token added to the type but missing from `createLightTheme`, `createDarkTheme`, or `high-contrast-theme.ts` |
| `Component manifest is incomplete: …` | A component is exported but unregistered, or lost its props — see the error body, then `pnpm check:manifest` |
| `check:skills` flags a skill doc | The doc names a component or prop the manifest does not have — fix the doc, not the check |
| `check:examples` type error | A JSDoc `@example` block is not valid code against the real API |
| `get_theme_tokens` test failure | New token has no description in `ui/mcp/tools/get-theme-tokens.ts` |
| Component not themed in Storybook | Check the `withNativeCtxProvider` decorator in `apps/storybook/.storybook/decorators.tsx` — it wraps stories in `BrandProvider` + `ThemeContext.Provider` |
| expo-router error in Storybook | Use the Demo app — Storybook doesn't support expo-router |
| Type error in a platform-specific file | `.ios.tsx` and `.android.tsx` must export the identical public API |
