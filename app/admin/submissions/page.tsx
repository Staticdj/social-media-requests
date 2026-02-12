import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  formatDateTime,
  getPostTypeLabel,
  getStatusLabel,
  getStatusColor,
} from '@/lib/utils';
import { Inbox, Filter, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { SubmissionFilters } from '@/components/admin/submission-filters';

interface PageProps {
  searchParams: {
    status?: string;
    venue?: string;
    type?: string;
  };
}

export default async function AdminSubmissionsPage({ searchParams }: PageProps) {
  const supabase = createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/admin/login');
  }

  // Build query with filters
  let query = supabase
    .from('submissions')
    .select(`
      *,
      venue:venues(id, name),
      attachments(id)
    `)
    .order('created_at', { ascending: false });

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status);
  }

  if (searchParams.venue) {
    query = query.eq('venue_id', searchParams.venue);
  }

  if (searchParams.type && searchParams.type !== 'all') {
    query = query.eq('post_type', searchParams.type);
  }

  const { data: submissions, error } = await query;

  // Fetch venues for filter
  const { data: venues } = await supabase
    .from('venues')
    .select('id, name')
    .order('name');

  // Count by status
  const { data: statusCounts } = await supabase.rpc('get_submission_counts_by_status');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inbox</h1>
          <p className="text-gray-500 mt-1">Manage submission requests</p>
        </div>
      </div>

      {/* Filters */}
      <SubmissionFilters
        venues={venues || []}
        currentStatus={searchParams.status}
        currentVenue={searchParams.venue}
        currentType={searchParams.type}
      />

      {/* Submissions list */}
      <Card className="mt-6">
        <CardContent className="p-0">
          {submissions && submissions.length > 0 ? (
            <div className="divide-y">
              {submissions.map((submission) => (
                <Link
                  key={submission.id}
                  href={`/admin/submissions/${submission.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group"
                >
                  {/* Status indicator */}
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      submission.status === 'new'
                        ? 'bg-blue-500'
                        : submission.status === 'needs_info'
                        ? 'bg-amber-500'
                        : submission.status === 'ready'
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                        {submission.venue?.name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {getPostTypeLabel(submission.post_type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{formatDateTime(submission.created_at)}</span>
                      {submission.attachments?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" />
                          {submission.attachments.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <Badge className={getStatusColor(submission.status)}>
                    {getStatusLabel(submission.status)}
                  </Badge>

                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Inbox className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No submissions found</p>
              <p className="text-sm mt-1">
                {searchParams.status || searchParams.venue || searchParams.type
                  ? 'Try adjusting your filters'
                  : 'Submissions will appear here'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
