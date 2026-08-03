// Extensionless: esbuild resolves these when bundling the CLI, and jest
// resolves them when the drift test imports this module.
import { createLightTheme, type ThemeValuesType } from '../../theme/theme-config';
import { defaultBrand } from '../../brand/default-brand';

/**
 * The token tree is derived from the real theme object rather than transcribed
 * by hand, so token names and default scale values can never drift from
 * ui/theme/theme-config.ts. The only hand-written data here is prose
 * (descriptions), and mcp/mcp-tools.test.ts fails if that prose references a
 * token that does not exist or omits one that does.
 */
const theme: ThemeValuesType = createLightTheme(defaultBrand);

type TokenGroupName = keyof ThemeValuesType['tokens'];

/** One-line summary per semantic token group. */
const GROUP_DESCRIPTIONS: Record<TokenGroupName, string> = {
  button: 'Button surfaces and labels, one pair per variant',
  input: 'Text input surfaces, borders, and label/placeholder colors',
  list: 'List row text, dividers, and selected/pressed states',
  modal: 'Modal surface, scrim, and header separator',
  appbar: 'App bar / navigation header surface and border',
  chip: 'Chip surfaces and labels for filled, outlined, and selected states',
  sidebar: 'Sidebar surface, nav item states, and layout width',
  elevation: 'M3 elevation levels (shadow depth in dp)',
  focusRing: 'Keyboard focus ring appearance',
};

/**
 * Description per `group.token` path. Every real token must appear here exactly
 * once — the drift test enforces both directions.
 */
const TOKEN_DESCRIPTIONS: Record<string, string> = {
  'button.filledBg': 'background for the filled variant',
  'button.filledText': 'label color for the filled variant',
  'button.elevatedBg': 'background for the elevated variant',
  'button.elevatedText': 'label color for the elevated variant',
  'button.tonalBg': 'background for the tonal variant',
  'button.tonalText': 'label color for the tonal variant',
  'button.outlinedBorder': 'border color for the outlined variant',
  'button.outlinedText': 'label color for the outlined variant',
  'button.textColor': 'label color for the text variant',
  'button.disabledBg': 'background when disabled',
  'button.disabledText': 'label color when disabled',

  'input.background': 'input surface background',
  'input.text': 'entered text color',
  'input.border': 'resting border color',
  'input.placeholder': 'placeholder text color',
  'input.labelColor': 'label color at rest',
  'input.labelFocusedColor': 'label color while focused',
  'input.errorColor': 'error text and border color',
  'input.focusBorder': 'border color while focused',

  'list.itemText': 'primary row text color',
  'list.itemSubtextColor': 'secondary/description row text color',
  'list.divider': 'separator line between rows',
  'list.selectedBg': 'background of a selected row',
  'list.selectedText': 'text color of a selected row',
  'list.pressedBg': 'background while a row is pressed',

  'modal.background': 'modal surface background',
  'modal.scrim': 'dimmed backdrop behind the modal',
  'modal.headerBorder': 'separator under the modal header',

  'appbar.background': 'app bar / header background',
  'appbar.border': 'bottom border of the app bar',

  'chip.filledBg': 'background for the filled variant',
  'chip.filledText': 'label color for the filled variant',
  'chip.outlinedBorder': 'border color for the outlined variant',
  'chip.outlinedText': 'label color for the outlined variant',
  'chip.selectedBg': 'background when selected',
  'chip.selectedText': 'label color when selected',
  'chip.disabledBg': 'background when disabled',
  'chip.disabledText': 'label color when disabled',
  'chip.disabledBorder': 'border color when disabled',

  'sidebar.background': 'sidebar surface background',
  'sidebar.itemText': 'nav item label color',
  'sidebar.itemActiveText': 'nav item label color when active',
  'sidebar.itemActiveBg': 'nav item background when active',
  'sidebar.itemHoverBg': 'nav item background on hover (web)',
  'sidebar.divider': 'separator between sidebar sections',
  'sidebar.width': 'sidebar width in dp',

  'elevation.level0': 'no shadow (flat)',
  'elevation.level1': 'subtle shadow (cards)',
  'elevation.level2': 'moderate shadow (menus)',
  'elevation.level3': 'medium shadow (dialogs)',
  'elevation.level4': 'strong shadow (modals)',
  'elevation.level5': 'maximum shadow (tooltips)',

  'focusRing.color': 'focus ring color',
  'focusRing.width': 'focus ring thickness in dp',
  'focusRing.offset': 'gap between the element and the ring in dp',
};

/**
 * Extra scopes that are not `theme.tokens.*` groups but are still worth
 * scoping to, plus component names that map onto a token group.
 */
const SCOPE_ALIASES: Record<string, string> = {
  // token groups reachable under a component name
  fab: 'button',
  textinput: 'input',
  themedtextinput: 'input',
  listitem: 'list',
  bottomsheet: 'modal',
  sheet: 'modal',
  header: 'appbar',
  nativeheader: 'appbar',
  themedstack: 'appbar',
  apptabs: 'appbar',
  sidebaritem: 'sidebar',
  sidebarsection: 'sidebar',
  sidebarheader: 'sidebar',
  sidebarfooter: 'sidebar',
  drawer: 'sidebar',
  themedview: 'elevation',
  focus: 'focusRing',
  focusring: 'focusRing',
  // non-token scopes
  colors: 'palette',
  color: 'palette',
  palette: 'palette',
  type: 'typography',
  typography: 'typography',
  typescale: 'typography',
  spacing: 'spacing',
  radius: 'borderRadius',
  borderradius: 'borderRadius',
  shape: 'shape',
};

