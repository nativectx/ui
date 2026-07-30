import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { ThemedTextInput } from '@nativectx/ui';

const meta = {
  title: 'Components/TextInput',
  component: ThemedTextInput,
  args: {
    variant: 'filled',
    label: 'Label',
    placeholder: 'Placeholder',
  },
  argTypes: {
    variant: { control: 'select', options: ['filled', 'outlined'] },
    disabled: { control: 'boolean' },
  },
  decorators: [(Story: any) => <View style={{ padding: 24, gap: 16 }}><Story /></View>],
} as unknown as Meta<typeof ThemedTextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <ThemedTextInput {...args} />,
};

export const Variants: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <ThemedTextInput variant="filled" label="Filled" placeholder="Enter text" />
      <ThemedTextInput variant="outlined" label="Outlined" placeholder="Enter text" />
    </View>
  ),
};

export const States: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <ThemedTextInput label="With helper" helperText="This is helper text" placeholder="Type here" />
      <ThemedTextInput label="With error" error="This field is required" placeholder="Type here" />
      <ThemedTextInput label="Disabled" disabled placeholder="Disabled input" />
    </View>
  ),
};

export const Icons: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <ThemedTextInput
        label="Search"
        leadingIcon={{ name: 'search' }}
        placeholder="Search..."
      />
      <ThemedTextInput
        label="Password"
        trailingIcon={{ name: 'eye' }}
        secureTextEntry
        placeholder="Enter password"
      />
      <ThemedTextInput
        label="Email"
        leadingIcon={{ name: 'mail' }}
        trailingIcon={{ name: 'check-circle' }}
        placeholder="name@example.com"
        keyboardType="email-address"
      />
    </View>
  ),
};
