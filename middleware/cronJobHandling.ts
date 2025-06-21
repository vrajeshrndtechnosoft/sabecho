import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This will run once when the server starts
let cronInitialized = false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(request: NextRequest) {
  if (!cronInitialized) {
    // Dynamic import to avoid issues
    import('@/lib/cron/sitemapCron').then(({ initializeSitemapCron }) => {
      initializeSitemapCron();
      cronInitialized = true;
      console.log('✅ Cron initialized via middleware');
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}