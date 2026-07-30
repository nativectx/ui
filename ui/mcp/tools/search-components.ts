import { getManifest } from '../utils/manifest.js';

export function searchComponents(query: string): string {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const all = getManifest();

  const scored = all.map(comp => {
    const haystack = [
      comp.name.toLowerCase(),
      comp.description.toLowerCase(),
      comp.category.toLowerCase(),
      ...comp.variants,
      ...comp.props.map(p => `${p.name} ${p.description}`.toLowerCase()),
    ].join(' ');

    const score = terms.reduce((acc, term) => {
      if (comp.name.toLowerCase().includes(term)) return acc + 3;
      if (comp.description.toLowerCase().includes(term)) return acc + 2;
      if (haystack.includes(term)) return acc + 1;
      return acc;
    }, 0);

    return { comp, score };
  });

  const matches = scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ comp }) => comp);

  if (matches.length === 0) {
    return `No components found matching "${query}". Try calling list_components() to see all available components.`;
  }

  const lines = [`# Search results for "${query}"\n`];
  for (const comp of matches) {
    const variants = comp.variants.length > 0 ? `\n  Variants: ${comp.variants.join(', ')}` : '';
    const topProps = comp.props
      .slice(0, 4)
      .map(p => `${p.name}${p.required ? '' : '?'}: ${p.type}`)
      .join(', ');
    lines.push(`## ${comp.name} (${comp.category})`);
    lines.push(`${comp.description}${variants}`);
    if (topProps) lines.push(`Key props: \`${topProps}\``);
    lines.push(`\nUse get_component("${comp.name}") for full props and examples.\n`);
  }

  return lines.join('\n');
}
