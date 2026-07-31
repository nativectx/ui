/**
 * check-examples.ts — compile-verify every JSDoc `@example` block in the manifest.
 *
 * `build-manifest.ts` lifts `@example` blocks out of component sources into
 * `dist/mcp/component-manifest.json`. Those snippets are what an AI agent reads to
 * learn the API, but they live inside comments, so `tsc` never sees them: a renamed
 * prop or a dropped variant rots silently and the agent is taught to emit broken code.
 *
 * This script closes that hole. For every example it synthesises a throwaway `.tsx`
 * fixture that imports the real component from source (a relative import into
 * `components/`, never from `@nativectx/ui` — `dist/` may be stale mid-build), type
 * checks the fixtures with the compiler API, and maps each diagnostic back to the
 * component + example line that produced it.
 *
 *   pnpm exec tsx mcp/check-examples.ts [--manifest <path>] [--filter <Component>] [--keep] [--verbose]
 *
 * Exits non-zero if any example fails to compile.
 *
 * ---------------------------------------------------------------------------
 * The free-identifier problem
 * ---------------------------------------------------------------------------
 * Examples are fragments, not modules: `<Button onPress={save} />` never declares
 * `save`. A blanket preamble of permissive declarations would work, but it is
 * guesswork — too narrow and good examples fail, too wide and the check is useless.
 *
 * Instead this runs two compiler passes:
 *
 *   Pass 1 — compile the fixtures raw and collect only TS2304/TS2552 ("Cannot find
 *            name 'X'"). That is the compiler telling us precisely which identifiers
 *            are free, with real scope analysis rather than a regex.
 *   Pass 2 — re-emit each fixture with `declare const X: any;` for exactly those
 *            names, and report whatever is left.
 *
 * The precision this buys: "cannot find name" is the *only* error class that gets
 * silenced. A wrong prop name, a wrong variant string, a wrong prop type, or a
 * missing required prop surfaces as TS2322/TS2769/TS2741 — assignability errors, not
 * name-resolution errors — so none of them can be masked. That is the whole point of
 * the check and it stays intact.
 *
 * Two deliberate carve-outs keep recall from leaking:
 *   - Names used as JSX tags are never auto-declared. `<Buton />` is also "cannot find
 *     name", and silently stubbing it would let a typo'd or deleted component pass.
 *   - Imports are resolved explicitly and a module that resolves to untyped JS is a
 *     hard error, so an example can never pass vacuously because its types went
 *     missing.
 */

