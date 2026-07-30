import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_SOURCE = join(__dirname, 'skills');

// Exact shape only. A loose startsWith/endsWith check also matches
// sync-conflict copies like "nativectx-setup 2.md", which would install
// stale duplicates alongside the real skills.
const SKILL_FILE = /^nativectx-([a-z]+)\.md$/;

// Skills about developing @nativectx/ui itself rather than building an app with
// it. They are still published in the package (and served over MCP), but are
// only copied into a project behind `--contributor` so they don't compete for
// model attention in consumer projects.
export const CONTRIBUTOR_SKILLS = ['dev', 'contributing'];

export function isContributorSkill(name: string): boolean {
  return CONTRIBUTOR_SKILLS.includes(name);
}

export interface SkillsCommandOptions {
  /** Also install the contributor skills (library development, not app building). */
  contributor?: boolean;
}

export function runSkillsCommand(options: SkillsCommandOptions = {}) {
  const dest = join(process.cwd(), '.claude', 'skills');

  if (!existsSync(SKILLS_SOURCE)) {
    console.error('Error: skills directory not found in package. Try rebuilding with `pnpm build:mcp`.');
    process.exit(1);
  }

  mkdirSync(dest, { recursive: true });

  const all: Array<{ file: string; contributor: boolean }> = [];
  for (const file of readdirSync(SKILLS_SOURCE)) {
    const match = SKILL_FILE.exec(file);
    if (match) all.push({ file, contributor: isContributorSkill(match[1]) });
  }

  if (all.length === 0) {
    console.error('Error: no @nativectx/ui skill files found.');
    process.exit(1);
  }

  const contributorCount = all.filter((skill) => skill.contributor).length;
  const consumerCount = all.length - contributorCount;
  const files = options.contributor ? all : all.filter((skill) => !skill.contributor);

  if (files.length === 0) {
    console.error('Error: no @nativectx/ui skill files found for this audience.');
    process.exit(1);
  }

  for (const skill of files) {
    copyFileSync(join(SKILLS_SOURCE, skill.file), join(dest, skill.file));
    console.log(`  ✓  ${skill.file}${skill.contributor ? '  (contributor)' : ''}`);
  }

  if (options.contributor) {
    console.log(
      `\nInstalled ${files.length} skills to .claude/skills/ ` +
        `— ${consumerCount} for building apps, ${contributorCount} for developing @nativectx/ui itself.\n`,
    );
  } else {
    console.log(`\nInstalled ${files.length} app-building skills to .claude/skills/\n`);
    console.log(
      `${contributorCount} contributor skill(s) about developing @nativectx/ui itself were not installed.`,
    );
    console.log('Run `npx nativectx skills --contributor` if you are working on the library.\n');
  }

  console.log('Claude Code picks these up automatically — no further setup needed.');
  console.log('To update skills after upgrading @nativectx/ui, run this command again.');
}
