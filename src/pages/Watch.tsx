import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import VideoCard from '@/components/video/VideoCard';
import AdSlot from '@/components/ads/AdSlot';
import ShareModal from '@/components/video/ShareModal';
import ReportModal from '@/components/video/ReportModal';
import SaveToPlaylistModal from '@/components/video/SaveToPlaylistModal';
import VideoEditModal from '@/components/video/VideoEditModal';
import { formatCount, formatDuration } from '@/lib/format';
import { ThumbsUp, ThumbsDown, Share2, Eye, Calendar, MessageSquare, User, Send, Film, UserPlus, UserCheck, BookmarkPlus, Pencil, Flag, Reply, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { sendNotification } from '@/hooks/useNotifications';

const db = supabase as any;

interface CommentRow {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles?: any;
}

const Watch = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasAccess } = useAdminRole();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [video, setVideo] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  // Modals
  const [shareOpen, setShareOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'video' | 'comment'; id: string } | null>(null);

  // Autoplay / Up Next
  const [autoplay, setAutoplay] = useState(() => localStorage.getItem('joule_autoplay') === 'true');
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => { localStorage.setItem('joule_autoplay', String(autoplay)); }, [autoplay]);

  const isVimeo = useMemo(() => {
    if (!video) return false;
    return video.storage_provider === 'vimeo' || !!video.provider_video_id || /vimeo\.com/.test(video.video_url || '');
  }, [video]);

  const vimeoId = useMemo(() => {
    if (!video) return null;
    if (video.provider_video_id) return String(video.provider_video_id).replace(/^\/videos\//, '');
    const m = /vimeo\.com\/(?:video\/)?(\d+)/.exec(video.video_url || '');
    return m ? m[1] : null;
  }, [video]);

  const tParam = useMemo(() => {
    const t = searchParams.get('t');
    const n = t ? parseInt(t, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [searchParams]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const { data: vid } = await supabase.from('videos').select('*').eq('id', id).maybeSingle();
      if (!vid) { setLoading(false); return; }
      setVideo(vid);

      const [
        { data: prof },
        { data: cmts },
        { count: likes },
        { data: suggestedVids },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', vid.creator_id).maybeSingle(),
        db.from('comments').select('*, profiles:user_id(id, username, display_name, avatar_url)').eq('video_id', id).order('created_at', { ascending: true }).limit(200),
        supabase.from('likes').select('*', { count: 'exact', head: true }).eq('video_id', id),
        supabase.from('videos').select('*, profiles:creator_id(username, display_name)').neq('id', id).eq('is_disabled', false).eq('visibility', 'public').order('views', { ascending: false }).limit(8),
      ]);

      setCreator(prof);
      setComments((cmts ?? []) as CommentRow[]);
      setLikeCount(likes ?? 0);
      setSuggested(suggestedVids ?? []);

      if (user) {
        const [{ data: myLike }, { data: myDislike }, { data: mySub }] = await Promise.all([
          supabase.from('likes').select('id').eq('video_id', id).eq('user_id', user.id).maybeSingle(),
          db.from('dislikes').select('id').eq('video_id', id).eq('user_id', user.id).maybeSingle(),
          supabase.from('subscriptions').select('id').eq('follower_id', user.id).eq('creator_id', vid.creator_id).maybeSingle(),
        ]);
        setLiked(!!myLike);
        setDisliked(!!myDislike);
        setSubscribed(!!mySub);

        await supabase.from('watch_history').upsert(
          { user_id: user.id, video_id: id, watched_at: new Date().toISOString() },
          { onConflict: 'user_id,video_id' }
        );
      }

      await supabase.from('videos').update({ views: (vid.views || 0) + 1 }).eq('id', id);
      setLoading(false);
    };
    load();
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setCountdown(null);
    };
  }, [id, user]);

  // Seek to ?t= on native player
  const handleLoadedMetadata = () => {
    if (tParam && videoRef.current) videoRef.current.currentTime = tParam;
  };

  const handleEnded = useCallback(() => {
    if (!autoplay || suggested.length === 0) return;
    setCountdown(5);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown(c => {
        if (c === null) { if (countdownRef.current) clearInterval(countdownRef.current); return null; }
        if (c <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          navigate(`/watch/${suggested[0].id}`);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, [autoplay, suggested, navigate]);

  const cancelCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(null);
  };

  // Vimeo iframe event bridge
  useEffect(() => {
    if (!isVimeo) return;
    const attach = () => {
      try {
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ method: 'addEventListener', value: 'ended' }), 'https://player.vimeo.com');
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ method: 'addEventListener', value: 'timeupdate' }), 'https://player.vimeo.com');
      } catch { /* iframe not ready */ }
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
      if (ev === 'ended') handleEnded();
      if (ev === 'timeupdate') {
        const secs = data?.data?.seconds ?? data?.data?.currentTime;
        if (typeof secs === 'number') setCurrentTime(secs);
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [isVimeo, video?.id, handleEnded]);

  // Dynamic social preview meta
  useEffect(() => {
    if (!video) return;
    const prevTitle = document.title;
    document.title = `${video.title} — Joulecorp`;
    const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setMeta('property', 'og:title', video.title);
    setMeta('property', 'og:description', (video.description || '').slice(0, 200));
    setMeta('property', 'og:type', 'video.other');
    if (video.thumbnail_url) setMeta('property', 'og:image', video.thumbnail_url);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', video.title);
    setMeta('name', 'twitter:description', (video.description || '').slice(0, 200));
    if (video.thumbnail_url) setMeta('name', 'twitter:image', video.thumbnail_url);
    return () => { document.title = prevTitle; };
  }, [video]);

  const toggleLike = async () => {
    if (!user || !id) return;
    if (liked) {
      await supabase.from('likes').delete().eq('video_id', id).eq('user_id', user.id);
      setLiked(false);
      setLikeCount(c => c - 1);
    } else {
      await supabase.from('likes').insert({ video_id: id, user_id: user.id });
      setLiked(true);
      setLikeCount(c => c + 1);
      if (disliked) {
        await db.from('dislikes').delete().eq('video_id', id).eq('user_id', user.id);
        setDisliked(false);
      }
      if (video?.creator_id) {
        sendNotification(user.id, video.creator_id, 'like_video', id, 'video', 'liked your video');
      }
    }
  };

  const toggleDislike = async () => {
    if (!user || !id) return;
    if (disliked) {
      await db.from('dislikes').delete().eq('video_id', id).eq('user_id', user.id);
      setDisliked(false);
    } else {
      await db.from('dislikes').insert({ video_id: id, user_id: user.id });
      setDisliked(true);
      if (liked) {
        await supabase.from('likes').delete().eq('video_id', id).eq('user_id', user.id);
        setLiked(false);
        setLikeCount(c => c - 1);
      }
    }
  };

  const postComment = async () => {
    if (!user || !id || !comment.trim()) return;
    setPosting(true);
    const { data, error } = await db.from('comments').insert({ video_id: id, user_id: user.id, content: comment.trim() }).select('*, profiles:user_id(id, username, display_name, avatar_url)').single();
    setPosting(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setComments(prev => [...prev, data as CommentRow]);
      setComment('');
      if (video?.creator_id) {
        sendNotification(user.id, video.creator_id, 'comment_video', id, 'video', 'commented on your video');
      }
    }
  };

  const postReply = async (parentId: string) => {
    if (!user || !id || !replyText.trim()) return;
    setPosting(true);
    const { data, error } = await db.from('comments').insert({ video_id: id, user_id: user.id, content: replyText.trim(), parent_id: parentId }).select('*, profiles:user_id(id, username, display_name, avatar_url)').single();
    setPosting(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setComments(prev => [...prev, data as CommentRow]);
      setReplyText('');
      setReplyTo(null);
      setExpanded(prev => new Set(prev).add(parentId));
      const parent = comments.find(c => c.id === parentId);
      if (parent && parent.user_id !== user.id) {
        sendNotification(user.id, parent.user_id, 'comment_video', id, 'video', 'replied to your comment');
      }
    }
  };

  const toggleReplies = (cid: string) => {
    setExpanded(prev => {
      const n = new Set(prev);
      if (n.has(cid)) n.delete(cid); else n.add(cid);
      return n;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="aspect-video rounded-xl" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <Film className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Video not found</h1>
          <Button asChild variant="outline"><Link to="/">Back to Home</Link></Button>
        </div>
      </div>
    );
  }

  const canManage = user && (user.id === video.creator_id || hasAccess);
  const nextVideo = suggested[0];

  const renderComment = (c: CommentRow, depth = 0) => {
    const prof = c.profiles;
    const replies = comments.filter(r => r.parent_id === c.id);
    const isExpanded = expanded.has(c.id);
    return (
      <div key={c.id} className={depth > 0 ? 'ml-10 border-l border-border pl-4' : ''}>
        <div className="flex gap-3 py-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
            {prof?.avatar_url ? (
              <img src={prof.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <span className="text-foreground text-xs font-semibold">{prof?.display_name?.[0] || prof?.username?.[0] || '?'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-foreground">{prof?.display_name || prof?.username || 'User'}</span>
              <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{c.content}</p>
            <div className="flex items-center gap-3 mt-1.5">
              {user && (
                <button
                  onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); setReplyText(''); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Reply className="w-3 h-3" /> Reply
                </button>
              )}
              {user && (
                <button
                  onClick={() => setReportTarget({ type: 'comment', id: c.id })}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Report comment"
                >
                  <Flag className="w-3 h-3" /> Report
                </button>
              )}
            </div>

            {replyTo === c.id && (
              <div className="flex gap-2 mt-2">
                <Textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`Reply to ${prof?.display_name || prof?.username || 'comment'}...`}
                  rows={2}
                  maxLength={1000}
                />
                <Button size="sm" disabled={!replyText.trim() || posting} onClick={() => postReply(c.id)}>
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            )}

            {replies.length > 0 && (
              <button
                onClick={() => toggleReplies(c.id)}
                className="flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {isExpanded ? 'Hide replies' : `View ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
              </button>
            )}
            {isExpanded && replies.map(r => renderComment(r, depth + 1))}
          </div>
        </div>
      </div>
    );
  };

  const topLevel = comments.filter(c => !c.parent_id);

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary mb-4">
              {isVimeo && vimeoId ? (
                <iframe
                  ref={iframeRef}
                  src={`https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0${tParam ? `#t=${tParam}s` : ''}`}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  title={video.title}
                />
              ) : video.video_url ? (
                <video
                  ref={videoRef}
                  src={video.video_url}
                  controls
                  className="w-full h-full object-contain bg-black"
                  poster={video.thumbnail_url || undefined}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)}
                  onEnded={handleEnded}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                  <p className="text-muted-foreground text-sm">Video unavailable</p>
                </div>
              )}

              {/* Up Next countdown overlay */}
              {countdown !== null && nextVideo && (
                <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-background/90 backdrop-blur border border-border p-3 flex items-center gap-3 shadow-lg">
                  <Play className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Up next in {countdown}s</p>
                    <p className="text-sm font-medium text-foreground truncate">{nextVideo.title}</p>
                  </div>
                  <Button size="sm" onClick={() => navigate(`/watch/${nextVideo.id}`)}>Play now</Button>
                  <Button size="sm" variant="ghost" onClick={cancelCountdown}>Cancel</Button>
                </div>
              )}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <h1 className="text-xl font-bold text-foreground mb-2">{video.title}</h1>

              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {formatCount(video.views || 0)} views</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(video.created_at).toLocaleDateString()}</span>
                {video.category && <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">{video.category}</span>}
              </div>

              <div className="flex items-center justify-between gap-4 py-3 border-y border-border mb-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <Link to={`/channel/${creator?.username || ''}`} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                      {creator?.avatar_url ? (
                        <img src={creator.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <p className="font-semibold text-foreground text-sm">{creator?.display_name || creator?.username || 'Unknown'}</p>
                  </Link>
                  {user && video?.creator_id !== user.id && (
                    <Button
                      variant={subscribed ? 'secondary' : 'default'}
                      size="sm"
                      disabled={subLoading}
                      onClick={async () => {
                        if (!video?.creator_id) return;
                        setSubLoading(true);
                        if (subscribed) {
                          await supabase.from('subscriptions').delete().eq('follower_id', user.id).eq('creator_id', video.creator_id);
                          setSubscribed(false);
                        } else {
                          await supabase.from('subscriptions').insert({ follower_id: user.id, creator_id: video.creator_id });
                          setSubscribed(true);
                          sendNotification(user.id, video.creator_id, 'new_follower', user.id, 'profile', 'subscribed to your channel');
                        }
                        setSubLoading(false);
                      }}
                    >
                      {subscribed ? <><UserCheck className="w-4 h-4 mr-1" /> Subscribed</> : <><UserPlus className="w-4 h-4 mr-1" /> Subscribe</>}
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Like / Dislike pill */}
                  <div className="flex items-center rounded-full border border-border overflow-hidden">
                    <button
                      onClick={toggleLike}
                      disabled={!user}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors hover:bg-secondary/60 ${liked ? 'text-primary' : 'text-foreground'}`}
                    >
                      <ThumbsUp className="w-4 h-4" /> {formatCount(likeCount)}
                    </button>
                    <div className="w-px self-stretch bg-border" />
                    <button
                      onClick={toggleDislike}
                      disabled={!user}
                      className={`p-2.5 transition-colors hover:bg-secondary/60 ${disliked ? 'text-destructive' : 'text-foreground'}`}
                      aria-label="Dislike"
                      title="I dislike this"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                  {user && (
                    <Button variant="outline" size="sm" onClick={() => setSaveOpen(true)} title="Save to playlist">
                      <BookmarkPlus className="w-4 h-4 mr-1" /> Save
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
                    <Share2 className="w-4 h-4 mr-1" /> Share
                  </Button>
                  {user && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setReportTarget({ type: 'video', id: video.id })}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Report video"
                      title="Report"
                    >
                      <Flag className="w-4 h-4" />
                    </Button>
                  )}
                  {canManage && (
                    <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                      <Pencil className="w-4 h-4 mr-1" /> Edit
                    </Button>
                  )}
                </div>
              </div>

              {video.description && (
                <div className="bg-card rounded-lg p-4 mb-6 border border-border">
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">{video.description}</p>
                </div>
              )}

              <AdSlot slot="watch-mid" format="horizontal" className="mb-6" />

              {/* Comments */}
              <div>
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Comments ({comments.length})
                </h2>

                {user && (
                  <div className="flex gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-primary text-xs font-semibold">{user.email?.[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." rows={2} className="mb-2" maxLength={1000} />
                      <Button size="sm" disabled={!comment.trim() || posting} onClick={postComment}>
                        <Send className="w-3 h-3 mr-1" /> {posting ? 'Posting...' : 'Post'}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="divide-y divide-border/60">
                  {topLevel.map(c => renderComment(c))}
                  {comments.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No comments yet. Be the first!</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <AdSlot slot="watch-sidebar" format="vertical" className="mb-4" />
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">Up Next</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Autoplay</span>
                <Switch checked={autoplay} onCheckedChange={setAutoplay} />
              </div>
            </div>
            <div className="space-y-4">
              {suggested.map((v, i) => {
                const p = (v as any).profiles;
                return (
                  <div key={v.id} className={i === 0 && nextVideo ? 'relative' : ''}>
                    {i === 0 && nextVideo && countdown !== null && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-16 rounded-full bg-primary" />
                    )}
                    <VideoCard
                      id={v.id}
                      title={v.title}
                      thumbnail={v.thumbnail_url}
                      creator={p?.display_name || p?.username || 'Unknown'}
                      views={formatCount(v.views || 0)}
                      date={new Date(v.created_at).toLocaleDateString()}
                      category={v.category}
                      duration={v.duration}
                    />
                  </div>
                );
              })}
              {suggested.length === 0 && <p className="text-sm text-muted-foreground">No other videos yet.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ShareModal open={shareOpen} onOpenChange={setShareOpen} videoId={video.id} videoTitle={video.title} currentTime={currentTime} />
      <SaveToPlaylistModal open={saveOpen} onOpenChange={setSaveOpen} videoId={video.id} />
      <VideoEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        video={video}
        onSaved={() => {
          supabase.from('videos').select('*').eq('id', id).maybeSingle().then(({ data }) => { if (data) setVideo(data); });
        }}
        onDeleted={() => navigate('/profile')}
      />
      {reportTarget && (
        <ReportModal
          open={!!reportTarget}
          onOpenChange={open => { if (!open) setReportTarget(null); }}
          targetType={reportTarget.type}
          targetId={reportTarget.id}
        />
      )}
    </div>
  );
};

export default Watch;
