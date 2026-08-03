/**
 * Fail the build when a skill doc makes a claim the library contradicts.
 *
 * The skills and the MCP server split the work deliberately: skills teach
 * *patterns* (which component, which layout, what not to do), the MCP tools
 * answer *lookups* (exact props, token names, defaults). So a skill that does
 * not mention a component is not drift — it is the design. What is drift is a
 * skill telling Claude something the library says is untrue: a component that
 * does not exist, a prop that was renamed away, a variant that was dropped, an
 * import path that no longer resolves.
 *
 * This checker therefore hunts FALSE claims only, never incomplete ones.
 *
 * ── What it checks ────────────────────────────────────────────────────────
 *  1. Phantom exports — a name imported `from '@nativectx/ui'` inside a fenced
 *     code block that the package barrel does not export.
 *  2. Phantom components — a component named in a `get_component("X")` call, or
 *     a category named in `list_components("x")`, that the manifest lacks.
 *  3. Phantom props — a JSX attribute on a manifest component, inside a fenced
 *     code block, that the manifest does not list for it.
 *  4. Zero-props claims — prose asserting `get_component("X")` returns nothing
 *     for a component the manifest gives props for. (Three such claims were
 *     live at once in the past; they teach distrust of correct tool output.)
 *  5. Phantom variants — a `variant="…"` value, in JSX or in an inline-code
 *     span, that is not in the component's variant union.
 *  6. False platform claims — a table row or code line pairing a component with
 *     a platform the manifest excludes for it.
 *  7. Stale import paths — a `from '@nativectx/ui/…'` specifier that does not
 *     resolve against the `exports` map in ui/package.json.
 *  8. Stale package name — any residual `zero-to-app` outside
 *     nativectx-migration.md, where it is the whole subject.
 *  9. Count claims — "list_components() returns N components" and "N skill
 *     files" against the manifest and the shipped skill set.
 *
 * ── What it deliberately does NOT check ───────────────────────────────────
 *  • Coverage. A component, prop or variant with no mention in any skill is
 *    correct by design — the MCP tools are the reference. Adding exhaustive
 *    listings back into the skills would undo deliberate work.
 *  • Capitalised identifiers in prose and markdown tables. `Card`, `Badge`,
 *    `Tooltip` and `DatePicker` appear in nativectx-components.md precisely
 *    because they do *not* exist, and no parser can tell that table apart from
 *    an inventory table. Component-name claims are only enforced where the
 *    surrounding syntax makes the claim unambiguous: import statements, JSX in
 *    code blocks, and literal MCP tool calls.
 *  • English assertions about behaviour ("Sidebar is position:fixed on web
 *    desktop", "screenOptions is merged over the defaults"). Nothing in the
 *    manifest can adjudicate those; they need a human or a runtime test.
 *  • Theme token names and numeric defaults. They live in the theme source,
 *    not the component manifest, and `get_theme_tokens` is the reference for
 *    them. nativectx-theme.md is unchecked here.
 *  • Per-prop `@platform` tags. The manifest carries them as free prose
 *    ("iOS, Android"), which is not a machine-comparable claim.
 *  • React Native pass-through props. Most components wrap an RN primitive and
 *    accept its props without the manifest enumerating them, so an unknown JSX
 *    attribute is reported as an error with an escape hatch: add genuinely
 *    universal ones to UNIVERSAL_PROPS below rather than weakening the check.
 *
 * Run: `pnpm exec tsx mcp/check-skills-sync.ts` from ui/.
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';
import { isContributorSkill, skillName } from './skills-command.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const repoRoot = join(root, '..');
const skillsDir = join(repoRoot, '.claude', 'skills');
const manifestPath = join(root, 'dist', 'mcp', 'component-manifest.json');

/** The one skill whose subject is the old package name, so it may say it. */
const MIGRATION_SKILL = 'nativectx-migration.md';

/**
 * Props every component accepts regardless of what the manifest extracted.
 *
 * `style` and `testID` are dropped from the manifest when they carry no JSDoc,
 * and React's own `key`/`ref` are never props at all. Add to this list only
 * when a prop is genuinely universal — a prop that exists on one component is
 * a manifest question, not an allowlist question.
 */
