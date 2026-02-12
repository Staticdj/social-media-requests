import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect admin routes (except login)
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (req.nextUrl.pathname === '/admin/login') {
      // If already logged in, redirect to dashboard
      if (session) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      return res;
    }

    // Redirect to login if not authenticated
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
