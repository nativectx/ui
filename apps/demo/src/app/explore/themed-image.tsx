import React from 'react';
import { View } from 'react-native';
import { Typography, Button, useTheme, useThemeMode, ThemedImage } from '@nativectx/ui';
import { DemoSection } from '../../components/demo-section';
import { DocsPagination } from '../../components/docs-pagination';
import { PropsTable, type PropDefinition } from '../../components/props-table';
import { ApiSection } from '../../components/api-section';
import { DocsPage } from '../../components/docs-page';

const themedImageProps: PropDefinition[] = [
  {
    name: 'lightSource',
    type: 'ImageSource',
    description: 'Image source displayed in light mode',
  },
  {
    name: 'darkSource',
    type: 'ImageSource',
    description: 'Image source displayed in dark mode',
  },
  {
    name: 'contentFit',
    type: "'contain' | 'cover' | 'fill' | 'none' | 'scale-down'",
    default: "'cover'",
    description: 'How the image should be resized to fit its container',
  },
  {
    name: 'style',
    type: 'ImageStyle',
    description: 'Style applied to the image (width, height, etc.)',
  },
  {
    name: 'transition',
    type: 'number',
    description: 'Duration of the crossfade transition in milliseconds',
  },
  {
    name: 'placeholder',
    type: 'ImageSource',
    description: 'Placeholder image shown while the main image loads',
  },
];

export default function ThemedImagePage() {
  const { spacing } = useTheme();
  const { mode, toggleTheme } = useThemeMode();

  return (
    <DocsPage
      title="ThemedImage"
      description="Automatically switches between light and dark image sources based on the current theme. Wraps expo-image for optimized performance."
    >
      <DemoSection
        title="Theme-Aware Logo"
        description="Toggle the theme to see the image switch between light and dark variants"
        code={`<ThemedImage
  lightSource={require('./logo-light.png')}
  darkSource={require('./logo-dark.png')}
  style={{ width: 64, height: 64 }}
  contentFit="contain"
/>`}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xl }}>
          <ThemedImage
            lightSource={require('../../../assets/images/rocket_logo_black.png')}
            darkSource={require('../../../assets/images/rocket_logo_white.png')}
            style={{ width: 64, height: 64 }}
            contentFit="contain"
          />
          <Button
            title={`Switch to ${mode === 'light' ? 'dark' : 'light'}`}
            variant="tonal"
            icon={{ library: 'Feather', name: mode === 'light' ? 'moon' : 'sun' }}
            iconPosition="left"
            onPress={toggleTheme}
          />
        </View>
      </DemoSection>

      <DemoSection
        title="Sizes"
        description="ThemedImage respects the style dimensions you provide"
        code={`<ThemedImage
  lightSource={require('./logo-light.png')}
  darkSource={require('./logo-dark.png')}
  style={{ width: 24, height: 24 }}
  contentFit="contain"
/>
<ThemedImage
  lightSource={require('./logo-light.png')}
  darkSource={require('./logo-dark.png')}
  style={{ width: 48, height: 48 }}
  contentFit="contain"
/>
<ThemedImage
  lightSource={require('./logo-light.png')}
  darkSource={require('./logo-dark.png')}
  style={{ width: 96, height: 96 }}
  contentFit="contain"
/>`}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
          <View style={{ alignItems: 'center', gap: spacing.xs }}>
            <ThemedImage
              lightSource={require('../../../assets/images/rocket_logo_black.png')}
              darkSource={require('../../../assets/images/rocket_logo_white.png')}
              style={{ width: 24, height: 24 }}
              contentFit="contain"
            />
            <Typography variant="labelSmall" muted>24px</Typography>
          </View>
          <View style={{ alignItems: 'center', gap: spacing.xs }}>
            <ThemedImage
              lightSource={require('../../../assets/images/rocket_logo_black.png')}
              darkSource={require('../../../assets/images/rocket_logo_white.png')}
              style={{ width: 48, height: 48 }}
              contentFit="contain"
            />
            <Typography variant="labelSmall" muted>48px</Typography>
          </View>
          <View style={{ alignItems: 'center', gap: spacing.xs }}>
            <ThemedImage
              lightSource={require('../../../assets/images/rocket_logo_black.png')}
              darkSource={require('../../../assets/images/rocket_logo_white.png')}
              style={{ width: 96, height: 96 }}
              contentFit="contain"
            />
            <Typography variant="labelSmall" muted>96px</Typography>
          </View>
        </View>
      </DemoSection>

      <ApiSection props={themedImageProps} />
      <DocsPagination />
    </DocsPage>
  );
}
