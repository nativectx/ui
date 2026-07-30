import { startMcpServer } from './server.js';
import { runSkillsCommand } from './skills-command.js';

const command = process.argv[2];

switch (command) {
  case 'mcp':
    await startMcpServer();
    break;

  case 'skills':
    runSkillsCommand();
    break;

  default:
    console.log(`NativeCtx UI CLI\n`);
    console.log('Usage: nativectx <command>\n');
    console.log('Commands:');
    console.log('  mcp     Start the MCP server for Claude Code / Claude Desktop');
    console.log('  skills  Install Claude Skills into .claude/skills/\n');
    console.log('Examples:');
    console.log('  npx @nativectx/ui mcp');
    console.log('  npx @nativectx/ui skills');
    if (command && command !== '--help' && command !== 'help') {
      console.error(`\nUnknown command: ${command}`);
      process.exit(1);
    }
    break;
}