import ts from 'typescript';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { dirname, isAbsolute, join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const DEFAULT_MANIFEST = join(root, 'dist', 'mcp', 'component-manifest.json');
const FIXTURE_DIR = join(root, 'mcp', '.examples-check');

// ---------------------------------------------------------------------------
// Manifest contract (read defensively — the extractor evolves independently)
// ---------------------------------------------------------------------------

interface ManifestComponent {
  name?: string;
  file?: string;
  examples?: string[];
  [key: string]: unknown;
}

interface Manifest {
  components?: ManifestComponent[];
  [key: string]: unknown;
}

/**
 * Identifiers that resolve to a package rather than to the component barrel.
 *
 * Only consulted for names the manifest does not claim — a component named `Modal`
 * or `Switch` always wins over the react-native export of the same name, because the
 * example is documenting *our* component.
 */
const EXTERNAL_MODULES: Record<string, string> = {
  // react-native
  ActivityIndicator: 'react-native',
  Alert: 'react-native',
  Animated: 'react-native',
  Dimensions: 'react-native',
  FlatList: 'react-native',
  Image: 'react-native',
  KeyboardAvoidingView: 'react-native',
  Linking: 'react-native',
  Platform: 'react-native',
  Pressable: 'react-native',
  SafeAreaView: 'react-native',
  ScrollView: 'react-native',
  SectionList: 'react-native',
  StyleSheet: 'react-native',
  Text: 'react-native',
  TextInput: 'react-native',
  TouchableOpacity: 'react-native',
  View: 'react-native',
  // expo-router
  Link: 'expo-router',
  Redirect: 'expo-router',
  Slot: 'expo-router',
  Stack: 'expo-router',
  Tabs: 'expo-router',
  useLocalSearchParams: 'expo-router',
  useRouter: 'expo-router',
  // react (beyond the always-imported hooks below)
  Fragment: 'react',
  Suspense: 'react',
  createContext: 'react',
  memo: 'react',
};

/** Always available in every fixture, so examples can use hooks without ceremony. */
const REACT_HOOKS = [
  'useState',
  'useEffect',
  'useMemo',
  'useCallback',
  'useRef',
  'useReducer',
  'useContext',
  'useLayoutEffect',
];

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface Options {
  manifestPath: string;
  filter: string | null;
  keep: boolean;
  verbose: boolean;
}

function parseArgs(argv: string[]): Options {
  const opts: Options = {
    manifestPath: DEFAULT_MANIFEST,
    filter: null,
    keep: false,
    verbose: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--manifest') {
      const next = argv[++i];
      if (!next) fail('--manifest requires a path');
      opts.manifestPath = isAbsolute(next) ? next : resolve(process.cwd(), next);
    } else if (arg === '--filter') {
      const next = argv[++i];
      if (!next) fail('--filter requires a component name');
      opts.filter = next;
    } else if (arg === '--keep') {
      opts.keep = true;
    } else if (arg === '--verbose' || arg === '-v') {
      opts.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(
        'Usage: tsx mcp/check-examples.ts [--manifest <path>] [--filter <Component>] [--keep] [--verbose]',
      );
      process.exit(0);
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }
  return opts;
}

function fail(message: string): never {
  console.error(`check-examples: ${message}`);
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Example -> module wrapping
// ---------------------------------------------------------------------------

/**
 * A fixture is a list of lines plus, for each line, the 1-based line of the original
 * example it came from (or null for scaffolding). Diagnostics are reported against
 * the example, not against the generated file, so the reader never has to open it.
 */
interface FixtureSource {
  lines: string[];
  /** fixture line index (0-based) -> example line number (1-based), or null */
  lineMap: (number | null)[];
}

interface Example {
  component: string;
  /** Source file the component lives in, when the manifest supplies it. */
  file: string | null;
  index: number;
  text: string;
  fixturePath: string;
  fixtureName: string;
  /** Capitalised identifiers used in JSX tag position — never auto-declared. */
  jsxTags: Set<string>;
  imports: string[];
  /** Statement region and JSX region after wrapping, as line ranges of `textLines`. */
  wrap: WrapPlan;
  textLines: string[];
}

type WrapPlan =
  | { kind: 'split'; statementCount: number }
  | { kind: 'statements' }
  | { kind: 'fragment' }
  | { kind: 'unparseable' };

/**
 * Strip string/template literal contents so identifier scanning does not trip over
 * prose. Only used for scanning — never for the emitted fixture.
 */
function stripStringContents(text: string): string {
  return text
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
}

function collectJsxTags(text: string): Set<string> {
  const tags = new Set<string>();
  const re = /<\/?\s*([A-Z][A-Za-z0-9_$]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) tags.add(m[1]);
  return tags;
}

function collectIdentifiers(text: string): Set<string> {
  const ids = new Set<string>();
  const re = /[A-Za-z_$][A-Za-z0-9_$]*/g;
  const scannable = stripStringContents(text);
  let m: RegExpExecArray | null;
  while ((m = re.exec(scannable)) !== null) ids.add(m[0]);
  return ids;
}

/**
 * Find where the top-level JSX region begins: the first line that starts with `<`
 * while every bracket opened so far is closed. The depth guard is what keeps
 * `const el = (\n  <Foo />\n);` classified as a statement rather than as JSX.
 */
function findJsxStart(lines: string[]): number {
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (depth === 0 && trimmed.startsWith('<')) return i;
    const scannable = stripStringContents(raw.replace(/\/\/.*$/, ''));
    for (const ch of scannable) {
      if (ch === '(' || ch === '[' || ch === '{') depth++;
      else if (ch === ')' || ch === ']' || ch === '}') depth = Math.max(0, depth - 1);
    }
  }
  return -1;
}

function buildFixture(example: Example, declarations: string[]): FixtureSource {
  const lines: string[] = [];
  const lineMap: (number | null)[] = [];

  const push = (text: string, exampleLine: number | null = null) => {
    lines.push(text);
    lineMap.push(exampleLine);
  };

  push(`// AUTO-GENERATED by mcp/check-examples.ts — do not edit, do not commit.`);
  push(`// ${example.component} example #${example.index + 1}${example.file ? ` (${example.file})` : ''}`);
  push(`import React, { ${REACT_HOOKS.join(', ')} } from 'react';`);
  for (const line of example.imports) push(line);
  if (declarations.length > 0) {
    push('');
    push('// Free identifiers the example never declares (see header comment).');
    for (const name of declarations) push(`declare const ${name}: any;`);
  }
  push('');
  push(`export function ${example.fixtureName.replace(/[^A-Za-z0-9_$]/g, '_')}Example() {`);

  const body = example.textLines;
  const emitBody = (from: number, to: number) => {
    for (let i = from; i < to; i++) push(`  ${body[i]}`, i + 1);
  };

  switch (example.wrap.kind) {
    case 'split': {
      const n = example.wrap.statementCount;
      emitBody(0, n);
      push('  return (');
      push('    <>');
      for (let i = n; i < body.length; i++) push(`      ${body[i]}`, i + 1);
      push('    </>');
      push('  );');
      break;
    }
    case 'fragment': {
      push('  return (');
      push('    <>');
      emitBody(0, body.length);
      push('    </>');
      push('  );');
      break;
    }
    case 'statements':
    case 'unparseable': {
      emitBody(0, body.length);
      push('  return null;');
      break;
    }
  }

  push('}');
  push('');
  return { lines, lineMap };
}

/** Syntax-only check of a candidate fixture, so wrapping bugs never look like API drift. */
function parsesCleanly(text: string): boolean {
  const sf = ts.createSourceFile('probe.tsx', text, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
  const diags = (sf as unknown as { parseDiagnostics?: unknown[] }).parseDiagnostics;
  return !diags || diags.length === 0;
}

/** Pick the first wrapping strategy that produces a syntactically valid module. */
function planWrap(example: Example): WrapPlan {
  const jsxStart = findJsxStart(example.textLines);
  const candidates: WrapPlan[] = [];
  if (jsxStart >= 0) candidates.push({ kind: 'split', statementCount: jsxStart });
  candidates.push({ kind: 'statements' });
  candidates.push({ kind: 'fragment' });

  for (const candidate of candidates) {
    const probe = buildFixture({ ...example, wrap: candidate }, []);
    if (parsesCleanly(probe.lines.join('\n'))) return candidate;
  }
  return { kind: 'unparseable' };
}

/**
 * What an example is allowed to reference, and where each name comes from.
 *
 * Derived from the real barrels rather than hardcoded, so it never drifts: examples
 * routinely reach past the component itself for a provider tree
 * (`<NativeCtxProvider>`) or a hook (`useTheme`), and those live in `theme/`,
 * `hooks/` and `context/`, not in `components/`.
 */
interface Scope {
  /** Exports of `components/index.ts` — the component under test and its siblings. */
  components: Map<string, string>;
  /** Exports of `index.ts` that the components barrel does not already provide. */
  rootOnly: Map<string, string>;
}

function buildImports(referenced: Set<string>, jsxTags: Set<string>, scope: Scope): string[] {
  const wanted = new Set<string>([...referenced, ...jsxTags]);
  const byModule = new Map<string, string[]>();

  const add = (mod: string, name: string) => {
    const list = byModule.get(mod) ?? [];
    list.push(name);
    byModule.set(mod, list);
  };

  for (const name of [...wanted].sort()) {
    if (name === 'React' || REACT_HOOKS.includes(name)) continue;

    // Package source first — a component named `Modal` or `Switch` must win over the
    // react-native export of the same name.
    const fromComponents = scope.components.get(name);
    if (fromComponents) {
      add(fromComponents, name);
      continue;
    }
    const fromRoot = scope.rootOnly.get(name);
    if (fromRoot) {
      add(fromRoot, name);
      continue;
    }
    const external = EXTERNAL_MODULES[name];
    if (external) add(external, name);
    // Anything left is either a free identifier (stubbed after pass 1) or an unknown
    // JSX tag (left undeclared on purpose, so it fails as "Cannot find name").
  }

  return [...byModule]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mod, names]) => `import { ${[...new Set(names)].sort().join(', ')} } from '${mod}';`);
}

