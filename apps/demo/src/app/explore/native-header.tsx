import React from 'react';
import { View } from 'react-native';
import { Typography, ThemedView, useTheme } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { PropsTable, type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const nativeHeaderProps: PropDefinition[] = [
  {
    name: 'rightIcon',
    type: 'string',
    description: 'SF Symbol name for the right toolbar button (iOS only)',
  },
  {
    name: 'onRightPress',
    type: '() => void',
    description: 'Press handler for the right button',
  },
  {
    name: 'leftIcon',
    type: 'string',
    description: 'SF Symbol name for the left toolbar button (iOS only)',
  },
  {
    name: 'onLeftPress',
    type: '() => void',
    description: 'Press handler for the left button',
  },
  {
    name: 'androidRightIcon',
    type: 'string',
    description: 'Feather icon name for the right header button (Android only)',
  },
  {
    name: 'androidLeftIcon',
    type: 'string',
    description: 'Feather icon name for the left header button (Android only)',
  },
];

export default function NativeHeaderPage() {
  const { spacing } = useTheme();

  return (
    <DocsPage
      title="NativeHeader"
      description="Screen-level header buttons for iOS (SF Symbols via Stack.Toolbar) and Android (Feather icons via headerLeft/headerRight). Renders nothing on web."
    >
      <DemoSection
        title="Sidebar Toggle"
        description="The most common use case — opening a sidebar or drawer from the header."
        code={`// Inside your screen component
import { NativeHeader, useSidebar } from '@nativectx/ui';

export default function MyScreen() {
  const { open } = useSidebar();

  return (
    <>
      <NativeHeader
        rightIcon="sidebar.left"     // iOS SF Symbol
        onRightPress={open}
        androidRightIcon="menu"      // Android Feather icon
      />
      {/* screen content */}
    </>
  );
}`}
      >
        <View style={{ gap: spacing.md }}>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">iOS</Typography>
            <Typography variant="bodySmall" muted>
              Uses Stack.Toolbar and Stack.Toolbar.Button with native SF Symbol icons rendered by UIKit.
            </Typography>
          </ThemedView>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">Android</Typography>
            <Typography variant="bodySmall" muted>
              Uses Stack.Screen with headerLeft/headerRight options, rendering Feather icons via Pressable.
            </Typography>
          </ThemedView>
        </View>
      </DemoSection>

      <DemoSection
        title="Left and Right Buttons"
        description="Both sides can have buttons independently."
        code={`<NativeHeader
  leftIcon="chevron-left"        // iOS SF Symbol
  onLeftPress={goBack}
  rightIcon="square.and.arrow.up" // iOS SF Symbol
  onRightPress={share}
  androidLeftIcon="arrow-left"   // Android Feather icon
  androidRightIcon="share"       // Android Feather icon
/>`}
      >
        <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
          <Typography variant="labelLarge" weight="medium">Placement</Typography>
          <Typography variant="bodySmall" muted>
            On Android, androidLeftIcon renders in headerLeft alongside the system back button area.
            Use androidRightIcon to avoid conflicts with the back button.
          </Typography>
        </ThemedView>
      </DemoSection>

      <DemoSection
        title="Via DocsPage"
        description="The DocsPage wrapper handles NativeHeader automatically with sidebar toggle pre-wired."
        code={`import { DocsPage } from '../components/docs-page';

export default function MyPage() {
  return (
    <DocsPage title="My Page" description="Page description.">
      {/* NativeHeader with sidebar toggle is included automatically */}
      {/* Title is hidden on Android since the stack header shows it */}
    </DocsPage>
  );
}`}
      >
        <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
          <Typography variant="labelLarge" weight="medium">Use DocsPage for doc screens</Typography>
          <Typography variant="bodySmall" muted>
            DocsPage wraps NativeHeader + Screen and hides the title block on Android since
            the stack header already shows it.
          </Typography>
        </ThemedView>
      </DemoSection>

      <DemoSection
        title="Platform Behaviour"
        description="NativeHeader is a no-op on web — safe to include unconditionally."
        code={`// This is safe on all platforms:
<NativeHeader
  rightIcon="sidebar.left"
  onRightPress={open}
  androidRightIcon="menu"
/>
// iOS  → renders Stack.Toolbar button with SF Symbol
// Android → renders headerRight Pressable with Feather icon
// Web   → renders null`}
      >
        <View style={{ gap: spacing.md, flexDirection: 'row', flexWrap: 'wrap' }}>
          {(['iOS', 'Android', 'Web'] as const).map((platform) => (
            <ThemedView key={platform} variant="surfaceContainer" style={{ padding: spacing.md, borderRadius: spacing.sm, gap: spacing.xs, minWidth: 100 }}>
              <Typography variant="labelMedium" weight="medium">{platform}</Typography>
              <Typography variant="labelSmall" muted>
                {platform === 'iOS' ? 'Stack.Toolbar' : platform === 'Android' ? 'headerRight' : 'null'}
              </Typography>
            </ThemedView>
          ))}
        </View>
      </DemoSection>

      <ApiSection props={nativeHeaderProps} />
      <DocsPagination />
    </DocsPage>
  );
}
