'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface DrinkFieldsProps {
  values: {
    drink_name: string;
    price: string;
    ingredients: string;
    conditions: string;
  };
  onChange: (values: DrinkFieldsProps['values']) => void;
  errors?: Record<string, string>;
}

export function DrinkFields({ values, onChange, errors }: DrinkFieldsProps) {
  const updateField = (field: string, value: string) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Drink Name */}
      <div className="space-y-2">
        <Label htmlFor="drink_name">
          Drink Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="drink_name"
          placeholder="e.g., Espresso Martini"
          value={values.drink_name || ''}
          onChange={(e) => updateField('drink_name', e.target.value)}
          error={!!errors?.drink_name}
        />
        {errors?.drink_name && (
          <p className="text-sm text-destructive">{errors.drink_name}</p>
        )}
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price">
          Price <span className="text-destructive">*</span>
        </Label>
        <Input
          id="price"
          placeholder="e.g., $12.00"
          value={values.price || ''}
          onChange={(e) => updateField('price', e.target.value)}
          error={!!errors?.price}
        />
        {errors?.price && (
          <p className="text-sm text-destructive">{errors.price}</p>
        )}
      </div>

      {/* Ingredients */}
      <div className="space-y-2">
        <Label htmlFor="ingredients">Ingredients / Description</Label>
        <Textarea
          id="ingredients"
          placeholder="e.g., Vodka, Kahlua, fresh espresso..."
          value={values.ingredients || ''}
          onChange={(e) => updateField('ingredients', e.target.value)}
          rows={2}
        />
      </div>

      {/* Conditions */}
      <div className="space-y-2">
        <Label htmlFor="conditions">Conditions / Fine Print</Label>
        <Textarea
          id="conditions"
          placeholder="e.g., Available Friday & Saturday only, while stocks last..."
          value={values.conditions || ''}
          onChange={(e) => updateField('conditions', e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
}
