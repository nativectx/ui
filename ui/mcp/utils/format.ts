export function formatPropRow(prop: {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default: string | null;
  platform: string | null;
}): string {
  const req = prop.required ? '' : '?';
  const def = prop.default ? ` (default: ${prop.default})` : '';
  const plat = prop.platform ? ` [${prop.platform}]` : '';
  const desc = prop.description ? `\n    ${prop.description}${def}${plat}` : def + plat;
  return `  ${prop.name}${req}: ${prop.type}${desc}`;
}

export function formatComponentBlock(comp: {
  name: string;
  category: string;
  description: string;
  platforms: string[];
  variants: string[];
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    default: string | null;
    platform: string | null;
  }>;
  examples: string[];
}): string {
  const lines: string[] = [];

  lines.push(`## ${comp.name}`);
  lines.push(`Category: ${comp.category} | Platforms: ${comp.platforms.join(', ')}`);
  lines.push(`${comp.description}`);

  if (comp.variants.length > 0) {
    lines.push(`\nVariants: ${comp.variants.map(v => `"${v}"`).join(' | ')}`);
  }

  if (comp.props.length > 0) {
    lines.push('\n### Props');
    lines.push('```typescript');
    lines.push(`interface ${comp.name}Props {`);
    for (const prop of comp.props) {
      lines.push(formatPropRow(prop));
    }
    lines.push('}');
    lines.push('```');
  }

  if (comp.examples.length > 0) {
    lines.push('\n### Examples');
    for (const ex of comp.examples.slice(0, 3)) {
      lines.push('```tsx');
      lines.push(ex);
      lines.push('```');
    }
  }

  return lines.join('\n');
}
