import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Slider } from '@nativectx/ui';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  args: {
    value: 0.5,
    minimumValue: 0,
    maximumValue: 1,
    step: 0,
    disabled: false,
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    minimumValue: { control: 'number' },
    maximumValue: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
    onValueChange: { action: 'value changed' },
    onSlidingComplete: { action: 'sliding complete' },
  },
  decorators: [(Story) => <View style={styles.container}><Story /></View>],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState(0.3);
    return <Slider value={value} onValueChange={setValue} />;
  },
};

export const WithStep: Story = {
  render: () => {
    const [value, setValue] = useState(40);
    return <Slider value={value} minimumValue={0} maximumValue={100} step={10} onValueChange={setValue} />;
  },
};

export const Disabled: Story = {
  args: {
    value: 0.6,
    disabled: true,
  },
};

const styles = StyleSheet.create({
  container: { padding: 24, width: '100%' },
});
