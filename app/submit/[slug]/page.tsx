import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { SubmissionForm } from '@/components/forms/submission-form';

interface PageProps {
  params: { slug: string };
  searchParams: { key?: string; pin?: string };
}

export default async function VenueSubmitPage({ params, searchParams }: PageProps) {
  const supabase = createAdminClient();
  
  // Look up venue by slug and validate access key
  const { data: venue, error } = await supabase
    .from('venues')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error || !venue) {
    notFound();
  }

  // Validate access key
  if (venue.access_key !== searchParams.key) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Invalid Access Link
          </h1>
          <p className="text-gray-600">
            This link is invalid or has expired. Please contact your social media
            manager for a new link.
          </p>
        </div>
      </div>
    );
  }

  // Optional PIN validation (if venue has a PIN set)
  // For simplicity, we'll skip PIN validation in this MVP
  // You could add a PIN entry screen here if needed

  return <SubmissionForm venue={venue} />;
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = createAdminClient();
  
  const { data: venue } = await supabase
    .from('venues')
    .select('name')
    .eq('slug', params.slug)
    .single();

  return {
    title: venue ? `Submit Request - ${venue.name}` : 'Submit Request',
    description: 'Submit a social media content request',
  };
}
