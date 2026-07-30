// 1. IMPORTS
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import {
  Host,
  LinearProgressIndicator,
  CircularProgressIndicator,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth, size as sizeModifier } from '@expo/ui/jetpack-compose/modifiers';
import { useTheme } from '../../theme';

// 2. TYPES
export type ProgressVariant = 'linear' | 'circular';

export interface ProgressIndicatorProps {
  /** Linear or circular indicator. @default 'linear' */
  variant?: ProgressVariant;
  /** Progress value 0–1. Omit for indeterminate. */
  value?: number;
  /** Override the indicator color. Defaults to theme.primary */
  color?: string;
  /** Override the track background color */
  trackColor?: string;
  /** Circular only — diameter in dp. @default 48 */
  size?: number;
  /** Circular only — stroke width in dp. @default 4 */
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

// 3. COMPONENT
const ProgressIndicator = ({
  variant = 'linear',
  value,
  color,
  trackColor,
  size = 48,
  strokeWidth = 4,
  style,
}: ProgressIndicatorProps) => {
  const theme = useTheme();
  const indicatorColor = color ?? theme.primary;
  const bgTrackColor = trackColor ?? theme.surfaceContainerHighest;
  // null = explicitly indeterminate; undefined value → null
  const progress = value ?? null;

  if (variant === 'circular') {
    return (
      <View
        accessibilityRole="progressbar"
        accessibilityValue={value !== undefined ? { min: 0, max: 100, now: Math.round(value * 100) } : undefined}
        style={style}
      >
        <Host matchContents>
          <CircularProgressIndicator
            progress={progress}
            color={indicatorColor}
            trackColor={bgTrackColor}
            strokeWidth={strokeWidth}
            modifiers={[sizeModifier(size, size)]}
          />
        </Host>
      </View>
    );
  }

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={value !== undefined ? { min: 0, max: 100, now: Math.round(value * 100) } : undefined}
      style={[{ width: '100%' }, style]}
    >
      <Host style={{ width: '100%', height: 4 }}>
        <LinearProgressIndicator
          progress={progress}
          color={indicatorColor}
          trackColor={bgTrackColor}
          modifiers={[fillMaxWidth()]}
        />
      </Host>
    </View>
  );
};

ProgressIndicator.displayName = 'ProgressIndicator';

// 5. EXPORTS
export { ProgressIndicator };
