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

/**
 * `iconName` and `iconLibrary` are story-only controls rather than FAB props:
 * two flat text fields are far easier to drive from the Storybook panel than
 * the nested `icon` object, so RenderTemplate below reassembles them. Declaring
 * them here is what keeps that honest — the `as unknown as Meta<typeof FAB>`
 * cast this replaces silenced the mismatch, and as a side effect stopped
 * Storybook's indexer from being able to read the file at all.
 */
type FABStoryArgs = React.ComponentProps<typeof FAB> & {
  iconName?: string;
  // Derived from the prop rather than widened to `string`, so the control only
  // offers library names the icon renderer actually knows.
  iconLibrary?: NonNullable<React.ComponentProps<typeof FAB>['icon']>['library'];
};

const meta: Meta<FABStoryArgs> = {
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
  decorators: [(Story) => <View style={styles.container}><Story /></View>],
};

export default meta;

type Story = StoryObj<FABStoryArgs>;

const RenderTemplate = (args: FABStoryArgs) => {
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
