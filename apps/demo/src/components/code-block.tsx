import { useTheme, renderIcon } from '@nativectx/ui';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';

// ─── Shell variant colours (always dark — terminals are always dark) ───────────
const SHELL_BG = '#0d1117';
const SHELL_PROMPT = '#7d8590';
const SHELL_TEXT = '#e6edf3';
const SHELL_COPY_IDLE = '#7d8590';
const SHELL_COPY_SUCCESS = '#3fb950';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ShellBlockProps {
  variant: 'shell';
  code: string;
}

interface SyntaxBlockProps {
  variant: 'code';
  code: string;
  language?: string;
  filename?: string;
}

type Props = ShellBlockProps | SyntaxBlockProps;

// ─── Component ─────────────────────────────────────────────────────────────────

export function CodeBlock(props: Props) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(props.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Shell ─────────────────────────────────────────────────────────────────
  if (props.variant === 'shell') {
    return (
      <View style={[styles.shellContainer, { borderRadius: theme.borderRadius.md }]}>
        {props.code.split('\n').map((line, i) => (
          <View key={i} style={styles.shellLine}>
            <Text style={styles.shellPrompt}>$</Text>
            <Text style={styles.shellCode}>{line}</Text>
          </View>
        ))}
        <Pressable
          onPress={handleCopy}
          style={({ pressed }) => [styles.shellCopy, { opacity: pressed ? 0.6 : 1 }]}
          accessibilityLabel="Copy to clipboard"
          accessibilityRole="button"
        >
          {renderIcon(
            { name: copied ? 'check' : 'copy', library: 'Feather' },
            'Feather',
            15,
            copied ? SHELL_COPY_SUCCESS : SHELL_COPY_IDLE,
          )}
        </Pressable>
      </View>
    );
  }

  // ─── Code ──────────────────────────────────────────────────────────────────
  const { filename, language = 'tsx' } = props;
  const codeBg = theme.isDark ? '#0d1117' : '#f6f8fa';
  const headerBg = theme.isDark ? '#161b22' : '#eef0f3';
  const borderColor = theme.isDark ? '#30363d' : '#d0d7de';

  return (
    <View style={[styles.codeContainer, { borderRadius: theme.borderRadius.md, borderColor }]}>
      {/* Header — filename + language badge + copy */}
      <View style={[styles.codeHeader, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <View style={styles.codeHeaderLeft}>
          {filename && (
            <Text style={[styles.codeFilename, { color: theme.onSurfaceVariant }]}>
              {filename}
            </Text>
          )}
        </View>
        <View style={styles.codeHeaderRight}>
          <View style={[styles.langBadge, { backgroundColor: theme.isDark ? '#21262d' : '#dce0e5' }]}>
            <Text style={[styles.langText, { color: theme.onSurfaceVariant }]}>{language}</Text>
          </View>
          <Pressable
            onPress={handleCopy}
            style={({ pressed }) => [
              styles.codeCopyButton,
              {
                backgroundColor: pressed ? theme.surfaceContainerHigh : 'transparent',
                borderRadius: theme.borderRadius.sm,
              },
            ]}
            accessibilityLabel="Copy to clipboard"
            accessibilityRole="button"
          >
            {renderIcon(
              { name: copied ? 'check' : 'copy', library: 'Feather' },
              'Feather',
              15,
              copied ? theme.primary : theme.onSurfaceVariant,
            )}
          </Pressable>
        </View>
      </View>

      {/* Code body with syntax highlighting */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: codeBg }}
        contentContainerStyle={styles.codeBody}
      >
        <Highlight
          theme={theme.isDark ? themes.vsDark : themes.github}
          code={props.code.trim()}
          language={language as any}
        >
          {({ tokens, getTokenProps }) => (
            <View>
              {tokens.map((line, i) => (
                <View key={i} style={styles.codeLine}>
                  {Platform.OS === 'web' && (
                    <Text style={[styles.lineNumber, { color: theme.isDark ? '#484f58' : '#c4ccd4' }]}>
                      {String(i + 1).padStart(2, ' ')}
                    </Text>
                  )}
                  {line.map((token, key) => {
                    const { style, children } = getTokenProps({ token });
                    return (
                      <Text
                        key={key}
                        style={{
                          color: (style as { color?: string })?.color ?? (theme.isDark ? '#adbac7' : '#24292f'),
                          fontFamily: 'monospace',
                          fontSize: 13,
                          lineHeight: 22,
                        }}
                      >
                        {children as string}
                      </Text>
                    );
                  })}
                </View>
              ))}
            </View>
          )}
        </Highlight>
      </ScrollView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Shell variant
  shellContainer: {
    backgroundColor: SHELL_BG,
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingRight: 44,
    gap: 6,
    position: 'relative',
  },
  shellLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shellPrompt: {
    color: SHELL_PROMPT,
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 22,
    userSelect: 'none' as any,
  },
  shellCode: {
    color: SHELL_TEXT,
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 22,
    flex: 1,
  },
  shellCopy: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  // Code variant
  codeContainer: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  codeHeaderLeft: {
    flex: 1,
  },
  codeHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeFilename: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  langBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  langText: {
    fontFamily: 'monospace',
    fontSize: 11,
  },
  codeCopyButton: {
    padding: 4,
  },
  codeBody: {
    padding: 16,
  },
  codeLine: {
    flexDirection: 'row',
  },
  lineNumber: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 22,
    marginRight: 20,
    minWidth: 18,
    textAlign: 'right',
    userSelect: 'none' as any,
  },
});
