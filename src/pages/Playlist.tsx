import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatCount, formatDuration } from '@/lib/format';
import { ListVideo, Lock, Globe, Play, User } from 'lucide-react';

const db = supabase as any;

const Playlist = () => {
  const { id } = useParams();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [playlist, setPlaylist] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: pl } = await db.from('playlists').select('*, profiles:user_id(username, display_name, avatar_url)').eq('id', id).maybeSingle();
      if (!pl) { setLoading(false); return; }
      const { data: its } = await db
        .from('playlist_items')
        .select('*, videos(*, profiles:creator_id(username, display_name))')
        .eq('playlist_id', id)
        .order('position', { ascending: true })
        .order('added_at', { ascending: true });
      setPlaylist(pl);
      setItems((its ?? []).filter((i: any) => i.videos));
      setLoading(false);
    })();
  }, [id]);

  const activeVideo = items[activeIndex]?.videos;

  const advance = useCallback(() => {
    setActiveIndex(i => {
      if (i + 1 < items.length) return i + 1;
      return i;
    });
  }, [items.length]);

  // Native player: advance on end
  const handleEnded = () => advance();

  // Vimeo bridge
  useEffect(() => {
    if (!activeVideo) return;
    const isVimeo = activeVideo.storage_provider === 'vimeo' || !!activeVideo.provider_video_id || /vimeo\.com/.test(activeVideo.video_url || '');
    if (!isVimeo) return;
    const attach = () => {
      try {
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ method: 'addEventListener', value: 'ended' }), 'https://player.vimeo.com');
      } catch { /* not ready */ }
    };
    attach();
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== 'https://player.vimeo.com') return;
      let data: any = e.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch { return; }
      }
      const ev = data?.event ?? data?.data?.event;
      if (ev === 'ready') attach();
      if (ev === 'ended') advance();
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [activeVideo, advance]);

  const totalSeconds = items.reduce((acc, i) => acc + (i.videos?.duration || 0), 0);
  const ownerName = playlist?.profiles?.display_name || playlist?.profiles?.username || 'Creator';

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="aspect-video rounded-xl" />
            <Skeleton className="h-8 w-2/3" />
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <ListVideo className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Playlist unavailable</h1>
          <p className="text-muted-foreground mb-6">This playlist doesn't exist or is private.</p>
          <Button asChild variant="outline"><Link to="/">Back to Home</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary mb-4">
              {activeVideo ? (
                activeVideo.storage_provider === 'vimeo' || activeVideo.provider_video_id || /vimeo\.com/.test(activeVideo.video_url || '') ? (
                  <iframe
                    ref={iframeRef}
                    src={`https://player.vimeo.com/video/${String(activeVideo.provider_video_id || activeVideo.video_url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1] || '')}?title=0&byline=0&portrait=0`}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    title={activeVideo.title}
                  />
                ) : (
                  <video
                    ref={videoRef}
                    key={activeVideo.id}
                    src={activeVideo.video_url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain bg-black"
                    poster={activeVideo.thumbnail_url || undefined}
                    onEnded={handleEnded}
                  />
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">This playlist is empty.</p>
                </div>
              )}
            </div>

            <h1 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
              {playlist.title}
              {playlist.is_private
                ? <Lock className="w-4 h-4 text-muted-foreground" />
                : <Globe className="w-4 h-4 text-muted-foreground" />}
            </h1>
            <p className="text-sm text-muted-foreground mb-4">
              Playlist by {ownerName} • {items.length} {items.length === 1 ? 'video' : 'videos'}
              {totalSeconds > 0 && <> • {formatDuration(totalSeconds)} total</>}
            </p>
            {playlist.description && (
              <div className="bg-card rounded-lg p-4 mb-4 border border-border">
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{playlist.description}</p>
              </div>
            )}
          </div>

          {/* Queue sidebar */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
              <ListVideo className="w-4 h-4 text-primary" /> Queue
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {items.map((item, i) => {
                const v = item.videos;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveIndex(i)}
                    className={`w-full flex gap-3 p-2 rounded-lg text-left transition-colors ${
                      i === activeIndex ? 'bg-primary/10 border border-primary/30' : 'hover:bg-secondary/50 border border-transparent'
                    }`}
                  >
                    <span className={`w-6 text-xs font-semibold flex items-center justify-center shrink-0 ${i === activeIndex ? 'text-primary' : 'text-muted-foreground'}`}>
                      {i === activeIndex ? <Play className="w-3 h-3" /> : i + 1}
                    </span>
                    <div className="relative w-24 aspect-video rounded overflow-hidden bg-secondary shrink-0">
                      {v.thumbnail_url && <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover" />}
                      {v.duration && formatDuration(v.duration) && (
                        <span className="absolute bottom-1 right-1 px-1 rounded text-[9px] font-semibold bg-background/85 text-foreground">
                          {formatDuration(v.duration)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium line-clamp-2 ${i === activeIndex ? 'text-primary' : 'text-foreground'}`}>{v.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <User className="w-2.5 h-2.5" />
                        {v.profiles?.display_name || v.profiles?.username || 'Unknown'}
                        {` • ${formatCount(v.views || 0)} views`}
                      </p>
                    </div>
                  </button>
                );
              })}
              {items.length === 0 && <p className="text-sm text-muted-foreground py-4">No videos in this playlist yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playlist;
