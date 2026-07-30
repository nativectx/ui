// 1. IMPORTS
import React from 'react';
import {
  Modal as RNModal,
  Pressable,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Typography } from './typography';
import { useTheme } from '../../theme';
import { useDimensions, breakpoints } from '../../hooks';
import { renderIcon } from '../../icons';
import { elevationStyle } from './themed-view';

// 2. TYPES
export interface ModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Called when the modal should close */
  onDismiss: () => void;
  /** Optional title shown in the modal header */
  title?: string;
  /** Modal body content */
  children: React.ReactNode;
  /** Footer actions row (e.g. Button components) */
  actions?: React.ReactNode;
  /** Whether tapping the scrim dismisses the modal. @default true */
  dismissable?: boolean;
  /** Override the modal container style */
  style?: StyleProp<ViewStyle>;
}

// 3. COMPONENT
const Modal = ({
  visible,
  onDismiss,
  title,
  children,
  actions,
  dismissable = true,
  style,
}: ModalProps) => {
  const theme = useTheme();
  const t = theme.tokens.modal;
  const modalText = theme.onSurface;
  const { width } = useDimensions();
  const isDialog = width >= breakpoints.medium;

  const shadowStyle = elevationStyle(3, theme.shadow);

  const containerStyle: ViewStyle = isDialog
    ? {
        maxWidth: 560,
        width: '90%',
        borderRadius: theme.shape.surfaceBorderRadius,
        ...shadowStyle,
      }
    : {
        width: '100%',
        borderTopLeftRadius: theme.shape.surfaceBorderRadius * 2,
        borderTopRightRadius: theme.shape.surfaceBorderRadius * 2,
        ...shadowStyle,
      };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      {/* Scrim */}
      <Pressable
        style={[styles.scrim, { backgroundColor: t.scrim }]}
        onPress={dismissable ? onDismiss : undefined}
        accessibilityLabel="Close modal"
      />

      {/* Positioned container */}
      <View
        style={[styles.positioner, isDialog ? styles.dialogPositioner : styles.sheetPositioner]}
        pointerEvents="box-none"
      >
        <View
          style={[containerStyle, { backgroundColor: t.background }, style]}
          accessibilityViewIsModal
        >
          {/* Header */}
          {title !== undefined && (
            <View style={[styles.header, { borderBottomColor: t.headerBorder, borderBottomWidth: 1 }]}>
              <Typography variant="titleMedium" weight="medium" style={{ color: modalText, flex: 1 }}>
                {title}
              </Typography>
              <Pressable
                onPress={onDismiss}
                style={styles.closeButton}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                {renderIcon({ name: 'x' }, 'Feather', 20, modalText)}
              </Pressable>
            </View>
          )}

          {/* Body */}
          <View style={styles.body}>{children}</View>

          {/* Actions */}
          {actions && (
            <View style={[styles.actions, { borderTopColor: t.headerBorder, borderTopWidth: 1 }]}>
              {actions}
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
};

Modal.displayName = 'Modal';

// 4. STYLES
const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  positioner: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  } as ViewStyle,
  dialogPositioner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetPositioner: {
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  body: {
    padding: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
});

// 5. EXPORTS
export { Modal };
