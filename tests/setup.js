// __tests__/setup.js
const mongoose = require('mongoose');
require('dotenv').config();

// Mock mongoose methods
jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  connect: jest.fn(),
  connection: {
    close: jest.fn()
  }
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  genSalt: jest.fn(() => Promise.resolve('mockSalt')),
  hash: jest.fn(() => Promise.resolve('hashedPassword')),
  compare: jest.fn(() => Promise.resolve(true))
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mockToken'),
  verify: jest.fn(() => ({ id: 'userId123', name: 'testuser' }))
}));

// Global test setup
beforeAll(() => {
  process.env.SECRET = 'test-secret-key';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
});