import { useDimensions, breakpoints } from './use-dimensions';
import type { Breakpoint } from './use-dimensions';

/**
 * Helper hook to check if current width meets a named breakpoint
 */
export function useBreakpoint(name: Breakpoint): boolean {
  const { width } = useDimensions();
  return width >= breakpoints[name];
}

export { breakpoints };
