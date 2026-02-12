import { Resend } from 'resend';
import type { Submission, Venue } from '@/types';
import { getPostTypeLabel, formatDate } from '@/lib/utils';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendSubmissionNotificationParams {
  submission: Submission;
  venue: Venue;
  attachmentCount: number;
}

export async function sendSubmissionNotification({
  submission,
  venue,
  attachmentCount,
}: SendSubmissionNotificationParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.error('ADMIN_EMAIL not configured');
    return { success: false, error: 'Admin email not configured' };
  }

  const submissionUrl = `${appUrl}/admin/submissions/${submission.id}`;
  const postTypeLabel = getPostTypeLabel(submission.post_type);

  // Build field summary based on post type
  const fields = submission.fields_json as Record<string, unknown>;
  let fieldsSummary = '';

  switch (submission.post_type) {
    case 'blackboard_special':
      fieldsSummary = `
        <p><strong>Item:</strong> ${fields.item_name || 'N/A'}</p>
        <p><strong>Price:</strong> ${fields.price || 'N/A'}</p>
        ${fields.short_description ? `<p><strong>Description:</strong> ${fields.short_description}</p>` : ''}
      `;
      break;
    case 'drink_special':
      fieldsSummary = `
        <p><strong>Drink:</strong> ${fields.drink_name || 'N/A'}</p>
        <p><strong>Price:</strong> ${fields.price || 'N/A'}</p>
      `;
      break;
    case 'event':
      fieldsSummary = `
        <p><strong>Event:</strong> ${fields.event_name || 'N/A'}</p>
        <p><strong>Date:</strong> ${fields.event_date ? formatDate(fields.event_date as string) : 'N/A'}</p>
        ${fields.event_time ? `<p><strong>Time:</strong> ${fields.event_time}</p>` : ''}
      `;
      break;
    case 'promotion':
      fieldsSummary = `
        <p><strong>Promotion:</strong> ${fields.promotion_name || 'N/A'}</p>
        ${fields.description ? `<p><strong>Description:</strong> ${fields.description}</p>` : ''}
      `;
      break;
    default:
      fieldsSummary = `
        <p><strong>Title:</strong> ${fields.title || 'N/A'}</p>
      `;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
          .header .venue { opacity: 0.9; font-size: 14px; margin-top: 4px; }
          .content { background: #ffffff; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px; }
          .badge { display: inline-block; background: #3b82f6; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
          .section { margin: 20px 0; }
          .section h3 { font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
          .fields p { margin: 4px 0; }
          .fields strong { color: #475569; }
          .meta { display: flex; gap: 24px; flex-wrap: wrap; }
          .meta-item { }
          .meta-item .label { font-size: 12px; color: #64748b; }
          .meta-item .value { font-weight: 500; }
          .cta { margin-top: 24px; }
          .cta a { display: inline-block; background: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; }
          .cta a:hover { background: #1e293b; }
          .footer { margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Submission Received</h1>
            <div class="venue">${venue.name}</div>
          </div>
          <div class="content">
            <div>
              <span class="badge">${postTypeLabel}</span>
            </div>
            
            <div class="section">
              <h3>Details</h3>
              <div class="fields">
                ${fieldsSummary}
              </div>
            </div>
            
            <div class="section">
              <h3>Schedule</h3>
              <div class="meta">
                <div class="meta-item">
                  <div class="label">Start Date</div>
                  <div class="value">${formatDate(submission.run_start_date)}</div>
                </div>
                ${submission.run_end_date ? `
                <div class="meta-item">
                  <div class="label">End Date</div>
                  <div class="value">${submission.until_sold_out ? 'Until sold out' : formatDate(submission.run_end_date)}</div>
                </div>
                ` : ''}
                <div class="meta-item">
                  <div class="label">Frequency</div>
                  <div class="value">${submission.post_frequency}</div>
                </div>
                <div class="meta-item">
                  <div class="label">Attachments</div>
                  <div class="value">${attachmentCount} file${attachmentCount !== 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>
            
            <div class="cta">
              <a href="${submissionUrl}">View Submission →</a>
            </div>
            
            <div class="footer">
              This email was sent from your Social Media Request system.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Social Media Requests <noreply@resend.dev>', // Update with your domain
      to: adminEmail,
      subject: `[${venue.name}] New ${postTypeLabel} Request`,
      html: htmlContent,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: 'Failed to send notification email' };
  }
}
