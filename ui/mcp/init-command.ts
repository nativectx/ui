/**
 * `nativectx init` — wire @nativectx/ui into an app that already exists.
 *
 * Installing the package is one command; making it *usable* was four more, and
 * two of them were hand-editing files from a README snippet: the `.mcp.json`
 * server entry and the provider in the root layout. Those are the steps people
 * get wrong, because both depend on what is already in the file.
 *
 * ── What it does ──────────────────────────────────────────────────────────
 *  1. Installs the app-building skills (the `skills` command, reused verbatim).
 *  2. Adds the `nativectx` MCP server to `.mcp.json`, merging into whatever is
 *     already there.
 *  3. Reports peers the app is missing, with one install line to paste.
 *  4. Finds the root layout and reports whether the provider is wired.
 *
 * ── What it deliberately does NOT do ──────────────────────────────────────
 *  • Edit the root layout. On the current Expo template that file already has a
 *    `ThemeProvider`, an `AnimatedSplashOverlay` and an `AppTabs` in it, and
 *    there is no single correct place to splice a provider into an arbitrary
 *    tree. Guessing wrong there breaks the app silently; printing the snippet
 *    with the real detected path does not. Claude Code — which by then has the
 *    skills — is the right tool for that edit.
 *  • Run a package manager. It reports the install line rather than choosing
 *    npm/pnpm/yarn/bun on the user's behalf, and `npx expo install` is the one
 *    form that resolves SDK-compatible versions.
 *  • Overwrite an existing `nativectx` MCP entry that differs from the default.
 *    A pinned local path (`node ./node_modules/...`) is a deliberate choice and
 *    silently replacing it with `npx` would undo it.
 *
 * Everything here that makes a decision is a pure function over strings, so the
 * merge and detection logic is unit tested without touching a filesystem.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { runSkillsCommand } from './skills-command.js';

// ── MCP config ──────────────────────────────────────────────────────────────

export const MCP_SERVER_KEY = 'nativectx';

/**
 * The entry this command writes.
 *
 * `-y` because `nativectx` is a thin alias package that a project need not
 * depend on directly; without it npx stops to ask before fetching, which reads
 * as a hang inside an MCP client that shows no prompt.
 */
export const MCP_SERVER_ENTRY = { command: 'npx', args: ['-y', 'nativectx', 'mcp'] } as const;

/** The pre-rename key, so an un-migrated project gets pointed at `migrate`. */
const LEGACY_MCP_KEY = 'zero-to-app';

export type McpStatus =
  | 'created' // no .mcp.json existed
  | 'added' // merged into an existing file
  | 'present' // already configured, byte-for-byte equivalent
  | 'conflict' // a different `nativectx` entry is there; left alone
  | 'unparseable'; // not JSON, or not an object; left alone

export interface McpPlan {
  status: McpStatus;
  /** File contents to write, or null when nothing should be written. */
  next: string | null;
  detail: string;
  /** Server keys already in the file that this command did not touch. */
  preserved: string[];
  /** True when the file still carries the pre-rename `zero-to-app` server key. */
  legacyKeyPresent: boolean;
}

/**
 * Infer the file's existing indentation so a merge does not reformat it.
 *
 * A two-space default matches the README snippet, which is where most of these
 * files are copied from in the first place.
 */
export function detectIndent(raw: string): string {
  const match = /^([ \t]+)\S/m.exec(raw);
  return match ? match[1] : '  ';
}

/**
 * Does this entry already start *our* MCP server, however it was spelled?
 *
 * Deliberately looser than an equality check. All of these work and are in the
 * wild — the README has shipped more than one of them — and a command that
 * reported a working config as a conflict would be nagging about nothing:
 *
 *   npx  -y nativectx mcp          npx nativectx mcp
 *   npx  -y @nativectx/ui mcp      node ./node_modules/@nativectx/ui/dist/mcp/cli.mjs mcp
 *
 * The test is: some argument names this package (or its bundled CLI), and some
 * later argument is the `mcp` subcommand. That is narrow enough that an
 * unrelated server parked under this key still comes back as a conflict.
 */
