import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // For now, just let all requests through
  // Auth will be handled at the page level
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};