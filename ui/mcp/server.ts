import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { registerResources } from './resources/skills.js';
import { listComponents } from './tools/list-components.js';
import { getComponent } from './tools/get-component.js';
import { searchComponents } from './tools/search-components.js';
import { getThemeTokens } from './tools/get-theme-tokens.js';
import { generatePalette } from './tools/generate-palette.js';
import { generateBrandConfig } from './tools/generate-brand-config.js';
import { generateNavigation } from './tools/generate-navigation.js';

const server = new McpServer({
  name: 'nativectx',
  version: '0.1.0',
});

// Resources: the 6 Claude skill files
registerResources(server);

// Tools
server.tool(
  'list_components',
  'List all @nativectx/ui components, optionally filtered by category (layout, display, controls, input, feedback, collections, navigation).',
  { category: z.string().optional() },
  async ({ category }) => ({ content: [{ type: 'text', text: listComponents(category) }] }),
);

server.tool(
  'get_component',
  'Get full props reference, variants, and usage examples for a named @nativectx/ui component (e.g. "Button", "Typography", "AppTabs").',
  { name: z.string() },
  async ({ name }) => ({ content: [{ type: 'text', text: getComponent(name) }] }),
);

server.tool(
  'search_components',
  'Search for @nativectx/ui components by use case or feature description (e.g. "expandable section", "toggle", "text input with label").',
  { query: z.string() },
  async ({ query }) => ({ content: [{ type: 'text', text: searchComponents(query) }] }),
);

server.tool(
  'get_theme_tokens',
  'Get @nativectx/ui semantic theme tokens. Pass a component name (e.g. "button", "input", "sidebar") to scope results, or omit for the full token tree.',
  { component: z.string().optional() },
  async ({ component }) => ({ content: [{ type: 'text', text: getThemeTokens(component) }] }),
);

server.tool(
  'generate_palette',
  'Generate a full Material Design 3 color palette from a primary hex color. Returns a complete Colors object ready to use in createBrand().',
  {
    primaryHex: z.string().describe('Primary brand color as hex, e.g. "#6750A4"'),
    secondaryHex: z.string().optional().describe('Optional secondary color hex'),
    tertiaryHex: z.string().optional().describe('Optional tertiary color hex'),
  },
  async ({ primaryHex, secondaryHex, tertiaryHex }) => ({
    content: [{ type: 'text', text: generatePalette(primaryHex, secondaryHex, tertiaryHex) }],
  }),
);

server.tool(
  'generate_brand_config',
  'Generate a complete createBrand() configuration snippet from a brand name and primary color.',
  {
    name: z.string().describe('Brand or app name'),
    primaryHex: z.string().describe('Primary brand color as hex, e.g. "#6750A4"'),
    spacing: z
      .enum(['compact', 'default', 'comfortable'])
      .optional()
      .describe('Spacing scale preset. Default: "default"'),
    borderRadius: z
      .enum(['sharp', 'default', 'rounded'])
      .optional()
      .describe('Border radius preset. Default: "default"'),
  },
  async ({ name, primaryHex, spacing, borderRadius }) => ({
    content: [{ type: 'text', text: generateBrandConfig(name, primaryHex, spacing, borderRadius) }],
  }),
);

server.tool(
  'generate_navigation',
  'Generate expo-router navigation boilerplate for one of three patterns: "flat-tabs" (simple tab bar), "tabs-sidebar" (tabs + collapsible sidebar for tablet), or "tabs-stack" (tabs with nested stack screens).',
  {
    pattern: z.enum(['flat-tabs', 'tabs-sidebar', 'tabs-stack']),
    tabs: z
      .array(z.object({ name: z.string(), label: z.string(), icon: z.string() }))
      .optional()
      .describe('Tab definitions. Defaults to Home, Explore, Settings.'),
  },
  async ({ pattern, tabs }) => ({
    content: [{ type: 'text', text: generateNavigation(pattern, tabs) }],
  }),
);

export async function startMcpServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
