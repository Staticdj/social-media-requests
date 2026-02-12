'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { generateAccessKey, generateSlug } from '@/lib/utils';
import { Plus } from 'lucide-react';

export function CreateVenueDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(generateSlug(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Check if slug already exists
      const { data: existing } = await supabase
        .from('venues')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existing) {
        setError('A venue with this URL slug already exists');
        setIsLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from('venues').insert({
        name,
        slug,
        access_key: generateAccessKey(),
      });

      if (insertError) throw insertError;

      toast({
        title: 'Venue created!',
        description: `${name} has been added.`,
      });

      setOpen(false);
      setName('');
      setSlug('');
      router.refresh();
    } catch (err) {
      console.error('Failed to create venue:', err);
      setError('Failed to create venue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Venue
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Venue</DialogTitle>
            <DialogDescription>
              Create a new venue to generate a unique submission link.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Venue Name</Label>
              <Input
                id="name"
                placeholder="e.g., The Royal Hotel"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">/submit/</span>
                <Input
                  id="slug"
                  placeholder="the-royal-hotel"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              Create Venue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
