import React, { useState } from 'react';
import { View, Platform, StyleSheet, type ViewProps, type ViewStyle, type LayoutChangeEvent } from 'react-native';
import { useTheme } from '../../theme';
import { useDimensions, breakpoints } from '../../hooks';

export type ThemedViewVariant = 'surface' | 'surfaceContainer' | 'card' | 'appbar' | 'primary' | 'background';
export type ElevationLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface ThemedViewProps extends ViewProps {
  /** Variant selects a semantic background from the theme */
  variant?: ThemedViewVariant;
  /** Override with a specific color */
  color?: string;
  /** Apply border radius from theme. @default true */
  rounded?: boolean;
  /** M3 elevation level (0–5). Card variant defaults to 1. */
  elevation?: ElevationLevel;
  /** Number of columns on medium+ screens (1 column on small). Enables responsive grid layout. */
  columns?: number;
  /** Gap between items when columns is set */
  gap?: number;
}

// Shadow opacity and radius per M3 elevation level
const ELEVATION_SHADOW: Record<ElevationLevel, { opacity: number; radius: number; offsetY: number }> = {
  0: { opacity: 0,    radius: 0,  offsetY: 0 },
  1: { opacity: 0.15, radius: 2,  offsetY: 1 },
  2: { opacity: 0.20, radius: 4,  offsetY: 2 },
  3: { opacity: 0.25, radius: 8,  offsetY: 4 },
  4: { opacity: 0.28, radius: 10, offsetY: 6 },
  5: { opacity: 0.32, radius: 14, offsetY: 8 },
};

export function elevationStyle(level: ElevationLevel, shadowColor: string): ViewStyle {
  if (level === 0) return {};
  const { opacity, radius, offsetY } = ELEVATION_SHADOW[level];
  if (Platform.OS === 'web') {
    return { boxShadow: `0px ${offsetY}px ${radius * 2}px rgba(0,0,0,${opacity})` } as ViewStyle;
  }
  return {
    shadowColor,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: level === 1 ? 1 : level === 2 ? 3 : level === 3 ? 6 : level === 4 ? 8 : 12,
  };
}

export const ThemedView = ({ variant = 'surface', color, rounded = true, elevation, columns, gap, style, children, onLayout, ...rest }: ThemedViewProps) => {
  const theme = useTheme();
  const { width } = useDimensions();
  const isMid = width >= breakpoints.medium;
  const [containerWidth, setContainerWidth] = useState(0);

  const variantMap: Record<ThemedViewVariant, string> = {
    surface: theme.surface,
    surfaceContainer: theme.surfaceContainer ?? theme.surface,
    card: theme.surfaceContainer,
    appbar: theme.tokens.appbar.background,
    primary: theme.primary,
    background: theme.surface,
  };

  const backgroundColor = color ?? variantMap[variant] ?? theme.surface;

  // Card defaults to elevation level 1; others default to 0
  const resolvedElevation: ElevationLevel = elevation ?? (variant === 'card' ? 1 : 0);

  const viewStyle: ViewStyle[] = [
    { backgroundColor },
    ...(rounded ? [{ borderRadius: theme.shape.surfaceBorderRadius }] : []),
    elevationStyle(resolvedElevation, theme.shadow),
  ];

  // Handle responsive grid layout
  if (columns && columns > 1) {
    // Resolve gap from prop, falling back to gap in style
    const flatStyle = style ? StyleSheet.flatten(style) : undefined;
    const effectiveGap = gap ?? (flatStyle as any)?.gap ?? 0;
    const gapOffset = effectiveGap * (columns - 1) / columns;

    const containerStyle: ViewStyle = {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: effectiveGap,
    };

    const handleLayout = (e: LayoutChangeEvent) => {
      setContainerWidth(e.nativeEvent.layout.width);
      onLayout?.(e);
    };

    const responsiveChildren = React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;

      let itemStyle: ViewStyle;

      if (!isMid) {
        // Small screens: single column
        itemStyle = { width: '100%' };
      } else if (Platform.OS === 'web') {
        // Web: use calc() for precise sizing
        itemStyle = {
          flexBasis: `calc(${100 / columns}% - ${gapOffset}px)` as any,
          flexGrow: 0,
          flexShrink: 0,
          maxWidth: `calc(${100 / columns}% - ${gapOffset}px)` as any,
        };
      } else if (containerWidth > 0) {
        // Native: use measured width for pixel-perfect sizing
        const itemWidth = (containerWidth - effectiveGap * (columns - 1)) / columns;
        itemStyle = { width: itemWidth, flexGrow: 0, flexShrink: 0 };
      } else {
        // Native fallback before layout measurement
        itemStyle = { flexBasis: `${Math.floor(100 / columns)}%`, flexShrink: 1 };
      }

      return React.cloneElement(child as React.ReactElement<any>, {
        style: [(child as React.ReactElement<any>).props.style, itemStyle],
      });
    });

    return (
      <View style={[viewStyle, containerStyle, style]} onLayout={handleLayout} {...rest}>
        {responsiveChildren}
      </View>
    );
  }

  return (
    <View style={[viewStyle, style]} onLayout={onLayout} {...rest}>
      {children}
    </View>
  );
};

ThemedView.displayName = 'ThemedView';

export default ThemedView;
