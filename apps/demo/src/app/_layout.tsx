import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { NativeCtxProvider, AppTabs, defaultBrand, AppTabsExternalLink, Sidebar, SidebarHeader, SidebarSection, SidebarItem, useSidebar, ThemedImage, useRouteNavigation } from '@nativectx/ui';

function TabLayoutInner() {
  const { isActive, navigateTo } = useRouteNavigation();
  const { toggle } = useSidebar();

  const externalLinks: AppTabsExternalLink[] = [
    {
      label: 'Expo Docs',
      href: 'https://docs.expo.dev',
      icon: { library: 'Feather', name: 'book-open' },
    },
  ];

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' && (
        <Sidebar
          header={
            <SidebarHeader
              title="NativeCtx UI"
              subtitle="Demo"
              onPress={() => navigateTo('/')}
            />
          }
          anchor="right"
        >
          <SidebarSection title="Navigation" icon={{ library: 'Feather', name: 'grid' }}>
            <SidebarItem label="Home" active={isActive('/')} onPress={() => navigateTo('/')} />
            <SidebarItem label="Explore" active={isActive('/explore')} onPress={() => navigateTo('/explore')} />
          </SidebarSection>
        </Sidebar>
      )}

      <AppTabs
        brandName="NativeCtx UI"
        logoImage={
          <ThemedImage
            lightSource={require('../../assets/images/rocket_logo_black.png')}
            darkSource={require('../../assets/images/rocket_logo_white.png')}
            style={{ width: 32, height: 32 }}
            contentFit="contain"
          />
        }
        tabs={[
          {
            name: 'index',
            href: '/',
            label: 'Home',
            sfSymbol: { default: 'house', selected: 'house.fill' },
            materialIcon: { default: 'home', selected: 'home' },
          },
          {
            name: 'explore',
            href: '/explore',
            label: 'Explore',
            sfSymbol: { default: 'safari', selected: 'safari.fill' },
            materialIcon: { default: 'explore', selected: 'explore' },
          },
        ]}
        externalLinks={externalLinks}
        sidebarAdaptable
        {...(Platform.OS !== 'web' ? { onPrimaryMenuPress: toggle } : {})}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <NativeCtxProvider brand={defaultBrand} ssrWidth={1440} ssrHeight={900}>
      <TabLayoutInner />
    </NativeCtxProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
