/**
 * Builds `dist/mcp/component-manifest.json`, the only thing the MCP component
 * tools ever serve.
 *
 * Every field is derived from the package's own source. The component list
 * comes from the barrel, category and description from each component's own doc
 * block, the file set and platform support from what is actually on disk beside
 * the entry file, and dependencies from what those files import. Nothing here is
 * a hand-maintained list of components, because a second place to edit is a
 * place to forget: the manifest used to carry a `COMPONENT_META` record and a
 * parallel `componentFiles` path list, and adding a component meant editing
 * both or shipping it invisible to `get_component`.
 *
 * The checks in `assertManifestComplete` are the backstop for all of it —
 * derivation that silently returns nothing is worse than no derivation, so
 * every step that can come up empty has a guard that fails the build instead.
 */
import {
  ExportDeclaration,
  ImportDeclaration,
  InterfaceDeclaration,
  JSDoc,
  Node,
  Project,
  PropertySignature,
  SourceFile,
  SyntaxKind,
} from 'ts-morph';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

/**
 * The category vocabulary a component may put in its `@category` tag.
 *
 * This is a vocabulary, not a registry: it lists the sections the docs are
 * organised into, and it does not grow when a component is added. Keeping it
 * closed is what stops `@category control` or `@category Controls` from
 * silently opening a third bucket that `list_components` then renders as its
 * own heading.
 */
const CATEGORIES = ['layout', 'display', 'controls', 'input', 'feedback', 'collections', 'navigation'] as const;

/**
 * Platforms the manifest reports support for, and the file suffixes that can
 * provide it, most specific first.
 *
 * This mirrors bundler resolution rather than describing it: Metro prefers
 * `.ios.tsx` then `.native.tsx`, the web bundler prefers `.web.tsx`, and the
 * suffix-less file is the last resort for all three. A component with only a
 * base file therefore supports everything, and one whose base file is missing
 * supports exactly the platforms its variants cover.
 */
const PLATFORM_RESOLUTION = {
  ios: ['ios', 'native'],
  android: ['android', 'native'],
  web: ['web'],
} as const;

type Platform = keyof typeof PLATFORM_RESOLUTION;
const PLATFORMS = Object.keys(PLATFORM_RESOLUTION) as Platform[];

/**
 * Every platform suffix, in the order variants are listed in `files`.
 *
 * Kept separate from `PLATFORM_RESOLUTION` because `.native.tsx` is a real file
 * suffix but not a platform anyone ships to — it is shorthand for "ios and
 * android", which is why it appears in two resolution lists and none of its own.
 */
const PLATFORM_SUFFIXES = ['ios', 'android', 'web', 'native'] as const;
type PlatformSuffix = (typeof PLATFORM_SUFFIXES)[number];

const PLATFORM_SUFFIX_RE = new RegExp(`\\.(${PLATFORM_SUFFIXES.join('|')})\\.tsx$`);

/**
 * Packages that are never worth reporting as a dependency.
 *
 * React and React Native are the substrate every component sits on — a consumer
 * of a React Native component library has them, so listing them as something to
 * install is noise in every single entry. `react-native-web` is the same fact
 * on the web side, pulled in by the bundler rather than by the component.
 */
const IGNORED_PACKAGES = new Set(['react', 'react-dom', 'react-native', 'react-native-web']);

/**
 * Components that genuinely accept no props.
 *
 * An entry here opts the component out of the zero-props build check in
 * `assertManifestComplete`. Only add a component when it really takes nothing —
 * never to silence an extractor that failed to find an existing props type.
 */
const PROPLESS_COMPONENTS: string[] = [];

interface PropEntry {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default: string | null;
  platform: string | null;
}

interface ComponentEntry {
  name: string;
  file: string;
  files: string[];
  category: string;
  description: string;
  platforms: string[];
  dependencies: string[];
  variants: string[];
  props: PropEntry[];
  examples: string[];
}

function extractJsDocText(jsDoc: JSDoc): string {
  return jsDoc.getDescription().trim();
}

function extractTag(jsDoc: JSDoc, tagName: string): string | null {
  const tag = jsDoc.getTags().find(t => t.getTagName() === tagName);
  return tag ? tag.getCommentText()?.trim() ?? null : null;
}

