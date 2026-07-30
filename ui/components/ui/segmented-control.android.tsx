// 1. IMPORTS
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import {
  Host,
  SingleChoiceSegmentedButtonRow,
  SegmentedButton,
  Text,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';
import { useTheme } from '../../theme';

// 2. TYPES
export interface SegmentedControlOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

// 3. COMPONENT
const SegmentedControl = ({
  options,
  value,
  onChange,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}: SegmentedControlProps) => {
  const theme = useTheme();

  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      style={[{ width: '100%' }, style]}
    >
      <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
        <SingleChoiceSegmentedButtonRow modifiers={[fillMaxWidth()]}>
          {options.map((opt) => (
            <SegmentedButton
              key={opt.value}
              selected={opt.value === value}
              onClick={() => !disabled && onChange(opt.value)}
              enabled={!disabled}
              colors={{
                activeBorderColor: theme.primary,
                activeContentColor: theme.onSecondaryContainer,
                activeContainerColor: theme.secondaryContainer,
                inactiveBorderColor: theme.outline,
                inactiveContentColor: theme.onSurface,
                inactiveContainerColor: 'transparent',
                disabledActiveBorderColor: theme.onSurface,
                disabledActiveContentColor: theme.onSurface,
                disabledInactiveBorderColor: theme.onSurface,
                disabledInactiveContentColor: theme.onSurface,
              }}
            >
              <SegmentedButton.Label>
                <Text>{opt.label}</Text>
              </SegmentedButton.Label>
            </SegmentedButton>
          ))}
        </SingleChoiceSegmentedButtonRow>
      </Host>
    </View>
  );
};

SegmentedControl.displayName = 'SegmentedControl';

// 5. EXPORTS
export { SegmentedControl };
