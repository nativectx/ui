import React from 'react';
import { View } from 'react-native';
import { Divider, Typography, useTheme } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const dividerProps: PropDefinition[] = [
  {
    name: 'orientation',
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description: 'Direction of the divider line',
  },
  {
    name: 'inset',
    type: "'none' | 'start' | 'middle'",
    default: "'none'",
    description: 'Adds margin to one or both sides (start = left, middle = both)',
  },
  {
    name: 'color',
    type: 'string',
    description: 'Override the divider color',
  },
  {
    name: 'style',
    type: 'ViewStyle',
    description: 'Additional styles to apply',
  },
];

export default function DividerPage() {
  const theme = useTheme();
  const { spacing } = theme;

  return (
    <DocsPage
      title="Divider"
      description="A thin line used to separate content into distinct sections."
      sidebarIcon="right"
    >
      <DemoSection
        title="Horizontal"
        description="Full-width horizontal divider"
        code={`<Divider />`}
      >
        <View style={{ gap: spacing.md, width: '100%' }}>
          <Typography>Above the divider</Typography>
          <Divider />
          <Typography>Below the divider</Typography>
        </View>
      </DemoSection>

      <DemoSection
        title="Vertical"
        description="Vertical divider for inline content separation"
        code={`<View style={{ flexDirection: 'row', height: 24 }}>
  <Typography>Left</Typography>
  <Divider orientation="vertical" style={{ marginHorizontal: 12 }} />
  <Typography>Right</Typography>
</View>`}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 32, gap: 0 }}>
          <Typography variant="bodyMedium">Left</Typography>
          <Divider orientation="vertical" style={{ marginHorizontal: 12 }} />
          <Typography variant="bodyMedium">Center</Typography>
          <Divider orientation="vertical" style={{ marginHorizontal: 12 }} />
          <Typography variant="bodyMedium">Right</Typography>
        </View>
      </DemoSection>

      <DemoSection
        title="Inset"
        description="Inset variants for use inside lists"
        code={`<Divider inset="none" />
<Divider inset="start" />
<Divider inset="middle" />`}
      >
        <View style={{ gap: spacing.md, width: '100%' }}>
          <Typography variant="labelSmall" muted>{'inset="none"'}</Typography>
          <Divider inset="none" />
          <Typography variant="labelSmall" muted>{'inset="start"'}</Typography>
          <Divider inset="start" />
          <Typography variant="labelSmall" muted>{'inset="middle"'}</Typography>
          <Divider inset="middle" />
        </View>
      </DemoSection>

      <ApiSection props={dividerProps} />
      <DocsPagination />
    </DocsPage>
  );
}
