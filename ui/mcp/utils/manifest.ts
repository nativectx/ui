import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// All files are bundled into dist/mcp/server.mjs, so __dirname resolves to dist/mcp/
const manifestPath = join(__dirname, 'component-manifest.json');

export interface PropEntry {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default: string | null;
  platform: string | null;
}

export interface ComponentEntry {
  name: string;
  /** The suffix-less entry file, repo-relative. */
  file: string;
  /** Entry file plus every platform variant beside it, repo-relative. */
  files: string[];
  category: string;
  description: string;
  platforms: string[];
  /** External packages the component imports and a consumer must install. */
  dependencies: string[];
  variants: string[];
  props: PropEntry[];
  examples: string[];
}

let _cache: ComponentEntry[] | null = null;

export function getManifest(): ComponentEntry[] {
  if (_cache) return _cache;
  const raw = readFileSync(manifestPath, 'utf-8');
  _cache = JSON.parse(raw).components as ComponentEntry[];
  return _cache;
}

export function findComponent(name: string): ComponentEntry | undefined {
  const normalized = name.toLowerCase();
  return getManifest().find(c => c.name.toLowerCase() === normalized);
}
