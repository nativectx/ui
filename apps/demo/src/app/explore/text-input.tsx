import React, { useState } from 'react';
import { View } from 'react-native';
import { ThemedTextInput, Typography, useTheme } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { PropsTable, type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const inputProps: PropDefinition[] = [
  {
    name: 'variant',
    type: "'filled' | 'outlined'",
    default: "'outlined'",
    description: 'Visual style variant',
  },
  {
    name: 'label',
    type: 'string',
    description: 'Label shown above the input',
  },
  {
    name: 'helperText',
    type: 'string',
    description: 'Helper text shown below the input',
  },
  {
    name: 'error',
    type: 'string',
    description: 'Error message — replaces helperText and activates error state',
  },
  {
    name: 'leadingIcon',
    type: 'IconConfig',
    description: 'Icon shown on the left inside the input',
  },
  {
    name: 'trailingIcon',
    type: 'IconConfig',
    description: 'Icon shown on the right inside the input',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the input',
  },
  {
    name: 'style',
    type: 'ViewStyle',
    description: 'Styles for the outer container',
  },
];

export default function TextInputPage() {
  const theme = useTheme();
  const { spacing } = theme;
  const [email, setEmail] = useState('');

  return (
    <DocsPage
      title="TextInput"
      description="Text field with filled and outlined variants, label, helper text, and validation states."
      sidebarIcon="right"
    >
      <DemoSection
        title="Filled"
        description="Filled background with a bottom border indicator"
        code={`<ThemedTextInput variant="filled" label="Email" placeholder="name@example.com" />`}
      >
        <View style={{ gap: spacing.md, width: '100%' }}>
          <ThemedTextInput variant="filled" label="Name" placeholder="Enter your name" />
          <ThemedTextInput variant="filled" label="Email" placeholder="name@example.com" keyboardType="email-address" />
        </View>
      </DemoSection>

      <DemoSection
        title="Outlined"
        description="Full-border variant"
        code={`<ThemedTextInput variant="outlined" label="Email" placeholder="name@example.com" />`}
      >
        <View style={{ gap: spacing.md, width: '100%' }}>
          <ThemedTextInput variant="outlined" label="Name" placeholder="Enter your name" />
          <ThemedTextInput variant="outlined" label="Email" placeholder="name@example.com" keyboardType="email-address" />
        </View>
      </DemoSection>

      <DemoSection
        title="Helper Text & Errors"
        description="Use helperText for guidance and error for validation feedback"
        code={`<ThemedTextInput label="Username" helperText="Must be 3–20 characters" />
<ThemedTextInput label="Password" error="Password is required" />`}
      >
        <View style={{ gap: spacing.md, width: '100%' }}>
          <ThemedTextInput label="Username" helperText="Must be 3–20 characters" placeholder="username" />
          <ThemedTextInput label="Password" error="Password is required" secureTextEntry placeholder="••••••••" />
        </View>
      </DemoSection>

      <DemoSection
        title="Icons"
        description="Leading and trailing icons"
        code={`<ThemedTextInput label="Search" leadingIcon={{ name: 'search' }} />
<ThemedTextInput label="Password" trailingIcon={{ name: 'eye' }} secureTextEntry />`}
      >
        <View style={{ gap: spacing.md, width: '100%' }}>
          <ThemedTextInput label="Search" leadingIcon={{ name: 'search' }} placeholder="Search..." />
          <ThemedTextInput label="Password" trailingIcon={{ name: 'eye' }} secureTextEntry placeholder="••••••••" />
          <ThemedTextInput
            label="Email"
            leadingIcon={{ name: 'mail' }}
            trailingIcon={{ name: 'check-circle' }}
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
          />
        </View>
      </DemoSection>

      <DemoSection
        title="Disabled"
        description="Non-interactive state"
        code={`<ThemedTextInput label="Disabled field" disabled />`}
      >
        <View style={{ gap: spacing.md, width: '100%' }}>
          <ThemedTextInput variant="filled" label="Disabled filled" disabled placeholder="Not editable" />
          <ThemedTextInput variant="outlined" label="Disabled outlined" disabled placeholder="Not editable" />
        </View>
      </DemoSection>

      <ApiSection props={inputProps} />
      <DocsPagination />
    </DocsPage>
  );
}
