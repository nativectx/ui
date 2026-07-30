import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FAB } from '@nativectx/ui';

const mockOnPress = () => console.log('FAB pressed');

/**
 * FAB (Floating Action Button) — Material 3
 *
 * Variants: primary, secondary, tertiary, surface
 * Sizes: small (40dp), medium (56dp), large (96dp)
 * Extended: pass a `label` prop for an extended FAB with icon + text
 */

const meta = {
  title: 'Components/FAB',
  component: FAB,
  args: {
    variant: 'primary',
    size: 'medium',
    disabled: false,
    iconName: 'plus',
    iconLibrary: 'Feather',
    label: '',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'surface'],
      description: 'M3 color variant',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'FAB size',
    },
    disabled: { control: 'boolean' },
    iconName: { control: 'text', description: 'Icon name (Feather set)' },
    iconLibrary: { control: 'text', description: 'Icon library name' },
    label: { control: 'text', description: 'Label for extended FAB' },
    onPress: { action: 'pressed' },
  },
  decorators: [(Story: any) => <View style={styles.container}><Story /></View>],
} as unknown as Meta<typeof FAB>;

export default meta;

type Story = StoryObj<typeof meta>;

const RenderTemplate = (args: any) => {
  const { iconName, iconLibrary, label, ...rest } = args;
  const icon = { name: iconName || 'plus', library: iconLibrary || 'Feather' };
  return <FAB {...rest} icon={icon} label={label || undefined} onPress={mockOnPress} />;
};

export const Playground: Story = {
  render: (args) => RenderTemplate(args),
};

export const VariantsGallery: Story = {
  render: () => (
    <View style={styles.row}>
      <FAB icon={{ name: 'plus' }} variant="primary" onPress={mockOnPress} style={styles.gap} />
      <FAB icon={{ name: 'plus' }} variant="secondary" onPress={mockOnPress} style={styles.gap} />
      <FAB icon={{ name: 'plus' }} variant="tertiary" onPress={mockOnPress} style={styles.gap} />
      <FAB icon={{ name: 'plus' }} variant="surface" onPress={mockOnPress} style={styles.gap} />
    </View>
  ),
};

export const SizesGallery: Story = {
  render: () => (
    <View style={styles.row}>
      <FAB icon={{ name: 'plus' }} size="small" onPress={mockOnPress} style={styles.gap} />
      <FAB icon={{ name: 'plus' }} size="medium" onPress={mockOnPress} style={styles.gap} />
      <FAB icon={{ name: 'plus' }} size="large" onPress={mockOnPress} style={styles.gap} />
    </View>
  ),
};

export const ExtendedFAB: Story = {
  render: () => (
    <View style={styles.column}>
      <FAB icon={{ name: 'edit-2' }} label="Compose" onPress={mockOnPress} style={styles.gap} />
      <FAB icon={{ name: 'navigation' }} label="Navigate" variant="secondary" onPress={mockOnPress} style={styles.gap} />
      <FAB icon={{ name: 'plus' }} label="Create" variant="tertiary" onPress={mockOnPress} style={styles.gap} />
      <FAB icon={{ name: 'filter' }} label="Filter" variant="surface" onPress={mockOnPress} style={styles.gap} />
    </View>
  ),
};

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' },
  column: { flexDirection: 'column', alignItems: 'flex-start', gap: 12 },
  gap: { margin: 8 },
});
