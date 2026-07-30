import React, { type ComponentProps } from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../theme';

type StackProps = ComponentProps<typeof Stack>;

/**
 * A themed wrapper around Expo Router's Stack that automatically applies
 * the app's header styling from the design token system.
 *
 * Applies headerStyle, headerTintColor, and sensible back button defaults.
 * Any screenOptions passed as props are merged and will override the defaults.
 *
 * @example
 * ```tsx
 * // _layout.native.tsx
 * <ThemedStack>
 *   <Stack.Screen name="index" options={{ title: 'Home' }} />
 *   <Stack.Screen name="detail" options={{ title: 'Detail' }} />
 * </ThemedStack>
 * ```
 */
export function ThemedStack({ screenOptions, ...props }: StackProps) {
  const theme = useTheme();

  const defaults = {
    headerStyle: { backgroundColor: theme.tokens.appbar.background },
    headerTintColor: theme.onSurface,
    headerBackVisible: true,
    headerBackButtonDisplayMode: 'minimal' as const,
  };

  const mergedScreenOptions =
    typeof screenOptions === 'function'
      ? (args: Parameters<Extract<StackProps['screenOptions'], Function>>[0]) => ({
          ...defaults,
          ...screenOptions(args),
        })
      : { ...defaults, ...screenOptions };

  return <Stack screenOptions={mergedScreenOptions} {...props} />;
}

ThemedStack.displayName = 'ThemedStack';
