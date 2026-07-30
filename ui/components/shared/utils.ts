import { Platform, type GestureResponderEvent, type ViewStyle } from 'react-native';

/**
 * Blurs the pressed element on web after interaction.
 *
 * Prevents the focus ring from lingering after mouse/pointer clicks.
 * Keyboard-triggered focus is unaffected — the ring only clears when
 * `onPress` fires (i.e. after a click or Enter key), so tabbing to the
 * element still shows the ring as expected.
 *
 * Apply inside every interactive component's `onPress` handler on web:
 * ```tsx
 * onPress={(e) => {
 *   blurOnWeb(e);
 *   onPress?.(e);
 * }}
 * ```
 */
/**
 * Returns platform-correct shadow styles.
 * Web: CSS boxShadow string (avoids deprecated shadow* props warning).
 * Native: shadowColor/Offset/Opacity/Radius + Android elevation.
 */
export const platformShadow = (
  color: string,
  offsetX: number,
  offsetY: number,
  opacity: number,
  radius: number,
  elevation?: number,
): ViewStyle => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${radius * 2}px rgba(0,0,0,${opacity})`,
    } as ViewStyle;
  }
  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    ...(elevation !== undefined ? { elevation } : {}),
  };
};

export const blurOnWeb = (e: GestureResponderEvent): void => {
  if (Platform.OS === 'web') {
    (e.currentTarget as any)?.blur?.();
  }
};
