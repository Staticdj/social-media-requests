-- =============================================
-- Social Media Requests - Database Schema
-- =============================================
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- Venues table
CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  access_key VARCHAR(64) NOT NULL,
  pin VARCHAR(4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_venues_slug ON public.venues(slug);

-- Submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  post_type VARCHAR(30) NOT NULL CHECK (post_type IN ('blackboard_special', 'drink_special', 'event', 'promotion', 'other')),
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'needs_info', 'ready', 'archived')),
  run_start_date DATE NOT NULL,
  run_end_date DATE,
  until_sold_out BOOLEAN DEFAULT FALSE,
  post_frequency VARCHAR(20) NOT NULL DEFAULT 'once' CHECK (post_frequency IN ('once', 'twice', 'daily', 'custom')),
  frequency_custom VARCHAR(100),
  cta VARCHAR(30) NOT NULL DEFAULT 'walk_ins' CHECK (cta IN ('book', 'walk_ins', 'order_at_bar', 'call', 'buy_tickets', 'other')),
  cta_custom VARCHAR(100),
  fields_json JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_submissions_venue_id ON public.submissions(venue_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at DESC);

-- Attachments table
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INTEGER NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups by submission
CREATE INDEX IF NOT EXISTS idx_attachments_submission_id ON public.attachments(submission_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_venues_updated_at ON public.venues;
CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON public.venues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_submissions_updated_at ON public.submissions;
CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get submission counts by status
CREATE OR REPLACE FUNCTION get_submission_counts_by_status()
RETURNS TABLE (status VARCHAR, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT s.status, COUNT(*)::BIGINT
  FROM public.submissions s
  GROUP BY s.status;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Policies for venues
-- Authenticated users (admin) can do everything
CREATE POLICY "Admin full access to venues"
  ON public.venues
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Anonymous users can read venues (for form submission validation)
CREATE POLICY "Anon can read venues"
  ON public.venues
  FOR SELECT
  TO anon
  USING (true);

-- Policies for submissions
-- Authenticated users (admin) can do everything
CREATE POLICY "Admin full access to submissions"
  ON public.submissions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Anonymous users can insert submissions
CREATE POLICY "Anon can insert submissions"
  ON public.submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policies for attachments
-- Authenticated users (admin) can do everything
CREATE POLICY "Admin full access to attachments"
  ON public.attachments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Anonymous users can insert attachments
CREATE POLICY "Anon can insert attachments"
  ON public.attachments
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- =============================================
-- STORAGE BUCKET
-- =============================================

-- Create storage bucket for attachments (run in SQL editor)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies
CREATE POLICY "Anyone can upload attachments"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'attachments');

CREATE POLICY "Anyone can view attachments"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'attachments');

CREATE POLICY "Authenticated users can delete attachments"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'attachments');
