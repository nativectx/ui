// 1. IMPORTS
import React, { useRef } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Host, Slider as UISlider } from '@expo/ui/swift-ui';
import { disabled as disabledModifier } from '@expo/ui/swift-ui/modifiers';
import type { BaseComponentProps } from '../shared/types';

// 2. TYPES
export interface SliderProps extends BaseComponentProps {
  value?: number;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

// 3. COMPONENT
const Slider = ({
  value = 0,
  minimumValue = 0,
  maximumValue = 1,
  step = 0,
  onValueChange,
  onSlidingComplete,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}: SliderProps) => {
  // Track last value so onSlidingComplete can report it from onEditingChanged
  const lastValueRef = useRef(value);

  return (
    <View style={[styles.container, style]} testID={testID} accessibilityLabel={accessibilityLabel}>
      <Host style={styles.host}>
        <UISlider
          value={value}
          min={minimumValue}
          max={maximumValue}
          step={step > 0 ? step : undefined}
          onValueChange={(v) => {
            lastValueRef.current = v;
            onValueChange?.(v);
          }}
          onEditingChanged={(isEditing) => {
            if (!isEditing) onSlidingComplete?.(lastValueRef.current);
          }}
          modifiers={disabled ? [disabledModifier(true)] : []}
        />
      </Host>
    </View>
  );
};

Slider.displayName = 'Slider';

// 4. STYLES
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  host: {
    width: '100%',
    height: 40,
  },
});

// 5. EXPORTS
export { Slider };
