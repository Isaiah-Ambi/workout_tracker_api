const request = require('supertest');
const express = require('express');
const workoutController = require('../../controllers/workoutController');

const app = express();
app.use(express.json());

// Mock auth middleware
app.use((req, res, next) => {
  req.user = { id: 'testUserId' };
  next();
});

// Mock doc middleware for ownership
app.use((req, res, next) => {
  if (req.params.id) {
    req.doc = { 
      user: { equals: () => true },
      _id: req.params.id,
      save: jest.fn(() => Promise.resolve()),
      populate: jest.fn(() => Promise.resolve())
    };
  }
  next();
});

// Setup routes
app.get('/plans', workoutController.getPlans);
app.get('/plans/:id', workoutController.getOnePlan);
app.post('/plans', workoutController.createPlan);
app.put('/plans/:id', workoutController.updatePlan);
app.delete('/plans/:id', workoutController.deletePlan);
app.get('/scheduled', workoutController.getScheduledWorkouts);
app.post('/scheduled', workoutController.addScheduleWorkout);
app.get('/logs', workoutController.getLogs);
app.get('/stats', workoutController.getStats);

// Mock models
jest.mock('../../models/workoutModel');
jest.mock('../../models/exerciseModel');

const { WorkoutPlan, ScheduledWorkout, WorkoutLog } = require('../../models/workoutModel');
const Exercise = require('../../models/exerciseModel');

describe('Workout Routes Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Workout Plans Routes', () => {
    it('GET /plans should return filtered plans', async () => {
      const mockPlans = [{ id: '1', name: 'Strength Training' }];
      const mockQuery = {
        populate: jest.fn(() => mockQuery),
        sort: jest.fn(() => mockPlans)
      };
      WorkoutPlan.find.mockReturnValue(mockQuery);

      const response = await request(app)
        .get('/plans')
        .query({ category: 'strength', difficulty: 'intermediate' })
        .expect(200);

      expect(WorkoutPlan.find).toHaveBeenCalledWith({
        user: 'testUserId',
        category: 'strength',
        difficulty: 'intermediate'
      });
      expect(response.body.success).toBe(true);
    });

    it('GET /plans/:id should return single plan', async () => {
      const mockPlan = { id: '1', name: 'Test Plan' };
      const mockQuery = {
        populate: jest.fn(() => mockPlan)
      };
      WorkoutPlan.findById.mockReturnValue(mockQuery);

      const response = await request(app)
        .get('/plans/507f1f77bcf86cd799439011')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockPlan);
    });

    it('PUT /plans/:id should update plan', async () => {
      const response = await request(app)
        .put('/plans/507f1f77bcf86cd799439011')
        .send({ name: 'Updated Plan Name' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Workout plan updated successfully');
    });

    it('DELETE /plans/:id should delete plan', async () => {
      WorkoutPlan.findByIdAndDelete.mockResolvedValue();

      const response = await request(app)
        .delete('/plans/507f1f77bcf86cd799439011')
        .expect(200);

      expect(WorkoutPlan.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(response.body.success).toBe(true);
    });
  });

  describe('Scheduled Workouts Routes', () => {
    it('GET /scheduled should return scheduled workouts', async () => {
      const mockWorkouts = [{ id: '1', scheduledDate: new Date() }];
      const mockQuery = {
        populate: jest.fn(() => mockQuery),
        sort: jest.fn(() => mockWorkouts)
      };
      ScheduledWorkout.find.mockReturnValue(mockQuery);

      const response = await request(app)
        .get('/scheduled')
        .query({ upcoming: 'true' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockWorkouts);
    });

    it('POST /scheduled should create scheduled workout', async () => {
      const mockPlan = {
        _id: 'plan1',
        exercises: [{ toObject: () => ({ sets: [] }) }]
      };
      const mockQuery = {
        populate: jest.fn(() => mockPlan)
      };
      WorkoutPlan.findOne.mockReturnValue(mockQuery);

      const mockScheduled = {
        save: jest.fn(() => Promise.resolve()),
        populate: jest.fn(() => Promise.resolve())
      };
      ScheduledWorkout.mockImplementation(() => mockScheduled);

      const response = await request(app)
        .post('/scheduled')
        .send({
          workoutPlan: 'plan1',
          scheduledDate: '2025-01-15',
          scheduledTime: '07:00'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Workout scheduled successfully');
    });
  });

  describe('Workout Logs Routes', () => {
    it('GET /logs should return paginated logs', async () => {
      const mockLogs = [{ id: '1', completedAt: new Date() }];
      const mockQuery = {
        populate: jest.fn(() => mockQuery),
        sort: jest.fn(() => mockQuery),
        limit: jest.fn(() => mockQuery),
        skip: jest.fn(() => mockLogs)
      };
      WorkoutLog.find.mockReturnValue(mockQuery);
      WorkoutLog.countDocuments.mockResolvedValue(25);

      const response = await request(app)
        .get('/logs')
        .query({ page: 2, limit: 5 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.current).toBe(2);
      expect(response.body.pagination.total).toBe(25);
    });

    it('GET /stats should return user statistics', async () => {
      const mockStats = [{
        totalWorkouts: 10,
        totalDuration: 500,
        totalSets: 150,
        totalReps: 1500
      }];
      WorkoutLog.getUserStats = jest.fn().mockResolvedValue(mockStats);
      WorkoutPlan.countDocuments.mockResolvedValue(5);
      ScheduledWorkout.countDocuments.mockResolvedValue(3);

      const response = await request(app)
        .get('/stats')
        .query({ days: 30 })
        .expect(200);

      expect(WorkoutLog.getUserStats).toHaveBeenCalledWith('testUserId', 30);
      expect(response.body.success).toBe(true);
      expect(response.body.data.workoutStats.totalWorkouts).toBe(10);
    });
  });
});