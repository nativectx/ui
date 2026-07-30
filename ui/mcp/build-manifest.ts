import {
  Project,
  InterfaceDeclaration,
  JSDoc,
  Node,
  PropertySignature,
  SourceFile,
  SyntaxKind,
} from 'ts-morph';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Component metadata not derivable from code
const COMPONENT_META: Record<string, { category: string; description: string; platforms?: string[] }> = {
  // UI - Layout
  Container: { category: 'layout', description: 'Responsive layout container with optional column grid and gap support.' },
  Screen: { category: 'layout', description: 'Full-screen wrapper with safe area insets and scroll support.' },
  ThemedView: { category: 'layout', description: 'Themed surface view with M3 elevation and variant support.' },
  ThemedImage: { category: 'layout', description: 'Image component with themed placeholder and loading states.' },
  Divider: { category: 'layout', description: 'Horizontal divider line using M3 outline color.' },
  // UI - Display
  Typography: { category: 'display', description: 'Text component covering all 15 M3 type scale variants.' },
  Avatar: { category: 'display', description: 'Circular avatar with image, initials fallback, and size variants.' },
  // UI - Controls
  Button: { category: 'controls', description: 'M3 button with 5 variants: filled, elevated, tonal, outlined, text.' },
  Chip: { category: 'controls', description: 'Compact action or filter chip with optional icon and selection state.' },
  FAB: { category: 'controls', description: 'Floating action button with size and color variants.' },
  Switch: { category: 'controls', description: 'Toggle switch using native iOS/Android controls.', platforms: ['ios', 'android', 'web'] },
  SegmentedControl: { category: 'controls', description: 'Segmented button group for mutually exclusive selections.', platforms: ['ios', 'android', 'web'] },
  Slider: { category: 'controls', description: 'Horizontal value slider using native platform controls.', platforms: ['ios', 'android', 'web'] },
  // UI - Input
  ThemedTextInput: { category: 'input', description: 'Text input with filled/outlined variants, label, helper text, and icon slots.' },
  // UI - Feedback
  Modal: { category: 'feedback', description: 'Bottom sheet modal with themed surface and close handling.' },
  ProgressIndicator: { category: 'feedback', description: 'Linear or circular progress indicator.', platforms: ['ios', 'android', 'web'] },
  Collapsible: { category: 'feedback', description: 'Animated expand/collapse container with header.' },
  // UI - Collections
  List: { category: 'collections', description: 'Scrollable list container with optional header and footer.' },
  ListItem: { category: 'collections', description: 'List row with leading/trailing slots, title, description, and press handling.' },
  // Navigation
  AppTabs: { category: 'navigation', description: 'Tab bar using NativeTabs on iOS/Android, custom top bar on web.' },
  Sidebar: { category: 'navigation', description: 'Side navigation panel, adaptive for tablet/desktop.' },
  SidebarItem: { category: 'navigation', description: 'Navigation item inside a Sidebar with icon, label, and active state.' },
  SidebarSection: { category: 'navigation', description: 'Labelled section grouping inside a Sidebar.' },
  SidebarHeader: { category: 'navigation', description: 'Header slot at the top of a Sidebar.' },
  SidebarFooter: { category: 'navigation', description: 'Footer slot at the bottom of a Sidebar.' },
  NativeHeader: { category: 'navigation', description: 'Platform-native header buttons (left/right) for expo-router stacks.' },
  ThemedStack: { category: 'navigation', description: 'expo-router Stack with auto-applied theme colors and header styling.' },
  Drawer: { category: 'navigation', description: 'Animated side drawer primitive.' },
};

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
  category: string;
  description: string;
  platforms: string[];
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
 * This is the boundary that decides which inherited props reach the manifest,
 * and it is derived from where the declaration actually lives rather than from
 * a hand-maintained list of type names — a name list is exactly the kind of
 * thing that silently drifts out of date.
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
}

