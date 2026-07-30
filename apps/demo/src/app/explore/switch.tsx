import React, { useState } from 'react';
import { View } from 'react-native';
import { Switch, Typography, useTheme } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { PropsTable, type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const switchProps: PropDefinition[] = [
  {
    name: 'value',
    type: 'boolean',
    description: 'Current on/off state',
  },
  {
    name: 'onValueChange',
    type: '(value: boolean) => void',
    description: 'Called when the state changes',
  },
  {
    name: 'label',
    type: 'string',
    description: 'Optional label rendered beside the switch (web) or inline on iOS Toggle',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables interaction and dims the switch',
  },
];

export default function SwitchPage() {
  const { spacing } = useTheme();
  const [basic, setBasic] = useState(false);
  const [labeled, setLabeled] = useState(true);

  const rowStyle = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: spacing.xl, alignItems: 'center' as const };

  return (
    <DocsPage
      title="Switch"
      description="Material Design 3 Switch for toggling a binary setting on or off. Renders natively on iOS (SwiftUI Toggle) and Android (Compose Switch)."
    >
      <DemoSection
        title="Basic"
        description="Controlled switch — tap to toggle."
        code={`const [value, setValue] = useState(false);\n\n<Switch value={value} onValueChange={setValue} />`}
      >
        <View style={rowStyle}>
          <Switch value={basic} onValueChange={setBasic} />
          <Typography variant="bodyMedium" muted>
            {basic ? 'On' : 'Off'}
          </Typography>
        </View>
      </DemoSection>

      <DemoSection
        title="With Label"
        description="An optional label is rendered beside the switch."
        code={`<Switch\n  value={value}\n  onValueChange={setValue}\n  label="Enable notifications"\n/>`}
      >
        <Switch
          value={labeled}
          onValueChange={setLabeled}
          label="Enable notifications"
        />
      </DemoSection>

      <DemoSection
        title="States"
        description="On, off, and both disabled variants."
        code={`<Switch value={true} onValueChange={() => {}} />\n<Switch value={false} onValueChange={() => {}} />\n<Switch value={true} disabled />\n<Switch value={false} disabled />`}
      >
        <View style={rowStyle}>
          <Switch value={true} onValueChange={() => {}} />
          <Switch value={false} onValueChange={() => {}} />
          <Switch value={true} disabled />
          <Switch value={false} disabled />
        </View>
      </DemoSection>

      <ApiSection props={switchProps} />
      <DocsPagination />
    </DocsPage>
  );
}
