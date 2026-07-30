import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography, ThemedView } from '@nativectx/ui';

/**
 * Typography (Material 3)
 *
 * This storybook file demonstrates the Material Design 3 type scale supported by `Typography`:
 * - Display: Large, Medium, Small (largest, for short, important text)
 * - Headline: Large, Medium, Small (high-emphasis headings)
 * - Title: Large, Medium, Small (medium-emphasis headings)
 * - Body: Large, Medium, Small (main content text)
 * - Label: Large, Medium, Small (buttons, tabs, captions)
 *
 * Props exposed in controls: `variant`, `weight`, `align`, `color`, `uppercase`, `muted`, and `numberOfLines`.
 */

const meta = {
  title: 'Components/Typography',
  component: Typography,
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
    variant: 'bodyMedium',
    weight: 'regular',
    align: 'left',
    color: undefined,
    uppercase: false,
    muted: false,
    numberOfLines: undefined,
  },
  argTypes: {
    children: { control: 'text', description: 'Text content to display' },
    variant: {
      control: 'select',
      options: [
        'displayLarge',
        'displayMedium',
        'displaySmall',
        'headlineLarge',
        'headlineMedium',
        'headlineSmall',
        'titleLarge',
        'titleMedium',
        'titleSmall',
        'bodyLarge',
        'bodyMedium',
        'bodySmall',
        'labelLarge',
        'labelMedium',
        'labelSmall',
      ],
      description: 'Material 3 typography variant',
    },
    weight: {
      control: 'select',
      options: ['light', 'regular', 'medium', 'bold'],
      description: 'Font weight',
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
      description: 'Text alignment',
    },
    color: { control: 'color', description: 'Custom text color' },
    uppercase: { control: 'boolean', description: 'Transform text to uppercase' },
    muted: { control: 'boolean', description: 'Use muted color from theme' },
    numberOfLines: { control: 'number', description: 'Limit lines (truncates with ellipsis)' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Use the controls to explore Material 3 typography variants. The type scale provides a consistent hierarchy for all text in your app.',
      },
    },
  },
  decorators: [(Story) => <View style={styles.container}><Story /></View>],
} satisfies Meta<typeof Typography>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: 'Typography Playground',
  },
};

export const TypeScale: Story = {
  name: 'Type Scale (M3)',
  render: () => (
    <View style={styles.column}>
      <Typography variant="displayLarge">Display Large</Typography>
      <Typography variant="displayMedium">Display Medium</Typography>
      <Typography variant="displaySmall">Display Small</Typography>

      <View style={styles.divider} />

      <Typography variant="headlineLarge">Headline Large</Typography>
      <Typography variant="headlineMedium">Headline Medium</Typography>
      <Typography variant="headlineSmall">Headline Small</Typography>

      <View style={styles.divider} />

      <Typography variant="titleLarge">Title Large</Typography>
      <Typography variant="titleMedium">Title Medium</Typography>
      <Typography variant="titleSmall">Title Small</Typography>

      <View style={styles.divider} />

      <Typography variant="bodyLarge">Body Large - Main content text</Typography>
      <Typography variant="bodyMedium">Body Medium - Default paragraph text</Typography>
      <Typography variant="bodySmall">Body Small - Secondary content</Typography>

      <View style={styles.divider} />

      <Typography variant="labelLarge">Label Large - Buttons</Typography>
      <Typography variant="labelMedium">Label Medium - Tabs</Typography>
      <Typography variant="labelSmall">Label Small - Captions</Typography>
    </View>
  ),
};

export const FontWeights: Story = {
  render: () => (
    <View style={styles.column}>
      <Typography variant="titleLarge" weight="light">Light Weight (300)</Typography>
      <Typography variant="titleLarge" weight="regular">Regular Weight (400)</Typography>
      <Typography variant="titleLarge" weight="medium">Medium Weight (500)</Typography>
      <Typography variant="titleLarge" weight="bold">Bold Weight (700)</Typography>
    </View>
  ),
};

