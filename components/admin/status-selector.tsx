'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface StatusSelectorProps {
  submissionId: string;
  currentStatus: string;
}

const STATUSES = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'denied', label: 'Denied', color: 'bg-red-100 text-red-800 border-red-200' },
];

export function StatusSelector({ submissionId, currentStatus }: StatusSelectorProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    
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
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">Status</p>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((status) => (
          <button
            key={status.value}
            onClick={() => handleStatusChange(status.value)}
            disabled={isUpdating}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
              currentStatus === status.value
                ? status.color + ' ring-2 ring-offset-2 ring-gray-400'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
              isUpdating && 'opacity-50 cursor-not-allowed'
            )}
          >
            {status.label}
          </button>
        ))}
      </div>
    </div>
  );
}