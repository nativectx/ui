import React from 'react';
import { fireEvent, render, renderHook } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { NativeCtxProvider, useThemeContext, useTheme, useTokens } from './theme';
import { defaultBrand } from '../brand/default-brand';
import { createLightTheme, createDarkTheme } from './theme-config';

// Test component that exposes theme values for assertions
const ThemeTestComponent = () => {
  const { values, mode, toggleTheme, setMode } = useThemeContext();

  return (
    <View>
      <Text testID="isDark">{String(values.isDark)}</Text>
      <Text testID="mode">{mode}</Text>
      <Text testID="primary">{values.primary}</Text>
      <Text testID="surface">{values.surface}</Text>
      <Text testID="onSurface">{values.onSurface}</Text>
      <Text testID="buttonFilledBg">{values.tokens.button.filledBg}</Text>
      <Text testID="cardBackground">{values.surfaceContainer}</Text>
      <Text testID="typographyBodyMedium">{String(values.typography.bodyMedium)}</Text>
      <Text testID="elevationLevel2">{String(values.tokens.elevation.level2)}</Text>
      <Text onPress={toggleTheme} testID="toggleTheme">Toggle</Text>
      <Text onPress={() => setMode('dark')} testID="setDark">Set Dark</Text>
      <Text onPress={() => setMode('light')} testID="setLight">Set Light</Text>
    </View>
  );
};

// Test component for useTokens hook
const TokensTestComponent = () => {
  const tokens = useTokens();
  const theme = useTheme();

  return (
    <View>
      <Text testID="tokenButtonFilledBg">{tokens.button.filledBg}</Text>
      <Text testID="tokenCardBackground">{theme.surfaceContainer}</Text>
      <Text testID="tokenInputBorder">{tokens.input.border}</Text>
      <Text testID="tokenTypographyHeadlineLarge">{String(theme.typography.headlineLarge)}</Text>
      <Text testID="tokenElevationLevel3">{String(tokens.elevation.level3)}</Text>
      <Text testID="tokenFocusRingWidth">{String(tokens.focusRing.width)}</Text>
    </View>
  );
};

// Wrapper component for renderHook
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeCtxProvider brand={defaultBrand}>{children}</NativeCtxProvider>
);

