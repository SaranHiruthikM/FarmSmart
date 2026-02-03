import request from 'supertest';
import app from '../../src/app';
import '../setup/testSetup';

describe('POST /auth/verify', () => {
  it('should return 501 Not Implemented', async () => {
    const response = await request(app)
      .post('/auth/verify')
      .send({
        contact: '9876543210',
        code: '123456'
      });

    expect(response.status).toBe(501);
    expect(response.body.message).toContain('not yet implemented');
  });
});
