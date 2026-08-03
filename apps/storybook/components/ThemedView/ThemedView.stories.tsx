import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedView , Typography } from '@nativectx/ui';

const meta = {
  title: 'Components/ThemedView',
  component: ThemedView,
  args: {
    variant: 'surface',
    color: undefined,
    elevation: undefined,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['surface', 'surfaceContainer', 'card', 'appbar', 'primary', 'background'],
    },
    color: { control: 'color' },
    elevation: {
      control: 'select',
      options: [undefined, 0, 1, 2, 3, 4, 5],
      description: 'M3 elevation level (0–5). Card variant defaults to 1.',
    },
  },
  decorators: [(Story: any) => <View style={styles.container}><Story /></View>],
} as unknown as Meta<typeof ThemedView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <ThemedView {...args} rounded style={styles.box}>
      <Typography variant="titleMedium">ThemedView ({args.variant})</Typography>
    </ThemedView>
  ),
};

export const Variants: Story = {
  render: () => (
    <View style={styles.row}>
      <ThemedView variant="surface" rounded style={styles.gap}><Typography>Surface</Typography></ThemedView>
      <ThemedView variant="surfaceContainer" rounded style={styles.gap}><Typography>SurfaceContainer</Typography></ThemedView>
      <ThemedView variant="card" rounded style={styles.gap}><Typography>Card</Typography></ThemedView>
      <ThemedView variant="appbar" rounded style={styles.gap}><Typography>Appbar</Typography></ThemedView>
      <ThemedView variant="primary" rounded style={styles.gap}><Typography color='#FFFFFF'>Primary</Typography></ThemedView>
    </View>
  ),
};

export const Elevation: Story = {
  render: () => (
    <View style={styles.row}>
      {([0, 1, 2, 3, 4, 5] as const).map((level) => (
        <ThemedView key={level} variant="card" elevation={level} rounded style={styles.gap}>
          <Typography variant="labelMedium">Level {level}</Typography>
        </ThemedView>
      ))}
    </View>
  ),
};

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  box: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' },
  gap: { margin: 8, padding: 12 },
});
