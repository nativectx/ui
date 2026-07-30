import { findComponent, getManifest } from '../utils/manifest.js';
import { formatComponentBlock } from '../utils/format.js';

export function getComponent(name: string): string {
  const comp = findComponent(name);

  if (!comp) {
    const names = getManifest().map(c => c.name).join(', ');
    return `Component "${name}" not found.\n\nAvailable components: ${names}`;
  }

  const lines: string[] = [formatComponentBlock(comp)];

  lines.push(`\n### Import`);
  lines.push('```tsx');
  lines.push(`import { ${comp.name} } from '@nativectx/ui';`);
  lines.push('```');

  return lines.join('\n');
}
