// 1. IMPORTS
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Typography } from '../../ui/typography';
import { useThemeContext } from '../../../theme';
import { renderIcon, type IconLibrary } from '../../../icons';

// 2. TYPES

/**
 * Configuration for sidebar section icons
 */
export interface SidebarSectionIconConfig {
  /** Icon library to use. @default 'Feather' */
  library?: IconLibrary;
  /** Name of the icon from the specified library */
  name: string;
  /** Icon size in pixels. @default 14 */
  size?: number;
}

/**
 * Props for the SidebarSection component
 */
export interface SidebarSectionProps {
  /** Optional section header title */
  title?: string;
  /** Optional icon configuration for the section header */
  icon?: SidebarSectionIconConfig;
  /** Section content (usually SidebarItem components) */
  children: React.ReactNode;
  /** Custom styles */
  style?: StyleProp<ViewStyle>;
  /** Test ID for testing */
  testID?: string;
}

// 3. COMPONENT

/**
 * Groups sidebar items with an optional section header
 */
export const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  icon,
  children,
  style,
  testID,
}) => {
  const { values: theme } = useThemeContext();
  const tokens = theme.tokens.sidebar;
  const spacing = theme.spacing;

  const renderSectionIcon = () => {
    if (!icon) return null;
    const iconSize = icon.size || 14;
    const iconLibrary = icon.library || 'Feather';
    return (
      <View style={styles.iconContainer}>
        {renderIcon(icon, iconLibrary, iconSize, theme.onSurfaceVariant)}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        style,
      ]}
      testID={testID}
    >
      {title && (
        <View
          style={[
            styles.header,
            { paddingHorizontal: spacing.md, gap: spacing.xs },
          ]}
        >
          {renderSectionIcon()}
          <Typography
            variant="labelSmall"
            weight="medium"
            color={theme.onSurfaceVariant}
            uppercase
          >
            {title}
          </Typography>
        </View>
      )}

      <View style={styles.itemsContainer}>
        {children}
      </View>

      <View
        style={[
          styles.divider,
          {
            backgroundColor: tokens.divider,
          },
        ]}
      />
    </View>
  );
};

// 4. STYLES
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsContainer: {
    width: '100%',
  },
  divider: {
    width: '100%',
    height: 1,
  },
});
