import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useEffect, useRef, useState } from 'react';
import { View, Animated } from 'react-native';
import { ProgressIndicator, Typography } from '@nativectx/ui';

const meta = {
  title: 'Components/ProgressIndicator',
  component: ProgressIndicator,
  args: {
    variant: 'linear',
    value: 0.6,
  },
  argTypes: {
    variant: { control: 'select', options: ['linear', 'circular'] },
    value: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    color: { control: 'color' },
    trackColor: { control: 'color' },
  },
  decorators: [(Story: any) => <View style={{ padding: 24, gap: 16 }}><Story /></View>],
} as unknown as Meta<typeof ProgressIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <ProgressIndicator {...args} />,
};

export const Linear: Story = {
  render: () => (
    <View style={{ gap: 24 }}>
      <View style={{ gap: 8 }}>
        <Typography variant="labelMedium">Determinate (60%)</Typography>
        <ProgressIndicator variant="linear" value={0.6} />
      </View>
      <View style={{ gap: 8 }}>
        <Typography variant="labelMedium">Indeterminate</Typography>
        <ProgressIndicator variant="linear" />
      </View>
    </View>
  ),
};

export const Circular: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 32, alignItems: 'center' }}>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <ProgressIndicator variant="circular" value={0.75} />
        <Typography variant="labelSmall">75%</Typography>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <ProgressIndicator variant="circular" />
        <Typography variant="labelSmall">Indeterminate</Typography>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <ProgressIndicator variant="circular" value={0.4} size={64} strokeWidth={6} />
        <Typography variant="labelSmall">Large</Typography>
      </View>
    </View>
  ),
};
