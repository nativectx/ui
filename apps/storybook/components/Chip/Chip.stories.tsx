import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip , ChipVariants } from '@nativectx/ui';

const meta = {
  title: 'Components/Chip',
  component: Chip,
  args: {
    label: 'Chip',
    variant: 'outlined',
    selected: false,
    disabled: false,
  },
  argTypes: {
    label: { control: 'text' },
    variant: {
      control: 'select',
      options: ChipVariants as unknown as string[],
    },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onPress: { action: 'pressed' },
    onIconPress: { action: 'icon pressed' },
  },
  decorators: [(Story: any) => <View style={styles.container}><Story /></View>],
} as unknown as Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <View style={styles.row}>
      <Chip label="Outlined" variant="outlined" />
      <Chip label="Filled" variant="filled" />
    </View>
  ),
};

export const FilterChips: Story = {
  render: () => {
    const [wireless, setWireless] = useState(false);
    const [bluetooth, setBluetooth] = useState(true);
    const [nfc, setNfc] = useState(false);
    return (
      <View style={styles.row}>
        <Chip label="Wireless" selected={wireless} onPress={() => setWireless(s => !s)} />
        <Chip label="Bluetooth" selected={bluetooth} onPress={() => setBluetooth(s => !s)} />
        <Chip label="NFC" selected={nfc} onPress={() => setNfc(s => !s)} />
      </View>
    );
  },
};

export const WithTrailingIcon: Story = {
  render: () => (
    <View style={styles.row}>
      <Chip label="Dismiss" icon={{ name: 'x' }} onIconPress={() => {}} />
      <Chip label="Expand" variant="filled" icon={{ name: 'chevron-down' }} onIconPress={() => {}} />
      <Chip label="Decorative" icon={{ name: 'star' }} />
    </View>
  ),
};

export const InputChips: Story = {
  render: () => {
    const [tags, setTags] = useState(['React Native', 'TypeScript', 'Expo']);
    const remove = (tag: string) => setTags(t => t.filter(i => i !== tag));
    return (
      <View style={styles.row}>
        {tags.map(tag => (
          <Chip
            key={tag}
            label={tag}
            variant="filled"
            icon={{ name: 'x' }}
            onIconPress={() => remove(tag)}
          />
        ))}
      </View>
    );
  },
};

export const States: Story = {
  render: () => (
    <View style={styles.row}>
      <Chip label="Default" />
      <Chip label="Filled" variant="filled" />
      <Chip label="Selected" selected />
      <Chip label="Disabled" disabled />
      <Chip label="Disabled Filled" variant="filled" disabled />
    </View>
  ),
};

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8 },
});
