import React, { createContext, useContext } from 'react';
import { Brand } from './brand-config';

// Brand context type
type BrandContextType = Brand;

// Create the context
const BrandContext = createContext<BrandContextType | undefined>(undefined);

// BrandProvider component
type BrandProviderProps = {
  brand: Brand;
  children: React.ReactNode;
};

export const BrandProvider = ({ brand, children }: BrandProviderProps) => {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
};

/**
 * Hook to access the current brand configuration.
 * Must be used within a `<NativeCtxProvider>` or `<BrandProvider>` provider.
 *
 * @returns The brand configuration containing colors, spacing, logo, etc.
 * @throws Error if used outside of a NativeCtxProvider or BrandProvider
 *
 * @example
 * ```tsx
 * function MyHeader() {
 *   const { values: theme } = useThemeContext();
 *   const brand = useBrandConfig();
 *
 *   return (
 *     <View style={{ padding: theme.spacing.md }}>
 *       <Image source={brand.logo.light} />
 *       <Text style={{ color: theme.primary }}>
 *         {brand.name}
 *       </Text>
 *     </View>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Access brand colors directly (Internal use)
 * function ColoredBox() {
 *   const { values: theme } = useThemeContext();
 *   const { colors } = useBrandConfig();
 *
 *   return (
 *     <View style={{
 *       backgroundColor: colors.primaryContainer,
 *       padding: theme.spacing.lg,
 *       borderRadius: theme.borderRadius.sm,
 *     }}>
 *       <Text style={{ color: colors.onPrimaryContainer }}>
 *         Brand colored content
 *       </Text>
 *     </View>
 *   );
 * }
 * ```
 */
export const useBrandConfig = (): Brand => {
  const context = useContext(BrandContext);

  if (context === undefined) {
    throw new Error(
      'useBrandConfig must be used within a <NativeCtxProvider> provider.\n\n' +
        'Make sure your component is inside a NativeCtxProvider provider:\n\n' +
        '  import { NativeCtxProvider, createBrand } from "@nativectx/ui";\n\n' +
        '  const brand = createBrand({\n' +
        '    name: "My App",\n' +
        '    colors: { colorSeed: { primary: "#6750A4" } },\n' +
        '    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 40 },\n' +
        '    borderRadius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 28, full: 9999 },\n' +
        '    shape: { surfaceBorderRadius: 12, buttonBorderRadius: 8 },\n' +
        '  });\n\n' +
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

