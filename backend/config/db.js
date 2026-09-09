const mongoose = require("mongoose");

function sanitizeMongoUri(rawUri) {
  if (!rawUri) return "";
  let uri = rawUri.trim().replace(/^["']|["']$/g, "");

  // If mongodb+srv is used, remove any accidental explicit port (e.g., :27017 or :5001) from the host
  if (uri.startsWith("mongodb+srv://")) {
    // Check if there is an explicit port attached to the hostname
    // Example: mongodb+srv://user:pass@host:27017/db -> mongodb+srv://user:pass@host/db
    uri = uri.replace(/(mongodb\+srv:\/\/[^@]+@[^/:?#]+)(:\d+)/, "$1");
  }
  return uri;
}

const connectDB = async () => {
  try {
    const rawUri = process.env.MONGO_URI || process.env.MONGODB_URL;

    if (!rawUri) {
      throw new Error("MongoDB URI is not defined in environment variables (MONGO_URI or MONGODB_URL).");
    }

    const mongoUri = sanitizeMongoUri(rawUri);

    // Mask credentials for safe logging
    const maskedUri = mongoUri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, "$1****$3");
    console.log(`Connecting to MongoDB: ${maskedUri}`);

    const connection = await mongoose.connect(mongoUri);

    console.log(`✓ MongoDB connected successfully: ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;