/**
 * Ask the compiler what each barrel actually exports. Cheap (one extra program over
 * two files, sharing the lib cache) and self-maintaining — a component added to or
 * dropped from the barrel is picked up with no edit here.
 */
function resolveScope(
  options: ts.CompilerOptions,
  cache: Map<string, ts.SourceFile | undefined>,
  componentsSpecifier: string,
  rootSpecifier: string,
): Scope {
  const componentsBarrel = join(root, 'components', 'index.ts');
  const rootBarrel = join(root, 'index.ts');

  const host = createCachingHost(options, new Set(), cache);
  const program = ts.createProgram([componentsBarrel, rootBarrel], options, host);
  const checker = program.getTypeChecker();

  const exportsOf = (file: string): string[] => {
    const sf = program.getSourceFile(file);
    if (!sf) return [];
    const symbol = checker.getSymbolAtLocation(sf);
    if (!symbol) return [];
    return checker.getExportsOfModule(symbol).map(s => s.getName());
  };

  const components = new Map<string, string>();
  for (const name of exportsOf(componentsBarrel)) components.set(name, componentsSpecifier);

  const rootOnly = new Map<string, string>();
  for (const name of exportsOf(rootBarrel)) {
    if (!components.has(name)) rootOnly.set(name, rootSpecifier);
  }

  return { components, rootOnly };
}

