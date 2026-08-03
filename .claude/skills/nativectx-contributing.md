---
description: Use when adding or changing a component in the @nativectx/ui library itself — component file, barrel export, manifest JSDoc, platform splits, Storybook story, demo page, skill docs, and the verification commands that must pass before opening a PR
---

# NativeCtx UI Contributing Guide — Adding a New Component

**Context:** the end-to-end procedure for adding a UI component to the `@nativectx/ui` package. Every path here is relative to the repo root. Run every command from the repo root.

This package ships an MCP server and a set of Claude Skills, so a component is not "added" when it renders — it is added when the MCP manifest, the skill docs, and the JSDoc examples all describe it correctly. `pnpm check` is what enforces that, and CI runs it on every PR.

---

## Complete Checklist

For a component named `Chip` (adjust names throughout):

- [ ] 1. Theme tokens → `ui/theme/theme-config.ts` (+ `ui/theme/high-contrast-theme.ts`)
- [ ] 2. Component file → `ui/components/ui/chip.tsx` (plus platform siblings if needed)
- [ ] 3. JSDoc the extractor reads → description + `@category` + `@example` on the **component declaration**, `@default` / `@platform` per prop
- [ ] 4. Barrel export → `ui/components/ui/index.ts`  *(this is the registration — there is no list to edit)*
- [ ] 5. Rebuild the manifest → `pnpm check:manifest`
- [ ] 6. Storybook story → `apps/storybook/components/Chip/Chip.stories.tsx`
- [ ] 7. Demo page → `apps/demo/src/app/explore/chip.tsx`
- [ ] 8. Nav config → `apps/demo/src/config/nav.ts`
- [ ] 9. Native stack screen → `apps/demo/src/app/explore/_layout.native.tsx`
- [ ] 10. Skill docs → `.claude/skills/nativectx-components.md` (and `-navigation` / `-theme` if relevant)
- [ ] 11. Verify → `pnpm verify`

> `ui/index.ts` does `export * from './components'`, and `ui/components/index.ts` does `export * from './ui'` and `export * from './navigation'`. So step 4 is the only barrel edit — never add the component to `ui/index.ts` by hand.

---

## Step 1 — Theme Tokens

Add a token block to the `ThemeTokens` type in `ui/theme/theme-config.ts`:

```ts
// In ThemeTokens type
chip: {
  filledBg: string;
  filledText: string;
  outlinedBorder: string;
  outlinedText: string;
  selectedBg: string;
  selectedText: string;
  disabledBg: string;
  disabledText: string;
  disabledBorder: string;
};
```

Then populate it in **all four** theme builders — `createLightTheme(brand)` and `createDarkTheme(brand)` in `ui/theme/theme-config.ts`, and both builders in `ui/theme/high-contrast-theme.ts`:

```ts
chip: {
  filledBg: c.secondaryContainer,
  filledText: c.onSecondaryContainer,
  outlinedBorder: c.outline,
  outlinedText: c.onSurface,
  selectedBg: c.secondaryContainer,
  selectedText: c.onSecondaryContainer,
  disabledBg: c.surfaceContainerLow,
  disabledText: c.onSurfaceVariant,
  disabledBorder: c.outlineVariant ?? c.outline,
},
```

A token in the type but missing from a builder is a typecheck failure. A token added to the builders is also asserted against the MCP `get_theme_tokens` tool by `ui/mcp/mcp-tools.test.ts` — if `pnpm test` reports an undocumented token, add its description in `ui/mcp/tools/get-theme-tokens.ts`.

Key palette names (M3 naming — see `ui/theme/theme-config.ts` for the full list): `primary`, `onPrimary`, `primaryContainer`, `onPrimaryContainer`, `secondaryContainer`, `onSecondaryContainer`, `surface`, `onSurface`, `onSurfaceVariant`, `surfaceContainerLow/High/Highest`, `outline`, `outlineVariant`.

---

## Step 2 — Component File

**Where files go**

