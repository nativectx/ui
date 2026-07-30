# Icon Utilities

Standardized icon rendering utilities for cross-platform React Native applications.

## Overview

The icon utilities provide a consistent way to render icons across iOS, Android, and Web platforms using the `@expo/vector-icons` library.

## Features

- **Platform-agnostic**: Works with any icon library from `@expo/vector-icons`
- **Type-safe**: Full TypeScript support with icon library types
- **Flexible**: Supports both string shorthand and explicit configuration
- **Backward compatible**: Automatically handles legacy string-based icon configs

## Usage

### Basic Example

```tsx
import { renderIcon } from '@nativectx/ui/icons';

function MyComponent() {
  return (
    <View>
      {renderIcon(
        { library: 'Feather', name: 'home' },
        'Feather',
        24,
        '#000000'
      )}
    </View>
  );
}
```

### With AppTabs

```tsx
import { AppTabs } from '@nativectx/ui';

export default function TabLayout() {
  return (
    <AppTabs
      tabs={[
        {
          name: 'index',
          href: '/',
          label: 'Home',
          sfSymbol: { default: 'house', selected: 'house.fill' },
          materialIcon: 'home',
          webIcon: { library: 'Feather', name: 'home' }, // Optional custom web icon
        },
      ]}
    />
  );
}
```

### With Button Component

```tsx
import { Button } from '@nativectx/ui';

function MyScreen() {
  return (
    <Button
      title="Save"
      icon={{ library: 'Feather', name: 'save', size: 20 }}
      onPress={handleSave}
    />
  );
}
```

## API Reference

### `renderIcon()`

Renders an icon component based on library and name.

```tsx
function renderIcon(
  icon: PlatformIcon | string | undefined,
  defaultLibrary?: IconLibrary,
  size?: number,
  color?: string
): React.ReactElement | null
```

**Parameters:**
- `icon` - Icon configuration (PlatformIcon object or string name)
- `defaultLibrary` - Fallback library if not specified (default: `'Feather'`)
- `size` - Icon size in pixels (default: `20`)
- `color` - Icon color (default: theme color)

**Returns:** React element or `null` if icon config is invalid

**Example:**
```tsx
// Using PlatformIcon
renderIcon({ library: 'MaterialIcons', name: 'home' }, 'Feather', 24, '#000')

// Using string (assumes default library)
renderIcon('home', 'Feather', 24, '#000')
```

### `normalizeIcon()`

Normalizes icon configuration to a consistent format.

```tsx
function normalizeIcon(
  icon: PlatformIcon | string | undefined,
  defaultLibrary?: IconLibrary
): { library: IconLibraryType; name: string } | null
```

**Parameters:**
- `icon` - Icon configuration to normalize
- `defaultLibrary` - Fallback library (default: `'Feather'`)

**Returns:** Normalized icon config or `null` if invalid

**Example:**
```tsx
// String format (backward compatible)
normalizeIcon('home', 'Feather')
// Returns: { library: 'Feather', name: 'home' }

// PlatformIcon format
normalizeIcon({ library: 'MaterialIcons', name: 'home' })
// Returns: { library: 'MaterialIcons', name: 'home' }
```

### `getFeatherIconName()`

Extracts Feather icon name for components that specifically need Feather icons.

```tsx
function getFeatherIconName(
  icon: PlatformIcon | string | undefined,
  defaultLibrary?: IconLibrary
): string
```

**Parameters:**
- `icon` - Icon configuration
- `defaultLibrary` - Fallback library (default: `'Feather'`)

**Returns:** Feather icon name or `'circle'` as fallback

**Example:**
```tsx
getFeatherIconName('home') // Returns: 'home'
getFeatherIconName({ library: 'Feather', name: 'home' }) // Returns: 'home'
getFeatherIconName({ library: 'MaterialIcons', name: 'home' }) // Returns: 'circle' (fallback)
```

## Types

### `PlatformIcon`

```tsx
interface PlatformIcon {
  library?: IconLibrary;
  name: string;
}
```

### `IconLibrary`

