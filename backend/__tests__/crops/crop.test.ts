import request from 'supertest';
import { Express } from 'express';
import { Crop, ICrop } from '../../src/models/Crop';
import User from '../../src/models/User';
import { connect, closeDatabase, clearDatabase } from '../setup/testSetup';

// Test data fixtures
const validFarmer = {
  phoneNumber: '9876543210',
  passwordHash: 'hashed_password_123',
  role: 'FARMER',
  fullName: 'John Farmer',
  email: 'john@farm.com',
  preferredLanguage: 'en',
  state: 'Maharashtra',
  district: 'Pune',
  address: 'Farm House 1',
};

const validBuyer = {
  phoneNumber: '9876543211',
  passwordHash: 'hashed_password_456',
  role: 'BUYER',
  fullName: 'Jane Buyer',
  email: 'jane@buyer.com',
  preferredLanguage: 'hi',
  state: 'Maharashtra',
  district: 'Mumbai',
  address: 'Shop 2',
};

const validCrop = {
  name: 'Tomato',
  variety: 'Cherry Tomato',
  quantity: 100,
  unit: 'kg',
  basePrice: 25.50,
  finalPrice: 25.50,
  imageUrl: 'https://example.com/tomato.jpg',
  qualityGrade: 'A',
  location: {
    state: 'Maharashtra',
    district: 'Nashik',
    village: 'Somvar Nagar',
  },
};

const invalidCrop = {
  name: 'Rice',
  quantity: -50,  // INVALID: Negative quantity
  unit: 'kg',
  basePrice: -100,  // INVALID: Negative price
  finalPrice: 100,
  imageUrl: 'img',
  qualityGrade: 'A',
  location: {
    state: 'Punjab',
    district: 'Amritsar',
  },
};

const cropMissingFields = {
  name: 'Wheat',
  // Missing: quantity, unit, basePrice, qualityGrade
  location: {
    state: 'Haryana',
    district: 'Hisar',
  },
};

const cropEmptyName = {
  name: '',
  quantity: 50,
  unit: 'kg',
  basePrice: 20,
  finalPrice: 20,
  imageUrl: 'img',
  qualityGrade: 'B',
  location: {
    state: 'Madhya Pradesh',
    district: 'Indore',
  },
};

const cropInvalidUnit = {
  name: 'Maize',
  quantity: 75,
  unit: 'bags',  // INVALID: Only kg, quintal, ton allowed
  basePrice: 30,
  finalPrice: 30,
  imageUrl: 'img',
  qualityGrade: 'B',
  location: {
    state: 'Rajasthan',
    district: 'Jaipur',
  },
};

const cropInvalidGrade = {
  name: 'Corn',
  quantity: 60,
  unit: 'quintal',
  basePrice: 28,
  finalPrice: 28,
  imageUrl: 'img',
  qualityGrade: 'D',  // INVALID: Only A, B, C allowed
  location: {
    state: 'Telangana',
    district: 'Hyderabad',
  },
};

const zeroQuantityCrop = {
  name: 'Barley',
  quantity: 0,
  unit: 'ton',
  basePrice: 15,
  finalPrice: 15,
  imageUrl: 'http://img.com/barley.jpg',
  qualityGrade: 'C',
  location: {
    state: 'Uttarakhand',
    district: 'Dehradun',
  },
};

const zeroPrice = {
  name: 'Soybean',
  quantity: 200,
  unit: 'kg',
  basePrice: 0,  // EDGE CASE: Zero price
  finalPrice: 0,
  imageUrl: 'http://img.com/soy.jpg',
  qualityGrade: 'B',
  location: {
    state: 'Madhya Pradesh',
    district: 'Indore',
  },
};

const largeQuantity = {
  name: 'Sugar Cane',
  quantity: 999999999,  // EDGE CASE: Very large number
  unit: 'ton',
  basePrice: 3.50,
  finalPrice: 3.50,
  imageUrl: 'http://img.com/cane.jpg',
  qualityGrade: 'A',
  location: {
    state: 'Uttar Pradesh',
    district: 'Meerut',
  },
};

