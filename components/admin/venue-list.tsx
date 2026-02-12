'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Copy, ExternalLink, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Venue } from '@/types';

interface VenueListProps {
  venues: Venue[];
}

export function VenueList({ venues }: VenueListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getVenueUrl = (venue: Venue) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/submit/${venue.slug}?key=${venue.access_key}`;
  };

  const copyLink = async (venue: Venue) => {
    const url = getVenueUrl(venue);
    await navigator.clipboard.writeText(url);
    toast({
      title: 'Link copied!',
      description: `Submission link for ${venue.name} copied to clipboard.`,
    });
  };

  const deleteVenue = async (venueId: string) => {
    if (!confirm('Are you sure you want to delete this venue? This will also delete all associated submissions.')) {
      return;
    }

    setDeletingId(venueId);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('venues').delete().eq('id', venueId);

      if (error) throw error;

      router.refresh();
      toast({
        title: 'Venue deleted',
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Failed to delete venue:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete venue',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="divide-y">
      {venues.map((venue) => (
        <div
          key={venue.id}
          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900">{venue.name}</h3>
            <p className="text-sm text-gray-500 truncate">
              /submit/{venue.slug}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyLink(venue)}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => window.open(getVenueUrl(venue), '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Form
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => deleteVenue(venue.id)}
                  className="text-destructive focus:text-destructive"
                  disabled={deletingId === venue.id}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}
