import React, { useState, useMemo, useEffect } from 'react';
import { Platform, View } from 'react-native';
import { ThemeContext, BrandProvider, createLightTheme, createDarkTheme, type ThemeContextType, type ThemeMode } from '@nativectx/ui';
import { storybookBrand } from './brand-config';

// Wrapper component that manages theme based on Storybook globals
const ThemeWrapper = ({
  Story,
  theme
}: {
  Story: React.ComponentType;
  theme: ThemeMode;
}) => {
  const lightTheme = useMemo(() => createLightTheme(storybookBrand), []);
  const darkTheme = useMemo(() => createDarkTheme(storybookBrand), []);
  const [mode, setMode] = useState<ThemeMode>(theme);
  const themeValues = mode === 'dark' ? darkTheme : lightTheme;

  // Update mode when Storybook global changes
  useEffect(() => {
    setMode(theme);
  }, [theme]);

  // Create theme context value matching ThemeContextType
  const themeContextValue = useMemo<ThemeContextType>(() => ({
    values: themeValues,
    mode,
    // Storybook drives the mode from its own toolbar global, so 'system' is
    // treated as a no-op here rather than deferring to the OS.
    setMode: (m) => { if (m !== 'system') setMode(m); },
    toggleTheme: () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
    isFollowingSystem: false,
  }), [themeValues, mode]);

  return (
    <BrandProvider brand={storybookBrand}>
      <ThemeContext.Provider value={themeContextValue}>
        <View style={{
          flex: 1,
          backgroundColor: themeValues.surface,
          ...(Platform.OS === 'web' ? { minHeight: '100vh' as any } : {}),
        }}>
          <Story />
        </View>
      </ThemeContext.Provider>
    </BrandProvider>
  );
};

export const withNativeCtxProvider = (Story: React.ComponentType, context: { globals?: Record<string, unknown> }) => {
  // Get theme from Storybook globals, default to 'light'
  const theme = (context.globals?.theme as ThemeMode) || 'light';

  return (
    <ThemeWrapper Story={Story} theme={theme} />
  );
};
