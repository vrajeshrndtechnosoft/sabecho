import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL; 

// Define your section-specific sitemaps
const sectionSitemaps = [
  'sitemap1.xml',
  'products-sitemap.xml',
  'dashboard-sitemap.xml',
  'products-subcategory-sitemap.xml',
  'products-detail-sitemap.xml',
  'products-location-sitemap.xml'
  // Add more as needed
];

export function generateMainSitemap(): void {
  const now = new Date().toISOString();

  const sitemapEntries = sectionSitemaps.map((filename) => {
    return `
  <sitemap>
    <loc>${BASE_URL}/${filename}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`;
  });

  const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapEntries.join('')}
</sitemapindex>`;

  const filePath = path.join(process.cwd(), 'public', 'sitemap.xml'); // This becomes your main sitemap index

  fs.writeFileSync(filePath, sitemapIndexXml.trim());

  console.log('✅ Main sitemap index generated at public/sitemap.xml');
}
