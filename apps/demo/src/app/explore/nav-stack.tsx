import { View } from 'react-native';
import { Typography } from '@nativectx/ui';
import { DocsPage } from '../../components/docs-page';
import { DocsPagination } from '../../components/docs-pagination';
import { CodeBlock } from '../../components/code-block';
import { ApiSection } from '../../components/api-section';
import { Callout } from '../../components/callout';
import type { PropDefinition } from '../../components/props-table';

const nativeHeaderProps: PropDefinition[] = [
  { name: 'rightIcon', type: 'string', description: 'SF Symbol name for the right button (iOS only)' },
  { name: 'onRightPress', type: '() => void', description: 'Right button press handler' },
  { name: 'leftIcon', type: 'string', description: 'SF Symbol name for the left button (iOS only)' },
  { name: 'onLeftPress', type: '() => void', description: 'Left button press handler' },
  { name: 'androidRightIcon', type: 'string', description: 'Feather icon name for the right button (Android only)' },
  { name: 'androidLeftIcon', type: 'string', description: 'Feather icon name for the left button (Android only)' },
];

export default function NavStackPage() {
  return (
    <DocsPage
      title="Stack & Headers"
      description="ThemedStack wraps expo-router's Stack with automatic header theming. NativeHeader adds icon buttons to the native header bar. They are almost always used together."
      importLine="{ ThemedStack, NativeHeader } from '@nativectx/ui'"
    >
      <View style={{ gap: 8 }}>
        <Typography variant="titleLarge" weight="bold">ThemedStack</Typography>
        <Typography variant="bodyMedium" muted>
          Use inside a tab folder&apos;s <Typography variant="bodyMedium" style={{ fontFamily: 'monospace' }}>_layout.native.tsx</Typography> to give that tab its own Stack with consistent header theming. Always pair with a <Typography variant="bodyMedium" style={{ fontFamily: 'monospace' }}>_layout.tsx</Typography> sibling returning Slot as the web fallback — expo-router requires a non-platform layout file.
        </Typography>
        <CodeBlock
          variant="code"
          filename="app/items/_layout.native.tsx"
          code={`import { Stack } from 'expo-router';
import { ThemedStack } from '@nativectx/ui';

export default function ItemsLayout() {
  return (
    <ThemedStack>
      <Stack.Screen name="index" options={{ title: 'Items' }} />
      <Stack.Screen name="[id]" options={{ title: 'Item' }} />
    </ThemedStack>
  );
}`}
        />
        <CodeBlock
          variant="code"
          filename="app/items/_layout.tsx"
          code={`import { Slot } from 'expo-router';

// Required web fallback — expo-router needs a non-platform layout file
export default function ItemsLayout() {
  return <Slot />;
}`}
        />
      </View>

      <View style={{ gap: 8 }}>
        <Typography variant="titleLarge" weight="bold">NativeHeader</Typography>
        <Typography variant="bodyMedium" muted>
          Adds icon buttons to the native navigation bar. Place inside screen files (not layouts). On iOS it uses SF Symbol buttons via Stack.Toolbar. On Android it injects into headerRight/headerLeft. On web it renders nothing — safe to include unconditionally.
        </Typography>
        <CodeBlock
          variant="code"
          filename="app/items/index.tsx"
          code={`import { Screen, NativeHeader } from '@nativectx/ui';
import { useRouter } from 'expo-router';

export default function ItemsScreen() {
  const router = useRouter();
  return (
    <Screen variant="background" edges={['bottom']}>
      <NativeHeader
        rightIcon="plus"
        onRightPress={() => router.push('/items/new')}
        androidRightIcon="plus"
      />
      {/* screen content */}
    </Screen>
  );
}`}
        />

        <Callout type="critical">
          NativeHeader must be used inside a screen that has a ThemedStack ancestor. Using it in a tab screen with no nested Stack throws: useCompositionOption must be used within a RouterCompositionOptionsProvider.
        </Callout>

        <Callout type="warning">
          On Android, the Stack header must be visible. Do not set headerShown: false on screens that use NativeHeader — the headerRight/headerLeft injection requires the header bar to exist.
        </Callout>
      </View>

      <View style={{ gap: 8 }}>
        <Typography variant="titleLarge" weight="bold">Safe area rules</Typography>
        <View style={{ gap: 8 }}>
          {[
            { label: 'Tab with nested Stack', edges: "edges={['bottom']}", reason: "ThemedStack's header handles the top safe area" },
            { label: 'Flat tab (no Stack)', edges: "edges={['top', 'bottom']}", reason: "No header — must handle top manually" },
            { label: 'Screen with headerShown: false', edges: "edges={['top', 'bottom']}", reason: "No header rendered — notch will clip content" },
          ].map(({ label, edges, reason }) => (
            <View key={label} style={{ gap: 2 }}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Typography variant="labelLarge" weight="medium">{label}</Typography>
                <Typography variant="bodySmall" style={{ fontFamily: 'monospace' }}>{edges}</Typography>
              </View>
              <Typography variant="bodySmall" muted>{reason}</Typography>
            </View>
          ))}
        </View>
      </View>

      <ApiSection props={nativeHeaderProps} title="NativeHeader props" />

      <DocsPagination />
    </DocsPage>
  );
}
