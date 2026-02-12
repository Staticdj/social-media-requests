// Database types
export type PostType =
  | 'blackboard_special'
  | 'drink_special'
  | 'event'
  | 'promotion'
  | 'other';

export type SubmissionStatus = 'new' | 'needs_info' | 'ready' | 'archived';

export type PostFrequency = 'once' | 'twice' | 'daily' | 'custom';

export type CTAType =
  | 'book'
  | 'walk_ins'
  | 'order_at_bar'
  | 'call'
  | 'buy_tickets'
  | 'other';

export interface Venue {
  id: string;
  name: string;
  slug: string;
  access_key: string;
  pin?: string;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  venue_id: string;
  post_type: PostType;
  status: SubmissionStatus;
  run_start_date: string;
  run_end_date?: string;
  until_sold_out: boolean;
  post_frequency: PostFrequency;
  frequency_custom?: string;
  cta: CTAType;
  cta_custom?: string;
  fields_json: Record<string, unknown>;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  venue?: Venue;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  submission_id: string;
  file_url: string;
  file_type: string;
  file_size: number;
  original_name: string;
  created_at: string;
}

// Form-specific types
export interface BlackboardSpecialFields {
  item_name: string;
  price: string;
  short_description?: string;
  ingredients?: string[];
  dietary_tags?: string[];
  sides?: string;
  sauces_options?: string;
  subject_to_availability: boolean;
}

export interface DrinkSpecialFields {
  drink_name: string;
  price: string;
  ingredients?: string;
  conditions?: string;
}

export interface EventFields {
  event_name: string;
  event_date: string;
  event_time?: string;
  location?: string;
  entertainment?: string;
  entry_fee?: string;
  ticket_link?: string;
  rules?: string;
}

export interface PromotionFields {
  promotion_name: string;
  description: string;
  terms?: string;
  valid_until?: string;
}

export interface OtherFields {
  title: string;
  description: string;
}

export type FieldsJson =
  | BlackboardSpecialFields
  | DrinkSpecialFields
  | EventFields
  | PromotionFields
  | OtherFields;

// Form submission payload
export interface SubmissionPayload {
  venue_id: string;
  post_type: PostType;
  run_start_date: string;
  run_end_date?: string;
  until_sold_out: boolean;
  post_frequency: PostFrequency;
  frequency_custom?: string;
  cta: CTAType;
  cta_custom?: string;
  fields_json: FieldsJson;
  notes?: string;
  attachments: File[];
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadedFile {
  url: string;
  name: string;
  type: string;
  size: number;
}
