import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Typography, useTheme, renderIcon, SegmentedControl } from '@nativectx/ui';
import { Highlight, themes } from 'prism-react-renderer';
import * as Clipboard from 'expo-clipboard';

const TAB_OPTIONS = [
  { value: 'preview', label: 'Preview' },
  { value: 'code', label: 'Code' },
];

interface DemoSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  code?: string;
  /** Remove preview padding — use for layout components (Container, Screen) that need edge-to-edge display. @default true */
  padded?: boolean;
}

type Tab = 'preview' | 'code';

export function DemoSection({ title, description, children, code, padded = true }: DemoSectionProps) {
  const theme = useTheme();
  const { spacing, shape, outlineVariant, surfaceContainerHigh, primary, onSurfaceVariant, isDark } = theme;
  const [tab, setTab] = useState<Tab>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Preview: pure white in light, dark editor surface in dark — maximum contrast
  const previewBg = isDark ? '#161b22' : '#ffffff';
  const codeBg = isDark ? '#0d1117' : '#f6f8fa';
  const codeHeaderBg = isDark ? '#161b22' : '#eef0f3';
  const codeBorderColor = isDark ? '#30363d' : '#d0d7de';

  return (
    <View style={{ gap: spacing.sm, paddingTop: spacing.sm }}>
      <Typography variant="titleLarge" weight="bold">{title}</Typography>
      {description && (
        <Typography variant="bodyMedium" muted>{description}</Typography>
      )}

      <View style={[styles.card, { borderRadius: shape.surfaceBorderRadius, borderColor: outlineVariant }]}>

        {/* Tab bar — sits on page background, no fill */}
        {code && (
          <View style={[styles.tabBar, { borderBottomColor: outlineVariant, backgroundColor: theme.surface }]}>
            <SegmentedControl
              options={TAB_OPTIONS}
              value={tab}
              onChange={(v) => setTab(v as Tab)}
            />
          </View>
        )}

        {/* Preview canvas — white/dark surface, generous padding, no dot-grid */}
        {(!code || tab === 'preview') && (
          <View style={[
            styles.preview,
            { backgroundColor: previewBg, gap: spacing.lg },
            !padded && styles.previewFlush,
          ]}>
            {children}
          </View>
        )}

        {/* Code pane */}
        {code && tab === 'code' && (
          <View>
            <View style={[styles.codeHeader, { backgroundColor: codeHeaderBg, borderBottomColor: codeBorderColor }]}>
              <View style={[styles.langBadge, { backgroundColor: isDark ? '#21262d' : '#dce0e5' }]}>
                <Text style={[styles.langText, { color: onSurfaceVariant }]}>tsx</Text>
              </View>
              <Pressable
                onPress={handleCopy}
                style={({ pressed }) => [
                  styles.copyButton,
                  {
                    backgroundColor: pressed ? surfaceContainerHigh : 'transparent',
                    borderRadius: shape.surfaceBorderRadius,
                  },
                ]}
                accessibilityLabel="Copy code"
                accessibilityRole="button"
              >
                {renderIcon(
                  { name: copied ? 'check' : 'copy', library: 'Feather' },
                  'Feather',
                  14,
                  copied ? primary : onSurfaceVariant,
                )}
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ backgroundColor: codeBg }}
              contentContainerStyle={styles.codeBody}
            >
              <Highlight
                theme={isDark ? themes.vsDark : themes.github}
                code={code.trim()}
                language="tsx"
              >
                {({ tokens, getTokenProps }) => (
                  <View>
                    {tokens.map((line, i) => (
                      <View key={i} style={{ flexDirection: 'row' }}>
                        {line.map((token, key) => {
                          const { style, children } = getTokenProps({ token });
                          return (
                            <Text
                              key={key}
                              style={{
                                color: (style as { color?: string })?.color ?? (isDark ? '#adbac7' : '#24292f'),
                                fontFamily: 'monospace',
                                fontSize: 13,
                                lineHeight: 22,
                              }}
                            >
                              {children as string}
                            </Text>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                )}
              </Highlight>
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  tabBar: {
    height: 52,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  preview: {
    minHeight: 120,
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  previewFlush: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  langBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  langText: {
    fontFamily: 'monospace',
    fontSize: 11,
  },
  copyButton: {
    padding: 4,
  },
  codeBody: {
    padding: 16,
  },
});
