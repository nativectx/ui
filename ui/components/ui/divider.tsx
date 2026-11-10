// 1. IMPORTS
import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '../../theme';

// 2. TYPES
export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerInset = 'none' | 'start' | 'middle';

export interface DividerProps {
  /** Direction of the divider. @default 'horizontal' */
  orientation?: DividerOrientation;
  /** Inset variant adding margin on one or both sides. @default 'none' */
  inset?: DividerInset;
  /** Override the divider color */
  color?: string;
  style?: StyleProp<ViewStyle>;
}

// 3. COMPONENT

/**
 * Divider line using M3 outline color. Horizontal dividers stretch within a
 * column or block parent; supply an explicit width when composing one in a row.
 *
 * @category layout
 */
const Divider = ({ orientation = 'horizontal', inset = 'none', color, style }: DividerProps) => {
  const theme = useTheme();
  const dividerColor = color ?? theme.tokens.list.divider;

  const insetStyle: ViewStyle =
    inset === 'start'
      ? orientation === 'horizontal' ? { marginStart: 16 } : { marginLeft: 16 }
      : inset === 'middle'
      ? orientation === 'horizontal' ? { marginStart: 16, marginEnd: 16 } : { marginHorizontal: 16 }
      : {};

  const lineStyle: ViewStyle =
    orientation === 'horizontal'
      ? { height: StyleSheet.hairlineWidth, alignSelf: 'stretch' }
      : { width: StyleSheet.hairlineWidth, height: '100%' };

  return (
    <View
      style={[lineStyle, { backgroundColor: dividerColor }, insetStyle, style]}
      accessibilityRole="none"
    />
  );
};

Divider.displayName = 'Divider';

// 4. EXPORTS
export { Divider };
