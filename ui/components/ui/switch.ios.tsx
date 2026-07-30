// 1. IMPORTS
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Host, Toggle } from '@expo/ui/swift-ui';
import { tint, disabled as disabledModifier } from '@expo/ui/swift-ui/modifiers';
import { useTheme } from '../../theme';

// 2. TYPES
export interface SwitchProps {
  /** Current on/off state */
  value: boolean;
  /** Called when the state changes */
  onValueChange?: (value: boolean) => void;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Label text — rendered inline by the native Toggle */
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
  label = '',
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
      <Toggle
        isOn={value}
        label={label}
        onIsOnChange={onValueChange}
        modifiers={[
          tint(theme.primary),
          ...(disabled ? [disabledModifier(true)] : []),
        ]}
      />
      </Host>
    </View>
  );
};

Switch.displayName = 'Switch';

// 5. EXPORTS
export { Switch };
