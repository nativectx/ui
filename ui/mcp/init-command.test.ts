import {
  MCP_SERVER_ENTRY,
  MCP_SERVER_KEY,
  detectIndent,
  installedDependencies,
  isEquivalentEntry,
  planMcpConfig,
  planPeers,
  planProvider,
  readPeerSpecs,
  type PeerSpec,
} from './init-command';

/** Written out longhand so a change to the real constant has to be deliberate. */
const ENTRY_JSON = { command: 'npx', args: ['-y', 'nativectx', 'mcp'] };

it('writes the entry the docs document', () => {
  // MCP_SERVER_ENTRY is `as const`; JSON round-trips it to a plain mutable shape.
  expect(JSON.parse(JSON.stringify(MCP_SERVER_ENTRY))).toEqual(ENTRY_JSON);
});

/** The peer contract as ui/package.json declares it today. */
const PEERS: PeerSpec[] = [
  { name: '@expo/ui', optional: false },
  { name: '@expo/vector-icons', optional: true },
  { name: '@react-native-community/slider', optional: true },
  { name: 'expo-image', optional: true },
  { name: 'expo-router', optional: true },
  { name: 'expo-symbols', optional: true },
  { name: 'react', optional: false },
  { name: 'react-native', optional: false },
  { name: 'react-native-reanimated', optional: false },
  { name: 'react-native-safe-area-context', optional: false },
  { name: 'sf-symbols-typescript', optional: true },
];

/** What `create-expo-app --template default@sdk-56` actually installs. */
const SDK56_TEMPLATE = new Set([
  '@expo/ui',
  'expo',
  'expo-image',
  'expo-router',
  'expo-symbols',
  'react',
  'react-dom',
  'react-native',
  'react-native-reanimated',
  'react-native-safe-area-context',
  'react-native-worklets',
]);

describe('planMcpConfig — no file yet', () => {
  it('creates a config containing only our server', () => {
    const plan = planMcpConfig(null);
    expect(plan.status).toBe('created');
    expect(JSON.parse(plan.next as string)).toEqual({ mcpServers: { [MCP_SERVER_KEY]: ENTRY_JSON } });
    expect(plan.preserved).toEqual([]);
  });

  it('ends the file with a newline', () => {
    expect(planMcpConfig(null).next).toMatch(/\n$/);
  });
});

describe('planMcpConfig — merging', () => {
  it('adds our server without disturbing the others', () => {
    const existing = JSON.stringify({
      mcpServers: {
        github: { command: 'npx', args: ['-y', 'gh-mcp'] },
        postgres: { command: 'pg-mcp' },
      },
    });

    const plan = planMcpConfig(existing);
    expect(plan.status).toBe('added');
    expect(plan.preserved).toEqual(['github', 'postgres']);

    const next = JSON.parse(plan.next as string);
    expect(next.mcpServers.github).toEqual({ command: 'npx', args: ['-y', 'gh-mcp'] });
    expect(next.mcpServers.postgres).toEqual({ command: 'pg-mcp' });
    expect(next.mcpServers[MCP_SERVER_KEY]).toEqual(ENTRY_JSON);
  });

  it('preserves unrelated top-level keys', () => {
    const plan = planMcpConfig(JSON.stringify({ $schema: 'https://example.com/s.json', mcpServers: {} }));
    expect(JSON.parse(plan.next as string).$schema).toBe('https://example.com/s.json');
  });

  it('treats a file with no mcpServers key as an empty server set', () => {
    const plan = planMcpConfig(JSON.stringify({ other: true }));
    expect(plan.status).toBe('added');
    expect(JSON.parse(plan.next as string).mcpServers[MCP_SERVER_KEY]).toEqual(ENTRY_JSON);
  });

  it('keeps the file s existing indentation', () => {
    const fourSpace = '{\n    "mcpServers": {\n        "github": {\n            "command": "gh"\n        }\n    }\n}';
    expect(planMcpConfig(fourSpace).next).toContain('\n    "mcpServers"');

    const tabbed = '{\n\t"mcpServers": {\n\t\t"github": {\n\t\t\t"command": "gh"\n\t\t}\n\t}\n}';
    expect(planMcpConfig(tabbed).next).toContain('\n\t"mcpServers"');
  });
});

describe('isEquivalentEntry — every spelling that actually works', () => {
  it('accepts the forms the docs have shipped over time', () => {
    const working = [
      { command: 'npx', args: ['-y', 'nativectx', 'mcp'] },
      { command: 'npx', args: ['nativectx', 'mcp'] },
      { command: 'npx', args: ['-y', '@nativectx/ui', 'mcp'] },
      { command: 'node', args: ['./node_modules/@nativectx/ui/dist/mcp/cli.mjs', 'mcp'] },
    ];
    for (const entry of working) expect(isEquivalentEntry(entry)).toBe(true);
  });

  it('rejects an unrelated server parked under our key', () => {
    const foreign = [
      { command: 'npx', args: ['-y', 'some-other-mcp', 'mcp'] },
      { command: 'python', args: ['server.py'] },
      { command: 'npx', args: ['nativectx', 'skills'] }, // ours, but not the server
      {},
      null,
      'npx nativectx mcp',
    ];
    for (const entry of foreign) expect(isEquivalentEntry(entry)).toBe(false);
  });

  it('requires `mcp` to come after the package name, not before', () => {
    expect(isEquivalentEntry({ command: 'npx', args: ['mcp', 'nativectx'] })).toBe(false);
  });
});

