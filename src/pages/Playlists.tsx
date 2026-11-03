import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDuration } from '@/lib/format';
import { ListVideo, Lock, Globe, Clock, User, Plus } from 'lucide-react';

const db = supabase as any;

const Playlists = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mine, setMine] = useState<any[]>([]);
  const [publicOnes, setPublicOnes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: minePls } = user
        ? await db.from('playlists').select('*, playlist_items(count)').eq('user_id', user.id).order('is_watch_later', { ascending: false }).order('updated_at', { ascending: false })
        : { data: [] };
      const { data: publicPls } = await db
        .from('playlists')
        .select('*, playlist_items(count), profiles:user_id(username, display_name, avatar_url)')
        .eq('is_private', false)
        .order('updated_at', { ascending: false })
        .limit(24);

      setMine((minePls ?? []).filter((p: any) => p.is_watch_later || p.playlist_items?.length > 0 || true));
      setPublicOnes(publicPls ?? []);
      setLoading(false);
    })();
  }, [user]);

  const PlaylistCard = ({ p, showOwner = false }: { p: any; showOwner?: boolean }) => {
    const itemCount = p.playlist_items?.[0]?.count ?? 0;
    return (
      <Link to={`/playlist/${p.id}`} className="group block rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors">
        <div className="h-24 bg-secondary flex items-center justify-center relative">
          <ListVideo className={`w-8 h-8 transition-colors ${i_am_primary(p) ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-background/85 text-foreground">
            {itemCount} {itemCount === 1 ? 'video' : 'videos'}
          </span>
        </div>
        <div className="p-3">
          <p className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
            {p.is_watch_later && <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
            {p.is_private ? <Lock className="w-3 h-3 text-muted-foreground shrink-0" /> : <Globe className="w-3 h-3 text-muted-foreground shrink-0" />}
            {p.title}
          </p>
          {showOwner && p.profiles && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{p.profiles.display_name || p.profiles.username}</p>
          )}
        </div>
      </Link>
    );
  };

  const i_am_primary = (_p: any) => false;

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ListVideo className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Playlists</h1>
          </div>
          {user && (
            <Button size="sm" variant="outline" onClick={() => navigate('/watch/new')}>
              <Plus className="w-4 h-4 mr-1" /> New playlist
            </Button>
          )}
        </div>

        {user && (
          <section className="mb-10">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Your playlists</h2>
            {mine.length === 0 ? (
              <div className="text-center py-10 rounded-xl border border-dashed border-border text-muted-foreground">
                <ListVideo className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm mb-4">You haven't saved any playlists yet.</p>
                <Button onClick={() => navigate('/videos')}>Find videos to save</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mine.map(p => <PlaylistCard key={p.id} p={p} />)}
              </div>
            )}
          </section>
        )}

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Public playlists</h2>
          {publicOnes.length === 0 ? (
            <div className="text-center py-10 rounded-xl border border-dashed border-border text-muted-foreground">
              <User className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No public playlists from the community yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {publicOnes.map(p => <PlaylistCard key={p.id} p={p} showOwner />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Playlists;
