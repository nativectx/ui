import React from 'react';
import { View } from 'react-native';
import { Typography, Container, ThemedView, useTheme } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const containerProps: PropDefinition[] = [
  {
    name: 'maxWidth',
    type: 'number',
    default: '1000',
    description: 'Maximum width in pixels. Content is centered horizontally beyond this width.',
  },
  {
    name: 'variant',
    type: "'background' | 'surface' | 'surfaceContainer' | 'card' | 'appbar' | 'primary'",
    default: "'surface'",
    description: 'Inherited from ThemedView. background and surface resolve to the same color.',
  },
  {
    name: 'columns',
    type: 'number',
    description: 'Inherited from ThemedView. Responsive grid — multi-column on medium+ screens (≥768px), single column on small.',
  },
  {
    name: 'gap',
    type: 'number',
    description: 'Gap between grid columns when columns is set.',
  },
  {
    name: 'style',
    type: 'ViewStyle',
    description: 'Additional styles. Note: rounded is always false — apply borderRadius via style if needed.',
  },
];

function Placeholder({ label, height = 48 }: { label: string; height?: number }) {
  const theme = useTheme();
  return (
    <ThemedView
      variant="surfaceContainer"
      style={{
        height,
        borderRadius: theme.shape.surfaceBorderRadius,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.outlineVariant,
      }}
    >
      <Typography variant="labelMedium" muted>{label}</Typography>
    </ThemedView>
  );
}

export default function ContainerPage() {
  return (
    <DocsPage
      title="Container"
      description="Constrains content width for readability on large screens. Centers horizontally and applies consistent horizontal padding."
    >
      <DemoSection
        title="Default (maxWidth 1000)"
        description="Content is constrained and centered. On narrow screens it fills the available width."
        padded={false}
        code={`<Container>
  <Typography>Content constrained to 1000px max width</Typography>
</Container>`}
      >
        <Container style={{ gap: 12, paddingVertical: 24 }}>
          <Placeholder label="Content" />
          <Placeholder label="Content" />
        </Container>
      </DemoSection>

      <DemoSection
        title="Custom maxWidth"
        description="Useful for narrow reading columns or tighter layouts."
        padded={false}
        code={`<Container maxWidth={480}>
  <Typography>Narrow content (480px max)</Typography>
</Container>`}
      >
        <Container maxWidth={480} style={{ gap: 12, paddingVertical: 24 }}>
          <Placeholder label="Narrow content (480px max)" />
        </Container>
      </DemoSection>

      <DemoSection
        title="Responsive grid"
        description="Inherits ThemedView's columns prop. Single column on small screens, multi-column on medium+ (≥768px)."
        padded={false}
        code={`<Container columns={2} gap={16}>
  <Placeholder label="Col 1" />
  <Placeholder label="Col 2" />
</Container>

<Container columns={3} gap={16}>
  <Placeholder label="Col 1" />
  <Placeholder label="Col 2" />
  <Placeholder label="Col 3" />
</Container>`}
      >
        <Container columns={2} gap={12} style={{ paddingVertical: 24 }}>
          <Placeholder label="Col 1" />
          <Placeholder label="Col 2" />
        </Container>
        <Container columns={3} gap={12} style={{ paddingVertical: 16 }}>
          <Placeholder label="Col 1" />
          <Placeholder label="Col 2" />
          <Placeholder label="Col 3" />
        </Container>
      </DemoSection>

      <DemoSection
        title="Full-bleed layout pattern"
        description="Use padded={false} on Screen with Container inside to get a hero image edge-to-edge while keeping content constrained."
        padded={false}
        code={`<Screen scrollable variant="background" padded={false}>
  {/* Full-bleed hero — no Container */}
  <HeroImage />

  {/* Constrained content below */}
  <Container style={{ paddingVertical: 16, gap: 8 }}>
    <Typography variant="titleLarge">Title</Typography>
  </Container>
</Screen>`}
      >
        <View style={{ backgroundColor: '#6750A420', height: 64, alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="labelMedium" muted>Full-bleed hero (no Container)</Typography>
        </View>
        <Container style={{ paddingVertical: 16, gap: 8 }}>
          <Placeholder label="Constrained content" />
        </Container>
      </DemoSection>

      <ApiSection props={containerProps} />
      <DocsPagination />
    </DocsPage>
  );
}