describe('planMcpConfig — never clobbers', () => {
  it('is a no-op when our exact server is already configured', () => {
    const plan = planMcpConfig(JSON.stringify({ mcpServers: { [MCP_SERVER_KEY]: ENTRY_JSON } }));
    expect(plan.status).toBe('present');
    expect(plan.next).toBeNull();
  });

  it('leaves a deliberately pinned local path alone, without calling it a conflict', () => {
    const pinned = {
      mcpServers: {
        [MCP_SERVER_KEY]: { command: 'node', args: ['./node_modules/@nativectx/ui/dist/mcp/cli.mjs', 'mcp'] },
      },
    };
    const plan = planMcpConfig(JSON.stringify(pinned));
    expect(plan.status).toBe('present');
    expect(plan.next).toBeNull();
  });

  it('does not rewrite an older entry that omits -y', () => {
    const older = { mcpServers: { [MCP_SERVER_KEY]: { command: 'npx', args: ['nativectx', 'mcp'] } } };
    expect(planMcpConfig(JSON.stringify(older)).status).toBe('present');
  });

  it('reports a genuine conflict when the key holds someone else s server', () => {
    const foreign = { mcpServers: { [MCP_SERVER_KEY]: { command: 'python', args: ['other-server.py'] } } };
    const plan = planMcpConfig(JSON.stringify(foreign));
    expect(plan.status).toBe('conflict');
    expect(plan.next).toBeNull();
  });

  it('writes nothing when the file is not valid JSON', () => {
    const plan = planMcpConfig('{ "mcpServers": { oops }');
    expect(plan.status).toBe('unparseable');
    expect(plan.next).toBeNull();
  });

  it('writes nothing when the file is JSON but not an object', () => {
    for (const raw of ['[]', '"a string"', 'null', '42']) {
      const plan = planMcpConfig(raw);
      expect(plan.status).toBe('unparseable');
      expect(plan.next).toBeNull();
    }
  });

  it('never returns content for a status that should not be written', () => {
    const cases = ['{ bad', '[]', JSON.stringify({ mcpServers: { [MCP_SERVER_KEY]: ENTRY_JSON } })];
    for (const raw of cases) expect(planMcpConfig(raw).next).toBeNull();
  });
});

describe('planMcpConfig — legacy key', () => {
  it('flags a leftover zero-to-app server', () => {
    const plan = planMcpConfig(JSON.stringify({ mcpServers: { 'zero-to-app': { command: 'npx' } } }));
    expect(plan.legacyKeyPresent).toBe(true);
    expect(plan.status).toBe('added');
  });

  it('does not flag a clean config', () => {
    expect(planMcpConfig(null).legacyKeyPresent).toBe(false);
    expect(planMcpConfig(JSON.stringify({ mcpServers: {} })).legacyKeyPresent).toBe(false);
  });
});

describe('detectIndent', () => {
  it('reads the first indented line', () => {
    expect(detectIndent('{\n  "a": 1\n}')).toBe('  ');
    expect(detectIndent('{\n    "a": 1\n}')).toBe('    ');
    expect(detectIndent('{\n\t"a": 1\n}')).toBe('\t');
  });

  it('falls back to two spaces when nothing is indented', () => {
    expect(detectIndent('{"a":1}')).toBe('  ');
    expect(detectIndent('')).toBe('  ');
  });
});

describe('readPeerSpecs', () => {
  it('treats a peer with no meta entry as required', () => {
    const specs = readPeerSpecs({
      peerDependencies: { react: '*', 'expo-image': '*' },
      peerDependenciesMeta: { 'expo-image': { optional: true } },
    });
    expect(specs).toEqual([
      { name: 'react', optional: false },
      { name: 'expo-image', optional: true },
    ]);
  });

  it('treats optional: false as required', () => {
    const specs = readPeerSpecs({
      peerDependencies: { '@expo/ui': '*' },
      peerDependenciesMeta: { '@expo/ui': { optional: false } },
    });
    expect(specs).toEqual([{ name: '@expo/ui', optional: false }]);
  });

  it('survives a manifest with no peers at all', () => {
    expect(readPeerSpecs({})).toEqual([]);
  });
});

