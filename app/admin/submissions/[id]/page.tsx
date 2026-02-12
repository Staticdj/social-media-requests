import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  formatDate,
  formatDateTime,
  getPostTypeLabel,
  getStatusLabel,
  getStatusColor,
  isImageFile,
  isVideoFile,
} from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Repeat,
  MousePointer,
  Download,
  ExternalLink,
} from 'lucide-react';
import { StatusSelector } from '@/components/admin/status-selector';

interface PageProps {
  params: { id: string };
}

export default async function SubmissionDetailPage({ params }: PageProps) {
  const supabase = createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/admin/login');
  }

  const { data: submission, error } = await supabase
    .from('submissions')
    .select(`
      *,
      venue:venues(*),
      attachments(*)
    `)
    .eq('id', params.id)
    .single();

  if (error || !submission) {
    notFound();
  }

  const fields = submission.fields_json as Record<string, unknown>;

  const renderFieldValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value || '—');
  };

  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      item_name: 'Item Name',
      drink_name: 'Drink Name',
      event_name: 'Event Name',
      promotion_name: 'Promotion Name',
      title: 'Title',
      price: 'Price',
      short_description: 'Description',
      description: 'Description',
      ingredients: 'Ingredients',
      dietary_tags: 'Dietary Info',
      sides: 'Sides',
      sauces_options: 'Sauces/Options',
      subject_to_availability: 'Subject to Availability',
      conditions: 'Conditions',
      event_date: 'Event Date',
      event_time: 'Event Time',
      location: 'Location',
      entertainment: 'Entertainment',
      entry_fee: 'Entry Fee',
      ticket_link: 'Ticket Link',
      rules: 'Rules',
      terms: 'Terms & Conditions',
      valid_until: 'Valid Until',
    };
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/submissions"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Inbox
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold text-gray-900">
                {submission.venue?.name}
              </h1>
              <Badge variant="secondary">
                {getPostTypeLabel(submission.post_type)}
              </Badge>
            </div>
            <p className="text-gray-500">
              Submitted {formatDateTime(submission.created_at)}
            </p>
          </div>

          <StatusSelector
            submissionId={submission.id}
            currentStatus={submission.status}
          />
        </div>
      </div>

      <div className="grid gap-6">
        {/* Schedule info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{formatDate(submission.run_start_date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">
                    {submission.until_sold_out
                      ? 'Until sold out'
                      : submission.run_end_date
                      ? formatDate(submission.run_end_date)
                      : '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Repeat className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Frequency</p>
                  <p className="font-medium capitalize">
                    {submission.post_frequency === 'custom'
                      ? submission.frequency_custom || 'Custom'
                      : submission.post_frequency}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MousePointer className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">CTA</p>
                  <p className="font-medium capitalize">
                    {submission.cta === 'other'
                      ? submission.cta_custom || 'Other'
                      : submission.cta.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Post-type specific fields */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {Object.entries(fields).map(([key, value]) => {
                if (value === null || value === undefined || value === '') return null;
                return (
                  <div key={key} className="grid grid-cols-3 gap-4">
                    <p className="text-sm text-gray-500">{getFieldLabel(key)}</p>
                    <p className="col-span-2 font-medium">{renderFieldValue(value)}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Additional notes */}
        {submission.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{submission.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Attachments */}
        {submission.attachments && submission.attachments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Attachments ({submission.attachments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {submission.attachments.map((attachment: any) => (
                  <div
                    key={attachment.id}
                    className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square"
                  >
                    {isImageFile(attachment.file_type) ? (
                      <img
                        src={attachment.file_url}
                        alt={attachment.original_name}
                        className="w-full h-full object-cover"
                      />
                    ) : isVideoFile(attachment.file_type) ? (
                      <video
                        src={attachment.file_url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">File</span>
                      </div>
                    )}

                    {/* Overlay with download */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a
                        href={attachment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <a
                        href={attachment.file_url}
                        download={attachment.original_name}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
