# Layout capabilities after the Key Lens audit

Status: proposal, not implemented. Based on the November 10, 2026 Key Lens
layout audit and the current Screen and AppTabs implementations.

The immediate web repairs (external navigation link styles and inset divider
containment) should ship independently. The capabilities below need native
validation before Key Lens removes its existing adapters. This document does
not establish native correctness or change component defaults.

## Navigation clearance

`ui/components/ui/screen.tsx` currently removes the bottom safe-area edge and
reserves 100 points on iOS or 24 elsewhere. Its comments still describe an
80-point iOS reserve and zero on Android. Key Lens compensates in `components/AppScreen.tsx` when its
iPad navigator has already allocated the bottom tab bar.

Introduce a navigation-layout context with explicit ownership:

- `allocated`: the navigator has already reduced the scene bounds. Screen adds
  ordinary content spacing, with no additional navigation reserve.
- `overlay`: the navigator reports its measured overlap with the scene. Screen
  adds that overlap once, plus ordinary content spacing.
- Outside navigation: consume the requested safe-area edges normally.

The overlap must specify whether it includes the safe-area inset; prefer a
single effective bottom overlap including that inset to avoid double counting.
Keep the context scoped to each scene. Overlays must use their own presentation
bounds instead of inheriting the scene's navigation reserve.

Expose ordinary bottom content spacing separately from clearance. Preserve
current behavior when no provider or explicit policy exists until a documented
migration can replace the fixed reserve. Test scrollable and non-scrollable
Screen composition, explicit edge exclusions, nested navigators, zero measured
height, and caller style overrides. Measurements must update on rotation and
window resizing without a frame that hides the final content row.

Acceptance requires iPhone, iPad portrait/landscape/Split View, Android gesture
and button navigation, and web captures. Check Compose's measured workspace,
Chart's final row, Remote pagination, Home and Settings. Remove Key Lens's
allocated-bar compensation only in a separate adoption change after validation.

## Explicit tab placement and scene retention

The native AppTabs implementation delegates to Expo Router NativeTabs. Key Lens
uses configurable JavaScript tabs on iPad to retain bottom placement and mounted
scenes. Library support should make that policy explicit rather than changing
navigators at a viewport breakpoint.

Propose an opt-in placement policy (system-adaptive or bottom) and documented
scene-retention options. Resolve policy by platform/device capability, preserving
navigator identity during rotation and Split View. If the native backend cannot
satisfy an explicit bottom policy, use a supported configurable-tab backend with
matching theme, route identity, accessibility labels and root header ownership.
Unsupported combinations must be documented rather than silently ignored.

Verify route links, back history, initial route, tab changes, editor state,
ongoing playback, hidden routes, focus events and mounted-scene behavior. Measure
bar clearance through the navigation-layout contract above. Compare Home and
project roots. Keep the default system-adaptive behavior unchanged.

## Adaptive overlays and bounded scrolling

Key Lens's `AdaptiveOverlay` and `ModalSheet` own presentation selection,
safe-area bounds, height caps, scroll regions and dismissal. A library primitive
should cover these responsibilities before the app replaces its implementation.

Define a presentation policy with automatic, dialog and sheet choices, an
explicit maximum content height, and header/body/footer slots. Bound the body
against the measured presentation viewport after safe areas and the keyboard;
only the body scrolls while header and actions remain reachable. Avoid nested
scroll views and preserve inner horizontal scrollers.

Specify backdrop, Escape, hardware Back, swipe and explicit-close behavior;
support a controlled open state and one dismissal callback per transition.
Restore trigger focus on web, contain keyboard focus while modal, expose the
title to assistive technology, and respect reduced motion. Native sheets should
use supported platform presentation rather than emulating native interaction.

Acceptance covers long and short content, keyboard entry, enlarged text, dark
mode, screen readers, narrow web, iPad Split View, repeated open/close and closed
overlay render behavior. Migrate one app overlay first, then the inventory;
desktop screenshots alone cannot validate the native presentation contract.

## Platform icon sources

AppTabs currently has SF symbols and Material icon names. Its native declaration
leaves `webIcon` untyped, while the web implementation supports `PlatformIcon`
or a string.
Key Lens additionally wraps native tabs for MaterialCommunityIcons vector
sources. Introduce typed, explicit platform sources with default/selected states
and a documented fallback order. Support SF symbols, Material symbols and vector
families without inferring a family from a name's spelling.

Preserve existing fields during migration. Resolve each source consistently in
native tabs, configurable tabs, web headers and drawers. Keep native-tab imports
deferred to preserve Metro module initialization. Check selected/unselected
icons, missing sources, tinting, label visibility and accessibility on all
backends before removing app wrappers.

## Delivery and evidence

Use separate implementation PRs for clearance, tab policy, overlays and icon
sources. Pair each library change with tests, examples and migration guidance;
follow with app adoption PRs that remove the corresponding workaround. The
clearance contract precedes tab fallback adoption. Icons can proceed separately;
overlay adoption does not depend on tab placement.

Every PR must identify the tested source tree, commands run, inspected captures,
interaction checks and unverified targets. Screenshot filename/dimension checks
are structural checks, not visual regression tests. A proposal or web-only
prototype is not an implemented native fix.
