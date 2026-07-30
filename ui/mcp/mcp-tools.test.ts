/**
 * Guards the two MCP tools whose entire value is being accurate about the
 * library: get_theme_tokens (token names must match theme-config.ts) and
 * generate_navigation (emitted components/props must exist).
 *
 * These assertions are the drift gate. ui/tsconfig.json excludes mcp/, so tsc
 * never sees these files — `pnpm test` is where drift has to fail.
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Project, SyntaxKind, type InterfaceDeclaration } from 'ts-morph';
import { createLightTheme } from '../theme/theme-config';
import { defaultBrand } from '../brand/default-brand';
import { getThemeTokens, tokenDescriptions, availableScopes } from './tools/get-theme-tokens';
import { generateNavigation } from './tools/generate-navigation';

const uiRoot = join(__dirname, '..');
const theme = createLightTheme(defaultBrand);

const PATTERNS = ['flat-tabs', 'tabs-sidebar', 'tabs-stack'] as const;

// ─── get_theme_tokens ─────────────────────────────────────────────────────────

describe('get_theme_tokens', () => {
  const realPaths = Object.entries(theme.tokens).flatMap(([group, entries]) =>
    Object.keys(entries as Record<string, unknown>).map(key => `${group}.${key}`),
  );

  it('documents every token in theme-config.ts', () => {
    const undocumented = realPaths.filter(path => !(path in tokenDescriptions));
    expect(undocumented).toEqual([]);
  });

  it('documents no token that theme-config.ts does not define', () => {
    const phantom = Object.keys(tokenDescriptions).filter(path => !realPaths.includes(path));
    expect(phantom).toEqual([]);
  });

  it('emits only real token names in the full tree', () => {
    const output = getThemeTokens();
    for (const path of realPaths) {
      const [, key] = path.split('.');
      expect(output).toContain(key);
    }
    // Names the audit found had drifted away from theme-config.ts.
    for (const stale of [
      'focusedBorder',
      'itemSubText',
      'errorBorder',
      'helperColor',
      'itemActiveIcon',
      'sectionText',
      'visitedColor',
    ]) {
      expect(output).not.toContain(stale);
    }
  });

  it('reports the default brand shape values, not hardcoded ones', () => {
    const output = getThemeTokens();
    expect(output).toContain(`surfaceBorderRadius: ${defaultBrand.shape.surfaceBorderRadius}`);
    expect(output).toContain(`buttonBorderRadius: ${defaultBrand.shape.buttonBorderRadius}`);
  });

  it('scopes to every token group and lists exactly that group', () => {
    for (const group of Object.keys(theme.tokens)) {
      const output = getThemeTokens(group);
      expect(output).toContain(`theme.tokens.${group}`);
      for (const key of Object.keys(theme.tokens[group as keyof typeof theme.tokens])) {
        expect(output).toContain(key);
      }
    }
  });

  it('maps component names onto their token group', () => {
    expect(getThemeTokens('ThemedTextInput')).toContain('theme.tokens.input');
    expect(getThemeTokens('ListItem')).toContain('theme.tokens.list');
    expect(getThemeTokens('button tokens')).toContain('theme.tokens.button');
  });

  it('falls back to a scope list for unknown names', () => {
    const output = getThemeTokens('nonexistent-component');
    expect(output).toContain('Available scopes');
    for (const scope of availableScopes()) expect(output).toContain(scope);
  });
});

// ─── generate_navigation ──────────────────────────────────────────────────────

/** Props parsed straight from the component source, plus inherited base props. */
function propsInterface(project: Project, file: string, name: string): InterfaceDeclaration {
  const source = project.addSourceFileAtPath(join(uiRoot, file));
  const iface = source.getInterface(name);
  if (!iface) throw new Error(`${name} not found in ${file}`);
  return iface;
}

const BASE_PROPS = ['style', 'testID', 'accessibilityLabel', 'accessibilityHint', 'disabled', 'children', 'key'];

