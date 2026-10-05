const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || process.env.ATLAS_MONGODB_URI || 'mongodb://127.0.0.1:27017/skilldesk';
  const fallbackUri = 'mongodb://127.0.0.1:27017/skilldesk';

  try {
    const maskedUri = primaryUri.includes('@') 
      ? `mongodb+srv://***@${primaryUri.split('@')[1]}` 
      : primaryUri;
    console.log(` Attempting to connect to MongoDB: ${maskedUri}`);

    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(` MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(` Primary MongoDB connection failed (${error.message}). Trying fallback local connection...`);
    try {
      const fallbackConn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(` Connected to fallback Local MongoDB: ${fallbackConn.connection.host}/${fallbackConn.connection.name}`);
    } catch (fallbackError) {
      console.error(` All MongoDB connections failed: ${fallbackError.message}`);
      console.warn(` Server will continue running to handle health checks and retry DB operations.`);
    }
  }
};

module.exports = connectDB;
