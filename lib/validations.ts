import { z } from 'zod';

// Common field schemas
export const postTypeSchema = z.enum([
  'blackboard_special',
  'drink_special',
  'event',
  'promotion',
  'other',
]);

export const statusSchema = z.enum(['new', 'needs_info', 'ready', 'archived']);

export const frequencySchema = z.enum(['once', 'twice', 'daily', 'custom']);

export const ctaSchema = z.enum([
  'book',
  'walk_ins',
  'order_at_bar',
  'call',
  'buy_tickets',
  'other',
]);

// Post type specific field schemas
export const blackboardSpecialSchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  price: z.string().min(1, 'Price is required'),
  short_description: z.string().optional(),
  ingredients: z.array(z.string()).optional(),
  dietary_tags: z.array(z.string()).optional(),
  sides: z.string().optional(),
  sauces_options: z.string().optional(),
  subject_to_availability: z.boolean().default(false),
});

export const drinkSpecialSchema = z.object({
  drink_name: z.string().min(1, 'Drink name is required'),
  price: z.string().min(1, 'Price is required'),
  ingredients: z.string().optional(),
  conditions: z.string().optional(),
});

export const eventSchema = z.object({
  event_name: z.string().min(1, 'Event name is required'),
  event_date: z.string().min(1, 'Event date is required'),
  event_time: z.string().optional(),
  location: z.string().optional(),
  entertainment: z.string().optional(),
  entry_fee: z.string().optional(),
  ticket_link: z.string().url().optional().or(z.literal('')),
  rules: z.string().optional(),
});

export const promotionSchema = z.object({
  promotion_name: z.string().min(1, 'Promotion name is required'),
  description: z.string().min(1, 'Description is required'),
  terms: z.string().optional(),
  valid_until: z.string().optional(),
});

export const otherSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
});

// Main submission schema
export const submissionSchema = z.object({
  venue_id: z.string().uuid(),
  post_type: postTypeSchema,
  run_start_date: z.string().min(1, 'Start date is required'),
  run_end_date: z.string().optional(),
  until_sold_out: z.boolean().default(false),
  post_frequency: frequencySchema,
  frequency_custom: z.string().optional(),
  cta: ctaSchema,
  cta_custom: z.string().optional(),
  fields_json: z.record(z.unknown()),
  notes: z.string().optional(),
});

// Venue schemas
export const createVenueSchema = z.object({
  name: z.string().min(1, 'Venue name is required').max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  pin: z.string().length(4).regex(/^\d+$/).optional().or(z.literal('')),
});

export const updateVenueSchema = createVenueSchema.partial();

// Validation helper
export function validateFieldsForPostType(
  postType: string,
  fields: Record<string, unknown>
): { success: boolean; error?: string; data?: unknown } {
  try {
    let schema;
    switch (postType) {
      case 'blackboard_special':
        schema = blackboardSpecialSchema;
        break;
      case 'drink_special':
        schema = drinkSpecialSchema;
        break;
      case 'event':
        schema = eventSchema;
        break;
      case 'promotion':
        schema = promotionSchema;
        break;
      case 'other':
        schema = otherSchema;
        break;
      default:
        return { success: false, error: 'Invalid post type' };
    }

    const result = schema.safeParse(fields);
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues.map((i) => i.message).join(', '),
      };
    }
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: 'Validation failed' };
  }
}

export type SubmissionInput = z.infer<typeof submissionSchema>;
export type CreateVenueInput = z.infer<typeof createVenueSchema>;
export type UpdateVenueInput = z.infer<typeof updateVenueSchema>;
