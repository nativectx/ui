import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Drawer, Typography, ThemedView, SidebarHeader, useTheme } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const drawerProps: PropDefinition[] = [
  {
    name: 'isOpen',
    type: 'boolean',
    description: 'Controls whether the drawer is visible',
  },
  {
    name: 'onClose',
    type: '() => void',
    description: 'Called when the user taps the backdrop or closes the drawer',
  },
  {
    name: 'side',
    type: "'left' | 'right'",
    default: "'left'",
    description: 'Which edge the drawer slides in from',
  },
  {
    name: 'header',
    type: 'React.ReactNode',
    description: 'Optional sticky header rendered above the scrollable content',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'Scrollable drawer content',
  },
  {
    name: 'footer',
    type: 'React.ReactNode',
    description: 'Optional sticky footer rendered below the scrollable content',
  },
  {
    name: 'style',
    type: 'StyleProp<ViewStyle>',
    description: 'Custom styles for the drawer container',
  },
];

export default function DrawerPage() {
  const { spacing } = useTheme();
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  return (
    <DocsPage
      title="Drawer"
      description="Animated side drawer with backdrop. Slides in from the left or right with a scrim overlay. Used internally by Sidebar and AppTabs — available for custom layouts."
    >
      <DemoSection
        title="Left Drawer"
        description="Default side — slides in from the left"
        code={`const [open, setOpen] = useState(false);

<Button title="Open drawer" onPress={() => setOpen(true)} />

<Drawer
  isOpen={open}
  onClose={() => setOpen(false)}
  header={<SidebarHeader title="Menu" subtitle="Navigation" />}
  footer={
    <View style={{ padding: 16 }}>
      <Typography variant="bodySmall" muted>Footer content</Typography>
    </View>
  }
>
  <Typography style={{ padding: 16 }}>Drawer content here</Typography>
</Drawer>`}
      >
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Button title="Open left drawer" onPress={() => setLeftOpen(true)} />
        </View>
        <Drawer
          isOpen={leftOpen}
          onClose={() => setLeftOpen(false)}
          header={<SidebarHeader title="Left Drawer" subtitle="Slides from left" />}
          footer={
            <View style={{ padding: spacing.lg }}>
              <Typography variant="bodySmall" muted>Footer area</Typography>
            </View>
          }
        >
          <View style={{ padding: spacing.lg, gap: spacing.md }}>
            <Typography variant="bodyMedium">Drawer content scrolls here.</Typography>
            <Typography variant="bodySmall" muted>Tap the backdrop or use onClose to dismiss.</Typography>
          </View>
        </Drawer>
      </DemoSection>

      <DemoSection
        title="Right Drawer"
        description="Set side='right' to slide in from the right edge"
        code={`<Drawer
  isOpen={open}
  onClose={() => setOpen(false)}
  side="right"
>
  <Typography>Right-side content</Typography>
</Drawer>`}
      >
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Button title="Open right drawer" variant="tonal" onPress={() => setRightOpen(true)} />
        </View>
        <Drawer
          isOpen={rightOpen}
          onClose={() => setRightOpen(false)}
          side="right"
          header={<SidebarHeader title="Right Drawer" subtitle="Slides from right" />}
        >
          <View style={{ padding: spacing.lg, gap: spacing.md }}>
            <Typography variant="bodyMedium">Right-side drawer content.</Typography>
          </View>
        </Drawer>
      </DemoSection>

      <DemoSection
        title="Behaviour"
        description="Key details about animation and dismissal."
      >
        <View style={{ gap: spacing.md }}>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">Animation</Typography>
            <Typography variant="bodySmall" muted>
              250ms slide transition (react-native-reanimated). Backdrop fades from 0 to 50% opacity simultaneously.
            </Typography>
          </ThemedView>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">Width</Typography>
            <Typography variant="bodySmall" muted>
              Fixed at tokens.sidebar.width (280dp). Not configurable — use the style prop for minor overrides.
            </Typography>
          </ThemedView>
          <ThemedView variant="surfaceContainer" style={{ padding: spacing.lg, borderRadius: spacing.sm, gap: spacing.xs }}>
            <Typography variant="labelLarge" weight="medium">When to use Sidebar instead</Typography>
            <Typography variant="bodySmall" muted>
              Sidebar wraps Drawer and adds responsive behaviour (persistent on desktop, modal on mobile)
              plus route-awareness. Use Drawer directly only for custom non-navigation overlays.
            </Typography>
          </ThemedView>
        </View>
      </DemoSection>

      <ApiSection props={drawerProps} />
      <DocsPagination />
    </DocsPage>
  );
}
