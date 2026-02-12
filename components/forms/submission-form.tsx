'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  CheckCircle,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUpload } from '@/components/forms/file-upload';
import { BlackboardFields } from '@/components/forms/blackboard-fields';
import { DrinkFields } from '@/components/forms/drink-fields';
import { EventFields } from '@/components/forms/event-fields';
import { PromotionFields } from '@/components/forms/promotion-fields';
import { OtherFields } from '@/components/forms/other-fields';
import type { Venue, PostType, PostFrequency, CTAType } from '@/types';

const POST_TYPES = [
  { value: 'blackboard_special', label: 'Blackboard Special', icon: '🍽️' },
  { value: 'drink_special', label: 'Drink Special', icon: '🍹' },
  { value: 'event', label: 'Event / Entertainment', icon: '🎵' },
  { value: 'promotion', label: 'Promotion / Giveaway', icon: '🎁' },
  { value: 'other', label: 'Other', icon: '📝' },
];

const FREQUENCIES = [
  { value: 'once', label: 'Post once' },
  { value: 'twice', label: 'Post twice' },
  { value: 'daily', label: 'Post daily' },
  { value: 'custom', label: 'Custom schedule' },
];

const CTA_OPTIONS = [
  { value: 'book', label: 'Book a table' },
  { value: 'walk_ins', label: 'Walk-ins welcome' },
  { value: 'order_at_bar', label: 'Order at bar' },
  { value: 'call', label: 'Call to enquire' },
  { value: 'buy_tickets', label: 'Buy tickets' },
  { value: 'other', label: 'Other' },
];

interface SubmissionFormProps {
  venue: Venue;
}

export function SubmissionForm({ venue }: SubmissionFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [postType, setPostType] = useState<PostType | ''>('');
  const [runStartDate, setRunStartDate] = useState('');
  const [runEndDate, setRunEndDate] = useState('');
  const [untilSoldOut, setUntilSoldOut] = useState(false);
  const [postFrequency, setPostFrequency] = useState<PostFrequency>('once');
  const [frequencyCustom, setFrequencyCustom] = useState('');
  const [cta, setCta] = useState<CTAType>('walk_ins');
  const [ctaCustom, setCtaCustom] = useState('');
  const [fieldsJson, setFieldsJson] = useState<Record<string, unknown>>({});
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('venue_id', venue.id);
      formData.append('post_type', postType);
      formData.append('run_start_date', runStartDate);
      formData.append('run_end_date', runEndDate);
      formData.append('until_sold_out', String(untilSoldOut));
      formData.append('post_frequency', postFrequency);
      formData.append('frequency_custom', frequencyCustom);
      formData.append('cta', cta);
      formData.append('cta_custom', ctaCustom);
      formData.append('fields_json', JSON.stringify(fieldsJson));
      formData.append('notes', notes);

      // Append files
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit');
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPostTypeFields = () => {
    switch (postType) {
      case 'blackboard_special':
        return (
          <BlackboardFields
            values={fieldsJson as any}
            onChange={setFieldsJson}
            errors={fieldErrors}
          />
        );
      case 'drink_special':
        return (
          <DrinkFields
            values={fieldsJson as any}
            onChange={setFieldsJson}
            errors={fieldErrors}
          />
        );
      case 'event':
        return (
          <EventFields
            values={fieldsJson as any}
            onChange={setFieldsJson}
            errors={fieldErrors}
          />
        );
      case 'promotion':
        return (
          <PromotionFields
            values={fieldsJson as any}
            onChange={setFieldsJson}
            errors={fieldErrors}
          />
        );
      case 'other':
        return (
          <OtherFields
            values={fieldsJson as any}
            onChange={setFieldsJson}
            errors={fieldErrors}
          />
        );
      default:
        return null;
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Request Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Thanks for submitting your content request. We'll review it and
              get your posts scheduled.
            </p>
            <Button
              onClick={() => {
                setIsSuccess(false);
                setStep(1);
                setPostType('');
                setFieldsJson({});
                setFiles([]);
                setNotes('');
                setRunStartDate('');
                setRunEndDate('');
              }}
              variant="outline"
            >
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {venue.name}
              </h1>
              <p className="text-sm text-gray-500">Social Media Request</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              Step {step} of 3
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Post Type Selection */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                What type of post?
              </h2>
              <p className="text-gray-500 mt-1">
                Select the category that best fits your content
              </p>
            </div>

            <div className="grid gap-3">
              {POST_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setPostType(type.value as PostType);
                    setFieldsJson({});
                    setStep(2);
                  }}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border hover:border-primary hover:shadow-sm transition-all text-left group"
                >
                  <span className="text-2xl">{type.icon}</span>
                  <span className="flex-1 font-medium text-gray-900">
                    {type.label}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Post Details */}
        {step === 2 && postType && (
          <div className="space-y-6 animate-fade-in">
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:text-gray-700 mb-2"
              >
                ← Back to post type
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {POST_TYPES.find((t) => t.value === postType)?.label} Details
              </h2>
            </div>

            <Card>
              <CardContent className="pt-6">{renderPostTypeFields()}</CardContent>
            </Card>

            <Button
              onClick={() => setStep(3)}
              className="w-full"
              size="lg"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 3: Schedule & Upload */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm text-gray-500 hover:text-gray-700 mb-2"
              >
                ← Back to details
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                Schedule & Upload
              </h2>
            </div>

            {/* Schedule */}
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <Calendar className="w-4 h-4" />
                  Post Schedule
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="run_start_date">
                      Start Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="run_start_date"
                      type="date"
                      min={getTodayDate()}
                      value={runStartDate}
                      onChange={(e) => setRunStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="run_end_date">End Date</Label>
                    <Input
                      id="run_end_date"
                      type="date"
                      min={runStartDate || getTodayDate()}
                      value={runEndDate}
                      onChange={(e) => setRunEndDate(e.target.value)}
                      disabled={untilSoldOut}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="until_sold_out">Until Sold Out</Label>
                    <p className="text-sm text-muted-foreground">
                      Run until stock is gone
                    </p>
                  </div>
                  <Switch
                    id="until_sold_out"
                    checked={untilSoldOut}
                    onCheckedChange={setUntilSoldOut}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Post Frequency</Label>
                  <Select
                    value={postFrequency}
                    onValueChange={(v) => setPostFrequency(v as PostFrequency)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {postFrequency === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="frequency_custom">Custom Schedule</Label>
                    <Input
                      id="frequency_custom"
                      placeholder="e.g., Every Tuesday and Friday"
                      value={frequencyCustom}
                      onChange={(e) => setFrequencyCustom(e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CTA */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Label>Call to Action</Label>
                <Select value={cta} onValueChange={(v) => setCta(v as CTAType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CTA_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {cta === 'other' && (
                  <Input
                    placeholder="Enter custom CTA..."
                    value={ctaCustom}
                    onChange={(e) => setCtaCustom(e.target.value)}
                  />
                )}
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Photos & Videos</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload photos or videos for your post
                  </p>
                </div>
                <FileUpload files={files} onFilesChange={setFiles} />
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any other details we should know..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !runStartDate}
              className="w-full"
              size="lg"
              loading={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
