// 1. IMPORTS
import React, { forwardRef, useState } from 'react';
import {
  Platform,
  Pressable,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Typography } from './typography';
import { useTheme } from '../../theme';
import type { InteractiveComponentProps } from '../shared/types';
import { blurOnWeb } from '../shared/utils';

// 2. TYPES
export interface ListItemProps extends Omit<InteractiveComponentProps, 'accessibilityRole'> {
  /** Primary text */
  title: string;
  /** Secondary text shown below the title */
  subtitle?: string;
  /** Leading element — icon, avatar, image */
  leading?: React.ReactNode;
  /** Trailing element — icon, text, action */
  trailing?: React.ReactNode;
  /** Whether this item is in a selected state */
  selected?: boolean;
}

// 3. COMPONENT
const ListItem = forwardRef<View, ListItemProps>(({
  title,
  subtitle,
  leading,
  trailing,
  selected = false,
  disabled = false,
  onPress,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
}, ref) => {
  const theme = useTheme();
  const t = theme.tokens.list;
  const [hovered, setHovered] = useState(false);

  const bgColor = selected
    ? t.selectedBg
    : hovered && Platform.OS === 'web'
    ? t.pressedBg
    : 'transparent';

  const titleColor = selected ? t.selectedText : (disabled ? t.itemSubtextColor : t.itemText);

  const content = (
    <View style={[styles.row, { backgroundColor: bgColor, opacity: disabled ? 0.38 : 1 }, style]}>
      {leading && <View style={styles.leading}>{leading}</View>}
      <View style={styles.textBlock}>
        <Typography variant="bodyLarge" style={{ color: titleColor }} numberOfLines={1}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="bodySmall" style={{ color: t.itemSubtextColor }} numberOfLines={2}>
            {subtitle}
          </Typography>
        )}
      </View>
      {trailing && <View style={styles.trailing}>{trailing}</View>}
    </View>
  );

  if (!onPress) {
    return <View ref={ref} testID={testID}>{content}</View>;
  }

  return (
    <Pressable
      ref={ref}
      testID={testID}
      disabled={disabled}
      onPress={(e) => { blurOnWeb(e); onPress(); }}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, selected }}
      android_ripple={
        Platform.OS === 'android' && !disabled
          ? { color: theme.primary + '40', borderless: false }
          : undefined
      }
    >
      {content}
    </Pressable>
  );
});

ListItem.displayName = 'ListItem';

// 4. STYLES
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  leading: {
    marginRight: 16,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  trailing: {
    marginLeft: 16,
  },
});

// 5. EXPORTS
export { ListItem };
