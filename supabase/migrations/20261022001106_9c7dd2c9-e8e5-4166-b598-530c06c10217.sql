-- ===== Phase 1: video duration =====
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS duration integer;

-- ===== Phase 2: comment threading + report details =====
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS details text;

-- ===== Phase 2: dislikes =====
CREATE TABLE public.dislikes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, video_id)
);
CREATE INDEX idx_dislikes_video ON public.dislikes(video_id);
GRANT SELECT, INSERT, DELETE ON public.dislikes TO authenticated;
GRANT ALL ON public.dislikes TO service_role;
ALTER TABLE public.dislikes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own dislikes select" ON public.dislikes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own dislike insert" ON public.dislikes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own dislike delete" ON public.dislikes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===== Phase 3: playlists =====
CREATE TABLE public.playlists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  is_private boolean NOT NULL DEFAULT false,
  is_watch_later boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_playlists_user ON public.playlists(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlists TO authenticated;
GRANT ALL ON public.playlists TO service_role;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own playlists manage" ON public.playlists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public playlists read" ON public.playlists FOR SELECT USING (is_private = false);

CREATE TABLE public.playlist_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id uuid NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (playlist_id, video_id)
);
CREATE INDEX idx_playlist_items_playlist ON public.playlist_items(playlist_id);
GRANT SELECT, INSERT, DELETE ON public.playlist_items TO authenticated;
GRANT ALL ON public.playlist_items TO service_role;
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read items of visible playlists" ON public.playlist_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND (p.is_private = false OR p.user_id = auth.uid()))
);
CREATE POLICY "Manage items of own playlists" ON public.playlist_items FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.user_id = auth.uid())
);

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON public.playlists
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();