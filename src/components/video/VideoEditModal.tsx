import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { VIDEO_CATEGORIES } from '@/types/database';
import { Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const db = supabase as any;

interface VideoEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: any;
  onSaved?: () => void;
  onDeleted?: () => void;
}

const VideoEditModal = ({ open, onOpenChange, video, onSaved, onDeleted }: VideoEditModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');
  const [visibility, setVisibility] = useState('public');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open && video) {
      setTitle(video.title || '');
      setDescription(video.description || '');
      setCategory(video.category || '');
      setVisibility(video.visibility || 'public');
      setConfirmDelete(false);
    }
  }, [open, video]);

  const save = async () => {
    if (!video || !title.trim()) return;
    setSaving(true);
    const { error } = await db.from('videos').update({
      title: title.trim(),
      description: description.trim() || null,
      category: category || null,
      visibility,
    }).eq('id', video.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Video updated!' });
      onOpenChange(false);
      onSaved?.();
    }
  };

  const remove = async () => {
    if (!video) return;
    setDeleting(true);
    const { error } = await db.from('videos').delete().eq('id', video.id);
    setDeleting(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Video deleted' });
      onOpenChange(false);
      onDeleted?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit video</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} maxLength={5000} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {VIDEO_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-destructive">Delete permanently?</span>
              <Button variant="destructive" size="sm" disabled={deleting} onClick={remove}>
                {deleting ? 'Deleting...' : 'Yes, delete'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete video
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button disabled={saving || !title.trim()} onClick={save}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoEditModal;