function extractExamples(jsDocs: JSDoc[]): string[] {
  const examples: string[] = [];
  for (const jsDoc of jsDocs) {
    for (const tag of jsDoc.getTags()) {
      if (tag.getTagName() === 'example') {
        const text = tag.getCommentText()?.trim();
        if (text) examples.push(text.replace(/^```tsx?\n?/, '').replace(/\n?```$/, '').trim());
      }
    }
  }
  return examples;
}

/**
 * The summary at the top of a doc block: everything up to the first blank line,
 * flattened onto one line.
 *
 * Taking only the first paragraph is what lets a component carry the long
 * explanation a contributor wants — Material spec links, platform notes, the
 * reasoning behind a fallback — without that prose leaking into the manifest.
 * There the description is a search haystack and a one-line preview in
 * `list_components`, so it has to stay a sentence.
 */
function summarize(text: string): string {
  const [firstParagraph = ''] = text.split(/\n\s*\n/);
  return firstParagraph
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join(' ');
}

function resolveTypeText(prop: { getTypeNode: () => Node | undefined; getType: () => { getText: () => string } }): string {
  const node = prop.getTypeNode();
  if (node) return node.getText();
  return prop.getType().getText();
}

/**
 * Locate the `<Component>Props` interface for a component.
 *
 * A direct lookup in the entry file is not enough: platform entry files are
 * often nothing but a re-export (sidebar.tsx is just
 * `export { Sidebar, type SidebarProps } from './sidebar.web'`), so the props
 * interface is declared in a sibling file. Falling back to the resolved export
 * map follows the re-export chain to the real declaration.
 *
 * Heritage is expanded, but only across first-party types — see
 * `collectPropSignatures`.
 */
function findPropsInterface(sourceFile: SourceFile, componentName: string): InterfaceDeclaration | undefined {
  const name = `${componentName}Props`;

  const local = sourceFile.getInterface(name);
  if (local) return local;

  for (const decl of sourceFile.getExportedDeclarations().get(name) ?? []) {
    if (Node.isInterfaceDeclaration(decl)) return decl;
  }

  return undefined;
}

/**
 * Is this declaration authored in this package, as opposed to a dependency?
 *
 * This is the boundary that decides which inherited props reach the manifest
 * and which imports count as dependencies, and it is derived from where the
 * declaration actually lives rather than from a hand-maintained list of type or
 * package names — a name list is exactly the kind of thing that silently drifts
 * out of date.
 */
function isFirstParty(sourceFile: SourceFile): boolean {
  const path = sourceFile.getFilePath();
  return path.startsWith(`${root}/`) && !path.includes('/node_modules/');
}

/**
 * First-party interfaces reachable from an interface's `extends` clauses.
 *
 * Used only by the build-time guard, so it works off the syntax rather than the
 * resolved type: it answers "was this interface written to inherit from one of
 * ours?", which stays true even if the expansion below returns nothing.
 *
 * Descending into every identifier is what makes `Omit<InteractiveComponentProps,
 * 'onPress'>` resolve — `Omit` itself lands in lib.es5.d.ts and is skipped,
 * while the wrapped interface resolves normally. Type aliases are deliberately
 * not counted: `ThemedStackProps extends StackProps` names a local alias for an
 * expo-router type, which is external despite the alias being declared here.
 */
function firstPartyBaseInterfaces(iface: InterfaceDeclaration): InterfaceDeclaration[] {
  const bases: InterfaceDeclaration[] = [];

  for (const clause of iface.getExtends()) {
    for (const identifier of clause.getDescendantsOfKind(SyntaxKind.Identifier)) {
      const symbol = identifier.getSymbol();
      const target = symbol?.getAliasedSymbol() ?? symbol;
      for (const decl of target?.getDeclarations() ?? []) {
        if (Node.isInterfaceDeclaration(decl) && isFirstParty(decl.getSourceFile())) bases.push(decl);
      }
    }
  }

  return bases;
}

/**
 * Every prop signature that makes up a props interface: its own members first,
 * then the ones it inherits from other first-party types.
 *
 * The resolved type is used for the inherited half so the checker does the hard
 * parts for us — `Omit<...>` subtractions, multiple heritage clauses, and
 * transitive chains such as `InteractiveComponentProps extends
 * BaseComponentProps` all come out correct without special cases.
 *
 * Filtering the result by declaration site is what stops the expansion at the
 * package boundary. `ContainerProps extends ThemedViewProps extends ViewProps`
 * resolves to well over a hundred properties; the handful authored in
 * themed-view.tsx are the component's real API, and the ~100 React Native ones
 * behind them would bury it.
 */
