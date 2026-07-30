// 1. IMPORTS
import React, { useState } from 'react';
import { View, Image, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { Typography } from './typography';
import { useTheme } from '../../theme';

// 2. TYPES
export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  /** Display name — used for initials and deterministic background color */
  name?: string;
  /** Image URI. Falls back to initials if load fails or not provided */
  src?: string;
  /** Size variant. @default 'md' */
  size?: AvatarSize;
  /** Override background color */
  color?: string;
  /** Override text/initials color */
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}

// Size config
const SIZE_CONFIG: Record<AvatarSize, { dimension: number; fontSize: number }> = {
  sm: { dimension: 32, fontSize: 12 },
  md: { dimension: 40, fontSize: 16 },
  lg: { dimension: 56, fontSize: 22 },
};

/** Hash a string to a number 0–5 for picking a container color */
function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % 6;
}

/** Extract up to 2 initials from a name */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// 3. COMPONENT
const Avatar = ({ name = '', src, size = 'md', color, textColor, style }: AvatarProps) => {
  const theme = useTheme();
  const [imageError, setImageError] = useState(false);

  const { dimension, fontSize } = SIZE_CONFIG[size];

  // Deterministic color from name
  const containerColors = [
    { bg: theme.primaryContainer, fg: theme.onPrimaryContainer },
    { bg: theme.secondaryContainer, fg: theme.onSecondaryContainer },
    { bg: theme.tertiaryContainer, fg: theme.onTertiaryContainer },
    { bg: theme.errorContainer, fg: theme.onErrorContainer },
    { bg: theme.surfaceContainerHigh, fg: theme.onSurface },
    { bg: theme.surfaceContainerHighest, fg: theme.onSurface },
  ];

  const colorPair = containerColors[hashName(name)];
  const bgColor = color ?? colorPair.bg;
  const fgColor = textColor ?? colorPair.fg;

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    backgroundColor: bgColor,
    overflow: 'hidden',
  };

  const showImage = !!src && !imageError;

  return (
    <View style={[styles.container, containerStyle, style]}>
      {showImage ? (
        <Image
          source={{ uri: src }}
          style={StyleSheet.absoluteFill}
          onError={() => setImageError(true)}
          accessibilityLabel={name || 'Avatar'}
        />
      ) : (
        <Typography
          style={{ fontSize, lineHeight: fontSize * 1.2, color: fgColor, fontWeight: '500' }}
          accessibilityLabel={name ? `Avatar for ${name}` : 'Avatar'}
        >
          {getInitials(name)}
        </Typography>
      )}
    </View>
  );
};

Avatar.displayName = 'Avatar';

// 4. STYLES
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// 5. EXPORTS
export { Avatar };