describe('installedDependencies', () => {
  it('unions all three dependency fields', () => {
    const names = installedDependencies({
      dependencies: { expo: '~56.0.0' },
      devDependencies: { typescript: '~6.0.3' },
      peerDependencies: { react: '*' },
    });
    expect(names).toEqual(new Set(['expo', 'typescript', 'react']));
  });

  it('ignores fields that are missing or the wrong shape', () => {
    expect(installedDependencies({})).toEqual(new Set());
    expect(installedDependencies({ dependencies: null, devDependencies: ['nope'] })).toEqual(new Set());
  });
});

describe('planPeers — the sdk-56 template', () => {
  const plan = planPeers(SDK56_TEMPLATE, PEERS);

  it('finds every required peer already present', () => {
    expect(plan.missingRequired).toEqual([]);
  });

  it('asks only for icons — the one thing the template omits', () => {
    expect(plan.missingRecommended).toEqual(['@expo/vector-icons']);
    expect(plan.installCommand).toBe('npx expo install @expo/vector-icons');
  });

  it('does not ask for expo-image or expo-symbols, which the template ships', () => {
    const absent = plan.missingOptional.map((p) => p.name);
    expect(absent).not.toContain('expo-image');
    expect(absent).not.toContain('expo-symbols');
  });

  it('mentions the genuinely absent per-component peers, without demanding them', () => {
    expect(plan.missingOptional.map((p) => p.name).sort()).toEqual([
      '@react-native-community/slider',
      'sf-symbols-typescript',
    ]);
    expect(plan.installCommand).not.toContain('slider');
  });
});

describe('planPeers — other project shapes', () => {
  it('reports a bare project s missing required peers in one install line', () => {
    const plan = planPeers(new Set(['expo', 'react', 'react-native']), PEERS);
    expect(plan.missingRequired).toEqual([
      '@expo/ui',
      'react-native-reanimated',
      'react-native-safe-area-context',
    ]);
    expect(plan.installCommand).toBe(
      'npx expo install @expo/ui react-native-reanimated react-native-safe-area-context ' +
        '@expo/vector-icons expo-router',
    );
  });

  it('asks for nothing when everything is installed', () => {
    const everything = new Set(PEERS.map((p) => p.name));
    const plan = planPeers(everything, PEERS);
    expect(plan.installCommand).toBeNull();
    expect(plan.missingRequired).toEqual([]);
    expect(plan.missingRecommended).toEqual([]);
    expect(plan.missingOptional).toEqual([]);
  });

  it('counts a peer satisfied from devDependencies', () => {
    const names = installedDependencies({ devDependencies: { 'expo-router': '~56.2.8' } });
    expect(planPeers(names, PEERS).missingRecommended).toEqual(['@expo/vector-icons']);
  });

  it('explains what each absent optional peer unlocks', () => {
    const plan = planPeers(new Set(), PEERS);
    const byName = Object.fromEntries(plan.missingOptional.map((p) => [p.name, p.unlocks]));
    expect(byName['@react-native-community/slider']).toBe('Slider');
    expect(byName['expo-image']).toBe('ThemedImage');
  });
});

describe('planProvider', () => {
  const TEMPLATE_LAYOUT = [
    "import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';",
    'export default function TabLayout() {',
    '  return <ThemeProvider value={DefaultTheme}><AppTabs /></ThemeProvider>;',
    '}',
  ].join('\n');

  it('reports the untouched template as needing wiring', () => {
    expect(planProvider('src/app/_layout.tsx', TEMPLATE_LAYOUT)).toEqual({
      status: 'needs-wiring',
      layout: 'src/app/_layout.tsx',
    });
  });

  it('recognises a layout that already renders the provider', () => {
    const wired = `import { NativeCtxProvider } from '@nativectx/ui';\n${TEMPLATE_LAYOUT}`;
    expect(planProvider('app/_layout.tsx', wired).status).toBe('wired');
  });

  it('is not fooled by a longer identifier that merely contains the name', () => {
    // Neither of these renders the provider, so neither counts as wired.
    expect(planProvider('app/_layout.tsx', 'type NativeCtxProviderProps = {};').status).toBe('needs-wiring');
    expect(planProvider('app/_layout.tsx', 'import { MyNativeCtxProviderShim } from "./shim";').status).toBe(
      'needs-wiring',
    );
  });

  it('accepts the name wherever it legitimately appears', () => {
    // A whole-word match is the deliberate limit here: it cannot tell a real
    // <NativeCtxProvider> from one named in a comment. Erring toward "already
    // wired" only ever costs a printed snippet, never a broken edit.
    for (const source of [
      '<NativeCtxProvider brand={brand}>',
      "import { NativeCtxProvider } from '@nativectx/ui';",
      'export { NativeCtxProvider };',
    ]) {
      expect(planProvider('app/_layout.tsx', source).status).toBe('wired');
    }
  });

  it('reports no-layout when nothing was found', () => {
    expect(planProvider(null, null)).toEqual({ status: 'no-layout', layout: null });
  });
});
