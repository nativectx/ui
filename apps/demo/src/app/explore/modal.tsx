import React, { useState } from 'react';
import { View } from 'react-native';
import { Modal, Button, Typography, useTheme } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const modalProps: PropDefinition[] = [
  {
    name: 'visible',
    type: 'boolean',
    description: 'Whether the modal is visible',
  },
  {
    name: 'onDismiss',
    type: '() => void',
    description: 'Called when the modal should close',
  },
  {
    name: 'title',
    type: 'string',
    description: 'Optional title shown in the modal header',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'Modal body content',
  },
  {
    name: 'actions',
    type: 'React.ReactNode',
    description: 'Footer actions row (e.g. Button components)',
  },
  {
    name: 'dismissable',
    type: 'boolean',
    default: 'true',
    description: 'Whether tapping the scrim dismisses the modal',
  },
  {
    name: 'style',
    type: 'ViewStyle',
    description: 'Override the modal container style',
  },
];

export default function ModalPage() {
  const theme = useTheme();
  const { spacing } = theme;
  const [basicVisible, setBasicVisible] = useState(false);
  const [actionsVisible, setActionsVisible] = useState(false);
  const [nonDismissVisible, setNonDismissVisible] = useState(false);
  const [noTitleVisible, setNoTitleVisible] = useState(false);

  return (
    <DocsPage
      title="Modal"
      description="Focused overlay for confirmations, forms, and contextual actions. Renders as a bottom sheet on mobile and a centered dialog on larger screens."
      sidebarIcon="right"
    >
      <DemoSection
        title="Basic"
        description="Modal with a title and body content"
        code={`<Modal
  visible={visible}
  onDismiss={() => setVisible(false)}
  title="Hello"
>
  <Typography>Modal body content goes here.</Typography>
</Modal>`}
      >
        <Button title="Open Modal" onPress={() => setBasicVisible(true)} />
        <Modal
          visible={basicVisible}
          onDismiss={() => setBasicVisible(false)}
          title="Basic Modal"
        >
          <Typography variant="bodyMedium">
            This is a basic modal with a title and a close button in the header. Tap the scrim or the X to dismiss.
          </Typography>
        </Modal>
      </DemoSection>

      <DemoSection
        title="With Actions"
        description="Footer row with confirm and cancel buttons"
        code={`<Modal
  visible={visible}
  onDismiss={() => setVisible(false)}
  title="Delete item?"
  actions={
    <>
      <Button title="Cancel" variant="text" onPress={() => setVisible(false)} />
      <Button title="Delete" onPress={() => setVisible(false)} />
    </>
  }
>
  <Typography>This action cannot be undone.</Typography>
</Modal>`}
      >
        <Button title="Open with Actions" onPress={() => setActionsVisible(true)} />
        <Modal
          visible={actionsVisible}
          onDismiss={() => setActionsVisible(false)}
          title="Delete item?"
          actions={
            <>
              <Button title="Cancel" variant="text" onPress={() => setActionsVisible(false)} />
              <Button title="Delete" onPress={() => setActionsVisible(false)} />
            </>
          }
        >
          <Typography variant="bodyMedium">
            Are you sure you want to delete this item? This action cannot be undone.
          </Typography>
        </Modal>
      </DemoSection>

      <DemoSection
        title="No Title"
        description="Modal without a header — content only"
        code={`<Modal visible={visible} onDismiss={() => setVisible(false)}>
  <Typography>Content without a header.</Typography>
</Modal>`}
      >
        <Button title="Open without Title" onPress={() => setNoTitleVisible(true)} />
        <Modal
          visible={noTitleVisible}
          onDismiss={() => setNoTitleVisible(false)}
          actions={
            <Button title="Got it" onPress={() => setNoTitleVisible(false)} />
          }
        >
          <View style={{ gap: spacing.md }}>
            <Typography variant="titleMedium" weight="medium">{"What's new"}</Typography>
            <Typography variant="bodyMedium">
              Modals without a title prop render content-only, letting you fully control the layout.
            </Typography>
          </View>
        </Modal>
      </DemoSection>

      <DemoSection
        title="Non-dismissable"
        description="User must interact with the actions to close"
        code={`<Modal
  visible={visible}
  onDismiss={() => setVisible(false)}
  title="Action required"
  dismissable={false}
  actions={<Button title="Confirm" onPress={() => setVisible(false)} />}
>
  <Typography>Tapping outside will not close this modal.</Typography>
</Modal>`}
      >
        <Button title="Open Non-dismissable" onPress={() => setNonDismissVisible(true)} />
        <Modal
          visible={nonDismissVisible}
          onDismiss={() => setNonDismissVisible(false)}
          title="Action required"
          dismissable={false}
          actions={
            <Button title="Confirm" onPress={() => setNonDismissVisible(false)} />
          }
        >
          <Typography variant="bodyMedium">
            This modal requires an explicit action. Tapping the scrim will not dismiss it.
          </Typography>
        </Modal>
      </DemoSection>

      <ApiSection props={modalProps} />
      <DocsPagination />
    </DocsPage>
  );
}
