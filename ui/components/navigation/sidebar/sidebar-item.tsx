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
import { Typography } from '../../ui/typography';
import { useTheme } from '../../../theme';
import { useSidebar } from '../../../context/sidebar-context';
import { useDimensions, breakpoints } from '../../../hooks';
import { renderIcon, type IconLibrary } from '../../../icons';
import type { InteractiveComponentProps } from '../../shared/types';
import { sidebarItemStyles, getSidebarItemColors } from '../shared/sidebar-styles';

// 2. TYPES

/**
 * Configuration for sidebar item icons
 */
export interface SidebarItemIconConfig {
  /** Icon library to use. @default 'Feather' */
  library?: IconLibrary;
  /** Name of the icon from the specified library */
  name: string;
  /** Icon size in pixels. @default 20 */
  size?: number;
}

/**
 * Props for the SidebarItem component
 */
export interface SidebarItemProps extends Omit<InteractiveComponentProps, 'onPress'> {
  /** Item label text */
  label: string;
  /** Optional icon configuration */
  icon?: SidebarItemIconConfig;
  /** Whether this item is currently active/selected. @default false */
  active?: boolean;
  /** Press handler */
  onPress?: (event?: GestureResponderEvent) => void;
  /** Custom styles */
  style?: StyleProp<ViewStyle>;
}

// 3. COMPONENT

/**
 * Sidebar menu item with icon, label, and active state
 */
const SidebarItem = forwardRef<View, SidebarItemProps>(({
  label,
  icon,
  active = false,
  disabled = false,
  onPress,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
}, ref) => {
  const theme = useTheme();
  const { close } = useSidebar();
  const { width } = useDimensions();
  const tokens = theme.tokens.sidebar;
  const spacing = theme.spacing;

  const [hovered, setHovered] = useState(false);
  const isMobile = width < breakpoints.large;

  const handlePress = (event?: GestureResponderEvent) => {
    if (onPress) {
      onPress(event);
    }
    if (isMobile) {
      close();
    }
  };

  const { backgroundColor: baseBg, textColor } = getSidebarItemColors(tokens, active);
  const backgroundColor = !active && hovered ? tokens.itemHoverBg : baseBg;
  const iconColor = textColor;

  const renderItemIcon = () => {
    if (!icon) return null;
    const iconSize = icon.size || 20;
    const iconLibrary = icon.library || 'Feather';

    return (
      <View style={sidebarItemStyles.iconContainer}>
        {renderIcon(icon, iconLibrary, iconSize, iconColor)}
      </View>
    );
  };

  return (
    <Pressable
      ref={ref}
      testID={testID}
      onPress={disabled ? undefined : handlePress}
      disabled={disabled}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, selected: active }}
      style={[
        sidebarItemStyles.container,
        {
          backgroundColor,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        },
        disabled && styles.disabled,
        style,
      ]}
      android_ripple={
        !disabled && Platform.OS === 'android'
          ? { color: theme.primary + '20', borderless: false }
          : undefined
      }
    >
      <View style={[sidebarItemStyles.content, { gap: spacing.md }]}>
        {renderItemIcon()}
        <Typography
          variant="labelLarge"
          weight="medium"
          color={textColor}
          numberOfLines={1}
        >
          {label}
        </Typography>
      </View>
    </Pressable>
  );
});

SidebarItem.displayName = 'SidebarItem';

// 4. STYLES
const styles = StyleSheet.create({
  disabled: {
    opacity: 0.38,
  },
});

// 5. EXPORTS
export { SidebarItem };
