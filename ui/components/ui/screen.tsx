import React from 'react';
import { ScrollView, StyleSheet, type StyleProp, type ViewStyle, Platform } from 'react-native';
import { SafeAreaView, type Edge, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView, type ThemedViewVariant } from './themed-view';
import { useTheme } from '../../theme';

export interface ScreenProps {
  /** Screen content */
  children: React.ReactNode;
  /** Whether to wrap content in ScrollView. @default false */
  scrollable?: boolean;
  /** Themed background variant. @default 'background' */
  variant?: ThemedViewVariant;
  /** Which safe area edges to respect. @default ['bottom'] */
  edges?: Edge[];
  /** Styles for the ScrollView content container (only applies if scrollable=true) */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Styles for the outer container */
  style?: StyleProp<ViewStyle>;
  /** Test ID for testing */
  testID?: string;
  /** Whether to show vertical scroll indicator. @default true */
  showsVerticalScrollIndicator?: boolean;
  /**
   * Whether to apply default top padding. @default true
   * Set to false for full-bleed layouts (e.g. hero images at the top).
   * Bottom padding is always applied when edges includes 'bottom'.
   */
  padded?: boolean;
}

/**
 * Screen component providing consistent layout with safe areas and optional scrolling.
 *
 * @example
 * ```tsx
 * <Screen scrollable>
 *   <Typography>Content</Typography>
 * </Screen>
 * ```
 */
export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  variant = 'background',
  edges = ['bottom'],
  contentContainerStyle,
  style,
  testID,
  showsVerticalScrollIndicator = true,
  padded = true,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  // Strip 'bottom' from SafeAreaView edges — we manage bottom padding directly.
  // With NativeTabs on Android, insets.bottom inside a tab screen is 0 (the native tab bar
  // already constrains the content frame), so SafeAreaView's 'bottom' edge would double-apply
  // the nav bar inset. Stripping it and using 0 on Android fixes that bug.
  // On iOS, insets.bottom does not reflect the tab bar height, so we use a fixed 80dp to clear
  // the standard tab bar (~46dp) + home indicator (~34dp).
  const safeAreaEdges = edges.filter((e): e is Edge => e !== 'bottom');
  const bottomPadding = edges.includes('bottom') ? (Platform.OS === 'ios' ? 100 : 24)  : 0;

  return (
    <ThemedView variant={variant} rounded={false} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={safeAreaEdges} testID={testID}>
        {scrollable ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              padded && { paddingTop: theme.spacing.xxl },
              { paddingBottom: bottomPadding },
              contentContainerStyle,
            ]}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          >
            {children}
          </ScrollView>
        ) : (
          <ThemedView
            variant={variant}
            rounded={false}
            style={[
              styles.content,
              padded && { paddingTop: theme.spacing.xxl },
              { paddingBottom: bottomPadding },
              style,
            ]}
          >
            {children}
          </ThemedView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
};

Screen.displayName = 'Screen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
});
