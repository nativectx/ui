import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { Divider, Typography } from '@nativectx/ui';

const meta = {
  title: 'Components/Divider',
  component: Divider,
  args: {
    orientation: 'horizontal',
    inset: 'none',
  },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    inset: { control: 'select', options: ['none', 'start', 'middle'] },
    color: { control: 'color' },
  },
  decorators: [(Story) => <View style={{ padding: 24, width: '100%' }}><Story /></View>],
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <View style={{ gap: 16 }}>
      <Typography>Above</Typography>
      <Divider {...args} />
      <Typography>Below</Typography>
    </View>
  ),
};

export const Orientations: Story = {
  render: () => (
    <View style={{ gap: 24 }}>
      <View style={{ gap: 8 }}>
        <Typography variant="labelMedium">Horizontal</Typography>
        <Divider orientation="horizontal" />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'stretch', height: 48, gap: 8 }}>
        <Typography variant="labelMedium">Vertical</Typography>
        <Divider orientation="vertical" />
        <Typography variant="labelMedium">Separator</Typography>
      </View>
    </View>
  ),
};

export const Inset: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Typography variant="labelSmall">none</Typography>
      <Divider inset="none" />
      <Typography variant="labelSmall">start</Typography>
      <Divider inset="start" />
      <Typography variant="labelSmall">middle</Typography>
      <Divider inset="middle" />
    </View>
  ),
};
