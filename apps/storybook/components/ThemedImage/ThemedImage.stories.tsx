import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedImage, Typography } from '@nativectx/ui';

const meta = {
  title: 'Components/ThemedImage',
  component: ThemedImage,
  args: {
    lightSource: require('../../../../apps/demo/assets/images/rocket_logo_black.png'),
    darkSource: require('../../../../apps/demo/assets/images/rocket_logo_white.png'),
    style: { width: 64, height: 64 },
    contentFit: 'contain' as const,
  },
  argTypes: {
    contentFit: {
      control: 'select',
      options: ['contain', 'cover', 'fill', 'none', 'scale-down'],
    },
  },
  decorators: [(Story: any) => <View style={styles.container}><Story /></View>],
} as unknown as Meta<typeof ThemedImage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ThemeToggle: Story = {
  render: () => (
    <View style={styles.row}>
      <View style={[styles.variant, styles.lightBg]}>
        <ThemedImage
          lightSource={require('../../../../apps/demo/assets/images/rocket_logo_black.png')}
          darkSource={require('../../../../apps/demo/assets/images/rocket_logo_white.png')}
          style={{ width: 64, height: 64 }}
          contentFit="contain"
        />
        <Typography variant="labelMedium">Current theme</Typography>
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  variant: { alignItems: 'center', gap: 8, padding: 16, borderRadius: 12 },
  lightBg: { backgroundColor: 'transparent' },
});
