import React from 'react';
import { View } from 'react-native';
import { FAB, useTheme } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const fabProps: PropDefinition[] = [
  {
    name: 'icon',
    type: 'IconConfig',
    description: 'Required icon configuration (library, name, size, color)',
  },
  {
    name: 'label',
    type: 'string',
    description: 'Optional label — when provided, renders as an Extended FAB',
  },
  {
    name: 'variant',
    type: "'primary' | 'secondary' | 'tertiary' | 'surface'",
    default: "'primary'",
    description: 'Color variant following M3 FAB spec',
  },
  {
    name: 'size',
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: 'Size variant (40 / 56 / 96dp)',
  },
  {
    name: 'onPress',
    type: '(event?: GestureResponderEvent) => void',
    description: 'Press handler',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the FAB',
  },
];

export default function FABPage() {
  const { spacing } = useTheme();
  const rowStyle = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: spacing.lg, alignItems: 'center' as const };

  return (
    <DocsPage
      title="FAB"
      description="Material Design 3 Floating Action Button for primary and prominent actions. Supports four color variants, three sizes, and an extended form with a label."
    >
      <DemoSection
        title="Variants"
        description="Four color variants for different surface contexts"
        code={`<FAB icon={{ name: 'plus' }} variant="primary" onPress={() => {}} />
<FAB icon={{ name: 'plus' }} variant="secondary" onPress={() => {}} />
<FAB icon={{ name: 'plus' }} variant="tertiary" onPress={() => {}} />
<FAB icon={{ name: 'plus' }} variant="surface" onPress={() => {}} />`}
      >
        <View style={rowStyle}>
          <FAB icon={{ name: 'plus' }} variant="primary" onPress={() => {}} />
          <FAB icon={{ name: 'plus' }} variant="secondary" onPress={() => {}} />
          <FAB icon={{ name: 'plus' }} variant="tertiary" onPress={() => {}} />
          <FAB icon={{ name: 'plus' }} variant="surface" onPress={() => {}} />
        </View>
      </DemoSection>

      <DemoSection
        title="Sizes"
        description="Three sizes — small (40dp), medium (56dp, default), large (96dp)"
        code={`<FAB icon={{ name: 'edit-2' }} size="small" onPress={() => {}} />
<FAB icon={{ name: 'edit-2' }} size="medium" onPress={() => {}} />
<FAB icon={{ name: 'edit-2' }} size="large" onPress={() => {}} />`}
      >
        <View style={rowStyle}>
          <FAB icon={{ name: 'edit-2' }} size="small" onPress={() => {}} />
          <FAB icon={{ name: 'edit-2' }} size="medium" onPress={() => {}} />
          <FAB icon={{ name: 'edit-2' }} size="large" onPress={() => {}} />
        </View>
      </DemoSection>

      <DemoSection
        title="Extended FAB"
        description="Adding a label renders an Extended FAB — wider pill shape with icon and text"
        code={`<FAB icon={{ name: 'edit-2' }} label="Compose" onPress={() => {}} />
<FAB icon={{ name: 'plus' }} label="New item" variant="secondary" onPress={() => {}} />
<FAB icon={{ name: 'upload' }} label="Upload" variant="tertiary" onPress={() => {}} />`}
      >
        <View style={{ gap: spacing.md }}>
          <View style={rowStyle}>
            <FAB icon={{ name: 'edit-2' }} label="Compose" onPress={() => {}} />
            <FAB icon={{ name: 'plus' }} label="New item" variant="secondary" onPress={() => {}} />
          </View>
          <View style={rowStyle}>
            <FAB icon={{ name: 'upload' }} label="Upload" variant="tertiary" onPress={() => {}} />
          </View>
        </View>
      </DemoSection>

      <DemoSection
        title="Disabled"
        description="Disabled FABs are non-interactive with reduced opacity"
        code={`<FAB icon={{ name: 'plus' }} disabled onPress={() => {}} />
<FAB icon={{ name: 'edit-2' }} label="Compose" disabled onPress={() => {}} />`}
      >
        <View style={rowStyle}>
          <FAB icon={{ name: 'plus' }} disabled onPress={() => {}} />
          <FAB icon={{ name: 'edit-2' }} label="Compose" disabled onPress={() => {}} />
        </View>
      </DemoSection>

      <ApiSection props={fabProps} />
      <DocsPagination />
    </DocsPage>
  );
}
