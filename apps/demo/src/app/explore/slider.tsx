import React, { useState } from 'react';
import { View } from 'react-native';
import { Slider, Typography, ThemedView, useTheme } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const sliderProps: PropDefinition[] = [
  {
    name: 'value',
    type: 'number',
    default: '0',
    description: 'Current value of the slider',
  },
  {
    name: 'minimumValue',
    type: 'number',
    default: '0',
    description: 'Minimum value',
  },
  {
    name: 'maximumValue',
    type: 'number',
    default: '1',
    description: 'Maximum value',
  },
  {
    name: 'step',
    type: 'number',
    default: '0',
    description: 'Step increment. 0 means continuous.',
  },
  {
    name: 'onValueChange',
    type: '(value: number) => void',
    description: 'Called continuously as the slider moves',
  },
  {
    name: 'onSlidingComplete',
    type: '(value: number) => void',
    description: 'Called when the user releases the slider',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables interaction and dims the slider',
  },
];

export default function SliderPage() {
  const { spacing } = useTheme();
  const [basicValue, setBasicValue] = useState(0.5);
  const [stepValue, setStepValue] = useState(40);

  return (
    <DocsPage
      title="Slider"
      description="Material Design 3 slider for selecting a value from a continuous or stepped range."
    >
      <DemoSection
        title="Basic Slider"
        description="Continuous slider between 0 and 1."
        code={`const [value, setValue] = useState(0.5);\n\n<Slider value={value} onValueChange={setValue} />`}
      >
        <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.md }}>
          <Slider value={basicValue} onValueChange={setBasicValue} />
          <Typography variant="bodySmall" muted>
            Value: {basicValue.toFixed(2)}
          </Typography>
        </ThemedView>
      </DemoSection>

      <DemoSection
        title="With Step"
        description="Snaps to discrete values at the specified step interval."
        code={`<Slider\n  value={value}\n  minimumValue={0}\n  maximumValue={100}\n  step={10}\n  onValueChange={setValue}\n/>`}
      >
        <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.md }}>
          <Slider
            value={stepValue}
            minimumValue={0}
            maximumValue={100}
            step={10}
            onValueChange={setStepValue}
          />
          <Typography variant="bodySmall" muted>
            Value: {stepValue}
          </Typography>
        </ThemedView>
      </DemoSection>

      <DemoSection
        title="Disabled"
        description="Disabled sliders are non-interactive and visually dimmed."
        code={`<Slider value={0.6} disabled />`}
      >
        <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm }}>
          <Slider value={0.6} disabled />
        </ThemedView>
      </DemoSection>

      <DemoSection
        title="Theming"
        description="Slider colors come directly from the palette."
        code={`// Active track + thumb: theme.primary\n// Inactive track: theme.surfaceContainerHighest`}
      >
        <View style={{ gap: spacing.md }}>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">Active Track</Typography>
            <Typography variant="bodySmall" muted>
              Uses theme.primary.
            </Typography>
          </ThemedView>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">Inactive Track</Typography>
            <Typography variant="bodySmall" muted>
              Uses theme.surfaceContainerHighest.
            </Typography>
          </ThemedView>
        </View>
      </DemoSection>

      <ApiSection props={sliderProps} />
      <DocsPagination />
    </DocsPage>
  );
}
