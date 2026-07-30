---
description: Use when choosing which @nativectx/ui component to reach for, how components compose, or what the library does and does not ship. For exact props on a named component, call the MCP `get_component` tool.
---

# NativeCtx UI Components

> Navigation components (`AppTabs`, `Sidebar`, `ThemedStack`, `NativeHeader`) have their own skill — **nativectx-navigation**. Theme hooks and tokens are in **nativectx-theme**.

Everything is imported from `'@nativectx/ui'` — one flat barrel, no subpath imports:

```tsx
import { Screen, Container, Typography, Button } from '@nativectx/ui';
```

---

## Looking up props

Prop-level detail is not written down here on purpose — it drifts. Get it live:

| Need | Call |
|---|---|
| Exact props, types, defaults, platform tags for a named component | `get_component("Button")` |
| "What should I use for X?" when you don't know the name | `search_components("expandable section")` |
| Full current inventory with descriptions and variants | `list_components()` / `list_components("controls")` |

### Where the manifest is blind

`get_component` reads the `<Name>Props` interface declared in the component's own file, and only its **own** properties. Three consequences worth knowing, because a prop being absent from the tool output does not mean it doesn't exist:

**1. Inherited props are never listed.** Most interactive components extend a shared base. These are always available even though `get_component` won't show them:

```
BaseComponentProps         testID, style
InteractiveComponentProps  + disabled, onPress,
                             accessibilityLabel, accessibilityHint, accessibilityRole
LoadableComponentProps     + loading
```

So `Button` accepts `disabled` and `loading`; `Chip` and `ListItem` accept `onPress` and `disabled`; `Container` accepts everything `ThemedView` does. Components wrapping an RN primitive (`Typography`, `ThemedTextInput`, `ThemedImage`, `Collapsible`) also pass through that primitive's props.

**2. Two components report zero props.**

- `Sidebar` — props live in `sidebar.web.tsx` / `sidebar.native.tsx`; `sidebar.tsx` only re-exports. See **nativectx-navigation** for `anchor` and `avoidAppBar`.
- `ThemedStack` — takes expo-router `Stack` props directly. See **nativectx-navigation**.

**3. `IconButton` is missing entirely.** It is exported from the package but absent from the manifest — read the source if you need its props.

---

## Inventory

Names only — descriptions live in the manifest so they can't go stale here.

| Group | Components |
|---|---|
| **Layout** | `Screen`, `Container`, `ThemedView`, `Divider` |
| **Display** | `Typography`, `Avatar`, `ThemedImage` |
| **Controls** | `Button`, `IconButton`, `Chip`, `FAB`, `Switch`, `SegmentedControl`, `Slider` |
| **Input** | `ThemedTextInput` |
| **Collections** | `List`, `ListItem` |
| **Feedback** | `Modal`, `ProgressIndicator`, `Collapsible` |
| **Navigation** | `AppTabs`, `Sidebar`, `SidebarItem`, `SidebarSection`, `SidebarHeader`, `SidebarFooter`, `ThemedStack`, `NativeHeader`, `Drawer` |

---

## Composition rules

**Screen → Container → content.** This is the standard screen skeleton. `Screen` owns the safe area and scrolling; `Container` owns max-width centring for wide viewports. Putting content straight into `Screen` will run edge-to-edge on desktop web.

```tsx
<Screen variant="background" edges={['top', 'bottom']}>
  <Container>
    <Typography variant="headlineMedium">Title</Typography>
  </Container>
</Screen>
```

- **One `Screen` per screen file.** Never nest `Screen` inside `Screen` — you get doubled safe-area padding.
- **`Screen` handles scrolling** via `scrollable`. Don't wrap it in your own `ScrollView`, and don't put a `FlatList` inside a scrollable `Screen` (nested VirtualizedList warning) — use `scrollable={false}` and let the list scroll.
- **`ThemedView` is the surface primitive.** `Screen`'s `variant` and `ThemedView`'s `variant` accept the same values; reach for `ThemedView` when you need a card or panel *inside* a screen.
- **`List` is a container, not a virtualiser.** It's a themed wrapper for `ListItem` rows. For long or dynamic data use RN's `FlatList` and render `ListItem` as the row.

---

## Choosing between overlapping components

| Situation | Use | Not |
|---|---|---|
| Primary action in page flow | `Button` | `FAB` — reserve for the one screen-level action |
| Icon-only tap target | `IconButton` | `Button` with only an icon |
| Toggle one boolean setting | `Switch` | `Chip` |
| Pick one of 2–5 known options | `SegmentedControl` | a row of `Chip`s |
| Multi-select / removable filters | `Chip` (filter variant) | `SegmentedControl` |
| Any text on screen | `Typography` with an M3 variant | bare RN `<Text>` — loses theme + type scale |
| Themed box / card / panel | `ThemedView` | RN `<View>` with a hardcoded `backgroundColor` |
| Image that differs per colour scheme | `ThemedImage` (`lightSource`/`darkSource`) | conditional `<Image source>` on `isDark` |
| Show/hide a block inline | `Collapsible` | conditional render (loses the animation) |
| Show/hide a block over the screen | `Modal` | `Collapsible` |

---

## Not in this library

Do not import these from `@nativectx/ui` — they do not exist. Build them from the primitives instead:

| Wanted | Build it as |
|---|---|
| `Card` | `ThemedView variant="card"` |
| `Badge` / `Pill` | `ThemedView` + `Typography variant="labelSmall"` |
| `Tooltip`, `Popover`, `Snackbar`, `Toast` | not shipped — use a community package |
| `Table`, `DataGrid` | `List` + `ListItem`, or RN `FlatList` |
| `Checkbox`, `Radio` | `Switch` or `SegmentedControl`, or a community package |
| `DatePicker` | not shipped — `@expo/ui` or a community package |

If a component seems missing, confirm with `list_components()` before concluding it was removed — do not invent an import.
