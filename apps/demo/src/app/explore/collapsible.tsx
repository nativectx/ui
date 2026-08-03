import React, { useState } from 'react';
import { View } from 'react-native';
import { Typography, Collapsible, Button } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPagination } from '../../components/docs-pagination';
import { DocsPage } from '../../components/docs-page';

const collapsibleProps: PropDefinition[] = [
  {
    name: 'title',
    type: 'string',
    description: 'Title text displayed in the header',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'Content to show when expanded',
  },
  {
    name: 'open',
    type: 'boolean',
    description: 'Controlled open state. If provided, component becomes controlled',
  },
  {
    name: 'defaultOpen',
    type: 'boolean',
    default: 'false',
    description: 'Whether the collapsible starts expanded (uncontrolled mode)',
  },
  {
    name: 'onToggle',
    type: '(isOpen: boolean) => void',
    description: 'Callback when the open state changes',
  },
  {
    name: 'headerVariant',
    type: "'surface' | 'surfaceContainer' | 'card' | 'primary'",
    default: "'surfaceContainer'",
    description: 'ThemedView variant for the icon button background',
  },
  {
    name: 'contentVariant',
    type: "'surface' | 'surfaceContainer' | 'card'",
    default: "'surfaceContainer'",
    description: 'ThemedView variant for the content area',
  },
  {
    name: 'iconLibrary',
    type: 'IconLibrary',
    default: "'Feather'",
    description: 'Icon library to use for the chevron',
  },
  {
    name: 'iconName',
    type: 'string',
    default: "'chevron-right'",
    description: 'Custom icon name for the chevron',
  },
];

export default function CollapsiblePage() {
  const [controlledOpen, setControlledOpen] = useState(false);

  return (
    <DocsPage
      title="Collapsible"
      description="Expandable/collapsible content sections with animated transitions."
    >
      <DemoSection
        title="Basic Usage"
        description="Simple collapsible section with default styling"
        code={`<Collapsible title="Click to expand">
  <Typography>
    This content is hidden by default and revealed when the header is pressed.
  </Typography>
</Collapsible>`}
      >
        <Collapsible title="Click to expand">
          <Typography>
            This content is hidden by default and revealed when the header is pressed.
            The chevron icon rotates to indicate the expanded state.
          </Typography>
        </Collapsible>
      </DemoSection>

      <DemoSection
        title="Default Open"
        description="Collapsible that starts in an expanded state"
        code={`<Collapsible title="Already expanded" defaultOpen>
  <Typography>Starts in an open state.</Typography>
</Collapsible>`}
      >
        <Collapsible title="Already expanded" defaultOpen>
          <Typography>
            This collapsible starts in an open state. Click the header to collapse it.
          </Typography>
        </Collapsible>
      </DemoSection>

      <DemoSection
        title="Controlled State"
        description="External control over the open state"
        code={`const [open, setOpen] = useState(false);

<Collapsible
  title="Controlled section"
  open={open}
  onToggle={setOpen}
>
  <Typography>Controlled by external state.</Typography>
</Collapsible>`}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Button
            title={controlledOpen ? 'Close' : 'Open'}
            variant="tonal"
            size="small"
            onPress={() => setControlledOpen(!controlledOpen)}
          />
          <Typography variant="bodySmall" muted>
            State: {controlledOpen ? 'Open' : 'Closed'}
          </Typography>
        </View>
        <Collapsible
          title="Controlled section"
          open={controlledOpen}
          onToggle={setControlledOpen}
        >
          <Typography>
            This collapsible is controlled by external state.
            Both the button and the header can toggle it.
          </Typography>
        </Collapsible>
      </DemoSection>

      <DemoSection
        title="Nested Collapsibles"
        description="Collapsibles can be nested within each other"
        code={`<Collapsible title="Outer section">
  <Typography>Outer content.</Typography>
  <Collapsible title="Inner section" contentVariant="card">
    <Typography>Nested inside the outer collapsible.</Typography>
  </Collapsible>
</Collapsible>`}
      >
        <Collapsible title="Outer section">
          <Typography style={{ marginBottom: 16 }}>
            This is the outer content. Click below for more.
          </Typography>
          <Collapsible title="Inner section" contentVariant="card">
            <Typography>
              This is nested inside the outer collapsible.
            </Typography>
          </Collapsible>
        </Collapsible>
      </DemoSection>

      <DemoSection
        title="Style Variants"
        description="Different header and content background variants"
        code={`<Collapsible
  title="Surface variant"
  headerVariant="surface"
  contentVariant="surface"
>
  <Typography>Content with surface styling</Typography>
</Collapsible>
<Collapsible
  title="Card variant"
  headerVariant="surfaceContainer"
  contentVariant="card"
>
  <Typography>Content with card styling</Typography>
</Collapsible>`}
      >
        <View style={{ gap: 16 }}>
          <Collapsible
            title="Surface variant"
            headerVariant="surface"
            contentVariant="surface"
          >
            <Typography>Content with surface styling</Typography>
          </Collapsible>
          <Collapsible
            title="Card variant"
            headerVariant="surfaceContainer"
            contentVariant="card"
          >
            <Typography>Content with card styling</Typography>
          </Collapsible>
        </View>
      </DemoSection>

      <ApiSection props={collapsibleProps} />
      <DocsPagination />
    </DocsPage>
  );
}
