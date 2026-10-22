import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Copy, Check, Twitter, Send, MessageCircle, Linkedin, Globe } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
  videoTitle: string;
  currentTime?: number | null;
}

const buildTargets = (url: string, text: string) => [
  { id: 'x', label: 'X (Twitter)', icon: Twitter, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` },
  { id: 'telegram', label: 'Telegram', icon: Send, href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
  { id: 'reddit', label: 'Reddit', icon: Globe, href: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}` },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
];

const ShareModal = ({ open, onOpenChange, videoId, videoTitle, currentTime }: ShareModalProps) => {
  const [withTimestamp, setWithTimestamp] = useState(false);
  const [copied, setCopied] = useState(false);

  const base = `${window.location.origin}/watch/${videoId}`;
  const hasTime = !!currentTime && currentTime > 1;
  const shareUrl = withTimestamp && hasTime ? `${base}?t=${Math.floor(currentTime!)}` : base;
  const targets = buildTargets(shareUrl, videoTitle);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast({ title: 'Link copied!' });
    } catch {
      toast({ title: 'Could not copy link', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share video</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input readOnly value={shareUrl} className="text-xs" onFocus={e => e.target.select()} />
            <Button size="icon" variant="secondary" onClick={copy} aria-label="Copy link">
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          {hasTime && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
              <div>
                <Label className="text-sm">Start at current timestamp</Label>
                <p className="text-xs text-muted-foreground">
                  Link opens at {Math.floor(currentTime! / 60)}:{String(Math.floor(currentTime! % 60)).padStart(2, '0')}
                </p>
              </div>
              <Switch checked={withTimestamp} onCheckedChange={setWithTimestamp} />
            </div>
          )}

          <div className="grid grid-cols-5 gap-2">
            {targets.map(t => (
              <button
                key={t.id}
                onClick={() => window.open(t.href, '_blank', 'noopener')}
                className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-secondary/60 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center">
                  <t.icon className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground truncate w-full text-center">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
