import { Link, useLocation } from 'react-router-dom';
import { CirclePlus, Compass, History, Home, ListVideo, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteSkin } from '@/contexts/SiteSkinContext';

const NAV_ITEMS = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Explore', path: '/videos', icon: Compass },
  { label: 'Subscriptions', path: '/subscriptions', icon: Users },
  { label: 'History', path: '/history', icon: History },
  { label: 'Playlists', path: '/playlists', icon: ListVideo },
];

const MOBILE_ITEMS = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Explore', path: '/videos', icon: Compass },
  { label: 'Upload', path: '/upload', icon: CirclePlus },
  { label: 'Subscriptions', path: '/subscriptions', icon: Users },
  { label: 'Library', path: '/history', icon: History },
];

const SiteSidebar = () => {
  const { skin, sidebarExpanded } = useSiteSkin();
  const location = useLocation();

  if (skin !== 'youtube') return null;

  return (
    <>
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

      {sidebarExpanded && (
        <>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={toggleSidebar}
            className="fixed inset-x-0 top-16 bottom-16 z-[60] bg-foreground/20 md:hidden"
          />
          <aside className="fixed left-0 top-16 bottom-16 z-[70] w-64 border-r border-border bg-background shadow-xl md:hidden" aria-label="Mobile navigation">
            <nav className="space-y-1 px-3 py-3">
              {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
                const active = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={toggleSidebar}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-12 items-center gap-4 rounded-md px-3 text-sm transition-colors',
                      active ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-50 grid h-[calc(4rem+env(safe-area-inset-bottom))] grid-cols-5 border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Mobile navigation"
      >
        {MOBILE_ITEMS.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path || (path === '/history' && location.pathname === '/profile');
          return (
            <Link
              key={path}
              to={path}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] leading-none transition-colors',
                active ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {label === 'Upload' ? (
                <span className="flex h-8 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default SiteSidebar;