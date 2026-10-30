import React from 'react';
import { Platform } from 'react-native';

/** Paint inside the visual container without clipping its shadow or focus ring. */
export const WebStateLayer = ({ color, hovered, pressed = false }: {
  color: string;
  hovered: boolean;
  pressed?: boolean;
}) => {
  if (Platform.OS !== 'web' || (!hovered && !pressed)) return null;

  return React.createElement('div', {
    'aria-hidden': true,
    style: {
      position: 'absolute',
      inset: 0,
      // CSS inheritance includes custom and individual corner radii.
      borderRadius: 'inherit',
      backgroundColor: color,
      opacity: pressed ? 0.12 : 0.08,
      pointerEvents: 'none',
    },
  });
};
