import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ListPlus, Lock, Globe, Clock, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const db = supabase as any;

interface SaveToPlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
}

const SaveToPlaylistModal = ({ open, onOpenChange, videoId }: SaveToPlaylistModalProps) => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [inPlaylists, setInPlaylists] = useState<Set<string>>(new Set());
  const [newTitle, setNewTitle] = useState('');
  const [newPrivate, setNewPrivate] = useState(true);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !user || !videoId) return;
    (async () => {
      setLoading(true);
      // Ensure the default "Watch Later" playlist exists
      const { data: wl } = await db.from('playlists').select('id').eq('user_id', user.id).eq('is_watch_later', true).maybeSingle();
      if (!wl) {
        await db.from('playlists').insert({ user_id: user.id, title: 'Watch Later', is_watch_later: true, is_private: true });
      }
      const [{ data: pls }, { data: items }] = await Promise.all([
        db.from('playlists').select('*').eq('user_id', user.id).order('is_watch_later', { ascending: false }).order('created_at', { ascending: true }),
        db.from('playlist_items').select('playlist_id').eq('video_id', videoId),
      ]);
      setPlaylists(pls ?? []);
      setInPlaylists(new Set((items ?? []).map((i: any) => i.playlist_id)));
      setLoading(false);
    })();
  }, [open, user, videoId]);

  const toggle = async (playlistId: string) => {
    if (inPlaylists.has(playlistId)) {
      await db.from('playlist_items').delete().eq('playlist_id', playlistId).eq('video_id', videoId);
      setInPlaylists(prev => {
        const n = new Set(prev);
        n.delete(playlistId);
        return n;
      });
    } else {
      const { count } = await db.from('playlist_items').select('*', { count: 'exact', head: true }).eq('playlist_id', playlistId);
      const { error } = await db.from('playlist_items').insert({ playlist_id: playlistId, video_id: videoId, position: count ?? 0 });
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      setInPlaylists(prev => new Set(prev).add(playlistId));
      toast({ title: 'Saved to playlist' });
    }
  };

  const create = async () => {
    if (!user || !newTitle.trim()) return;
    setCreating(true);
    const { data, error } = await db
      .from('playlists')
      .insert({ user_id: user.id, title: newTitle.trim(), is_private: newPrivate })
      .select('*')
      .single();
    setCreating(false);
    if (error || !data) {
      toast({ title: 'Error', description: error?.message ?? 'Could not create playlist', variant: 'destructive' });
      return;
    }
    setPlaylists(prev => [...prev, data]);
    setNewTitle('');
    await toggle(data.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListPlus className="w-4 h-4 text-primary" /> Save to playlist
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {playlists.map(p => (
              <label
                key={p.id}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[hsl(var(--primary))]"
                  checked={inPlaylists.has(p.id)}
                  onChange={() => toggle(p.id)}
                />
                {p.is_watch_later && <Clock className="w-4 h-4 text-muted-foreground shrink-0" />}
                <span className="text-sm text-foreground flex-1 truncate">{p.title}</span>
                {p.is_private ? (
                  <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                )}
              </label>
            ))}
            {playlists.length === 0 && <p className="text-sm text-muted-foreground py-2">No playlists yet.</p>}
          </div>
        )}

        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex gap-2">
            <Input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="New playlist name"
              maxLength={100}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); create(); } }}
            />
            <Button size="icon" variant="secondary" disabled={!newTitle.trim() || creating} onClick={create} aria-label="Create playlist">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Keep private</Label>
            <Switch checked={newPrivate} onCheckedChange={setNewPrivate} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveToPlaylistModal;
