import request from 'supertest';
import app from '../../src/app';
import User from '../../src/models/User';
import { testUsers } from '../fixtures/testData';
import '../setup/testSetup';

describe('POST /auth/register - Comprehensive Tests', () => {
  
  describe('✓ Successful Registration Cases', () => {
    
    it('should register a new farmer user with all valid fields', async () => {
      const userData = {
        phoneNumber: '9876543210',
        password: 'SecurePass123!',
        role: 'FARMER',
        fullName: 'John Farmer',
        email: 'john@farm.com',
        preferredLanguage: 'en',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('registered successfully');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.phoneNumber).toBe(userData.phoneNumber);
      expect(response.body.data.user.role).toBe('FARMER');
    });

    it('should register a new buyer user', async () => {
      const userData = {
        phoneNumber: '9876543211',
        password: 'SecurePass456!',
        role: 'BUYER',
        fullName: 'Jane Buyer',
        email: 'jane@buyer.com',
        preferredLanguage: 'hi',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('BUYER');
    });

    it('should register with minimum required fields (phone & password)', async () => {
      const userData = {
        phoneNumber: '9876543220',
        password: 'MinimalPass123!',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should assign default FARMER role if not specified', async () => {
      const userData = {
        phoneNumber: '9876543221',
        password: 'DefaultRole123!',
        fullName: 'Default User',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('FARMER');
    });

    it('should set default language to en if not provided', async () => {
      const userData = {
        phoneNumber: '9876543222',
        password: 'DefaultLang123!',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.preferredLanguage).toBe('en');
    });

    it('should accept all valid roles', async () => {
      const validRoles = ['FARMER', 'BUYER', 'COOPERATIVE', 'ADMIN', 'LOGISTICS'];

      for (let i = 0; i < validRoles.length; i++) {
        const userData = {
          phoneNumber: `987654321${i}`,
          password: 'ValidRole123!',
          role: validRoles[i],
        };

        const response = await request(app)
          .post('/auth/register')
          .send(userData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.role).toBe(validRoles[i]);
      }
    });

    it('should hash password and not store plain text', async () => {
      const userData = {
        phoneNumber: '9876543230',
        password: 'PlainPassword123!',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.passwordHash).toBeUndefined();

      const user = await User.findOne({ phoneNumber: userData.phoneNumber });
      expect(user).toBeDefined();
      expect(user!.passwordHash).toBeDefined();
      expect(user!.passwordHash).not.toBe(userData.password);
    });

    it('should return valid JWT token', async () => {
      const userData = {
        phoneNumber: '9876543240',
        password: 'JWTTest123!',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      const token = response.body.data.token;
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });
  });

  describe('❌ Validation Errors', () => {
    
    it('should return 400 if phone number is missing', async () => {
      const userData = {
        password: 'NoPhone123!',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Phone number and password are required');
    });

    it('should return 400 if password is missing', async () => {
      const userData = {
        phoneNumber: '9876543260',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if both are missing', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if phone number is empty string', async () => {
      const userData = {
        phoneNumber: '',
        password: 'ValidPass123!',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if password is empty string', async () => {
      const userData = {
        phoneNumber: '9876543261',
        password: '',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid role', async () => {
      const userData = {
        phoneNumber: '9876543262',
        password: 'ValidPass123!',
        role: 'INVALID_ROLE',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid role');
    });

    it('should return 400 for null phone number', async () => {
      const userData = {
        phoneNumber: null,
        password: 'ValidPass123!',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for undefined password', async () => {
      const userData = {
        phoneNumber: '9876543263',
        password: undefined,
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should not expose password in error messages', async () => {
      const userData = {
        phoneNumber: '9876543264',
        password: 'SecurePass123!',
      };

      const response1 = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response1.status).toBe(201);

      const response2 = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response2.status).toBe(409);
      expect(response2.body.success).toBe(false);
      expect(response2.body.message).not.toContain(userData.password);
    });
  });

  describe('🚫 Duplicate Prevention', () => {
    
    beforeEach(async () => {
      const userData = {
        phoneNumber: '9876543270',
        password: 'FirstReg123!',
      };

      await request(app)
        .post('/auth/register')
        .send(userData);
    });

    it('should return 409 if user with same phone already exists', async () => {
      const userData = {
        phoneNumber: '9876543270',
        password: 'DifferentPass123!',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should allow registration with different phone numbers', async () => {
      const userData = {
        phoneNumber: '9876543271',
        password: 'DifferentPhone123!',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('📝 Optional Fields', () => {
    
    it('should accept registration without email', async () => {
      const userData = {
        phoneNumber: '9876543280',
        password: 'NoEmail123!',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should accept registration without fullName', async () => {
      const userData = {
        phoneNumber: '9876543281',
        password: 'NoName123!',
        email: 'test@test.com',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should accept custom preferred language', async () => {
      const userData = {
        phoneNumber: '9876543283',
        password: 'CustomLang123!',
        preferredLanguage: 'hi',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.preferredLanguage).toBe('hi');
    });
  });

  describe('⚡ Edge Cases', () => {
    
    it('should handle numeric phone number', async () => {
      const userData = {
        phoneNumber: 9876543290,
        password: 'NumericPhone123!',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should handle very long password', async () => {
      const userData = {
        phoneNumber: '9876543291',
        password: 'a'.repeat(500),
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect([201, 400]).toContain(response.status);
    });

    it('should handle special characters in password', async () => {
      const userData = {
        phoneNumber: '9876543292',
        password: '!@#$%^&*()_+-={}[]|:;<>?,./~`',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should handle special characters in fullName', async () => {
      const userData = {
        phoneNumber: '9876543293',
        password: 'ValidPass123!',
        fullName: "O'Brien-Smith (Dr.)",
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.fullName).toBe("O'Brien-Smith (Dr.)");
    });
  });
});
