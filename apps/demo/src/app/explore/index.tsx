import { Typography } from '@nativectx/ui';
import { View } from 'react-native';
import { CodeBlock } from '../../components/code-block';
import { DocsPagination } from '../../components/docs-pagination';
import { DocsPage } from '../../components/docs-page';

export default function GettingStartedPage() {
  return (
    <DocsPage
      title="Getting Started"
      description="Add NativeCtx UI to your Expo project in two steps."
    >
      <View style={{ gap: 12 }}>
        <Typography variant="titleLarge" weight="bold">Installation</Typography>
        <Typography variant="bodyMedium" muted>
          Install the package using Expo&apos;s install command to ensure SDK version compatibility.
        </Typography>
        <CodeBlock variant="shell" code="npx expo install @nativectx/ui" />
      </View>

      <View style={{ gap: 12 }}>
        <Typography variant="titleLarge" weight="bold">Usage</Typography>
        <Typography variant="bodyMedium" muted>
          Wrap your root layout with the <Typography variant="bodyMedium" style={{ fontFamily: 'monospace' }}>NativeCtxProvider</Typography> provider. This sets up theming, spacing, and context for all components.
        </Typography>
        <CodeBlock
          variant="code"
          filename="app/_layout.tsx"
          code={"import { NativeCtxProvider } from '@nativectx/ui';\n\nexport default function RootLayout() {\n  return (\n    <NativeCtxProvider>\n      <Stack />\n    </NativeCtxProvider>\n  );\n}"}
        />
      </View>

      <DocsPagination />
    </DocsPage>
  );
}
