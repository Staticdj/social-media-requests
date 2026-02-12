import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, getPostTypeLabel, getStatusColor } from '@/lib/utils';
import { Inbox, Building2, Clock, CheckCircle } from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/admin/login');
  }

  // Fetch stats
  const { count: totalSubmissions } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true });

  const { count: newSubmissions } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new');

  const { count: readySubmissions } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ready');

  const { count: totalVenues } = await supabase
    .from('venues')
    .select('*', { count: 'exact', head: true });

  // Fetch recent submissions
  const { data: recentSubmissions } = await supabase
    .from('submissions')
    .select(`
      *,
      venue:venues(name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  const stats = [
    {
      label: 'New Requests',
      value: newSubmissions || 0,
      icon: Inbox,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Ready to Post',
      value: readySubmissions || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Total Requests',
      value: totalSubmissions || 0,
      icon: Clock,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
    {
      label: 'Active Venues',
      value: totalVenues || 0,
      icon: Building2,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your social media requests</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent submissions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Requests</CardTitle>
          <Link
            href="/admin/submissions"
            className="text-sm text-primary hover:underline"
          >
            View all →
          </Link>
        </CardHeader>
        <CardContent>
          {recentSubmissions && recentSubmissions.length > 0 ? (
            <div className="space-y-3">
              {recentSubmissions.map((submission) => (
                <Link
                  key={submission.id}
                  href={`/admin/submissions/${submission.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                        {submission.venue?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getPostTypeLabel(submission.post_type)} •{' '}
                        {formatDateTime(submission.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(submission.status)}>
                    {submission.status}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No submissions yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
