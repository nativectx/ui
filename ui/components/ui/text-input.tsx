// 1. IMPORTS
import React, { forwardRef, useState } from 'react';
import {
  Platform,
  TextInput as RNTextInput,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type TextInputProps as RNTextInputProps,
} from 'react-native';
import { Typography } from './typography';
import { useTheme } from '../../theme';
import { renderIcon } from '../../icons';
import type { IconConfig } from './button';

// 2. TYPES
export type TextInputVariant = 'filled' | 'outlined';

export interface ThemedTextInputProps extends Omit<RNTextInputProps, 'style'> {
  /** Visual variant. @default 'outlined' */
  variant?: TextInputVariant;
  /** Label shown above the input */
  label?: string;
  /** Helper text shown below the input */
  helperText?: string;
  /** Error message — replaces helperText and activates error state */
  error?: string;
  /** Icon shown on the left inside the input */
  leadingIcon?: IconConfig;
  /** Icon shown on the right inside the input */
  trailingIcon?: IconConfig;
  disabled?: boolean;
  /** Styles for the outer container */
  style?: StyleProp<ViewStyle>;
}

// 3. COMPONENT
const ThemedTextInput = forwardRef<RNTextInput, ThemedTextInputProps>(({
  variant = 'outlined',
  label,
  helperText,
  error,
  leadingIcon,
  trailingIcon,
  disabled = false,
  value,
  defaultValue,
  style,
  onFocus,
  onBlur,
  ...rest
}, ref) => {
  const theme = useTheme();
  const t = theme.tokens.input;

  const [focused, setFocused] = useState(false);

  const hasError = !!error;
  const bottomText = error ?? helperText;

  const borderColor = hasError ? t.errorColor : focused ? t.focusBorder : t.border;
  const borderWidth = focused ? 2 : 1;

  const containerStyle: ViewStyle = variant === 'filled'
    ? {
        backgroundColor: disabled ? t.background + '61' : t.background,
        borderBottomWidth: borderWidth,
        borderBottomColor: borderColor,
        borderTopLeftRadius: theme.shape.surfaceBorderRadius,
        borderTopRightRadius: theme.shape.surfaceBorderRadius,
      }
    : {
        backgroundColor: 'transparent',
        borderWidth: borderWidth,
        borderColor: borderColor,
        borderRadius: theme.shape.surfaceBorderRadius,
      };

  return (
    <View style={[styles.wrapper, style]}>
      {/* Label */}
      {label && (
        <Typography
          variant="labelMedium"
          style={[styles.label, { color: disabled ? t.placeholder : t.labelColor }]}
          numberOfLines={1}
        >
          {label}
        </Typography>
      )}

      <View style={[styles.inputContainer, containerStyle]}>
        {/* Leading icon */}
        {leadingIcon && (
          <View style={styles.leadingIcon} pointerEvents="none">
            {renderIcon(leadingIcon, leadingIcon.library ?? 'Feather', leadingIcon.size ?? 20, disabled ? t.placeholder : t.labelColor)}
          </View>
        )}

        {/* Text input */}
        <RNTextInput
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          editable={!disabled}
          style={[
            styles.input,
            { color: disabled ? t.placeholder : t.text },
            leadingIcon && styles.inputLeading,
            trailingIcon && styles.inputTrailing,
            // Suppress native browser focus ring — our border handles it.
            // RNW strips the `outline` shorthand; outlineStyle is the valid prop.
            Platform.OS === 'web' && { outlineStyle: 'none' } as any,
          ]}
          placeholderTextColor={t.placeholder}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          {...rest}
        />

        {/* Trailing icon */}
        {trailingIcon && (
          <View style={styles.trailingIcon} pointerEvents="none">
            {renderIcon(trailingIcon, trailingIcon.library ?? 'Feather', trailingIcon.size ?? 20, disabled ? t.placeholder : t.labelColor)}
          </View>
        )}
      </View>

      {/* Helper / error text */}
      {bottomText && (
        <Typography
          variant="bodySmall"
          style={[styles.helperText, { color: hasError ? t.errorColor : t.placeholder }]}
        >
          {bottomText}
        </Typography>
      )}
    </View>
  );
});

ThemedTextInput.displayName = 'ThemedTextInput';

// 4. STYLES
const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    marginBottom: 6,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    position: 'relative',
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    paddingHorizontal: 16,
  },
  inputLeading: {
    paddingLeft: 48,
  },
  inputTrailing: {
    paddingRight: 48,
  },
  leadingIcon: {
    position: 'absolute',
    left: 12,
  },
  trailingIcon: {
    position: 'absolute',
    right: 12,
  },
  helperText: {
    marginTop: 4,
    marginLeft: 2,
  },
});

// 5. EXPORTS
export { ThemedTextInput };
