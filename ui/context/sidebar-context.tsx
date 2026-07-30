import React, { createContext, useState, useContext, useCallback } from 'react';

/**
 * Sidebar context state
 */
export interface SidebarContextType {
  /** Whether the sidebar/drawer is currently open */
  isOpen: boolean;
  /** Open the sidebar/drawer */
  open: () => void;
  /** Close the sidebar/drawer */
  close: () => void;
  /** Toggle sidebar/drawer open/closed */
  toggle: () => void;
}

// Sentinel value to detect missing provider
const MISSING_PROVIDER = Symbol('MISSING_PROVIDER');

// Create context with sentinel
const SidebarContext = createContext<SidebarContextType | typeof MISSING_PROVIDER>(MISSING_PROVIDER);

export interface SidebarProviderProps {
  children: React.ReactNode;
  /** Initial open state. @default false */
  defaultOpen?: boolean;
}

/**
 * Sidebar state provider component.
 * Wrap your app with this to enable useSidebar() hook.
 *
 * Note: This is automatically included in NativeCtxProvider provider,
 * so you typically don't need to wrap your app with this directly.
 *
 * @example
 * ```tsx
 * <SidebarProvider>
 *   <App />
 * </SidebarProvider>
 * ```
 */
export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
  defaultOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const value: SidebarContextType = {
    isOpen,
    open,
    close,
    toggle,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

/**
 * Hook to access sidebar state and controls.
 * Must be used within a SidebarProvider (automatically included in NativeCtxProvider).
 *
 * @returns Sidebar context with isOpen state and control functions
 * @throws Error if used outside of SidebarProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOpen, open, close, toggle } = useSidebar();
 *
 *   return (
 *     <View>
 *       <Button title="Toggle Menu" onPress={toggle} />
 *       <Button title="Open Menu" onPress={open} />
 *       {isOpen && <Text>Sidebar is open!</Text>}
 *     </View>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Close sidebar when navigating
 * function SidebarMenuItem({ href }: { href: string }) {
 *   const { close } = useSidebar();
 *   const router = useRouter();
 *
 *   const handlePress = () => {
 *     router.push(href);
 *     close();
 *   };
 *
 *   return <Button onPress={handlePress} />;
 * }
 * ```
 */
export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);

  if (context === MISSING_PROVIDER) {
    throw new Error(
      'useSidebar must be used within a SidebarProvider.\n\n' +
        'SidebarProvider is automatically included in NativeCtxProvider:\n\n' +
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
