const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const { createMockUser, createMockExercise } = require('../utils/testHelpers');

// Mock all models for E2E tests
jest.mock('../../models/userModel');
jest.mock('../../models/exerciseModel');
jest.mock('../../models/workoutModel');

const User = require('../../models/userModel');
const Exercise = require('../../models/exerciseModel');
const { WorkoutPlan, ScheduledWorkout } = require('../../models/workoutModel');

describe('Workout Tracker E2E Tests', () => {
  let authToken;
  let userId;
  let mockUser;
  let mockExercise;

  beforeAll(async () => {
    // Setup test data
    userId = new mongoose.Types.ObjectId();
    mockUser = createMockUser({ _id: userId });
    mockExercise = createMockExercise();
    authToken = 'Bearer mocktoken';

    // Mock JWT verification to return our test user
    const jwt = require('jsonwebtoken');
    jwt.verify.mockReturnValue({ id: userId, name: mockUser.username });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Workout Flow', () => {
    it('should complete full workout creation and execution flow', async () => {
      // Step 1: Get available exercises
      Exercise.find.mockResolvedValue([mockExercise]);

      const exercisesResponse = await request(app)
        .get('/exercise')
        .set('Authorization', authToken)
        .expect(200);

      expect(exercisesResponse.body).toEqual([mockExercise]);

      // Step 2: Create workout plan
      const mockWorkoutPlan = {
        _id: 'plan123',
        name: 'Test Plan',
        user: userId,
        exercises: [{
          exercise: mockExercise._id,
          exerciseName: mockExercise.name,
          targetSets: 3,
          targetReps: 10
        }],
        save: jest.fn(() => Promise.resolve()),
        populate: jest.fn(() => Promise.resolve()),
        calculateEstimatedDuration: jest.fn(() => 30)
      };

      Exercise.find.mockResolvedValue([{ 
        ...mockExercise, 
        equals: jest.fn(() => true) 
      }]);
      WorkoutPlan.mockImplementation(() => mockWorkoutPlan);

      const planResponse = await request(app)
        .post('/workout/plans')
        .set('Authorization', authToken)
        .send({
          name: 'E2E Test Plan',
          exercises: [{
            exercise: mockExercise._id,
            targetSets: 3,
            targetReps: 10,
            targetWeight: 50
          }]
        })
        .expect(201);

      expect(planResponse.body.success).toBe(true);

      // Step 3: Schedule workout
      const mockQuery = {
        populate: jest.fn(() => ({
          _id: mockWorkoutPlan._id,
          exercises: mockWorkoutPlan.exercises
        }))
      };
      WorkoutPlan.findOne.mockReturnValue(mockQuery);

      const mockScheduled = {
        save: jest.fn(() => Promise.resolve()),
        populate: jest.fn(() => Promise.resolve())
      };
      ScheduledWorkout.mockImplementation(() => mockScheduled);

      const scheduleResponse = await request(app)
        .post('/workout/scheduled')
        .set('Authorization', authToken)
        .send({
          workoutPlan: mockWorkoutPlan._id,
          scheduledDate: '2025-01-15',
          scheduledTime: '07:00'
        })
        .expect(201);

      expect(scheduleResponse.body.success).toBe(true);

      // Step 4: Get scheduled workouts
      const mockScheduledWorkouts = [{
        _id: 'scheduled123',
        workoutPlan: mockWorkoutPlan._id,
        scheduledDate: new Date('2025-01-15'),
        status: 'scheduled'
      }];

      const scheduledQuery = {
        populate: jest.fn(() => scheduledQuery),
        sort: jest.fn(() => mockScheduledWorkouts)
      };
      ScheduledWorkout.find.mockReturnValue(scheduledQuery);

      const getScheduledResponse = await request(app)
        .get('/workout/scheduled')
        .set('Authorization', authToken)
        .query({ upcoming: 'true' })
        .expect(200);

      expect(getScheduledResponse.body.success).toBe(true);
      expect(getScheduledResponse.body.count).toBe(1);
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle authentication errors', async () => {
      const response = await request(app)
        .get('/workout/plans')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should handle invalid workout plan creation', async () => {
      const response = await request(app)
        .post('/workout/plans')
        .set('Authorization', authToken)
        .send({
          name: 'Invalid Plan'
          // Missing exercises
        })
        .expect(400);

      expect(response.body.error).toBe('Name and at least one exercise are required');
    });
  });
});