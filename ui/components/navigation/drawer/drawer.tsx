import React from 'react';
import { StyleSheet, View, Pressable, ScrollView, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { useThemeContext } from '../../../theme';
import { platformShadow } from '../../shared/utils';

export interface DrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Callback when drawer should close */
  onClose: () => void;
  /** Which side the drawer slides from */
  side?: 'left' | 'right';
  /** Optional header component */
  header?: React.ReactNode;
  /** Drawer content */
  children: React.ReactNode;
  /** Optional footer component */
  footer?: React.ReactNode;
  /** Custom styles for the drawer container */
  style?: StyleProp<ViewStyle>;
}

/**
 * Reusable animated drawer component.
 * Slides in from the left or right with a backdrop.
 */
export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  side = 'left',
  header,
  children,
  footer,
  style,
}) => {
  const { values: theme } = useThemeContext();
  const tokens = theme.tokens.sidebar;
  const width = tokens.width;

  const initialTranslate = side === 'left' ? -width : width;
  const translateX = useSharedValue(isOpen ? 0 : initialTranslate);
  const backdropOpacity = useSharedValue(isOpen ? 0.5 : 0);

  // Ref-based effect event: animation always reads latest values,
  // but only fires when isOpen changes.
  const animateRef = React.useRef(() => {});
  animateRef.current = () => {
    translateX.value = withTiming(isOpen ? 0 : initialTranslate, { duration: 250 });
    backdropOpacity.value = withTiming(isOpen ? 0.5 : 0, { duration: 250 });
  };

  React.useEffect(() => {
    animateRef.current();
  }, [isOpen]);

  const animatedDrawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    pointerEvents: backdropOpacity.value > 0 ? ('auto' as any) : ('none' as any),
  }));

  if (!isOpen && backdropOpacity.value === 0) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents={isOpen ? 'auto' : 'none'}>
      <Animated.View
        style={[styles.backdrop, { backgroundColor: theme.scrim }, animatedBackdropStyle]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close drawer" accessibilityRole="button" />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          side === 'left' ? styles.drawerLeft : styles.drawerRight,
          { width, backgroundColor: tokens.background },
          platformShadow(theme.shadow, 2, 0, 0.15, 8),
          animatedDrawerStyle,
          style,
        ]}
      >
        {header}
        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
          {children}
        </ScrollView>
        {footer}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
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
    top: 0,
    bottom: 0,
  },
  drawerLeft: {
    left: 0,
  },
  drawerRight: {
    right: 0,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
});
