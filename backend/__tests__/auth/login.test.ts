import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { register, login } from '../../src/controllers/authController';
import { testUsers, loginAttempts } from '../fixtures/testData';
import '../setup/testSetup';

const app = express();
app.use(express.json());
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

describe('POST /api/auth/login - Comprehensive Tests', () => {
  
  beforeEach(async () => {
    // Clean database before each test
    try {
      const collections = Object.keys(mongoose.connection.collections);
      for (const collectionName of collections) {
        const collection = mongoose.connection.collections[collectionName];
        await collection.deleteMany({});
      }
    } catch (error) {
      console.error('Error cleaning database:', error);
    }

    // Create UNIQUE test user for login tests (different from register tests)
    await request(app)
      .post('/api/auth/register')
      .send({
        phoneNumber: '9999999999',  // ← UNIQUE phone number
        password: 'TestPassword123!',
        role: 'FARMER',
        fullName: 'Test Farmer',
        email: 'test@farm.com',
      });
  });

  describe('✓ Successful Login Cases', () => {
    
    it('should login user with valid phone and password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',  // ← UNIQUE phone number
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('successful');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.phoneNumber).toBe('9999999999');
    });

    it('should return user object with correct fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      const user = response.body.data.user;
      
      expect(user._id).toBeDefined();
      expect(user.phoneNumber).toBe('9999999999');
      expect(user.role).toBe('FARMER');
      expect(user.fullName).toBe('Test Farmer');
    });

    it('should return valid JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      const token = response.body.data.token;
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should return token with userId and role in payload', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      const token = response.body.data.token;
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      
      expect(payload.userId).toBeDefined();
      expect(payload.role).toBe('FARMER');
    });

    it('should not return password in response', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.passwordHash).toBeUndefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return token with 7-day expiration', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      const token = response.body.data.token;
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      
      expect(payload.exp).toBeDefined();
      expect(payload.iat).toBeDefined();
      const expiryInSeconds = payload.exp - payload.iat;
      expect(expiryInSeconds).toBe(7 * 24 * 60 * 60);
    });
  });

  describe('❌ Authentication Failures', () => {
    
    it('should return 401 for wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid phone number or password');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '1111111111',
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not reveal if user exists or password is wrong', async () => {
      const wrongPasswordResponse = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: 'WrongPassword123!',
        });

      const nonExistentUserResponse = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '1111111111',
          password: 'TestPassword123!',
        });

      expect(wrongPasswordResponse.body.message).toBe(nonExistentUserResponse.body.message);
      expect(wrongPasswordResponse.status).toBe(nonExistentUserResponse.status);
    });

    it('should not return user data on authentication failure', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBeNull();
    });

    it('should not return token on authentication failure', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.data?.token).toBeUndefined();
    });
  });

  describe('⚠️ Validation Errors', () => {
    
    it('should return 400 if phone number is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Phone number and password are required');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing both fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if phone number is empty string', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '',
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if password is empty string', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject null phone number', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: null,
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject undefined password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: undefined,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('🔐 Password Security', () => {
    
    it('should be case-sensitive for password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: 'testpassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject password with minor character differences', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: 'TestPassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle very long password gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: 'a'.repeat(1000),
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle special characters in password', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          phoneNumber: '8888888888',
          password: '!@#$%^&*()_+-={}',
          fullName: 'Special User',
        });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '8888888888',
          password: '!@#$%^&*()_+-={}',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('👥 Multiple User Scenarios', () => {
    
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          phoneNumber: '7777777777',
          password: 'BuyerPass123!',
          role: 'BUYER',
          fullName: 'Test Buyer',
        });
    });

    it('should login different users independently', async () => {
      const farmer = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: 'TestPassword123!',
        });

      const buyer = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '7777777777',
          password: 'BuyerPass123!',
        });

      expect(farmer.status).toBe(200);
      expect(buyer.status).toBe(200);
      expect(farmer.body.success).toBe(true);
      expect(buyer.body.success).toBe(true);
      expect(farmer.body.data.user.role).toBe('FARMER');
      expect(buyer.body.data.user.role).toBe('BUYER');
    });

    it('should return correct role for each user', async () => {
      const farmerLogin = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: 'TestPassword123!',
        });

      const buyerLogin = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '7777777777',
          password: 'BuyerPass123!',
        });

      expect(farmerLogin.body.data.user.role).toBe('FARMER');
      expect(buyerLogin.body.data.user.role).toBe('BUYER');
    });

    it('should prevent cross-user login with wrong credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: 'BuyerPass123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('⚡ Edge Cases', () => {
    
    it('should handle numeric phone number', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: 9999999999,
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle login after multiple failed attempts', async () => {
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            phoneNumber: '9999999999',
            password: 'WrongPassword123!',
          });
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return consistent response format', async () => {
      const response1 = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: 'TestPassword123!',
        });

      const response2 = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '9999999999',
          password: 'TestPassword123!',
        });

      expect(Object.keys(response1.body)).toEqual(Object.keys(response2.body));
    });
  });
});