// 1. IMPORTS
import React, { forwardRef, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Typography } from './typography';
import { useTheme } from '../../theme';
import { renderIcon, type IconLibrary } from '../../icons';
import type { InteractiveComponentProps, LoadableComponentProps } from '../shared/types';
import { blurOnWeb, platformShadow } from '../shared/utils';

// 2. TYPES

/**
 * Configuration for button icons.
 *
 * @example
 * ```tsx
 * // Using Feather icons (default)
 * <Button title="Next" icon={{ name: 'arrow-right' }} />
 *
 * // Using MaterialIcons
 * <Button title="Save" icon={{ library: 'MaterialIcons', name: 'save', size: 20 }} />
 *
 * // Custom color
 * <Button title="Delete" icon={{ name: 'trash-2', color: '#FF0000' }} />
 * ```
 */
export interface IconConfig {
  /** Icon library to use. @default 'Feather' */
  library?: IconLibrary;
  /** Name of the icon from the specified library */
  name: string;
  /** Icon size in pixels. @default 18 */
  size?: number;
  /** Custom icon color. Defaults to button text color */
  color?: string;
}

/**
 * Material Design 3 button variants.
 * - `filled`: High-emphasis, solid background (default)
 * - `elevated`: Medium-emphasis with shadow/elevation
 * - `tonal`: Medium-emphasis with secondary container color
 * - `outlined`: Medium-emphasis with border, no fill
 * - `text`: Low-emphasis, text only
 */
export type ButtonVariant = 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text';
export const ButtonVariants = ['filled', 'elevated', 'tonal', 'outlined', 'text'] as const;

/**
 * Props for the Button component.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Button title="Click me" onPress={() => console.log('Pressed!')} />
 * ```
 *
 * @example
 * ```tsx
 * // Different variants
 * <Button title="Primary Action" variant="filled" />
 * <Button title="Secondary" variant="tonal" />
 * <Button title="Cancel" variant="outlined" />
 * <Button title="Learn more" variant="text" />
 * ```
 *
 * @example
 * ```tsx
 * // With icon
 * <Button
 *   title="Continue"
 *   icon={{ name: 'arrow-right' }}
 *   iconPosition="right"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Loading state
 * <Button title="Submitting..." loading={true} />
 * ```
 *
 * @example
 * ```tsx
 * // Custom colors (use sparingly - prefer variants)
 * <Button
 *   title="Custom"
 *   backgroundColor="#FF6B35"
 *   color="#FFFFFF"
 * />
 * ```
 */