// ---------------------------------------------------------------------------
// Compilation
// ---------------------------------------------------------------------------

function loadCompilerOptions(): ts.CompilerOptions {
  const configPath = join(root, 'tsconfig.json');
  const read = ts.readConfigFile(configPath, ts.sys.readFile);
  if (read.error) {
    fail(ts.flattenDiagnosticMessageText(read.error.messageText, '\n'));
  }
  const parsed = ts.parseJsonConfigFileContent(read.config, ts.sys, root, undefined, configPath);
  const options: ts.CompilerOptions = { ...parsed.options };

  // The fixtures are checked, never emitted.
  options.noEmit = true;
  options.declaration = false;
  options.declarationMap = false;
  options.sourceMap = false;
  options.composite = false;
  options.incremental = false;
  delete options.outDir;
  delete options.tsBuildInfoFile;

  // Scaffolding may legitimately import more than an example uses.
  options.noUnusedLocals = false;
  options.noUnusedParameters = false;

  // Free identifiers are stubbed as `any`, so callbacks passed to them
  // (`setOn(v => !v)`) have no contextual type. Relaxing noImplicitAny is what makes
  // that legal. It does NOT weaken the checks this script exists for: wrong prop
  // names, wrong variant values and wrong prop types are assignability errors and
  // are still reported in full. It does suppress TS7016 for untyped imports, which
  // is why module resolution is verified separately (see verifyImportsAreTyped).
  options.noImplicitAny = false;

  // `jsx: react-native` (the package default) type checks JSX under the classic
  // runtime, which is why every fixture imports React explicitly.
  if (options.jsx === undefined) options.jsx = ts.JsxEmit.ReactNative;

  return options;
}

/** Shared across both passes: parsing react-native's .d.ts twice is the slow part. */
function createCachingHost(
  options: ts.CompilerOptions,
  fixturePaths: Set<string>,
  cache: Map<string, ts.SourceFile | undefined>,
): ts.CompilerHost {
  const host = ts.createCompilerHost(options, true);
  const original = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreate) => {
    if (fixturePaths.has(resolve(fileName))) {
      return original(fileName, languageVersion, onError, shouldCreate);
    }
    if (!cache.has(fileName)) {
      cache.set(fileName, original(fileName, languageVersion, onError, shouldCreate));
    }
    return cache.get(fileName);
  };
  return host;
}

interface RawDiagnostic {
  fixturePath: string;
  code: number;
  category: ts.DiagnosticCategory;
  message: string;
  line: number | null;
  character: number | null;
}

function compile(
  fixturePaths: string[],
  options: ts.CompilerOptions,
  cache: Map<string, ts.SourceFile | undefined>,
): { diagnostics: RawDiagnostic[]; program: ts.Program; host: ts.CompilerHost } {
  const pathSet = new Set(fixturePaths.map(p => resolve(p)));
  const host = createCachingHost(options, pathSet, cache);
  const program = ts.createProgram(fixturePaths, options, host);

  const diagnostics: RawDiagnostic[] = [];
  const record = (d: ts.Diagnostic, fixturePath: string) => {
    let line: number | null = null;
    let character: number | null = null;
    if (d.file && typeof d.start === 'number') {
      const pos = d.file.getLineAndCharacterOfPosition(d.start);
      line = pos.line;
      character = pos.character;
    }
    diagnostics.push({
      fixturePath,
      code: d.code,
      category: d.category,
      message: ts.flattenDiagnosticMessageText(d.messageText, '\n  '),
      line,
      character,
    });
  };

  // Only the fixtures' own diagnostics — component sources are `tsc`'s job, not ours.
  for (const fixturePath of fixturePaths) {
    const sf = program.getSourceFile(fixturePath);
    if (!sf) {
      diagnostics.push({
        fixturePath,
        code: 0,
        category: ts.DiagnosticCategory.Error,
        message: `Fixture was not included in the program: ${fixturePath}`,
        line: null,
        character: null,
      });
      continue;
    }
    for (const d of program.getSyntacticDiagnostics(sf)) record(d, fixturePath);
    for (const d of program.getSemanticDiagnostics(sf)) record(d, fixturePath);
  }

  return { diagnostics, program, host };
}

