#!/bin/bash

# Set Node.js options for memory management
export NODE_OPTIONS="--max-old-space-size=512 --expose-gc"

# Additional environment variables for memory control
export UV_THREADPOOL_SIZE=4
export NODE_ENV=production

# Start the server
node server.js