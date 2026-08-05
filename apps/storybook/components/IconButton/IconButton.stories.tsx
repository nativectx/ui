import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, IconButtonVariants } from '@nativectx/ui';

const mockOnPress = () => console.log('pressed');

/**
 * `iconName` and `iconLibrary` are story-only controls rather than IconButton
 * props — a flat text field drives the panel better than the nested `icon`
 * object, and RenderTemplate below reassembles them.
 */
type IconButtonStoryArgs = React.ComponentProps<typeof IconButton> & {
  iconName?: string;
  iconLibrary?: NonNullable<React.ComponentProps<typeof IconButton>['icon']>['library'];
};

const meta: Meta<IconButtonStoryArgs> = {
  title: 'Components/IconButton',
  component: IconButton,
  args: {
    accessibilityLabel: 'Action',
    variant: 'standard',
    size: 'medium',
    disabled: false,
    iconName: 'heart',
    iconLibrary: 'Feather',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: IconButtonVariants as unknown as string[],
      description: 'M3 icon button variant',
    },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    disabled: { control: 'boolean' },
    accessibilityLabel: { control: 'text' },
    iconName: { control: 'text', description: 'Feather icon name' },
    iconLibrary: { control: 'text' },
    onPress: { action: 'pressed' },
  },
  decorators: [(Story) => <View style={styles.container}><Story /></View>],
};

export default meta;

type Story = StoryObj<IconButtonStoryArgs>;

const RenderTemplate = (args: IconButtonStoryArgs) => {
  const { iconName, iconLibrary, ...rest } = args;
  return (
    <IconButton
      {...rest}
      icon={{ name: iconName || 'heart', library: iconLibrary || 'Feather' }}
      onPress={mockOnPress}
    />
  );
};

export const Playground: Story = {
  render: (args) => RenderTemplate(args),
};

export const VariantsGallery: Story = {
  render: () => (
    <View style={styles.row}>
      {IconButtonVariants.map((v) => (
        <IconButton
          key={v}
          variant={v}
          icon={{ name: 'heart', library: 'Feather' }}
          accessibilityLabel={v}
          onPress={mockOnPress}
          style={styles.gap}
        />
      ))}
    </View>
  ),
};

export const Sizes: Story = {
  render: () => (
    <View style={styles.row}>
      {(['small', 'medium', 'large'] as const).map((s) => (
        <IconButton
          key={s}
          size={s}
          variant="filled"
          icon={{ name: 'star', library: 'Feather' }}
          accessibilityLabel={s}
          onPress={mockOnPress}
          style={styles.gap}
        />
      ))}
    </View>
  ),
};

export const States: Story = {
  render: () => (
    <View style={styles.row}>
      <IconButton
        variant="filled"
        icon={{ name: 'check', library: 'Feather' }}
        accessibilityLabel="Active"
        onPress={mockOnPress}
        style={styles.gap}
      />
      <IconButton
        variant="filled"
        disabled
        icon={{ name: 'check', library: 'Feather' }}
        accessibilityLabel="Disabled"
        onPress={mockOnPress}
        style={styles.gap}
      />
      <IconButton
        variant="outlined"
        disabled
        icon={{ name: 'x', library: 'Feather' }}
        accessibilityLabel="Disabled outlined"
        onPress={mockOnPress}
        style={styles.gap}
      />
    </View>
  ),
};

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' },
  gap: { margin: 8 },
});
