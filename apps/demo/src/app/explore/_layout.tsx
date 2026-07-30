import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Slot } from 'expo-router';
import {
    ThemedView,
    Sidebar,
    SidebarHeader,
    SidebarSection,
    SidebarItem,
    useDimensions,
    breakpoints,
    useRouteNavigation,
} from '@nativectx/ui';
import { NAV_SECTIONS } from '../../config/nav';

export default function ExploreLayout() {
    const { width } = useDimensions();
    const isDesktop = width >= breakpoints.large;
    const { isActive, navigateTo } = useRouteNavigation();

    return (
        <View style={styles.container}>
            <Sidebar
                avoidAppBar
                header={
                    <SidebarHeader
                        title="Docs"
                        subtitle="Zero to App UI"
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

            <ThemedView
                variant="background"
                rounded={false}
                style={[
                    styles.content,
                    isDesktop && styles.contentWithSidebar,
                ]}
            >
                <Slot />
            </ThemedView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    content: {
        flex: 1,
    },
    contentWithSidebar: {
        marginLeft: 280,
    },
});
