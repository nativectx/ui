import { StyleSheet } from 'react-native';
import type { ThemeValuesType } from '../../../theme';

type SidebarTokens = ThemeValuesType['tokens']['sidebar'];

/**
 * Shared static styles for sidebar/drawer menu items.
 * Used by SidebarItem and AppTabs DrawerMenuItem for consistency.
 */
export const sidebarItemStyles = StyleSheet.create({
  container: {
    minHeight: 48,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
  },
});

/**
 * Returns background and text colors for a sidebar menu item based on active state.
 */
export function getSidebarItemColors(tokens: SidebarTokens, active: boolean) {
  return {
    backgroundColor: active ? tokens.itemActiveBg : 'transparent',
    textColor: active ? tokens.itemActiveText : tokens.itemText,
  };
}
