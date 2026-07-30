import React from 'react';
import { Image, ImageProps, ImageSource } from 'expo-image';
import { useThemeMode } from '../../theme';

export interface ThemedImageProps extends Omit<ImageProps, 'source'> {
  lightSource: ImageSource;
  darkSource: ImageSource;
}

export function ThemedImage({ lightSource, darkSource, ...props }: ThemedImageProps) {
  const { mode } = useThemeMode();
  const source = mode === 'dark' ? darkSource : lightSource;

  return <Image source={source} {...props} />;
}
