import { View } from 'react-native';
import { Typography } from '@nativectx/ui';
import { DocsPage } from '../../components/docs-page';
import { DocsPagination } from '../../components/docs-pagination';
import { CodeBlock } from '../../components/code-block';

export default function NavHooksPage() {
  return (
    <DocsPage
      title="Navigation Hooks"
      description="Hooks for controlling the sidebar and checking active routes. Both are provided automatically by NativeCtxProvider."
    >
      <View style={{ gap: 8 }}>
        <Typography variant="titleLarge" weight="bold">useSidebar()</Typography>
        <Typography variant="bodyMedium" muted>
          Controls the sidebar open/close state. The state is managed by NativeCtxProvider&apos;s SidebarProvider — call this hook from any component inside the provider tree.
        </Typography>
        <CodeBlock
          variant="code"
          code={`const { isOpen, open, close, toggle } = useSidebar();

// Wire to AppTabs hamburger
<AppTabs onPrimaryMenuPress={toggle} tabs={tabs} />

// Programmatically close after navigation
const { close } = useSidebar();
const handleNavPress = () => {
  navigateTo('/settings');
  close();
};`}
        />
      </View>

      <View style={{ gap: 8 }}>
        <Typography variant="titleLarge" weight="bold">useRouteNavigation()</Typography>
        <Typography variant="bodyMedium" muted>
          Combines usePathname and useRouter into helpers for sidebar nav items. isActive uses a startsWith match by default — use exact: true for index routes that would otherwise stay highlighted on all sub-pages.
        </Typography>
        <CodeBlock
          variant="code"
          code={`const { isActive, navigateTo, pathname } = useRouteNavigation();

// startsWith match — /items stays active on /items/new
isActive('/items')

// Exact match — only active when pathname is exactly /items
isActive('/items', { exact: true })

navigateTo('/items/new')`}
        />
        <CodeBlock
          variant="code"
          filename="Typical sidebar usage"
          code={`<SidebarItem
  label="Items"
  active={isActive('/items', { exact: true })}
  onPress={() => navigateTo('/items')}
/>
<SidebarItem
  label="New Item"
  active={isActive('/items/new')}
  onPress={() => navigateTo('/items/new')}
/>`}
        />
      </View>

      <DocsPagination />
    </DocsPage>
  );
}
