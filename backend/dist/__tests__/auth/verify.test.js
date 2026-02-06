"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../src/app"));
require("../setup/testSetup");
describe('POST /auth/verify', () => {
    it('should return 501 Not Implemented', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/auth/verify')
            .send({
            contact: '9876543210',
            code: '123456'
        });
        expect(response.status).toBe(501);
        expect(response.body.message).toContain('not yet implemented');
    });
});
//# sourceMappingURL=verify.test.js.map