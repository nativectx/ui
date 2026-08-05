import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Collapsible, Typography } from '@nativectx/ui';

/**
 * Collapsible
 *
 * This storybook file demonstrates the Collapsible component:
 * - Expandable/collapsible content sections
 * - Animated expand/collapse with rotation and fade
 * - Controlled and uncontrolled modes
 * - Customizable header and content styling
 *
 * Props exposed in controls: `title`, `defaultOpen`, `headerVariant`,
 * `contentVariant`, `iconLibrary`, `iconName`.
 */

type CollapsibleStoryArgs = React.ComponentProps<typeof Collapsible>;

// Explicit args generic rather than `typeof meta`: these stories drive the
// component from inside `render` instead of through args, so inferring
// required args from meta would demand args the stories never use.
const meta: Meta<CollapsibleStoryArgs> = {
  title: 'Components/Collapsible',
  component: Collapsible,
  args: {
    title: 'Collapsible Title',
    defaultOpen: false,
    headerVariant: 'surfaceContainer',
    contentVariant: 'surfaceContainer',
    iconLibrary: 'Feather',
    iconName: 'chevron-right',
  },
  argTypes: {
    title: { control: 'text', description: 'Title text displayed in the header' },
    defaultOpen: { control: 'boolean', description: 'Whether the collapsible starts expanded' },
    headerVariant: {
      control: 'select',
      options: ['surface', 'surfaceContainer', 'card', 'primary'],
      description: 'ThemedView variant for the header background',
    },
    contentVariant: {
      control: 'select',
      options: ['surface', 'surfaceContainer', 'card'],
      description: 'ThemedView variant for the content area',
    },
    iconLibrary: { control: 'text', description: 'Icon library to use for the chevron' },
    iconName: { control: 'text', description: 'Custom icon name for the chevron' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Use the Collapsible component for expandable/collapsible content sections. Supports both controlled and uncontrolled modes.',
      },
    },
  },
  decorators: [(Story) => <View style={styles.container}><Story /></View>],
};

export default meta;

type Story = StoryObj<CollapsibleStoryArgs>;

export const Playground: Story = {
  render: (args) => (
    <Collapsible {...args}>
      <Typography>
        This is the collapsible content. It can contain any React elements, including text,
        images, or other components.
      </Typography>
    </Collapsible>
  ),
};

export const BasicExample: Story = {
  render: () => (
    <View style={styles.column}>
      <Collapsible title="What is React Native?">
        <Typography>
          React Native is an open-source framework for building mobile applications using React.
          It allows you to build native apps using JavaScript and React.
        </Typography>
      </Collapsible>
    </View>
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <View style={styles.column}>
      <Collapsible title="Already Expanded" defaultOpen>
        <Typography>
          This collapsible starts in an expanded state because defaultOpen is set to true.
        </Typography>
      </Collapsible>
    </View>
  ),
};

export const ControlledMode: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <View style={styles.column}>
        <Collapsible title="Controlled Collapsible" open={isOpen} onToggle={setIsOpen}>
          <Typography>
            This collapsible is controlled by React state. The parent component manages the
            open/closed state.
          </Typography>
        </Collapsible>
        <View style={styles.status}>
          <Typography variant="bodySmall">
            Status: {isOpen ? 'Open' : 'Closed'}
          </Typography>
        </View>
      </View>
    );
  },
};

export const VariantCombinations: Story = {
  render: () => (
    <View style={styles.column}>
      <Collapsible
        title="Surface + Surface"
        headerVariant="surface"
        contentVariant="surface"
        style={styles.gap}
      >
        <Typography>Content with surface variant styling</Typography>
      </Collapsible>

      <Collapsible
        title="SurfaceContainer + Card"
        headerVariant="surfaceContainer"
        contentVariant="card"
        style={styles.gap}
      >
        <Typography>Content with card variant styling</Typography>
      </Collapsible>

      <Collapsible
        title="Primary + Surface"
        headerVariant="primary"
        contentVariant="surface"
        style={styles.gap}
      >
        <Typography>Content with primary header styling</Typography>
      </Collapsible>
    </View>
  ),
};

export const FAQExample: Story = {
  render: () => (
    <View style={styles.column}>
      <Collapsible title="How do I install the app?" style={styles.gap}>
        <Typography>
          You can install the app from the App Store or Google Play Store. Simply search for the
          app name and tap Install.
        </Typography>
      </Collapsible>

      <Collapsible title="Is there a free trial?" style={styles.gap}>
        <Typography>
          Yes! We offer a 14-day free trial with full access to all features. No credit card
          required.
        </Typography>
      </Collapsible>

      <Collapsible title="How do I cancel my subscription?" style={styles.gap}>
        <Typography>
          You can cancel anytime from the Settings page. Go to Account → Subscription → Cancel.
          Your access will continue until the end of your billing period.
        </Typography>
      </Collapsible>
    </View>
  ),
};

export const NestedContent: Story = {
  render: () => (
    <View style={styles.column}>
      <Collapsible title="Advanced Settings">
        <Typography variant="bodyMedium" style={styles.nestedText}>
          Configure advanced options below:
        </Typography>
        <View style={styles.nestedContent}>
          <Typography variant="bodySmall">• Enable dark mode</Typography>
          <Typography variant="bodySmall">• Push notifications</Typography>
          <Typography variant="bodySmall">• Analytics tracking</Typography>
          <Typography variant="bodySmall">• Automatic updates</Typography>
        </View>
      </Collapsible>
    </View>
  ),
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  column: { gap: 16, width: '100%', maxWidth: 500 },
  gap: { marginBottom: 12 },
  status: { marginTop: 16, padding: 8, alignItems: 'center' },
  nestedText: { marginBottom: 8 },
  nestedContent: { gap: 4 },
});
