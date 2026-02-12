'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PromotionFieldsProps {
  values: {
    promotion_name: string;
    description: string;
    terms: string;
    valid_until: string;
  };
  onChange: (values: PromotionFieldsProps['values']) => void;
  errors?: Record<string, string>;
}

export function PromotionFields({ values, onChange, errors }: PromotionFieldsProps) {
  const updateField = (field: string, value: string) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Promotion Name */}
      <div className="space-y-2">
        <Label htmlFor="promotion_name">
          Promotion Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="promotion_name"
          placeholder="e.g., Win a Trip to Bali"
          value={values.promotion_name || ''}
          onChange={(e) => updateField('promotion_name', e.target.value)}
          error={!!errors?.promotion_name}
        />
        {errors?.promotion_name && (
          <p className="text-sm text-destructive">{errors.promotion_name}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="What's the promotion? How do people enter?..."
          value={values.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          error={!!errors?.description}
          rows={4}
        />
        {errors?.description && (
          <p className="text-sm text-destructive">{errors.description}</p>
        )}
      </div>

      {/* Terms */}
      <div className="space-y-2">
        <Label htmlFor="terms">Terms & Conditions</Label>
        <Textarea
          id="terms"
          placeholder="e.g., Must be 18+, one entry per person..."
          value={values.terms || ''}
          onChange={(e) => updateField('terms', e.target.value)}
          rows={3}
        />
      </div>

      {/* Valid Until */}
      <div className="space-y-2">
        <Label htmlFor="valid_until">Valid Until</Label>
        <Input
          id="valid_until"
          type="date"
          value={values.valid_until || ''}
          onChange={(e) => updateField('valid_until', e.target.value)}
        />
      </div>
    </div>
  );
}
