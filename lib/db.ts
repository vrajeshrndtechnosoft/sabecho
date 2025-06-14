import mongoose, { ConnectOptions } from "mongoose";

const options: ConnectOptions = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
};

// Keep track of the connection status
let isConnected = false;

const connectDb = async (): Promise<void> => {
  if (isConnected) {
    // Already connected
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI as string, options);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(`DB connection error - ${err}`);
    throw err;
  }
};

const closeDbConnection = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log("MongoDB connection closed");
  } catch (err) {
    console.error(err);
  }
};

export { connectDb, closeDbConnection };