const UNIVERSAL_PROPS = new Set([
  'key',
  'ref',
  'children',
  'style',
  'testID',
  'accessible',
  'accessibilityLabel',
  'accessibilityHint',
  'accessibilityRole',
  'onLayout',
  'pointerEvents',
  'nativeID',
]);

// ── Manifest ────────────────────────────────────────────────────────────────

/**
 * Read defensively: `files` and `dependencies` are being added to the manifest
 * shape, and a checker that hard-requires the newest shape fails on the older
 * committed artifact for no good reason.
 */
interface ManifestProp {
  name: string;
  type?: string;
  required?: boolean;
  description?: string;
  default?: string | null;
  platform?: string | null;
}

interface ManifestComponent {
  name: string;
  file?: string;
  files?: string[];
  category?: string;
  description?: string;
  platforms?: string[];
  dependencies?: string[];
  variants?: string[];
  props?: ManifestProp[];
  examples?: string[];
}

const ALL_PLATFORMS = ['ios', 'android', 'web'] as const;

function loadManifest(): ManifestComponent[] {
  if (!existsSync(manifestPath)) {
    console.error(
      `Component manifest not found at ${relative(repoRoot, manifestPath)}.\n` +
        '  Build it first: `pnpm build:manifest` from ui/.',
    );
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(manifestPath, 'utf-8')) as { components?: unknown };
  if (!Array.isArray(raw.components)) {
    console.error(`Malformed manifest at ${relative(repoRoot, manifestPath)}: no \`components\` array.`);
    process.exit(1);
  }

  return raw.components.filter(
    (c): c is ManifestComponent => !!c && typeof (c as ManifestComponent).name === 'string',
  );
}

// ── Issues ──────────────────────────────────────────────────────────────────

interface Issue {
  level: 'error' | 'warning';
  file: string;
  line: number;
  claim: string;
  remedy: string;
}

const issues: Issue[] = [];

function report(level: Issue['level'], file: string, line: number, claim: string, remedy: string): void {
  issues.push({ level, file, line, claim, remedy });
}

// ── Markdown segmentation ───────────────────────────────────────────────────

interface CodeBlock {
  /** 1-based line number of the first line inside the fence. */
  startLine: number;
  lang: string;
  text: string;
}

interface TextLine {
  /** 1-based. */
  line: number;
  text: string;
}

interface Skill {
  file: string;
  lines: TextLine[];
  /** Every line, including fences and code — for whole-file scans. */
  allLines: TextLine[];
  blocks: CodeBlock[];
  /** 1-based line numbers that fall inside a fenced code block. */
  codeLines: Set<number>;
}

