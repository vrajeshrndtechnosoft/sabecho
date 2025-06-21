  // app/api/init-cron/route.ts
  import { NextResponse } from 'next/server';
  import { initializeSitemapCron } from '@/lib/cron/sitemapCron';

  let cronInitialized = false;

  export async function GET() {
    if (!cronInitialized) {
      try {
        initializeSitemapCron();
        cronInitialized = true;
        return NextResponse.json({ 
          success: true, 
          message: 'Cron job initialized successfully' 
        });
      } catch (error) {
        return NextResponse.json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({ 
        success: true, 
        message: 'Cron job already initialized' 
      });
    }
  }