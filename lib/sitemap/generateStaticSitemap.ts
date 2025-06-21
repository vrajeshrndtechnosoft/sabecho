import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL;  // Replace with your domain

const staticRoutes: string[] = [
  '/',
  '/about',
  '/contact',
];

export function generateStaticSitemap(): void {
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

  const filePath = path.join(process.cwd(), 'public', 'sitemap1.xml');
  fs.writeFileSync(filePath, sitemapXml.trim());
  console.log('✅ sitemap1 index generated at public/sitemap.xml');
}