function parseSkill(file: string, source: string): Skill {
  const raw = source.split('\n');
  const allLines: TextLine[] = raw.map((text, i) => ({ line: i + 1, text }));
  const prose: TextLine[] = [];
  const blocks: CodeBlock[] = [];
  const codeLines = new Set<number>();

  let fence: { lang: string; startLine: number; body: string[] } | null = null;

  for (const { line, text } of allLines) {
    const fenceMatch = /^\s*```(.*)$/.exec(text);
    if (fenceMatch) {
      if (fence) {
        blocks.push({ startLine: fence.startLine, lang: fence.lang, text: fence.body.join('\n') });
        fence = null;
      } else {
        fence = { lang: fenceMatch[1].trim().toLowerCase(), startLine: line + 1, body: [] };
      }
      continue;
    }
    if (fence) {
      fence.body.push(text);
      codeLines.add(line);
    } else {
      prose.push({ line, text });
    }
  }

  // An unterminated fence still holds real code; keep it rather than dropping it.
  if (fence) blocks.push({ startLine: fence.startLine, lang: fence.lang, text: fence.body.join('\n') });

  return { file, lines: prose, allLines, blocks, codeLines };
}

function lineOf(block: CodeBlock, index: number): number {
  let count = 0;
  for (let i = 0; i < index && i < block.text.length; i++) if (block.text[i] === '\n') count++;
  return block.startLine + count;
}

// ── A very small JSX/TS scanner ─────────────────────────────────────────────
//
// Regex alone cannot survive `header={<SidebarHeader title="x" />}` or a
// trailing `// iOS only` comment between attributes, and both are all over the
// navigation skill. This walks the text instead, treating braces, strings and
// comments as opaque spans.

/** Index just past the closing quote, or -1 if unterminated. */
function skipString(text: string, start: number): number {
  const quote = text[start];
  for (let i = start + 1; i < text.length; i++) {
    if (text[i] === '\\') {
      i++;
      continue;
    }
    if (text[i] === quote) return i + 1;
    if (quote !== '`' && text[i] === '\n') return -1;
  }
  return -1;
}

/** Index just past the matching `}`, or -1 if unbalanced. */
function skipBraces(text: string, start: number): number {
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (c === '/' && text[i + 1] === '/') {
      const nl = text.indexOf('\n', i);
      if (nl === -1) return -1;
      i = nl;
      continue;
    }
    if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i);
      if (end === -1) return -1;
      i = end + 1;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      const end = skipString(text, i);
      if (end === -1) return -1;
      i = end - 1;
      continue;
    }
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

interface JsxAttr {
  name: string;
  /** Only populated for `attr="literal"`; null for expressions and booleans. */
  value: string | null;
  index: number;
}

interface JsxElement {
  name: string;
  index: number;
  attrs: JsxAttr[];
}

function scanJsx(text: string): JsxElement[] {
  const out: JsxElement[] = [];

  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '<') continue;
    const open = /^<([A-Z][A-Za-z0-9_]*(?:\.[A-Za-z0-9_]+)*)/.exec(text.slice(i));
    if (!open) continue;

    let j = i + open[0].length;
    const attrs: JsxAttr[] = [];
    let complete = false;

    while (j < text.length) {
      const c = text[j];
      if (c === '>' || (c === '/' && text[j + 1] === '>')) {
        complete = true;
        break;
      }
      if (/\s/.test(c)) {
        j++;
        continue;
      }
      if (c === '/' && text[j + 1] === '/') {
        const nl = text.indexOf('\n', j);
        if (nl === -1) break;
        j = nl + 1;
        continue;
      }
      if (c === '/' && text[j + 1] === '*') {
        const end = text.indexOf('*/', j);
        if (end === -1) break;
        j = end + 2;
        continue;
      }
      if (c === '{') {
        // `{...spread}` — nothing nameable to check
        const end = skipBraces(text, j);
        if (end === -1) break;
        j = end;
        continue;
      }

      const nameMatch = /^[A-Za-z_][A-Za-z0-9_]*/.exec(text.slice(j));
      if (!nameMatch) break;
      const attrIndex = j;
      const attrName = nameMatch[0];
      j += attrName.length;

      while (j < text.length && /\s/.test(text[j])) j++;

      let value: string | null = null;
      if (text[j] === '=') {
        j++;
        while (j < text.length && /\s/.test(text[j])) j++;
        const opener = text[j];
        if (opener === '"' || opener === "'") {
          const end = skipString(text, j);
          if (end === -1) break;
          value = text.slice(j + 1, end - 1);
          j = end;
        } else if (opener === '`') {
          const end = skipString(text, j);
          if (end === -1) break;
          j = end;
        } else if (opener === '{') {
          const end = skipBraces(text, j);
          if (end === -1) break;
          j = end;
        } else {
          break;
        }
      }

      attrs.push({ name: attrName, value, index: attrIndex });
    }

    // A half-parsed element means the scanner lost the thread (a prose snippet
    // that merely looks like JSX, most likely). Reporting from it would be
    // guesswork, so drop it.
    if (complete) out.push({ name: open[1], index: i, attrs });
  }

  return out;
}

interface ImportStatement {
  specifier: string;
  /** Named bindings, with `as` aliases reduced to the exported name. */
  names: string[];
  index: number;
}