| Kind | Directory | Example |
|---|---|---|
| UI component | `ui/components/ui/` | `ui/components/ui/chip.tsx` |
| Navigation component | `ui/components/navigation/` | `ui/components/navigation/themed-stack.tsx` |
| Navigation component with parts | `ui/components/navigation/<name>/` + local `index.ts` | `ui/components/navigation/sidebar/sidebar-item.tsx` |
| Shared prop base types | `ui/components/shared/types.ts` | `InteractiveComponentProps` |
| Shared helpers | `ui/components/shared/utils.ts` | `blurOnWeb`, `platformShadow` |

Filenames are kebab-case; the exported component is PascalCase. The two do not have to match (`text-input.tsx` exports `ThemedTextInput`) — the manifest maps file → name explicitly in step 5.

**File layout** (follow the numbered-section convention every existing component uses):

```tsx
// 1. IMPORTS
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Typography } from './typography';
import { useTheme } from '../../theme';
import { blurOnWeb } from '../shared/utils';
import type { InteractiveComponentProps } from '../shared/types';

// 2. TYPES
export type ChipVariant = 'filled' | 'outlined';
export const ChipVariants = ['filled', 'outlined'] as const;

export interface ChipProps extends InteractiveComponentProps {
  label: string;
  variant?: ChipVariant;
  selected?: boolean;
}

// 3. COMPONENT
const Chip = ({ label, variant = 'outlined', ...rest }: ChipProps) => {
  const theme = useTheme();
  const t = theme.tokens.chip;
  // ...
};

Chip.displayName = 'Chip';

// 4. STYLES
const styles = StyleSheet.create({ /* ... */ });

// 5. EXPORTS
export { Chip };
```

### Naming rules the manifest extractor depends on

These are not style preferences — `ui/mcp/build-manifest.ts` finds things by name, and the build fails if it can't:

- **Props interface must be `<ComponentName>Props`**, exported. `ChipProps`, `ThemedTextInputProps`, `FABProps`. If no props are extracted, the manifest build fails with `No props extracted for: ...`.
- **Variant union must be `<ComponentName>Variant`**, a type alias of string literals: `export type ChipVariant = 'filled' | 'outlined';`. The extractor reads the literals off the *source text* of that alias, so an alias pointing at an imported union yields no variants.
- **Also export a `<ComponentName>Variants` const array** (`['filled', 'outlined'] as const`) — Storybook controls and demo pages consume it. It is a value, not a component, so the manifest correctly ignores it.
- **Extend the first-party base types** rather than redeclaring `disabled` / `onPress` / `testID`. The extractor expands heritage across first-party interfaces only, so inherited props reach the manifest, while React Native's `ViewProps` (100+ props) is deliberately not expanded.

### Shared base types (`ui/components/shared/types.ts`)

```ts
BaseComponentProps          // testID, style
InteractiveComponentProps   // + disabled, onPress, accessibilityLabel, accessibilityHint, accessibilityRole
LoadableComponentProps      // + loading
ContainerComponentProps     // children, contentStyle
```

### Standard patterns

- Use `useTheme()` — never hardcode colors or spacing.
- Call `blurOnWeb(e)` inside `onPress` on every `Pressable` with a visual focus state, so the web focus ring does not linger after a mouse click:
  ```tsx
  onPress={disabled ? undefined : (e) => { blurOnWeb(e); onPress?.(e); }}
  ```
- **Touch target vs visual size.** For components under 48dp, put the visuals on an inner `View` and extend the touch target with `hitSlop` on a transparent `Pressable`. Never put `minHeight: 48` on the element that carries the background — the component then looks 48dp tall.
  ```tsx
  <Pressable style={styles.pressable} hitSlop={8} onPress={handlePress}>
    <View style={[styles.chip, { backgroundColor: bg }]}>{content}</View>
  </Pressable>
  ```
