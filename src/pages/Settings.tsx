import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { saveSupabaseConfig, getSupabaseConfig, clearSupabaseConfig } from '@/lib/supabase';
import { CheckCircle, Database, Palette, User, DollarSign, HardDrive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Supabase config
  const [sbUrl, setSbUrl] = useState('');
  const [sbKey, setSbKey] = useState('');
  const [sbSaved, setSbSaved] = useState(false);

  // AdSense
  const [pubId, setPubId] = useState('');
  const [adSaved, setAdSaved] = useState(false);

  // Profile
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    const config = getSupabaseConfig();
    if (config) { setSbUrl(config.url); setSbKey(config.anonKey); }
    const storedPub = localStorage.getItem('vstream_adsense_pub_id');
    if (storedPub) setPubId(storedPub);
  }, []);

  const handleSaveSupabase = () => {
    if (!sbUrl.trim() || !sbKey.trim()) return;
    saveSupabaseConfig(sbUrl.trim(), sbKey.trim());
    setSbSaved(true);
    setTimeout(() => { setSbSaved(false); window.location.reload(); }, 1500);
  };

  const handleClearSupabase = () => {
    clearSupabaseConfig();
    setSbUrl('');
    setSbKey('');
    window.location.reload();
  };

  const handleSaveAdsense = () => {
    localStorage.setItem('vstream_adsense_pub_id', pubId.trim());
    setAdSaved(true);
    setTimeout(() => setAdSaved(false), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

        <Tabs defaultValue="supabase">
          <TabsList className="mb-6 w-full justify-start">
            <TabsTrigger value="supabase"><Database className="w-4 h-4 mr-1.5" /> Supabase</TabsTrigger>
            <TabsTrigger value="adsense"><DollarSign className="w-4 h-4 mr-1.5" /> AdSense</TabsTrigger>
            <TabsTrigger value="storage"><HardDrive className="w-4 h-4 mr-1.5" /> Storage</TabsTrigger>
            {user && <TabsTrigger value="profile"><User className="w-4 h-4 mr-1.5" /> Profile</TabsTrigger>}
          </TabsList>

          <TabsContent value="supabase" className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-1">Supabase Connection</h2>
              <p className="text-sm text-muted-foreground mb-4">Connect your own Supabase project for authentication, database, and storage.</p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Supabase URL</Label>
                  <Input value={sbUrl} onChange={e => setSbUrl(e.target.value)} placeholder="https://your-project.supabase.co" />
                </div>
                <div className="space-y-2">
                  <Label>Anon Key (public)</Label>
                  <Input value={sbKey} onChange={e => setSbKey(e.target.value)} placeholder="eyJhbGciOi..." type="password" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveSupabase} disabled={sbSaved}>
                    {sbSaved ? <><CheckCircle className="w-4 h-4 mr-1" /> Saved!</> : 'Save Connection'}
                  </Button>
                  {getSupabaseConfig() && (
                    <Button variant="outline" onClick={handleClearSupabase}>Disconnect</Button>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-2">Required Supabase Setup</h3>
                <p className="text-xs text-muted-foreground mb-2">Run this SQL in your Supabase SQL Editor to create the required tables:</p>
                <pre className="text-xs text-primary/80 bg-background p-3 rounded overflow-x-auto whitespace-pre">{`-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE, display_name TEXT,
  bio TEXT, avatar_url TEXT, banner_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Videos
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, description TEXT,
  thumbnail_url TEXT, video_url TEXT NOT NULL,
  video_path TEXT, storage_type TEXT DEFAULT 'supabase',
  storage_provider_ref TEXT, category TEXT,
  tags TEXT[] DEFAULT '{}', creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  views INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public videos" ON videos FOR SELECT USING (true);
CREATE POLICY "Creator insert" ON videos FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creator update" ON videos FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creator delete" ON videos FOR DELETE USING (auth.uid() = creator_id);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Auth comment" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Likes
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(video_id, user_id)
);
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Auth like" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own unlike" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, creator_id)
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public subs" ON subscriptions FOR SELECT USING (true);
CREATE POLICY "Auth sub" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Own unsub" ON subscriptions FOR DELETE USING (auth.uid() = follower_id);

-- Posts (social feed)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL, image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Auth post" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles (admin)
CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL, UNIQUE(user_id, role)
);
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Storage buckets: Create 'videos' and 'thumbnails' buckets in Supabase Dashboard > Storage`}</pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="adsense" className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-1">Google AdSense</h2>
              <p className="text-sm text-muted-foreground mb-4">Enter your AdSense Publisher ID to enable ads across the platform.</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Publisher ID</Label>
                  <Input value={pubId} onChange={e => setPubId(e.target.value)} placeholder="ca-pub-XXXXXXXXXXXXXXXX" />
                </div>
                <Button onClick={handleSaveAdsense} disabled={adSaved}>
                  {adSaved ? <><CheckCircle className="w-4 h-4 mr-1" /> Saved!</> : 'Save Publisher ID'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-1">Storage Configuration</h2>
              <p className="text-sm text-muted-foreground mb-4">Current provider: <span className="text-primary font-medium">Supabase Storage</span></p>
              <p className="text-sm text-muted-foreground">The storage layer is modular. Future versions will support:</p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>AWS S3</li>
                <li>Cloudflare R2</li>
                <li>Backblaze B2</li>
                <li>Local VPS storage (via API endpoint)</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4">The database stores <code className="text-primary">storage_type</code> and <code className="text-primary">video_path</code> per video for seamless migration.</p>
            </div>
          </TabsContent>

          {user && (
            <TabsContent value="profile" className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-semibold text-foreground mb-4">Edit Profile</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell people about yourself..." rows={4} maxLength={500} />
                  </div>
                  <Button>Save Profile</Button>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
