import React from 'react';
import {View} from 'react-native';
import {Typography, ThemedView, useTheme} from '@nativectx/ui';
import {DemoSection} from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import {PropsTable, type PropDefinition} from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const screenProps: PropDefinition[] = [
    {
        name: 'children',
        type: 'React.ReactNode',
        description: 'Screen content',
    },
    {
        name: 'scrollable',
        type: 'boolean',
        default: 'false',
        description: 'Whether to wrap content in ScrollView',
    },
    {
        name: 'variant',
        type: "'surface' | 'surfaceContainer' | 'card' | 'appbar' | 'primary' | 'background'",
        default: "'background'",
        description: 'Themed background variant',
    },
    {
        name: 'edges',
        type: "Edge[] ('top' | 'bottom' | 'left' | 'right')[]",
        default: "['bottom']",
        description: 'Which safe area edges to respect',
    },
    {
        name: 'contentContainerStyle',
        type: 'StyleProp<ViewStyle>',
        description: 'Styles for the ScrollView content container (only applies if scrollable=true)',
    },
    {
        name: 'style',
        type: 'StyleProp<ViewStyle>',
        description: 'Styles for the outer container',
    },
    {
        name: 'showsVerticalScrollIndicator',
        type: 'boolean',
        default: 'true',
        description: 'Whether to show vertical scroll indicator',
    },
    {
        name: 'testID',
        type: 'string',
        description: 'Test ID for testing',
    },
];

export default function ScreenPage() {
    const {spacing} = useTheme();
    const rowStyle = {flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: spacing.md};

    return (
        <DocsPage
            title="Screen"
            description="Screen wrapper component providing consistent layout with safe areas, themed backgrounds, and optional scrolling."
            sidebarIcon="right"
        >
            <DemoSection
                title="Features"
                description="Key features of the Screen component"
            >
                <View style={{gap: spacing.md}}>
                    <ThemedView variant="surfaceContainer"
                                style={{padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs}}>
                        <Typography variant="labelLarge" weight="medium">Safe Area Support</Typography>
                        <Typography variant="bodySmall" muted>
                            Automatically handles notches, status bars, and home indicators via SafeAreaView
                        </Typography>
                    </ThemedView>

                    <ThemedView variant="surfaceContainer"
                                style={{padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs}}>
                        <Typography variant="labelLarge" weight="medium">Themed Backgrounds</Typography>
                        <Typography variant="bodySmall" muted>
                            Consistent background colors via ThemedView with variant support
                        </Typography>
                    </ThemedView>

                    <ThemedView variant="surfaceContainer"
                                style={{padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs}}>
                        <Typography variant="labelLarge" weight="medium">Optional Scrolling</Typography>
                        <Typography variant="bodySmall" muted>
                            Enable scrollable content with the scrollable prop
                        </Typography>
                    </ThemedView>
                </View>
            </DemoSection>

            <DemoSection
                title="Basic Usage"
                description="Non-scrollable screen with default settings"
                code={`<Screen variant="background">
  <Typography variant="headlineLarge">Welcome</Typography>
  <Button title="Get Started" />
</Screen>`}
            >
                <ThemedView variant="surfaceContainer" style={{padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs}}>
                    <Typography variant="labelMedium" weight="medium">Non-scrollable</Typography>
                    <Typography variant="bodySmall" muted>Default — content fills the screen</Typography>
                </ThemedView>
            </DemoSection>

            <DemoSection
                title="Scrollable Screen"
                description="Enable scrolling for long content"
                code={`<Screen
  scrollable
  variant="surface"
  contentContainerStyle={{ padding: spacing.xxl, gap: spacing.lg }}
>
  <Typography>Content 1</Typography>
  <Typography>Content 2</Typography>
</Screen>`}
            >
                <ThemedView variant="surfaceContainer" style={{padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs}}>
                    <Typography variant="labelMedium" weight="medium">Scrollable</Typography>
                    <Typography variant="bodySmall" muted>Wraps children in a ScrollView</Typography>
                </ThemedView>
            </DemoSection>

            <DemoSection
                title="Custom Safe Area Edges"
                description="Control which edges respect safe areas"
                code={`// Top only
<Screen edges={['top']} />

// Bottom only (most common — avoids home indicator)
<Screen edges={['bottom']} />

// All edges
<Screen edges={['top', 'bottom', 'left', 'right']} />

// No safe area insets
<Screen edges={[]} />`}
            >
                <View style={rowStyle}>
                    <ThemedView variant="surfaceContainer" style={{
                        padding: spacing.md,
                        borderRadius: spacing.sm,
                        minWidth: 120,
                        gap: spacing.xs
                    }}>
                        <Typography variant="labelSmall" weight="medium">Top only</Typography>
                        <Typography variant="labelSmall" muted style={{fontFamily: 'monospace'}}>
                            edges={`{['top']}`}
                        </Typography>
                    </ThemedView>

                    <ThemedView variant="surfaceContainer" style={{
                        padding: spacing.md,
                        borderRadius: spacing.sm,
                        minWidth: 120,
                        gap: spacing.xs
                    }}>
                        <Typography variant="labelSmall" weight="medium">Bottom only</Typography>
                        <Typography variant="labelSmall" muted style={{fontFamily: 'monospace'}}>
                            edges={`{['bottom']}`}
                        </Typography>
                    </ThemedView>

                    <ThemedView variant="surfaceContainer" style={{
                        padding: spacing.md,
                        borderRadius: spacing.sm,
                        minWidth: 120,
                        gap: spacing.xs
                    }}>
                        <Typography variant="labelSmall" weight="medium">All edges</Typography>
                        <Typography variant="labelSmall" muted style={{fontFamily: 'monospace'}}>
                            edges={`{['top', 'bottom', 'left', 'right']}`}
                        </Typography>
                    </ThemedView>

                    <ThemedView variant="surfaceContainer" style={{
                        padding: spacing.md,
                        borderRadius: spacing.sm,
                        minWidth: 120,
                        gap: spacing.xs
                    }}>
                        <Typography variant="labelSmall" weight="medium">No edges</Typography>
                        <Typography variant="labelSmall" muted style={{fontFamily: 'monospace'}}>
                            edges={`{[]}`}
                        </Typography>
                    </ThemedView>
                </View>
            </DemoSection>

            <DemoSection
                title="Background Variants"
                description="Use different themed backgrounds"
                code={`<Screen variant="background">...</Screen>
<Screen variant="surface">...</Screen>
<Screen variant="surfaceContainer">...</Screen>`}
            >
                <View style={rowStyle}>
                    <ThemedView variant="background" style={{
                        padding: spacing.lg,
                        borderRadius: spacing.sm,
                        minWidth: 100,
                        alignItems: 'center'
                    }}>
                        <Typography variant="labelSmall">background</Typography>
                    </ThemedView>
                    <ThemedView variant="surface" style={{
                        padding: spacing.lg,
                        borderRadius: spacing.sm,
                        minWidth: 100,
                        alignItems: 'center'
                    }}>
                        <Typography variant="labelSmall">surface</Typography>
                    </ThemedView>
                    <ThemedView variant="surfaceContainer" style={{
                        padding: spacing.lg,
                        borderRadius: spacing.sm,
                        minWidth: 100,
                        alignItems: 'center'
                    }}>
                        <Typography variant="labelSmall">surfaceContainer</Typography>
                    </ThemedView>
                </View>
            </DemoSection>

            <ApiSection props={screenProps} />
            <DocsPagination />
        </DocsPage>
    );
}
