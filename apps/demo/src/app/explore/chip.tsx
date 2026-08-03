import React, { useState } from 'react';
import { View } from 'react-native';
import { Chip, Typography } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const chipProps: PropDefinition[] = [
  {
    name: 'label',
    type: 'string',
    description: 'Chip label text',
  },
  {
    name: 'variant',
    type: "'filled' | 'outlined'",
    default: "'outlined'",
    description: 'Visual style — outlined has a border, filled has a solid tonal background',
  },
  {
    name: 'selected',
    type: 'boolean',
    default: 'false',
    description: 'Shows a leading checkmark and uses selectedBg color — use for filter chip behaviour',
  },
  {
    name: 'icon',
    type: 'ChipIconConfig',
    description: 'Trailing icon rendered to the right of the label',
  },
  {
    name: 'onPress',
    type: '() => void',
    description: 'Called when the chip is pressed',
  },
  {
    name: 'onIconPress',
    type: '() => void',
    description: 'Makes the trailing icon a separate pressable target. Use for dismissal or secondary actions',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables all interaction with reduced opacity',
  },
];

const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 };

export default function ChipPage() {
  const [wireless, setWireless] = useState(false);
  const [bluetooth, setBluetooth] = useState(true);
  const [nfc, setNfc] = useState(false);

  const [tags, setTags] = useState(['React Native', 'TypeScript', 'Expo']);
  const removeTag = (tag: string) => setTags(t => t.filter(i => i !== tag));

  return (
    <DocsPage
      title="Chip"
      description="Material Design 3 Chip component for filters, selections, and input tags."
    >
      <DemoSection
        title="Variants"
        description="Outlined (default) uses a border, filled uses a solid tonal background"
        code={`<Chip label="Outlined" variant="outlined" />
<Chip label="Filled" variant="filled" />`}
      >
        <View style={row}>
          <Chip label="Outlined" variant="outlined" />
          <Chip label="Filled" variant="filled" />
        </View>
      </DemoSection>

      <DemoSection
        title="Filter Chips"
        description="Use selected + onPress for toggleable filter behaviour — a checkmark appears when selected"
        code={`const [wireless, setWireless] = useState(false);
const [bluetooth, setBluetooth] = useState(true);

<Chip label="Wireless" selected={wireless} onPress={() => setWireless(w => !w)} />
<Chip label="Bluetooth" selected={bluetooth} onPress={() => setBluetooth(b => !b)} />`}
      >
        <View style={row}>
          <Chip label="Wireless" selected={wireless} onPress={() => setWireless(w => !w)} />
          <Chip label="Bluetooth" selected={bluetooth} onPress={() => setBluetooth(b => !b)} />
          <Chip label="NFC" selected={nfc} onPress={() => setNfc(n => !n)} />
        </View>
      </DemoSection>

      <DemoSection
        title="Trailing Icon"
        description="icon renders a trailing icon. Add onIconPress to make it a separate pressable target"
        code={`<Chip label="Dismiss" icon={{ name: 'x' }} onIconPress={() => {}} />
<Chip label="More" variant="filled" icon={{ name: 'chevron-down' }} onIconPress={() => {}} />
<Chip label="Favourite" icon={{ name: 'star' }} />`}
      >
        <View style={row}>
          <Chip label="Dismiss" icon={{ name: 'x' }} onIconPress={() => {}} />
          <Chip label="More" variant="filled" icon={{ name: 'chevron-down' }} onIconPress={() => {}} />
          <Chip label="Favourite" icon={{ name: 'star' }} />
        </View>
      </DemoSection>

      <DemoSection
        title="Input Chips"
        description="Filled chips with a trailing × icon — press the icon to remove the tag"
        code={`const [tags, setTags] = useState(['React Native', 'TypeScript', 'Expo']);
const removeTag = (tag: string) => setTags(t => t.filter(i => i !== tag));

{tags.map(tag => (
  <Chip
    key={tag}
    label={tag}
    variant="filled"
    icon={{ name: 'x' }}
    onIconPress={() => removeTag(tag)}
  />
))}`}
      >
        <View style={row}>
          {tags.map(tag => (
            <Chip
              key={tag}
              label={tag}
              variant="filled"
              icon={{ name: 'x' }}
              onIconPress={() => removeTag(tag)}
            />
          ))}
          {tags.length === 0 && (
            <Typography variant="bodyMedium" muted>All tags removed</Typography>
          )}
        </View>
      </DemoSection>

      <DemoSection
        title="Disabled"
        description="Non-interactive chips with reduced opacity"
        code={`<Chip label="Disabled" disabled />
<Chip label="Disabled Filled" variant="filled" disabled />
<Chip label="Disabled Selected" selected disabled />`}
      >
        <View style={row}>
          <Chip label="Disabled" disabled />
          <Chip label="Disabled Filled" variant="filled" disabled />
          <Chip label="Disabled Selected" selected disabled />
        </View>
      </DemoSection>

      <ApiSection props={chipProps} />
      <DocsPagination />
    </DocsPage>
  );
}
