// Navigation components
export { AppTabs } from './app-tabs';
export type { AppTabsProps, AppTabConfig, AppTabsExternalLink } from './app-tabs';

// NativeHeader — screen-level header buttons for iOS (Stack.Toolbar) and Android (headerLeft/headerRight)
export { NativeHeader } from './native-header';
export type { NativeHeaderProps } from './native-header';

// ThemedStack — Stack wrapper with automatic theme token header styling
export { ThemedStack } from './themed-stack';

// Drawer — low-level animated side drawer (used by Sidebar and AppTabs)
export { Drawer } from './drawer/drawer';
export type { DrawerProps } from './drawer/drawer';

// Sidebar components
export {
  Sidebar,
  SidebarItem,
  SidebarSection,
  SidebarHeader,
  SidebarFooter,
} from './sidebar';
export type {
  SidebarProps,
  SidebarItemProps,
  SidebarItemIconConfig,
  SidebarSectionProps,
  SidebarSectionIconConfig,
  SidebarHeaderProps,
  SidebarFooterProps,
} from './sidebar';
