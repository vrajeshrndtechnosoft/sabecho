import fs from 'fs';
import path from 'path';

import { Category } from '@/models/Category';
import Product from '@/models/Product';

const BASE_URL = process.env.BASE_URL;

export async function generateProductsSitemap(): Promise<void> {
  try {

    // Fetch distinct categories
    const categories: string[] = await Category.distinct('category');

    const now = new Date().toISOString();

    const sitemapEntries = categories.map((category) => {
      const slug = category.toLowerCase().replace(/\s+/g, '-'); // e.g., "Home Appliances" -> "home-appliances"
      return `
            <url>
                <loc>${BASE_URL}/products/${slug}</loc>
                <lastmod>${now}</lastmod>
                <changefreq>weekly</changefreq>
                <priority>0.8</priority>
            </url>`;
                });

                const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
            <urlset
            xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${sitemapEntries.join('')}
            </urlset>`;

    const filePath = path.join(process.cwd(), 'public', 'products-sitemap.xml');
    fs.writeFileSync(filePath, sitemapXml.trim());

    console.log('✅ products-sitemap.xml generated');
  } catch (err) {
    console.error('❌ Failed to generate products sitemap:', err);
  }
}

export async function generateProductSubcategorySitemap(): Promise<void> {
  try {

    const categories = await Category.find({}).lean();

    const now = new Date().toISOString();

    const sitemapEntries: string[] = [];

    for (const category of categories) {
      const categorySlug = category.slug;

      for (const sub of category.subCategory) {
        const subSlug = sub.slug;
        if (categorySlug && subSlug) {
          sitemapEntries.push(`
            <url>
                <loc>${BASE_URL}/products/${categorySlug}/${subSlug}</loc>
                <lastmod>${now}</lastmod>
                <changefreq>weekly</changefreq>
                <priority>0.7</priority>
            </url>`);
                    }
                }
                }

                const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
            <urlset
            xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${sitemapEntries.join('')}
            </urlset>`;

    const filePath = path.join(process.cwd(), 'public', 'products-subcategory-sitemap.xml');
    fs.writeFileSync(filePath, sitemapXml.trim());

    console.log('✅ products-subcategory-sitemap.xml generated');
  } catch (err) {
    console.error('❌ Failed to generate subcategory sitemap:', err);
  }
}

// Helper to slugify strings
const toSlug = (str: string): string =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

export async function generateProductDetailsSitemap(): Promise<void> {
  try {

    const products = await Product.find(
      { categoryType: { $ne: "" }, categorySubType: { $ne: "" }, name: { $ne: "" } },
      { categoryType: 1, categorySubType: 1, name: 1, createdAt: 1 }
    ).lean();

    const now = new Date().toISOString();

    const sitemapEntries = products.map((product) => {
      const categorySlug = toSlug(product.categoryType || "");
      const subcategorySlug = toSlug(product.categorySubType || "");
      const productSlug = toSlug(product.name);

      return `
  <url>
    <loc>${BASE_URL}/products/${categorySlug}/${subcategorySlug}/${productSlug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapEntries.join('')}
</urlset>`;

    const filePath = path.join(process.cwd(), 'public', 'products-detail-sitemap.xml');
    fs.writeFileSync(filePath, sitemapXml.trim());

    console.log('✅ products-detail-sitemap.xml generated');
  } catch (err) {
    console.error('❌ Failed to generate product detail sitemap:', err);
  }
}

export async function generateProductLocationSitemap(): Promise<void> {
  try {
    // 👇 remove connectDb/closeDbConnection here!
    const categories = await Category.find({}).lean();

    const now = new Date().toISOString();
    const sitemapEntries: string[] = [];

    for (const category of categories) {
      const categorySlug = category.slug;
      for (const sub of category.subCategory) {
        const subSlug = sub.slug;

        for (const product of sub.product || []) {
          const productSlug = toSlug(product.p_name || '');
          const locationSlug = toSlug(product.location || '');

          if (categorySlug && subSlug && productSlug && locationSlug) {
            sitemapEntries.push(`
  <url>
    <loc>${BASE_URL}/products/${categorySlug}/${subSlug}/${productSlug}/${locationSlug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`);
          }
        }
      }
    }

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join('')}
</urlset>`;

    const filePath = path.join(process.cwd(), 'public', 'products-location-sitemap.xml');
    fs.writeFileSync(filePath, sitemapXml.trim());

    console.log('✅ products-location-sitemap.xml generated');
  } catch (err) {
    console.error('❌ Failed to generate product location sitemap:', err);
  }
}


