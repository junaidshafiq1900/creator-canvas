import { Link, useLocation } from 'react-router-dom';
import { Compass, History, Home, ListVideo, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteSkin } from '@/contexts/SiteSkinContext';

const NAV_ITEMS = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Explore', path: '/videos', icon: Compass },
  { label: 'Subscriptions', path: '/subscriptions', icon: Users },
  { label: 'History', path: '/history', icon: History },
  { label: 'Playlists', path: '/playlists', icon: ListVideo },
];

const SiteSidebar = () => {
  const { skin, sidebarExpanded } = useSiteSkin();
  const location = useLocation();

  if (skin !== 'youtube') return null;

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] border-r border-border bg-background/95 backdrop-blur transition-[width] duration-200 md:block',
        sidebarExpanded ? 'w-52' : 'w-16',
      )}
      aria-label="Main navigation"
    >
      <nav className="space-y-1 px-2 py-3">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              title={sidebarExpanded ? undefined : label}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-12 items-center gap-4 rounded-md px-3 text-sm transition-colors',
                active ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                !sidebarExpanded && 'justify-center px-0',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {sidebarExpanded && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default SiteSidebar;