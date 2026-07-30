import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '@nativectx/ui';
import { ButtonVariants } from '@nativectx/ui';

const mockOnPress = () => console.log('pressed');

/**
 * Button (Material 3)
 *
 * This storybook file demonstrates the Material 3 variants supported by `Button`:
 * - `filled` (default high-emphasis)
 * - `elevated` (surface with elevation)
 * - `tonal` (subtle filled tone)
 * - `outlined` (transparent with border)
 * - `text` (no background)
 *
 * Props exposed in controls: `title`, `variant`, `loading`, `disabled`,
 * `iconPosition`, `color`, `backgroundColor`, and `onPress`.
 */

const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    title: 'Button',
    onPress: mockOnPress,
    variant: 'filled',
    loading: false,
    disabled: false,
    iconPosition: 'right',
    color: undefined,
    backgroundColor: undefined,
    iconName: '',
    iconLibrary: 'Feather',
  },
  argTypes: {
    title: { control: 'text', description: 'Button text label' },
    variant: {
      control: 'select',
      options: ButtonVariants as unknown as string[],
      description: 'Material 3 variant',
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    iconPosition: { control: 'select', options: ['left', 'right'] },
    color: { control: 'color' },
    backgroundColor: { control: 'color' },
    iconName: { control: 'text', description: 'Name of the icon to render (Feather set)' },
    iconLibrary: { control: 'text', description: 'Icon library name' },
    onPress: { action: 'pressed' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Use the controls to explore Material 3 variants. Prefer theme tokens for color decisions; use `color` and `backgroundColor` sparingly for overrides.',
      },
    },
  },
  decorators: [(Story: any) => <View style={styles.container}><Story /></View>],
} as unknown as Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

const RenderTemplate = (args: any) => {
  const { iconName, iconLibrary, iconSize, ...rest } = args;

  const icon = iconName ? { name: iconName, library: iconLibrary || 'Feather', size: iconSize || 18 } : undefined;

  return <Button {...rest} icon={icon} />;
};

export const Playground: Story = {
  render: (args) => RenderTemplate(args),
  args: {
    title: 'Playground',
  },
};

export const VariantsGallery: Story = {
  render: () => (
    <View style={styles.row}>
      <Button title="Filled" variant="filled" onPress={mockOnPress} style={styles.gap} />
      <Button title="Elevated" variant="elevated" onPress={mockOnPress} style={styles.gap} />
      <Button title="Tonal" variant="tonal" onPress={mockOnPress} style={styles.gap} />
      <Button title="Outlined" variant="outlined" onPress={mockOnPress} style={styles.gap} />
      <Button title="Text" variant="text" onPress={mockOnPress} style={styles.gap} />
    </View>
  ),
};

export const States: Story = {
  render: () => (
    <View style={styles.row}>
      <Button title="Elevated" variant="elevated" loading onPress={mockOnPress} style={styles.gap} />
      <Button title="Disabled" variant="filled" disabled onPress={mockOnPress} style={styles.gap} />
      <Button title="Raised" variant="elevated" onPress={mockOnPress} style={styles.gap} />
    </View>
  ),
};

export const IconExamples: Story = {
  render: () => (
    <View style={styles.row}>
      <Button title="Back" variant="outlined" icon={{ name: 'arrow-left', library: 'Feather', size: 18 }} iconPosition="left" onPress={mockOnPress} style={styles.gap} />
      <Button title="Next" variant="filled" icon={{ name: 'arrow-right', library: 'Feather', size: 18 }} iconPosition="right" onPress={mockOnPress} style={styles.gap} />
    </View>
  ),
};

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' },
  gap: { margin: 8 },
});
