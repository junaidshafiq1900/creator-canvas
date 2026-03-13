import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import VideoCard from '@/components/video/VideoCard';
import { Skeleton } from '@/components/ui/skeleton';
import { VIDEO_CATEGORIES } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 12;

const formatCount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const Videos = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchVideos = useCallback(async (offset = 0, cat: string | null = category, reset = false) => {
    if (offset === 0) setLoading(true);
    else setLoadingMore(true);

    let query = supabase
      .from('videos')
      .select('*, profiles!videos_creator_id_profiles_fkey(username, display_name, avatar_url)')
      .eq('is_disabled', false)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (cat) query = query.eq('category', cat);
    if (search.trim()) query = query.ilike('title', `%${search.trim()}%`);

    const { data } = await query;
    const results = data ?? [];

    if (reset || offset === 0) {
      setVideos(results);
    } else {
      setVideos(prev => [...prev, ...results]);
    }
    setHasMore(results.length === PAGE_SIZE);
    setLoading(false);
    setLoadingMore(false);
  }, [category, search]);

  useEffect(() => {
    fetchVideos(0, category, true);
  }, [category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVideos(0, category, true);
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-6">Explore Videos</h1>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-md">
          <Input
            placeholder="Search videos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button type="submit" size="icon" variant="secondary">
            <Search className="w-4 h-4" />
          </Button>
        </form>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          <Button
            variant={category === null ? 'default' : 'secondary'}
            size="sm"
            className="shrink-0 rounded-full text-xs"
            onClick={() => setCategory(null)}
          >
            All
          </Button>
          {VIDEO_CATEGORIES.map(cat => (
            <Button
              key={cat}
              variant={category === cat ? 'default' : 'secondary'}
              size="sm"
              className="shrink-0 rounded-full text-xs"
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-video rounded-lg" />)}
          </div>
        ) : videos.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">No videos found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {videos.map(v => {
                const p = (v as any).profiles;
                return (
                  <VideoCard
                    key={v.id}
                    id={v.id}
                    title={v.title}
                    thumbnail={v.thumbnail_url}
                    creator={p?.display_name || p?.username || 'Unknown'}
                    views={formatCount(v.views || 0)}
                    date={new Date(v.created_at).toLocaleDateString()}
                    category={v.category}
                  />
                );
              })}
            </div>
            {hasMore && (
              <div className="flex justify-center py-10">
                <Button
                  variant="outline"
                  onClick={() => fetchVideos(videos.length, category)}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Videos;
