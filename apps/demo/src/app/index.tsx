import {
  useTheme,
  useThemeMode,
  useDimensions,
  Screen,
  Container,
  ThemedView,
  Typography,
  Button,
  Chip,
  Divider,
  Switch,
  SegmentedControl,
  Avatar,
  ListItem,
  renderIcon,
} from '@nativectx/ui';
import { router } from 'expo-router';
import { Image, Linking, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { CodeBlock } from '../components/code-block';

// ─── Install ──────────────────────────────────────────────────────────────────

const INSTALL_SNIPPET = 'npx expo install @nativectx/ui\nnpx nativectx init';

// ─── Stats ────────────────────────────────────────────────────────────────────

function formatStat(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function useGithubStars() {
  const [stars, setStars] = useState<string | null>(null);
  useEffect(() => {
    fetch('https://api.github.com/repos/nativectx/ui')
      .then((r) => r.json())
      .then((d) => setStars(formatStat(d.stargazers_count)))
      .catch(() => setStars(null));
  }, []);
  return stars;
}

function useNpmDownloads() {
  const [downloads, setDownloads] = useState<string | null>(null);
  useEffect(() => {
    fetch('https://api.npmjs.org/downloads/point/last-week/@nativectx/ui')
      .then((r) => r.json())
      .then((d) => setDownloads(formatStat(d.downloads)))
      .catch(() => setDownloads(null));
  }, []);
  return downloads;
}

// ─── Platform badges ──────────────────────────────────────────────────────────

const PLATFORMS = [
  { icon: { name: 'smartphone', library: 'Feather' as const }, label: 'iOS' },
  { icon: { name: 'android', library: 'MaterialIcons' as const }, label: 'Android' },
  { icon: { name: 'globe', library: 'Feather' as const }, label: 'Web' },
];

function PlatformBadges({ theme }: { theme: ReturnType<typeof useTheme> }) {
  const { spacing } = theme;
  return (
    <View style={{ flexDirection: 'row', gap: spacing.xl }}>
      {PLATFORMS.map(({ icon, label }) => (
        <View key={label} style={{ alignItems: 'center', gap: spacing.sm }}>
          {renderIcon(icon, icon.library, 30, theme.onSurfaceVariant)}
          <Typography variant="labelLarge" color={theme.onSurfaceVariant}>{label}</Typography>
        </View>
      ))}
    </View>
  );
}

// ─── Hero — narrow ────────────────────────────────────────────────────────────

function HeroNarrow({
  theme,
  isDark,
  toggleTheme,
}: {
  theme: ReturnType<typeof useTheme>;
  isDark: boolean;
  toggleTheme: () => void;
}) {
  const { spacing, borderRadius } = theme;
  const logoSource = isDark
    ? require('../../assets/images/rocket_logo_white.png')
    : require('../../assets/images/rocket_logo_black.png');

  return (
    <SafeAreaView style={{ paddingTop: spacing.xxxl, paddingBottom: spacing.xxl, gap: spacing.xl }}>
      {/* Copy */}
      <View style={[styles.hero, { paddingHorizontal: spacing.xl, gap: spacing.xl }]}>
        <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        <View style={[styles.centered, { gap: spacing.md }]}>
          <View style={[styles.centered, { gap: spacing.xs }]}>
            <Typography variant="displaySmall" weight="bold" align="center">
              NativeCtx UI
            </Typography>
            <Typography variant="headlineSmall" weight="medium" align="center">
              A React Native UI library{'\n'}optimized for LLMs.
            </Typography>
          </View>
          <Typography variant="bodyLarge" align="center" color={theme.onSurfaceVariant}>
            29 Material Design 3 components for iOS, Android, and web — shipped with an MCP server and Claude Skills, so Claude writes against your real props and tokens instead of guessing.
          </Typography>
        </View>
        <PlatformBadges theme={theme} />
        <View style={[styles.ctaRow, { gap: spacing.md }]}>
          <Button title="Get Started" variant="filled" icon={{ name: 'arrow-right' }} onPress={() => router.push('/explore')} />
          <Button title={isDark ? 'Light mode' : 'Dark mode'} variant="outlined" icon={{ name: isDark ? 'sun' : 'moon' }} onPress={toggleTheme} />
        </View>
        <View style={{ width: '100%', maxWidth: 520 }}>
          <CodeBlock variant="shell" code={INSTALL_SNIPPET} />
        </View>
      </View>

      {/* Showcase — two-column card grid clipped at the bottom */}
      <View style={{
        marginHorizontal: spacing.xl,
        backgroundColor: theme.primaryContainer,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        padding: spacing.md,
        gap: spacing.sm,
        maxHeight: 460,
      }}>
        {/* Row 1 */}
        <View style={[styles.row, { gap: spacing.sm }]}>
          <ThemedView variant="surface" elevation={1} style={[styles.demoCard, { borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.md }]}>
            <View style={[styles.row, { alignItems: 'center', gap: spacing.sm }]}>
              <Avatar name="Alex Johnson" size="md" />
              <View style={{ flex: 1 }}>
                <Typography variant="titleSmall" weight="bold">Alex Johnson</Typography>
                <Typography variant="labelSmall" color={theme.onSurfaceVariant}>Product Designer · SF</Typography>
              </View>
            </View>
            <Typography variant="bodySmall" color={theme.onSurfaceVariant}>Building cross-platform apps with M3 design and AI tooling.</Typography>
            <View style={[styles.row, { gap: spacing.xs }]}>
              <Button title="Follow" variant="filled" onPress={() => {}} />
              <Button title="Message" variant="tonal" onPress={() => {}} />
            </View>
          </ThemedView>

          <ThemedView variant="surface" elevation={1} style={[styles.demoCard, { borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.md }]}>
            <Typography variant="titleSmall" weight="bold">Schedule</Typography>
            <SegmentedControl options={[{ label: 'Day', value: 'day' }, { label: 'Week', value: 'week' }, { label: 'Month', value: 'month' }]} value="week" onChange={() => {}} />
            <View style={{ gap: spacing.xs }}>
              <Typography variant="labelMedium" weight="medium">This week</Typography>
              <Typography variant="bodySmall" color={theme.onSurfaceVariant}>Mon 3 – Sun 9 June · 4 events</Typography>
            </View>
            <View style={[styles.row, { gap: spacing.xs, flexWrap: 'wrap' }]}>
              <Chip label="Design" variant="filled" selected onPress={() => {}} />
              <Chip label="Dev" variant="outlined" onPress={() => {}} />
              <Chip label="Review" variant="outlined" onPress={() => {}} />
            </View>
          </ThemedView>
        </View>

        {/* Row 2 */}
        <View style={[styles.row, { gap: spacing.sm }]}>
          <ThemedView variant="primary" style={[styles.demoCard, { borderRadius: borderRadius.md, overflow: 'hidden', gap: spacing.sm }]}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=200&fit=crop' }}
              style={{ width: '100%', height: 100 }}
              resizeMode="cover"
            />
            <View style={{ paddingHorizontal: spacing.sm, paddingBottom: spacing.sm, gap: spacing.sm }}>
              <View style={[styles.row, { alignItems: 'center', gap: spacing.sm }]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Typography variant="titleSmall" weight="bold" color={theme.onPrimary}>Midnight Drive</Typography>
                  <Typography variant="labelSmall" color={theme.onPrimary} style={{ opacity: 0.7 }}>Synthwave · 3:42</Typography>
                </View>
                {renderIcon({ name: 'heart', library: 'Feather' }, 'Feather', 14, theme.onPrimary)}
              </View>
              <View style={[styles.progressTrack, { backgroundColor: theme.onPrimary, borderRadius: borderRadius.full, opacity: 0.3 }]}>
                <View style={[styles.progressFill, { width: '45%', backgroundColor: theme.onPrimary, borderRadius: borderRadius.full, opacity: 1 }]} />
              </View>
              <View style={[styles.row, { justifyContent: 'center', alignItems: 'center', gap: spacing.lg }]}>
                {renderIcon({ name: 'skip-back', library: 'Feather' }, 'Feather', 14, theme.onPrimary)}
                <ThemedView variant="surface" style={{ width: 32, height: 32, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' }}>
                  {renderIcon({ name: 'pause', library: 'Feather' }, 'Feather', 13, theme.primary)}
                </ThemedView>
                {renderIcon({ name: 'skip-forward', library: 'Feather' }, 'Feather', 14, theme.onPrimary)}
              </View>
            </View>
          </ThemedView>

          <ThemedView variant="surface" elevation={1} style={[styles.demoCard, { borderRadius: borderRadius.md, overflow: 'hidden' }]}>
            <Typography variant="titleSmall" weight="bold" style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xs }}>Quick access</Typography>
            {([
              { icon: 'home' as const, label: 'Home', sub: 'Main workspace' },
              { icon: 'briefcase' as const, label: 'Work', sub: '3 active projects' },
              { icon: 'user' as const, label: 'Profile', sub: 'Alex Johnson' },
            ]).map((item) => (
              <ListItem
                key={item.icon}
                title={item.label}
                subtitle={item.sub}
                leading={
                  <ThemedView variant="surfaceContainer" style={{ width: 32, height: 32, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center' }}>
                    {renderIcon({ name: item.icon, library: 'Feather' }, 'Feather', 14, theme.primary)}
                  </ThemedView>
                }
                trailing={renderIcon({ name: 'chevron-right', library: 'Feather' }, 'Feather', 14, theme.outlineVariant)}
                onPress={() => {}}
              />
            ))}
          </ThemedView>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Hero — wide ──────────────────────────────────────────────────────────────

type HeroWideProps = {
  theme: ReturnType<typeof useTheme>;
  isDark: boolean;
  stars: string | null;
  downloads: string | null;
  viewportWidth: number;
  viewportHeight: number;
  containerLeftInset: number;
  toggleTheme: () => void;
};

function HeroWide({
  theme,
  isDark,
  stars,
  downloads,
  viewportWidth,
  viewportHeight,
  containerLeftInset,
  toggleTheme,
}: HeroWideProps) {
  const { spacing, borderRadius } = theme;

  return (
    <View>
      {/* Two-panel row — full width, showcase touches right viewport edge */}
      <View style={[styles.heroWeb, { paddingBottom: spacing.xxl }]}>

        {/* Left copy — left edge matches Container's computed inset */}
        <View style={[styles.heroLeft, { paddingLeft: containerLeftInset, paddingRight: 64, paddingVertical: spacing.xxxl }]}>
          <View style={{ gap: spacing.xl, maxWidth: 420 }}>
            <View style={{ gap: spacing.md }}>
              <View style={{ gap: spacing.xs }}>
                <Typography variant="displayMedium" weight="bold">
                  NativeCtx UI
                </Typography>
                <Typography variant="headlineSmall" weight="medium">
                  A React Native UI library{'\n'}optimized for LLMs.
                </Typography>
              </View>
              <Typography variant="bodyLarge" color={theme.onSurfaceVariant}>
                29 Material Design 3 components for iOS, Android, and web — shipped with an MCP server and Claude Skills, so Claude writes against your real props and tokens instead of guessing.
              </Typography>
            </View>
            <PlatformBadges theme={theme} />
            <View style={[styles.ctaRow, { gap: spacing.md }]}>
              <Button
                title="Get Started"
                variant="filled"
                icon={{ name: 'arrow-right' }}
                onPress={() => router.push('/explore')}
              />
              <Button
                title={isDark ? 'Light mode' : 'Dark mode'}
                variant="outlined"
                icon={{ name: isDark ? 'sun' : 'moon' }}
                onPress={toggleTheme}
              />
            </View>
            <CodeBlock variant="shell" code={INSTALL_SNIPPET} />
          </View>
        </View>

        {/* Right showcase — half viewport height, overflow clipped intentionally */}
        <View style={[styles.heroRight, {
          height: viewportHeight * 0.5,
          paddingTop: spacing.xxl,
          paddingHorizontal: spacing.lg,
          gap: spacing.sm,
          backgroundColor: theme.primaryContainer,
          borderBottomLeftRadius: borderRadius.xl,
          overflow: 'hidden',
        }]}>
          {/* Row 1 */}
          <View style={[styles.row, { gap: spacing.sm }]}>
            <ThemedView variant="surface" elevation={1} style={[styles.demoCard, { borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.md }]}>
              <View style={[styles.row, { alignItems: 'center', gap: spacing.sm }]}>
                <Avatar name="Alex Johnson" size="md" />
                <View style={{ flex: 1 }}>
                  <Typography variant="titleSmall" weight="bold">Alex Johnson</Typography>
                  <Typography variant="labelSmall" color={theme.onSurfaceVariant}>Product Designer · SF</Typography>
                </View>
              </View>
              <Typography variant="bodySmall" color={theme.onSurfaceVariant}>Building cross-platform apps with M3 design and AI tooling.</Typography>
              <View style={[styles.row, { gap: spacing.xs }]}>
                <Button title="Follow" variant="filled" onPress={() => {}} />
                <Button title="Message" variant="tonal" onPress={() => {}} />
              </View>
            </ThemedView>

            <ThemedView variant="surface" elevation={1} style={[styles.demoCard, { borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.md }]}>
              <Typography variant="titleSmall" weight="bold">Schedule</Typography>
              <SegmentedControl options={[{ label: 'Day', value: 'day' }, { label: 'Week', value: 'week' }, { label: 'Month', value: 'month' }]} value="week" onChange={() => {}} />
              <View style={{ gap: spacing.xs }}>
                <Typography variant="labelMedium" weight="medium">This week</Typography>
                <Typography variant="bodySmall" color={theme.onSurfaceVariant}>Mon 3 – Sun 9 June · 4 events</Typography>
              </View>
              <View style={[styles.row, { gap: spacing.xs, flexWrap: 'wrap' }]}>
                <Chip label="Design" variant="filled" selected onPress={() => {}} />
                <Chip label="Dev" variant="outlined" onPress={() => {}} />
                <Chip label="Review" variant="outlined" onPress={() => {}} />
              </View>
            </ThemedView>
          </View>

          {/* Row 2 */}
          <View style={[styles.row, { gap: spacing.sm }]}>
            <ThemedView variant="primary" style={[styles.demoCard, { borderRadius: borderRadius.md, overflow: 'hidden', gap: spacing.sm }]}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=200&fit=crop' }}
                style={{ width: '100%', height: 120 }}
                resizeMode="cover"
              />
              <View style={{ paddingHorizontal: spacing.sm, paddingBottom: spacing.sm, gap: spacing.sm }}>
                <View style={[styles.row, { alignItems: 'center', gap: spacing.sm }]}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Typography variant="titleSmall" weight="bold" color={theme.onPrimary}>Midnight Drive</Typography>
                    <Typography variant="labelSmall" color={theme.onPrimary} style={{ opacity: 0.7 }}>Synthwave · 3:42</Typography>
                  </View>
                  {renderIcon({ name: 'heart', library: 'Feather' }, 'Feather', 15, theme.onPrimary)}
                </View>
                <View style={[styles.progressTrack, { backgroundColor: theme.onPrimary, borderRadius: borderRadius.full, opacity: 0.3 }]}>
                  <View style={[styles.progressFill, { width: '45%', backgroundColor: theme.onPrimary, borderRadius: borderRadius.full, opacity: 1 }]} />
                </View>
                <View style={[styles.row, { justifyContent: 'center', alignItems: 'center', gap: spacing.lg }]}>
                  {renderIcon({ name: 'skip-back', library: 'Feather' }, 'Feather', 16, theme.onPrimary)}
                  <ThemedView variant="surface" style={{ width: 36, height: 36, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' }}>
                    {renderIcon({ name: 'pause', library: 'Feather' }, 'Feather', 15, theme.primary)}
                  </ThemedView>
                  {renderIcon({ name: 'skip-forward', library: 'Feather' }, 'Feather', 16, theme.onPrimary)}
                </View>
              </View>
            </ThemedView>

            <ThemedView variant="surface" elevation={1} style={[styles.demoCard, { borderRadius: borderRadius.md, overflow: 'hidden' }]}>
              <Typography variant="titleSmall" weight="bold" style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xs }}>Quick access</Typography>
              {([
                { icon: 'home' as const, label: 'Home', sub: 'Main workspace' },
                { icon: 'briefcase' as const, label: 'Work', sub: '3 active projects' },
                { icon: 'user' as const, label: 'Profile', sub: 'Alex Johnson' },
              ]).map((item) => (
                <ListItem
                  key={item.icon}
                  title={item.label}
                  subtitle={item.sub}
                  leading={
                    <ThemedView variant="surfaceContainer" style={{ width: 32, height: 32, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center' }}>
                      {renderIcon({ name: item.icon, library: 'Feather' }, 'Feather', 14, theme.primary)}
                    </ThemedView>
                  }
                  trailing={renderIcon({ name: 'chevron-right', library: 'Feather' }, 'Feather', 14, theme.outlineVariant)}
                  onPress={() => {}}
                />
              ))}
            </ThemedView>
          </View>

          {/* Row 3 — intentionally taller than the panel; clipped at bottom */}
          <View style={[styles.row, { gap: spacing.sm }]}>
            <ThemedView variant="surface" elevation={1} style={[styles.demoCard, { borderRadius: borderRadius.md, minHeight: 220, overflow: 'hidden' }]}>
              <ListItem
                title="Notifications"
                leading={renderIcon({ name: 'bell', library: 'Feather' }, 'Feather', 16, theme.primary)}
                trailing={<Switch value onValueChange={() => {}} />}
              />
              <Divider />
              {([
                { icon: 'message-circle' as const, label: 'Messages', value: true },
                { icon: 'refresh-cw' as const, label: 'App updates', value: true },
                { icon: 'clock' as const, label: 'Reminders', value: false },
                { icon: 'tag' as const, label: 'Promotions', value: false },
                { icon: 'star' as const, label: 'Highlights', value: true },
              ]).map((item) => (
                <ListItem
                  key={item.label}
                  title={item.label}
                  leading={renderIcon({ name: item.icon, library: 'Feather' }, 'Feather', 14, theme.onSurfaceVariant)}
                  trailing={<Switch value={item.value} onValueChange={() => {}} />}
                />
              ))}
            </ThemedView>

            <ThemedView variant="primary" style={[styles.demoCard, { borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.md, minHeight: 220 }]}>
              <View style={[styles.row, { alignItems: 'center', gap: spacing.xs }]}>
                {renderIcon({ name: 'activity', library: 'Feather' }, 'Feather', 16, theme.onPrimary)}
                <Typography variant="labelSmall" color={theme.onPrimary}>Performance</Typography>
              </View>
              <View>
                <Typography variant="displaySmall" weight="bold" color={theme.onPrimary}>98.2%</Typography>
                <Typography variant="labelSmall" color={theme.onPrimary} style={{ opacity: 0.7 }}>↑ Uptime this month</Typography>
              </View>
              <View style={[styles.row, { alignItems: 'flex-end', gap: 4, height: 64 }]}>
                {[0.5, 0.7, 0.6, 0.9, 0.75, 1.0, 0.85, 0.95, 0.8, 0.98].map((h, i) => (
                  <View key={i} style={{ flex: 1, height: `${h * 100}%`, backgroundColor: theme.onPrimary, borderRadius: 3, opacity: 0.6 + h * 0.4 }} />
                ))}
              </View>
              <Divider style={{ backgroundColor: theme.onPrimary, opacity: 0.2 }} />
              <View style={{ gap: spacing.xs }}>
                {[{ label: 'Avg response', val: '142ms' }, { label: 'Error rate', val: '0.02%' }, { label: 'Requests/s', val: '2.4k' }].map(s => (
                  <View key={s.label} style={[styles.row, { justifyContent: 'space-between' }]}>
                    <Typography variant="labelSmall" color={theme.onPrimary} style={{ opacity: 0.7 }}>{s.label}</Typography>
                    <Typography variant="labelSmall" weight="bold" color={theme.onPrimary}>{s.val}</Typography>
                  </View>
                ))}
              </View>
            </ThemedView>
          </View>
        </View>
      </View>

      {/* Stats strip */}
      <Container style={{ paddingVertical: spacing.xxxl }}>
        <View style={{ gap: spacing.xl, alignItems: 'center' }}>
          <View style={[styles.statRow, { gap: spacing.xl, flexWrap: 'wrap', justifyContent: 'center' }]}>
            <View style={[styles.statTile, { gap: spacing.xs, alignItems: 'center' }]}>
              <View style={[styles.row, { alignItems: 'center', gap: spacing.sm }]}>
                {renderIcon({ name: 'star', library: 'Feather' }, 'Feather', 26, theme.onSurface)}
                <Typography variant="headlineMedium" weight="bold">{stars ?? '—'}</Typography>
              </View>
              <Typography variant="bodySmall" color={theme.onSurfaceVariant}>GitHub Stars</Typography>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.outlineVariant }]} />
            <View style={[styles.statTile, { gap: spacing.xs, alignItems: 'center' }]}>
              <View style={[styles.row, { alignItems: 'center', gap: spacing.sm }]}>
                {Platform.OS === 'web' ? (
                  <Image source={{ uri: 'https://svgl.app/library/npm.svg' }} style={{ width: 26, height: 26 }} />
                ) : (
                  renderIcon({ name: 'package', library: 'Feather' }, 'Feather', 24, theme.onSurface)
                )}
                <Typography variant="headlineMedium" weight="bold">{downloads ?? '—'}</Typography>
              </View>
              <Typography variant="bodySmall" color={theme.onSurfaceVariant}>Downloads / wk</Typography>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.outlineVariant }]} />
            <View style={[styles.statTile, { gap: spacing.xs, alignItems: 'center' }]}>
              <View style={[styles.row, { alignItems: 'center', gap: spacing.sm }]}>
                {renderIcon({ name: 'box', library: 'Feather' }, 'Feather', 24, theme.onSurface)}
                <Typography variant="headlineMedium" weight="bold">29</Typography>
              </View>
              <Typography variant="bodySmall" color={theme.onSurfaceVariant}>Components</Typography>
            </View>
          </View>
        </View>
      </Container>
    </View>
  );
}

// ─── Feature cards ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    title: 'MCP server + Claude Skills',
    icon: { name: 'zap', library: 'Feather' as const },
    description:
      'Claude calls live tools for props, tokens, and palettes mid-conversation — accurate code from the first prompt.',
    iconAccent: true,
  },
  {
    title: 'Native-first',
    icon: { name: 'cpu', library: 'Feather' as const },
    description:
      'Key components render as real SwiftUI and Jetpack Compose via Expo UI, not JavaScript approximations.',
    iconAccent: false,
  },
  {
    title: 'Material Design 3',
    icon: { name: 'layers', library: 'Feather' as const },
    description:
      'One seed color generates the whole palette — semantic tokens, type scale, elevation, and shape across all 29 components.',
    iconAccent: false,
  },
  {
    title: 'Accessible by default',
    icon: { name: 'eye', library: 'Feather' as const },
    description:
      'ARIA roles, focus management, reduced motion, and screen reader labels on every interactive component.',
    iconAccent: false,
  },
];

// ─── Layout constants ─────────────────────────────────────────────────────────

const CONTAINER_MAX_WIDTH = 1000;
const HERO_BREAKPOINT = 768;

// ─── Home screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const theme = useTheme();
  const { spacing, borderRadius } = theme;
  const { mode, toggleTheme } = useThemeMode();
  const { width: viewportWidth, height: viewportHeight } = useDimensions();
  const isDark = mode === 'dark';
  const stars = useGithubStars();
  const downloads = useNpmDownloads();
  const isWide = viewportWidth >= HERO_BREAKPOINT;

  const containerLeftInset = isWide && viewportWidth > CONTAINER_MAX_WIDTH + spacing.xl * 2
    ? (viewportWidth - CONTAINER_MAX_WIDTH) / 2 + spacing.xl
    : spacing.xl;

  const SECTION_PAD = 96;

  return (
    <Screen scrollable variant="background" edges={['bottom']} padded={false}>

      {/* ── Section 1: Hero + stats ── */}
      {isWide ? (
        <HeroWide
          theme={theme}
          isDark={isDark}
          stars={stars}
          downloads={downloads}
          viewportWidth={viewportWidth}
          viewportHeight={viewportHeight}
          containerLeftInset={containerLeftInset}
          toggleTheme={toggleTheme}
        />
      ) : (
        <HeroNarrow
          theme={theme}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      <View style={{ height: 1, backgroundColor: theme.outlineVariant }} />

      {/* ── Features + Callout (free height) ── */}
      <Container style={{ paddingVertical: SECTION_PAD }}>
        <View style={{ gap: spacing.xxl }}>
          <View style={{ gap: spacing.xl }}>
            <Typography variant="headlineMedium" weight="bold">What&apos;s inside</Typography>
            <ThemedView columns={2} gap={spacing.lg}>
              {FEATURES.map((feature, index) => (
                <ThemedView
                  key={index}
                  variant="card"
                  elevation={1}
                  style={{
                    padding: spacing.lg,
                    gap: spacing.sm,
                    borderRadius: borderRadius.md,
                    borderWidth: 1,
                    borderColor: theme.outlineVariant,
                  }}>
                  <View style={[styles.iconWrap, { backgroundColor: feature.iconAccent ? theme.primaryContainer : theme.surfaceContainerHigh, borderRadius: borderRadius.sm }]}>
                    {renderIcon(feature.icon, 'Feather', 16, feature.iconAccent ? theme.onPrimaryContainer : theme.onSurfaceVariant)}
                  </View>
                  <Typography variant="titleSmall" weight="bold">{feature.title}</Typography>
                  <Typography variant="bodySmall" color={theme.onSurfaceVariant}>{feature.description}</Typography>
                </ThemedView>
              ))}
            </ThemedView>
          </View>

          <ThemedView variant="primary" style={{ borderRadius: borderRadius.lg, padding: spacing.xxl, gap: spacing.md }}>
            <Typography variant="headlineSmall" weight="bold" color={theme.onPrimary}>
              Built with NativeCtx UI
            </Typography>
            <Typography variant="bodyMedium" color={theme.onPrimary}>
              Every component on this page — buttons, cards, navigation, typography — is rendered by the same library you install. What you see is what you ship.
            </Typography>
            <Button title="Explore the components" variant="tonal" icon={{ name: 'arrow-right' }} onPress={() => router.push('/explore')} />
          </ThemedView>
        </View>
      </Container>

      {/* ─────────────────────────────────────────────────────────────────── */}
      <View style={{ height: 1, backgroundColor: theme.outlineVariant }} />

      {/* ── Footer ── */}
      <Container>
        <View style={[styles.footer, { paddingVertical: spacing.xl }]}>
          <Typography variant="bodySmall" color={theme.onSurfaceVariant}>© 2025 NativeCtx UI</Typography>
          <View style={[styles.row, { gap: spacing.lg }]}>
            <Typography variant="bodySmall" color={theme.onSurfaceVariant} onPress={() => Linking.openURL('https://github.com/nativectx/ui')}>GitHub</Typography>
            <Typography variant="bodySmall" color={theme.onSurfaceVariant} onPress={() => Linking.openURL('https://www.npmjs.com/package/@nativectx/ui')}>NPM</Typography>
          </View>
        </View>
      </Container>

    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Mobile hero
  hero: { alignItems: 'center' },
  centered: { alignItems: 'center', maxWidth: 520 },
  logo: { width: 64, height: 64 },
  // Web hero — heroLeft uses dynamic paddingLeft computed inline
  heroWeb: { flexDirection: 'row', alignItems: 'stretch' },
  heroLeft: { width: '50%', justifyContent: 'center' },
  heroRight: { width: '50%' },
  demoCard: { flex: 1, minWidth: 0 },
  progressTrack: { height: 3, width: '100%' },
  progressFill: { height: 3 },
  profileImage: { width: 56, height: 56 },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap' },
  row: { flexDirection: 'row' },
  iconWrap: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statTile: { minWidth: 80 },
  statDivider: { width: 1, height: 56, opacity: 0.4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
