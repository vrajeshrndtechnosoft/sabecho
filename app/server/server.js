const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require('mongoose');
const { connectDb } = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandler");
const helmet = require('helmet');
const errerHandle = require('./middleware/errorHandler');
const fs = require('fs').promises;
const https = require('https');
const compression = require('compression');
const performanceLogger = require('./utils/performanceLogger');

const paymentRouter = require("./routes/paymentRouter");

// Load environment variables
dotenv.config();

// Initialize express app with optimized settings
const app = express();
app.use(compression({
  level: 6,
  threshold: '5kb' // Lower compression threshold
}));

// Environment variables
const port = process.env.PORT || 4000;
const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

// Check for required environment variables
if (!key_id || !key_secret) {
  throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env file');
}

// Middleware
app.use(errerHandle);
app.use(cors());
app.use(helmet());
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


// Routes
app.use("/api/v1/explore-categories", require("./routes/general/exploreRoutes"));
app.use("/api/v1/why-choose", require("./routes/general/whochooseRouter"));
app.use("/api/v1/why-services", require("./routes/general/whoservicesRouter"));
app.use("/api/v1/aboutus", require("./routes/general/aboutRouter"));
app.use("/api/v1/about-us", require("./routes/general/aboutUsRouters"));
app.use("/api/v1", require("./routes/general/contactRoutes"));
app.use("/api/v1/testimonials", require("./routes/general/testimonialRoutes"));
app.use("/api/v1", require("./routes/authRoutes"));
app.use("/api/v1", require("./routes/encriptionProfileRouter"));
app.use("/api/v1", require("./routes/categoryRouter"));
app.use("/api/v1", require("./routes/productRouter"));
app.use("/api/v1", require("./routes/requirementRouter"));
app.use("/api/v1", require("./routes/emailRouter"));
app.use("/api/v1", require("./routes/quotationRouter"));
app.use("/api/v1", require("./routes/quotaRequirementRouter"));
app.use("/api/v1", require("./routes/searchRouter"));
app.use("/api/v1", require("./routes/sendMailRouter"));
app.use("/api/v1", require("./routes/notifications"));
app.use("/api/v1", require("./routes/favoriteRouter"));
app.use("/api/v1", require("./routes/negotiationRouter"));
app.use("/api/v1", require("./routes/gstRoutes"));
app.use("/api/payments", paymentRouter);
app.use(errorHandler);

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

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

// Modify the generateSitemap function
const generateSitemap = async () => {
  try {
    // Increase chunk size and add memory limits
    const CHUNK_SIZE = 50;
    const MAX_ITEMS = 10000;

    // Use custom HTTP client instead of axios
    const response = await customHttpClient.get('http://localhost:5000/api/v1/category/navbardata');
    
    if (!response || !Array.isArray(response)) {
      throw new Error('Invalid response format');
    }

    // Limit total items to prevent memory issues
    const limitedData = response.slice(0, MAX_ITEMS);

    const processInChunks = async (data) => {
      const results = [];
      for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        const chunk = data.slice(i, i + CHUNK_SIZE);
        results.push(...await processChunk(chunk));
        
        // Force garbage collection after each chunk if available
        if (global.gc) {
          global.gc();
        }
        
        // Add small delay between chunks to prevent memory pressure
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return results;
    };

    const processChunk = async (chunk) => {
      return chunk.map(category => ({
        // Your existing mapping logic here
        // But simplified to reduce memory usage
        path: `/${sanitizeUrlPart(category.category)}`,
        priority: '0.9',
        changefreq: 'daily'
      }));
    };

    // Process data in smaller chunks
    const routes = await processInChunks(limitedData);

    // Write sitemap in chunks
    const writeStream = fs.createWriteStream(path.join(__dirname, 'build', 'sitemap.xml'));
    
    // Write header
    writeStream.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n');
    
    // Write routes in chunks
    for (const route of routes) {
      writeStream.write(`  <url>\n    <loc>${baseUrl}${route.path}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>\n`);
    }
    
    // Write footer
    writeStream.write('</urlset>');
    
    await new Promise((resolve) => writeStream.end(resolve));
    console.log('Sitemap generated successfully');
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
};

// Serve sitemap route
app.get('/sitemap.xml', async (req, res) => {
  try {
    const sitemapContent = await generateSitemap();
    res.header('Content-Type', 'application/xml');
    res.send(sitemapContent);
  } catch (error) {
    console.error('Error serving sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Add these constants at the top
const RESOURCE_LIMITS = {
  MAX_MEMORY_MB: 512,    // 512MB max memory
  MAX_HEAP_MB: 256,      // 256MB max heap
  IO_LIMIT_MB: 1,        // 1MB/s IO limit
  PROCESS_LIMIT: 20      // Entry processes limit
};

// Modify monitorResources function
const monitorResources = async () => {
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const rssUsedMB = Math.round(used.rss / 1024 / 1024);
  
  // Log metrics to file
  await performanceLogger.logMetrics();
  
  // Existing resource monitoring code
  if (heapUsedMB > RESOURCE_LIMITS.MAX_HEAP_MB * 0.8) {
    if (global.gc) {
      global.gc();
      console.log('Garbage collection triggered');
    }
  }
  
  if (rssUsedMB > RESOURCE_LIMITS.MAX_MEMORY_MB * 0.9) {
    console.error('Critical memory usage. Initiating shutdown...');
    process.emit('SIGTERM');
  }
};

// Add endpoint to get metrics summary
app.get('/api/v1/metrics', async (req, res) => {
  try {
    const duration = req.query.duration || '1h';
    const metrics = await performanceLogger.getMetricsSummary(duration);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

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
          await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 2,
            maxIdleTimeMS: 30000,
            family: 4,
            retryWrites: true,
            w: 'majority'
          });
          console.log("Connected to MongoDB");
          restartAttempts = 0; // Reset counter on successful connection
        } catch (error) {
          console.error("MongoDB connection error:", error);
          if (retries > 0) {
            console.log(`Retrying connection... (${retries} attempts remaining)`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            return connectWithRetry(retries - 1);
          }
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

      // Handle WebAssembly errors
      const originalInstantiate = WebAssembly.instantiate;
      WebAssembly.instantiate = async function(...args) {
        try {
          return await originalInstantiate.apply(this, args);
        } catch (error) {
          console.error('WebAssembly instantiation error:', error);
          // Force garbage collection
          if (global.gc) {
            global.gc();
          }
          // Wait a bit and retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          return originalInstantiate.apply(this, args);
        }
      };

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