const request = require('supertest');
const express = require('express');
const workoutController = require('../../controllers/workoutController');

// Create express app for testing
const app = express();
app.use(express.json());

// Mock authentication middleware
app.use((req, res, next) => {
  req.user = { id: 'testUserId' };
  next();
});

// Add routes
app.get('/plans', workoutController.getPlans);
app.post('/plans', workoutController.createPlan);

// Mock models for integration test
jest.mock('../../models/workoutModel');
jest.mock('../../models/exerciseModel');

const { WorkoutPlan } = require('../../models/workoutModel');
const Exercise = require('../../models/exerciseModel');

describe('Workout Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /plans', () => {
    it('should return workout plans', async () => {
      const mockPlans = [
        { id: '1', name: 'Push Day', user: 'testUserId' }
      ];

      const mockQuery = {
        populate: jest.fn(() => mockQuery),
        sort: jest.fn(() => mockPlans)
      };

      WorkoutPlan.find.mockReturnValue(mockQuery);

      const response = await request(app)
        .get('/plans')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockPlans);
      expect(response.body.count).toBe(1);
    });
  });

  describe('POST /plans', () => {
    it('should create new workout plan', async () => {
      const mockExercise = {
        _id: 'ex1',
        name: 'Push-ups',
        equals: jest.fn(() => true)
      };

      Exercise.find.mockResolvedValue([mockExercise]);

      const mockWorkoutPlan = {
        save: jest.fn(() => Promise.resolve()),
        populate: jest.fn(() => Promise.resolve()),
        calculateEstimatedDuration: jest.fn(() => 30)
      };

      WorkoutPlan.mockImplementation(() => mockWorkoutPlan);

      const workoutData = {
        name: 'Test Workout',
        description: 'Test Description',
        exercises: [
          {
            exercise: 'ex1',
            targetSets: 3,
            targetReps: 10
          }
        ]
      };

      const response = await request(app)
        .post('/plans')
        .send(workoutData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Workout plan created successfully');
    });

    it('should return 400 if no exercises provided', async () => {
      const workoutData = {
        name: 'Test Workout'
        // no exercises
      };

      const response = await request(app)
        .post('/plans')
        .send(workoutData)
        .expect(400);

      expect(response.body.error).toBe('Name and at least one exercise are required');
    });
  });
});