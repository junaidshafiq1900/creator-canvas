import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_SITE_SKIN, parseSiteSkin, type SiteSkin } from '@/lib/site-skin';

interface SiteSkinContextValue {
  skin: SiteSkin;
  saving: boolean;
  sidebarExpanded: boolean;
  saveSkin: (nextSkin: SiteSkin, userId: string) => Promise<boolean>;
  toggleSidebar: () => void;
}

const SiteSkinContext = createContext<SiteSkinContextValue | null>(null);

export function SiteSkinProvider({ children }: { children: React.ReactNode }) {
  const [skin, setSkinState] = useState<SiteSkin>(DEFAULT_SITE_SKIN);
  const [saving, setSaving] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.siteSkin = skin;
  }, [skin]);

  useEffect(() => {
    let active = true;
    supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'active_skin')
      .maybeSingle()
      .then(({ data }) => {
        if (active && data) setSkinState(parseSiteSkin(data.value));
      });

    return () => {
      active = false;
    };
  }, []);

  const saveSkin = useCallback(async (nextSkin: SiteSkin, userId: string) => {
    setSaving(true);
    const { error } = await supabase.from('platform_settings').upsert(
      { key: 'active_skin', value: { skin: nextSkin }, updated_by: userId },
      { onConflict: 'key' },
    );
    setSaving(false);

    if (error) return false;
    setSkinState(nextSkin);
    return true;
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded(current => !current);
  }, []);

  const value = useMemo(() => ({ skin, saving, sidebarExpanded, saveSkin, toggleSidebar }), [
    skin,
    saving,
    sidebarExpanded,
    saveSkin,
    toggleSidebar,
  ]);

  return <SiteSkinContext.Provider value={value}>{children}</SiteSkinContext.Provider>;
}

export function useSiteSkin() {
  const context = useContext(SiteSkinContext);
  if (!context) throw new Error('useSiteSkin must be used within SiteSkinProvider');
  return context;
}