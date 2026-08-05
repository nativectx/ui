import React, { createContext, useState, useMemo, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { createDarkTheme, createLightTheme, ThemeValuesType, type ThemeTokens } from './theme-config';
import { Brand } from '../brand';
import { BrandProvider } from '../brand/brand-context';
import { SidebarProvider } from '../context/sidebar-context';
import { LayoutProvider } from '../context/layout-context';

// Defining types for the ThemeContext
export type ThemeMode = 'light' | 'dark';

export type ThemeContextType = {
  values: ThemeValuesType;
  /** The resolved mode actually being rendered — never `'system'`. */
  mode: ThemeMode;
  /** Pass `'system'` to clear a user override and resume following the OS. */
  setMode: (m: ThemeMode | 'system') => void;
  toggleTheme: () => void;
  /** True while the mode tracks the OS setting; false once the user overrides it. */
  isFollowingSystem: boolean;
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
  /**
   * Theme mode the app starts in.
   * `'system'` follows the OS light/dark setting and keeps following it until
   * `setMode` or `toggleTheme` is called; `'light'` or `'dark'` pins the theme
   * and ignores the OS. Call `setMode('system')` to resume following.
   * @default 'system'
   */
  defaultMode?: ThemeMode | 'system';
};
//Initialize NativeCtxProvider with a toggle function
const NativeCtxProvider = ({ brand, children, ssrWidth, ssrHeight, defaultMode = 'system' }: NativeCtxProviderProps) => {
  const lightTheme = useMemo(() => createLightTheme(brand), [brand]);
  // Use brand.darkColors if available, otherwise generate from brand.colors
  const darkTheme = useMemo(() => createDarkTheme(brand), [brand]);
  // null = follow the OS. An explicit setMode/toggleTheme call parks a mode here
  // and it wins over the system from then on, until setMode('system') clears it.
  const [override, setOverride] = useState<ThemeMode | null>(defaultMode === 'system' ? null : defaultMode);
  // null when the OS preference is unknown (SSR, or web before hydration) —
  // treat that as light so server output stays deterministic.
  const systemMode: ThemeMode = useColorScheme() === 'dark' ? 'dark' : 'light';
  // Derived during render, not synced in an effect: a system change re-renders
  // with the new theme immediately instead of one frame late.
  const mode = override ?? systemMode;
  const values = mode === 'light' ? lightTheme : darkTheme;

  const setMode = (m: ThemeMode | 'system') => {
    setOverride(m === 'system' ? null : m);
  };

  const toggleTheme = () => {
    // Flips relative to the resolved mode, so the first toggle on a dark device
    // goes to light rather than back to the theme already on screen.
    setOverride(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <BrandProvider brand={brand}>
      <ThemeContext.Provider value={{ values, mode, setMode, toggleTheme, isFollowingSystem: override === null }}>
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
 * `mode` is always the resolved `'light' | 'dark'`. By default it follows the OS
 * setting; `setMode('light' | 'dark')` and `toggleTheme()` override that until
 * `setMode('system')` resumes following. `isFollowingSystem` says which is in effect.
 *
 * @returns The theme mode context containing mode, setMode, toggleTheme, and isFollowingSystem
 * @throws Error if used outside of a NativeCtxProvider
 *
 * @example
 * ```tsx
 * function ThemeToggler() {
 *   const { mode, toggleTheme } = useThemeMode();
 *   return <Button title={`Switch to ${mode === 'light' ? 'dark' : 'light'}`} onPress={toggleTheme} />;
 * }
 * ```
 *
 * @example
 * ```tsx
 * function ThemeSetting() {
 *   const { mode, setMode, isFollowingSystem } = useThemeMode();
 *   const selected = isFollowingSystem ? 'system' : mode;
 *
 *   return (
 *     <>
 *       <Button title="Light" variant={selected === 'light' ? 'filled' : 'outlined'} onPress={() => setMode('light')} />
 *       <Button title="Dark" variant={selected === 'dark' ? 'filled' : 'outlined'} onPress={() => setMode('dark')} />
 *       <Button title="System" variant={selected === 'system' ? 'filled' : 'outlined'} onPress={() => setMode('system')} />
 *     </>
 *   );
 * }
 * ```
 */
export const useThemeMode = () => {
  const { mode, setMode, toggleTheme, isFollowingSystem } = useThemeContext();
  return { mode, setMode, toggleTheme, isFollowingSystem };
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
 * @deprecated Renamed to `NativeCtxProvider`. This alias will be removed in 0.2.0.
 * Run `npx nativectx migrate` to update automatically.
 */
const ZeroToApp = NativeCtxProvider;

export { ThemeContext, NativeCtxProvider, ZeroToApp };
