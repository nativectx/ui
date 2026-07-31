import React, { type ComponentProps } from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../theme';

type StackProps = ComponentProps<typeof Stack>;

/**
 * Props for ThemedStack.
 *
 * Accepts everything expo-router's `Stack` accepts — `initialRouteName`,
 * `screenListeners`, `id` and friends are forwarded untouched. The members
 * below are the ones that behave differently here or are set on nearly every
 * usage.
 */
export interface ThemedStackProps extends StackProps {
  /**
   * `Stack.Screen` declarations for the routes in this stack.
   */
  children: React.ReactNode;
  /**
   * Screen options merged on top of the themed header defaults
   * (`headerStyle`, `headerTintColor`, `headerBackVisible`,
   * `headerBackButtonDisplayMode`). Anything set here wins.
   *
   * Accepts an object, or a function receiving `{ route, navigation, theme }`.
   */
  screenOptions?: StackProps['screenOptions'];
}

/**
 * expo-router Stack with auto-applied theme colors and header styling.
 *
 * Applies headerStyle, headerTintColor, and sensible back button defaults from
 * the design token system. Any screenOptions passed as props are merged and
 * will override the defaults.
 *
 * @example
 * ```tsx
 * // _layout.native.tsx
 * <ThemedStack>
 *   <Stack.Screen name="index" options={{ title: 'Home' }} />
 *   <Stack.Screen name="detail" options={{ title: 'Detail' }} />
 * </ThemedStack>
 * ```
 *
 * @category navigation
 */
export function ThemedStack({ screenOptions, ...props }: ThemedStackProps) {
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