export function isEquivalentEntry(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entry = value as { command?: unknown; args?: unknown };
  if (!Array.isArray(entry.args)) return false;

  const args = entry.args.filter((arg): arg is string => typeof arg === 'string');
  const namesUs = (arg: string) =>
    arg === 'nativectx' || arg === '@nativectx/ui' || /(^|[/\\])cli\.mjs$/.test(arg);

  const packageAt = args.findIndex(namesUs);
  return packageAt !== -1 && args.indexOf('mcp', packageAt + 1) !== -1;
}

/**
 * Decide what `.mcp.json` should become, from its current contents alone.
 *
 * `raw` is null when the file does not exist. Every outcome that is not
 * `created`/`added` returns `next: null` — the caller writes nothing, so an
 * unreadable or hand-tuned config can never be clobbered by this command.
 */
export function planMcpConfig(raw: string | null): McpPlan {
  if (raw === null) {
    const config = { mcpServers: { [MCP_SERVER_KEY]: MCP_SERVER_ENTRY } };
    return {
      status: 'created',
      next: `${JSON.stringify(config, null, 2)}\n`,
      detail: `created with the "${MCP_SERVER_KEY}" server`,
      preserved: [],
      legacyKeyPresent: false,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      status: 'unparseable',
      next: null,
      detail: 'is not valid JSON — left untouched',
      preserved: [],
      legacyKeyPresent: false,
    };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      status: 'unparseable',
      next: null,
      detail: 'is not a JSON object — left untouched',
      preserved: [],
      legacyKeyPresent: false,
    };
  }

  const config = parsed as Record<string, unknown>;
  const serversValue = config.mcpServers;
  const servers =
    serversValue && typeof serversValue === 'object' && !Array.isArray(serversValue)
      ? (serversValue as Record<string, unknown>)
      : {};

  const preserved = Object.keys(servers).filter((key) => key !== MCP_SERVER_KEY);
  const legacyKeyPresent = LEGACY_MCP_KEY in servers;

  if (MCP_SERVER_KEY in servers) {
    return isEquivalentEntry(servers[MCP_SERVER_KEY])
      ? {
          status: 'present',
          next: null,
          detail: `already starts the "${MCP_SERVER_KEY}" server`,
          preserved,
          legacyKeyPresent,
        }
      : {
          status: 'conflict',
          next: null,
          detail: `already has a different "${MCP_SERVER_KEY}" server — left untouched`,
          preserved,
          legacyKeyPresent,
        };
  }

  // Spread order puts the new key last, so existing servers keep their position
  // and the diff is a single added block.
  const next = { ...config, mcpServers: { ...servers, [MCP_SERVER_KEY]: MCP_SERVER_ENTRY } };
  return {
    status: 'added',
    next: `${JSON.stringify(next, null, detectIndent(raw))}\n`,
    // Past participle so the caller can prefix "would be " for a dry run.
    detail:
      `updated with the "${MCP_SERVER_KEY}" server` +
      (preserved.length > 0 ? `, alongside ${preserved.length} existing server(s)` : ''),
    preserved,
    legacyKeyPresent,
  };
}

// ── Peers ───────────────────────────────────────────────────────────────────

/**
 * Peers the package marks optional that a *new app* still wants on day one.
 *
 * `@expo/vector-icons` is optional because the library bundles and renders
 * without it (`renderIcon` warns once and returns nothing) — but an app with no
 * icons is not what anyone is scaffolding. `expo-router` is optional because the
 * non-navigation components never import it, yet every navigation component
 * does, and the current template ships it anyway.
 *
 * Everything else stays where `peerDependenciesMeta` puts it. This list exists
 * to soften two specific over-strict `optional: true` flags, not to become a
 * second source of truth for the peer set.
 */
const RECOMMENDED_PEERS = new Set(['@expo/vector-icons', 'expo-router']);

/** What an absent optional peer costs you, for the "install if you need it" line. */
const OPTIONAL_PEER_REASON: Record<string, string> = {
  '@react-native-community/slider': 'Slider',
  'expo-image': 'ThemedImage',
  'expo-symbols': 'SF Symbols',
  'sf-symbols-typescript': 'SF Symbols typings',
};

