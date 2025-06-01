require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://9036956408gn:codewar0030@cluster0.q7npjog.mongodb.net/codewar?retryWrites=true&w=majority&appName=Cluster0';

const testConnection = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(MONGODB_URI, options);
    console.log('Successfully connected to MongoDB!');
    console.log(`Connected to host: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
    await mongoose.connection.close();
    console.log('Connection closed successfully');
  } catch (error) {
    console.error('Connection error:', error);
  } finally {
    process.exit(0);
  }
};

testConnection(); 