import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { HardDrive, Eye, EyeOff, CheckCircle2, XCircle, Save } from 'lucide-react';

type Provider = 'supabase' | 'vimeo' | 'bunny';

interface Config {
  default_provider: Provider;
  vimeo_access_token: string | null;
  bunny_api_key: string | null;
  bunny_library_id: string | null;
  bunny_cdn_hostname: string | null;
  updated_at: string | null;
}

const emptyConfig: Config = {
  default_provider: 'supabase',
  vimeo_access_token: '',
  bunny_api_key: '',
  bunny_library_id: '',
  bunny_cdn_hostname: '',
  updated_at: null,
};

const AdminStorage = () => {
  const [config, setConfig] = useState<Config>(emptyConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showVimeo, setShowVimeo] = useState(false);
  const [showBunny, setShowBunny] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('storage_provider_config')
      .select('*')
      .eq('id', true)
      .maybeSingle();
    if (error) {
      toast({ title: 'Failed to load config', description: error.message, variant: 'destructive' });
    } else if (data) {
      setConfig({
        default_provider: (data.default_provider as Provider) || 'supabase',
        vimeo_access_token: data.vimeo_access_token ?? '',
        bunny_api_key: data.bunny_api_key ?? '',
        bunny_library_id: data.bunny_library_id ?? '',
        bunny_cdn_hostname: data.bunny_cdn_hostname ?? '',
        updated_at: data.updated_at,
      });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('storage_provider_config')
      .upsert({
        id: true,
        default_provider: config.default_provider,
        vimeo_access_token: config.vimeo_access_token?.trim() || null,
        bunny_api_key: config.bunny_api_key?.trim() || null,
        bunny_library_id: config.bunny_library_id?.trim() || null,
        bunny_cdn_hostname: config.bunny_cdn_hostname?.trim() || null,
        updated_by: userData.user?.id ?? null,
      });
    setSaving(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Storage configuration saved' });
      load();
    }
  };

  const vimeoReady = !!config.vimeo_access_token?.trim();
  const bunnyReady =
    !!config.bunny_api_key?.trim() &&
    !!config.bunny_library_id?.trim() &&
    !!config.bunny_cdn_hostname?.trim();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <HardDrive className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Video Storage</h1>
          <p className="text-sm text-muted-foreground">
            Configure where uploaded videos are stored and streamed from.
          </p>
        </div>
      </div>

      {/* Default provider */}
      <section className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Default provider</h2>
          <p className="text-xs text-muted-foreground mt-1">
            New uploads will be sent to this provider unless overridden per-video.
          </p>
        </div>
        <div className="max-w-xs">
          <Select
            value={config.default_provider}
            onValueChange={v => setConfig(c => ({ ...c, default_provider: v as Provider }))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="supabase">Supabase Storage (built-in)</SelectItem>
              <SelectItem value="vimeo" disabled={!vimeoReady}>
                Vimeo {!vimeoReady && '(not configured)'}
              </SelectItem>
              <SelectItem value="bunny" disabled={!bunnyReady}>
                Bunny Stream {!bunnyReady && '(not configured)'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Vimeo */}
      <section className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              Vimeo
              {vimeoReady ? (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground" />
              )}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Personal Access Token from{' '}
              <a href="https://developer.vimeo.com/apps" target="_blank" rel="noreferrer" className="text-primary underline">
                developer.vimeo.com/apps
              </a>
              . Required scopes: <code className="text-[10px]">public private upload edit delete video_files</code>.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vimeo_token">Access Token</Label>
          <div className="flex gap-2">
            <Input
              id="vimeo_token"
              type={showVimeo ? 'text' : 'password'}
              value={config.vimeo_access_token ?? ''}
              onChange={e => setConfig(c => ({ ...c, vimeo_access_token: e.target.value }))}
              placeholder="Paste Vimeo Personal Access Token"
              autoComplete="off"
            />
            <Button type="button" variant="outline" size="icon" onClick={() => setShowVimeo(s => !s)}>
              {showVimeo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </section>

      {/* Bunny */}
      <section className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            Bunny Stream
            {bunnyReady ? (
              <CheckCircle2 className="w-4 h-4 text-primary" />
            ) : (
              <XCircle className="w-4 h-4 text-muted-foreground" />
            )}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Find these in the{' '}
            <a href="https://dash.bunny.net/stream" target="_blank" rel="noreferrer" className="text-primary underline">
              Bunny Stream dashboard
            </a>
            . The CDN hostname is your pull-zone (e.g. <code className="text-[10px]">vz-abc123.b-cdn.net</code>).
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="bunny_key">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="bunny_key"
                type={showBunny ? 'text' : 'password'}
                value={config.bunny_api_key ?? ''}
                onChange={e => setConfig(c => ({ ...c, bunny_api_key: e.target.value }))}
                placeholder="Bunny Stream API key"
                autoComplete="off"
              />
              <Button type="button" variant="outline" size="icon" onClick={() => setShowBunny(s => !s)}>
                {showBunny ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bunny_lib">Library ID</Label>
            <Input
              id="bunny_lib"
              value={config.bunny_library_id ?? ''}
              onChange={e => setConfig(c => ({ ...c, bunny_library_id: e.target.value }))}
              placeholder="e.g. 123456"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bunny_cdn">CDN Hostname</Label>
            <Input
              id="bunny_cdn"
              value={config.bunny_cdn_hostname ?? ''}
              onChange={e => setConfig(c => ({ ...c, bunny_cdn_hostname: e.target.value }))}
              placeholder="vz-xxxxxxx.b-cdn.net"
            />
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {config.updated_at
            ? `Last updated ${new Date(config.updated_at).toLocaleString()}`
            : 'Not yet saved.'}
        </p>
        <Button onClick={save} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Note:</strong> credentials are stored in your database and readable
        only by admins. Once saved, upload flows for Vimeo and Bunny can be wired up in a follow-up step —
        this page is where you'll manage the keys and pick the active provider.
      </div>
    </div>
  );
};

export default AdminStorage;
