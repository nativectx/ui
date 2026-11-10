import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { Divider } from './divider';
import { NativeCtxProvider } from '../../theme';
import { defaultBrand } from '../../brand/default-brand';

function lineStyle(props: React.ComponentProps<typeof Divider>) {
  const { root } = render(<NativeCtxProvider brand={defaultBrand}><Divider {...props} /></NativeCtxProvider>);
  return StyleSheet.flatten(root.findByProps({ accessibilityRole: 'none' }).props.style);
}

describe('Divider layout', () => {
  it.each(['none', 'start', 'middle'] as const)('lets horizontal %s margins reduce available width', (inset) => {
    const style = lineStyle({ inset });
    expect(style.width).toBeUndefined();
    expect(style.alignSelf).toBe('stretch');
    expect(style.marginStart ?? 0).toBe(inset === 'none' ? 0 : 16);
    expect(style.marginEnd ?? 0).toBe(inset === 'middle' ? 16 : 0);
    expect(style.marginLeft).toBeUndefined();
  });

  it.each(['none', 'start', 'middle'] as const)('preserves vertical %s geometry', (inset) => {
    const style = lineStyle({ orientation: 'vertical', inset });
    expect(style.width).toBe(StyleSheet.hairlineWidth);
    expect(style.height).toBe('100%');
    expect(style.alignSelf).toBeUndefined();
    expect(style.marginLeft ?? 0).toBe(inset === 'start' ? 16 : 0);
    expect(style.marginHorizontal ?? 0).toBe(inset === 'middle' ? 16 : 0);
  });

  it('retains explicit consumer overrides', () => {
    expect(lineStyle({ style: { width: 80, alignSelf: 'center' } })).toMatchObject({ width: 80, alignSelf: 'center' });
  });
});
