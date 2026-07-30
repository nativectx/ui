// 1. IMPORTS
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Host, ProgressView } from '@expo/ui/swift-ui';
import { progressViewStyle, tint, frame } from '@expo/ui/swift-ui/modifiers';
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
  size = 48,
  style,
}: ProgressIndicatorProps) => {
  const theme = useTheme();
  const indicatorColor = color ?? theme.primary;

  if (variant === 'circular') {
    return (
      <View
        accessibilityRole="progressbar"
        accessibilityValue={value !== undefined ? { min: 0, max: 100, now: Math.round(value * 100) } : undefined}
        style={style}
      >
        <Host matchContents>
          <ProgressView
            value={value}
            modifiers={[
              progressViewStyle('circular'),
              tint(indicatorColor),
              frame({ width: size, height: size }),
            ]}
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
        <ProgressView
          value={value}
          modifiers={[progressViewStyle('linear'), tint(indicatorColor)]}
        />
      </Host>
    </View>
  );
};

ProgressIndicator.displayName = 'ProgressIndicator';

// 5. EXPORTS
export { ProgressIndicator };
