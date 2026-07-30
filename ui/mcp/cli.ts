import { runMigrateCommand } from './migrate-command.js';
import { startMcpServer } from './server.js';
import { runSkillsCommand } from './skills-command.js';

const command = process.argv[2];

switch (command) {
  case 'mcp':
    await startMcpServer();
    break;

  case 'skills':
    runSkillsCommand({ contributor: process.argv.slice(3).includes('--contributor') });
    break;

  case 'migrate':
    runMigrateCommand(process.argv.slice(3));
    break;

  default:
    console.log(`NativeCtx UI CLI\n`);
    console.log('Usage: nativectx <command>\n');
    console.log('Commands:');
    console.log('  mcp      Start the MCP server for Claude Code / Claude Desktop');
    console.log('  skills   Install Claude Skills for building apps into .claude/skills/');
    console.log('  migrate  Upgrade a project from zero-to-app to @nativectx/ui\n');
    console.log('Flags:');
    console.log('  --contributor  (skills) also install skills for developing @nativectx/ui itself');
    console.log('  --dry-run      (migrate) preview changes without writing\n');
    console.log('Examples:');
    console.log('  npx nativectx mcp');
    console.log('  npx nativectx skills');
    console.log('  npx nativectx skills --contributor');
    console.log('  npx nativectx migrate --dry-run');
    if (command && command !== '--help' && command !== 'help') {
      console.error(`\nUnknown command: ${command}`);
      process.exit(1);
    }
    break;
}
