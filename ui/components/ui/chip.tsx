// 1. IMPORTS
import React, { useState } from 'react';
import {
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
import type { InteractiveComponentProps } from '../shared/types';
import { blurOnWeb } from '../shared/utils';

// 2. TYPES

/**
 * Configuration for the chip's trailing icon.
 */
export interface ChipIconConfig {
  /** Icon library to use. @default 'Feather' */
  library?: IconLibrary;
  /** Name of the icon from the specified library */
  name: string;
  /** Icon size in pixels. @default 18 */
  size?: number;
  /** Custom icon color. Defaults to chip text color */
  color?: string;
}

/**
 * Material Design 3 chip visual variants.
 * - `outlined`: Transparent background with 1dp border (default)
 * - `filled`: Solid secondaryContainer background, no border
 */
export type ChipVariant = 'filled' | 'outlined';
export const ChipVariants = ['filled', 'outlined'] as const;

/**
 * Props for the Chip component.
 *
 * @example
 * ```tsx
 * // Outlined chip (default)
 * <Chip label="Design" onPress={() => {}} />
 *
 * // Filled chip
 * <Chip label="TypeScript" variant="filled" onPress={() => {}} />
 *
 * // Filter chip — toggleable with checkmark
 * <Chip label="Wireless" selected={on} onPress={() => setOn(v => !v)} />
 *
 * // Chip with trailing icon and separate icon press
 * <Chip
 *   label="React Native"
 *   variant="filled"
 *   icon={{ name: 'x' }}
 *   onPress={() => {}}
 *   onIconPress={() => removeTag('React Native')}
 * />
 * ```
 */
export interface ChipProps extends InteractiveComponentProps {
  /** Chip label text */
  label: string;
  /**
   * Visual style variant.
   * - `outlined`: Border, transparent background (default)
   * - `filled`: Solid tonal background, no border
   * @default 'outlined'
   */
  variant?: ChipVariant;
  /**
   * Selected state — shows a leading checkmark and uses selectedBg color.
   * Use for filter chip behaviour.
   * @default false
   */
  selected?: boolean;
  /**
   * Optional trailing icon rendered to the right of the label.
   * Provide `onIconPress` to make it independently pressable.
   */
  icon?: ChipIconConfig;
  /**
   * Called when the trailing icon is pressed independently.
   * When provided, the icon becomes its own pressable target separate from `onPress`.
   */
  onIconPress?: () => void;
}

// 3. COMPONENT
/**
 * Material Design 3 Chip component
 * https://m3.material.io/components/chips
 *
 * Height: 32dp visual / 48dp touch target via hitSlop
 * Shape: CornerSmall (8dp border radius)
 * Variants: filled, outlined
 * Behavioural props: selected (filter checkmark), icon + onIconPress (trailing action)
 */
const Chip = ({
  label,
  variant = 'outlined',
  selected = false,
  disabled = false,
  icon,
  onPress,
  onIconPress,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: ChipProps) => {
  const theme = useTheme();
  const t = theme.tokens.chip;

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const getBg = (): string => {
    if (disabled) return variant === 'filled' ? t.disabledBg : 'transparent';
    if (selected) return t.selectedBg;
    if (variant === 'filled') return t.filledBg;
    return 'transparent';
  };

  const getTextColor = (): string => {
    if (disabled) return t.disabledText;
    if (selected) return t.selectedText;
    if (variant === 'filled') return t.filledText;
    return t.outlinedText;
  };

  const getBorderColor = (): string | undefined => {
    if (variant === 'filled' || selected) return undefined;
    if (disabled) return t.disabledBorder;
    return t.outlinedBorder;
  };

  const textColor = getTextColor();
  const borderColor = getBorderColor();
  const bg = getBg();
  const borderRadius = theme.borderRadius.sm; // M3 CornerSmall = 8dp

  // Padding: 8dp on side with leading/trailing content, 12dp otherwise
  const paddingLeft = selected ? 8 : 12;
  const paddingRight = icon ? 8 : 12;

  const getInnerStyle = (): StyleProp<ViewStyle> => {
    const base: StyleProp<ViewStyle> = [
      styles.chip,
      {
        backgroundColor: bg,
        borderRadius,
        paddingLeft,
        paddingRight,
      },
      borderColor ? { borderWidth: 1, borderColor } : null,
      disabled ? styles.disabled : null,
    ];

    // Focus ring on the visual element
    if (focused && Platform.OS === 'web') {
      (base as ViewStyle[]).push({
        outlineWidth: theme.tokens.focusRing.width,
        outlineColor: theme.tokens.focusRing.color,
        outlineStyle: 'solid',
      } as ViewStyle);
    }

    if (Platform.OS === 'web' && !disabled) {
      if (hovered) {
        (base as ViewStyle[]).push({ opacity: 0.92 });
      }
    }

    if (style) {
      (base as ViewStyle[]).push(style as ViewStyle);
    }

    return base;
  };

  const getPressableStyle = ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => {
    const base: StyleProp<ViewStyle> = [styles.pressable];
    if (Platform.OS === 'web' && pressed && !disabled) {
      (base as ViewStyle[]).push({ opacity: 0.88 });
    }
    return base;
  };

  const ripple =
    !disabled && Platform.OS === 'android'
      ? { color: theme.secondary + '40', borderless: false }
      : undefined;

  const checkmark = selected && (
    <View style={styles.iconWrapper}>
      {renderIcon({ name: 'check' }, 'Feather', 16, textColor)}
    </View>
  );

  // When the trailing icon has its own action, a nested <Pressable accessibilityRole="button">
  // inside the outer <Pressable accessibilityRole="button"> produces invalid HTML
  // (<button> cannot contain <button>). Lift the icon out so both pressables are siblings.
  if (icon && onIconPress) {
    return (
      <View style={getInnerStyle()}>
        <Pressable
          testID={testID}
          onPress={disabled ? undefined : (e) => { blurOnWeb(e); onPress?.(); }}
          disabled={disabled}
          style={styles.chipBody}
          onHoverIn={() => setHovered(true)}
          onHoverOut={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled, selected }}
          android_ripple={ripple}
        >
          {checkmark}
          <Typography variant="labelLarge" color={textColor} numberOfLines={1}>
            {label}
          </Typography>
        </Pressable>
        <Pressable
          onPress={disabled ? undefined : (e) => { blurOnWeb(e); onIconPress(); }}
          style={[styles.iconWrapper, styles.iconPressable]}
          accessibilityRole="button"
          accessibilityLabel={`${label} action`}
          hitSlop={4}
        >
          {renderIcon(icon, icon.library ?? 'Feather', icon.size ?? 18, icon.color ?? textColor)}
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={disabled ? undefined : (e) => {
        blurOnWeb(e);
        onPress?.();
      }}
      disabled={disabled}
      style={getPressableStyle}
      hitSlop={8}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, selected }}
      android_ripple={ripple}
    >
      <View style={getInnerStyle()}>
        {checkmark}
        <Typography variant="labelLarge" color={textColor} numberOfLines={1}>
          {label}
        </Typography>
        {icon && (
          <View style={styles.iconWrapper}>
            {renderIcon(icon, icon.library ?? 'Feather', icon.size ?? 18, icon.color ?? textColor)}
          </View>
        )}
      </View>
    </Pressable>
  );
};

Chip.displayName = 'Chip';

// 4. STYLES
const styles = StyleSheet.create({
  // Transparent touch target — no background, extends via hitSlop
  pressable: {
    alignSelf: 'flex-start',
  },
  // Visual chip container — 32dp height, all visual styling lives here
  chip: {
    height: 32,
    minWidth: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Label area inside the split chip (when onIconPress is provided)
  chipBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 8,
  },
  // Icon Pressable in the split chip — full chip height for a comfortable tap target
  iconPressable: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.38,
  },
});

// 5. EXPORTS
export { Chip };
