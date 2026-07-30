// 1. IMPORTS
import React, { forwardRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme';
import { renderIcon } from '../../icons';
import type { IconConfig } from './button';
import type { InteractiveComponentProps } from '../shared/types';
import { blurOnWeb } from '../shared/utils';

// 2. TYPES

/**
 * Material Design 3 icon button variants.
 * - `standard`: No container, low-emphasis
 * - `filled`: High-emphasis, solid background
 * - `tonal`: Medium-emphasis with secondary container color
 * - `outlined`: Medium-emphasis with border, no fill
 */
export type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined';
export const IconButtonVariants = ['standard', 'filled', 'tonal', 'outlined'] as const;

export interface IconButtonProps extends Omit<InteractiveComponentProps, 'accessibilityLabel' | 'onPress'> {
  /** Icon to display */
  icon: IconConfig;
  /** Press handler */
  onPress?: () => void;
  /**
   * Visual style variant following M3 icon button spec.
   * @default 'standard'
   */
  variant?: IconButtonVariant;
  /**
   * Button size.
   * - `small`: 32dp visual / 48dp touch target
   * - `medium`: 40dp visual / 48dp touch target (default)
   * - `large`: 48dp visual / 48dp touch target
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  /** Required: screen reader label describing the action (no visible text) */
  accessibilityLabel: string;
}

// 3. CONSTANTS

const visualSizeMap = { small: 32, medium: 40, large: 48 };
const iconSizeMap = { small: 16, medium: 20, large: 24 };
const TOUCH_TARGET = 48;

// 4. COMPONENT

const IconButton = forwardRef<View, IconButtonProps>(({
  icon,
  onPress,
  variant = 'standard',
  size = 'medium',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}, ref) => {
  const theme = useTheme();
  const tokens = theme.tokens;

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const visualSize = visualSizeMap[size] ?? visualSizeMap.medium;
  const touchSize = Math.max(TOUCH_TARGET, visualSize);
  const iconSize = icon.size ?? (iconSizeMap[size] ?? iconSizeMap.medium);
  const borderRadius = visualSize / 2;

  const getBgColor = (): string => {
    if (disabled) {
      return variant === 'standard' ? 'transparent' : tokens.button.disabledBg;
    }
    switch (variant) {
      case 'filled':    return tokens.button.filledBg;
      case 'tonal':     return tokens.button.tonalBg;
      case 'outlined':  return 'transparent';
      case 'standard':  return 'transparent';
    }
  };

  const getIconColor = (): string => {
    if (icon.color) return icon.color;
    if (disabled) return tokens.button.disabledText;
    switch (variant) {
      case 'filled':   return tokens.button.filledText;
      case 'tonal':    return tokens.button.tonalText;
      case 'outlined': return tokens.button.outlinedText;
      case 'standard': return hovered && Platform.OS === 'web' ? theme.onSurface : theme.onSurfaceVariant;
    }
  };

  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    {
      width: visualSize,
      height: visualSize,
      borderRadius,
      backgroundColor: getBgColor(),
    },
    variant === 'outlined' && {
      borderWidth: 1,
      borderColor: disabled ? tokens.button.disabledBg : tokens.button.outlinedBorder,
    },
    disabled && styles.disabled,
    focused && Platform.OS === 'web' && {
      borderWidth: tokens.focusRing.width,
      borderColor: tokens.focusRing.color,
    },
    !disabled && hovered && Platform.OS === 'web' && variant !== 'standard' && { opacity: 0.92 },
  ];

  return (
    <Pressable
      ref={ref}
      testID={testID}
      onPress={disabled ? undefined : (e: GestureResponderEvent) => {
        blurOnWeb(e);
        onPress?.();
      }}
      disabled={disabled}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      android_ripple={
        !disabled && Platform.OS === 'android'
          ? { color: theme.primary + '40', borderless: true, radius: borderRadius }
          : undefined
      }
      style={({ pressed }) => [
        styles.touchTarget,
        { width: touchSize, height: touchSize },
        pressed && !disabled && { opacity: 0.7 },
        style,
      ]}
    >
      <View style={containerStyle}>
        {renderIcon(icon, icon.library ?? 'Feather', iconSize, getIconColor())}
      </View>
    </Pressable>
  );
});

IconButton.displayName = 'IconButton';

// 5. STYLES

const styles = StyleSheet.create({
  touchTarget: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.38,
  },
});

// 6. EXPORTS

export { IconButton };
