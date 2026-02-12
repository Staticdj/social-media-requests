import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const formData = await request.formData();

    // Extract form fields
    const venueId = formData.get('venue_id') as string;
    const postType = formData.get('post_type') as string;
    const runStartDate = formData.get('run_start_date') as string;
    const runEndDate = formData.get('run_end_date') as string;
    const untilSoldOut = formData.get('until_sold_out') === 'true';
    const postFrequency = formData.get('post_frequency') as string;
    const frequencyCustom = formData.get('frequency_custom') as string;
    const cta = formData.get('cta') as string;
    const ctaCustom = formData.get('cta_custom') as string;
    const fieldsJson = JSON.parse((formData.get('fields_json') as string) || '{}');
    const notes = formData.get('notes') as string;

    // Validate required fields
    if (!venueId || !postType || !runStartDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate venue exists
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('*')
      .eq('id', venueId)
      .single();

    if (venueError || !venue) {
      return NextResponse.json({ error: 'Invalid venue' }, { status: 400 });
    }

    // Create submission
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        venue_id: venueId,
        post_type: postType,
        status: 'new',
        run_start_date: runStartDate,
        run_end_date: runEndDate || null,
        until_sold_out: untilSoldOut,
        post_frequency: postFrequency,
        frequency_custom: frequencyCustom || null,
        cta: cta,
        cta_custom: ctaCustom || null,
        fields_json: fieldsJson,
        notes: notes || null,
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Submission error:', submissionError);
      return NextResponse.json(
        { error: 'Failed to create submission' },
        { status: 500 }
      );
    }

    // Handle file uploads
    const uploadedFiles: Array<{
      url: string;
      type: string;
      size: number;
      name: string;
    }> = [];

    const fileEntries = Array.from(formData.entries()).filter(([key]) =>
      key.startsWith('file_')
    );

    for (const [key, value] of fileEntries) {
      if (value instanceof File && value.size > 0) {
        const file = value;

        if (!ALLOWED_FILE_TYPES.includes(file.type)) continue;
        if (file.size > MAX_FILE_SIZE) continue;

        const ext = file.name.split('.').pop();
        const filename = `${submission.id}/${nanoid()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filename, file, {
            contentType: file.type,
            cacheControl: '3600',
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('attachments').getPublicUrl(filename);

        uploadedFiles.push({
          url: publicUrl,
          type: file.type,
          size: file.size,
          name: file.name,
        });
      }
    }

    // Insert attachment records
    if (uploadedFiles.length > 0) {
      const attachmentRecords = uploadedFiles.map((file) => ({
        submission_id: submission.id,
        file_url: file.url,
        file_type: file.type,
        file_size: file.size,
        original_name: file.name,
      }));

      await supabase.from('attachments').insert(attachmentRecords);
    }

    // Send email notification (optional - won't fail if it errors)
    try {
      const resendKey = process.env.RESEND_API_KEY;
      const adminEmail = process.env.ADMIN_EMAIL;

      if (resendKey && adminEmail) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: 'Social Media Requests <onboarding@resend.dev>',
            to: adminEmail,
            subject: `[${venue.name}] New ${postType.replace('_', ' ')} Request`,
            html: `<p>New submission from <strong>${venue.name}</strong></p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/submissions/${submission.id}">View Submission</a></p>`,
          }),
        });
      }
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    return NextResponse.json({
      success: true,
      data: { id: submission.id, attachments: uploadedFiles.length },
    });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}