export interface PeerPlan {
  /** Non-optional peers the app does not depend on. */
  missingRequired: string[];
  /** Optional-but-wanted peers the app does not depend on. */
  missingRecommended: string[];
  /** Per-component optional peers that are absent, with what they unlock. */
  missingOptional: { name: string; unlocks: string }[];
  /** One line to paste, covering required + recommended. Null when nothing is missing. */
  installCommand: string | null;
}

export interface PeerSpec {
  name: string;
  optional: boolean;
}

/**
 * Read the peer contract off this package's own manifest.
 *
 * Deriving it means the check cannot drift from what the package actually
 * declares — the same reason `migrate` reads its own version rather than
 * hardcoding a range.
 */
export function readPeerSpecs(pkg: {
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
}): PeerSpec[] {
  const meta = pkg.peerDependenciesMeta ?? {};
  return Object.keys(pkg.peerDependencies ?? {}).map((name) => ({
    name,
    optional: meta[name]?.optional === true,
  }));
}

export function planPeers(installed: Set<string>, peers: PeerSpec[]): PeerPlan {
  const missingRequired: string[] = [];
  const missingRecommended: string[] = [];
  const missingOptional: { name: string; unlocks: string }[] = [];

  for (const { name, optional } of peers) {
    if (installed.has(name)) continue;

    if (!optional) missingRequired.push(name);
    else if (RECOMMENDED_PEERS.has(name)) missingRecommended.push(name);
    else missingOptional.push({ name, unlocks: OPTIONAL_PEER_REASON[name] ?? name });
  }

  const needed = [...missingRequired, ...missingRecommended];
  return {
    missingRequired,
    missingRecommended,
    missingOptional,
    installCommand: needed.length > 0 ? `npx expo install ${needed.join(' ')}` : null,
  };
}

/** Every package name the app declares, across all three dependency fields. */
export function installedDependencies(pkg: Record<string, unknown>): Set<string> {
  const names = new Set<string>();
  for (const field of ['dependencies', 'devDependencies', 'peerDependencies']) {
    const deps = pkg[field];
    if (deps && typeof deps === 'object' && !Array.isArray(deps)) {
      for (const name of Object.keys(deps)) names.add(name);
    }
  }
  return names;
}

// ── Root layout ─────────────────────────────────────────────────────────────

/**
 * Where expo-router root layouts live, most-current template first.
 *
 * The `src/` form is what `create-expo-app --template default@sdk-56` produces;
 * the bare `app/` form is the older convention and still extremely common.
 */
export const LAYOUT_CANDIDATES = [
  'src/app/_layout.tsx',
  'app/_layout.tsx',
  'src/app/_layout.jsx',
  'app/_layout.jsx',
  'src/app/_layout.js',
  'app/_layout.js',
];

export type ProviderStatus = 'wired' | 'needs-wiring' | 'no-layout';

export interface ProviderPlan {
  status: ProviderStatus;
  /** Repo-relative path of the layout that was found, or null. */
  layout: string | null;
}

export function planProvider(layout: string | null, source: string | null): ProviderPlan {
  if (layout === null || source === null) return { status: 'no-layout', layout: null };
  return {
    status: /\bNativeCtxProvider\b/.test(source) ? 'wired' : 'needs-wiring',
    layout,
  };
}

/** The wiring the user has to do by hand, printed against their real path. */
function providerSnippet(layout: string): string {
  return [
    `// ${layout}`,
    `import { NativeCtxProvider, createBrand } from '@nativectx/ui';`,
    ``,
    `const brand = createBrand({`,
    `  name: 'My App',`,
    `  colors: { colorSeed: { primary: '#6750A4' } },`,
    `  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 40 },`,
    `  borderRadius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 28, full: 9999 },`,
    `});`,
    ``,
    `// …then wrap what the layout already returns:`,
    `//   <NativeCtxProvider brand={brand}>{/* existing tree */}</NativeCtxProvider>`,
  ].join('\n');
}

// ── Runner ──────────────────────────────────────────────────────────────────

function ownPackageJson(): { peerDependencies?: Record<string, string>; peerDependenciesMeta?: Record<string, { optional?: boolean }> } {
  try {
    const path = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'package.json');
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return {};
  }
}