export interface ButtonProps extends Omit<InteractiveComponentProps, 'onPress'>, LoadableComponentProps {
  /** Button label text */
  title: string;
  /** Press handler. Receives optional GestureResponderEvent */
  onPress?: (event?: GestureResponderEvent) => void;
  /**
   * Visual style variant following M3 button spec.
   * @default 'filled'
   */
  variant?: ButtonVariant;
  /** Optional icon configuration */
  icon?: IconConfig;
  /**
   * Position of the icon relative to the title.
   * @default 'right'
   */
  iconPosition?: 'left' | 'right';
  /**
   * Override text color. Use sparingly - prefer semantic variants.
   * Useful for special cases like destructive actions.
   */
  color?: string;
  /**
   * Override background color. Use sparingly - prefer semantic variants.
   */
  backgroundColor?: string;
  /**
   * Button size affecting height.
   * - `small`: 32dp
   * - `medium`: 40dp (default)
   * - `large`: 56dp
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
}

// 3. COMPONENT
/**
 * Material Design 3 Button component
 * https://m3.material.io/components/buttons
 *
 * Supports five variants:
 * - filled: High-emphasis actions (default)
 * - elevated: Medium-emphasis actions with elevation
 * - tonal: Medium-emphasis with container color
 * - outlined: Medium-emphasis with border
 * - text: Low-emphasis actions
 */
const Button = forwardRef<View, ButtonProps>(({
  title,
  variant = 'filled',
  loading = false,
  disabled = false,
  icon,
  onPress,
  iconPosition = 'right',
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
  color,
  backgroundColor,
  size = 'medium',
}, ref) => {
  const theme = useTheme();
  const tokens = theme.tokens;

  // Track hover and focus states (web-only features)
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  // Respect reduce-motion preference where available and map sizes
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  useEffect(() => {
    let mounted = true;
    try {
      // dynamically require to avoid bundler differences across platforms
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { AccessibilityInfo } = require('react-native');
      AccessibilityInfo?.isReduceMotionEnabled?.().then((enabled: boolean) => {
        if (mounted) setReduceMotionEnabled(!!enabled);
      });
    } catch (e) {
      // ignore if not available
    }
    return () => { mounted = false; };
  }, []);

  // Visual heights in dp per size token
  const sizeMap: Record<string, number> = {
    small: 32,
    medium: 40,
    large: 56,
  };
  // default to 'medium' if not provided via props
  const visualHeight = sizeMap[size] ?? sizeMap.medium;
  // Ensure a minimum touch target of 48dp
  const touchHeight = Math.max(48, visualHeight);

  // Dynamic styles based on state
  const getButtonStyle = ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => {
    const t = tokens.button;
    let bg: string | undefined;
    let borderColor: string | undefined;
    let elevation: number | undefined;

    if (disabled) {
      bg = t.disabledBg;
      borderColor = variant === 'outlined' ? theme.outlineVariant : undefined;
    } else {
      switch (variant) {
        case 'filled':
          bg = t.filledBg;
          if (Platform.OS !== 'web') {
            elevation = pressed ? tokens.elevation.level0 : tokens.elevation.level1;
          }
          break;
        case 'elevated':
          bg = t.elevatedBg;
          elevation = pressed ? tokens.elevation.level1 : tokens.elevation.level3;
          break;
        case 'tonal':
          bg = t.tonalBg;
          break;
        case 'outlined':
          bg = 'transparent';
          borderColor = t.outlinedBorder;
          break;
        case 'text':
          bg = 'transparent';
          break;
      }
    }
    // Apply custom background color override
    if (backgroundColor) {
      bg = backgroundColor;
    }

    const baseStyle: StyleProp<ViewStyle> = [
      styles.base,
      styles[variant],
      // reserve touch target height for accessibility
      { minHeight: touchHeight },
      { borderRadius: theme.shape.buttonBorderRadius },
      bg ? { backgroundColor: bg } : null,
      borderColor ? { borderColor } : null,
      disabled ? styles.disabled : null,
    ];

    // Add elevation shadow for elevated buttons
    if (elevation !== undefined && elevation > 0) {
      const h = Math.max(1, Math.floor(elevation / 2));
      (baseStyle as ViewStyle[]).push(platformShadow(theme.shadow, 0, h, 0.08, h, elevation));
    }

    // Add focus ring for web/keyboard navigation
    if (focused && Platform.OS === 'web') {
      (baseStyle as ViewStyle[]).push({
        borderWidth: tokens.focusRing.width,
        borderColor: tokens.focusRing.color,
        borderStyle: 'solid' as 'solid',
      });
    }

    // M3 state layer: subtle overlay on hover (8% opacity) and press (12% opacity)
    if (Platform.OS === 'web' && !disabled) {
      if (pressed) {
        (baseStyle as ViewStyle[]).push({ opacity: 0.88 });
      } else if (hovered) {
        (baseStyle as ViewStyle[]).push({ opacity: 0.92 });
      }
    }

    // subtle transform for hover/press unless user requests reduced motion
    if (!reduceMotionEnabled) {
      if (pressed) {
        (baseStyle as ViewStyle[]).push({ transform: [{ scale: 0.997 }] });
      } else if (hovered && Platform.OS === 'web') {
        (baseStyle as ViewStyle[]).push({ transform: [{ translateY: -1 }, { scale: 1.01 }] });
      }
    }

    // Add custom style last
    if (style) {
      (baseStyle as ViewStyle[]).push(style as ViewStyle);
    }

    return baseStyle;
  };

  // Get text color based on variant and state
  const getTextColor = (isDisabled: boolean): string => {
    if (color) return color;
    if (isDisabled) return tokens.button.disabledText;

    const t = tokens.button;
    switch (variant) {
      case 'filled':
        return t.filledText;
      case 'elevated':
        return t.elevatedText;
      case 'tonal':
        // tonal should use a high-contrast label (avoid looking disabled)
        return theme.onSurface;
      case 'outlined':
        return t.outlinedText;
      case 'text':
        return t.textColor;
      default:
        return t.filledText;
    }
  };

  const getIconColor = (isDisabled: boolean): string => {
    if (icon?.color) return icon.color;
    return getTextColor(isDisabled);
  };

  const textColor = getTextColor(disabled);
  const iconColor = getIconColor(disabled);

  if (loading) {
    return (
      <View
        ref={ref}
        testID={testID}
        style={[
          styles.base,
          styles[variant],
          { minHeight: touchHeight },
          { borderRadius: theme.shape.buttonBorderRadius },
          backgroundColor && { backgroundColor },
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: true, busy: true }}
      >
        <ActivityIndicator size="small" color={textColor} />
      </View>
    );
  }

  const renderButtonIcon = (position: 'left' | 'right') => {
    if (!icon || iconPosition !== position) return null;

    const iconSize = icon.size || 18;
    const iconLibrary = icon.library || 'Feather';

    return (
      <View style={position === 'left' ? styles.iconLeft : styles.iconRight}>
        {renderIcon(icon, iconLibrary, iconSize, iconColor)}
      </View>
    );
  };

  return (
    <Pressable
      ref={ref}
      testID={testID}
      onPress={disabled ? undefined : (e) => {
        blurOnWeb(e);
        onPress?.(e);
      }}
      disabled={disabled}
      style={getButtonStyle}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      // Platform-specific ripple effect for Android
      android_ripple={
        !disabled && Platform.OS === 'android'
          ? {
              color: theme.primary + '40', // 25% opacity
              borderless: false,
            }
          : undefined
      }
    >
      <View style={[styles.contentContainer, { height: visualHeight }]}> 
        {renderButtonIcon('left')}
        <Typography
          variant="labelLarge"
          weight="medium"
          color={textColor}
          numberOfLines={1}
          align="center"
        >
          {title}
        </Typography>
        {renderButtonIcon('right')}
      </View>
    </Pressable>
  );
});

Button.displayName = 'Button';

// 4. STYLES
const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: {
    paddingHorizontal: 24,
    minWidth: 100,
  },
  elevated: {
    paddingHorizontal: 24,
    minWidth: 100,
  },
  tonal: {
    paddingHorizontal: 24,
    minWidth: 100,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    paddingHorizontal: 24,
    minWidth: 100,
  },
  text: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    minWidth: 100,
  },
  disabled: {
    opacity: 0.38, // M3 disabled opacity
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconLeft: {
    marginRight: 0, // gap handles spacing
  },
  iconRight: {
    marginLeft: 0, // gap handles spacing
  },
});

// 5. EXPORTS
export { Button };