function collectPropSignatures(iface: InterfaceDeclaration): PropertySignature[] {
  const own = iface.getProperties();
  // An own member always wins over the inherited one it narrows or redeclares
  const seen = new Set(own.map(p => p.getName()));

  const inherited: PropertySignature[] = [];
  for (const symbol of iface.getType().getProperties()) {
    if (seen.has(symbol.getName())) continue;
    const decl = symbol.getDeclarations().find(Node.isPropertySignature);
    if (!decl || !isFirstParty(decl.getSourceFile())) continue;
    seen.add(symbol.getName());
    inherited.push(decl);
  }

  return [...own, ...inherited];
}

function toPropEntries(signatures: PropertySignature[]): PropEntry[] {
  const props: PropEntry[] = [];

  for (const prop of signatures) {
    const jsDocs = prop.getJsDocs();
    const firstDoc = jsDocs[0];
    const description = firstDoc ? extractJsDocText(firstDoc) : '';
    const defaultVal = firstDoc ? extractTag(firstDoc, 'default') : null;
    const platform = firstDoc ? extractTag(firstDoc, 'platform') : null;
    const typeText = resolveTypeText(prop as Parameters<typeof resolveTypeText>[0]);

    // Skip internal/inherited RN props that bloat the output
    const skip = ['style', 'testID', 'accessibilityLabel', 'accessibilityHint', 'accessibilityRole'];
    if (skip.includes(prop.getName()) && !description) continue;

    props.push({
      name: prop.getName(),
      type: typeText.replace(/\s+/g, ' '),
      required: !prop.hasQuestionToken(),
      description,
      default: defaultVal,
      platform,
    });
  }

  return props;
}

// A call signature returning one of these is what makes an export renderable as
// JSX, and therefore a component rather than a constant or a helper.
const RENDERABLE_RETURN = /\b(ReactNode|ReactElement|JSX\.Element)\b/;

/** A component the package publishes, and the file its implementation lives in. */
interface ExportedComponent {
  name: string;
  /** Where the barrel's re-export chain actually lands. */
  declaration: SourceFile;
}

/**
 * Every component the package publicly exports, read off the components barrel.
 *
 * Derived rather than listed, for the same reason `isFirstParty` is: the barrel
 * is the package's own statement of what it publishes, so it cannot drift from
 * the thing it describes. `components/index.ts` is the right file to read
 * because the module layout already draws the line — providers live in
 * `context/`, icons in `icons/`, theming in `theme/`, and none of them are
 * components in the sense the manifest documents.
 *
 * "Component-shaped" is decided structurally, with no list of names: the export
 * must be a value whose type has a call signature returning something React can
 * render, and it must be capitalised, since JSX only treats capitalised
 * identifiers as components. Together those drop the `ButtonVariants`-style
 * constant arrays (values, but not callable) and any lowercase helper such as
 * `renderIcon` (callable, but never usable as an element).
 *
 * The declaration site comes back alongside the name because it is the anchor
 * for everything else the manifest needs: the doc block, the entry file, and
 * through that the platform variants beside it. Following the export map is
 * what makes the re-export case work — `Sidebar` is published by sidebar.tsx
 * but written in sidebar.web.tsx, and only the resolved declaration knows that.
 */
function exportedComponents(project: Project): ExportedComponent[] {
  const barrel = project.getSourceFileOrThrow(join(root, 'components/index.ts'));
  const found: ExportedComponent[] = [];

  for (const [name, declarations] of barrel.getExportedDeclarations()) {
    if (!/^[A-Z]/.test(name)) continue;

    const implementation = declarations.find(decl => {
      if (Node.isInterfaceDeclaration(decl) || Node.isTypeAliasDeclaration(decl)) return false;
      return decl
        .getType()
        .getCallSignatures()
        .some(sig => RENDERABLE_RETURN.test(sig.getReturnType().getText()));
    });

    if (implementation) found.push({ name, declaration: implementation.getSourceFile() });
  }

  return found;
}

/**
 * The doc block that documents a component, wherever the component is written.
 *
 * The three shapes below are the three ways a component is declared in this
 * package — `export function ThemedImage`, `const Button = forwardRef(...)`,
 * and (for completeness) a class. Only the variable statement carries the doc
 * comment in the arrow-function case, which is why the lookup goes through the
 * statement rather than the declaration.
 */
