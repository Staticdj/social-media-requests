# Social Media Requests

A web application for collecting social media content requests from venues. Each venue gets a unique link (no login required) to submit content requests including photos/videos. Admin dashboard to manage submissions with email notifications.

## Features

- **Venue Access Links**: Each venue has a unique URL with an unguessable token
- **Dynamic Forms**: Form fields change based on post type (Blackboard Special, Drink Special, Event, Promotion, Other)
- **File Uploads**: Support for photos (JPG, PNG, WebP) and videos (MP4, MOV) up to 50MB
- **Admin Dashboard**: View/manage submissions with status workflow (New → Needs Info → Ready → Archived)
- **Email Notifications**: Admin receives email on each new submission
- **Mobile Friendly**: Responsive design optimized for mobile submission

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth
- **Email**: Resend
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Resend account
- Vercel account (for deployment)

### 1. Clone and Install

```bash
git clone <your-repo>
cd social-media-requests
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`

3. Go to **Authentication > Users** and create your admin user:
   - Click "Add User"
   - Enter your email and password
   - This will be your admin login

4. Get your API keys from **Settings > API**:
   - `NEXT_PUBLIC_SUPABASE_URL`: [Your project URL](https://bonosgwaxrlhipxeopui.supabase.co)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbm9zZ3dheHJsaGlweGVvcHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTk1NjQsImV4cCI6MjA4NjQzNTU2NH0.U7sMt9Vd_v664ijbaQPlL5YihE-WidrVyNno3XX6i-U
   - `SUPABASE_SERVICE_ROLE_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbm9zZ3dheHJsaGlweGVvcHVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDg1OTU2NCwiZXhwIjoyMDg2NDM1NTY0fQ.tmTWRiP1TKh6r09eGCY-WV1D07jfoortzU3qhUJjOec

### 3. Set Up Resend

1. Create account at [resend.com](https://resend.com)

2. Get your API key from the dashboard re_9F3CazcW_E5aysrXavkVruMdkx5Uk7rqy

3. (Optional) Add and verify your domain for branded emails

### 4. Configure Environment Variables

Copy the example env file:

```bash
cp .env.example .env.local
```

Fill in your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend
RESEND_API_KEY=re_xxxxx

# Admin email for notifications
ADMIN_EMAIL=your@email.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Create Your First Venue

1. Go to `/admin/login`
2. Sign in with your admin credentials
3. Navigate to **Venues**
4. Click **Add Venue**
5. Copy the generated link and share with the venue

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo

2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel URL, e.g., `https://your-app.vercel.app`)

3. Deploy!

### 3. Update Resend Domain (Optional)

For production, update the `from` address in `lib/email.ts`:

```typescript
from: 'Social Media Requests <notifications@yourdomain.com>',
```

## Project Structure

```
├── app/
│   ├── admin/
│   │   ├── dashboard/      # Admin dashboard
│   │   ├── login/          # Admin login
│   │   ├── submissions/    # Submission inbox
│   │   │   └── [id]/       # Submission detail
│   │   └── venues/         # Venue management
│   ├── api/
│   │   └── submissions/    # Submission API
│   └── submit/
│       └── [slug]/         # Venue submission form
├── components/
│   ├── admin/              # Admin-specific components
│   ├── forms/              # Form components
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── email.ts            # Resend email service
│   ├── supabase/           # Supabase clients
│   ├── utils.ts            # Utility functions
│   └── validations.ts      # Zod schemas
├── supabase/
│   └── schema.sql          # Database schema
└── types/
    └── index.ts            # TypeScript types
```

## Form Field Reference

### Blackboard Special
- Item Name (required)
- Price (required)
- Short Description
- Ingredients
- Dietary Tags (GF, GFO, V, VG, DF, NF)
- Sides
- Sauces/Options
- Subject to Availability toggle

### Drink Special
- Drink Name (required)
- Price (required)
- Ingredients
- Conditions

### Event
- Event Name (required)
- Event Date (required)
- Event Time
- Location
- Entertainment
- Entry Fee
- Ticket Link
- Rules

### Promotion
- Promotion Name (required)
- Description (required)
- Terms & Conditions
- Valid Until

### Other
- Title (required)
- Description (required)

## Common Fields (All Post Types)
- Run Start Date (required)
- Run End Date / Until Sold Out
- Post Frequency (once/twice/daily/custom)
- Call to Action
- Photo/Video Attachments
- Additional Notes

## Security

- **Access Keys**: Venue links use 32-character random tokens
- **Row Level Security**: Supabase RLS policies protect data
- **File Validation**: Type and size validation on uploads
- **Admin Auth**: Supabase Auth protects admin routes

## Customization

### Adding New Post Types

1. Update `types/index.ts` with new type
2. Create new field component in `components/forms/`
3. Add validation schema in `lib/validations.ts`
4. Update `POST_TYPES` array in submission form
5. Add case to `renderPostTypeFields()` in form

### Modifying Email Template

Edit `lib/email.ts` to customize the notification email content and styling.

### Adding New CTA Options

Update the `CTA_OPTIONS` array in `components/forms/submission-form.tsx`.

## Support

For issues or questions, create an issue on GitHub.

## License

MIT
