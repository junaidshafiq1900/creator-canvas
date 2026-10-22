import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Flag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const REASONS = ['Spam', 'Harassment', 'Copyright / DMCA', 'Inappropriate content', 'Other'];

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: 'video' | 'comment';
  targetId: string;
}

const ReportModal = ({ open, onOpenChange, targetType, targetId }: ReportModalProps) => {
  const { user } = useAuth();
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user || !reason) return;
    setSubmitting(true);
    const db = supabase as any;
    const { error } = await db.from('reports').insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
      details: details.trim() || null,
      status: 'open',
    });
    setSubmitting(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Report submitted', description: 'Our moderation team will review it shortly.' });
      setReason(null);
      setDetails('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-destructive" /> Report this {targetType}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Reason</Label>
            <div className="grid grid-cols-2 gap-2">
              {REASONS.map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`px-3 py-2 rounded-lg text-xs text-left border transition-colors ${
                    reason === r
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/40 text-foreground'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Details (optional)</Label>
            <Textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Add any context that helps our review..."
              rows={3}
              maxLength={1000}
            />
          </div>

          <Button className="w-full" disabled={!reason || submitting} onClick={submit}>
            {submitting ? 'Submitting...' : 'Submit report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
