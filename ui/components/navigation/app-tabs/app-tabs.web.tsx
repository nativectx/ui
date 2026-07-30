import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import React, { ReactNode, useState, useEffect } from 'react';
import { Pressable, View, StyleSheet, Linking } from 'react-native';
import { useThemeContext } from '../../../theme';
import { Typography } from '../../ui/typography';
import { ThemedView } from '../../ui/themed-view';
import { Link, usePathname, useRouter } from 'expo-router';
import { renderIcon, type PlatformIcon } from '../../../icons';
import { useLayout } from '../../../context/layout-context';
import { useDimensions, breakpoints } from '../../../hooks';
import { Drawer } from '../drawer/drawer';
import { SidebarItem } from '../sidebar/sidebar-item';
import { sidebarItemStyles } from '../shared/sidebar-styles';

/**
 * External link configuration for AppTabs
 */
export interface AppTabsExternalLink {
  label: string;
  href: string;
  icon?: PlatformIcon | string;
}

/**
 * SF Symbol icon configuration for iOS
 */
export interface SFSymbolIcon {
  default: string;
  selected: string;
}

export type MaterialIconName = string | { default?: string; selected: string };

/**
 * Tab configuration for AppTabs
 */
export interface AppTabConfig {
  name: string;
  href: string;
  label: string;
  sfSymbol?: SFSymbolIcon;
  materialIcon?: MaterialIconName;
  webIcon?: PlatformIcon | string;
}

/**
 * Props for AppTabs component
 */
export interface AppTabsProps {
  brandName: string;
  logoImage?: ReactNode;
  tabs: AppTabConfig[];
  externalLinks?: AppTabsExternalLink[];
  height?: number;
  /** Native-only: called when hamburger is pressed on native platforms */
  onPrimaryMenuPress?: () => void;
  /** Native-only: background color of the tab bar */
  backgroundColor?: string;
  /** Native-only: iOS blur effect applied behind the tab bar */
  blurEffect?: string;
}

/**
 * Material 3 themed tabs component for navigation.
 * Responsive: right-side drawer on mobile, horizontal tabs on desktop.
 */
export default function AppTabs({
  brandName,
  logoImage,
  tabs,
  externalLinks = [],
  height = 64,
}: AppTabsProps) {
  const { setAppBarHeight } = useLayout();
  const { width } = useDimensions();
  const isMobile = width < breakpoints.large;
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setAppBarHeight(height);
  }, [height, setAppBarHeight]);

  // Close drawer on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <Tabs>
      <TabList asChild>
        <CustomTabList
          brandName={brandName}
          logoImage={logoImage}
          externalLinks={externalLinks}
          height={height}
          isMobile={isMobile}
          onMenuPress={() => setMenuOpen(true)}>
          {tabs.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton webIcon={tab.webIcon} materialIcon={tab.materialIcon}>
                {tab.label}
              </TabButton>
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>

      <TabSlot style={{ flex: 1, overflow: 'hidden' }} />

      {isMobile && <Drawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        side="right"
        header={
          <DrawerHeader brandName={brandName} logoImage={logoImage} />
        }>
        {tabs.map((tab) => {
          const icon = tab.webIcon
            ? (typeof tab.webIcon === 'string' ? { name: tab.webIcon } : tab.webIcon)
            : tab.materialIcon
            ? { library: 'MaterialIcons' as const, name: resolveMaterialIconName(tab.materialIcon) }
            : undefined;
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
          return (
            <SidebarItem
              key={tab.name}
              label={tab.label}
              icon={icon}
              active={isActive}
              onPress={() => router.push(tab.href as any)}
            />
          );
        })}

        {externalLinks.length > 0 && <DrawerDivider />}

        {externalLinks.map((link, i) => {
          const icon = link.icon
            ? (typeof link.icon === 'string' ? { name: link.icon } : link.icon)
            : undefined;
          return (
            <SidebarItem
              key={i}
              label={link.label}
              icon={icon}
              onPress={() => Linking.openURL(link.href)}
            />
          );
        })}
      </Drawer>}
    </Tabs>
  );
}

// --- Tab bar button (desktop) ---

function resolveMaterialIconName(icon: MaterialIconName): string {
  if (typeof icon === 'string') return icon;
  return icon.default ?? icon.selected;
}

interface TabButtonProps extends TabTriggerSlotProps {
  children: ReactNode;
  webIcon?: PlatformIcon | string;
  materialIcon?: MaterialIconName;
}

