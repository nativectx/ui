// Mock for react-native-reanimated in web environments
// This prevents worklet errors when running Storybook on web

import React from 'react';

export type SharedValue<T = any> = { value: T };

export const useSharedValue = <T = any>(value: T): SharedValue<T> => ({ value });
export const useAnimatedStyle = (updater: () => any) => ({});
export const useAnimatedRef = <T = any>() => ({ current: null as T | null });
export const useAnimatedScrollHandler = (handlers: any, deps?: any[]) => () => {};
export const useScrollViewOffset = (ref: any) => useSharedValue(0);
export const withTiming = (value: any, config?: any) => value;
export const withSpring = (value: any, config?: any) => value;
export const withRepeat = (value: any, iterations?: number, reverse?: boolean) => value;
export const withSequence = (...values: any[]) => values[0];
export const withDelay = (delay: number, value: any) => value;
export const cancelAnimation = () => {};
export const runOnJS = (fn: Function) => fn;
export const runOnUI = (fn: Function) => fn;
export const interpolate = (
  value: number,
  inputRange: number[],
  outputRange: number[],
  options?: any
) => {
  // Simple linear interpolation for web mock
  const minInput = Math.min(...inputRange);
  const maxInput = Math.max(...inputRange);
  const minOutput = Math.min(...outputRange);
  const maxOutput = Math.max(...outputRange);
  const normalized = (value - minInput) / (maxInput - minInput);
  return minOutput + normalized * (maxOutput - minOutput);
};

export const Extrapolation = {
  IDENTITY: 'identity',
  CLAMP: 'clamp',
  EXTEND: 'extend',
};

export const Easing = {
  linear: (t: number) => t,
  ease: (t: number) => t,
  quad: (t: number) => t * t,
  cubic: (t: number) => t * t * t,
  poly: (n: number) => (t: number) => Math.pow(t, n),
  sin: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  circle: (t: number) => 1 - Math.sqrt(1 - t * t),
  exp: (t: number) => Math.pow(2, 10 * (t - 1)),
  elastic: (bounciness: number = 1) => (t: number) => t,
  back: (s: number = 1.70158) => (t: number) => t,
  bounce: (t: number) => t,
  bezier: (x1: number, y1: number, x2: number, y2: number) => (t: number) => t,
  in: (easing: (t: number) => number) => easing,
  out: (easing: (t: number) => number) => easing,
  inOut: (easing: (t: number) => number) => easing,
};

// Entering/exiting/layout animations. Components chain these off the preset
// (`FadeIn.duration(200)`), so every method has to return something chainable.
// The mock strips the resulting objects off the element before render, so the
// builder only needs to survive the chain, not describe a real animation.
const createAnimationBuilder = (): any => {
  const builder: any = new Proxy(() => builder, {
    get: (_target, prop) => (prop === 'toString' ? () => 'ReanimatedMock' : () => builder),
    apply: () => builder,
  });
  return builder;
};

export const FadeIn = createAnimationBuilder();
export const FadeOut = createAnimationBuilder();
export const FadeInUp = createAnimationBuilder();
export const FadeInDown = createAnimationBuilder();
export const FadeInLeft = createAnimationBuilder();
export const FadeInRight = createAnimationBuilder();
export const FadeOutUp = createAnimationBuilder();
export const FadeOutDown = createAnimationBuilder();
export const FadeOutLeft = createAnimationBuilder();
export const FadeOutRight = createAnimationBuilder();
export const SlideInUp = createAnimationBuilder();
export const SlideInDown = createAnimationBuilder();
export const SlideInLeft = createAnimationBuilder();
export const SlideInRight = createAnimationBuilder();
export const SlideOutUp = createAnimationBuilder();
export const SlideOutDown = createAnimationBuilder();
export const SlideOutLeft = createAnimationBuilder();
export const SlideOutRight = createAnimationBuilder();
export const ZoomIn = createAnimationBuilder();
export const ZoomOut = createAnimationBuilder();
export const Layout = createAnimationBuilder();
export const LinearTransition = createAnimationBuilder();

// Reanimated-only props would otherwise reach the DOM through react-native-web
// and log invalid-prop warnings on every story that animates.
const ANIMATION_PROPS = ['entering', 'exiting', 'layout', 'sharedTransitionTag'];

const withoutAnimationProps = (props: Record<string, any>) => {
  const rest: Record<string, any> = {};
  for (const key of Object.keys(props)) {
    if (!ANIMATION_PROPS.includes(key)) rest[key] = props[key];
  }
  return rest;
};

export const createAnimatedComponent = (component: any) => {
  const AnimatedComponent = React.forwardRef((props: any, ref: any) =>
    React.createElement(component, { ...withoutAnimationProps(props), ref })
  );
  AnimatedComponent.displayName = `Animated(${component?.displayName ?? component?.name ?? 'Component'})`;
  return AnimatedComponent;
};

const ReactNative = require('react-native');

export const Animated = {
  View: createAnimatedComponent(ReactNative.View),
  Text: createAnimatedComponent(ReactNative.Text),
  Image: createAnimatedComponent(ReactNative.Image),
  ScrollView: createAnimatedComponent(ReactNative.ScrollView),
  FlatList: createAnimatedComponent(ReactNative.FlatList),
  SectionList: createAnimatedComponent(ReactNative.SectionList),
  createAnimatedComponent,
};

// The default export is the `Animated` namespace itself — components do
// `import Animated from 'react-native-reanimated'` and then `<Animated.View>`,
// so nesting it under a key here would make every one of those render undefined.
export default Animated;