function componentJsDoc(sourceFile: SourceFile, name: string): JSDoc | undefined {
  const owners: Array<{ getJsDocs(): JSDoc[] } | undefined> = [
    sourceFile.getFunction(name),
    sourceFile.getClass(name),
    sourceFile.getVariableStatement(stmt => stmt.getDeclarations().some(d => d.getName() === name)),
  ];

  for (const owner of owners) {
    const docs = owner?.getJsDocs() ?? [];
    // The block adjacent to the declaration is the last one; anything above it
    // is a detached banner comment such as a `// ─── Component ───` divider.
    if (docs.length) return docs[docs.length - 1];
  }

  return undefined;
}

/** The files a component is made of, and what they imply about platform support. */
interface ComponentSources {
  /** The suffix-less entry file, repo-relative. Kept for back-compat. */
  file: string;
  /** Entry file plus every platform variant beside it, repo-relative. */
  files: string[];
  /** Platforms that resolve to one of `files`. */
  platforms: string[];
}

/**
 * What is actually on disk for a component, starting from wherever its
 * implementation was found.
 *
 * Platform support is read off the filesystem rather than declared, because a
 * declaration is a claim and the files are the fact. The previous manifest let
 * a component state `platforms: ['ios','android','web']` by hand, which meant
 * dropping a `switch.web.tsx` beside `switch.tsx` changed what the library does
 * and changed nothing about what it says.
 *
 * The search starts from the base name so it works from either end: `Switch`
 * resolves to switch.tsx and finds the two variants beside it, while `Sidebar`
 * resolves to sidebar.web.tsx, strips back to sidebar.tsx, and finds the same
 * set from there.
 */
function resolveSources(declarationPath: string): ComponentSources {
  const base = declarationPath.replace(PLATFORM_SUFFIX_RE, '.tsx');
  const hasBase = existsSync(base);

  const variants = new Set<PlatformSuffix>();
  const files: string[] = [];
  if (hasBase) files.push(base);
  for (const suffix of PLATFORM_SUFFIXES) {
    const variant = base.replace(/\.tsx$/, `.${suffix}.tsx`);
    if (!existsSync(variant)) continue;
    variants.add(suffix);
    files.push(variant);
  }

  // The base file answers for every platform no bundler-specific file claims,
  // so its presence alone is full support.
  const platforms = PLATFORMS.filter(
    platform => hasBase || PLATFORM_RESOLUTION[platform].some(suffix => variants.has(suffix)),
  );

  const relative = (path: string) => path.replace(`${root}/`, '');

  return {
    file: relative(hasBase ? base : files[0] ?? declarationPath),
    files: files.map(relative),
    platforms,
  };
}

/**
 * The package a module specifier belongs to, or null if it is not one worth
 * reporting.
 *
 * Subpaths are collapsed to the installable unit — `@expo/ui/swift-ui/modifiers`
 * and `expo-router/unstable-native-tabs` are things you get by installing
 * `@expo/ui` and `expo-router`, and telling someone to install the subpath would
 * be wrong.
 */
function packageOf(specifier: string): string | null {
  if (!specifier || specifier.startsWith('.') || specifier.startsWith('/')) return null;
  const segments = specifier.split('/');
  const name = specifier.startsWith('@') ? segments.slice(0, 2).join('/') : segments[0];
  return IGNORED_PACKAGES.has(name) ? null : name;
}

/**
 * Does this import land inside the package rather than on a dependency?
 *
 * Answered by resolution, not by whether the specifier starts with a dot, so it
 * stays correct if a path alias is ever introduced. It is the same boundary
 * `collectPropSignatures` draws for heritage, via the same helper.
 */
function resolvesFirstParty(decl: ImportDeclaration | ExportDeclaration): boolean {
  const target = decl.getModuleSpecifierSourceFile();
  return !!target && isFirstParty(target);
}

/**
 * Is nothing in this import statement present at runtime?
 *
 * Both spellings have to be caught: `import type { X } from 'y'` marks the whole
 * statement, while `import { type X } from 'y'` marks each binding. A bare
 * `import 'y'` has no bindings at all and is a side-effect import, which is very
 * much a runtime dependency.
 */
function isTypeOnlyImport(decl: ImportDeclaration): boolean {
  if (decl.isTypeOnly()) return true;
  if (decl.getDefaultImport() || decl.getNamespaceImport()) return false;
  const named = decl.getNamedImports();
  return named.length > 0 && named.every(specifier => specifier.isTypeOnly());
}

