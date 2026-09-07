import mongoose from "mongoose";

/**
 * Opens the MongoDB connection used by the whole app.
 * Kept in one place so server.js and the seed script share the same logic.
 */
export async function connectDB(uri) {
  mongoose.set("strictQuery", true);

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  });

  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}
