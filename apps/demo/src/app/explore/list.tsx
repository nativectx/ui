import React, { useState } from 'react';
import { View } from 'react-native';
import { List, ListItem, Divider, Avatar, Typography } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const listItemProps: PropDefinition[] = [
  {
    name: 'title',
    type: 'string',
    description: 'Primary text of the list item',
  },
  {
    name: 'subtitle',
    type: 'string',
    description: 'Secondary text shown below the title',
  },
  {
    name: 'leading',
    type: 'React.ReactNode',
    description: 'Leading element — icon, avatar, image',
  },
  {
    name: 'trailing',
    type: 'React.ReactNode',
    description: 'Trailing element — icon, text, action',
  },
  {
    name: 'selected',
    type: 'boolean',
    default: 'false',
    description: 'Whether this item is in a selected state',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables interaction',
  },
  {
    name: 'onPress',
    type: '() => void',
    description: 'Makes the item pressable',
  },
  {
    name: 'style',
    type: 'ViewStyle',
    description: 'Additional styles for the row',
  },
];

const CONTACTS = [
  { name: 'Alex Amayo', subtitle: 'Product Designer' },
  { name: 'Jane Doe', subtitle: 'Engineering Lead' },
  { name: 'Sam Brown', subtitle: 'iOS Developer' },
  { name: 'Chris Park', subtitle: 'Design Systems' },
];

export default function ListPage() {
  const [selected, setSelected] = useState<string | null>('Jane Doe');

  return (
    <DocsPage
      title="List"
      description="Vertically stacked rows for displaying collections of related content."
      sidebarIcon="right"
    >
      <DemoSection
        title="Basic"
        description="Simple list with title-only items"
        code={`<List>
  <ListItem title="Inbox" />
  <Divider />
  <ListItem title="Sent" />
  <Divider />
  <ListItem title="Drafts" />
</List>`}
      >
        <List style={{ width: '100%' }}>
          <ListItem title="Inbox" />
          <Divider />
          <ListItem title="Sent" />
          <Divider />
          <ListItem title="Drafts" />
          <Divider />
          <ListItem title="Trash" />
        </List>
      </DemoSection>

      <DemoSection
        title="With Subtitles"
        description="Two-line items with supporting text"
        code={`<List>
  <ListItem title="Alex Amayo" subtitle="Product Designer" />
  <Divider />
  <ListItem title="Jane Doe" subtitle="Engineering Lead" />
</List>`}
      >
        <List style={{ width: '100%' }}>
          {CONTACTS.map((c, i) => (
            <View key={c.name}>
              <ListItem title={c.name} subtitle={c.subtitle} />
              {i < CONTACTS.length - 1 && <Divider inset="start" />}
            </View>
          ))}
        </List>
      </DemoSection>

      <DemoSection
        title="With Leading & Trailing"
        description="Avatar on the left, metadata on the right"
        code={`<ListItem
  title="Alex Amayo"
  subtitle="Product Designer"
  leading={<Avatar name="Alex Amayo" size="sm" />}
  trailing={<Typography variant="labelSmall" muted>9:41 AM</Typography>}
/>`}
      >
        <List style={{ width: '100%' }}>
          {CONTACTS.map((c, i) => (
            <View key={c.name}>
              <ListItem
                title={c.name}
                subtitle={c.subtitle}
                leading={<Avatar name={c.name} size="sm" />}
                trailing={<Typography variant="labelSmall" muted>9:41 AM</Typography>}
              />
              {i < CONTACTS.length - 1 && <Divider inset="start" />}
            </View>
          ))}
        </List>
      </DemoSection>

      <DemoSection
        title="Selectable"
        description="Items with a selected state"
        code={`<ListItem title="Jane Doe" selected onPress={() => {}} />`}
      >
        <List style={{ width: '100%' }}>
          {CONTACTS.map((c, i) => (
            <View key={c.name}>
              <ListItem
                title={c.name}
                subtitle={c.subtitle}
                leading={<Avatar name={c.name} size="sm" />}
                selected={selected === c.name}
                onPress={() => setSelected(c.name)}
              />
              {i < CONTACTS.length - 1 && <Divider inset="start" />}
            </View>
          ))}
        </List>
      </DemoSection>

      <DemoSection
        title="Disabled"
        description="Non-interactive items"
        code={`<ListItem title="Disabled item" disabled />`}
      >
        <List style={{ width: '100%' }}>
          <ListItem title="Active item" subtitle="This one works" />
          <Divider />
          <ListItem title="Disabled item" subtitle="Cannot be pressed" disabled />
        </List>
      </DemoSection>

      <ApiSection props={listItemProps} />
      <DocsPagination />
    </DocsPage>
  );
}
