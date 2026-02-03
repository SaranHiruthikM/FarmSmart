export const testUsers = {
  validFarmer: {
    phoneNumber: '9876543210',
    password: 'SecurePass123!',
    role: 'FARMER',
    fullName: 'John Farmer',
    email: 'john@farm.com',
    preferredLanguage: 'en',
  },

  validBuyer: {
    phoneNumber: '9876543211',
    password: 'SecurePass456!',
    role: 'BUYER',
    fullName: 'Jane Buyer',
    email: 'jane@buyer.com',
    preferredLanguage: 'hi',
  },

  minimalUser: {
    phoneNumber: '9876543213',
    password: 'MinimalPass123!',
  },

  invalidRole: {
    phoneNumber: '9876543214',
    password: 'SecurePass123!',
    role: 'INVALID_ROLE',
  },

  missingPhone: {
    password: 'SecurePass123!',
    role: 'FARMER',
  },

  missingPassword: {
    phoneNumber: '9876543215',
    role: 'FARMER',
  },
};

export const loginAttempts = {
  validCredentials: {
    phoneNumber: '9876543210',
    password: 'SecurePass123!',
  },

  wrongPassword: {
    phoneNumber: '9876543210',
    password: 'WrongPassword123!',
  },

  nonExistentUser: {
    phoneNumber: '9999999999',
    password: 'AnyPassword123!',
  },

  missingPhone: {
    password: 'SecurePass123!',
  },

  missingPassword: {
    phoneNumber: '9876543210',
  },
};

export const httpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
};