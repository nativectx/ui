import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Switch } from '@nativectx/ui';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    value: false,
    disabled: false,
    label: '',
  },
  argTypes: {
    value: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    onValueChange: { action: 'changed' },
  },
  decorators: [(Story: any) => <View style={styles.container}><Story /></View>],
} as unknown as Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState(false);
    return <Switch value={value} onValueChange={setValue} />;
  },
};

export const WithLabel: Story = {
  render: () => {
    const [value, setValue] = useState(true);
    return (
      <Switch
        value={value}
        onValueChange={setValue}
        label="Enable notifications"
      />
    );
  },
};

export const On: Story = {
  args: { value: true },
};

export const Off: Story = {
  args: { value: false },
};

export const Disabled: Story = {
  args: { value: true, disabled: true },
};

export const DisabledOff: Story = {
  args: { value: false, disabled: true },
};

const styles = StyleSheet.create({
  container: { padding: 24, width: '100%' },
});
