const mongoose = require("mongoose");
const options = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true
};
const connectDb = async () => {
  mongoose
    .connect(process.env.MONGODB_URI,options)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(`DB connection error - ${err}`));
};

const closeDbConnection = async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (err) {
    console.error(err);
  }
};

module.exports = { connectDb, closeDbConnection };
