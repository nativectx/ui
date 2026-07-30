import { getManifest } from '../utils/manifest.js';

export function listComponents(category?: string): string {
  const all = getManifest();
  const filtered = category
    ? all.filter(c => c.category.toLowerCase() === category.toLowerCase())
    : all;

  if (filtered.length === 0) {
    const cats = [...new Set(all.map(c => c.category))].join(', ');
    return `No components found for category "${category}". Available categories: ${cats}`;
  }

  const byCategory: Record<string, typeof filtered> = {};
  for (const comp of filtered) {
    (byCategory[comp.category] ??= []).push(comp);
  }

  const lines: string[] = ['# @nativectx/ui Components\n'];
  for (const [cat, comps] of Object.entries(byCategory)) {
    lines.push(`## ${cat.charAt(0).toUpperCase() + cat.slice(1)}`);
    for (const c of comps) {
      const variants = c.variants.length > 0 ? ` — variants: ${c.variants.join(', ')}` : '';
      lines.push(`- **${c.name}**: ${c.description}${variants}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
