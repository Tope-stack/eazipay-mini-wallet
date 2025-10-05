const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/wallet_db',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('💡 Ensure MongoDB is running or use MongoDB Atlas');
    process.exit(1);
  }
};

module.exports = { connectDB };