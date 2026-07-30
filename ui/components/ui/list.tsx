// 1. IMPORTS
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

// 2. TYPES
export interface ListProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// 3. COMPONENT
const List = ({ children, style }: ListProps) => {
  const theme = useTheme();
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