- Shape: `theme.borderRadius.sm` for chips/inputs, `theme.shape.surfaceBorderRadius` for cards/surfaces, `theme.borderRadius.full` for pills.
- `android_ripple` on the Pressable for Android press feedback; hover/focus via `useState` + `onHoverIn`/`onHoverOut`/`onFocus`/`onBlur`.
- `accessibilityRole="button"` and `accessibilityState={{ disabled, selected }}` where applicable.
- Optional peer dependencies (`@react-native-community/slider`, `expo-image`, …) are `require`d in a `try/catch` and throw a named install hint when missing — see `ui/components/ui/slider.tsx`.

---

## Step 3 — JSDoc the manifest extractor reads

The MCP `get_component`, `list_components`, and `search_components` tools serve **only** what `ui/mcp/build-manifest.ts` extracts. Undocumented props ship as an undocumented API.

The manifest reads **two** JSDoc locations: the block on the **component declaration** carries the component's own metadata, and one JSDoc line per prop on the `<Name>Props` interface carries the prop docs.

```tsx
export interface ChipProps extends InteractiveComponentProps {
  /** Chip label text */
  label: string;
  /** Visual style. @default 'outlined' */
  variant?: ChipVariant;
  /** Whether the chip renders in its selected state. @default false */
  selected?: boolean;
  /** Native-only press feedback color. @platform ios,android */
  rippleColor?: string;
}

/**
 * Compact action or filter chip with optional icon and selection state.
 *
 * @category controls
 *
 * @example
 * ```tsx
 * <Chip label="Filter" />
 * ```
 *
 * @example
 * ```tsx
 * <Chip label="Selected" variant="filled" selected onPress={() => {}} />
 * ```
 */
const Chip = ({ label, variant = 'outlined', ...rest }: ChipProps) => {
```

The component block must sit on the **declaration** — the `const`/`function`/`class` statement, not the props interface. For a component whose entry file is a pure re-export (`sidebar.tsx` → `./sidebar.web`), put it on the real declaration in the variant file; the extractor falls back across the component's other files to find it.

| Where | Tag | Becomes |
|---|---|---|
| Component declaration JSDoc | free-text **first paragraph** | the component `description` in the manifest. Later paragraphs stay in source — use them for M3 spec links and platform notes without leaking into the manifest. |
| Component declaration JSDoc | `@category` | manifest `category` — one of `layout`, `display`, `controls`, `input`, `feedback`, `collections`, `navigation`. This closed vocabulary is what `list_components("controls")` filters on; an unknown value fails the build rather than silently opening a new bucket. |
| Component declaration JSDoc | `@example` (repeatable) | the examples `get_component` returns — **compile-checked**, see below |
| Each prop | free-text | the prop description |
| Each prop | `@default` | the documented default — must match the actual destructuring default |
| Each prop | `@platform` | platform tag, e.g. `ios,android` for a prop that is a no-op on web |

Category and description live in source, next to the code they describe, precisely so they cannot drift from it. Do not add a component's prose to a skill doc or to a table somewhere — put it here and let the manifest carry it.

### `@example` blocks are compiled

`pnpm check:examples` (`ui/mcp/check-examples.ts`) reads the examples back out of the manifest, writes each one into a throwaway `.tsx` fixture that imports the component **from source**, and type-checks it with the TypeScript compiler API. An example is production documentation and must be real, working code:

- Complete JSX using only props that exist, with correct types. A wrong prop name, a wrong prop type, a missing required prop, or a variant string that is not in the union all fail (TS2322/TS2769/TS2741).
- A JSX tag must be a real export. `<Buton />` or a component you deleted fails — component tags are never auto-stubbed.
- Free *value* identifiers are tolerated: `<Button onPress={save} />` compiles because the checker declares `save` as `any` after the compiler tells it which names are unbound. Use that for handlers and state, not as a licence for pseudo-code.
- No `...`, no `// etc.`, no invented props. Multiple scenarios → multiple `@example` blocks, not one block with prose between the snippets.

If an example fails, the check reports the component, the example line, and the TS diagnostic. Fix the example (or the component) — never delete the example to make the check pass. To iterate on one component:

```bash
pnpm --filter @nativectx/ui exec tsx mcp/check-examples.ts --filter Chip
```

