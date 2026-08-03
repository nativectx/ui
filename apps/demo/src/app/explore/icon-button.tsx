import React, { useState } from 'react';
import { View } from 'react-native';
import { IconButton, IconButtonVariants, useTheme } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const iconButtonProps: PropDefinition[] = [
  {
    name: 'icon',
    type: 'IconConfig',
    description: 'Icon to display — library, name, size, and optional color override',
  },
  {
    name: 'variant',
    type: "'standard' | 'filled' | 'tonal' | 'outlined'",
    default: "'standard'",
    description: 'Visual style variant following M3 icon button spec',
  },
  {
    name: 'size',
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: 'Visual size: 32 / 40 / 48dp. Touch target is always at least 48dp.',
  },
  {
    name: 'accessibilityLabel',
    type: 'string',
    description: 'Required screen reader label — no visible text fallback exists',
  },
  {
    name: 'onPress',
    type: '() => void',
    description: 'Press handler',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables interaction and applies M3 disabled opacity',
  },
];

export default function IconButtonPage() {
  const { spacing } = useTheme();
  const [liked, setLiked] = useState(false);

  const rowStyle = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: spacing.md, alignItems: 'center' as const };

  return (
    <DocsPage
      title="IconButton"
      description="Material Design 3 icon button — a pressable icon with no visible label. Use for compact, recognisable actions where text would be redundant."
    >
      <DemoSection
        title="Variants"
        description="Four variants for different emphasis levels."
        code={`<IconButton variant="standard" icon={{ name: 'heart', library: 'Feather' }} accessibilityLabel="Like" onPress={() => {}} />
<IconButton variant="filled"   icon={{ name: 'heart', library: 'Feather' }} accessibilityLabel="Like" onPress={() => {}} />
<IconButton variant="tonal"    icon={{ name: 'heart', library: 'Feather' }} accessibilityLabel="Like" onPress={() => {}} />
<IconButton variant="outlined" icon={{ name: 'heart', library: 'Feather' }} accessibilityLabel="Like" onPress={() => {}} />`}
      >
        <View style={rowStyle}>
          {IconButtonVariants.map((v) => (
            <IconButton
              key={v}
              variant={v}
              icon={{ name: 'heart', library: 'Feather' }}
              accessibilityLabel={`Like — ${v}`}
              onPress={() => {}}
            />
          ))}
        </View>
      </DemoSection>

      <DemoSection
        title="Sizes"
        description="Small (32dp), medium (40dp, default), and large (48dp). Touch target is always at least 48dp."
        code={`<IconButton size="small"  variant="filled" icon={{ name: 'star', library: 'Feather' }} accessibilityLabel="Star" onPress={() => {}} />
<IconButton size="medium" variant="filled" icon={{ name: 'star', library: 'Feather' }} accessibilityLabel="Star" onPress={() => {}} />
<IconButton size="large"  variant="filled" icon={{ name: 'star', library: 'Feather' }} accessibilityLabel="Star" onPress={() => {}} />`}
      >
        <View style={rowStyle}>
          {(['small', 'medium', 'large'] as const).map((s) => (
            <IconButton
              key={s}
              size={s}
              variant="filled"
              icon={{ name: 'star', library: 'Feather' }}
              accessibilityLabel={`Star — ${s}`}
              onPress={() => {}}
            />
          ))}
        </View>
      </DemoSection>

      <DemoSection
        title="Toggle"
        description="Track pressed state externally to build toggle icon buttons."
        code={`const [liked, setLiked] = useState(false);

<IconButton
  variant={liked ? 'filled' : 'standard'}
  icon={{ name: liked ? 'heart' : 'heart', library: 'Feather' }}
  accessibilityLabel={liked ? 'Unlike' : 'Like'}
  onPress={() => setLiked(v => !v)}
/>`}
      >
        <IconButton
          variant={liked ? 'filled' : 'outlined'}
          icon={{ name: 'heart', library: 'Feather' }}
          accessibilityLabel={liked ? 'Unlike' : 'Like'}
          onPress={() => setLiked((v) => !v)}
        />
      </DemoSection>

      <DemoSection
        title="Disabled"
        description="Disabled buttons are non-interactive with M3 reduced opacity."
        code={`<IconButton variant="filled"   disabled icon={{ name: 'trash-2', library: 'Feather' }} accessibilityLabel="Delete" onPress={() => {}} />
<IconButton variant="outlined" disabled icon={{ name: 'edit',    library: 'Feather' }} accessibilityLabel="Edit"   onPress={() => {}} />`}
      >
        <View style={rowStyle}>
          <IconButton variant="filled" disabled icon={{ name: 'trash-2', library: 'Feather' }} accessibilityLabel="Delete" onPress={() => {}} />
          <IconButton variant="outlined" disabled icon={{ name: 'edit', library: 'Feather' }} accessibilityLabel="Edit" onPress={() => {}} />
        </View>
      </DemoSection>

      <ApiSection props={iconButtonProps} />
      <DocsPagination />
    </DocsPage>
  );
}