describe('generate_navigation', () => {
  const project = new Project({ useInMemoryFileSystem: false, skipAddingFilesFromTsConfig: true });

  /** name -> allowed JSX attributes, read from the real *Props interface. */
  const componentProps: Record<string, string[]> = {
    AppTabs: propsInterface(project, 'components/navigation/app-tabs/app-tabs.tsx', 'AppTabsProps')
      .getProperties()
      .map(p => p.getName()),
    Sidebar: propsInterface(project, 'components/navigation/sidebar/sidebar.web.tsx', 'SidebarProps')
      .getProperties()
      .map(p => p.getName()),
    SidebarItem: propsInterface(project, 'components/navigation/sidebar/sidebar-item.tsx', 'SidebarItemProps')
      .getProperties()
      .map(p => p.getName()),
    SidebarSection: propsInterface(project, 'components/navigation/sidebar/sidebar-section.tsx', 'SidebarSectionProps')
      .getProperties()
      .map(p => p.getName()),
    SidebarHeader: propsInterface(project, 'components/navigation/sidebar/sidebar-header.tsx', 'SidebarHeaderProps')
      .getProperties()
      .map(p => p.getName()),
    NativeHeader: propsInterface(project, 'components/navigation/native-header.tsx', 'NativeHeaderProps')
      .getProperties()
      .map(p => p.getName()),
    Screen: propsInterface(project, 'components/ui/screen.tsx', 'ScreenProps')
      .getProperties()
      .map(p => p.getName()),
    Typography: propsInterface(project, 'components/ui/typography.tsx', 'TypographyProps')
      .getProperties()
      .map(p => p.getName()),
  };

  /** Everything `export`ed from the package barrel, resolved through re-exports. */
  const barrelExports: Set<string> = (() => {
    const barrel = new Project({ tsConfigFilePath: join(uiRoot, 'tsconfig.json') });
    const index = barrel.getSourceFileOrThrow(join(uiRoot, 'index.ts'));
    return new Set(index.getExportedDeclarations().keys());
  })();

  function generated(pattern: (typeof PATTERNS)[number]): string {
    const markdown = generateNavigation(pattern);
    const match = markdown.match(/```tsx\n([\s\S]*?)```/);
    if (!match) throw new Error(`no code block for ${pattern}`);
    return match[1];
  }

  function parse(code: string) {
    return new Project({ useInMemoryFileSystem: true }).createSourceFile('generated.tsx', code);
  }

  it.each(PATTERNS)('%s: every name imported from @nativectx/ui is exported', pattern => {
    const source = parse(generated(pattern));
    const imported = source
      .getImportDeclarations()
      .filter(d => d.getModuleSpecifierValue() === '@nativectx/ui')
      .flatMap(d => d.getNamedImports().map(n => n.getName()));

    expect(imported.length).toBeGreaterThan(0);
    for (const name of imported) {
      expect(barrelExports.has(name)).toBe(true);
    }
  });

  it.each(PATTERNS)('%s: every JSX prop on a nativectx component exists', pattern => {
    const source = parse(generated(pattern));
    const elements = [
      ...source.getDescendantsOfKind(SyntaxKind.JsxOpeningElement),
      ...source.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement),
    ];

    for (const element of elements) {
      const tag = element.getTagNameNode().getText();
      const allowed = componentProps[tag];
      if (!allowed) continue;
      // Direct attributes only — attribute values can contain nested JSX.
      for (const attribute of element.getAttributes()) {
        const name = attribute.asKind(SyntaxKind.JsxAttribute)?.getNameNode().getText();
        if (!name) continue;
        expect([tag, name, allowed.concat(BASE_PROPS).includes(name)]).toEqual([tag, name, true]);
      }
    }
  });

  it.each(PATTERNS)('%s: uses no member-expression JSX on nativectx components', pattern => {
    const source = parse(generated(pattern));
    const tags = [
      ...source.getDescendantsOfKind(SyntaxKind.JsxOpeningElement),
      ...source.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement),
    ].map(e => e.getTagNameNode().getText());

    for (const tag of tags) {
      if (!tag.includes('.')) continue;
      // Only expo-router's Stack exposes members (Stack.Screen).
      expect(tag.split('.')[0]).toBe('Stack');
    }
  });

  it('never gives SidebarItem an href — it is active/onPress driven', () => {
    for (const pattern of PATTERNS) {
      expect(generated(pattern)).not.toMatch(/<SidebarItem[^>]*href/);
    }
  });

  it('never emits ThemedStack.Screen', () => {
    for (const pattern of PATTERNS) {
      expect(generated(pattern)).not.toContain('ThemedStack.Screen');
    }
  });

  it('keeps AppTabs at the root layout for flat-tabs', () => {
    const code = generated('flat-tabs');
    expect(code).toMatch(/<NativeCtxProvider brand=\{brand\}>\s*<AppTabs/);
    expect(code).not.toContain('<Stack');
  });

  it('emits AppTabConfig fields that AppTabConfig actually declares', () => {
    const declared = propsInterface(project, 'components/navigation/app-tabs/app-tabs.tsx', 'AppTabConfig')
      .getProperties()
      .map(p => p.getName());

    for (const pattern of PATTERNS) {
      const source = parse(generated(pattern));
      const tabsArray = source
        .getVariableDeclaration('TABS')
        ?.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
      expect(tabsArray).toBeDefined();

      for (const entry of tabsArray!.getElements()) {
        for (const property of entry.asKindOrThrow(SyntaxKind.ObjectLiteralExpression).getProperties()) {
          const name = property.asKind(SyntaxKind.PropertyAssignment)?.getName();
          if (!name) continue;
          expect([name, declared.includes(name)]).toEqual([name, true]);
        }
      }
    }
  });
});

// ─── server.ts resource comment ───────────────────────────────────────────────

describe('server.ts', () => {
  it('describes the right number of skill resources', () => {
    const server = readFileSync(join(__dirname, 'server.ts'), 'utf-8');
    const skills = readFileSync(join(__dirname, 'resources/skills.ts'), 'utf-8');
    const count = (skills.match(/uri: 'nativectx:\/\//g) ?? []).length;
    expect(server).toContain(`the ${count} Claude skill files`);
  });

  it('registers a resource for every shipped skill file', () => {
    const skillsDir = join(uiRoot, '..', '.claude', 'skills');
    const skills = readFileSync(join(__dirname, 'resources/skills.ts'), 'utf-8');
    for (const file of skills.match(/file: '([^']+)'/g) ?? []) {
      const name = file.replace(/^file: '|'$/g, '');
      expect(existsSync(join(skillsDir, name))).toBe(true);
    }
  });
});
