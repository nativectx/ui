import { Typography } from '@nativectx/ui';
import { View } from 'react-native';
import { CodeBlock } from '../../components/code-block';
import { DocsPagination } from '../../components/docs-pagination';
import { DocsPage } from '../../components/docs-page';

const SKILLS_COMMAND = `npx @nativectx/ui skills`;

const CLAUDE_CODE_CONFIG = `{
  "mcpServers": {
    "nativectx": {
      "command": "npx",
      "args": ["@nativectx/ui", "mcp"]
    }
  }
}`;

const LOCAL_CONFIG = `{
  "mcpServers": {
    "nativectx": {
      "command": "node",
      "args": ["./node_modules/@nativectx/ui/dist/mcp/cli.mjs", "mcp"]
    }
  }
}`;

const CLAUDE_DESKTOP_CONFIG = `{
  "mcpServers": {
    "nativectx": {
      "command": "npx",
      "args": ["@nativectx/ui", "mcp"]
    }
  }
}`;

export default function McpPage() {
  return (
    <DocsPage
      title="MCP and Skills"
      description="Install Claude Skills or connect the MCP server to give Claude accurate knowledge of your design system."
    >
      <View style={{ gap: 12 }}>
        <Typography variant="titleLarge" weight="bold">
          Claude Skills
        </Typography>
        <Typography variant="bodyMedium" muted>
          Install context files into your project so Claude Code picks them up automatically — no MCP configuration needed.
        </Typography>
        <CodeBlock variant="shell" code={SKILLS_COMMAND} />
        <Typography variant="bodyMedium" muted>
          Copies 7 skill files into <Typography variant="bodyMedium" style={{ fontFamily: 'monospace' }}>.claude/skills/</Typography> covering components, theming, navigation, and setup. Re-run after upgrading @nativectx/ui.
        </Typography>
      </View>

      <View style={{ gap: 12 }}>
        <Typography variant="titleLarge" weight="bold">
          MCP Server
        </Typography>
        <Typography variant="bodyMedium" muted>
          The MCP server gives Claude live tool access mid-conversation — real props, accurate token names, and working code snippets generated on demand.
        </Typography>
      </View>

      <View style={{ gap: 12 }}>
        <Typography variant="titleMedium" weight="bold">
          Claude Code setup
        </Typography>
        <Typography variant="bodyMedium" muted>
          Add to your project&apos;s <Typography variant="bodyMedium" style={{ fontFamily: 'monospace' }}>.mcp.json</Typography> file:
        </Typography>
        <CodeBlock variant="code" filename=".mcp.json" language="json" code={CLAUDE_CODE_CONFIG} />
        <Typography variant="bodyMedium" muted>
          Or if @nativectx/ui is already installed locally:
        </Typography>
        <CodeBlock variant="code" filename=".mcp.json" language="json" code={LOCAL_CONFIG} />
      </View>

      <View style={{ gap: 12 }}>
        <Typography variant="titleMedium" weight="bold">
          Claude Desktop setup
        </Typography>
        <CodeBlock variant="code" filename="claude_desktop_config.json" language="json" code={CLAUDE_DESKTOP_CONFIG} />
      </View>

      <View style={{ gap: 12 }}>
        <Typography variant="titleLarge" weight="bold">
          Available tools
        </Typography>
        <Typography variant="bodyMedium" muted>
          Claude calls these automatically — you never need to name a tool yourself.
        </Typography>

        {[
          { name: 'list_components', desc: 'Browse all 28 components grouped by category.' },
          { name: 'get_component', desc: 'Get real props, variants, defaults, and usage examples for any component by name.' },
          { name: 'search_components', desc: 'Find the right component from a description — "expandable section", "toggle", "text input with label".' },
          { name: 'get_theme_tokens', desc: 'Look up semantic token names for any component or the full token tree.' },
          { name: 'generate_palette', desc: 'Generate a complete M3 color palette from a hex seed color.' },
          { name: 'generate_brand_config', desc: 'Output a complete createBrand() snippet from a name and primary color.' },
          { name: 'generate_navigation', desc: 'Scaffold flat tabs, tabs + sidebar, or tabs + nested stack — wired to expo-router.' },
        ].map((tool) => (
          <View key={tool.name} style={{ gap: 6 }}>
            <Typography variant="labelLarge" style={{ fontFamily: 'monospace' }}>
              {tool.name}
            </Typography>
            <Typography variant="bodyMedium" muted>
              {tool.desc}
            </Typography>
          </View>
        ))}
      </View>

      <DocsPagination />
    </DocsPage>
  );
}
