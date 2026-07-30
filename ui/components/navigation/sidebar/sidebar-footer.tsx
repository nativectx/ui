// 1. IMPORTS
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useThemeContext } from '../../../theme';

// 2. TYPES

/**
 * Props for the SidebarFooter component
 */
export interface SidebarFooterProps {
  /** Footer content */
  children: React.ReactNode;
  /** Custom styles */
  style?: StyleProp<ViewStyle>;
  /** Test ID for testing */
  testID?: string;
}

// 3. COMPONENT

/**
 * Footer component for sidebar with custom content
 */
export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  children,
  style,
  testID,
}) => {
  const { values: theme } = useThemeContext();
  const spacing = theme.spacing;

  return (
    <View
      style={[
        styles.container,
        {
          padding: spacing.lg,
          borderTopWidth: 1,
          borderTopColor: theme.tokens.sidebar.divider,
        },
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
};

// 4. STYLES
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