describe('NativeCtxProvider Provider', () => {
  describe('Theme Mode', () => {
    it('starts in light mode by default', () => {
      const { getByTestId } = render(
        <NativeCtxProvider brand={defaultBrand}>
          <ThemeTestComponent />
        </NativeCtxProvider>
      );

      expect(getByTestId('isDark').props.children).toBe('false');
      expect(getByTestId('mode').props.children).toBe('light');
    });

    it('toggles from light to dark mode', () => {
      const { getByTestId } = render(
        <NativeCtxProvider brand={defaultBrand}>
          <ThemeTestComponent />
        </NativeCtxProvider>
      );

      expect(getByTestId('isDark').props.children).toBe('false');
      fireEvent.press(getByTestId('toggleTheme'));
      expect(getByTestId('isDark').props.children).toBe('true');
      expect(getByTestId('mode').props.children).toBe('dark');
    });

    it('toggles from dark back to light mode', () => {
      const { getByTestId } = render(
        <NativeCtxProvider brand={defaultBrand}>
          <ThemeTestComponent />
        </NativeCtxProvider>
      );

      // Toggle to dark
      fireEvent.press(getByTestId('toggleTheme'));
      expect(getByTestId('mode').props.children).toBe('dark');

      // Toggle back to light
      fireEvent.press(getByTestId('toggleTheme'));
      expect(getByTestId('mode').props.children).toBe('light');
      expect(getByTestId('isDark').props.children).toBe('false');
    });

    it('sets mode directly with setMode', () => {
      const { getByTestId } = render(
        <NativeCtxProvider brand={defaultBrand}>
          <ThemeTestComponent />
        </NativeCtxProvider>
      );

      // Set to dark directly
      fireEvent.press(getByTestId('setDark'));
      expect(getByTestId('mode').props.children).toBe('dark');

      // Set back to light directly
      fireEvent.press(getByTestId('setLight'));
      expect(getByTestId('mode').props.children).toBe('light');
    });
  });

  describe('Theme Values', () => {
    it('provides color values from brand', () => {
      const { getByTestId } = render(
        <NativeCtxProvider brand={defaultBrand}>
          <ThemeTestComponent />
        </NativeCtxProvider>
      );

      // Primary color should be a valid hex color string
      const primary = getByTestId('primary').props.children;
      expect(primary).toMatch(/^#[0-9A-Fa-f]{6}$/);

      // Surface should be a valid hex color
      const surface = getByTestId('surface').props.children;
      expect(surface).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('changes color values when theme toggles', () => {
      const { getByTestId } = render(
        <NativeCtxProvider brand={defaultBrand}>
          <ThemeTestComponent />
        </NativeCtxProvider>
      );

      const lightSurface = getByTestId('surface').props.children;

      fireEvent.press(getByTestId('toggleTheme'));

      const darkSurface = getByTestId('surface').props.children;

      // Light and dark surfaces should be different
      expect(lightSurface).not.toBe(darkSurface);
    });
  });

  describe('Theme Tokens', () => {
    it('provides button tokens', () => {
      const { getByTestId } = render(
        <NativeCtxProvider brand={defaultBrand}>
          <ThemeTestComponent />
        </NativeCtxProvider>
      );

      const buttonFilledBg = getByTestId('buttonFilledBg').props.children;
      expect(buttonFilledBg).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('provides card tokens', () => {
      const { getByTestId } = render(
        <NativeCtxProvider brand={defaultBrand}>
          <ThemeTestComponent />
        </NativeCtxProvider>
      );

      const cardBackground = getByTestId('cardBackground').props.children;
      expect(cardBackground).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('provides typography tokens with correct values', () => {
      const { getByTestId } = render(
        <NativeCtxProvider brand={defaultBrand}>
          <ThemeTestComponent />
        </NativeCtxProvider>
      );

      const bodyMedium = Number(getByTestId('typographyBodyMedium').props.children);
      expect(bodyMedium).toBe(14);
    });

    it('provides elevation tokens with correct values', () => {
      const { getByTestId } = render(
        <NativeCtxProvider brand={defaultBrand}>
          <ThemeTestComponent />
        </NativeCtxProvider>
      );

      const elevation = Number(getByTestId('elevationLevel2').props.children);
      expect(elevation).toBe(3);
    });
  });
});

describe('useThemeContext hook', () => {
  it('returns theme context with all expected properties', () => {
    const { result } = renderHook(() => useThemeContext(), { wrapper });

    expect(result.current).toHaveProperty('values');
    expect(result.current).toHaveProperty('mode');
    expect(result.current).toHaveProperty('setMode');
    expect(result.current).toHaveProperty('toggleTheme');
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useThemeContext());
    }).toThrow('useThemeContext must be used within a <NativeCtxProvider> provider');

    consoleSpy.mockRestore();
  });

  it('values object contains all Material 3 color roles', () => {
    const { result } = renderHook(() => useThemeContext(), { wrapper });
    const { values } = result.current;

    // Core color roles
    expect(values).toHaveProperty('primary');
    expect(values).toHaveProperty('onPrimary');
    expect(values).toHaveProperty('primaryContainer');
    expect(values).toHaveProperty('onPrimaryContainer');

    // Secondary colors
    expect(values).toHaveProperty('secondary');
    expect(values).toHaveProperty('onSecondary');
    expect(values).toHaveProperty('secondaryContainer');

    // Surface colors
    expect(values).toHaveProperty('surface');
    expect(values).toHaveProperty('onSurface');
    expect(values).toHaveProperty('surfaceContainer');
    expect(values).toHaveProperty('surfaceContainerHigh');

    // Error colors
    expect(values).toHaveProperty('error');
    expect(values).toHaveProperty('onError');

    // Other roles
    expect(values).toHaveProperty('outline');
    expect(values).toHaveProperty('scrim');
    expect(values).toHaveProperty('shadow');
  });
});

describe('useTokens hook', () => {
  it('returns tokens directly without values wrapper', () => {
    const { getByTestId } = render(
      <NativeCtxProvider brand={defaultBrand}>
        <TokensTestComponent />
      </NativeCtxProvider>
    );

    // Verify tokens are accessible
    const buttonBg = getByTestId('tokenButtonFilledBg').props.children;
    expect(buttonBg).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('provides all token categories', () => {
    const { result } = renderHook(() => useTokens(), { wrapper });
    const tokens = result.current;

    expect(tokens).toHaveProperty('button');
    expect(tokens).toHaveProperty('input');
    expect(tokens).toHaveProperty('appbar');
    expect(tokens).toHaveProperty('elevation');
    expect(tokens).toHaveProperty('focusRing');
  });

  it('button tokens have all variants', () => {
    const { result } = renderHook(() => useTokens(), { wrapper });
    const { button } = result.current;

    // Filled variant
    expect(button).toHaveProperty('filledBg');
    expect(button).toHaveProperty('filledText');

    // Elevated variant
    expect(button).toHaveProperty('elevatedBg');
    expect(button).toHaveProperty('elevatedText');

    // Tonal variant
    expect(button).toHaveProperty('tonalBg');
    expect(button).toHaveProperty('tonalText');

    // Outlined variant
    expect(button).toHaveProperty('outlinedBorder');
    expect(button).toHaveProperty('outlinedText');

    // Disabled state
    expect(button).toHaveProperty('disabledBg');
    expect(button).toHaveProperty('disabledText');
  });

  it('typography tokens have M3 scale values', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    const typography = result.current.typography;

    // Display sizes
    expect(typography.displayLarge).toBe(57);
    expect(typography.displayMedium).toBe(45);
    expect(typography.displaySmall).toBe(36);

    // Headline sizes
    expect(typography.headlineLarge).toBe(32);
    expect(typography.headlineMedium).toBe(28);
    expect(typography.headlineSmall).toBe(24);

    // Title sizes
    expect(typography.titleLarge).toBe(22);
    expect(typography.titleMedium).toBe(16);
    expect(typography.titleSmall).toBe(14);

    // Body sizes
    expect(typography.bodyLarge).toBe(16);
    expect(typography.bodyMedium).toBe(14);
    expect(typography.bodySmall).toBe(12);

    // Font weights
    expect(typography.weightRegular).toBe(400);
    expect(typography.weightMedium).toBe(500);
    expect(typography.weightBold).toBe(700);
  });

  it('elevation tokens follow M3 levels', () => {
    const { result } = renderHook(() => useTokens(), { wrapper });
    const { elevation } = result.current;

    expect(elevation.level0).toBe(0);
    expect(elevation.level1).toBe(1);
    expect(elevation.level2).toBe(3);
    expect(elevation.level3).toBe(6);
    expect(elevation.level4).toBe(8);
    expect(elevation.level5).toBe(12);
  });

  it('focusRing tokens have correct defaults', () => {
    const { result } = renderHook(() => useTokens(), { wrapper });
    const { focusRing } = result.current;

    expect(focusRing.width).toBe(2);
    expect(focusRing.offset).toBe(2);
    expect(focusRing.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

describe('Theme Creation Functions', () => {
  it('createLightTheme returns isDark as false', () => {
    const lightTheme = createLightTheme(defaultBrand);
    expect(lightTheme.isDark).toBe(false);
  });

  it('createDarkTheme returns isDark as true', () => {
    const darkTheme = createDarkTheme(defaultBrand);
    expect(darkTheme.isDark).toBe(true);
  });

  it('light and dark themes have different surface colors', () => {
    const lightTheme = createLightTheme(defaultBrand);
    const darkTheme = createDarkTheme(defaultBrand);

    expect(lightTheme.surface).not.toBe(darkTheme.surface);
  });

  it('both themes have identical token structure', () => {
    const lightTheme = createLightTheme(defaultBrand);
    const darkTheme = createDarkTheme(defaultBrand);

    // Same keys in tokens
    expect(Object.keys(lightTheme.tokens)).toEqual(Object.keys(darkTheme.tokens));

    // Same keys in nested token objects
    expect(Object.keys(lightTheme.tokens.button)).toEqual(Object.keys(darkTheme.tokens.button));
    expect(Object.keys(lightTheme.typography)).toEqual(Object.keys(darkTheme.typography));
  });

  it('typography values are consistent between light and dark themes', () => {
    const lightTheme = createLightTheme(defaultBrand);
    const darkTheme = createDarkTheme(defaultBrand);

    // Typography sizes should not change between themes
    expect(lightTheme.typography.bodyMedium).toBe(darkTheme.typography.bodyMedium);
    expect(lightTheme.typography.headlineLarge).toBe(darkTheme.typography.headlineLarge);
  });

  it('elevation values are consistent between light and dark themes', () => {
    const lightTheme = createLightTheme(defaultBrand);
    const darkTheme = createDarkTheme(defaultBrand);

    expect(lightTheme.tokens.elevation).toEqual(darkTheme.tokens.elevation);
  });
});
