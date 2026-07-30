import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography, renderIcon, useTheme } from '@nativectx/ui';

type CalloutType = 'warning' | 'info' | 'critical';

interface CalloutProps {
  type?: CalloutType;
  children: React.ReactNode;
}

const CONFIG: Record<CalloutType, { icon: string; accentLight: string; accentDark: string; bgLight: string; bgDark: string }> = {
  warning: {
    icon: 'alert-triangle',
    accentLight: '#d97706',
    accentDark: '#f59e0b',
    bgLight: '#fffbeb',
    bgDark: '#1c1500',
  },
  critical: {
    icon: 'alert-octagon',
    accentLight: '#dc2626',
    accentDark: '#ef4444',
    bgLight: '#fff5f5',
    bgDark: '#1c0000',
  },
  info: {
    icon: 'info',
    accentLight: '#3b82f6',
    accentDark: '#60a5fa',
    bgLight: '#eff6ff',
    bgDark: '#00101c',
  },
};

export function Callout({ type = 'info', children }: CalloutProps) {
  const { isDark } = useTheme();
  const c = CONFIG[type];
  const accent = isDark ? c.accentDark : c.accentLight;
  const bg = isDark ? c.bgDark : c.bgLight;

  return (
    <View style={[styles.container, { backgroundColor: bg, borderLeftColor: accent }]}>
      <View style={styles.icon}>
        {renderIcon({ name: c.icon, library: 'Feather' }, 'Feather', 16, accent)}
      </View>
      <View style={styles.content}>
        {typeof children === 'string' ? (
          <Typography variant="bodySmall" style={{ lineHeight: 20 }}>{children}</Typography>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderLeftWidth: 3,
    borderRadius: 6,
  },
  icon: {
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
});
