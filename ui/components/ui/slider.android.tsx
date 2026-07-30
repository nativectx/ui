// 1. IMPORTS
import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Host, Slider as UISlider } from '@expo/ui/jetpack-compose';
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';
import { useTheme } from '../../theme';
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
  const theme = useTheme();

  // Compose `steps` = count of discrete stops between min and max (excluding endpoints).
  // Our `step` prop is the increment size, so: steps = (range / increment) - 1.
  const composeSteps = step > 0 ? Math.round((maximumValue - minimumValue) / step) - 1 : 0;

  return (
    <View style={[styles.container, style]} testID={testID} accessibilityLabel={accessibilityLabel}>
      <Host style={styles.host}>
        <UISlider
          value={value}
          min={minimumValue}
          max={maximumValue}
          steps={composeSteps}
          enabled={!disabled}
          onValueChange={onValueChange}
          onValueChangeFinished={onSlidingComplete ? () => onSlidingComplete(value) : undefined}
          colors={{
            activeTrackColor: disabled ? theme.onSurfaceVariant : theme.primary,
            inactiveTrackColor: theme.surfaceContainerHighest,
            thumbColor: disabled ? theme.onSurfaceVariant : theme.primary,
          }}
          modifiers={[fillMaxWidth()]}
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
