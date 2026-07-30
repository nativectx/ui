import React, { ReactNode } from 'react';
import type { SFSymbol } from 'sf-symbols-typescript';
import type { AndroidSymbol } from 'expo-symbols';
import { useThemeContext } from '../../../theme';

// ─── Types ────────────────────────────────────────────────────────────────────

/** SF Symbol names for default and selected tab states (iOS) */
export interface SFSymbolIcon {
  default: string;
  selected: string;
}

/**
 * Android Material icon for a tab.
 * Pass a plain string for a single icon, or `{ default, selected }` to use
 * distinct icons for unselected / selected states (requires RN Screens 4.25+,
 * available from SDK 56).
 */
export type MaterialIconName =
  | string
  | { default?: string; selected: string };

/** Tab route configuration */
export interface AppTabConfig {
  /** Unique tab name (used for routing) */
  name: string;
  /** Tab route href */
  href: string;
  /** Tab display label */
  label: string;
  /** iOS SF Symbol icons — default and selected states */
  sfSymbol?: SFSymbolIcon;
  /**
   * Android Material icon.
   * Plain string uses the same icon for both states.
   * Object form `{ default, selected }` shows a different icon when the tab is active.
   */
  materialIcon?: MaterialIconName;
  /** Web icon (web only) */
  webIcon?: any;
}

/** External link shown in the app bar (web only) */
export interface AppTabsExternalLink {
  label: string;
  href: string;
  icon?: any;
}

/** Props for the AppTabs component */
export interface AppTabsProps {
  /** Brand or app name */
  brandName?: string;
  /** Optional logo image */
  logoImage?: ReactNode;
  /** Tab route configurations */
  tabs: AppTabConfig[];
  /** External links shown in the app bar (web only) */
  externalLinks?: AppTabsExternalLink[];
  /** App bar height in pixels (web only) */
  height?: number;
  /** Called when the hamburger button is pressed (native only) */
  onPrimaryMenuPress?: () => void;
  /**
   * When true, iPadOS and macOS promote the tab bar to a collapsible sidebar.
   * Has no effect on iPhone. Requires iOS 18+.
   * @platform iOS
   */
  sidebarAdaptable?: boolean;
  /**
   * Background color of the tab bar.
   * @platform iOS, Android
   */
  backgroundColor?: string;
  /**
   * iOS blur effect applied behind the tab bar (e.g. 'light', 'dark', 'regular').
   * @platform iOS
   */
  blurEffect?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalize materialIcon to the shape NativeTabs.Trigger.Icon expects for `md`. */
function normalizeMd(
  materialIcon: MaterialIconName | undefined,
): AndroidSymbol | { default?: AndroidSymbol; selected: AndroidSymbol } | undefined {
  if (!materialIcon) return undefined;
  if (typeof materialIcon === 'string') return materialIcon as AndroidSymbol;
  return {
    default: materialIcon.default as AndroidSymbol | undefined,
    selected: materialIcon.selected as AndroidSymbol,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Native platform tabs for mobile (iOS/Android).
 * Uses true native tabs via expo-router/unstable-native-tabs.
 * For the web variant see app-tabs.web.tsx.
 */
export default function AppTabs({ tabs, sidebarAdaptable, backgroundColor, blurEffect }: AppTabsProps) {
  const { values: theme } = useThemeContext();
  // Deferred require prevents expo-router/unstable-native-tabs from being
  // evaluated at barrel init time, which causes downstream exports to be
  // undefined in Metro's synchronous module evaluation pass.
  const { NativeTabs } = require('expo-router/unstable-native-tabs');

  return (
    <NativeTabs
      tintColor={theme.primary}
      iconColor={theme.onSurfaceVariant}
      sidebarAdaptable={sidebarAdaptable}
      backgroundColor={backgroundColor}
      blurEffect={blurEffect}
    >
      {tabs.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          {(tab.sfSymbol || tab.materialIcon) && (
            <NativeTabs.Trigger.Icon
              sf={
                tab.sfSymbol
                  ? ({
                      default: tab.sfSymbol.default as SFSymbol,
                      selected: tab.sfSymbol.selected as SFSymbol,
                    } as { default?: SFSymbol; selected: SFSymbol })
                  : undefined
              }
              md={normalizeMd(tab.materialIcon)}
            />
          )}
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