function scanImports(text: string): ImportStatement[] {
  const out: ImportStatement[] = [];
  // `[^;]*?` keeps a side-effect import (`import './polyfill';`) from swallowing
  // the next statement's clause and mis-attributing its names.
  const re = /\b(?:import|export)\s+(?:type\s+)?([^;]*?)\s*from\s*['"]([^'"\n]+)['"]/g;

  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const clause = match[1];
    const names: string[] = [];
    const braces = /\{([\s\S]*?)\}/.exec(clause);
    if (braces) {
      for (const part of braces[1].split(',')) {
        const name = part
          .trim()
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/)[0]
          .trim();
        if (/^[A-Za-z_$][\w$]*$/.test(name)) names.push(name);
      }
    }
    out.push({ specifier: match[2], names, index: match.index });
  }

  return out;
}

// ── package.json exports map ────────────────────────────────────────────────

interface ExportsMap {
  exact: Set<string>;
  wildcards: RegExp[];
}

function loadExportsMap(): ExportsMap {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8')) as {
    exports?: Record<string, unknown>;
  };
  const exact = new Set<string>();
  const wildcards: RegExp[] = [];

  for (const key of Object.keys(pkg.exports ?? {})) {
    if (key.includes('*')) {
      const pattern = key
        .split('*')
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('(.+)');
      wildcards.push(new RegExp(`^${pattern}$`));
    } else {
      exact.add(key);
    }
  }

  return { exact, wildcards };
}

function resolvesInExports(map: ExportsMap, subpath: string): boolean {
  if (map.exact.has(subpath)) return true;
  return map.wildcards.some((re) => re.test(subpath));
}

// ── Package barrel ──────────────────────────────────────────────────────────

/**
 * Every name `@nativectx/ui` exports, read off the root barrel.
 *
 * The manifest alone cannot validate an import: `useSidebar`, `createBrand` and
 * `breakpoints` are all legitimate imports and none of them is a component. The
 * alternative — a hand-kept list of non-component exports — is exactly the kind
 * of thing this checker exists to catch drifting.
 *
 * Returns null when the barrel cannot be loaded, so a missing toolchain
 * downgrades this one check to a warning instead of failing the run.
 */
async function loadPackageExports(): Promise<Set<string> | null> {
  try {
    const { Project } = await import('ts-morph');
    const project = new Project({
      tsConfigFilePath: join(root, 'tsconfig.json'),
      skipAddingFilesFromTsConfig: true,
    });
    const barrel = project.addSourceFileAtPath(join(root, 'index.ts'));
    return new Set(barrel.getExportedDeclarations().keys());
  } catch {
    return null;
  }
}

// ── Checks ──────────────────────────────────────────────────────────────────

function checkImports(skill: Skill, exportNames: Set<string> | null, exportsMap: ExportsMap): void {
  for (const block of skill.blocks) {
    for (const statement of scanImports(block.text)) {
      const { specifier } = statement;
      const line = lineOf(block, statement.index);

      if (specifier === 'zero-to-app' || specifier.startsWith('zero-to-app/')) {
        // Reported by checkStalePackageName as a text match too; the import
        // form gets its own remedy because it is the one that breaks a build.
        continue;
      }

      if (specifier !== '@nativectx/ui' && !specifier.startsWith('@nativectx/ui/')) continue;

      const subpath = specifier === '@nativectx/ui' ? '.' : `./${specifier.slice('@nativectx/ui/'.length)}`;
      if (!resolvesInExports(exportsMap, subpath)) {
        report(
          'error',
          skill.file,
          line,
          `Imports from '${specifier}', which does not resolve against the \`exports\` map in ui/package.json.`,
          'Use a subpath the package actually publishes, or add the subpath to `exports`.',
        );
        continue;
      }

      if (specifier !== '@nativectx/ui' || !exportNames) continue;

      for (const name of statement.names) {
        if (exportNames.has(name)) continue;
        report(
          'error',
          skill.file,
          line,
          `Imports \`${name}\` from '@nativectx/ui', which the package barrel does not export.`,
          'Check the real name with `get_component`/`list_components`, or drop the import. ' +
            'Do not document an export the barrel does not have.',
        );
      }
    }
  }
}

