const express = require('express');
const path = require("path");
const http = require("http");
const cors = require("cors");
const mongoose = require('mongoose');
const serveStatic = require('serve-static');
const cron = require('node-cron');
const {exportAndBackupAllCollectionsmonthly} = require("./controller/Backup")
require('dotenv').config();
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const fs = require('fs').promises;
const https = require('https');
const compression = require('compression');
const app = express();
app.use(compression({
    level: 6,
    threshold: '5kb' // Lower compression threshold
  }));
// Middleware
app.use(express.json()); 
 
app.use(cookieParser());


cron.schedule('59 23 31 * *', () => {
   
    exportAndBackupAllCollectionsmonthly();
}, {
    scheduled: true,
    timezone: "Asia/Kolkata" 
});
app.use(express.json({ 
    limit: '1mb',  // Reduced from 5mb
    strict: true
  }));
  app.use(express.urlencoded({ 
    limit: '1mb',  // Reduced from 5mb
    extended: true,
    parameterLimit: 500 // Reduced parameter limit
  }));

// Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);
// Static file serving
app.use('/uploads', serveStatic(path.join(__dirname, 'uploads')));

// // Database connection
// mongoose.connect('mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/ostech', {
// }).then(() => {
//     console.log('Connected to MongoDB');
// }).catch(err => {
//     console.error('Failed to connect to MongoDB', err);
// });

