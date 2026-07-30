import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Typography, ThemedView, useTheme } from '@nativectx/ui';

export interface PropDefinition {
  name: string;
  type: string;
  default?: string;
  description: string;
}

interface PropsTableProps {
  props: PropDefinition[];
}

function CodePill({ value, color }: { value: string; color: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.surfaceContainerHigh,
        borderWidth: 1,
        borderColor: theme.outlineVariant,
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ fontFamily: 'monospace', fontSize: 11, color, lineHeight: 16 }}>
        {value}
      </Text>
    </View>
  );
}

export function PropsTable({ props }: PropsTableProps) {
  const theme = useTheme();
  const { spacing } = theme;

  const rowStyle = {
    flexDirection: 'row' as const,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <ThemedView variant="surface" style={{ borderRadius: spacing.sm, overflow: 'hidden', minWidth: 600 }}>
        {/* Header row */}
        <View style={[rowStyle, { borderBottomWidth: 2, borderBottomColor: theme.outlineVariant }]}>
          <View style={{ width: 120 }}>
            <Typography variant="labelSmall" weight="bold" color={theme.onSurfaceVariant}>PROP</Typography>
          </View>
          <View style={{ width: 200 }}>
            <Typography variant="labelSmall" weight="bold" color={theme.onSurfaceVariant}>TYPE</Typography>
          </View>
          <View style={{ width: 100 }}>
            <Typography variant="labelSmall" weight="bold" color={theme.onSurfaceVariant}>DEFAULT</Typography>
          </View>
          <View style={{ flex: 1, minWidth: 180 }}>
            <Typography variant="labelSmall" weight="bold" color={theme.onSurfaceVariant}>DESCRIPTION</Typography>
          </View>
        </View>

        {/* Data rows */}
        {props.map((prop, index) => (
          <View
            key={prop.name}
            style={[
              rowStyle,
              index < props.length - 1 && { borderBottomColor: theme.outlineVariant, borderBottomWidth: 1 },
            ]}
          >
            {/* Prop name */}
            <View style={{ width: 120, justifyContent: 'flex-start' }}>
              <CodePill value={prop.name} color={theme.primary} />
            </View>
            {/* Type */}
            <View style={{ width: 200, justifyContent: 'flex-start' }}>
              <CodePill value={prop.type} color={theme.onSurfaceVariant} />
            </View>
            {/* Default */}
            <View style={{ width: 100, justifyContent: 'flex-start' }}>
              {prop.default ? (
                <CodePill value={prop.default} color={theme.tertiary} />
              ) : (
                <Typography variant="bodySmall" color={theme.outlineVariant}>—</Typography>
              )}
            </View>
            {/* Description */}
            <View style={{ flex: 1, minWidth: 180 }}>
              <Typography variant="bodySmall" color={theme.onSurfaceVariant}>{prop.description}</Typography>
            </View>
          </View>
        ))}
      </ThemedView>
    </ScrollView>
  );
}
