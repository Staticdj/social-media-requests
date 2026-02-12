'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface StatusSelectorProps {
  submissionId: string;
  currentStatus: string;
}

const STATUSES = ['new', 'needs_info', 'ready', 'archived'];

export function StatusSelector({ submissionId, currentStatus }: StatusSelectorProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('submissions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', submissionId);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger
        className={cn(
          'w-[140px]',
          getStatusColor(currentStatus),
          'border-none font-medium'
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  status === 'new' && 'bg-blue-500',
                  status === 'needs_info' && 'bg-amber-500',
                  status === 'ready' && 'bg-green-500',
                  status === 'archived' && 'bg-gray-400'
                )}
              />
              {getStatusLabel(status)}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
