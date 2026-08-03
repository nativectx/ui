// 1. IMPORTS
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import type { BaseComponentProps } from '../shared/types';

let RNSlider: React.ComponentType<any> | null = null;
try {
  RNSlider = require('@react-native-community/slider').default;
} catch {
  // optional peer dependency not installed
}

// 2. TYPES

/**
 * Props for the Slider component.
 *
 * @example
 * ```tsx
 * // Basic slider
 * <Slider value={0.5} onValueChange={setValue} />
 *
 * // With step and range
 * <Slider value={volume} minimumValue={0} maximumValue={100} step={10} onValueChange={setVolume} />
 *
 * // Controlled with complete callback
 * <Slider value={value} onValueChange={setValue} onSlidingComplete={onCommit} />
 * ```
 */
export interface SliderProps extends BaseComponentProps {
  /** Current value of the slider */
  value?: number;
  /** Minimum value. @default 0 */
  minimumValue?: number;
  /** Maximum value. @default 1 */
  maximumValue?: number;
  /** Step increment between values. @default 0 (continuous) */
  step?: number;
  /** Called continuously as the slider moves */
  onValueChange?: (value: number) => void;
  /** Called when the user finishes sliding */
  onSlidingComplete?: (value: number) => void;
  /** Whether the slider is disabled */
  disabled?: boolean;
  /** Accessibility label read by screen readers */
  accessibilityLabel?: string;
}

// 3. COMPONENT

/**
 * Horizontal value slider using native platform controls.
 *
 * https://m3.material.io/components/sliders
 * Wraps @react-native-community/slider with M3 theme colors.
 * Active track: primary. Inactive track: surfaceContainerHighest. Thumb: primary.
 *
 * @category controls
 */
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
  if (!RNSlider) {
    throw new Error(
      '[@nativectx/ui] <Slider> requires @react-native-community/slider. ' +
        'Install it with: npx expo install @react-native-community/slider',
    );
  }

  const theme = useTheme();

  return (
    <View style={[styles.container, style]} testID={testID}>
      <RNSlider
        value={value}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        disabled={disabled}
        onValueChange={onValueChange}
        onSlidingComplete={onSlidingComplete}
        minimumTrackTintColor={disabled ? theme.onSurfaceVariant : theme.primary}
        maximumTrackTintColor={theme.surfaceContainerHighest}
        thumbTintColor={disabled ? theme.onSurfaceVariant : theme.primary}
        style={styles.slider}
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
};

Slider.displayName = 'Slider';

// 4. STYLES
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

// 5. EXPORTS
export { Slider };