export const TextAlignment: Story = {
  render: () => (
    <View style={styles.fullWidth}>
      <Typography variant="bodyLarge" align="left" style={styles.block}>
        Left aligned text (default)
      </Typography>
      <Typography variant="bodyLarge" align="center" style={styles.block}>
        Center aligned text
      </Typography>
      <Typography variant="bodyLarge" align="right" style={styles.block}>
        Right aligned text
      </Typography>
      <Typography variant="bodyLarge" align="justify" style={styles.block}>
        Justified text spans the full width of the container by adjusting spacing between words. This is useful for creating neat text blocks in longer paragraphs.
      </Typography>
    </View>
  ),
};

export const ColorVariations: Story = {
  render: () => (
    <View style={styles.column}>
      <Typography variant="bodyLarge">Default color (theme.onSurface)</Typography>
      <Typography variant="bodyLarge" muted>Muted text (theme.onSurfaceVariant)</Typography>
      <Typography variant="bodyLarge" color="#FF5722">Custom color: #FF5722</Typography>
      <Typography variant="bodyLarge" color="#4CAF50">Custom color: #4CAF50</Typography>
      <Typography variant="bodyLarge" color="#2196F3">Custom color: #2196F3</Typography>
    </View>
  ),
};

export const TextTransforms: Story = {
  render: () => (
    <View style={styles.column}>
      <Typography variant="bodyLarge">Default: The Quick Brown Fox</Typography>
      <Typography variant="bodyLarge" uppercase>Uppercase: The Quick Brown Fox</Typography>
      <Typography variant="labelLarge" uppercase weight="medium">
        BUTTON LABEL (UPPERCASE)
      </Typography>
    </View>
  ),
};

export const TruncationExample: Story = {
  render: () => (
    <View style={styles.fullWidth}>
      <Typography variant="bodyMedium" numberOfLines={1} style={styles.block}>
        Single line: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </Typography>
      <Typography variant="bodyMedium" numberOfLines={2} style={styles.block}>
        Two lines: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
      </Typography>
      <Typography variant="bodyMedium" numberOfLines={3} style={styles.block}>
        Three lines: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
      </Typography>
    </View>
  ),
};

export const RealWorldExamples: Story = {
  name: 'Real-World Usage',
  render: () => (
    <View style={styles.fullWidth}>
      {/* Article Header */}
      <View style={styles.section}>
        <Typography variant="labelSmall" muted uppercase>Technology</Typography>
        <Typography variant="headlineLarge" weight="bold">
          The Future of Mobile Development
        </Typography>
        <Typography variant="bodyMedium" muted>
          Published on January 25, 2026 • 5 min read
        </Typography>
      </View>

      {/* Article Body */}
      <View style={styles.section}>
        <Typography variant="bodyLarge">
          React Native continues to evolve, bringing new capabilities to cross-platform development. The integration of Material Design 3 provides a modern, accessible foundation for building beautiful applications.
        </Typography>
      </View>

      {/* Card Example */}
      <ThemedView rounded style={styles.card}>
        <Typography variant="titleMedium" weight="medium">Featured Article</Typography>
        <Typography variant="bodyMedium" style={styles.cardText} numberOfLines={2}>
          Discover how Material Design 3 brings dynamic color, improved accessibility, and refined components to your apps.
        </Typography>
        <Typography variant="labelLarge" color="#6750A4" uppercase weight="medium">
          Read More
        </Typography>
      </ThemedView>

      {/* List Example */}
      <View style={styles.section}>
        <Typography variant="titleLarge" weight="medium">Key Features</Typography>
        <View style={styles.listItem}>
          <Typography variant="bodyLarge">• Full M3 type scale support</Typography>
        </View>
        <View style={styles.listItem}>
          <Typography variant="bodyLarge">• Dynamic color system</Typography>
        </View>
        <View style={styles.listItem}>
          <Typography variant="bodyLarge">• Accessibility first design</Typography>
        </View>
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  column: {
    gap: 12,
    alignItems: 'flex-start',
  },
  fullWidth: {
    width: '100%',
    gap: 16,
  },
  block: {
    width: '100%',
  },
  divider: {
    height: 8,
  },
  section: {
    gap: 8,
    marginBottom: 16,
  },
  card: {
    padding: 16,
    gap: 8,
    marginBottom: 16,
  },
  cardText: {
    marginBottom: 8,
  },
  listItem: {
    paddingLeft: 8,
  },
});