---

## Step 4 — Barrel Export

Add to `ui/components/ui/index.ts` (or `ui/components/navigation/index.ts`, or the component folder's own `index.ts`, which the parent barrel re-exports):

```ts
// Chip
export { Chip } from './chip';
export type { ChipProps, ChipVariant } from './chip';
export { ChipVariants } from './chip';
```

`ui/components/index.ts` is the package's public statement of what it ships, and the manifest reads it directly: **any capitalised export whose type has a call signature returning `ReactNode` / `ReactElement` / `JSX.Element` is treated as a component**, and the manifest build fails if it has no entry in the manifest metadata. That is deliberate — you cannot export a component and forget to document it. If something you export trips this check without being a component, fix the export shape rather than the check.

---

## Step 5 — Rebuild the manifest (no registration needed)

**There is no registry to edit.** The extractor discovers components by walking the barrel exports and resolving each to its declaration site, then reads the `@category` block from that file. Steps 2–4 are the whole registration: write the file, document the declaration, export it.

`platforms`, `files`, and `dependencies` are all **derived** — platform support from which `.ios`/`.android`/`.web`/`.native` siblings exist, and dependencies from the imports, re-exports, and `require()` calls across every one of a component's files. Never hand-declare any of them; there is nowhere to.

```bash
pnpm check:manifest    # ~1s — rebuilds ui/dist/mcp/component-manifest.json and asserts it is complete
```

Its guard fails loudly, with the fix in the message, on: an exported component with no `@category` or no description, a documented component missing from the barrel, a `@category` outside the closed vocabulary, a component whose props came out empty, a props interface extending a first-party base but inheriting nothing from it, and a component importing a package that `ui/package.json` does not declare.

---

## Step 6 — Storybook Story

File: `apps/storybook/components/Chip/Chip.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, ChipVariants } from '@nativectx/ui';

const meta = {
  title: 'Components/Chip',
  component: Chip,
  args: { label: 'Chip', variant: 'outlined', selected: false, disabled: false },
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'select', options: ChipVariants as unknown as string[] },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onPress: { action: 'pressed' },
  },
  decorators: [(Story: any) => <View style={styles.container}><Story /></View>],
} as unknown as Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive playground — every prop wired to the controls panel
export const Playground: Story = {};

// Static gallery — variants side by side
export const Variants: Story = {
  render: () => (
    <View style={styles.row}>
      <Chip label="Outlined" variant="outlined" />
      <Chip label="Filled" variant="filled" />
    </View>
  ),
};

export const States: Story = {
  render: () => (
    <View style={styles.row}>
      <Chip label="Default" />
      <Chip label="Selected" selected />
      <Chip label="Disabled" disabled />
    </View>
  ),
};

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8 },
});
```

Rules: always a `Playground` story and at least one static gallery story; `as unknown as Meta<typeof Component>` is a required workaround for RN Storybook's types; import from `'@nativectx/ui'`.

---

## Step 7 — Demo Page

File: `apps/demo/src/app/explore/chip.tsx`

```tsx
import React from 'react';
import { View } from 'react-native';
import { Chip, Typography } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { PropsTable, type PropDefinition } from '../../components/props-table';
import { DocsPage } from '../../components/docs-page';

const chipProps: PropDefinition[] = [
  { name: 'label', type: 'string', description: 'Chip label text' },
  { name: 'variant', type: "'filled' | 'outlined'", default: "'outlined'", description: 'Visual style' },
];

export default function ChipPage() {
  return (
    <DocsPage title="Chip" description="Compact action or filter chip.">
      <DemoSection title="Variants" description="..." code={`<Chip label="Outlined" />`}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="Outlined" />
          <Chip label="Filled" variant="filled" />
        </View>
      </DemoSection>

      <Typography variant="titleLarge" weight="medium">Props</Typography>
      <PropsTable props={chipProps} />
      <DocsPagination />
    </DocsPage>
  );
}
```

`DocsPage` wires the NativeHeader sidebar toggle, `Screen`, and scrolling for you. Other available blocks: `demo-section.tsx`, `api-section.tsx`, `callout.tsx`, `code-block.tsx`, `props-table.tsx`.

---

## Step 8 — Nav Config

Add an item to the `Components` section of `NAV_SECTIONS` in `apps/demo/src/config/nav.ts`:

```ts
{ label: 'Chip', route: '/explore/chip' },
```

`NAV_PAGES` derives from it, so the sidebar and `DocsPagination` prev/next both update from this one edit.

---

## Step 9 — Native Stack Screen

Add to `apps/demo/src/app/explore/_layout.native.tsx` inside `<ThemedStack>`:

```tsx
<Stack.Screen name="chip" options={{ title: 'Chip' }} />
```

> `_layout.native.tsx` covers both iOS and Android. There is no `_layout.ios.tsx`.

---

## Platform-suffixed files

Metro resolves `.ios.tsx` / `.android.tsx` / `.native.tsx` / `.web.tsx` before the plain `.tsx`. TypeScript does not — it only ever sees the plain module path — so there must always be an un-suffixed entry file. Two working patterns:

**A. Plain file is the real fallback** (`ui/components/ui/slider.tsx`, `switch.tsx`, `segmented-control.tsx`, `progress-indicator.tsx`)

```
slider.tsx           ← cross-platform / web implementation + SliderProps  ← manifest entry
slider.ios.tsx       ← native iOS override
slider.android.tsx   ← native Android override
```

**B. Plain file is a re-export shim** (`ui/components/navigation/sidebar/sidebar.tsx`, `app-tabs/app-tabs.tsx`)

```tsx
// sidebar.tsx — TypeScript compiles against this; Metro picks .web/.native at runtime
export { Sidebar, type SidebarProps } from './sidebar.web';
```

```
sidebar.tsx          ← re-export shim  ← manifest entry
sidebar.web.tsx      ← web implementation, declares SidebarProps
sidebar.native.tsx   ← iOS + Android implementation
```

Rules for either pattern:

- **Every platform variant must export the identical public API** — same component name, same props interface name, same prop set. A prop that exists on only one platform stays in the shared interface and is tagged `@platform ios,android` in its JSDoc.
- **Export from the un-suffixed entry.** The extractor resolves the barrel export to its declaration, following the re-export shim to wherever `<Name>Props` and the `@category` block really live.
- **Declare the props interface once**, in whichever file owns the implementation, and re-export the type from the others. Two divergent copies is how platforms silently drift apart.
- Use `.native.tsx` when iOS and Android share an implementation that differs from web; use `.ios.tsx` + `.android.tsx` only when the two natives genuinely differ.
- **Platform support is derived from the files on disk, never declared.** Adding `divider.web.tsx` updates the manifest on the next build with no other edit. A component keeps full `ios, android, web` support as long as it has an un-suffixed base file — which today every component does, since TypeScript needs one for the barrel's `export … from './x'` to resolve. Support narrows only for a variant-only component with no base file.

---

## Skill docs to update

The `.claude/skills/*.md` files are shipped inside the package and installed into user projects by `nativectx skills`. `pnpm check:skills` validates them against the manifest, so a stale skill fails CI.

| File | When to touch it | What to add |
|---|---|---|
| `nativectx-components.md` | **every new component** | Its name in the correct row of the Inventory table, and the exported-component count in the `get_component` section. Add a row to "Choosing between overlapping components" if it competes with an existing one, and remove it from "Not in this library" if it was listed there. |
| `nativectx-navigation.md` | navigation components only | Usage patterns, platform behaviour, layout wiring |
| `nativectx-theme.md` | new theme tokens | Token group and what it drives |
| `nativectx-mcp.md` | only if MCP tools/resources change | — |
| `nativectx-setup.md` / `-migration.md` | only if install or upgrade steps change | — |
| `nativectx-dev.md` / `nativectx-contributing.md` | only if the repo workflow changes | These two are contributor-only (`CONTRIBUTOR_SKILLS` in `ui/mcp/skills-command.ts`) and install behind `nativectx skills --contributor` |

**Do not put prop tables, types, or defaults in a skill doc.** Prop-level detail is served live by `get_component` from the manifest; duplicating it in markdown is exactly the drift `pnpm check:skills` exists to catch. Skills teach patterns and composition; the MCP answers lookups.

Adding, renaming, or removing a skill file also means updating the `PACKAGE_SKILLS` fixture in `ui/mcp/skills-command.test.ts`.

---

## Step 11 — Verify before opening a PR

From the repo root:

```bash
pnpm verify
```

That is exactly what CI runs, in CI's order, and takes under 20 seconds:

```bash
pnpm build        # compile @nativectx/ui to dist/ — required first: apps and the checks read dist/
pnpm check        # AI-facing sync suite: manifest → skills → @example blocks
pnpm lint         # ESLint over ui/, apps/demo and apps/storybook at --max-warnings 0
pnpm typecheck    # tsc --noEmit across every workspace (includes ui/mcp)
pnpm test         # Jest: theme, MCP tool drift guards, skills CLI planning
```

Run one of those directly to rerun just the step that failed. Note `pnpm typecheck`
builds first; `pnpm typecheck:packages` is the bare tsc pass for when `dist/` is
already current, and is what `verify` calls so the build only happens once.

`pnpm check` runs three checks in order; each is separately callable, so rerun only the one that failed:

```bash
pnpm check:manifest   # rebuild ui/dist/mcp/component-manifest.json and assert it is complete (~1s)
pnpm check:skills     # assert .claude/skills/*.md agree with the manifest
pnpm check:examples   # compile every JSDoc @example block
```

CI (`.github/workflows/ci.yml`) runs `pnpm check` on every PR, right after the package build and before lint/typecheck/test, so drift fails fast and with an obvious step name. The pre-commit hook is scoped by path through lint-staged: a commit touching `*.{ts,tsx}` runs `eslint --fix --max-warnings 0` then `pnpm typecheck`, and one touching `.claude/skills/*.md` runs `check:manifest && check:skills`.

`pnpm build` is not optional before the rest: `apps/demo`, `apps/storybook`, and the `nativectx` CLI wrapper all resolve `@nativectx/ui` through the compiled `dist/`, and the manifest the checks read is emitted into `ui/dist/mcp/`.

### Failure → fix

| Failure | Fix |
|---|---|
| `Exported from components/index.ts but not documented in source` | Step 3 — add the JSDoc block with `@category` and a description to the component's **declaration** |
| `Documented with @category but not exported from components/index.ts` | Step 4 — you wrote and documented it but forgot the barrel line |
| `Exported and documented, yet missing from the manifest` | The declaration resolved but extraction dropped it — do not silence this; it means the extractor is wrong |
| `No source file on disk for: X` | The barrel exports a path that no longer exists |
| `No supported platform derived for: X` | No base file and no recognised `.ios`/`.android`/`.web`/`.native` sibling — check the filenames |
| `@category X is not one of: …` | Use the closed vocabulary: `layout`, `display`, `controls`, `input`, `feedback`, `collections`, `navigation` |
| `Imported at runtime but not declared in ui/package.json` | Add the package to `peerDependencies` (+ `peerDependenciesMeta` if optional) — a real packaging bug, not a check to appease |
| `No props extracted for: X` | The `<Name>Props` interface is missing, misnamed, or not exported |
| `Inherited props were dropped for: X` | The props interface extends a first-party base but nothing came through — check the `extends` clause resolves; do not silence it |
| `check:skills` reports an unknown component/prop | A skill doc names something the manifest does not have — fix the doc, or finish wiring the component |
| `check:examples` type error | The `@example` block is not valid code against the real API — fix the example |
| `Cannot find module '@nativectx/ui'` | Run `pnpm build`; the apps consume `dist/`, not source |
| `Property 'tokens.x' does not exist` | Token added to the type but missing from `createLightTheme`, `createDarkTheme`, or `high-contrast-theme.ts` |