function readIfPresent(path: string): string | null {
  return existsSync(path) ? readFileSync(path, 'utf-8') : null;
}

export function runInitCommand(argv: string[]): void {
  const dryRun = argv.includes('--dry-run');
  const contributor = argv.includes('--contributor');
  const root = process.cwd();

  console.log(`Setting up @nativectx/ui${dryRun ? '  (dry run — no files written)' : ''}\n`);

  // 1 ── Skills
  console.log('Claude Skills');
  runSkillsCommand({ contributor, dryRun, indent: '  ' });

  // 2 ── MCP server
  const mcpPath = join(root, '.mcp.json');
  const mcp = planMcpConfig(readIfPresent(mcpPath));
  if (mcp.next !== null && !dryRun) writeFileSync(mcpPath, mcp.next);

  console.log('\nMCP server');
  const mcpMark = mcp.status === 'conflict' || mcp.status === 'unparseable' ? '!' : '✓';
  console.log(`  ${mcpMark}  .mcp.json ${dryRun && mcp.next !== null ? `would be ${mcp.detail}` : mcp.detail}`);
  if (mcp.preserved.length > 0) {
    console.log(`     kept: ${mcp.preserved.join(', ')}`);
  }
  if (mcp.status === 'conflict') {
    console.log(`     Yours may be deliberate (a pinned local path, for one). Replace it by hand if not:`);
    console.log(`       "${MCP_SERVER_KEY}": ${JSON.stringify(MCP_SERVER_ENTRY)}`);
  }
  if (mcp.status === 'unparseable') {
    console.log(`     Fix the JSON and re-run, or add the entry by hand:`);
    console.log(`       "${MCP_SERVER_KEY}": ${JSON.stringify(MCP_SERVER_ENTRY)}`);
  }
  if (mcp.legacyKeyPresent) {
    console.log(`     A "${LEGACY_MCP_KEY}" server is still configured — run \`npx nativectx migrate\`.`);
  }

  // 3 ── Peers
  const appPkgRaw = readIfPresent(join(root, 'package.json'));
  console.log('\nDependencies');
  if (appPkgRaw === null) {
    console.log('  !  no package.json here — run this from your app directory.');
  } else {
    let installed = new Set<string>();
    let readable = true;
    try {
      installed = installedDependencies(JSON.parse(appPkgRaw));
    } catch {
      readable = false;
    }

    if (!readable) {
      console.log('  !  package.json is not valid JSON — skipped the peer check.');
    } else {
      const peers = planPeers(installed, readPeerSpecs(ownPackageJson()));

      if (!installed.has('@nativectx/ui')) {
        console.log('  !  @nativectx/ui is not in package.json yet:');
        console.log('       npx expo install @nativectx/ui');
      }
      if (peers.installCommand) {
        console.log(`  !  missing ${peers.missingRequired.length + peers.missingRecommended.length} peer(s):`);
        console.log(`       ${peers.installCommand}`);
      } else {
        console.log('  ✓  every required peer is installed');
      }
      for (const { name, unlocks } of peers.missingOptional) {
        console.log(`  ·  ${name} absent — only needed for ${unlocks}`);
      }
    }
  }

  // 4 ── Provider
  const layout = LAYOUT_CANDIDATES.find((candidate) => existsSync(join(root, candidate))) ?? null;
  const provider = planProvider(layout, layout ? readIfPresent(join(root, layout)) : null);

  console.log('\nProvider');
  if (provider.status === 'wired') {
    console.log(`  ✓  ${provider.layout} already renders <NativeCtxProvider>`);
  } else if (provider.status === 'needs-wiring') {
    console.log(`  →  ${provider.layout} found — add the provider yourself:\n`);
    console.log(
      providerSnippet(provider.layout as string)
        .split('\n')
        .map((line) => `       ${line}`)
        .join('\n'),
    );
    console.log('\n     Or just ask Claude Code — the skills above tell it how.');
  } else {
    console.log('  !  no expo-router root layout found.');
    console.log(`     Looked for: ${LAYOUT_CANDIDATES.join(', ')}`);
  }

  console.log(dryRun ? '\nDry run — nothing was written.' : '\nDone. Restart Claude Code so it picks up the MCP server.');
}
