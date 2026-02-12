import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Heart, MessageSquare, User } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_POSTS = [
  { id: '1', user: 'UrbanLens', content: 'Just finished editing my new timelapse series! NYC at night is something else 🌃', date: '2h ago', likes: 42, comments: 7 },
  { id: '2', user: 'DevMaster', content: 'New tutorial dropping tomorrow — building a full-stack app from scratch in 24 hours. Stay tuned! 🚀', date: '5h ago', likes: 128, comments: 23 },
  { id: '3', user: 'ArtFlow', content: 'Sometimes the best art happens when you stop trying to be perfect and just let the creativity flow.', date: '1d ago', likes: 89, comments: 12 },
];

const Feed = () => {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState('');

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Feed</h1>

        {user && (
          <div className="bg-card rounded-xl border border-border p-4 mb-6">
            <Textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              maxLength={1000}
              className="mb-3"
            />
            <div className="flex justify-end">
              <Button size="sm" disabled={!newPost.trim()}>
                <Send className="w-3 h-3 mr-1" /> Post
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {MOCK_POSTS.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{post.user}</p>
                  <p className="text-xs text-muted-foreground">{post.date}</p>
                </div>
              </div>
              <p className="text-sm text-foreground/80 mb-4">{post.content}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Heart className="w-4 h-4" /> {post.likes}
                </button>
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <MessageSquare className="w-4 h-4" /> {post.comments}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Feed;
