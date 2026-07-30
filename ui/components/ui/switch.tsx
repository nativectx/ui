// 1. IMPORTS
import React from 'react';
import {
  Platform,
  Switch as RNSwitch,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Typography } from './typography';
import { useTheme } from '../../theme';

// 2. TYPES
export interface SwitchProps {
  /** Current on/off state */
  value: boolean;
  /** Called when the state changes */
  onValueChange?: (value: boolean) => void;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Optional label rendered to the left of the switch */
  label?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

// 3. COMPONENT
const Switch = ({
  value,
  onValueChange,
  disabled = false,
  label,
  style,
  testID,
  accessibilityLabel,
}: SwitchProps) => {
  const theme = useTheme();

  return (
    <View style={[styles.row, style]}>
      {label && (
        <Typography
          variant="bodyLarge"
          style={[styles.label, { color: disabled ? theme.onSurfaceVariant : theme.onSurface }]}
        >
          {label}
        </Typography>
      )}
      <RNSwitch
        value={value}
        onValueChange={disabled ? undefined : onValueChange}
        disabled={disabled}
        trackColor={{
          false: theme.surfaceContainerHighest,
          true: theme.primary,
        }}
        thumbColor={value ? theme.onPrimary : theme.outline}
        testID={testID}
        accessibilityLabel={accessibilityLabel ?? label}
        {...(Platform.OS === 'web' && { activeThumbColor: theme.onPrimary } as any)}
      />
    </View>
  );
};

Switch.displayName = 'Switch';

// 4. STYLES
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    flex: 1,
  },
});

// 5. EXPORTS
export { Switch };