function TabButton({ children, isFocused, webIcon, materialIcon, ...props }: TabButtonProps) {
  const { values: theme } = useThemeContext();
  const spacing = theme.spacing;
  const [hovered, setHovered] = useState(false);

  const iconToRender = webIcon || (materialIcon ? { library: 'MaterialIcons' as const, name: resolveMaterialIconName(materialIcon) } : undefined);
  const iconColor = isFocused || hovered ? theme.primary : theme.onSurfaceVariant;

  return (
    <Pressable
      {...props}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }: any) => [
        { paddingHorizontal: spacing.lg, alignSelf: 'stretch', justifyContent: 'center' },
        pressed && { opacity: 0.7 },
      ]}>
      <View style={[styles.tabButtonContent, { gap: spacing.sm }]}>
        {iconToRender && renderIcon(iconToRender, 'MaterialIcons', 20, iconColor)}
        <Typography variant="labelLarge" weight="medium" color={iconColor}>
          {children}
        </Typography>
      </View>
      {isFocused && (
        <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />
      )}
    </Pressable>
  );
}

// --- Custom tab list (the app bar) ---

interface CustomTabListProps extends TabListProps {
  brandName: string;
  logoImage?: ReactNode;
  externalLinks: AppTabsExternalLink[];
  height: number;
  isMobile: boolean;
  onMenuPress: () => void;
}

function CustomTabList({
  brandName,
  logoImage,
  externalLinks,
  height,
  isMobile,
  onMenuPress,
  children,
  ...props
}: CustomTabListProps) {
  const { values: theme } = useThemeContext();
  const spacing = theme.spacing;

  return (
    <ThemedView
      variant="appbar"
      rounded={false}
      style={[styles.appBar, { height, paddingHorizontal: spacing.xxl, borderBottomWidth: 1, borderBottomColor: theme.tokens.appbar.border }]}>
      <View {...props} style={[styles.appBarContent, { gap: spacing.sm }]}>
        <Link href="/" style={styles.brand}>
          <View style={[styles.brandContent, { gap: spacing.sm }]}>
            {logoImage}
            <Typography variant="titleLarge" weight="medium">{brandName}</Typography>
          </View>
        </Link>

        {!isMobile && (
          <>
            <View style={[styles.tabs, { gap: spacing.xs }]}>{children}</View>
            {externalLinks.length > 0 && (
              <View style={[styles.tabs, { gap: spacing.xs, marginLeft: spacing.lg }]}>
                {externalLinks.map((link, i) => (
                  <ExternalLinkButton key={i} {...link} />
                ))}
              </View>
            )}
          </>
        )}

        {isMobile && (
          <Pressable
            onPress={onMenuPress}
            accessibilityLabel="Open menu"
            accessibilityRole="button"
            style={({ pressed }: any) => [
              styles.iconButton,
              { padding: spacing.sm, borderRadius: theme.shape.buttonBorderRadius },
              pressed && { opacity: 0.7 },
            ]}>
            {renderIcon({ library: 'Feather', name: 'menu' }, 'Feather', 24, theme.onSurface)}
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

// --- Desktop external link button ---

function ExternalLinkButton({ href, label, icon }: AppTabsExternalLink) {
  const { values: theme } = useThemeContext();
  const spacing = theme.spacing;
  const [hovered, setHovered] = useState(false);

  const color = hovered ? theme.primary : theme.onSurfaceVariant;

  return (
    <Link href={href as any} target="_blank" asChild>
      <Pressable
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={({ pressed }: any) => [
          { paddingHorizontal: spacing.lg, alignSelf: 'stretch', justifyContent: 'center', borderRadius: theme.shape.buttonBorderRadius },
          pressed && { opacity: 0.7 },
        ]}>
        <View style={[styles.tabButtonContent, { gap: spacing.sm }]}>
          {icon && renderIcon(icon, 'MaterialIcons', 20, color)}
          <Typography variant="labelLarge" weight="medium" color={color}>
            {label}
          </Typography>
        </View>
      </Pressable>
    </Link>
  );
}

// --- Drawer header ---

function DrawerHeader({ brandName, logoImage }: { brandName: string; logoImage?: ReactNode }) {
  const { values: theme } = useThemeContext();
  const spacing = theme.spacing;

  return (
    <View style={[styles.drawerHeader, { padding: spacing.lg, borderBottomColor: theme.tokens.sidebar.divider }]}>
      <View style={[styles.brandContent, { gap: spacing.sm }]}>
        {logoImage}
        <Typography variant="titleMedium" weight="bold">{brandName}</Typography>
      </View>
    </View>
  );
}

function DrawerDivider() {
  const { values: theme } = useThemeContext();
  return <View style={[sidebarItemStyles.divider, { backgroundColor: theme.tokens.sidebar.divider }]} />;
}

// --- Styles ---

const styles = StyleSheet.create({
  appBar: { width: '100%', flexDirection: 'row', alignItems: 'center' },
  appBarContent: { flexDirection: 'row', alignItems: 'center', flex: 1, alignSelf: 'stretch' },
  brand: { marginRight: 'auto' },
  brandContent: { flexDirection: 'row', alignItems: 'center' },
  tabs: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  tabButtonContent: { flexDirection: 'row', alignItems: 'center' },
  activeIndicator: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  iconButton: { alignItems: 'center', justifyContent: 'center' },
  drawerHeader: { borderBottomWidth: 1, width: '100%' },
});
