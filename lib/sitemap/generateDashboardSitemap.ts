import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL; // Replace with your domain

const staticRoutes: string[] = [
  '/profile',
  '/tracking',
  '/favourites',
];

export function generateDashboardSitemap(): void {
  const sitemapEntries = staticRoutes.map((route) => {
    return `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapEntries.join('')}
</urlset>`;

  const filePath = path.join(process.cwd(), 'public', 'dashboard-sitemap.xml');
  fs.writeFileSync(filePath, sitemapXml.trim());
  console.log('✅ Dashboard sitemap index generated at public/sitemap.xml');
}
