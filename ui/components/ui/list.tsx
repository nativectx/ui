// 1. IMPORTS
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

// 2. TYPES
export interface ListProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// 3. COMPONENT

/**
 * Scrollable list container with optional header and footer.
 *
 * @category collections
 */
const List = ({ children, style }: ListProps) => {
  return (
    <View
      style={style}
      accessibilityRole="list"
    >
      {children}
    </View>
  );
};

List.displayName = 'List';

// 4. EXPORTS
export { List };
