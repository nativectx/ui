import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedControl } from '@nativectx/ui';

const OPTIONS = [
  { value: 'preview', label: 'Preview' },
  { value: 'code', label: 'Code' },
];

const OPTIONS_THREE = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  args: {
    options: OPTIONS,
    value: 'preview',
    disabled: false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
    onChange: { action: 'changed' },
  },
  decorators: [(Story: any) => <View style={styles.container}><Story /></View>],
} as unknown as Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('preview');
    return (
      <SegmentedControl
        options={OPTIONS}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const ThreeOptions: Story = {
  render: () => {
    const [value, setValue] = useState('week');
    return (
      <SegmentedControl
        options={OPTIONS_THREE}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    options: OPTIONS,
    value: 'code',
    disabled: true,
  },
};

const styles = StyleSheet.create({
  container: { padding: 24, width: '100%' },
});
