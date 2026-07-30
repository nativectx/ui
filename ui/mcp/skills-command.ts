import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_SOURCE = join(__dirname, 'skills');

export function runSkillsCommand() {
  const dest = join(process.cwd(), '.claude', 'skills');

  if (!existsSync(SKILLS_SOURCE)) {
    console.error('Error: skills directory not found in package. Try rebuilding with `pnpm build:mcp`.');
    process.exit(1);
  }

  mkdirSync(dest, { recursive: true });

  const files = readdirSync(SKILLS_SOURCE).filter(
    (f) => f.startsWith('nativectx-') && f.endsWith('.md'),
  );

  if (files.length === 0) {
    console.error('Error: no @nativectx/ui skill files found.');
    process.exit(1);
  }

  for (const file of files) {
    copyFileSync(join(SKILLS_SOURCE, file), join(dest, file));
    console.log(`  ✓  ${file}`);
  }

  console.log(`\nInstalled ${files.length} skills to .claude/skills/\n`);
  console.log('Claude Code picks these up automatically — no further setup needed.');
  console.log('To update skills after upgrading @nativectx/ui, run this command again.');
}
