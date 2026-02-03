import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmsmart_test';
  
  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to test database');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
});

afterEach(async () => {
  try {
    // Drop all collections
    const collections = Object.keys(mongoose.connection.collections);
    
    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName];
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('Error cleaning database:', error);
  }
});

afterAll(async () => {
  try {
    // Drop entire database
    await mongoose.connection.db?.dropDatabase();
    await mongoose.disconnect();
    console.log('✓ Disconnected from test database');
  } catch (error) {
    console.error('Error disconnecting:', error);
  }
});

jest.setTimeout(10000);