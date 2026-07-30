// 1. IMPORTS
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Typography } from './typography';
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

/**
 * Material Design 3 Segmented Button — web / fallback implementation.
 * Pill-style segment track; active pill fills with primary colour.
 * Native platforms use SwiftUI Picker (iOS) and Compose
 * SingleChoiceSegmentedButtonRow (Android) via platform-specific files.
 */
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
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);

  const trackBg = theme.isDark
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(0,0,0,0.06)';

  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tablist"
      style={style}
    >
      <View style={[styles.track, { backgroundColor: trackBg, borderRadius: 20 }]}>
        {options.map((opt) => {
          const isSelected = opt.value === value;
          const isHovered = hoveredValue === opt.value;

          return (
            <Pressable
              key={opt.value}
              role="tab"
              aria-selected={isSelected}
              onPress={() => !disabled && onChange(opt.value)}
              onHoverIn={() => setHoveredValue(opt.value)}
              onHoverOut={() => setHoveredValue(null)}
              style={[
                styles.pill,
                { borderRadius: 18 },
                isSelected && { backgroundColor: theme.primary },
                !isSelected && isHovered && { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
                disabled && styles.disabled,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled }}
              accessibilityLabel={opt.label}
            >
              <Typography
                variant="labelMedium"
                weight={isSelected ? 'medium' : 'regular'}
                color={
                  disabled
                    ? theme.onSurfaceVariant
                    : isSelected
                    ? theme.onPrimary
                    : theme.onSurfaceVariant
                }
              >
                {opt.label}
              </Typography>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

SegmentedControl.displayName = 'SegmentedControl';

// 4. STYLES
const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 2,
    gap: 2,
    alignSelf: 'flex-start',
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  disabled: {
    opacity: 0.38,
  },
});

// 5. EXPORTS
export { SegmentedControl };
