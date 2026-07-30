import React from 'react';
import { View } from 'react-native';
import { Typography, useTheme } from '@nativectx/ui';
import { PropsTable, type PropDefinition } from './props-table';

interface ApiSectionProps {
  props: PropDefinition[];
  title?: string;
}

export function ApiSection({ props, title = 'Props' }: ApiSectionProps) {
  const theme = useTheme();
  const { spacing } = theme;

  return (
    <View style={{ gap: spacing.lg, paddingTop: spacing.xxl, marginTop: spacing.md, borderTopWidth: 1, borderTopColor: theme.outlineVariant }}>
      <View style={{ gap: spacing.xs }}>
        <Typography variant="titleLarge" weight="bold">{title}</Typography>
        <Typography variant="bodySmall" muted>
          Full API reference for this component.
        </Typography>
      </View>
      <PropsTable props={props} />
    </View>
  );
}
