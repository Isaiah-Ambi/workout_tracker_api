const request = require('supertest');
const express = require('express');

// Mock error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
      message: 'Invalid ObjectId'
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate Error',
      message: 'Resource already exists'
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong'
  });
};

describe('Error Handling', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Validation Errors', () => {
    it('should handle validation errors properly', async () => {
      app.post('/test-validation', (req, res, next) => {
        const error = new Error('Name is required');
        error.name = 'ValidationError';
        next(error);
      });

      app.use(errorHandler);

      const response = await request(app)
        .post('/test-validation')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
      expect(response.body.message).toBe('Name is required');
    });
  });

  describe('Cast Errors', () => {
    it('should handle invalid ObjectId errors', async () => {
      app.get('/test-cast/:id', (req, res, next) => {
        const error = new Error('Cast to ObjectId failed');
        error.name = 'CastError';
        next(error);
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/test-cast/invalid-id')
        .expect(400);

      expect(response.body.error).toBe('Invalid ID format');
      expect(response.body.message).toBe('Invalid ObjectId');
    });
  });

  describe('Duplicate Key Errors', () => {
    it('should handle MongoDB duplicate key errors', async () => {
      app.post('/test-duplicate', (req, res, next) => {
        const error = new Error('Duplicate key error');
        error.code = 11000;
        next(error);
      });

      app.use(errorHandler);

      const response = await request(app)
        .post('/test-duplicate')
        .send({ email: 'existing@test.com' })
        .expect(409);

      expect(response.body.error).toBe('Duplicate Error');
      expect(response.body.message).toBe('Resource already exists');
    });
  });

  describe('Generic Server Errors', () => {
    it('should handle unexpected errors', async () => {
      app.get('/test-server-error', (req, res, next) => {
        const error = new Error('Unexpected error');
        next(error);
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/test-server-error')
        .expect(500);

      expect(response.body.error).toBe('Internal Server Error');
      expect(response.body.message).toBe('Something went wrong');
    });
  });
});