/** External packages a component's files reach for, split by whether they survive compilation. */
interface DependencyReport {
  /** Packages the component needs installed to run. This is what the manifest ships. */
  runtime: string[];
  /** Packages referenced only from type positions, so erased from the JS output. */
  typeOnly: string[];
}

/**
 * Every external package a component's files import.
 *
 * Runtime and type-only imports are kept apart because they answer different
 * questions. The manifest's `dependencies` exists so an agent can say "run
 * `npx expo install @expo/ui` before using this", and a type-only import is
 * erased by the compiler — nothing has to be installed for the component to
 * run, so listing it would be wrong install advice. Type-only externals are
 * still collected, because they are referenced from the emitted `.d.ts` and so
 * still belong in package.json; the packaging check reports on them separately.
 *
 * `require()` is read alongside the import statements because two components
 * deliberately use it: slider.tsx guards an optional peer dependency in a
 * try/catch, and app-tabs.tsx defers `expo-router/unstable-native-tabs` past
 * barrel-init time. Both are real dependencies, and an import-only sweep would
 * have reported AppTabs as depending on nothing at all.
 */
function collectDependencies(project: Project, files: string[]): DependencyReport {
  const runtime = new Set<string>();
  const typeOnly = new Set<string>();

  for (const relativePath of files) {
    const sourceFile = project.getSourceFile(join(root, relativePath));
    if (!sourceFile) continue;

    for (const decl of sourceFile.getImportDeclarations()) {
      if (resolvesFirstParty(decl)) continue;
      const pkg = packageOf(decl.getModuleSpecifierValue());
      if (pkg) (isTypeOnlyImport(decl) ? typeOnly : runtime).add(pkg);
    }

    // `export { X } from 'pkg'` re-exports the package's own binding, which is
    // as much a dependency as importing it.
    for (const decl of sourceFile.getExportDeclarations()) {
      if (resolvesFirstParty(decl)) continue;
      const pkg = packageOf(decl.getModuleSpecifierValue() ?? '');
      if (pkg) (decl.isTypeOnly() ? typeOnly : runtime).add(pkg);
    }

    for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
      if (call.getExpression().getText() !== 'require') continue;
      const [arg] = call.getArguments();
      if (!arg || !Node.isStringLiteral(arg)) continue;
      const pkg = packageOf(arg.getLiteralValue());
      if (pkg) runtime.add(pkg);
    }
  }

  // A package imported for both a value and a type is simply a runtime dependency
  for (const pkg of runtime) typeOnly.delete(pkg);

  return { runtime: [...runtime].sort(), typeOnly: [...typeOnly].sort() };
}

/** What `ui/package.json` promises consumers about the packages it uses. */
interface DeclaredPackaging {
  /** Shipped or required of the host app — either one satisfies an import. */
  installed: Set<string>;
  /** Present in this repo only, and absent from a consumer's install. */
  devOnly: Set<string>;
}

function declaredPackaging(): DeclaredPackaging {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8')) as Record<string, Record<string, string>>;
  return {
    installed: new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})]),
    devOnly: new Set(Object.keys(pkg.devDependencies ?? {})),
  };
}

/**
 * What the extractor saw while resolving a component's heritage. Not part of
 * the manifest — it only feeds the build-time guard.
 */
interface HeritageReport {
  /** Names of first-party interfaces this component's props interface extends */
  firstPartyBases: string[];
  /** How many props the heritage expansion contributed */
  inheritedCount: number;
}

interface ProcessedComponent {
  entry: ComponentEntry;
  heritage: HeritageReport;
  /** Externals reached only from type positions — see `collectDependencies`. */
  typeOnlyDependencies: string[];
}

/** An exported component the extractor could not turn into a manifest entry. */
interface SkippedComponent {
  name: string;
  file: string;
  reason: string;
}

