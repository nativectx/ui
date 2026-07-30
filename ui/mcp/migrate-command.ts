import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'fs';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';
import { runSkillsCommand } from './skills-command.js';

const OLD_PKG = 'zero-to-app';
const NEW_PKG = '@nativectx/ui';
const OLD_SYMBOL = 'ZeroToApp';
const NEW_SYMBOL = 'NativeCtxProvider';
const OLD_MCP_KEY = 'zero-to-app';
const NEW_MCP_KEY = 'nativectx';

const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage',
  '.expo', '.next', '.turbo', 'ios', 'android',
]);
const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

type Change = { file: string; detail: string };

/** Resolve the version range to pin consumers to, from this package's own version. */
function targetRange(): string {
  try {
    const pkgPath = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'package.json');
    const { version } = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return `^${version}`;
  } catch {
    return '^0.1.0';
  }
}

function walk(dir: string, keep: (file: string) => boolean, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }

  for (const entry of entries) {
    const full = join(dir, entry);
    let isDir: boolean;
    try {
      isDir = statSync(full).isDirectory();
    } catch {
      continue;
    }

    if (isDir) {
      if (!IGNORED_DIRS.has(entry)) walk(full, keep, out);
    } else if (keep(entry)) {
      out.push(full);
    }
  }
  return out;
}

/** Swap the dependency across dependencies/devDependencies/peerDependencies. */
function migrateManifests(root: string, dryRun: boolean): Change[] {
  const changes: Change[] = [];
  const range = targetRange();
  const manifests = walk(root, (f) => f === 'package.json');

  for (const file of manifests) {
    const raw = readFileSync(file, 'utf-8');
    let pkg: Record<string, Record<string, string>>;
    try {
      pkg = JSON.parse(raw);
    } catch {
      continue;
    }

    let touched = false;
    for (const field of ['dependencies', 'devDependencies', 'peerDependencies']) {
      const deps = pkg[field];
      if (!deps || !(OLD_PKG in deps)) continue;

      const existing = deps[OLD_PKG];
      // Preserve workspace/link protocols; otherwise pin to this major.
      const next = /^(workspace|link|file|portal):/.test(existing) ? existing : range;

      delete deps[OLD_PKG];
      deps[NEW_PKG] = next;
      pkg[field] = Object.fromEntries(Object.entries(deps).sort(([a], [b]) => a.localeCompare(b)));

      changes.push({ file: relative(root, file), detail: `${field}: ${OLD_PKG} -> ${NEW_PKG}@${next}` });
      touched = true;
    }

    // Detect the old bin name in scripts (e.g. "npx zero-to-app skills").
    if (pkg.scripts) {
      for (const [name, script] of Object.entries(pkg.scripts)) {
        if (typeof script === 'string' && script.includes(`npx ${OLD_PKG}`)) {
          pkg.scripts[name] = script.replaceAll(`npx ${OLD_PKG}`, `npx ${NEW_PKG}`);
          changes.push({ file: relative(root, file), detail: `scripts.${name}: npx ${OLD_PKG} -> npx ${NEW_PKG}` });
          touched = true;
        }
      }
    }

    if (touched && !dryRun) {
      writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
    }
  }
  return changes;
}

/** Rewrite import specifiers and the renamed provider symbol in source files. */
function migrateSource(root: string, dryRun: boolean): Change[] {
  const changes: Change[] = [];
  const files = walk(root, (f) => CODE_EXTENSIONS.some((ext) => f.endsWith(ext)));

  for (const file of files) {
    const original = readFileSync(file, 'utf-8');
    let next = original;
    const detail: string[] = [];

    // Deep imports first, then the bare specifier. Quoted forms only, so prose is untouched.
    const deep = next.replace(new RegExp(`(['"\`])${OLD_PKG}/`, 'g'), `$1${NEW_PKG}/`);
    if (deep !== next) detail.push('deep imports');
    next = deep;

    const bare = next.replace(new RegExp(`(['"\`])${OLD_PKG}\\1`, 'g'), `$1${NEW_PKG}$1`);
    if (bare !== next) detail.push('package specifier');
    next = bare;

    // Word-boundary so ZeroToAppProps and similar are left alone.
    const symbol = next.replace(new RegExp(`\\b${OLD_SYMBOL}\\b`, 'g'), NEW_SYMBOL);
    if (symbol !== next) detail.push(`${OLD_SYMBOL} -> ${NEW_SYMBOL}`);
    next = symbol;

    if (next !== original) {
      if (!dryRun) writeFileSync(file, next);
      changes.push({ file: relative(root, file), detail: detail.join(', ') });
    }
  }
  return changes;
}

