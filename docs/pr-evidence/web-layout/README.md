# NativeCtx web tabs and divider layout regression

The real Expo Router demo was built and exported, then served by the browser
checker (no mocked Link or hand-applied CSS on the navigation). Run:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm build
pnpm --filter demo export:web
pnpm test:web-layout
```

The checker covers 390, 768, 900, 1024 and 1440px viewports. Desktop internal
and external items measure 63px high with 16px padding on each side. It asserts
hover color, pressed opacity, drag-off/release reset, keyboard Tab focus and Enter
activation, anchor href/target/rel, and a new external document with no opener.
External network requests are fulfilled locally; no third-party page behavior is
being tested. Mobile drawer screenshots wait for slide-in transforms and bounds
to settle; both internal navigation and external navigation are exercised.

Horizontal divider bounds are checked for none/start/middle insets in both
writing directions, including a normal HTML block parent. The RTL example sets
React Native Web's `dir` context as well as layout direction. The vertical demo
keeps its 32px height and hairline widths. `measurements.json` records the bounds.
A horizontal divider placed in a row needs an explicit consumer width, as stated
in the component documentation.

Additional checks passed: build, lint, package typechecks, manifest/skill/example
checks, and all 122 Jest tests (including divider inset/vertical/custom override
coverage). Screenshot files and dimensions alone are not visual regression
coverage. The foreman reviews the captured layouts independently.

This validation covers Chromium web in the demo. Native devices, dark mode and
enlarged text have not been validated for this change. The app's own responsive
integration is validated separately before adoption. No release, merge or deploy
is performed by this PR.