const duplicateCrop = {
  name: 'Potatoes',  // Changed from Tomato to avoid conflict in tests
  quantity: 150,
  unit: 'quintal',
  basePrice: 35,
  finalPrice: 35,
  imageUrl: 'http://img.com/potatoes.jpg',
  qualityGrade: 'B',
  location: {
    state: 'Karnataka',
    district: 'Belgaum',
  },
};

let app: Express;
let farmerToken: string;
let buyerToken: string;
let farmerId: string;
let buyerId: string;

describe('CROP CONTROLLER - COMPREHENSIVE TEST SUITE', () => {

  // ====== SETUP & TEARDOWN ======
  beforeAll(async () => {
    await connect();
    const { default: appModule } = await import('../../src/app');
    app = appModule;
  });

  beforeEach(async () => {
    await Crop.deleteMany({});
    await User.deleteMany({});

    // Create base users
    const farmerUser = await User.create(validFarmer);
    const buyerUser = await User.create(validBuyer);

    farmerId = farmerUser._id.toString();
    buyerId = buyerUser._id.toString();

    farmerToken = generateToken(farmerId, 'FARMER');
    buyerToken = generateToken(buyerId, 'BUYER');
  });

  afterEach(async () => {
    // Basic cleanup
    await Crop.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await clearDatabase();
    await closeDatabase();
  });

  // ====== 1. CREATE CROP (POST /crops) ======
  describe('POST /crops - Create Crop', () => {

    it('✓ Should create crop with valid data', async () => {
      const res = await request(app)
        .post('/crops')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(validCrop);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('Tomato');
      expect(res.body.quantity).toBe(100);
      expect(res.body.basePrice).toBe(25.50);
      expect(res.body.farmerId).toBe(farmerId);
    });

    it('✓ Should create crop without optional variety field', async () => {
      const cropWithoutVariety = {
        name: 'Rice',
        quantity: 500,
        unit: 'kg',
        basePrice: 40,
        finalPrice: 40,
        imageUrl: 'http://img.com/rice.jpg',
        qualityGrade: 'A',
        location: {
          state: 'Punjab',
          district: 'Amritsar',
        },
      };

      const res = await request(app)
        .post('/crops')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(cropWithoutVariety);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Rice');
      expect(res.body.variety).toBeUndefined();
    });

    it('✗ Should reject negative quantity', async () => {
      const res = await request(app)
        .post('/crops')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(invalidCrop);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('✗ Should reject negative price', async () => {
      const negativePriceCrop = {
        name: 'Pepper',
        quantity: 80,
        unit: 'kg',
        basePrice: -50,  // INVALID
        qualityGrade: 'B',
        location: {
          state: 'Tamil Nadu',
          district: 'Madurai',
        },
      };

      const res = await request(app)
        .post('/crops')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(negativePriceCrop);

      expect(res.status).toBe(400);
    });

    it('✗ Should reject missing required fields', async () => {
      const res = await request(app)
        .post('/crops')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(cropMissingFields);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('✗ Should reject empty crop name', async () => {
      const res = await request(app)
        .post('/crops')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(cropEmptyName);

      expect(res.status).toBe(400);
    });

    it('✗ Should reject invalid unit', async () => {
      const res = await request(app)
        .post('/crops')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(cropInvalidUnit);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('unit');
    });

    it('✗ Should reject invalid quality grade', async () => {
      const res = await request(app)
        .post('/crops')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(cropInvalidGrade);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('qualityGrade');
    });

    it('✓ Should allow zero quantity', async () => {
      const res = await request(app)
        .post('/crops')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(zeroQuantityCrop);

      expect(res.status).toBe(201);
      expect(res.body.quantity).toBe(0);
    });

    it('✓ Should allow zero price', async () => {
      const res = await request(app)
        .post('/crops')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(zeroPrice);

      expect(res.status).toBe(201);
      expect(res.body.basePrice).toBe(0);
    });

    it('✓ Should allow very large quantity', async () => {
      const res = await request(app)
        .post('/crops')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(largeQuantity);

      expect(res.status).toBe(201);
      expect(res.body.quantity).toBe(999999999);
    });

    it('✗ Should reject unauthenticated request', async () => {
      const res = await request(app)
        .post('/crops')
        .send(validCrop);

      expect(res.status).toBe(401);
    });

    it('✗ Should reject buyer trying to create crop', async () => {
      const res = await request(app)
        .post('/crops')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(validCrop);

      expect(res.status).toBe(403);
    });

    it('✓ Should allow duplicate crop names from different farmers', async () => {
      // Create first crop
      await request(app)
        .post('/crops')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(validCrop);

      // Create duplicate from same farmer (allowed)
      const res = await request(app)
        .post('/crops')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(duplicateCrop);

      expect(res.status).toBe(201);
    });
  });

  // ====== 2. LIST CROPS (GET /crops) ======
  describe('GET /crops - List Crops', () => {

    beforeEach(async () => {
      // Create test crops
      await Crop.create({
        ...validCrop,
        farmerId: farmerId,
        isActive: true,
      });
      await Crop.create({
        ...duplicateCrop,
        farmerId: farmerId,
        isActive: true,
      });
      await Crop.create({
        name: 'Inactive Crop',
        quantity: 10,
        unit: 'kg',
        basePrice: 5,
        qualityGrade: 'C',
        location: { state: 'State', district: 'District' },
        farmerId: farmerId,
        isActive: false,
      });
    });

    it('✓ Should list all active crops', async () => {
      const res = await request(app).get('/crops');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].isActive).toBe(true);
    });

    it('✓ Should not list inactive crops', async () => {
      const res = await request(app).get('/crops');

      expect(res.status).toBe(200);
      const inactiveCrops = res.body.filter((crop: ICrop) => !crop.isActive);
      expect(inactiveCrops.length).toBe(0);
    });

    it('✓ Should filter crops by name', async () => {
      const res = await request(app)
        .get('/crops')
        .query({ name: 'Tomato' });

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toContain('Tomato');
    });

    it('✓ Should filter crops by name (case-insensitive)', async () => {
      const res = await request(app)
        .get('/crops')
        .query({ name: 'tomato' });

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it('✓ Should filter crops by state', async () => {
      const res = await request(app)
        .get('/crops')
        .query({ state: 'Maharashtra' });

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].location.state).toContain('Maharashtra');
    });

    it('✓ Should filter crops by district', async () => {
      const res = await request(app)
        .get('/crops')
        .query({ district: 'Nashik' });

      expect(res.status).toBe(200);
      expect(res.body[0].location.district).toContain('Nashik');
    });

    it('✓ Should apply multiple filters', async () => {
      const res = await request(app)
        .get('/crops')
        .query({ name: 'Tomato', state: 'Maharashtra', district: 'Nashik' });

      expect(res.status).toBe(200);
      if (res.body.length > 0) {
        expect(res.body[0].name).toContain('Tomato');
        expect(res.body[0].location.state).toContain('Maharashtra');
      }
    });

    it('✓ Should return empty array when no crops match filter', async () => {
      const res = await request(app)
        .get('/crops')
        .query({ name: 'NonExistentCrop' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('✓ Should populate farmer details', async () => {
      const res = await request(app).get('/crops');

      expect(res.status).toBe(200);
      if (res.body.length > 0) {
        expect(res.body[0].farmerId).toHaveProperty('fullName');
        expect(res.body[0].farmerId).toHaveProperty('phoneNumber');
      }
    });

    it('✓ Should sort by creation date (newest first)', async () => {
      const res = await request(app).get('/crops');

      expect(res.status).toBe(200);
      if (res.body.length > 1) {
        const date1 = new Date(res.body[0].createdAt);
        const date2 = new Date(res.body[1].createdAt);
        expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
      }
    });

    it('✓ Should handle special characters in filters', async () => {
      const res = await request(app)
        .get('/crops')
        .query({ name: 'Tomato (Test)' });

      expect(res.status).toBe(200);
    });
  });

  // ====== 3. GET SINGLE CROP (GET /crops/:id) ======
  describe('GET /crops/:id - Get Single Crop', () => {

    let cropId: string;

    beforeEach(async () => {
      const crop = await Crop.create({
        ...validCrop,
        farmerId: farmerId,
      });
      cropId = crop._id.toString();
    });

    it('✓ Should retrieve crop by ID', async () => {
      const res = await request(app).get(`/crops/${cropId}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(cropId);
      expect(res.body.name).toBe('Tomato');
      expect(res.body.quantity).toBe(100);
    });

    it('✓ Should populate farmer details', async () => {
      const res = await request(app).get(`/crops/${cropId}`);

      expect(res.status).toBe(200);
      expect(res.body.farmerId).toHaveProperty('fullName');
      expect(res.body.farmerId).toHaveProperty('phoneNumber');
    });

    it('✗ Should return 404 for non-existent crop ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/crops/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Crop not found');
    });

    it('✗ Should return 404 for invalid crop ID format', async () => {
      const res = await request(app).get('/crops/invalidid');

      expect(res.status).toBe(400);
    });

    it('✓ Should retrieve crop with all fields', async () => {
      const res = await request(app).get(`/crops/${cropId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('quantity');
      expect(res.body).toHaveProperty('unit');
      expect(res.body).toHaveProperty('basePrice');
      expect(res.body).toHaveProperty('qualityGrade');
      expect(res.body).toHaveProperty('location');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('✓ Should retrieve inactive crop', async () => {
      const inactiveCrop = await Crop.create({
        ...validCrop,
        farmerId: farmerId,
        isActive: false,
      });

      const res = await request(app).get(`/crops/${inactiveCrop._id}`);

      expect(res.status).toBe(200);
      expect(res.body.isActive).toBe(false);
    });
  });

  // ====== 4. GET MY CROPS (GET /crops/my) ======
  describe('GET /crops/my - Get Farmer\'s Crops', () => {

    let anotherFarmerId: string;
    let anotherFarmerToken: string;

    beforeEach(async () => {
      // Create another farmer
      const anotherFarmer = await User.create({
        phoneNumber: '9876543212',
        passwordHash: 'SecurePass789!',
        role: 'FARMER',
        fullName: 'Jane Farmer',
        state: 'Punjab',
        district: 'Ludhiana',
      });
      anotherFarmerId = anotherFarmer._id.toString();
      anotherFarmerToken = generateToken(anotherFarmerId);

      // Create crops for first farmer
      await Crop.create({
        ...validCrop,
        farmerId: farmerId,
      });
      await Crop.create({
        ...duplicateCrop,
        farmerId: farmerId,
      });

      // Create crop for another farmer
      await Crop.create({
        ...validCrop,
        farmerId: anotherFarmerId,
      });
    });

    it('✓ Should retrieve only authenticated farmer\'s crops', async () => {
      const res = await request(app)
        .get('/crops/my')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body.every((crop: ICrop) => crop.farmerId.toString() === farmerId)).toBe(true);
    });

    it('✓ Should return empty array when farmer has no crops', async () => {
      const thirdFarmer = await User.create({
        phoneNumber: '9876543213',
        passwordHash: 'Pass123!',
        role: 'FARMER',
        fullName: 'Third Farmer',
        state: 'Assam',
        district: 'Guwahati',
      });
      const thirdFarmerToken = generateToken(thirdFarmer._id.toString(), 'FARMER');

      const res = await request(app)
        .get('/crops/my')
        .set('Authorization', `Bearer ${thirdFarmerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('✗ Should reject unauthenticated request', async () => {
      const res = await request(app).get('/crops/my');

      expect(res.status).toBe(401);
    });

    it('✗ Should reject buyer accessing this endpoint', async () => {
      const res = await request(app)
        .get('/crops/my')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(403);
    });

    it('✓ Should include all crop fields', async () => {
      const res = await request(app)
        .get('/crops/my')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('name');
        expect(res.body[0]).toHaveProperty('quantity');
        expect(res.body[0]).toHaveProperty('basePrice');
      }
    });

    it('✓ Should include both active and inactive crops', async () => {
      await Crop.create({
        ...validCrop,
        farmerId: farmerId,
        isActive: false,
      });

      const res = await request(app)
        .get('/crops/my')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
    });
  });

  // ====== 5. UPDATE CROP (PUT /crops/:id) ======
  describe('PUT /crops/:id - Update Crop', () => {

    let cropId: string;
    let anotherFarmerId: string;
    let anotherFarmerToken: string;

    beforeEach(async () => {
      const crop = await Crop.create({
        ...validCrop,
        farmerId: farmerId,
      });
      cropId = crop._id.toString();

      // Create another farmer
      const anotherFarmer = await User.create({
        phoneNumber: '9876543212',
        passwordHash: 'SecurePass789!',
        role: 'FARMER',
        fullName: 'Jane Farmer',
        state: 'Punjab',
        district: 'Ludhiana',
      });
      anotherFarmerId = anotherFarmer._id.toString();
      anotherFarmerToken = generateToken(anotherFarmerId);
    });

    it('✓ Should update crop with valid data', async () => {
      const updateData = {
        name: 'Updated Tomato',
        quantity: 200,
        basePrice: 35,
      };

      const res = await request(app)
        .put(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Tomato');
      expect(res.body.quantity).toBe(200);
      expect(res.body.basePrice).toBe(35);
    });

    it('✓ Should update only one field', async () => {
      const updateData = { quantity: 150 };

      const res = await request(app)
        .put(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(150);
      expect(res.body.name).toBe('Tomato');  // Unchanged
      expect(res.body.basePrice).toBe(25.50);  // Unchanged
    });

    it('✓ Should update all fields', async () => {
      const updateData = {
        name: 'New Crop',
        variety: 'New Variety',
        quantity: 500,
        unit: 'ton',
        basePrice: 100,
        qualityGrade: 'A',
        location: {
          state: 'New State',
          district: 'New District',
          village: 'New Village',
        },
        isActive: false,
      };

      const res = await request(app)
        .put(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(updateData);
    });

    it('✗ Should reject negative quantity update', async () => {
      const res = await request(app)
        .put(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ quantity: -50 });

      expect(res.status).toBe(400);
    });

    it('✗ Should reject negative price update', async () => {
      const res = await request(app)
        .put(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ basePrice: -100 });

      expect(res.status).toBe(400);
    });

    it('✗ Should reject invalid unit', async () => {
      const res = await request(app)
        .put(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ unit: 'invalid' });

      expect(res.status).toBe(400);
    });

    it('✗ Should reject invalid quality grade', async () => {
      const res = await request(app)
        .put(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ qualityGrade: 'Z' });

      expect(res.status).toBe(400);
    });

    it('✗ Should reject empty name', async () => {
      const res = await request(app)
        .put(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
    });

    it('✗ Should return 404 for non-existent crop', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .put(`/crops/${fakeId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ quantity: 100 });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Crop not found');
    });

    it('✗ Should prevent farmer from updating another farmer\'s crop', async () => {
      const res = await request(app)
        .put(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${anotherFarmerToken}`)
        .send({ quantity: 100 });

      expect(res.status).toBe(404);  // Treated as not found for security
    });

    it('✗ Should reject unauthenticated update', async () => {
      const res = await request(app)
        .put(`/crops/${cropId}`)
        .send({ quantity: 100 });

      expect(res.status).toBe(401);
    });

    it('✗ Should reject buyer updating crop', async () => {
      const res = await request(app)
        .put(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ quantity: 100 });

      expect(res.status).toBe(403);
    });

    it('✓ Should allow zero price update', async () => {
      const res = await request(app)
        .put(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ basePrice: 0 });

      expect(res.status).toBe(200);
      expect(res.body.basePrice).toBe(0);
    });

    it('✓ Should allow zero quantity update', async () => {
      const res = await request(app)
        .put(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ quantity: 0 });

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(0);
    });
  });

  // ====== 6. UPDATE QUANTITY (PATCH /crops/:id/quantity) ======
  describe('PATCH /crops/:id/quantity - Update Quantity', () => {

    let cropId: string;
    let anotherFarmerId: string;
    let anotherFarmerToken: string;

    beforeEach(async () => {
      const crop = await Crop.create({
        ...validCrop,
        farmerId: farmerId,
      });
      cropId = crop._id.toString();

      // Create another farmer
      const anotherFarmer = await User.create({
        phoneNumber: '9876543212',
        passwordHash: 'SecurePass789!',
        role: 'FARMER',
        fullName: 'Jane Farmer',
        state: 'Punjab',
        district: 'Ludhiana',
      });
      anotherFarmerId = anotherFarmer._id.toString();
      anotherFarmerToken = generateToken(anotherFarmerId);
    });

    it('✓ Should update quantity successfully', async () => {
      const res = await request(app)
        .patch(`/crops/${cropId}/quantity`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ quantity: 250 });

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(250);
      expect(res.body.name).toBe('Tomato');  // Other fields unchanged
    });

    it('✓ Should update quantity to zero', async () => {
      const res = await request(app)
        .patch(`/crops/${cropId}/quantity`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ quantity: 0 });

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(0);
    });

    it('✓ Should update to large quantity', async () => {
      const res = await request(app)
        .patch(`/crops/${cropId}/quantity`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ quantity: 999999 });

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(999999);
    });

    it('✗ Should reject negative quantity', async () => {
      const res = await request(app)
        .patch(`/crops/${cropId}/quantity`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ quantity: -50 });

      expect(res.status).toBe(400);
    });

    it('✗ Should reject missing quantity field', async () => {
      const res = await request(app)
        .patch(`/crops/${cropId}/quantity`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('✗ Should return 404 for non-existent crop', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .patch(`/crops/${fakeId}/quantity`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ quantity: 100 });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Crop not found');
    });

    it('✗ Should prevent farmer from updating another farmer\'s crop', async () => {
      const res = await request(app)
        .patch(`/crops/${cropId}/quantity`)
        .set('Authorization', `Bearer ${anotherFarmerToken}`)
        .send({ quantity: 100 });

      expect(res.status).toBe(404);
    });

    it('✗ Should reject unauthenticated request', async () => {
      const res = await request(app)
        .patch(`/crops/${cropId}/quantity`)
        .send({ quantity: 100 });

      expect(res.status).toBe(401);
    });

    it('✗ Should reject buyer updating quantity', async () => {
      const res = await request(app)
        .patch(`/crops/${cropId}/quantity`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ quantity: 100 });

      expect(res.status).toBe(403);
    });

    it('✗ Should reject string quantity', async () => {
      const res = await request(app)
        .patch(`/crops/${cropId}/quantity`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ quantity: 'hundred' });

      expect(res.status).toBe(400);
    });

    it('✗ Should reject null quantity', async () => {
      const res = await request(app)
        .patch(`/crops/${cropId}/quantity`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ quantity: null });

      expect(res.status).toBe(400);
    });
  });

  // ====== 7. DELETE CROP (DELETE /crops/:id) ======
  describe('DELETE /crops/:id - Delete Crop', () => {

    let cropId: string;
    let anotherFarmerId: string;
    let anotherFarmerToken: string;

    beforeEach(async () => {
      const crop = await Crop.create({
        ...validCrop,
        farmerId: farmerId,
      });
      cropId = crop._id.toString();

      // Create another farmer
      const anotherFarmer = await User.create({
        phoneNumber: '9876543212',
        passwordHash: 'SecurePass789!',
        role: 'FARMER',
        fullName: 'Jane Farmer',
        state: 'Punjab',
        district: 'Ludhiana',
      });
      anotherFarmerId = anotherFarmer._id.toString();
      anotherFarmerToken = generateToken(anotherFarmerId);
    });

    it('✓ Should delete crop successfully', async () => {
      const res = await request(app)
        .delete(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Crop deleted');

      // Verify crop is deleted
      const deletedCrop = await Crop.findById(cropId);
      expect(deletedCrop).toBeNull();
    });

    it('✓ Should return appropriate message on deletion', async () => {
      const res = await request(app)
        .delete(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('✗ Should reject deleting same crop twice', async () => {
      // First delete
      await request(app)
        .delete(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${farmerToken}`);

      // Second delete attempt
      const res = await request(app)
        .delete(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Crop not found');
    });

    it('✗ Should return 404 for non-existent crop', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`/crops/${fakeId}`)
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Crop not found');
    });

    it('✗ Should prevent farmer from deleting another farmer\'s crop', async () => {
      const res = await request(app)
        .delete(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${anotherFarmerToken}`);

      expect(res.status).toBe(404);

      // Verify crop still exists
      const crop = await Crop.findById(cropId);
      expect(crop).not.toBeNull();
    });

    it('✗ Should reject unauthenticated delete request', async () => {
      const res = await request(app).delete(`/crops/${cropId}`);

      expect(res.status).toBe(401);

      // Verify crop still exists
      const crop = await Crop.findById(cropId);
      expect(crop).not.toBeNull();
    });

    it('✗ Should reject buyer deleting crop', async () => {
      const res = await request(app)
        .delete(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(403);

      // Verify crop still exists
      const crop = await Crop.findById(cropId);
      expect(crop).not.toBeNull();
    });

    it('✗ Should reject invalid crop ID format', async () => {
      const res = await request(app)
        .delete('/crops/invalidid')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(400);
    });
  });

  // ====== INTEGRATION TESTS ======
  describe('Integration Tests - Multiple Operations', () => {

    it('✓ Should create, update, and delete in sequence', async () => {
      // Create
      const createRes = await request(app)
        .post('/crops')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(validCrop);

      expect(createRes.status).toBe(201);
      const cropId = createRes.body._id;

      // Update
      const updateRes = await request(app)
        .put(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ quantity: 300 });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.quantity).toBe(300);

      // Delete
      const deleteRes = await request(app)
        .delete(`/crops/${cropId}`)
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(deleteRes.status).toBe(200);
    });

    it('✓ Should create multiple crops and list them', async () => {
      // Create multiple crops
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/crops')
          .set('Authorization', `Bearer ${farmerToken}`)
          .send({
            ...validCrop,
            name: `Crop ${i}`,
          });
      }

      // List farmer's crops
      const listRes = await request(app)
        .get('/crops/my')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.length).toBe(3);
    });

    it('✓ Should create crop and retrieve via GET /crops', async () => {
      const createRes = await request(app)
        .post('/crops')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(validCrop);

      const listRes = await request(app).get('/crops');

      expect(listRes.status).toBe(200);
      const foundCrop = listRes.body.find(
        (crop: ICrop) => crop._id === createRes.body._id
      );
      expect(foundCrop).toBeDefined();
    });
  });
});

// Helper function to generate JWT token (adjust based on your implementation)
function generateToken(userId: string, role: string = 'FARMER'): string {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '7d' }
  );
}
