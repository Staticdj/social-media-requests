'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SubmissionFiltersProps {
  venues: Array<{ id: string; name: string }>;
  currentStatus?: string;
  currentVenue?: string;
  currentType?: string;
}

const STATUSES = [
  { value: 'all', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'denied', label: 'Denied' },
  { value: 'archived', label: 'Archived' },
];

const POST_TYPES = [
  { value: 'all', label: 'All types' },
  { value: 'blackboard_special', label: 'Blackboard Special' },
  { value: 'drink_special', label: 'Drink Special' },
  { value: 'event', label: 'Event' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'other', label: 'Other' },
];

export function SubmissionFilters({
  venues,
  currentStatus,
  currentVenue,
  currentType,
}: SubmissionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/submissions?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/admin/submissions');
  };

  const hasFilters = currentStatus || currentVenue || currentType;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={currentStatus || 'all'}
        onValueChange={(value) => updateFilter('status', value)}
      >
        <SelectTrigger className="w-[140px] bg-white">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentVenue || ''}
        onValueChange={(value) => updateFilter('venue', value)}
      >
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder="All venues" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All venues</SelectItem>
          {venues.map((venue) => (
            <SelectItem key={venue.id} value={venue.id}>
              {venue.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentType || 'all'}
        onValueChange={(value) => updateFilter('type', value)}
      >
        <SelectTrigger className="w-[160px] bg-white">
          <SelectValue placeholder="Post type" />
        </SelectTrigger>
        <SelectContent>
          {POST_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-gray-500"
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}