function checkJsx(skill: Skill, byName: Map<string, ManifestComponent>): void {
  for (const block of skill.blocks) {
    for (const element of scanJsx(block.text)) {
      const component = byName.get(element.name);
      if (!component) continue; // not ours to adjudicate — see header comment

      const known = new Set((component.props ?? []).map((p) => p.name));
      const variants = component.variants ?? [];

      for (const attr of element.attrs) {
        const line = lineOf(block, attr.index);

        if (!known.has(attr.name) && !UNIVERSAL_PROPS.has(attr.name)) {
          report(
            'error',
            skill.file,
            line,
            `\`<${element.name} ${attr.name}>\` — the manifest lists no \`${attr.name}\` prop on ${element.name}.`,
            `Real props: ${[...known].join(', ') || '(none)'}. ` +
              'If this is a React Native pass-through prop that every component takes, ' +
              'add it to UNIVERSAL_PROPS in mcp/check-skills-sync.ts instead.',
          );
          continue;
        }

        if (attr.name === 'variant' && attr.value !== null && variants.length > 0 && !variants.includes(attr.value)) {
          report(
            'error',
            skill.file,
            line,
            `\`<${element.name} variant="${attr.value}">\` — not a ${element.name} variant.`,
            `Valid variants: ${variants.join(', ')}.`,
          );
        }
      }
    }
  }
}

/** `variant="…"` written inside an inline-code span rather than a code block. */
function checkInlineVariants(skill: Skill, byName: Map<string, ManifestComponent>): void {
  for (const { line, text } of skill.lines) {
    const re = /`([A-Z][A-Za-z0-9_]*)\s+variant="([^"]+)"/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      const component = byName.get(match[1]);
      const variants = component?.variants ?? [];
      if (!component || variants.length === 0 || variants.includes(match[2])) continue;
      report(
        'error',
        skill.file,
        line,
        `\`${match[1]} variant="${match[2]}"\` — not a ${match[1]} variant.`,
        `Valid variants: ${variants.join(', ')}.`,
      );
    }
  }
}