```tsx
type IconLibrary =
  | 'Feather'
  | 'MaterialIcons'
  | 'Ionicons'
  | 'FontAwesome'
  | 'AntDesign'
  | 'Entypo'
  | 'EvilIcons'
  | 'Foundation'
  | 'MaterialCommunityIcons'
  | 'Octicons'
  | 'SimpleLineIcons'
  | 'Zocial';
```

## Icon Libraries

All libraries from `@expo/vector-icons` are supported:

- **Feather** - Clean, minimalist icons (default)
- **MaterialIcons** - Google Material Design icons
- **MaterialCommunityIcons** - Extended Material Design icons
- **Ionicons** - iOS and Material Design style icons
- **FontAwesome** - Popular icon font
- **AntDesign** - Ant Design icon library
- **Entypo** - Pictogram suite
- **EvilIcons** - Simple icon set
- **Foundation** - Zurb Foundation icons
- **Octicons** - GitHub's icon font
- **SimpleLineIcons** - Simple line icons
- **Zocial** - Social media icons

## Finding Icon Names

- **Feather**: [feathericons.com](https://feathericons.com/)
- **Material Icons**: [fonts.google.com/icons](https://fonts.google.com/icons)
- **Material Community Icons**: [materialdesignicons.com](https://materialdesignicons.com/)
- **Ionicons**: [ionic.io/ionicons](https://ionic.io/ionicons)
- **FontAwesome**: [fontawesome.com/icons](https://fontawesome.com/icons)
- **All @expo/vector-icons**: [icons.expo.fyi](https://icons.expo.fyi)

## Platform-Specific Icons

### iOS (SF Symbols)
iOS native tabs use SF Symbols, which are configured separately:

```tsx
{
  sfSymbol: { default: 'house', selected: 'house.fill' }
}
```

Find SF Symbols: [developer.apple.com/sf-symbols](https://developer.apple.com/sf-symbols/)

### Android (Material Icons)
Android native tabs use Material Design icons:

```tsx
{
  materialIcon: 'home' // Uses MaterialIcons library
}
```

### Web (Flexible)
Web can use any icon library via `webIcon`:

```tsx
{
  webIcon: { library: 'Feather', name: 'home' }
}
```

If `webIcon` is not provided, it falls back to `materialIcon`.

## Best Practices

✅ **Do:**
- Use consistent icon libraries across your app
- Provide explicit library names for clarity
- Use Material icons for Android
- Use SF Symbols for iOS native components
- Set appropriate icon sizes (16-32px)

❌ **Don't:**
- Mix multiple icon libraries unnecessarily
- Use invalid icon names
- Forget to install `@expo/vector-icons`
- Hardcode icon colors (use theme colors)

## Troubleshooting

### Icons Not Displaying

**Issue:** Icons show as empty boxes

**Solution:** Ensure `@expo/vector-icons` is installed:
```bash
npx expo install @expo/vector-icons
```

### Invalid Icon Name

**Issue:** Console warning about invalid icon

**Solution:** Verify icon name exists in the library:
- Check [icons.expo.fyi](https://icons.expo.fyi)
- Ensure correct library is specified
- Use fallback icons for safety

### Type Errors

**Issue:** TypeScript complains about icon types

**Solution:** Import types correctly:
```tsx
import { type PlatformIcon, type IconLibrary } from '@nativectx/ui/icons';
```

## Examples

### Simple Icon

```tsx
import { renderIcon } from '@nativectx/ui/icons';

renderIcon('home', 'Feather', 24, '#000000')
```

### Custom Library

```tsx
renderIcon(
  { library: 'MaterialCommunityIcons', name: 'home-outline' },
  'Feather',
  24,
  '#000000'
)
```

### With Theme Colors

```tsx
import { useTheme } from '@nativectx/ui';
import { renderIcon } from '@nativectx/ui/icons';

function ThemedIcon() {
  const theme = useTheme();

  return renderIcon(
    { library: 'Feather', name: 'settings' },
    'Feather',
    24,
    theme.primary
  );
}
```

### Conditional Icons

```tsx
import { renderIcon } from '@nativectx/ui/icons';

function StatusIcon({ isActive }: { isActive: boolean }) {
  return renderIcon(
    {
      library: 'Feather',
      name: isActive ? 'check-circle' : 'circle'
    },
    'Feather',
    20,
    isActive ? '#00FF00' : '#999999'
  );
}
```
