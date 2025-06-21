// Only load cron jobs if explicitly enabled (prevent during build or test)
if (process.env.ENABLE_CRON === 'true') {
  import('./sitemapCron');
}
