// 1. IMPORTS
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
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

const LINEAR_HEIGHT = 4;
const TRACK_BORDER_RADIUS = 2;

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
  const [reduceMotion, setReduceMotion] = useState(false);

  const indicatorColor = color ?? theme.primary;
  const bgTrackColor = trackColor ?? theme.surfaceContainerHighest;
  const isIndeterminate = value === undefined;

  useEffect(() => {
    let mounted = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { AccessibilityInfo } = require('react-native');
      AccessibilityInfo?.isReduceMotionEnabled?.().then((enabled: boolean) => {
        if (mounted) setReduceMotion(!!enabled);
      });
    } catch (e) { /* ignore */ }
    return () => { mounted = false; };
  }, []);

  if (variant === 'circular') {
    return (
      <CircularIndicator
        value={value}
        color={indicatorColor}
        trackColor={bgTrackColor}
        size={size}
        strokeWidth={strokeWidth}
        reduceMotion={reduceMotion}
        style={style}
      />
    );
  }

  return (
    <LinearIndicator
      value={value}
      color={indicatorColor}
      trackColor={bgTrackColor}
      isIndeterminate={isIndeterminate}
      reduceMotion={reduceMotion}
      style={style}
    />
  );
};

// ─── Linear ───────────────────────────────────────────────────────────────────

interface LinearProps {
  value?: number;
  color: string;
  trackColor: string;
  isIndeterminate: boolean;
  reduceMotion: boolean;
  style?: StyleProp<ViewStyle>;
}

const LinearIndicator = ({ value, color, trackColor, isIndeterminate, reduceMotion, style }: LinearProps) => {
  const translateX = useRef(new Animated.Value(-1)).current;
  const widthAnim = useRef(new Animated.Value(value ?? 0)).current;

  // Determinate: animate to new value
  useEffect(() => {
    if (!isIndeterminate) {
      if (reduceMotion) {
        widthAnim.setValue(value ?? 0);
      } else {
        Animated.timing(widthAnim, {
          toValue: value ?? 0,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      }
    }
  }, [value, isIndeterminate, reduceMotion, widthAnim]);

  // Indeterminate: looping slide.
  // useNativeDriver must be false — the translateX interpolation outputs
  // percentage strings ('-100%', '280%') which the native driver cannot handle.
  // Web converts them to CSS translateX fine; native needs the JS thread here.
  useEffect(() => {
    if (!isIndeterminate || reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, { toValue: -1, duration: 0, useNativeDriver: false }),
        Animated.timing(translateX, { toValue: 1.5, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isIndeterminate, reduceMotion, translateX]);

  return (
    <View
      style={[styles.linearTrack, { backgroundColor: trackColor }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={isIndeterminate ? undefined : { min: 0, max: 100, now: Math.round((value ?? 0) * 100) }}
    >
      {isIndeterminate ? (
        <Animated.View
          style={[
            styles.linearBar,
            {
              backgroundColor: color,
              width: '45%',
              transform: [{ translateX: translateX.interpolate({ inputRange: [-1, 1.5], outputRange: ['-100%' as any, '280%' as any] }) }],
            },
          ]}
        />
      ) : (
        <Animated.View
          style={[
            styles.linearBar,
            {
              backgroundColor: color,
              width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      )}
    </View>
  );
};

// ─── Circular ─────────────────────────────────────────────────────────────────

interface CircularProps {
  value?: number;
  color: string;
  trackColor: string;
  size: number;
  strokeWidth: number;
  reduceMotion: boolean;
  style?: StyleProp<ViewStyle>;
}

// Web-only: SVG circular indicator
const CircularIndicator = ({ value, color, trackColor, size, strokeWidth, reduceMotion, style }: CircularProps) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const isIndeterminate = value === undefined;

  useEffect(() => {
    if (!isIndeterminate || reduceMotion) return;
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [isIndeterminate, reduceMotion, rotation]);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const progress = isIndeterminate ? 0.75 : (value ?? 0);
  const offset = circumference * (1 - progress);

  return (
    <Animated.View
      style={[{ width: size, height: size }, style, isIndeterminate && { transform: [{ rotate: spin }] }]}
      accessibilityRole="progressbar"
      accessibilityValue={isIndeterminate ? undefined : { min: 0, max: 100, now: Math.round((value ?? 0) * 100) }}
    >
      {/* @ts-ignore — svg renders fine on web via react-native-web */}
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* @ts-ignore */}
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        {/* @ts-ignore */}
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
    </Animated.View>
  );
};

// 4. STYLES
const styles = StyleSheet.create({
  linearTrack: {
    height: LINEAR_HEIGHT,
    borderRadius: TRACK_BORDER_RADIUS,
    overflow: 'hidden',
    width: '100%',
  },
  linearBar: {
    height: '100%',
    borderRadius: TRACK_BORDER_RADIUS,
  },
});

ProgressIndicator.displayName = 'ProgressIndicator';

// 5. EXPORTS
export { ProgressIndicator };
