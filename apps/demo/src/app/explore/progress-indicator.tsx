import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ProgressIndicator, Typography, useTheme } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const progressProps: PropDefinition[] = [
  {
    name: 'variant',
    type: "'linear' | 'circular'",
    default: "'linear'",
    description: 'Shape of the progress indicator',
  },
  {
    name: 'value',
    type: 'number',
    description: 'Progress value 0–1. Omit for indeterminate.',
  },
  {
    name: 'color',
    type: 'string',
    description: 'Override indicator color (defaults to theme.primary)',
  },
  {
    name: 'trackColor',
    type: 'string',
    description: 'Override the background track color',
  },
  {
    name: 'size',
    type: 'number',
    default: '48',
    description: 'Circular only — diameter in dp',
  },
  {
    name: 'strokeWidth',
    type: 'number',
    default: '4',
    description: 'Circular only — stroke width in dp',
  },
  {
    name: 'style',
    type: 'ViewStyle',
    description: 'Additional styles',
  },
];

export default function ProgressIndicatorPage() {
  const theme = useTheme();
  const { spacing } = theme;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p >= 1 ? 0 : p + 0.05));
    }, 200);
    return () => clearInterval(id);
  }, []);

  return (
    <DocsPage
      title="ProgressIndicator"
      description="Material Design 3 progress indicators for linear and circular loading states."
      sidebarIcon="right"
    >
      <DemoSection
        title="Linear — Determinate"
        description="Animated progress bar showing known completion"
        code={`<ProgressIndicator variant="linear" value={0.6} />`}
      >
        <View style={{ gap: spacing.md, width: '100%' }}>
          <ProgressIndicator variant="linear" value={0.3} />
          <ProgressIndicator variant="linear" value={0.6} />
          <ProgressIndicator variant="linear" value={0.9} />
        </View>
      </DemoSection>

      <DemoSection
        title="Linear — Indeterminate"
        description="Looping animation for unknown duration"
        code={`<ProgressIndicator variant="linear" />`}
      >
        <ProgressIndicator variant="linear" />
      </DemoSection>

      <DemoSection
        title="Animated Progress"
        description="Live counter animating from 0 to 100%"
        code={`<ProgressIndicator variant="linear" value={progress} />`}
      >
        <View style={{ gap: spacing.md, width: '100%' }}>
          <ProgressIndicator variant="linear" value={progress} />
          <Typography variant="labelMedium" muted>{Math.round(progress * 100)}%</Typography>
        </View>
      </DemoSection>

      <DemoSection
        title="Circular"
        description="Compact indicator for tight spaces"
        code={`<ProgressIndicator variant="circular" value={0.75} />
<ProgressIndicator variant="circular" />`}
      >
        <View style={{ flexDirection: 'row', gap: spacing.xl, alignItems: 'center' }}>
          {[0.25, 0.5, 0.75, 1].map((v) => (
            <View key={v} style={{ alignItems: 'center', gap: spacing.xs }}>
              <ProgressIndicator variant="circular" value={v} />
              <Typography variant="labelSmall" muted>{Math.round(v * 100)}%</Typography>
            </View>
          ))}
          <View style={{ alignItems: 'center', gap: spacing.xs }}>
            <ProgressIndicator variant="circular" />
            <Typography variant="labelSmall" muted>Indet.</Typography>
          </View>
        </View>
      </DemoSection>

      <ApiSection props={progressProps} />
      <DocsPagination />
    </DocsPage>
  );
}
