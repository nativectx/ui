// 1. IMPORTS
import React, { forwardRef, useEffect, useState } from 'react';
import {
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
import type { InteractiveComponentProps } from '../shared/types';
import { blurOnWeb, platformShadow } from '../shared/utils';
import type { IconConfig } from './button';

// 2. TYPES

/** FAB variant controlling color scheme */
export type FABVariant = 'primary' | 'secondary' | 'tertiary' | 'surface';

/** FAB size controlling dimensions */
export type FABSize = 'small' | 'medium' | 'large';

/**
 * Props for the FAB (Floating Action Button) component.
 *
 * @example
 * ```tsx
 * // Standard FAB
 * <FAB icon={{ name: 'plus' }} onPress={() => {}} />
 *
 * // Extended FAB with label
 * <FAB icon={{ name: 'edit-2' }} label="Compose" onPress={() => {}} />
 *
 * // Small surface FAB
 * <FAB icon={{ name: 'arrow-up' }} variant="surface" size="small" onPress={() => {}} />
 * ```
 */
export interface FABProps extends Omit<InteractiveComponentProps, 'onPress'> {
  /** Required icon configuration */
  icon: IconConfig;
  /** Optional label for extended FAB */
  label?: string;
  /**
   * Color variant following M3 FAB spec.
   * @default 'primary'
   */
  variant?: FABVariant;
  /**
   * Size variant controlling dimensions and icon size.
   * @default 'medium'
   */
  size?: FABSize;
  /** Press handler */
  onPress?: (event?: GestureResponderEvent) => void;
}

// Size configuration (borderRadius resolved from theme at render time)
const SIZE_CONFIG: Record<FABSize, { dimension: number; iconSize: number; radiusKey: 'md' | 'lg' | 'xl' }> = {
  small: { dimension: 40, iconSize: 20, radiusKey: 'md' },
  medium: { dimension: 56, iconSize: 24, radiusKey: 'lg' },
  large: { dimension: 96, iconSize: 36, radiusKey: 'xl' },
};

// 3. COMPONENT

/**
 * Material Design 3 Floating Action Button (FAB)
 * https://m3.material.io/components/floating-action-button
 *
 * Supports four color variants and three sizes.
 * When a `label` is provided, renders as an Extended FAB.
 */
const FAB = forwardRef<View, FABProps>(({
  icon,
  label,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onPress,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
}, ref) => {
  const theme = useTheme();
  const tokens = theme.tokens;

  const [hovered, setHovered] = useState(false);
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;
    try {
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

  const sizeConfig = SIZE_CONFIG[size];
  const isExtended = !!label;

  // Color mapping per variant
  const getColors = () => {
    if (disabled) {
      return {
        bg: theme.onSurface + '1F', // 12% opacity
        fg: theme.onSurface + '61', // 38% opacity
      };
    }
    switch (variant) {
      case 'primary':
        return { bg: theme.primaryContainer, fg: theme.onPrimaryContainer };
      case 'secondary':
        return { bg: theme.secondaryContainer, fg: theme.onSecondaryContainer };
      case 'tertiary':
        return { bg: theme.tertiaryContainer, fg: theme.onTertiaryContainer };
      case 'surface':
        return { bg: theme.surface, fg: theme.primary };
    }
  };

  const colors = getColors();

  const getContainerStyle = ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => {
    const elevation = pressed ? tokens.elevation.level1 : tokens.elevation.level3;

    const baseStyle: ViewStyle[] = [
      styles.container,
      {
        backgroundColor: colors.bg,
        borderRadius: theme.borderRadius[sizeConfig.radiusKey],
      },
    ];

    if (isExtended) {
      baseStyle.push({
        height: sizeConfig.dimension,
        paddingHorizontal: theme.spacing.lg,
        minWidth: sizeConfig.dimension,
      });
    } else {
      baseStyle.push({
        width: sizeConfig.dimension,
        height: sizeConfig.dimension,
      });
    }

    if (disabled) {
      baseStyle.push(styles.disabled);
    }

    // Elevation shadow
    if (!disabled && elevation > 0) {
      const h = Math.max(1, Math.floor(elevation / 2));
      baseStyle.push(platformShadow(theme.shadow, 0, h, 0.08, h, elevation));
    }

    // Hover/press transforms
    if (!reduceMotionEnabled) {
      if (pressed) {
        baseStyle.push({ transform: [{ scale: 0.997 }] });
      } else if (hovered && Platform.OS === 'web') {
        baseStyle.push({ transform: [{ translateY: -1 }, { scale: 1.02 }] });
      }
    }

    if (style) {
      baseStyle.push(style as ViewStyle);
    }

    return baseStyle;
  };

  const iconSize = icon.size || sizeConfig.iconSize;
  const iconLibrary = icon.library || 'Feather';
  const iconColor = icon.color || colors.fg;

  return (
    <Pressable
      ref={ref}
      testID={testID}
      onPress={disabled ? undefined : (e) => {
        blurOnWeb(e);
        onPress?.(e);
      }}
      disabled={disabled}
      style={getContainerStyle}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label ?? icon.name}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      android_ripple={
        !disabled && Platform.OS === 'android'
          ? { color: colors.fg + '40', borderless: false }
          : undefined
      }
    >
      <View style={[styles.content, { gap: theme.spacing.sm }]}>
        {renderIcon(icon, iconLibrary, iconSize, iconColor)}
        {isExtended && (
          <Typography
            variant="labelLarge"
            weight="medium"
            color={colors.fg}
            numberOfLines={1}
          >
            {label}
          </Typography>
        )}
      </View>
    </Pressable>
  );
});

FAB.displayName = 'FAB';

// 4. STYLES
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.38,
  },
});

// 5. EXPORTS
export { FAB };