// ─── Derivation helpers ───────────────────────────────────────────────────────

/** Top-level string-valued theme keys, in theme-config declaration order. */
function paletteKeys(): string[] {
  return Object.entries(theme)
    .filter(([, value]) => typeof value === 'string')
    .map(([key]) => key);
}

function tokenGroupNames(): TokenGroupName[] {
  return Object.keys(theme.tokens) as TokenGroupName[];
}

function tokenEntries(group: TokenGroupName): [string, unknown][] {
  return Object.entries(theme.tokens[group] as Record<string, unknown>);
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function pad(name: string, width: number): string {
  return name + ' '.repeat(Math.max(0, width - name.length));
}

function formatScale(scale: Record<string, number>): string {
  return `{ ${Object.entries(scale).map(([k, v]) => `${k}: ${v}`).join(', ')} }`;
}

/**
 * Render one token line. Numeric tokens print their literal value; color tokens
 * do not, because they resolve from whichever brand is active.
 */
function tokenLine(group: TokenGroupName, name: string, value: unknown, width: number): string {
  const description = TOKEN_DESCRIPTIONS[`${group}.${name}`];
  const literal = typeof value === 'number' ? `${value}` : '';
  const trailing = [description, literal && `(default ${literal})`].filter(Boolean).join(' ');
  return trailing ? `${pad(name, width)} — ${trailing}` : name;
}

function renderGroup(group: TokenGroupName): string {
  const entries = tokenEntries(group);
  const width = Math.max(...entries.map(([name]) => name.length));
  const lines = entries.map(([name, value]) => tokenLine(group, name, value, width));
  return [
    `## ${group} tokens (theme.tokens.${group})`,
    GROUP_DESCRIPTIONS[group],
    '',
    ...lines,
  ].join('\n');
}

function renderPalette(): string {
  return [
    '## Palette (M3 system colors — theme.<name> from useTheme())',
    '',
    ...chunk(paletteKeys(), 4).map(row => row.join(', ')),
  ].join('\n');
}

function renderTypography(): string {
  const entries = Object.entries(theme.typography);
  const width = Math.max(...entries.map(([name]) => name.length));
  return [
    '## Typography scale (theme.typography.<name>)',
    'Font sizes in dp, weights as numeric font weights, line heights as multipliers.',
    '',
    ...entries.map(([name, value]) => `${pad(name, width)} — ${value}`),
  ].join('\n');
}

function renderScale(name: 'spacing' | 'borderRadius' | 'shape'): string {
  return [
    `## ${name} (theme.${name})`,
    'Values below are the default brand — createBrand() can override them.',
    '',
    formatScale(theme[name] as unknown as Record<string, number>),
  ].join('\n');
}

const USAGE = `## Usage
\`\`\`tsx
const theme = useTheme();

// Palette color
<View style={{ backgroundColor: theme.primary }} />

// Semantic token
<View style={{ backgroundColor: theme.tokens.button.filledBg }} />

// Spacing
<View style={{ padding: theme.spacing.md }} />
\`\`\``;

function renderFullTree(): string {
  return [
    '# @nativectx/ui Theme Tokens',
    '',
    'Derived from ui/theme/theme-config.ts (ThemeValuesType) with the default brand.',
    '',
    renderPalette(),
    '',
    '## Semantic tokens (theme.tokens.<group>.<name>)',
    '',
    ...tokenGroupNames().flatMap(group => [renderGroup(group).replace(/^## /, '### '), '']),
    renderTypography(),
    '',
    renderScale('spacing'),
    '',
    renderScale('borderRadius'),
    '',
    renderScale('shape'),
    '',
    '## Other top-level theme values',
    '',
    'isDark — true when the dark theme is active',
    '',
    USAGE,
    '',
  ].join('\n');
}

/** All scope names accepted by getThemeTokens(), for the not-found message. */
export function availableScopes(): string[] {
  return [
    ...tokenGroupNames(),
    'palette',
    'typography',
    'spacing',
    'borderRadius',
    'shape',
  ];
}

/** Exposed for the drift test. */
export function themeForTokens(): ThemeValuesType {
  return theme;
}

/** Exposed for the drift test. */
export const tokenDescriptions = TOKEN_DESCRIPTIONS;

export function getThemeTokens(component?: string): string {
  if (!component) return renderFullTree();

  const normalized = component.toLowerCase().replace(/[\s_-]/g, '').replace(/tokens?$/, '').trim();
  const groups = tokenGroupNames();
  const byName = groups.find(g => g.toLowerCase() === normalized);
  const scope = byName ?? SCOPE_ALIASES[normalized];

  if (scope && groups.includes(scope as TokenGroupName)) {
    return renderGroup(scope as TokenGroupName);
  }
  if (scope === 'palette') return renderPalette();
  if (scope === 'typography') return renderTypography();
  if (scope === 'spacing' || scope === 'borderRadius' || scope === 'shape') {
    return renderScale(scope);
  }

  return `No theme tokens are scoped to "${component}". Available scopes: ${availableScopes().join(', ')}\n\nFor the full token tree, call get_theme_tokens() with no arguments.`;
}
