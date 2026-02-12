import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Plus } from 'lucide-react';
import { VenueList } from '@/components/admin/venue-list';
import { CreateVenueDialog } from '@/components/admin/create-venue-dialog';

export default async function AdminVenuesPage() {
  const supabase = createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/admin/login');
  }

  const { data: venues, error } = await supabase
    .from('venues')
    .select('*')
    .order('name');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Venues</h1>
          <p className="text-gray-500 mt-1">Manage venue access links</p>
        </div>
        <CreateVenueDialog />
      </div>

      <Card>
        <CardContent className="p-0">
          {venues && venues.length > 0 ? (
            <VenueList venues={venues} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No venues yet</p>
              <p className="text-sm mt-1">Create your first venue to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
