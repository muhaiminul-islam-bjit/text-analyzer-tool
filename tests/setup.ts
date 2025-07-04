/// <reference types="jest" />
import mongoose from 'mongoose';

beforeAll(async () => {
  // Use the MongoDB test container instead of MongoDB Memory Server
  const mongoUri = process.env.MONGODB_URI || 'mongodb://test:test@mongodb-test:27017/test?authSource=admin';
  
  console.log('Connecting to MongoDB:', mongoUri);
  
  try {
    await mongoose.connect(mongoUri);
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}, 30000);

afterAll(async () => {
  // Clean up after all tests
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
}, 30000);

beforeEach(async () => {
  // Clean up before each test
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});
