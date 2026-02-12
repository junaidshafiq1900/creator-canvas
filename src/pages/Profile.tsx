import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import VideoCard from '@/components/video/VideoCard';
import { User, MapPin, Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_USER_VIDEOS = [
  { id: '1', title: 'Cinematic City Timelapse - New York', creator: 'You', views: '245K', date: '2d ago', gradient: 'linear-gradient(135deg, hsl(200 80% 40%), hsl(250 60% 30%))' },
  { id: '6', title: 'Mastering Composition in Photography', creator: 'You', views: '93K', date: '4d ago', gradient: 'linear-gradient(135deg, hsl(225 50% 40%), hsl(187 85% 53%))' },
];

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen pt-16">
      {/* Banner */}
      <div className="h-48 md:h-64" style={{ background: 'linear-gradient(135deg, hsl(225 25% 12%), hsl(187 85% 25%))' }} />

      <div className="container mx-auto px-4 -mt-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-6 items-start mb-10">
          <div className="w-28 h-28 rounded-2xl bg-card border-4 border-background flex items-center justify-center shadow-lg">
            <User className="w-12 h-12 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{user?.email?.split('@')[0] || 'Creator'}</h1>
            <p className="text-sm text-muted-foreground mb-3">@{user?.email?.split('@')[0] || 'creator'}</p>
            <p className="text-sm text-foreground/70 mb-4 max-w-lg">This is a creator bio. Connect Supabase and update your profile in Settings to customize this.</p>
            <div className="flex gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> 0 followers</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Earth</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined 2026</span>
            </div>
            <Button size="sm">Follow</Button>
          </div>
        </motion.div>

        <h2 className="text-lg font-bold text-foreground mb-4">Videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {MOCK_USER_VIDEOS.map(v => <VideoCard key={v.id} {...v} />)}
        </div>
      </div>
    </div>
  );
};

export default Profile;
