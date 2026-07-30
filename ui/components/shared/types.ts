import type { ViewStyle, TextStyle, ImageStyle, StyleProp, AccessibilityRole } from 'react-native';

/**
 * Base props shared by all components.
 *
 * @example
 * ```tsx
 * <MyComponent
 *   testID="my-component"
 *   style={{ marginTop: 16 }}
 * />
 * ```
 */
export interface BaseComponentProps {
  /** Test identifier for e2e testing frameworks */
  testID?: string;
  /** Additional styles to apply to the component's root view */
  style?: StyleProp<ViewStyle>;
}

/**
 * Props for interactive components (buttons, links, pressable tiles).
 * Extends BaseComponentProps with interaction and accessibility support.
 *
 * @example
 * ```tsx
 * <InteractiveComponent
 *   onPress={() => handlePress()}
 *   disabled={isLoading}
 *   accessibilityLabel="Submit form"
 *   accessibilityHint="Submits the registration form"
 * />
 * ```
 */
export interface InteractiveComponentProps extends BaseComponentProps {
  /** Whether the component is disabled and non-interactive */
  disabled?: boolean;
  /** Callback fired when the component is pressed */
  onPress?: () => void;
  /**
   * Accessibility label read by screen readers.
   * Should describe what the element is.
   */
  accessibilityLabel?: string;
  /**
   * Accessibility hint providing additional context.
   * Should describe what happens when activated.
   */
  accessibilityHint?: string;
  /** Accessibility role for assistive technologies */
  accessibilityRole?: AccessibilityRole;
}

/**
 * Props for components that support loading states.
 *
 * @example
 * ```tsx
 * <Button title="Submit" loading={isSubmitting} />
 * ```
 */
export interface LoadableComponentProps {
  /** Whether to show a loading indicator instead of content */
  loading?: boolean;
}

/**
 * Props for container components that wrap children.
 *
 * @example
 * ```tsx
 * <Card
 *   style={{ margin: 16 }}
 *   contentStyle={{ padding: 24 }}
 * >
 *   <Typography>Card content</Typography>
 * </Card>
 * ```
 */
export interface ContainerComponentProps extends BaseComponentProps {
  /** Child elements to render inside the container */
  children: React.ReactNode;
  /** Styles applied to the inner content wrapper */
  contentStyle?: StyleProp<ViewStyle>;
}
