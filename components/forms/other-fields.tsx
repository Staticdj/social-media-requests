'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface OtherFieldsProps {
  values: {
    title: string;
    description: string;
  };
  onChange: (values: OtherFieldsProps['values']) => void;
  errors?: Record<string, string>;
}

export function OtherFields({ values, onChange, errors }: OtherFieldsProps) {
  const updateField = (field: string, value: string) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="What's this post about?"
          value={values.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          error={!!errors?.title}
        />
        {errors?.title && (
          <p className="text-sm text-destructive">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Provide all the details we need to create your post..."
          value={values.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          error={!!errors?.description}
          rows={6}
        />
        {errors?.description && (
          <p className="text-sm text-destructive">{errors.description}</p>
        )}
      </div>
    </div>
  );
}
