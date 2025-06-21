import { generateAllProductSitemaps } from '@/lib/sitemap/generaateProductSitemap';
import { generateDashboardSitemap } from '@/lib/sitemap/generateDashboardSitemap';
import { generateMainSitemap } from '@/lib/sitemap/generateMainSitemap';
import { generateStaticSitemap } from '@/lib/sitemap/generateStaticSitemap';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    generateMainSitemap();
    generateStaticSitemap();
    generateDashboardSitemap();
    generateAllProductSitemaps();
    return NextResponse.json({ message: 'Sitemap generated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 });
  }
}
