"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabase = exports.clearDatabase = exports.connect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env.test' });
const connect = async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmsmart_test';
    try {
        if (mongoose_1.default.connection.readyState === 0) {
            await mongoose_1.default.connect(mongoUri);
            console.log('✓ Connected to test database');
        }
    }
    catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};
exports.connect = connect;
const clearDatabase = async () => {
    try {
        const collections = Object.keys(mongoose_1.default.connection.collections);
        for (const collectionName of collections) {
            const collection = mongoose_1.default.connection.collections[collectionName];
            await collection.deleteMany({});
        }
    }
    catch (error) {
        console.error('Error cleaning database:', error);
    }
};
exports.clearDatabase = clearDatabase;
const closeDatabase = async () => {
    try {
        await mongoose_1.default.connection.db?.dropDatabase();
        await mongoose_1.default.disconnect();
        console.log('✓ Disconnected from test database');
    }
    catch (error) {
        console.error('Error disconnecting:', error);
    }
};
exports.closeDatabase = closeDatabase;
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
//# sourceMappingURL=testSetup.js.map