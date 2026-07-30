import React from 'react';
import { View } from 'react-native';
import { Typography, ThemedView, useTheme } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { PropsTable, type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const themedStackProps: PropDefinition[] = [
  {
    name: 'screenOptions',
    type: 'NativeStackNavigationOptions | ((props) => NativeStackNavigationOptions)',
    description: 'Screen options merged on top of theme defaults. Use to override title, headerRight, etc.',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'Stack.Screen declarations',
  },
];

export default function ThemedStackPage() {
  const { spacing } = useTheme();

  return (
    <DocsPage
      title="ThemedStack"
      description="Themed wrapper around Expo Router's Stack that automatically applies header colors from the design token system."
    >
      <DemoSection
        title="Basic Usage"
        description="Replace Stack in your native layout file. Use Stack.Screen to declare screen titles."
        code={`// _layout.native.tsx
import { Stack } from 'expo-router';
import { ThemedStack } from '@nativectx/ui';

export default function Layout() {
  return (
    <ThemedStack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="detail" options={{ title: 'Detail' }} />
    </ThemedStack>
  );
}`}
      >
        <View style={{ gap: spacing.md }}>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">Automatic Theming</Typography>
            <Typography variant="bodySmall" muted>
              Applies headerStyle, headerTintColor, headerBackVisible, and headerBackButtonDisplayMode from the active theme automatically.
            </Typography>
          </ThemedView>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">Dark Mode Support</Typography>
            <Typography variant="bodySmall" muted>
              Header colors update automatically when the user switches between light and dark mode.
            </Typography>
          </ThemedView>
        </View>
      </DemoSection>

      <DemoSection
        title="Overriding Options"
        description="Pass screenOptions to override or extend the defaults. Your options are merged on top."
        code={`<ThemedStack
  screenOptions={{
    headerLargeTitle: true,
    headerShown: false, // hide header on specific screens
  }}
>
  <Stack.Screen name="index" options={{ title: 'Home' }} />
</ThemedStack>

// Function form for route-based options
<ThemedStack
  screenOptions={({ route }) => ({
    title: route.name,
  })}
/>`}
      >
        <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
          <Typography variant="labelLarge" weight="medium">Merge Behaviour</Typography>
          <Typography variant="bodySmall" muted>
            Your screenOptions always win. Theme defaults only fill in what you don&apos;t specify.
            Both object and function forms are supported.
          </Typography>
        </ThemedView>
      </DemoSection>

      <DemoSection
        title="Defaults Applied"
        description="These options are set automatically by ThemedStack."
        code={`// Equivalent to:
<Stack
  screenOptions={{
    headerStyle: { backgroundColor: theme.tokens.appbar.background },
    headerTintColor: theme.onSurface,
    headerBackVisible: true,
    headerBackButtonDisplayMode: 'minimal',
  }}
/>`}
      >
        <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
          <Typography variant="labelLarge" weight="medium">Why .native.tsx?</Typography>
          <Typography variant="bodySmall" muted>
            Name your layout file _layout.native.tsx to apply it to both iOS and Android,
            while keeping a separate _layout.tsx for web.
          </Typography>
        </ThemedView>
      </DemoSection>

      <ApiSection props={themedStackProps} />
      <DocsPagination />
    </DocsPage>
  );
}
