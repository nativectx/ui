---
description: Use to discover what UI components @nativectx/ui provides. For detailed API, props, and examples see the demo explore section or ask about a specific component.
---

# NativeCtx UI Components

> Navigation components (AppTabs, Sidebar, ThemedStack, NativeHeader) are in the **nativectx-navigation** skill.

All components are imported from `'@nativectx/ui'`.

## Layout & Display

| Component | Description |
|-----------|-------------|
| `Screen` | Scrollable or static screen wrapper with safe area and edge handling |
| `Container` | Max-width centred content wrapper for responsive layouts |
| `ThemedView` | Themed surface with variant (`surface`, `card`, `surfaceContainer`, `appbar`, `primary`), elevation, and optional grid columns |
| `Typography` | M3 type scale — `display`, `headline`, `title`, `body`, `label` variants with weight and alignment props |
| `ThemedImage` | `lightSource` / `darkSource` image that swaps with the active colour scheme (wraps expo-image) |
| `Avatar` | Circular image or initials avatar with size variants |
| `Divider` | Horizontal or vertical rule; supports `inset` and `full` variants |

## Controls & Inputs

| Component | Description |
|-----------|-------------|
| `Button` | M3 button — `filled`, `tonal`, `outlined`, `text`, `elevated` variants; loading state; icon support |
| `Chip` | M3 chip — filter (toggleable + checkmark), action (with trailing icon); `filled` / `outlined` |
| `FAB` | Floating action button — `small`, `medium`, `large` sizes |
| `Switch` | Binary toggle — SwiftUI Toggle on iOS, Compose Switch on Android, RN Switch on web |
| `SegmentedControl` | Mutually exclusive selector — SwiftUI Picker (segmented) on iOS, Compose SingleChoiceSegmentedButtonRow on Android |
| `ThemedTextInput` | M3 text field — `filled` / `outlined`; label, helper text, error, leading/trailing icons |
| `Slider` | Range slider — SwiftUI Slider on iOS, Compose Slider on Android |

## Content & Feedback

| Component | Description |
|-----------|-------------|
| `List` | Themed scrollable list container |
| `ListItem` | List row with `leading`, `trailing`, `title`, `subtitle` slots; pressable with ripple |
| `Collapsible` | Animated expand/collapse section with customisable header |
| `Modal` | Bottom sheet / centre dialog with backdrop, configurable height |
| `ProgressIndicator` | Linear or circular progress — SwiftUI ProgressView on iOS, Compose indicators on Android; determinate and indeterminate |