/**
 * With noImplicitAny relaxed, an import that resolves to untyped JS silently becomes
 * `any` and the example would pass without checking anything. Verify each specifier
 * lands on real type information.
 */
function verifyImportsAreTyped(
  examples: Example[],
  options: ts.CompilerOptions,
  host: ts.CompilerHost,
): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  const typedExtensions = new Set<string>([ts.Extension.Ts, ts.Extension.Tsx, ts.Extension.Dts]);

  for (const example of examples) {
    const specifiers = example.imports
      .map(line => /from '([^']+)'/.exec(line)?.[1])
      .filter((s): s is string => Boolean(s));
    for (const spec of ['react', ...specifiers]) {
      const key = `${spec}\u0000${example.fixturePath}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const resolved = ts.resolveModuleName(spec, example.fixturePath, options, host);
      const mod = resolved.resolvedModule;
      if (!mod) {
        problems.push(`cannot resolve module '${spec}' (imported by ${example.component})`);
      } else if (!typedExtensions.has(mod.extension)) {
        problems.push(
          `module '${spec}' resolves to untyped ${mod.extension} (${mod.resolvedFileName}) — ` +
            `examples importing it cannot be verified`,
        );
      }
    }
  }
  return [...new Set(problems)];
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

const CANNOT_FIND_NAME_CODES = new Set([
  2304, // Cannot find name 'X'.
  2552, // Cannot find name 'X'. Did you mean 'Y'?
]);

function extractMissingName(message: string): string | null {
  return /^Cannot find name '([^']+)'/.exec(message)?.[1] ?? null;
}

/** Prefer a repo-relative path, but never print a wall of `../` for an outside path. */
function displayPath(target: string): string {
  const rel = relative(root, target);
  return rel.startsWith('..') ? target : rel;
}

function indentExample(text: string, marker: number | null): string {
  return text
    .split('\n')
    .map((line, i) => {
      const n = i + 1;
      const gutter = marker === n ? '>' : ' ';
      return `    ${gutter} ${String(n).padStart(2, ' ')} | ${line}`;
    })
    .join('\n');
}

function main(): void {
  const opts = parseArgs(process.argv.slice(2));

  if (!existsSync(opts.manifestPath)) {
    fail(
      `manifest not found at ${opts.manifestPath}\n` +
        `  Build it first: pnpm run build:manifest`,
    );
  }

  let manifest: Manifest;
  try {
    manifest = JSON.parse(readFileSync(opts.manifestPath, 'utf8')) as Manifest;
  } catch (error) {
    return fail(`could not parse manifest: ${(error as Error).message}`);
  }

  const components = Array.isArray(manifest.components) ? manifest.components : [];
  if (components.length === 0) {
    fail(`manifest at ${opts.manifestPath} has no components[]`);
  }

  const toSpecifier = (target: string) =>
    relative(FIXTURE_DIR, target).split('\\').join('/');
  const componentsSpecifier = toSpecifier(join(root, 'components'));
  const rootSpecifier = toSpecifier(root);

  const options = loadCompilerOptions();
  const cache = new Map<string, ts.SourceFile | undefined>();

  if (opts.verbose) console.log('check-examples: resolving barrel exports');
  const scope = resolveScope(options, cache, componentsSpecifier, rootSpecifier);
  if (scope.components.size === 0) {
    fail(`could not read any exports from components/index.ts — is the package source intact?`);
  }

  const missingFromBarrel = components
    .map(c => c.name)
    .filter((n): n is string => typeof n === 'string')
    .filter(n => !scope.components.has(n) && !scope.rootOnly.has(n));

  // ----- Collect examples -------------------------------------------------
  const examples: Example[] = [];
  let componentsWithExamples = 0;

  for (const component of components) {
    const name = typeof component.name === 'string' ? component.name : null;
    if (!name) continue;
    if (opts.filter && name !== opts.filter) continue;

    const list = Array.isArray(component.examples) ? component.examples : [];
    const usable = list.filter((e): e is string => typeof e === 'string' && e.trim().length > 0);
    if (usable.length > 0) componentsWithExamples++;

    usable.forEach((text, index) => {
      const normalised = text.replace(/\r\n/g, '\n').replace(/\s+$/, '');
      const fixtureName = `${name.replace(/[^A-Za-z0-9_$]/g, '_')}_${index + 1}`;
      const jsxTags = collectJsxTags(normalised);
      const example: Example = {
        component: name,
        file: typeof component.file === 'string' ? component.file : null,
        index,
        text: normalised,
        fixtureName,
        fixturePath: join(FIXTURE_DIR, `${fixtureName}.tsx`),
        jsxTags,
        imports: buildImports(collectIdentifiers(normalised), jsxTags, scope),
        textLines: normalised.split('\n'),
        wrap: { kind: 'statements' },
      };
      example.wrap = planWrap(example);
      examples.push(example);
    });
  }

  if (examples.length === 0) {
    const suffix = opts.filter ? ` matching --filter ${opts.filter}` : '';
    console.log(`check-examples: no examples${suffix} found in ${displayPath(opts.manifestPath)}`);
    process.exit(0);
  }

  // ----- Emit pass 1 ------------------------------------------------------
  rmSync(FIXTURE_DIR, { recursive: true, force: true });
  mkdirSync(FIXTURE_DIR, { recursive: true });
  writeFileSync(
    join(FIXTURE_DIR, '.gitignore'),
    '# Generated by mcp/check-examples.ts\n*\n',
    'utf8',
  );

  const byPath = new Map<string, Example>();
  const sources = new Map<string, FixtureSource>();
  for (const example of examples) {
    byPath.set(resolve(example.fixturePath), example);
    const source = buildFixture(example, []);
    sources.set(example.fixturePath, source);
    writeFileSync(example.fixturePath, source.lines.join('\n'), 'utf8');
  }

  const fixturePaths = examples.map(e => e.fixturePath);

  if (opts.verbose) console.log('check-examples: pass 1 — discovering free identifiers');
  const pass1 = compile(fixturePaths, options, cache);

  // ----- Decide what to stub ---------------------------------------------
  const stubs = new Map<string, Set<string>>();
  for (const diag of pass1.diagnostics) {
    if (!CANNOT_FIND_NAME_CODES.has(diag.code)) continue;
    const name = extractMissingName(diag.message);
    if (!name) continue;
    const example = byPath.get(resolve(diag.fixturePath));
    if (!example) continue;
    // Never stub a JSX tag: an unknown component must stay an error.
    if (example.jsxTags.has(name)) continue;
    const set = stubs.get(example.fixturePath) ?? new Set<string>();
    set.add(name);
    stubs.set(example.fixturePath, set);
  }

  // ----- Emit pass 2 ------------------------------------------------------
  for (const example of examples) {
    const declarations = [...(stubs.get(example.fixturePath) ?? [])].sort();
    const source = buildFixture(example, declarations);
    sources.set(example.fixturePath, source);
    writeFileSync(example.fixturePath, source.lines.join('\n'), 'utf8');
  }

  if (opts.verbose) console.log('check-examples: pass 2 — type checking');
  const pass2 = compile(fixturePaths, options, cache);

  // ----- Report -----------------------------------------------------------
  const failures = new Map<string, RawDiagnostic[]>();
  for (const diag of pass2.diagnostics) {
    if (diag.category !== ts.DiagnosticCategory.Error) continue;
    const list = failures.get(diag.fixturePath) ?? [];
    list.push(diag);
    failures.set(diag.fixturePath, list);
  }

  for (const example of examples) {
    if (example.wrap.kind !== 'unparseable') continue;
    const list = failures.get(example.fixturePath) ?? [];
    list.unshift({
      fixturePath: example.fixturePath,
      code: 0,
      category: ts.DiagnosticCategory.Error,
      message:
        'Example could not be wrapped into a valid module. It is probably not a ' +
        'self-contained snippet (unbalanced brackets, or prose mixed into the code).',
      line: null,
      character: null,
    });
    failures.set(example.fixturePath, list);
  }

  const warnings: string[] = [];

  // A spread of a stubbed identifier makes every prop on that element unverifiable.
  for (const example of examples) {
    const declared = stubs.get(example.fixturePath);
    if (!declared || declared.size === 0) continue;
    const spreads = [...example.text.matchAll(/\{\s*\.\.\.\s*([A-Za-z_$][A-Za-z0-9_$]*)/g)];
    for (const [, name] of spreads) {
      if (declared.has(name)) {
        warnings.push(
          `${example.component} example #${example.index + 1} spreads the undeclared identifier ` +
            `\`${name}\` — props on that element are NOT verified.`,
        );
      }
    }
  }

  warnings.push(...verifyImportsAreTyped(examples, options, pass2.host));

  // Not fatal on its own — a component can be documented before it is re-exported —
  // but any example it owns will fail with "Cannot find name", so name the cause.
  if (missingFromBarrel.length > 0) {
    warnings.push(
      `manifest lists ${missingFromBarrel.length} component(s) that neither barrel exports: ` +
        `${missingFromBarrel.join(', ')}. Their examples cannot resolve the component.`,
    );
  }

  const optionErrors = pass2.program
    .getOptionsDiagnostics()
    .concat(pass2.program.getGlobalDiagnostics())
    .filter(d => d.category === ts.DiagnosticCategory.Error);

  const failingExamples = examples.filter(e => (failures.get(e.fixturePath) ?? []).length > 0);

  console.log('');
  console.log(
    `check-examples: ${examples.length} example${examples.length === 1 ? '' : 's'} across ` +
      `${componentsWithExamples} component${componentsWithExamples === 1 ? '' : 's'} ` +
      `(manifest: ${displayPath(opts.manifestPath)})`,
  );

  if (optionErrors.length > 0) {
    console.log('');
    console.log('Compiler configuration errors:');
    for (const d of optionErrors) {
      console.log(`  TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
    }
  }

  if (failingExamples.length > 0) {
    console.log('');
    for (const example of failingExamples) {
      const diags = failures.get(example.fixturePath) ?? [];
      const source = sources.get(example.fixturePath)!;
      const location = example.file ?? '(file unknown)';
      console.log(`  FAIL  ${example.component} — example #${example.index + 1}`);
      console.log(`        ${location}`);

      const firstExampleLine =
        diags.map(d => (d.line === null ? null : source.lineMap[d.line])).find(n => n != null) ??
        null;

      console.log('');
      console.log(indentExample(example.text, firstExampleLine ?? null));
      console.log('');
      for (const diag of diags) {
        const exampleLine = diag.line === null ? null : source.lineMap[diag.line];
        const where =
          exampleLine != null
            ? `example line ${exampleLine}, col ${(diag.character ?? 0) + 1}`
            : diag.line !== null
              ? `generated fixture line ${diag.line + 1} (scaffolding)`
              : 'no location';
        const code = diag.code ? `TS${diag.code}` : 'error';
        const message = diag.message.split('\n').join('\n        ');
        console.log(`      ${code} at ${where}:`);
        console.log(`        ${message}`);
      }
      console.log('');
      console.log(`        fixture: ${displayPath(example.fixturePath)}`);
      console.log('');
    }
  }

  if (warnings.length > 0) {
    console.log('');
    console.log('Warnings (not failures):');
    for (const warning of warnings) console.log(`  ! ${warning}`);
  }

  if (opts.verbose) {
    console.log('');
    console.log('Stubbed free identifiers per example:');
    for (const example of examples) {
      const declared = [...(stubs.get(example.fixturePath) ?? [])].sort();
      console.log(
        `  ${example.component} #${example.index + 1}: ` +
          (declared.length > 0 ? declared.join(', ') : '(none)'),
      );
    }
  }

  const failed = failingExamples.length > 0 || optionErrors.length > 0;

  console.log('');
  if (failed) {
    console.log(
      `check-examples: FAILED — ${failingExamples.length} of ${examples.length} examples do not compile.`,
    );
    console.log(
      `  Fix the @example block in the component source, then re-run \`pnpm run build:manifest\`.`,
    );
  } else {
    console.log(`check-examples: OK — all ${examples.length} examples compile.`);
  }

  if (!opts.keep && !failed) {
    rmSync(FIXTURE_DIR, { recursive: true, force: true });
  } else if (failed) {
    console.log(`  Generated fixtures kept at ${displayPath(FIXTURE_DIR)}/ for inspection.`);
  }

  process.exit(failed ? 1 : 0);
}

main();
