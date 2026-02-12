import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Film, Eye, MessageSquare, Trash2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="bg-card rounded-xl border border-border p-5">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
  </div>
);

const Admin = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');

  // Mock data
  const mockUsers = [
    { id: '1', email: 'creator@example.com', joined: '2026-01-15', videos: 12 },
    { id: '2', email: 'viewer@example.com', joined: '2026-02-01', videos: 0 },
  ];

  const mockVideos = [
    { id: '1', title: 'Cinematic City Timelapse', creator: 'creator@example.com', views: 245892, date: '2026-02-10' },
    { id: '2', title: 'Digital Painting Tutorial', creator: 'creator@example.com', views: 67000, date: '2026-02-08' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Admin access is controlled via the <code className="text-primary">user_roles</code> table in your Supabase database. Below is mock data for demonstration.
        </p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Total Users" value="2" />
          <StatCard icon={Film} label="Total Videos" value="14" />
          <StatCard icon={Eye} label="Total Views" value="312.9K" />
          <StatCard icon={MessageSquare} label="Comments" value="89" />
        </motion.div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Users</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Joined</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Videos</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map(u => (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-foreground">{u.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.joined}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.videos}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Title</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Creator</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Views</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Date</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {mockVideos.map(v => (
                    <tr key={v.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-foreground">{v.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.creator}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.views.toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.date}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
