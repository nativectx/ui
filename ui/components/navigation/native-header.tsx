import React from 'react';
import { Platform, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '../../theme';
import { renderIcon } from '../../icons';

export interface NativeHeaderProps {
  /** SF Symbol name for the right toolbar button (iOS only) */
  rightIcon?: string;
  /** Press handler for the right toolbar button */
  onRightPress?: () => void;
  /** SF Symbol name for the left toolbar button (iOS only) */
  leftIcon?: string;
  /** Press handler for the left toolbar button */
  onLeftPress?: () => void;
  /** Feather icon name for the right header button (Android only) */
  androidRightIcon?: string;
  /** Feather icon name for the left header button (Android only) */
  androidLeftIcon?: string;
}

/**
 * Screen-level native header toolbar for iOS and Android.
 * iOS: renders SF Symbol buttons via Stack.Toolbar.
 * Android: renders Feather icon buttons via Stack.Screen headerLeft/headerRight.
 * Use inside screen components, not layouts.
 */
export const NativeHeader = ({
  rightIcon,
  onRightPress,
  leftIcon,
  onLeftPress,
  androidRightIcon,
  androidLeftIcon,
}: NativeHeaderProps) => {
  const theme = useTheme();

  if (Platform.OS === 'ios') {
    return (
      <>
        <Stack.Screen options={{ headerShadowVisible: false }} />
        {rightIcon && (
          <Stack.Toolbar placement="right">
            <Stack.Toolbar.Button
              icon={rightIcon as any}
              onPress={onRightPress}
            />
          </Stack.Toolbar>
        )}
        {leftIcon && (
          <Stack.Toolbar placement="left">
            <Stack.Toolbar.Button
              icon={leftIcon as any}
              onPress={onLeftPress}
              tintColor={theme.onSurface}
            />
          </Stack.Toolbar>
        )}
      </>
    );
  }

  if (Platform.OS === 'android') {
    if (!androidRightIcon && !androidLeftIcon) return null;
    return (
      <Stack.Screen
        options={{
          ...(androidRightIcon && {
            headerRight: () => (
              <Pressable onPress={onRightPress} style={{ padding: 8 }}>
                {renderIcon(androidRightIcon, 'Feather', 24, theme.onSurface)}
              </Pressable>
            ),
          }),
          ...(androidLeftIcon && {
            headerLeft: () => (
              <Pressable onPress={onLeftPress} style={{ padding: 8 }}>
                {renderIcon(androidLeftIcon, 'Feather', 24, theme.onSurface)}
              </Pressable>
            ),
          }),
        }}
      />
    );
  }

  return null;
};

NativeHeader.displayName = 'NativeHeader';
