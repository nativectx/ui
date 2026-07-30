// 1. IMPORTS
import React from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Pressable,
  ScrollView,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '../../../theme';
import { useSidebar } from '../../../context/sidebar-context';

// 2. TYPES

/**
 * Props for the Sidebar component (Native)
 */
export interface SidebarProps {
  /** Optional header component */
  header?: React.ReactNode;
  /** Sidebar content (usually SidebarSection and SidebarItem components) */
  children: React.ReactNode;
  /** Optional footer component */
  footer?: React.ReactNode;
  /** Custom styles */
  style?: StyleProp<ViewStyle>;
  /** Test ID for testing */
  testID?: string;
  /** No-op on native — accepted for cross-platform prop parity */
  avoidAppBar?: boolean;
}

// 3. COMPONENT

/**
 * Sidebar component for iOS/Android platforms
 * Modal-based drawer that slides in from the left
 */
export const Sidebar: React.FC<SidebarProps> = ({
  header,
  children,
  footer,
  style,
  testID,
}) => {
  const { values: theme } = useThemeContext();
  const { isOpen, close } = useSidebar();
  const tokens = theme.tokens.sidebar;
  const insets = useSafeAreaInsets();

  const translateX = useSharedValue(isOpen ? 0 : -tokens.width);
  const backdropOpacity = useSharedValue(isOpen ? 1 : 0);

  React.useEffect(() => {
    if (isOpen) {
      translateX.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateX.value = withTiming(-tokens.width, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [isOpen, translateX, backdropOpacity, tokens.width]);

  const animatedDrawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value * 0.5,
  }));

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={close}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.backdrop,
            { backgroundColor: theme.scrim },
            animatedBackdropStyle,
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              width: tokens.width,
              backgroundColor: tokens.background,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              shadowColor: theme.shadow,
              shadowOffset: { width: 2, height: 0 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 16,
            },
            animatedDrawerStyle,
            style,
          ]}
          testID={testID}
        >
          {header}
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
          {footer}
        </Animated.View>
      </View>
    </Modal>
  );
};

// 4. STYLES
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
});