function processComponent(project: Project, component: ExportedComponent): ProcessedComponent | SkippedComponent {
  const { name, declaration } = component;
  const sources = resolveSources(declaration.getFilePath());
  const where = sources.file;

  // The doc block is looked for at the declaration first and then across the
  // component's other files, because a pure re-export entry file has nowhere to
  // put one: sidebar.tsx is a single `export ... from './sidebar.web'` line.
  const docCandidates = [declaration, ...sources.files.map(f => project.getSourceFile(join(root, f)))];
  let doc: JSDoc | undefined;
  for (const candidate of docCandidates) {
    const found = candidate ? componentJsDoc(candidate, name) : undefined;
    if (found && extractTag(found, 'category')) {
      doc = found;
      break;
    }
    doc ??= found;
  }

  if (!doc) {
    return { name, file: where, reason: 'no doc comment on its declaration' };
  }

  const category = extractTag(doc, 'category');
  if (!category) {
    return { name, file: where, reason: 'doc comment has no @category tag' };
  }
  if (!(CATEGORIES as readonly string[]).includes(category)) {
    return { name, file: where, reason: `@category ${category} is not one of: ${CATEGORIES.join(', ')}` };
  }

  const description = summarize(extractJsDocText(doc));
  if (!description) {
    return { name, file: where, reason: 'doc comment has tags but no description text' };
  }

  const entryFile = project.getSourceFile(join(root, sources.file)) ?? declaration;

  // Find the main *Props interface (may live in a re-exported platform file)
  const propsDecl = findPropsInterface(entryFile, name);
  const signatures = propsDecl ? collectPropSignatures(propsDecl) : [];
  const props = toPropEntries(signatures);

  const heritage: HeritageReport = {
    firstPartyBases: propsDecl ? firstPartyBaseInterfaces(propsDecl).map(b => b.getName()) : [],
    inheritedCount: propsDecl ? signatures.length - propsDecl.getProperties().length : 0,
  };

  // Variants live next to the props declaration, which is not always the entry file
  const declSource = propsDecl?.getSourceFile() ?? entryFile;

  // Extract variant type union values (e.g. ButtonVariant = 'filled' | 'elevated' | ...)
  const variantType = declSource.getTypeAlias(`${name}Variant`);
  const variants: string[] = [];
  if (variantType) {
    // Use getTypeNode() to get source text like "'filled' | 'elevated'" rather than the resolved type
    const text = variantType.getTypeNode()?.getText() ?? '';
    const matches = text.match(/'([^']+)'/g);
    if (matches) variants.push(...matches.map(m => m.replace(/'/g, '')));
  }

  // Extract @example blocks from the Props declaration JSDoc
  const examples = propsDecl ? extractExamples(propsDecl.getJsDocs()) : [];

  const dependencies = collectDependencies(project, sources.files);

  return {
    entry: {
      name,
      file: sources.file,
      files: sources.files,
      category,
      description,
      platforms: sources.platforms,
      dependencies: dependencies.runtime,
      variants,
      props,
      examples,
    },
    heritage,
    typeOnlyDependencies: dependencies.typeOnly,
  };
}

function isSkipped(result: ProcessedComponent | SkippedComponent): result is SkippedComponent {
  return 'reason' in result;
}

/**
 * Every component documented in source, whether or not the package exports it.
 *
 * This is the far side of the drift check. The near side asks "does every
 * exported component carry a `@category`?"; this one asks "is every component
 * that carries a `@category` actually exported?", and catches the failure that
 * co-locating metadata makes easy — writing and documenting a component, then
 * forgetting the one line in the barrel that publishes it. Without it that
 * component is simply absent from the manifest, silently and forever.
 */
function documentedComponentNames(project: Project): Map<string, string> {
  const documented = new Map<string, string>();

  for (const sourceFile of project.getSourceFiles()) {
    if (!sourceFile.getFilePath().startsWith(join(root, 'components'))) continue;

    const named = [
      ...sourceFile.getFunctions().map(fn => [fn.getName(), fn] as const),
      ...sourceFile.getClasses().map(cls => [cls.getName(), cls] as const),
      ...sourceFile
        .getVariableStatements()
        .flatMap(stmt => stmt.getDeclarations().map(d => [d.getName(), stmt] as const)),
    ];

    for (const [name, owner] of named) {
      if (!name || !/^[A-Z]/.test(name) || documented.has(name)) continue;
      const docs = owner.getJsDocs();
      const doc = docs[docs.length - 1];
      if (doc && extractTag(doc, 'category')) {
        documented.set(name, sourceFile.getFilePath().replace(`${root}/`, ''));
      }
    }
  }

  return documented;
}

/**
 * Guard against silent extraction failures.
 *
 * The manifest is the only thing the MCP `get_component` tool serves, so a
 * component that quietly loses its props ships as a component with no API, and
 * one that never resolves to a file ships as nothing at all. Fail the build
 * loudly instead.
 */
function assertManifestComplete(
  processed: ProcessedComponent[],
  skipped: SkippedComponent[],
  exported: ExportedComponent[],
  documented: Map<string, string>,
  declared: DeclaredPackaging,
): void {
  const errors: string[] = [];
  const components = processed.map(p => p.entry);

  if (skipped.length) {
    errors.push(
      `Exported from components/index.ts but not documented in source:\n` +
        skipped.map(s => `    ${s.name} (${s.file}) — ${s.reason}`).join('\n') +
        '\n  These are publicly exported components, so `get_component` and\n' +
        '  `search_components` return nothing for them. Put a doc comment on the\n' +
        '  declaration whose first paragraph describes the component in one sentence,\n' +
        `  and tag it with @category (one of: ${CATEGORIES.join(', ')}).\n` +
        '  If the export is not really a component, it should not be shaped like one —\n' +
        '  fix the export rather than the check.',
    );
  }

  // ...and the other direction: a component documented in source but never
  // published is invisible to every tool, and nothing else would say so.
  const exportedNames = new Set(exported.map(c => c.name));
  const unpublished = [...documented].filter(([name]) => !exportedNames.has(name));
  if (unpublished.length) {
    errors.push(
      `Documented with @category but not exported from components/index.ts: ` +
        `${unpublished.map(([name, file]) => `${name} (${file})`).join(', ')}\n` +
        '  The doc block says this is a manifest component, but the barrel never\n' +
        '  publishes it, so consumers cannot import it and the manifest cannot list it.\n' +
        '  Export it from its module barrel, or drop the @category tag if it is an\n' +
        '  internal helper.',
    );
  }

  const emitted = new Set(components.map(c => c.name));
  const dropped = exported.filter(c => !emitted.has(c.name) && !skipped.some(s => s.name === c.name));
  if (dropped.length) {
    errors.push(
      `Exported and documented, yet missing from the manifest: ${dropped.map(c => c.name).join(', ')}\n` +
        '  Nothing should reach this state — it means the build dropped a component\n' +
        '  without recording why. Check processComponent().',
    );
  }

  const missingFiles = components
    .filter(c => c.files.length === 0 || !existsSync(join(root, c.file)))
    .map(c => `${c.name} (${c.file})`);
  if (missingFiles.length) {
    errors.push(
      `No source file on disk for: ${missingFiles.join(', ')}\n` +
        '  The entry file is derived by stripping the platform suffix off the file the\n' +
        '  barrel resolves to, so this means a component is published only as a\n' +
        '  platform variant with no base file. Add the base file, or teach\n' +
        '  resolveSources() why that is legitimate.',
    );
  }

  const noPlatforms = components.filter(c => c.platforms.length === 0).map(c => `${c.name} (${c.file})`);
  if (noPlatforms.length) {
    errors.push(
      `No supported platform derived for: ${noPlatforms.join(', ')}\n` +
        '  Platform support comes from the files beside the entry file, so a component\n' +
        '  that supports nothing has no base file and no variant any bundler resolves.\n' +
        '  Check PLATFORM_RESOLUTION and resolveSources().',
    );
  }

  const emptyProps = components
    .filter(c => c.props.length === 0 && !PROPLESS_COMPONENTS.includes(c.name))
    .map(c => `${c.name} (${c.file})`);
  if (emptyProps.length) {
    errors.push(
      `No props extracted for: ${emptyProps.join(', ')}\n` +
        '  The extractor looks for an exported `<Component>Props` interface, following\n' +
        "  re-exports such as `export { type XProps } from './x.web'`.\n" +
        '  Declare an interface under that exact name with the props worth documenting,\n' +
        '  or — if the component really takes none — add it to PROPLESS_COMPONENTS with\n' +
        '  a comment saying why.',
    );
  }

  const lostHeritage = processed
    .filter(p => p.heritage.firstPartyBases.length > 0 && p.heritage.inheritedCount === 0)
    .map(p => `${p.entry.name} (extends ${p.heritage.firstPartyBases.join(', ')})`);
  if (lostHeritage.length) {
    errors.push(
      `Inherited props were dropped for: ${lostHeritage.join(', ')}\n` +
        '  These props interfaces extend a first-party base, so the expansion should have\n' +
        '  contributed members from it — it contributed none. That is how Container came\n' +
        '  to advertise only `maxWidth` while hiding everything ThemedViewProps gives it.\n' +
        '  Check isFirstParty() and collectPropSignatures() before touching this list.',
    );
  }

  // A component that imports a package the package.json never promises is a
  // packaging bug: it resolves here off a hoisted node_modules and fails on a
  // clean install in a consumer's app.
  const undeclared = new Map<string, string[]>();
  for (const { entry } of processed) {
    for (const pkg of entry.dependencies) {
      if (declared.installed.has(pkg)) continue;
      undeclared.set(pkg, [...(undeclared.get(pkg) ?? []), entry.name]);
    }
  }
  if (undeclared.size) {
    errors.push(
      `Imported at runtime but not declared in ui/package.json:\n` +
        [...undeclared].map(([pkg, users]) => `    ${pkg} — used by ${users.join(', ')}`).join('\n') +
        '\n  Only `dependencies` and `peerDependencies` reach a consumer; a devDependency\n' +
        '  exists in this repo alone. Add each package as a peerDependency (with a\n' +
        '  peerDependenciesMeta entry saying whether it is optional), or stop importing it.',
    );
  }

  if (errors.length) {
    throw new Error(`Component manifest is incomplete:\n\n${errors.join('\n\n')}\n`);
  }
}

/**
 * Packages reached only from type positions and declared nowhere in
 * package.json.
 *
 * Reported rather than thrown, because the failure mode is narrower than the
 * runtime one: the JS output never references these, so the component runs. The
 * emitted `.d.ts` does reference them, so a consumer type-checking against the
 * published package still hits an unresolved import — which is why this is not
 * silent either. Promote it into `assertManifestComplete` once package.json
 * declares them and it can no longer fire.
 */
function warnUndeclaredTypeDependencies(processed: ProcessedComponent[], declared: DeclaredPackaging): void {
  const undeclared = new Map<string, string[]>();

  for (const { entry, typeOnlyDependencies } of processed) {
    for (const pkg of typeOnlyDependencies) {
      if (declared.installed.has(pkg) || declared.devOnly.has(pkg)) continue;
      undeclared.set(pkg, [...(undeclared.get(pkg) ?? []), entry.name]);
    }
  }

  if (!undeclared.size) return;

  console.warn('\n⚠ Type-only imports of packages ui/package.json does not declare:');
  for (const [pkg, users] of undeclared) console.warn(`    ${pkg} — used by ${users.join(', ')}`);
  console.warn(
    '  These are erased from the JS output, so nothing breaks at runtime, but the\n' +
      '  emitted .d.ts still imports them and a consumer type-checking the published\n' +
      '  package will not resolve them. Declare them (peerDependency, optional) or\n' +
      '  inline the types.\n',
  );
}

async function main() {
  const project = new Project({
    tsConfigFilePath: join(root, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  });

  // Everything under components/ in one pass: the barrel that states what is
  // published, every entry file and the platform variants beside it, and the
  // shared base interfaces (BaseComponentProps, InteractiveComponentProps, ...)
  // whose members collectPropSignatures pulls into the manifest. This glob is
  // what replaced the hand-written `componentFiles` list — that list had to be
  // edited in lockstep with COMPONENT_META for every new component, and a
  // component missing from either one shipped undocumented.
  project.addSourceFilesAtPaths(join(root, 'components/**/*.{ts,tsx}'));

  const declared = declaredPackaging();
  const exported = exportedComponents(project);

  const processed: ProcessedComponent[] = [];
  const skipped: SkippedComponent[] = [];
  for (const component of exported) {
    const result = processComponent(project, component);
    if (isSkipped(result)) skipped.push(result);
    else processed.push(result);
  }

  assertManifestComplete(processed, skipped, exported, documentedComponentNames(project), declared);
  warnUndeclaredTypeDependencies(processed, declared);

  // Sorted so the emitted JSON is a function of the source and nothing else —
  // export-map iteration order is an implementation detail of the checker, and
  // letting it through would make unrelated edits show up as manifest diffs.
  const components = processed
    .map(p => p.entry)
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  mkdirSync(join(root, 'dist/mcp'), { recursive: true });
  writeFileSync(
    join(root, 'dist/mcp/component-manifest.json'),
    JSON.stringify({ components }, null, 2),
  );

  console.log(`✓ Built component manifest: ${components.length} components`);
}

main().catch(err => {
  console.error('Manifest build failed:', err);
  process.exit(1);
});
