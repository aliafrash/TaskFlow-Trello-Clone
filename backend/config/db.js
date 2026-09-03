const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URL;

    if (!mongoUri) {
      throw new Error("MongoDB URI is not defined in environment variables (MONGO_URI or MONGODB_URL).");
    }

    const connection = await mongoose.connect(mongoUri);

    console.log(
      `MongoDB connected: ${connection.connection.host}`
    );
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);

    process.exit(1);
  }
};

module.exports = connectDB;