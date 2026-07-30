import { Project, InterfaceDeclaration, JSDoc, Node } from 'ts-morph';
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

function processInterface(iface: InterfaceDeclaration, file: string): PropEntry[] {
  const props: PropEntry[] = [];

  for (const prop of iface.getProperties()) {
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

function processFile(project: Project, filePath: string, componentName: string): ComponentEntry | null {
  const meta = COMPONENT_META[componentName];
  if (!meta) return null;

  const sourceFile = project.getSourceFile(filePath);
  if (!sourceFile) return null;

  // Find the main *Props interface
  const propsInterface = sourceFile.getInterface(`${componentName}Props`);
  const props = propsInterface ? processInterface(propsInterface, filePath) : [];

  // Extract variant type union values (e.g. ButtonVariant = 'filled' | 'elevated' | ...)
  const variantType = sourceFile.getTypeAlias(`${componentName}Variant`);
  const variants: string[] = [];
  if (variantType) {
    // Use getTypeNode() to get source text like "'filled' | 'elevated'" rather than the resolved type
    const text = variantType.getTypeNode()?.getText() ?? '';
    const matches = text.match(/'([^']+)'/g);
    if (matches) variants.push(...matches.map(m => m.replace(/'/g, '')));
  }

  // Extract @example blocks from the Props interface JSDoc
  const examples = propsInterface ? extractExamples(propsInterface.getJsDocs()) : [];

  const relPath = filePath.replace(root + '/', '');

  return {
    name: componentName,
    file: relPath,
    category: meta.category,
    description: meta.description,
    platforms: meta.platforms ?? ['ios', 'android', 'web'],
    variants,
    props,
    examples,
  };
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

  // Also add shared types so extends resolution works
  project.addSourceFileAtPath(join(root, 'components/shared/types.ts'));

  const components: ComponentEntry[] = [];
  for (const { file, name } of componentFiles) {
    const entry = processFile(project, join(root, file), name);
    if (entry) components.push(entry);
  }

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