function processFile(project: Project, filePath: string, componentName: string): ProcessedComponent | null {
  const meta = COMPONENT_META[componentName];
  if (!meta) return null;

  const sourceFile = project.getSourceFile(filePath);
  if (!sourceFile) return null;

  // Find the main *Props interface (may live in a re-exported platform file)
  const propsDecl = findPropsInterface(sourceFile, componentName);
  const signatures = propsDecl ? collectPropSignatures(propsDecl) : [];
  const props = toPropEntries(signatures);

  const heritage: HeritageReport = {
    firstPartyBases: propsDecl ? firstPartyBaseInterfaces(propsDecl).map(b => b.getName()) : [],
    inheritedCount: propsDecl ? signatures.length - propsDecl.getProperties().length : 0,
  };

  // Variants live next to the props declaration, which is not always the entry file
  const declSource = propsDecl?.getSourceFile() ?? sourceFile;

  // Extract variant type union values (e.g. ButtonVariant = 'filled' | 'elevated' | ...)
  const variantType = declSource.getTypeAlias(`${componentName}Variant`);
  const variants: string[] = [];
  if (variantType) {
    // Use getTypeNode() to get source text like "'filled' | 'elevated'" rather than the resolved type
    const text = variantType.getTypeNode()?.getText() ?? '';
    const matches = text.match(/'([^']+)'/g);
    if (matches) variants.push(...matches.map(m => m.replace(/'/g, '')));
  }

  // Extract @example blocks from the Props declaration JSDoc
  const examples = propsDecl ? extractExamples(propsDecl.getJsDocs()) : [];

  const relPath = filePath.replace(root + '/', '');

  return {
    entry: {
      name: componentName,
      file: relPath,
      category: meta.category,
      description: meta.description,
      platforms: meta.platforms ?? ['ios', 'android', 'web'],
      variants,
      props,
      examples,
    },
    heritage,
  };
}

/**
 * Guard against silent extraction failures.
 *
 * The manifest is the only thing the MCP `get_component` tool serves, so a
 * component that quietly loses its props ships as a component with no API.
 * Fail the build loudly instead.
 */
function assertManifestComplete(processed: ProcessedComponent[]): void {
  const errors: string[] = [];
  const components = processed.map(p => p.entry);

  const emitted = new Set(components.map(c => c.name));
  const missing = Object.keys(COMPONENT_META).filter(name => !emitted.has(name));
  if (missing.length) {
    errors.push(
      `Declared in COMPONENT_META but absent from the manifest: ${missing.join(', ')}\n` +
        '  Every component in COMPONENT_META needs a matching entry in componentFiles,\n' +
        '  and that file path must still exist.',
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

  if (errors.length) {
    throw new Error(`Component manifest is incomplete:\n\n${errors.join('\n\n')}\n`);
  }
}

async function main() {
  const project = new Project({
    tsConfigFilePath: join(root, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  });

  const componentFiles: Array<{ file: string; name: string }> = [
    // UI components
    { file: 'components/ui/button.tsx', name: 'Button' },
    { file: 'components/ui/typography.tsx', name: 'Typography' },
    { file: 'components/ui/avatar.tsx', name: 'Avatar' },
    { file: 'components/ui/chip.tsx', name: 'Chip' },
    { file: 'components/ui/fab.tsx', name: 'FAB' },
    { file: 'components/ui/switch.tsx', name: 'Switch' },
    { file: 'components/ui/slider.tsx', name: 'Slider' },
    { file: 'components/ui/segmented-control.tsx', name: 'SegmentedControl' },
    { file: 'components/ui/text-input.tsx', name: 'ThemedTextInput' },
    { file: 'components/ui/modal.tsx', name: 'Modal' },
    { file: 'components/ui/progress-indicator.tsx', name: 'ProgressIndicator' },
    { file: 'components/ui/collapsible.tsx', name: 'Collapsible' },
    { file: 'components/ui/list.tsx', name: 'List' },
    { file: 'components/ui/list-item.tsx', name: 'ListItem' },
    { file: 'components/ui/container.tsx', name: 'Container' },
    { file: 'components/ui/screen.tsx', name: 'Screen' },
    { file: 'components/ui/themed-view.tsx', name: 'ThemedView' },
    { file: 'components/ui/themed-image.tsx', name: 'ThemedImage' },
    { file: 'components/ui/divider.tsx', name: 'Divider' },
    // Navigation components
    { file: 'components/navigation/app-tabs/app-tabs.tsx', name: 'AppTabs' },
    { file: 'components/navigation/sidebar/sidebar.tsx', name: 'Sidebar' },
    { file: 'components/navigation/sidebar/sidebar-item.tsx', name: 'SidebarItem' },
    { file: 'components/navigation/sidebar/sidebar-section.tsx', name: 'SidebarSection' },
    { file: 'components/navigation/sidebar/sidebar-header.tsx', name: 'SidebarHeader' },
    { file: 'components/navigation/sidebar/sidebar-footer.tsx', name: 'SidebarFooter' },
    { file: 'components/navigation/native-header.tsx', name: 'NativeHeader' },
    { file: 'components/navigation/themed-stack.tsx', name: 'ThemedStack' },
    { file: 'components/navigation/drawer/drawer.tsx', name: 'Drawer' },
  ];

  for (const { file, name } of componentFiles) {
    project.addSourceFileAtPath(join(root, file));
  }

  // The shared base interfaces (BaseComponentProps, InteractiveComponentProps,
  // LoadableComponentProps, ...) that most props interfaces extend, and whose
  // members collectPropSignatures pulls into the manifest. The checker would
  // load this file anyway when it resolves those `extends` clauses; adding it
  // explicitly states the dependency rather than leaving it to a side effect of
  // lazy resolution.
  project.addSourceFileAtPath(join(root, 'components/shared/types.ts'));

  const processed: ProcessedComponent[] = [];
  for (const { file, name } of componentFiles) {
    const result = processFile(project, join(root, file), name);
    if (result) processed.push(result);
  }

  assertManifestComplete(processed);

  const components = processed.map(p => p.entry);

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
