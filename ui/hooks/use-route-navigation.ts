import { usePathname, useRouter } from 'expo-router';

export interface IsActiveOptions {
  /** Require exact path match instead of startsWith. @default false */
  exact?: boolean;
}

export interface RouteNavigation {
  pathname: string;
  isActive: (route: string, options?: IsActiveOptions) => boolean;
  navigateTo: (route: string) => void;
}

/**
 * Provides route-aware navigation helpers for sidebar and nav components.
 * Wraps expo-router's usePathname + useRouter into reusable utilities.
 *
 * @example
 * const { isActive, navigateTo } = useRouteNavigation();
 * <SidebarItem active={isActive('/explore', { exact: true })} onPress={() => navigateTo('/explore')} />
 */
export function useRouteNavigation(): RouteNavigation {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (route: string, options?: IsActiveOptions): boolean => {
    const currentPath = typeof pathname === 'string' ? pathname : '';
    if (options?.exact) {
      return currentPath === route;
    }
    return currentPath === route || currentPath.startsWith(route + '/');
  };

  const navigateTo = (route: string): void => {
    router.push(route as any);
  };

  return { pathname, isActive, navigateTo };
}