// Use routes
app.use('/api/product', require('./routes/product'));
app.use('/api/services', require('./routes/services'));
app.use('/api/news', require('./routes/news'));
app.use('/api/pageHeading', require('./routes/pageHeading'));
app.use('/api/image', require('./routes/image'));
app.use('/api/testimonial', require('./routes/testinomial'));
app.use('/api/faq', require('./routes/FAQ'));
app.use('/api/staff', require('./routes/ourStaff'));
app.use('/api/banner', require('./routes/Banner'));
app.use('/api/pageContent', require('./routes/pageContent'));
app.use('/api/gallery', require('./routes/galleryImage'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/password',require('./routes/forgotpassword'));
app.use('/api/email', require('./routes/email'));
app.use('/api/partner', require('./routes/partners'));
app.use('/api/logo', require('./routes/logo'));
app.use('/api/backup', require('./routes/backup'));
app.use('/api/aboutusPoints', require('./routes/aboutuspoints'));
app.use("/api/achievements",require('./routes/achievements'))
app.use("/api/counter",require('./routes/counter'))
app.use("/api/inquiries",require('./routes/inquiry'))
app.use("/api/mission",require('./routes/mission'))
app.use("/api/vision",require('./routes/vision'))
app.use("/api/corevalue",require('./routes/corevalue')) 
app.use("/api/aboutcompany",require('./routes/aboutcompany'))
app.use("/api/careeroption",require('./routes/careeroption'))
app.use("/api/careerInquiries",require('./routes/careerinquiry'))
app.use("/api/footer",require('./routes/footer'))
app.use("/api/header",require('./routes/header'))  
app.use("/api/globalpresence",require('./routes/globalpresence'))
app.use("/api/whatsappsettings",require('./routes/whatsappsettings'))
app.use("/api/googlesettings",require('./routes/googlesettings'))
app.use("/api/menulisting",require('./routes/menulisting'))
app.use("/api/infrastructure",require('./routes/infrastructure'))
app.use("/api/qualitycontrol",require('./routes/qualitycontrol'))
app.use("/api/sitemap",require('./routes/sitemap'))
app.use("/api/benefits",require('./routes/benefits'))
app.use("/api/mainMission",require('./routes/mainMission')) 
app.use("/api/whyChooseUs", require('./routes/whyChooseUs')) 
app.use("/api/video", require('./routes/video'))
app.use("/api/banner1", require('./routes/homeYoutubeBanner'))
app.use("/api/upload", require('./routes/upload'))
app.use("/api/productInquiry", require('./routes/productInquiry'))
app.use("/api/infographic", require('./routes/infographic'))
app.use("/api/ourCapabilityService",require('./routes/ourCapabilityService'))

app.use("/api/ourProcess", require('./routes/ourProcess'))
// Start server
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Add near the top of the file
const port = process.env.PORT || 3000;
// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
  
  // Replace axios with node-fetch or custom HTTP client
  const customHttpClient = {
    get: (url, options = {}) => {
      return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const request = protocol.get(url, {
          timeout: 5000,
          ...options,
        }, (response) => {
          let data = '';
          response.on('data', (chunk) => data += chunk);
          response.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        });
  
        request.on('error', reject);
        request.on('timeout', () => {
          request.destroy();
          reject(new Error('Request timeout'));
        });
      });
    }
  };

  
  // Add these constants at the top
  const RESOURCE_LIMITS = {
    MAX_MEMORY_MB: 512,    // Reduced from 512MB to 256MB
    MAX_HEAP_MB: 256,      // Reduced from 256MB to 128MB
    IO_LIMIT_MB: 1,        // 1MB/s IO limit
    PROCESS_LIMIT: 20      // Entry processes limit
  };
  
  // Add resource monitoring function
  const monitorResources = () => {
    const used = process.memoryUsage();
    const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
    const rssUsedMB = Math.round(used.rss / 1024 / 1024);
    const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
    const externalMB = Math.round(used.external / 1024 / 1024);
    
    console.log('\n=== Server Resource Monitor ===');
    console.log(`📊 Memory Usage:`);
    console.log(`   - RSS: ${rssUsedMB}MB / ${RESOURCE_LIMITS.MAX_MEMORY_MB}MB`);
    console.log(`   - Heap: ${heapUsedMB}MB / ${heapTotalMB}MB`);
    console.log(`   - External: ${externalMB}MB`);
    console.log(`   - Usage: ${Math.round((rssUsedMB/RESOURCE_LIMITS.MAX_MEMORY_MB) * 100)}%`);
    
    if (heapUsedMB > RESOURCE_LIMITS.MAX_HEAP_MB * 0.7) {
      console.log('\n⚠️  High Memory Usage Detected');
      if (global.gc) {
        global.gc();
        console.log('♻️  Garbage Collection Triggered');
      }
    }
    
    if (rssUsedMB > RESOURCE_LIMITS.MAX_MEMORY_MB * 0.95) {
      console.error('\n🚨 CRITICAL: Memory Usage Exceeded');
      console.error('⚠️  Initiating Emergency Shutdown');
      process.emit('SIGTERM');
    }
    
    console.log('=============================\n');
  };
  
  // Add error recovery and resilience mechanisms
  const MAX_RESTART_ATTEMPTS = 3;
  let restartAttempts = 0;
  
  // Add global error handlers
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Log error but don't exit
    monitorResources();
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Log error but don't exit
    monitorResources();
  });
  
  // Modify startServer function with error recovery
  async function startServer() {
    let isShuttingDown = false;
    
    const initializeServer = async () => {
      try {
        // Database connection with retry mechanism
        const connectWithRetry = async (retries = 5) => {
          try {
            console.log('🔄 Attempting to connect to MongoDB...');
            console.log(`📡 Database URL: ${process.env.MONGODB_URI?.split('@')[1] || 'Using default connection string'}`);
            
            await mongoose.connect("mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/ostech", {
              serverSelectionTimeoutMS: 5000,
              socketTimeoutMS: 45000,
              maxPoolSize: 10,
              minPoolSize: 2,
              maxIdleTimeMS: 30000,
              family: 4,
              retryWrites: true,
              w: 'majority'
            });

            const dbStatus = mongoose.connection.readyState;
            const statusMessages = {
              0: '❌ Disconnected',
              1: '✅ Connected',
              2: '🔄 Connecting',
              3: '🔄 Disconnecting'
            };

            console.log('\n=== MongoDB Connection Status ===');
            console.log(`🟢 Status: ${statusMessages[dbStatus]}`);
            console.log(`📊 Max Pool Size: 5 connections`);
            console.log(`⏱️  Connection Timeout: 30 seconds`);
            console.log(`🔐 SSL/TLS: Enabled`);
            console.log(`📡 Database: ${mongoose.connection.name}`);
            console.log(`🖥️  Server: ${mongoose.connection.host}`);
            console.log('===============================\n');

            // Monitor connection events
            mongoose.connection.on('connected', () => {
              console.log('🎉 MongoDB connection established successfully');
            });

            mongoose.connection.on('error', (err) => {
              console.error('❌ MongoDB connection error:', err);
            });

            mongoose.connection.on('disconnected', () => {
              console.log('⚠️  MongoDB connection disconnected');
            });

            mongoose.connection.on('reconnected', () => {
              console.log('🔄 MongoDB connection reestablished');
            });

            restartAttempts = 0;
            return true;

          } catch (error) {
            console.error('\n=== MongoDB Connection Error ===');
            console.error('❌ Failed to connect to MongoDB');
            console.error(`🔍 Error Type: ${error.name}`);
            console.error(`❗ Error Message: ${error.message}`);
            
            if (error.code) {
              console.error(`🔢 Error Code: ${error.code}`);
            }

            // More specific error messages
            if (error.name === 'MongoServerSelectionError') {
              console.error('📋 Possible causes:');
              console.error('   - IP address not whitelisted in MongoDB Atlas');
              console.error('   - Invalid connection string');
              console.error('   - Network connectivity issues');
              console.error('   - MongoDB Atlas server might be down');
            }

            if (retries > 0) {
              const delay = 10000; // 10 seconds
              console.log(`\n⏳ Retrying connection in ${delay/1000} seconds...`);
              console.log(`🔄 Attempts remaining: ${retries}`);
              console.log('===============================\n');
              
              await new Promise(resolve => setTimeout(resolve, delay));
              return connectWithRetry(retries - 1);
            }

            console.error('\n❌ Maximum retry attempts reached');
            console.error('🛑 Server initialization failed');
            console.error('===============================\n');
            throw error;
          }
        };
  
        await connectWithRetry();
  
        // Only create and start the server once
        if (!global.server) {
          global.server = http.createServer(app);
          
          global.server.on('error', (error) => {
            console.error('Server error:', error);
            // Attempt recovery instead of crashing
            if (!isShuttingDown) {
              console.log('Attempting to recover from server error...');
              setTimeout(() => {
                if (restartAttempts < MAX_RESTART_ATTEMPTS) {
                  restartAttempts++;
                  initializeServer();
                }
              }, 5000);
            }
          });
  
          global.server.listen(port, () => {
            console.log(`Server running on port ${port}`);
          });
  
          // Optimize server settings
          global.server.keepAliveTimeout = 30000;
          global.server.headersTimeout = 35000;
          global.server.maxHeadersCount = 100;
        }
  
        // Monitor resources periodically
        const monitoringInterval = setInterval(monitorResources, 5000);
  
        // Graceful shutdown handler
        const shutdownServer = async () => {
          if (isShuttingDown) return;
          isShuttingDown = true;
  
          console.log("Starting graceful shutdown...");
          clearInterval(monitoringInterval);
  
          try {
            await new Promise((resolve) => {
              if (global.server) {
                global.server.close(resolve);
                setTimeout(resolve, 10000);
              } else {
                resolve();
              }
            });
            console.log("HTTP server closed successfully");
  
            // Close database connection
            if (mongoose.connection.readyState !== 0) {
              await mongoose.connection.close();
              console.log("Database connection closed successfully");
            }
  
            console.log("Graceful shutdown completed");
          } catch (error) {
            console.error("Error during shutdown:", error);
          }
        };
  
        // Process termination handlers
        process.on('SIGTERM', shutdownServer);
        process.on('SIGINT', shutdownServer);
  
      } catch (error) {
        console.error("Server initialization error:", error);
        if (restartAttempts < MAX_RESTART_ATTEMPTS) {
          restartAttempts++;
          console.log(`Attempting server restart... (Attempt ${restartAttempts}/${MAX_RESTART_ATTEMPTS})`);
          setTimeout(initializeServer, 5000);
        }
      }
    };
  
    // Start the server
    await initializeServer();
  }
  
  // Start the server with error handling
  startServer().catch(error => {
    console.error("Fatal error during server startup:", error);
    // Don't exit, let the recovery mechanism handle it
  });
  
  module.exports = app;
