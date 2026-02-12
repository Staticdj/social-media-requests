'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface EventFieldsProps {
  values: {
    event_name: string;
    event_date: string;
    event_time: string;
    location: string;
    entertainment: string;
    entry_fee: string;
    ticket_link: string;
    rules: string;
  };
  onChange: (values: EventFieldsProps['values']) => void;
  errors?: Record<string, string>;
}

export function EventFields({ values, onChange, errors }: EventFieldsProps) {
  const updateField = (field: string, value: string) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Event Name */}
      <div className="space-y-2">
        <Label htmlFor="event_name">
          Event Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="event_name"
          placeholder="e.g., Live Music Friday"
          value={values.event_name || ''}
          onChange={(e) => updateField('event_name', e.target.value)}
          error={!!errors?.event_name}
        />
        {errors?.event_name && (
          <p className="text-sm text-destructive">{errors.event_name}</p>
        )}
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="event_date">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="event_date"
            type="date"
            value={values.event_date || ''}
            onChange={(e) => updateField('event_date', e.target.value)}
            error={!!errors?.event_date}
          />
          {errors?.event_date && (
            <p className="text-sm text-destructive">{errors.event_date}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="event_time">Time</Label>
          <Input
            id="event_time"
            type="time"
            value={values.event_time || ''}
            onChange={(e) => updateField('event_time', e.target.value)}
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location / Area</Label>
        <Input
          id="location"
          placeholder="e.g., Main bar, Beer garden"
          value={values.location || ''}
          onChange={(e) => updateField('location', e.target.value)}
        />
      </div>

      {/* Entertainment */}
      <div className="space-y-2">
        <Label htmlFor="entertainment">Entertainment / Performer</Label>
        <Textarea
          id="entertainment"
          placeholder="e.g., DJ Smith, The Local Band..."
          value={values.entertainment || ''}
          onChange={(e) => updateField('entertainment', e.target.value)}
          rows={2}
        />
      </div>

      {/* Entry Fee */}
      <div className="space-y-2">
        <Label htmlFor="entry_fee">Entry Fee</Label>
        <Input
          id="entry_fee"
          placeholder="e.g., Free entry, $10 at door"
          value={values.entry_fee || ''}
          onChange={(e) => updateField('entry_fee', e.target.value)}
        />
      </div>

      {/* Ticket Link */}
      <div className="space-y-2">
        <Label htmlFor="ticket_link">Ticket Link</Label>
        <Input
          id="ticket_link"
          type="url"
          placeholder="https://..."
          value={values.ticket_link || ''}
          onChange={(e) => updateField('ticket_link', e.target.value)}
        />
      </div>

      {/* Rules */}
      <div className="space-y-2">
        <Label htmlFor="rules">Rules / Requirements</Label>
        <Textarea
          id="rules"
          placeholder="e.g., 18+ only, dress code applies..."
          value={values.rules || ''}
          onChange={(e) => updateField('rules', e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
}
