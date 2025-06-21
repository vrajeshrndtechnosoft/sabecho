import { connectDb, closeDbConnection } from '@/lib/db';
import { generateProductDetailsSitemap, generateProductLocationSitemap, generateProductsSitemap, generateProductSubcategorySitemap } from './generateProductSitemap';
import { generateDashboardSitemap } from './generateDashboardSitemap';
import { generateMainSitemap } from './generateMainSitemap';
import { generateStaticSitemap } from './generateStaticSitemap';

export async function generateAllSitemaps() {
  try {
   

    await generateMainSitemap();
    await generateStaticSitemap();
    await generateDashboardSitemap(); 
    await connectDb();
    await generateProductsSitemap();
    await generateProductSubcategorySitemap();
    await generateProductDetailsSitemap();
    await generateProductLocationSitemap();
    console.log("✅ All sitemaps generated");
  } catch (err) {
    console.error("❌ Sitemap generation failed:", err);
  } finally {
    await closeDbConnection();
  }
}