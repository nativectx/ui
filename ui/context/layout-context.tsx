import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

/**
 * Layout context state for app-level dimensions
 */
export interface LayoutContextType {
  /** Height of the app bar in pixels */
  appBarHeight: number;
  /** Set the app bar height */
  setAppBarHeight: (height: number) => void;
  /**
   * Assumed viewport width when rendering in an SSR environment (no real window).
   * Used by `useDimensions` to avoid defaulting to 0 during static export.
   * @default 0 (no assumption — use actual window dimensions)
   */
  ssrWidth: number;
  /**
   * Assumed viewport height when rendering in an SSR environment (no real window).
   * Used by `useDimensions` to avoid defaulting to 0 during static export.
   * @default 0 (no assumption — use actual window dimensions)
   */
  ssrHeight: number;
}

// Sentinel value to detect missing provider
const MISSING_PROVIDER = Symbol('MISSING_PROVIDER');

// Create context with sentinel
const LayoutContext = createContext<LayoutContextType | typeof MISSING_PROVIDER>(MISSING_PROVIDER);

export interface LayoutProviderProps {
  children: React.ReactNode;
  /** Initial app bar height. @default 64 */
  defaultAppBarHeight?: number;
  /**
   * Assumed viewport width during SSR (when `useWindowDimensions` returns 0).
   * Pass a desktop-sized value (e.g. 1440) to pre-render the desktop layout
   * so visitors see the correct layout before the JS bundle loads.
   * @default 0
   */
  ssrWidth?: number;
  /**
   * Assumed viewport height during SSR (when `useWindowDimensions` returns 0).
   * Pass a typical desktop height (e.g. 900) so height-dependent layouts
   * are pre-rendered at a reasonable size before the JS bundle loads.
   * @default 0
   */
  ssrHeight?: number;
}

/**
 * Layout state provider component.
 * Provides app-level layout information like AppBar height.
 *
 * Note: This is automatically included in NativeCtxProvider provider,
 * so you typically don't need to wrap your app with this directly.
 *
 * @example
 * ```tsx
 * <LayoutProvider>
 *   <App />
 * </LayoutProvider>
 * ```
 */
export const LayoutProvider: React.FC<LayoutProviderProps> = ({
  children,
  defaultAppBarHeight = 64,
  ssrWidth = 0,
  ssrHeight = 0,
}) => {
  const [appBarHeight, setAppBarHeightState] = useState(defaultAppBarHeight);

  const setAppBarHeight = useCallback((height: number) => {
    setAppBarHeightState(height);
  }, []);

  const value: LayoutContextType = useMemo(() => ({
    appBarHeight,
    setAppBarHeight,
    ssrWidth,
    ssrHeight,
  }), [appBarHeight, setAppBarHeight, ssrWidth, ssrHeight]);

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

/**
 * Hook to access layout information (AppBar height, etc).
 * Must be used within a LayoutProvider (automatically included in NativeCtxProvider).
 *
 * @returns Layout context with appBarHeight and setter
 * @throws Error if used outside of LayoutProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { appBarHeight } = useLayout();
 *
 *   return (
 *     <View style={{ marginTop: appBarHeight }}>
 *       <Text>Content below app bar</Text>
 *     </View>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Setting the app bar height (typically done by AppTabs)
 * function MyAppBar() {
 *   const { setAppBarHeight } = useLayout();
 *
 *   useEffect(() => {
 *     setAppBarHeight(72); // Custom height
 *   }, []);
 *
 *   return <AppBar />;
 * }
 * ```
 */
export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext);

  if (context === MISSING_PROVIDER) {
    throw new Error(
      'useLayout must be used within a LayoutProvider.\n\n' +
        'LayoutProvider is automatically included in NativeCtxProvider:\n\n' +
        '  import { NativeCtxProvider, createBrand } from "@nativectx/ui";\n\n' +
        '  const brand = createBrand({ ... });\n\n' +
        '  function App() {\n' +
        '    return (\n' +
        '      <NativeCtxProvider brand={brand}>\n' +
        '        <YourComponent />\n' +
        '      </NativeCtxProvider>\n' +
        '    );\n' +
        '  }'
    );
  }

  return context;
};
