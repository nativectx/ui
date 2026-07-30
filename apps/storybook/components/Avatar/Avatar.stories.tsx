import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { Avatar, Typography } from '@nativectx/ui';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  args: {
    name: 'Alex Amayo',
    size: 'md',
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    color: { control: 'color' },
    textColor: { control: 'color' },
  },
  decorators: [(Story: any) => <View style={{ padding: 24, alignItems: 'center' }}><Story /></View>],
} as unknown as Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <Avatar {...args} />,
};

export const Sizes: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Avatar name="Alex Amayo" size="sm" />
        <Typography variant="labelSmall">sm</Typography>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Avatar name="Alex Amayo" size="md" />
        <Typography variant="labelSmall">md</Typography>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Avatar name="Alex Amayo" size="lg" />
        <Typography variant="labelSmall">lg</Typography>
      </View>
    </View>
  ),
};

export const Initials: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {['Alex Amayo', 'Jane Doe', 'Sam', 'Chris Brown', 'Taylor Swift', 'Bob'].map((name) => (
        <Avatar key={name} name={name} size="md" />
      ))}
    </View>
  ),
};

export const WithImage: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <Avatar
        name="Broken Image"
        src="https://invalid.url/image.jpg"
        size="lg"
      />
    </View>
  ),
};
