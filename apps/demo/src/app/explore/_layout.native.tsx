import React from 'react';
import { Stack } from 'expo-router';
import {
    ThemedStack,
    Sidebar,
    SidebarHeader,
    SidebarSection,
    SidebarItem,
    useRouteNavigation,
} from '@nativectx/ui';
import { NAV_SECTIONS } from '../../config/nav';

export default function ExploreLayout() {
    const { isActive, navigateTo } = useRouteNavigation();

    return (
        <>
            <Sidebar
                header={
                    <SidebarHeader
                        title="Docs"
                        subtitle="NativeCtx UI"
                        onPress={() => navigateTo('/explore')}
                    />
                }
            >
                {NAV_SECTIONS.map((section) => (
                    <SidebarSection
                        key={section.title}
                        title={section.title}
                        icon={section.icon as any}
                    >
                        {section.items.map((item) => (
                            <SidebarItem
                                key={item.route}
                                label={item.label}
                                active={isActive(item.route, { exact: item.exact })}
                                onPress={() => navigateTo(item.route)}
                            />
                        ))}
                    </SidebarSection>
                ))}
            </Sidebar>

            <ThemedStack>
                <Stack.Screen name="mcp" options={{ title: 'MCP and Skills' }} />
                <Stack.Screen name="index" options={{ title: 'Installation' }} />
                <Stack.Screen name="nav-overview" options={{ title: 'Navigation' }} />
                <Stack.Screen name="nav-tabs" options={{ title: 'Tabs' }} />
                <Stack.Screen name="nav-sidebar" options={{ title: 'Sidebar' }} />
                <Stack.Screen name="nav-stack" options={{ title: 'Stack & Headers' }} />
                <Stack.Screen name="nav-hooks" options={{ title: 'Navigation Hooks' }} />
                <Stack.Screen name="theming" options={{ title: 'Theming' }} />
                <Stack.Screen name="tokens" options={{ title: 'Tokens' }} />
                <Stack.Screen name="icons" options={{ title: 'Icons' }} />
                <Stack.Screen name="screen" options={{ title: 'Screen' }} />
                <Stack.Screen name="container" options={{ title: 'Container' }} />
                <Stack.Screen name="themed-view" options={{ title: 'ThemedView' }} />
                <Stack.Screen name="typography" options={{ title: 'Typography' }} />
                <Stack.Screen name="themed-image" options={{ title: 'ThemedImage' }} />
                <Stack.Screen name="avatar" options={{ title: 'Avatar' }} />
                <Stack.Screen name="button" options={{ title: 'Button' }} />
                <Stack.Screen name="icon-button" options={{ title: 'IconButton' }} />
                <Stack.Screen name="chip" options={{ title: 'Chip' }} />
                <Stack.Screen name="divider" options={{ title: 'Divider' }} />
                <Stack.Screen name="slider" options={{ title: 'Slider' }} />
                <Stack.Screen name="switch" options={{ title: 'Switch' }} />
                <Stack.Screen name="segmented-control" options={{ title: 'SegmentedControl' }} />
                <Stack.Screen name="fab" options={{ title: 'FAB' }} />
                <Stack.Screen name="list" options={{ title: 'List' }} />
                <Stack.Screen name="modal" options={{ title: 'Modal' }} />
                <Stack.Screen name="progress-indicator" options={{ title: 'ProgressIndicator' }} />
                <Stack.Screen name="text-input" options={{ title: 'TextInput' }} />
                <Stack.Screen name="collapsible" options={{ title: 'Collapsible' }} />
                <Stack.Screen name="app-tabs" options={{ title: 'AppTabs' }} />
                <Stack.Screen name="sidebar" options={{ title: 'Sidebar' }} />
                <Stack.Screen name="drawer" options={{ title: 'Drawer' }} />
                <Stack.Screen name="themed-stack" options={{ title: 'ThemedStack' }} />
                <Stack.Screen name="native-header" options={{ title: 'NativeHeader' }} />
            </ThemedStack>
        </>
    );
}
