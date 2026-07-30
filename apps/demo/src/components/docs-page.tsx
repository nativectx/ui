import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Typography, Screen, NativeHeader, useSidebar, useTheme } from '@nativectx/ui';

interface DocsPageProps {
  title: string;
  description: string;
  /** Import statement shown below description, e.g. "import { Button } from '@nativectx/ui'" */
  importLine?: string;
  /** Category label above the title, e.g. "Component", "Navigation", "Foundation" */
  category?: string;
  /** Which side the sidebar icon appears. @default 'left' */
  sidebarIcon?: 'left' | 'right';
  children: React.ReactNode;
}

export function DocsPage({ title, description, importLine, category, sidebarIcon = 'left', children }: DocsPageProps) {
  const { open } = useSidebar();
  const theme = useTheme();
  const { spacing } = theme;

  return (
    <>
      <NativeHeader rightIcon={`sidebar.${sidebarIcon}`} onRightPress={open} androidRightIcon="menu" />
      <Screen scrollable variant="background" edges={['bottom']}>
        <View style={[styles.content, { paddingHorizontal: spacing.xxl, paddingTop: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.xxl, maxWidth: 760, alignSelf: 'center' }]}>
          {Platform.OS !== 'android' && (
            <View style={[styles.header, { gap: spacing.md, paddingBottom: spacing.xl, borderBottomColor: theme.outlineVariant }]}>
              {category && (
                <Typography variant="labelSmall" color={theme.primary} style={{ letterSpacing: 1.5 }}>
                  {category.toUpperCase()}
                </Typography>
              )}
              <Typography variant="headlineLarge" weight="bold">
                {title}
              </Typography>
              <Typography variant="bodyLarge" muted>
                {description}
              </Typography>
              {importLine && (
                <View style={[styles.importLine, { backgroundColor: theme.surfaceContainerLow, borderColor: theme.outlineVariant, borderRadius: theme.borderRadius.md }]}>
                  <Text style={[styles.importText, { color: theme.onSurfaceVariant }]}>
                    <Text style={{ color: theme.primary }}>import</Text>
                    {' '}
                    <Text style={{ color: theme.onSurface }}>{importLine.replace(/^import\s+/, '')}</Text>
                  </Text>
                </View>
              )}
            </View>
          )}
          {children}
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
  },
  header: {
    borderBottomWidth: 1,
  },
  importLine: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  importText: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
});
