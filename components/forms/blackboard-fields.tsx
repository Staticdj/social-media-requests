'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const DIETARY_TAGS = [
  { id: 'GF', label: 'Gluten Free' },
  { id: 'GFO', label: 'Gluten Free Option' },
  { id: 'V', label: 'Vegetarian' },
  { id: 'VG', label: 'Vegan' },
  { id: 'DF', label: 'Dairy Free' },
  { id: 'NF', label: 'Nut Free' },
];

interface BlackboardFieldsProps {
  values: {
    item_name: string;
    price: string;
    short_description: string;
    ingredients: string[];
    dietary_tags: string[];
    sides: string;
    sauces_options: string;
    subject_to_availability: boolean;
  };
  onChange: (values: BlackboardFieldsProps['values']) => void;
  errors?: Record<string, string>;
}

export function BlackboardFields({ values, onChange, errors }: BlackboardFieldsProps) {
  const updateField = (field: string, value: unknown) => {
    onChange({ ...values, [field]: value });
  };

  const toggleDietaryTag = (tagId: string) => {
    const currentTags = values.dietary_tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((t) => t !== tagId)
      : [...currentTags, tagId];
    updateField('dietary_tags', newTags);
  };

  return (
    <div className="space-y-6">
      {/* Item Name */}
      <div className="space-y-2">
        <Label htmlFor="item_name">
          Item Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="item_name"
          placeholder="e.g., Chicken Parmi"
          value={values.item_name || ''}
          onChange={(e) => updateField('item_name', e.target.value)}
          error={!!errors?.item_name}
        />
        {errors?.item_name && (
          <p className="text-sm text-destructive">{errors.item_name}</p>
        )}
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price">
          Price <span className="text-destructive">*</span>
        </Label>
        <Input
          id="price"
          placeholder="e.g., $18.00"
          value={values.price || ''}
          onChange={(e) => updateField('price', e.target.value)}
          error={!!errors?.price}
        />
        {errors?.price && (
          <p className="text-sm text-destructive">{errors.price}</p>
        )}
      </div>

      {/* Short Description */}
      <div className="space-y-2">
        <Label htmlFor="short_description">Short Description</Label>
        <Textarea
          id="short_description"
          placeholder="Brief description for the social post..."
          value={values.short_description || ''}
          onChange={(e) => updateField('short_description', e.target.value)}
          rows={2}
        />
      </div>

      {/* Ingredients */}
      <div className="space-y-2">
        <Label htmlFor="ingredients">Key Ingredients</Label>
        <Textarea
          id="ingredients"
          placeholder="List key ingredients, one per line..."
          value={(values.ingredients || []).join('\n')}
          onChange={(e) =>
            updateField(
              'ingredients',
              e.target.value.split('\n').filter((i) => i.trim())
            )
          }
          rows={3}
        />
        <p className="text-xs text-muted-foreground">One ingredient per line</p>
      </div>

      {/* Dietary Tags */}
      <div className="space-y-3">
        <Label>Dietary Information</Label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_TAGS.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleDietaryTag(tag.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                (values.dietary_tags || []).includes(tag.id)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sides */}
      <div className="space-y-2">
        <Label htmlFor="sides">Sides / Accompaniments</Label>
        <Input
          id="sides"
          placeholder="e.g., Chips & salad"
          value={values.sides || ''}
          onChange={(e) => updateField('sides', e.target.value)}
        />
      </div>

      {/* Sauces */}
      <div className="space-y-2">
        <Label htmlFor="sauces_options">Sauces / Options</Label>
        <Input
          id="sauces_options"
          placeholder="e.g., Choice of gravy, pepper, or mushroom sauce"
          value={values.sauces_options || ''}
          onChange={(e) => updateField('sauces_options', e.target.value)}
        />
      </div>

      {/* Subject to availability */}
      <div className="flex items-center justify-between py-2">
        <div>
          <Label htmlFor="subject_to_availability">Subject to Availability</Label>
          <p className="text-sm text-muted-foreground">
            Add "while stocks last" disclaimer
          </p>
        </div>
        <Switch
          id="subject_to_availability"
          checked={values.subject_to_availability || false}
          onCheckedChange={(checked) =>
            updateField('subject_to_availability', checked)
          }
        />
      </div>
    </div>
  );
}
