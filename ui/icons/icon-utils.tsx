import React from 'react';
import * as Icons from '@expo/vector-icons';
import { PlatformIcon, IconLibrary } from '../brand/brand-types';

type IconLibraryType = keyof typeof Icons;

/**
 * Normalizes icon configuration to PlatformIcon format
 * Handles backward compatibility with string format
 */
export function normalizeIcon(
  icon: PlatformIcon | string | undefined,
  defaultLibrary: IconLibrary = 'Feather'
): { library: IconLibraryType; name: string } | null {
  if (!icon) return null;

  // String format (backward compatible) - assume default library
  if (typeof icon === 'string') {
    return { library: defaultLibrary as IconLibraryType, name: icon };
  }

  // PlatformIcon format - use specified library or default
  return {
    library: (icon.library || defaultLibrary) as IconLibraryType,
    name: icon.name,
  };
}

/**
 * Renders an icon component based on library and name
 * Returns null if icon config is invalid
 */
export function renderIcon(
  icon: PlatformIcon | string | undefined,
  defaultLibrary: IconLibrary = 'Feather',
  size: number = 20,
  color?: string
): React.ReactElement | null {
  const normalized = normalizeIcon(icon, defaultLibrary);
  if (!normalized) return null;

  const { library, name } = normalized;
  const IconComponent = Icons[library];

  if (!IconComponent) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn(`Icon library "${library}" not found. Falling back to Feather.`);
    }
    const FeatherIcon = Icons.Feather;
    return React.createElement(FeatherIcon, { name, size, color } as React.ComponentProps<typeof FeatherIcon>);
  }

  return React.createElement(IconComponent, { name, size, color } as React.ComponentProps<typeof IconComponent>);
}

/**
 * Gets icon name for Feather icon type casting
 * Used for components that specifically need Feather icons
 */
export function getFeatherIconName(
  icon: PlatformIcon | string | undefined,
  defaultLibrary: IconLibrary = 'Feather'
): string {
  const normalized = normalizeIcon(icon, defaultLibrary);
  if (!normalized) return 'circle';

  // If library is not Feather, we can't use it as Feather icon name
  // Return a fallback
  if (normalized.library !== 'Feather') {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn(`Icon library "${normalized.library}" cannot be used as Feather icon. Using fallback.`);
    }
    return 'circle';
  }

  return normalized.name;
}