function checkToolCalls(skill: Skill, byName: Map<string, ManifestComponent>, categories: Set<string>): void {
  for (const { line, text } of skill.allLines) {
    const componentCalls = /get_component\(\s*['"`]([A-Za-z][A-Za-z0-9_]*)['"`]\s*\)/g;
    let match: RegExpExecArray | null;
    while ((match = componentCalls.exec(text)) !== null) {
      if (byName.has(match[1])) continue;
      report(
        'error',
        skill.file,
        line,
        `\`get_component("${match[1]}")\` — no component named ${match[1]} in the manifest.`,
        'Use a real component name, or drop the example. `list_components()` has the inventory.',
      );
    }

    const categoryCalls = /list_components\(\s*['"`]([a-z][a-z-]*)['"`]\s*\)/g;
    while ((match = categoryCalls.exec(text)) !== null) {
      if (categories.has(match[1])) continue;
      report(
        'error',
        skill.file,
        line,
        `\`list_components("${match[1]}")\` — no such category in the manifest.`,
        `Categories: ${[...categories].sort().join(', ')}.`,
      );
    }
  }
}

/**
 * Prose claiming a component has no props the tool can report.
 *
 * Narrow on purpose: it fires only on a line that both names a component via a
 * literal `get_component(...)` call and says it returns nothing. That is the
 * exact shape of the claims that had to be retracted once already, and it is
 * unambiguous enough to fail a build over.
 */
function checkZeroPropsClaims(skill: Skill, byName: Map<string, ManifestComponent>): void {
  const denial = /\b(returns nothing|reports? (?:zero|no) props|returns no props|has no props|no `?\w*Props`? interface)\b/i;

  for (const { line, text } of skill.allLines) {
    if (!denial.test(text)) continue;

    const calls = /get_component\(\s*['"`]([A-Za-z][A-Za-z0-9_]*)['"`]\s*\)/g;
    let match: RegExpExecArray | null;
    while ((match = calls.exec(text)) !== null) {
      const component = byName.get(match[1]);
      const count = component?.props?.length ?? 0;
      if (!component || count === 0) continue;
      report(
        'error',
        skill.file,
        line,
        `Claims \`get_component("${match[1]}")\` reports nothing, but the manifest gives it ${count} props ` +
          `(${(component.props ?? []).map((p) => p.name).join(', ')}).`,
        'Delete the claim. Telling Claude the tool is wrong about something it is right about ' +
          'is worse than silence — it teaches distrust of accurate output.',
      );
    }
  }
}

/**
 * A doc line pairing a component with a platform the manifest excludes.
 *
 * Structured lines (table rows, code) fail the build; free prose only warns,
 * because English can negate a pairing in ways line-proximity cannot see
 * ("`Sidebar` renders nothing on web").
 */
function checkPlatformClaims(skill: Skill, components: ManifestComponent[]): void {
  const restricted = components.filter((c) => {
    const platforms = c.platforms ?? [...ALL_PLATFORMS];
    return ALL_PLATFORMS.some((p) => !platforms.includes(p));
  });
  if (restricted.length === 0) return;

  const platformPatterns: { platform: string; re: RegExp }[] = [
    { platform: 'ios', re: /\b(iOS|iPadOS)\b/ },
    { platform: 'android', re: /\bAndroid\b/ },
    { platform: 'web', re: /\bweb\b/i },
  ];

  for (const { line, text } of skill.allLines) {
    const structured = /^\s*\|/.test(text);
    for (const component of restricted) {
      const mentioned = new RegExp(`(?:\`|<)${component.name}\\b`).test(text);
      if (!mentioned) continue;
      const platforms = component.platforms ?? [...ALL_PLATFORMS];

      for (const { platform, re } of platformPatterns) {
        if (platforms.includes(platform) || !re.test(text)) continue;
        report(
          structured ? 'error' : 'warning',
          skill.file,
          line,
          `Associates \`${component.name}\` with ${platform}, which the manifest excludes ` +
            `(supported: ${platforms.join(', ') || 'none'}).`,
          structured
            ? 'Correct the row, or fix `platforms` in COMPONENT_META if the manifest is the one that is wrong.'
            : 'Reword if this reads as a support claim; ignore if the sentence is denying support.',
        );
      }
    }
  }
}

/**
 * Residual references to the pre-rename package.
 *
 * Two exemptions, both because the mention is about the rename rather than a
 * leftover of it: the migration skill in full, and any single line that is
 * itself about migrating. A line such as "| `nativectx://migration` | Upgrading
 * from `zero-to-app` |" has to name the old package to mean anything.
 *
 * The third exemption is the checkout directory: repo-tree diagrams show the
 * clone's own folder name, which is a filesystem fact rather than a claim about
 * the published package.
 */
function checkStalePackageName(skill: Skill): void {
  if (skill.file === MIGRATION_SKILL) return;

  for (const { line, text } of skill.allLines) {
    if (!/zero-to-app/.test(text)) continue;
    if (/migrat(e|ed|ing|ion)/i.test(text)) continue;
    if (skill.codeLines.has(line) && /^[\s│├└─|+`-]*zero-to-app\//.test(text)) continue;

    report(
      'error',
      skill.file,
      line,
      'Mentions `zero-to-app`, the pre-rename package name.',
      `The package is \`@nativectx/ui\` and the brand is NativeCtx UI. ` +
        `Only ${MIGRATION_SKILL} — and lines that are themselves about migrating — may name it.`,
    );
  }
}

function checkCountClaims(skill: Skill, componentCount: number, skillCounts: { total: number; consumer: number }): void {
  // "N components" only counts as a claim about the whole inventory when the
  // sentence is making a claim of totality. "Compose 2 components" is not one.
  const totality = /\b(all|total|every|exported|ships?|returns?|inventory|list_components)\b/i;

  for (const { line, text } of skill.allLines) {
    const componentMatch = /(\d+)\s+(?:[a-z-]+\s+)?components\b/.exec(text);
    if (componentMatch && totality.test(text) && Number(componentMatch[1]) !== componentCount) {
      report(
        'error',
        skill.file,
        line,
        `Claims ${componentMatch[1]} components; the manifest has ${componentCount}.`,
        `Update the number to ${componentCount}.`,
      );
    }

    const skillMatch = /(\d+)\s+skill(?:\s+files?|s)?\b/.exec(text);
    if (skillMatch) {
      // `npx nativectx skills` holds the contributor skills back, so a sentence
      // about *installing* is claiming the consumer count while a sentence
      // about what the package *contains* is claiming the total.
      const install = /\b(copies|copy|installs?|installed)\b/i.test(text);
      const expected = install ? skillCounts.consumer : skillCounts.total;
      if (Number(skillMatch[1]) !== expected) {
        report(
          'error',
          skill.file,
          line,
          `Says ${skillMatch[1]} skill${skillMatch[1] === '1' ? '' : 's'}; ` +
            (install
              ? `\`npx nativectx skills\` installs ${expected} (${skillCounts.total - skillCounts.consumer} contributor skills are held back).`
              : `the package ships ${expected}.`),
          `Update the number to ${expected}.`,
        );
      }
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const components = loadManifest();
  const byName = new Map(components.map((c) => [c.name, c]));
  const categories = new Set(components.map((c) => c.category).filter((c): c is string => !!c));
  const exportsMap = loadExportsMap();
  const exportNames = await loadPackageExports();

  if (!exportNames) {
    console.warn(
      'note: could not load the package barrel via ts-morph — ' +
        'named imports from @nativectx/ui were not validated this run.\n',
    );
  }

  if (!existsSync(skillsDir)) {
    console.error(`No skills directory at ${relative(repoRoot, skillsDir)}.`);
    process.exit(1);
  }

  const files = readdirSync(skillsDir)
    .filter((file) => skillName(file) !== null)
    .sort();

  if (files.length === 0) {
    console.error(`No nativectx-*.md skill files in ${relative(repoRoot, skillsDir)}.`);
    process.exit(1);
  }

  const skillCounts = {
    total: files.length,
    consumer: files.filter((file) => !isContributorSkill(skillName(file) as string)).length,
  };

  for (const file of files) {
    const skill = parseSkill(file, readFileSync(join(skillsDir, file), 'utf-8'));
    checkImports(skill, exportNames, exportsMap);
    checkJsx(skill, byName);
    checkInlineVariants(skill, byName);
    checkToolCalls(skill, byName, categories);
    checkZeroPropsClaims(skill, byName);
    checkPlatformClaims(skill, components);
    checkStalePackageName(skill);
    checkCountClaims(skill, components.length, skillCounts);
  }

  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warning');

  const render = (issue: Issue): string =>
    `  .claude/skills/${issue.file}:${issue.line}\n` +
    `    ${issue.claim}\n` +
    `    → ${issue.remedy}`;

  if (warnings.length) {
    console.warn(`Skill docs — ${warnings.length} warning(s), not failing the build:\n`);
    console.warn(warnings.map(render).join('\n\n'));
    console.warn('');
  }

  if (errors.length) {
    console.error(
      `Skill docs contradict the library — ${errors.length} false claim(s) ` +
        `across ${new Set(errors.map((e) => e.file)).size} file(s):\n`,
    );
    console.error(errors.map(render).join('\n\n'));
    console.error(
      '\nThese are claims the manifest or the package proves false. Missing coverage is not\n' +
        'checked and is not an error — the MCP tools are the reference for exhaustive detail.\n',
    );
    process.exit(1);
  }

  console.log(
    `✓ Skill docs agree with the library: ${files.length} skill files checked against ` +
      `${components.length} components${warnings.length ? `, ${warnings.length} warning(s)` : ''}`,
  );
}

main().catch((err) => {
  console.error('Skill sync check failed to run:', err);
  process.exit(1);
});
