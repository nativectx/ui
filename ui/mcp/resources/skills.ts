import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { isContributorSkill } from '../skills-command.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// All files bundled into dist/mcp/server.mjs — skills are copied to dist/mcp/skills/ at build time
const skillsDir = join(__dirname, 'skills');

const skills: Array<{ name: string; uri: string; file: string; description: string }> = [
  { name: 'Setup', uri: 'nativectx://setup', file: 'nativectx-setup.md', description: 'Installation, provider setup, and peer dependencies.' },
  { name: 'Components', uri: 'nativectx://components', file: 'nativectx-components.md', description: 'Component reference table with categories and props overview.' },
  { name: 'Theme', uri: 'nativectx://theme', file: 'nativectx-theme.md', description: 'Theme system, useTheme hook, semantic tokens, and responsive patterns.' },
  { name: 'Navigation', uri: 'nativectx://navigation', file: 'nativectx-navigation.md', description: 'Navigation patterns: flat tabs, tabs with sidebar, tabs with nested stacks.' },
  { name: 'Dev', uri: 'nativectx://dev', file: 'nativectx-dev.md', description: 'Development commands, repo structure, and key files.' },
  { name: 'Contributing', uri: 'nativectx://contributing', file: 'nativectx-contributing.md', description: 'Checklist for adding new components to @nativectx/ui.' },
  { name: 'MCP', uri: 'nativectx://mcp', file: 'nativectx-mcp.md', description: 'How to use the @nativectx/ui MCP server tools effectively.' },
  { name: 'Migration', uri: 'nativectx://migration', file: 'nativectx-migration.md', description: 'Upgrading a project from the old zero-to-app package to @nativectx/ui.' },
];

// MCP resources are read on demand rather than copied into a project, so every
// skill stays exposed here — including the contributor ones that `npx nativectx
// skills` holds back. The description carries the audience so a client can tell
// which skills are about developing the library rather than building an app.
export function registerResources(server: McpServer): void {
  for (const skill of skills) {
    const key = skill.name.toLowerCase();
    const description = isContributorSkill(key)
      ? `[Contributor — developing @nativectx/ui itself] ${skill.description}`
      : skill.description;

    server.resource(
      `nativectx-${key}`,
      skill.uri,
      { description, mimeType: 'text/markdown' },
      async () => {
        try {
          const text = readFileSync(join(skillsDir, skill.file), 'utf-8');
          return { contents: [{ uri: skill.uri, text, mimeType: 'text/markdown' }] };
        } catch {
          return { contents: [{ uri: skill.uri, text: `Skill file not found: ${skill.file}`, mimeType: 'text/plain' }] };
        }
      },
    );
  }
}
