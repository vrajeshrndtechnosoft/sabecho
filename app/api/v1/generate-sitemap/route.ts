import { generateAllSitemaps } from '@/lib/sitemap/generateAllSitemap';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    generateAllSitemaps();
    return NextResponse.json({ message: 'Sitemap generated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 });
  }
}
