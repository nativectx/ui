import React from 'react';
import { View } from 'react-native';
import { Avatar, Typography, useTheme } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const avatarProps: PropDefinition[] = [
  {
    name: 'name',
    type: 'string',
    description: 'Display name — used for initials and deterministic background color',
  },
  {
    name: 'src',
    type: 'string',
    description: 'Image URI. Falls back to initials on error or when omitted',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: 'Avatar size (32 / 40 / 56dp)',
  },
  {
    name: 'color',
    type: 'string',
    description: 'Override background color',
  },
  {
    name: 'textColor',
    type: 'string',
    description: 'Override initials text color',
  },
  {
    name: 'style',
    type: 'ViewStyle',
    description: 'Additional styles',
  },
];

export default function AvatarPage() {
  const theme = useTheme();
  const { spacing } = theme;
  const rowStyle = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: spacing.md, alignItems: 'center' as const };

  return (
    <DocsPage
      title="Avatar"
      description="Circular user representation with image support and initials fallback."
      sidebarIcon="right"
    >
      <DemoSection
        title="Initials"
        description="Color is derived deterministically from the name"
        code={`<Avatar name="Alex Amayo" />
<Avatar name="Jane Doe" />
<Avatar name="Sam" />`}
      >
        <View style={rowStyle}>
          {['Alex Amayo', 'Jane Doe', 'Sam', 'Chris Brown', 'Taylor Swift', 'Bob'].map((name) => (
            <View key={name} style={{ alignItems: 'center', gap: spacing.xs }}>
              <Avatar name={name} />
              <Typography variant="labelSmall" muted>{name.split(' ')[0]}</Typography>
            </View>
          ))}
        </View>
      </DemoSection>

      <DemoSection
        title="Sizes"
        description="Three size variants"
        code={`<Avatar name="Alex" size="sm" />
<Avatar name="Alex" size="md" />
<Avatar name="Alex" size="lg" />`}
      >
        <View style={rowStyle}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <View key={size} style={{ alignItems: 'center', gap: spacing.xs }}>
              <Avatar name="Alex Amayo" size={size} />
              <Typography variant="labelSmall" muted>{size}</Typography>
            </View>
          ))}
        </View>
      </DemoSection>

      <DemoSection
        title="Image with Fallback"
        description="Falls back to initials when the image fails to load"
        code={`<Avatar name="Alex Amayo" src="https://example.com/photo.jpg" />`}
      >
        <View style={rowStyle}>
          <View style={{ alignItems: 'center', gap: spacing.xs }}>
            <Avatar name="Alex Amayo" src="https://invalid.url/photo.jpg" size="lg" />
            <Typography variant="labelSmall" muted>Image error → initials</Typography>
          </View>
        </View>
      </DemoSection>

      <ApiSection props={avatarProps} />
      <DocsPagination />
    </DocsPage>
  );
}
