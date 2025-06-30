// lib/cron/sitemapCron.ts
import cron from 'node-cron';
import { generateAllSitemaps } from '@/lib/sitemap/generateAllSitemap';

export function initializeSitemapCron() {
  console.log('🚀 Initializing sitemap cron job...');
  
  // Test with everyday 6:00 AM seconds first, then change to daily
  const task = cron.schedule('0 6 * * * *', async () => {
    console.log('🕐 Cron job started: Generating sitemaps...');
    console.log('⏰ Current time:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    
    try {
      await generateAllSitemaps();
      console.log('✅ Cron job completed: All sitemaps generated');
    } catch (error) {
      console.error('❌ Cron job failed:', error);
    }
  }, {
    timezone: "Asia/Kolkata"
  });

  // Check if task was created successfully
  if (task) {
    task.start();
    console.log('📅 Sitemap generation cron job initialized and started');
    console.log('⚡ Running everyday 6:00 AM');
  } else {
    console.error('❌ Failed to create cron task');
  }
}