const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

module.exports = {
  async connect() {
    try {
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const mongooseOpts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      };
      await mongoose.connect(uri, mongooseOpts);
    } catch (error) {
      console.error('Error connecting to the in-memory database', error);
      throw error;
    }
  },

  async clearDatabase() {
    try {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
      }
    } catch (error) {
      console.error('Error clearing the database', error);
      throw error;
    }
  },

  async closeDatabase() {
    try {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      await mongod.stop();
    } catch (error) {
      console.error('Error closing the database connection', error);
      throw error;
    }
  }
}; 