/**
 * Icon utilities for @nativectx/ui
 *
 * Provides cross-platform icon rendering utilities that work with:
 * - SF Symbols on iOS
 * - Material Design icons on Android
 * - Any @expo/vector-icons library on web
 *
 * @module icons
 */

export { normalizeIcon, renderIcon, getFeatherIconName } from './icon-utils';
export type { PlatformIcon, IconLibrary } from '../brand/brand-types';
