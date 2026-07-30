import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View } from 'react-native';
import { List, ListItem, Divider, Avatar, Typography } from '@nativectx/ui';
import { renderIcon } from '@nativectx/ui/icons';

const meta = {
  title: 'Components/List',
  component: ListItem,
  args: {
    title: 'List item',
    subtitle: 'Supporting text',
  },
  argTypes: {
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  decorators: [(Story: any) => <View style={{ padding: 0, width: '100%' }}><Story /></View>],
} as unknown as Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <List>
      <ListItem {...args} onPress={() => {}} />
    </List>
  ),
};

export const Basic: Story = {
  render: () => (
    <List>
      <ListItem title="Item one" onPress={() => {}} />
      <Divider />
      <ListItem title="Item two" subtitle="With subtitle" onPress={() => {}} />
      <Divider />
      <ListItem title="Item three" onPress={() => {}} />
    </List>
  ),
};

export const WithLeadingIcons: Story = {
  render: () => (
    <List>
      {['inbox', 'send', 'star', 'trash-2'].map((icon) => (
        <ListItem
          key={icon}
          title={icon.charAt(0).toUpperCase() + icon.slice(1)}
          leading={renderIcon({ name: icon }, 'Feather', 20, '#666')}
          onPress={() => {}}
        />
      ))}
    </List>
  ),
};

export const WithAvatar: Story = {
  render: () => (
    <List>
      {['Alex Amayo', 'Jane Doe', 'Chris Brown'].map((name) => (
        <ListItem
          key={name}
          title={name}
          subtitle="Tap to view profile"
          leading={<Avatar name={name} size="md" />}
          trailing={renderIcon({ name: 'chevron-right' }, 'Feather', 16, '#999')}
          onPress={() => {}}
        />
      ))}
    </List>
  ),
};

export const Selected: Story = {
  render: () => {
    const [active, setActive] = useState('Item one');
    return (
      <List>
        {['Item one', 'Item two', 'Item three'].map((item) => (
          <ListItem
            key={item}
            title={item}
            selected={active === item}
            onPress={() => setActive(item)}
          />
        ))}
      </List>
    );
  },
};
