import React, { useState } from 'react';
import { View } from 'react-native';
import { SegmentedControl, Typography, useTheme } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const segmentedControlProps: PropDefinition[] = [
  {
    name: 'options',
    type: 'SegmentedControlOption[]',
    description: 'Array of { value: string, label: string } options',
  },
  {
    name: 'value',
    type: 'string',
    description: 'Currently selected option value',
  },
  {
    name: 'onChange',
    type: '(value: string) => void',
    description: 'Called when the user selects a different option',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables all options',
  },
];

const VIEW_OPTIONS = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
];

const PERIOD_OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

export default function SegmentedControlPage() {
  const { spacing } = useTheme();
  const [view, setView] = useState('list');
  const [period, setPeriod] = useState('week');

  return (
    <DocsPage
      title="SegmentedControl"
      description="Material Design 3 Segmented Button for switching between a small set of mutually exclusive options. Renders natively on iOS (SwiftUI Picker) and Android (Compose SingleChoiceSegmentedButtonRow)."
    >
      <DemoSection
        title="Two options"
        description="The most common case — two mutually exclusive views or modes."
        code={`const [value, setValue] = useState('list');\n\n<SegmentedControl\n  options={[\n    { value: 'list', label: 'List' },\n    { value: 'grid', label: 'Grid' },\n  ]}\n  value={value}\n  onChange={setValue}\n/>`}
      >
        <View style={{ gap: spacing.md }}>
          <SegmentedControl
            options={VIEW_OPTIONS}
            value={view}
            onChange={setView}
          />
          <Typography variant="bodySmall" muted>Selected: {view}</Typography>
        </View>
      </DemoSection>

      <DemoSection
        title="Three options"
        description="Works with any number of options."
        code={`<SegmentedControl\n  options={[\n    { value: 'day', label: 'Day' },\n    { value: 'week', label: 'Week' },\n    { value: 'month', label: 'Month' },\n  ]}\n  value={period}\n  onChange={setPeriod}\n/>`}
      >
        <View style={{ gap: spacing.md }}>
          <SegmentedControl
            options={PERIOD_OPTIONS}
            value={period}
            onChange={setPeriod}
          />
          <Typography variant="bodySmall" muted>Selected: {period}</Typography>
        </View>
      </DemoSection>

      <DemoSection
        title="Disabled"
        description="All options are non-interactive and visually dimmed."
        code={`<SegmentedControl\n  options={options}\n  value="week"\n  onChange={() => {}}\n  disabled\n/>`}
      >
        <SegmentedControl
          options={PERIOD_OPTIONS}
          value="week"
          onChange={() => {}}
          disabled
        />
      </DemoSection>

      <ApiSection props={segmentedControlProps} />
      <DocsPagination />
    </DocsPage>
  );
}
