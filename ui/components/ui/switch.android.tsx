// 1. IMPORTS
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Host, Switch as UISwitch } from '@expo/ui/jetpack-compose';
import { useTheme } from '../../theme';

// 2. TYPES
export interface SwitchProps {
  /** Current on/off state */
  value: boolean;
  /** Called when the state changes */
  onValueChange?: (value: boolean) => void;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Label text — for accessibility */
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
    <View
      style={style}
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Host matchContents>
      <UISwitch
        value={value}
        onCheckedChange={onValueChange}
        enabled={!disabled}
        colors={{
          checkedThumbColor: theme.onPrimary,
          checkedTrackColor: theme.primary,
          uncheckedThumbColor: theme.outline,
          uncheckedTrackColor: theme.surfaceContainerHighest,
          disabledCheckedThumbColor: theme.surface,
          disabledCheckedTrackColor: theme.onSurface,
          disabledUncheckedThumbColor: theme.onSurface,
          disabledUncheckedTrackColor: theme.onSurface,
        }}
      />
      </Host>
    </View>
  );
};

Switch.displayName = 'Switch';

// 5. EXPORTS
export { Switch };
