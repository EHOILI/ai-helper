const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Directly hardcode the connection string to bypass .env issues
    const conn = await mongoose.connect("mongodb+srv://babyheee81:Terry9988@aihelper.egtbhfp.mongodb.net/?retryWrites=true&w=majority&appName=aihelper", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
