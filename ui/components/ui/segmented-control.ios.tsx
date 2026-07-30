// 1. IMPORTS
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Host, Picker, Text } from '@expo/ui/swift-ui';
import { pickerStyle, tag, tint, disabled as disabledModifier } from '@expo/ui/swift-ui/modifiers';
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
        <Picker
          selection={value}
          onSelectionChange={(v) => onChange(String(v))}
          modifiers={[
            pickerStyle('segmented'),
            tint(theme.primary),
            ...(disabled ? [disabledModifier(true)] : []),
          ]}
        >
          {options.map((opt) => (
            <Text key={opt.value} modifiers={[tag(opt.value)]}>
              {opt.label}
            </Text>
          ))}
        </Picker>
      </Host>
    </View>
  );
};

SegmentedControl.displayName = 'SegmentedControl';

// 5. EXPORTS
export { SegmentedControl };
