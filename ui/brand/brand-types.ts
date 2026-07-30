// Branding types for the application
import { ImageSourcePropType } from 'react-native';

export type Name = string;
export interface Shape {
  surfaceBorderRadius: number;
  buttonBorderRadius: number;
}

export interface BorderRadius {
  xs: number;   // 4  — chips, small badges
  sm: number;   // 8  — buttons, inputs, tabs
  md: number;   // 12 — collapsible, small FAB
  lg: number;   // 16 — cards, medium FAB
  xl: number;   // 28 — large FAB, sheets
  full: number; // 9999 — pills, circles
}

/**
 * Material Design 3 color tokens - 26 core tokens
 * All colors should be accessible with minimum 3:1 contrast for text on colors
 * Reference: https://m3.material.io/styles/color/the-color-system/color-roles
 */
export interface Colors {
  // Primary accent colors (4 tokens)
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;

  // Secondary accent colors (4 tokens)
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  // Tertiary accent colors (4 tokens)
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;

  // Error colors (4 tokens)
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  // Surface colors with hierarchy (8 tokens)
  surface: string;
  onSurface: string;
  onSurfaceVariant: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;

  // Outline colors (2 tokens)
  outline: string;
  outlineVariant: string;

  // Inverse colors (3 tokens)
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;

  // Semantic tokens (2 tokens)
  scrim: string;
  shadow: string;
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

// Logo can be ImageSourcePropType (require) or string URI
export type LogoSource = ImageSourcePropType | string;

export interface LogoConfig {
  light?: LogoSource;
  dark?: LogoSource;
}

export interface FooterLink {
  text: string;
  route: string;
}

export interface FooterLinks {
  links: FooterLink[];
  aboutText?: string; // Optional custom text for the "About" link (defaults to "About {brand.name}")
}

// Icon libraries available from @expo/vector-icons
export type IconLibrary = 
  | 'Feather' 
  | 'MaterialIcons' 
  | 'Ionicons' 
  | 'FontAwesome' 
  | 'AntDesign' 
  | 'Entypo' 
  | 'EvilIcons' 
  | 'Foundation' 
  | 'MaterialCommunityIcons' 
  | 'Octicons' 
  | 'SimpleLineIcons' 
  | 'Zocial';

// Platform-specific icon configuration
export interface PlatformIcon {
  library?: IconLibrary; // Default: 'Feather' for web/Android, 'SF Symbols' for iOS native tabs
  name: string;
}

// Navigation icon configuration with backward compatibility
// Supports both string format (backward compat - assumes Feather) and explicit PlatformIcon format
export interface NavigationIcon {
  // String format (backward compatible): assumes Feather library
  // PlatformIcon format (explicit): specifies library and name
  web?: PlatformIcon | string;
  mobile?: PlatformIcon | string; // For iOS native tabs: name is SF Symbol name (library ignored)
}

export interface NavigationItem {
  route: string; // Full route path (e.g., '/(tabs)/home')
  title: string; // Display title
  icon: NavigationIcon; // Platform-specific icons
}

export interface NavigationConfig {
  items: NavigationItem[];
}
