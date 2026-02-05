import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export const connect = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmsmart_test';

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
      console.log('✓ Connected to test database');
    }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

export const clearDatabase = async () => {
  try {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName];
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('Error cleaning database:', error);
  }
};

export const closeDatabase = async () => {
  try {
    await mongoose.connection.db?.dropDatabase();
    await mongoose.disconnect();
    console.log('✓ Disconnected from test database');
  } catch (error) {
    console.error('Error disconnecting:', error);
  }
};

// Manual hooks only - individual tests should call these
/*
beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});
*/



jest.setTimeout(10000);