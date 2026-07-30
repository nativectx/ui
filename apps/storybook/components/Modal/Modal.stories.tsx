import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Modal, Button, Typography } from '@nativectx/ui';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  args: {
    title: 'Modal Title',
    dismissable: true,
  },
  argTypes: {
    dismissable: { control: 'boolean' },
  },
  decorators: [(Story: any) => <View style={{ padding: 24, alignItems: 'center' }}><Story /></View>],
} as unknown as Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [visible, setVisible] = useState(false);
    return (
      <>
        <Button title="Open Modal" onPress={() => setVisible(true)} />
        <Modal {...args} visible={visible} onDismiss={() => setVisible(false)}>
          <Typography>Modal body content goes here.</Typography>
        </Modal>
      </>
    );
  },
};

export const WithActions: Story = {
  render: () => {
    const [visible, setVisible] = useState(false);
    return (
      <>
        <Button title="Open with Actions" onPress={() => setVisible(true)} />
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          title="Confirm Action"
          actions={
            <>
              <Button variant="text" title="Cancel" onPress={() => setVisible(false)} />
              <Button variant="filled" title="Confirm" onPress={() => setVisible(false)} />
            </>
          }
        >
          <Typography>Are you sure you want to proceed? This action cannot be undone.</Typography>
        </Modal>
      </>
    );
  },
};

export const NoTitle: Story = {
  render: () => {
    const [visible, setVisible] = useState(false);
    return (
      <>
        <Button title="Open (no title)" onPress={() => setVisible(true)} />
        <Modal visible={visible} onDismiss={() => setVisible(false)}>
          <Typography>A modal without a header title.</Typography>
        </Modal>
      </>
    );
  },
};