/** Rewrite the MCP server entry in project-local Claude config files. */
function migrateMcpConfig(root: string, dryRun: boolean): Change[] {
  const changes: Change[] = [];
  const candidates = walk(root, (f) => f === '.mcp.json' || f === 'claude_desktop_config.json');

  for (const file of candidates) {
    const original = readFileSync(file, 'utf-8');
    let next = original;

    next = next.replaceAll(`"${OLD_MCP_KEY}": {`, `"${NEW_MCP_KEY}": {`);
    next = next.replaceAll(`"${OLD_PKG}", "mcp"`, `"${NEW_PKG}", "mcp"`);
    next = next.replaceAll(`node_modules/${OLD_PKG}/`, `node_modules/${NEW_PKG}/`);

    if (next !== original) {
      if (!dryRun) writeFileSync(file, next);
      changes.push({ file: relative(root, file), detail: 'MCP server entry updated' });
    }
  }
  return changes;
}

/** Remove skill files installed under the old name so they can't contradict the new set. */
function removeStaleSkills(root: string, dryRun: boolean): Change[] {
  const dir = join(root, '.claude', 'skills');
  if (!existsSync(dir)) return [];

  const stale = readdirSync(dir).filter((f) => f.startsWith(`${OLD_PKG}-`) && f.endsWith('.md'));
  const changes: Change[] = [];

  for (const file of stale) {
    if (!dryRun) rmSync(join(dir, file));
    changes.push({ file: join('.claude', 'skills', file), detail: 'removed stale skill' });
  }
  return changes;
}

/** Occurrences the codemod deliberately leaves alone — prose, docs, identifiers. */
function findResidual(root: string): Change[] {
  const files = walk(root, (f) =>
    CODE_EXTENSIONS.some((ext) => f.endsWith(ext)) || f.endsWith('.md') || f.endsWith('.json'),
  );

  // Skill files are shipped by this package and legitimately mention the old
  // name (the migration skill documents it), so they are not user content.
  const skillsDir = join(root, '.claude', 'skills');

  // Catches zero-to-app, zero_to_app, ZeroToApp, zeroToApp and zerotoapp, so
  // camelCase locals derived from the old name surface too.
  const anySpelling = /zero[-_]?to[-_]?app/i;

  const residual: Change[] = [];
  for (const file of files) {
    if (file.startsWith(skillsDir)) continue;
    const lines = readFileSync(file, 'utf-8').split('\n');
    lines.forEach((line, i) => {
      if (anySpelling.test(line)) {
        residual.push({ file: `${relative(root, file)}:${i + 1}`, detail: line.trim().slice(0, 100) });
      }
    });
  }
  return residual;
}

function gitIsDirty(root: string): boolean {
  try {
    return execSync('git status --porcelain', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim().length > 0;
  } catch {
    return false;
  }
}

function report(title: string, changes: Change[]): void {
  if (changes.length === 0) return;
  console.log(`\n${title}`);
  for (const c of changes) console.log(`  ${c.file}${c.detail ? `  — ${c.detail}` : ''}`);
}

export function runMigrateCommand(argv: string[]): void {
  const dryRun = argv.includes('--dry-run');
  const root = process.cwd();

  console.log(`Migrating ${OLD_PKG} -> ${NEW_PKG}${dryRun ? '  (dry run — no files written)' : ''}\n`);

  if (!dryRun && gitIsDirty(root)) {
    console.log('⚠  Uncommitted changes present. Commit or stash first so this is easy to revert.');
    console.log('   Re-run with --dry-run to preview instead.\n');
  }

  const manifests = migrateManifests(root, dryRun);
  const source = migrateSource(root, dryRun);
  const mcp = migrateMcpConfig(root, dryRun);
  const stale = removeStaleSkills(root, dryRun);

  report('Manifests', manifests);
  report('Source files', source);
  report('MCP config', mcp);
  report('Skills', stale);

  const total = manifests.length + source.length + mcp.length + stale.length;

  if (total === 0) {
    console.log('Nothing to migrate — no references to the old package found.');
    return;
  }

  if (!dryRun) {
    if (stale.length > 0) {
      console.log('\nInstalling current skills...');
      runSkillsCommand();
    }

    const residual = findResidual(root);
    if (residual.length > 0) {
      console.log(`\n${residual.length} reference(s) left for manual review (prose, docs, local names):`);
      for (const r of residual.slice(0, 20)) console.log(`  ${r.file}  ${r.detail}`);
      if (residual.length > 20) console.log(`  ...and ${residual.length - 20} more`);
    }
  }

  console.log(`\n${dryRun ? 'Would change' : 'Changed'} ${total} file(s).`);

  if (!dryRun) {
    console.log('\nNext steps:');
    console.log('  1. Reinstall dependencies (npm install / pnpm install / yarn).');
    console.log('  2. Restart Metro with --clear so the new module resolves.');
    console.log('  3. If you use Claude Desktop, update its config manually — it lives');
    console.log('     outside your project, so this command does not touch it.');
  }
}
