import { copyFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Resolved lazily rather than at module load: the planning logic below is unit
// tested under Jest's CJS transform, where `import.meta.url` is not available.
function skillsSource(): string {
  return join(dirname(fileURLToPath(import.meta.url)), 'skills');
}

// Exact shape only. A loose startsWith/endsWith check also matches
// sync-conflict copies like "nativectx-setup 2.md", which would install
// stale duplicates alongside the real skills. It also bounds what prune is
// allowed to delete from the user's .claude/skills/.
const SKILL_FILE = /^nativectx-([a-z]+)\.md$/;

// Skills about developing @nativectx/ui itself rather than building an app with
// it. They are still published in the package (and served over MCP), but are
// only copied into a project behind `--contributor` so they don't compete for
// model attention in consumer projects.
export const CONTRIBUTOR_SKILLS = ['dev', 'contributing'];

export function isContributorSkill(name: string): boolean {
  return CONTRIBUTOR_SKILLS.includes(name);
}

/** The skill name this package owns for a filename, or null if it isn't ours. */
export function skillName(file: string): string | null {
  const match = SKILL_FILE.exec(file);
  return match ? match[1] : null;
}

export interface SkillsCommandOptions {
  /** Also install the contributor skills (library development, not app building). */
  contributor?: boolean;
}

export interface SkillPlan {
  /** Files to copy from the package into .claude/skills/. */
  install: string[];
  /** Files already in .claude/skills/ to delete. */
  prune: string[];
  /** Contributor files available in the package but held back this run. */
  heldBack: string[];
}

/**
 * Decide what to install and what to remove, from directory listings alone.
 *
 * Consumer runs prune any contributor skills a previous install left behind:
 * stale skills sitting next to current ones give Claude two contradictory
 * sources. Prune is bounded by the same filename guard as install, so it can
 * only ever delete files this package owns.
 */
export function planSkills(
  sourceFiles: string[],
  destFiles: string[],
  options: SkillsCommandOptions = {},
): SkillPlan {
  const owned = sourceFiles
    .map((file) => ({ file, name: skillName(file) }))
    .filter((entry): entry is { file: string; name: string } => entry.name !== null);

  const install = owned
    .filter((entry) => options.contributor || !isContributorSkill(entry.name))
    .map((entry) => entry.file);

  const heldBack = options.contributor
    ? []
    : owned.filter((entry) => isContributorSkill(entry.name)).map((entry) => entry.file);

  const prune = options.contributor
    ? []
    : destFiles.filter((file) => {
        const name = skillName(file);
        return name !== null && isContributorSkill(name);
      });

  return { install, prune, heldBack };
}

export function runSkillsCommand(options: SkillsCommandOptions = {}) {
  const source = skillsSource();
  const dest = join(process.cwd(), '.claude', 'skills');

  if (!existsSync(source)) {
    console.error('Error: skills directory not found in package. Try rebuilding with `pnpm build:mcp`.');
    process.exit(1);
  }

  mkdirSync(dest, { recursive: true });

  const { install, prune, heldBack } = planSkills(readdirSync(source), readdirSync(dest), options);

  if (install.length === 0) {
    console.error('Error: no @nativectx/ui skill files found.');
    process.exit(1);
  }

  for (const file of install) {
    copyFileSync(join(source, file), join(dest, file));
    const name = skillName(file);
    console.log(`  ✓  ${file}${name && isContributorSkill(name) ? '  (contributor)' : ''}`);
  }

  for (const file of prune) {
    rmSync(join(dest, file));
    console.log(`  −  ${file}  (removed — contributor skill)`);
  }

  if (options.contributor) {
    const contributorCount = install.filter((file) => {
      const name = skillName(file);
      return name !== null && isContributorSkill(name);
    }).length;
    console.log(
      `\nInstalled ${install.length} skills to .claude/skills/ ` +
        `— ${install.length - contributorCount} for building apps, ${contributorCount} for developing @nativectx/ui itself.\n`,
    );
  } else {
    console.log(`\nInstalled ${install.length} app-building skills to .claude/skills/\n`);
    if (prune.length > 0) {
      console.log(`Removed ${prune.length} contributor skill(s) left by an earlier install.`);
    }
    console.log(
      `${heldBack.length} contributor skill(s) about developing @nativectx/ui itself were not installed.`,
    );
    console.log('Run `npx nativectx skills --contributor` if you are working on the library.\n');
  }

  console.log('Claude Code picks these up automatically — no further setup needed.');
  console.log('To update skills after upgrading @nativectx/ui, run this command again.');
}
