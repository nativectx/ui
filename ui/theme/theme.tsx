import React, { createContext, useState, useMemo, useContext } from 'react';
import { createDarkTheme, createLightTheme, ThemeValuesType, type ThemeTokens } from './theme-config';
import { Brand } from '../brand';
import { BrandProvider } from '../brand/brand-context';
import { SidebarProvider } from '../context/sidebar-context';
import { LayoutProvider } from '../context/layout-context';

// Defining types for the ThemeContext
export type ThemeMode = 'light' | 'dark';

export type ThemeContextType = {
  values: ThemeValuesType;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggleTheme: () => void;
};

// Sentinel value to detect missing provider
const MISSING_PROVIDER = Symbol('MISSING_PROVIDER');

// Initialize ThemeContext with undefined to detect missing provider
const ThemeContext = createContext<ThemeContextType | typeof MISSING_PROVIDER>(MISSING_PROVIDER);

type NativeCtxProviderProps = {
  brand: Brand;
  children: React.ReactNode;
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
};
//Initialize NativeCtxProvider with a toggle function
const NativeCtxProvider = ({ brand, children, ssrWidth, ssrHeight }: NativeCtxProviderProps) => {
  const lightTheme = useMemo(() => createLightTheme(brand), [brand]);
  // Use brand.darkColors if available, otherwise generate from brand.colors
  const darkTheme = useMemo(() => createDarkTheme(brand), [brand]);
  const [mode, setModeState] = useState<ThemeMode>('light');
  const values = mode === 'light' ? lightTheme : darkTheme;

  const setMode = (m: ThemeMode) => {
    setModeState(m);
  };

  const toggleTheme = () => {
    setModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <BrandProvider brand={brand}>
      <ThemeContext.Provider value={{ values, mode, setMode, toggleTheme }}>
        <LayoutProvider ssrWidth={ssrWidth} ssrHeight={ssrHeight}>
          <SidebarProvider>
              {children}
          </SidebarProvider>
        </LayoutProvider>
      </ThemeContext.Provider>
    </BrandProvider>
  );
};

/**
 * Hook to access the current theme values and mode.
 * Must be used within a `<NativeCtxProvider>` provider.
 *
 * @returns The theme context containing values, mode, setMode, and toggleTheme
 * @throws Error if used outside of a NativeCtxProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const theme = useTheme();
 *
 *   return (
 *     <View style={{ backgroundColor: theme.surface }}>
 *       <Text style={{ color: theme.onSurface }}>
 *         Hello World
 *       </Text>
 *     </View>
 *   );
 * }
 * ```
 */
export const useTheme = (): ThemeValuesType => {
  const { values } = useThemeContext();
  return values;
};

/**
 * Hook to access the current theme mode and controllers.
 * Must be used within a `<NativeCtxProvider>` provider.
 *
 * @returns The theme mode context containing mode, setMode, and toggleTheme
 * @throws Error if used outside of a NativeCtxProvider
 *
 * @example
 * ```tsx
 * function ThemeToggler() {
 *   const { mode, toggleTheme } = useThemeMode();
 *   return <Button title={`Switch to ${mode === 'light' ? 'dark' : 'light'}`} onPress={toggleTheme} />;
 * }
 * ```
 */
export const useThemeMode = () => {
  const { mode, setMode, toggleTheme } = useThemeContext();
  return { mode, setMode, toggleTheme };
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === MISSING_PROVIDER) {
    throw new Error(
      'useThemeContext must be used within a <NativeCtxProvider> provider.\n\n' +
        'Make sure your component is wrapped with NativeCtxProvider:\n\n' +
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

/**
 * Convenience hook to access theme tokens directly without drilling through `values.tokens`.
 * Must be used within a `<NativeCtxProvider>` provider.
 *
 * @returns The theme tokens object containing button, input, chip, sidebar, elevation, focusRing etc.
 * @throws Error if used outside of a NativeCtxProvider
 *
 * @example
 * ```tsx
 * function MyButton() {
 *   const { button, focusRing } = useTokens();
 *
 *   return (
 *     <Pressable style={{
 *       backgroundColor: button.filledBg,
 *       borderColor: focusRing.color,
 *     }}>
 *       <Text style={{ color: button.filledText }}>Click me</Text>
 *     </Pressable>
 *   );
 * }
 * ```
 */
export const useTokens = (): ThemeTokens => {
  const { values } = useThemeContext();
  return values.tokens;
};

/**
 * @deprecated Renamed to `NativeCtxProvider` in v5. This alias will be removed in v6.
 * Run `npx @nativectx/ui migrate` to update automatically.
 */
const ZeroToApp = NativeCtxProvider;

export { ThemeContext, NativeCtxProvider, ZeroToApp };
