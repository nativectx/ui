import { View } from 'react-native';
import { Typography } from '@nativectx/ui';
import { DocsPage } from '../../components/docs-page';
import { DocsPagination } from '../../components/docs-pagination';
import { CodeBlock } from '../../components/code-block';

export default function NavOverviewPage() {
  return (
    <DocsPage
      title="Navigation"
      description="@nativectx/ui builds on expo-router's file-based routing with platform-adaptive components. Pick the pattern that fits your app's depth."
    >
      <View style={{ gap: 24 }}>
        <Typography variant="titleLarge" weight="bold">Choose a pattern</Typography>

        <View style={{ gap: 8 }}>
          <Typography variant="titleMedium" weight="medium">1 — Flat tabs</Typography>
          <Typography variant="bodyMedium" muted>
            Simple apps with no push navigation. Each tab is a self-contained screen.
            Use when tabs don&apos;t need headers or sub-screens.
          </Typography>
          <CodeBlock variant="code" language="text" code={`app/
  _layout.tsx      ← NativeCtxProvider + AppTabs
  index.tsx        ← Home tab
  settings.tsx     ← Settings tab`} />
        </View>

        <View style={{ gap: 8 }}>
          <Typography variant="titleMedium" weight="medium">2 — Tabs + sidebar</Typography>
          <Typography variant="bodyMedium" muted>
            Most production apps. Native tab bar on mobile with a hamburger menu for secondary navigation.
            Persistent sidebar on web desktop.
          </Typography>
          <CodeBlock variant="code" language="text" code={`app/
  _layout.tsx      ← NativeCtxProvider + AppTabs + Sidebar
  index.tsx
  explore.tsx`} />
        </View>

        <View style={{ gap: 8 }}>
          <Typography variant="titleMedium" weight="medium">3 — Tabs + nested Stack</Typography>
          <Typography variant="bodyMedium" muted>
            When a tab needs push navigation (list → detail) or native header buttons via NativeHeader.
            Each tab folder gets its own ThemedStack.
          </Typography>
          <CodeBlock variant="code" language="text" code={`app/
  _layout.tsx                  ← NativeCtxProvider + AppTabs
  items/
    _layout.native.tsx         ← ThemedStack (iOS + Android)
    _layout.tsx                ← Slot (web fallback — required)
    index.tsx                  ← List screen + NativeHeader
    [id].tsx                   ← Detail push screen
  settings.tsx                 ← Flat tab (no Stack needed)`} />
        </View>
      </View>

      <DocsPagination />
    </DocsPage>
  );
}
