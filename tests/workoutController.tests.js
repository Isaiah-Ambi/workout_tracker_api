const workoutController = require('../../controllers/workoutController');
const { WorkoutPlan, ScheduledWorkout, WorkoutLog } = require('../../models/workoutModel');
const Exercise = require('../../models/exerciseModel');

// Mock models
jest.mock('../../models/workoutModel');
jest.mock('../../models/exerciseModel');

describe('Workout Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 'userId123' },
      params: {},
      query: {},
      body: {},
      doc: null
    };
    res = {
      json: jest.fn(),
      status: jest.fn(() => res)
    };
    jest.clearAllMocks();
  });

  describe('getPlans', () => {
    it('should get workout plans successfully', async () => {
      const mockPlans = [
        { id: '1', name: 'Push Day', user: 'userId123' },
        { id: '2', name: 'Pull Day', user: 'userId123' }
      ];

      const mockQuery = {
        populate: jest.fn(() => mockQuery),
        sort: jest.fn(() => mockPlans)
      };

      WorkoutPlan.find.mockReturnValue(mockQuery);

      await workoutController.getPlans(req, res);

      expect(WorkoutPlan.find).toHaveBeenCalledWith({ user: 'userId123' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPlans,
        count: mockPlans.length
      });
    });

    it('should filter plans by category', async () => {
      req.query.category = 'strength';

      const mockQuery = {
        populate: jest.fn(() => mockQuery),
        sort: jest.fn(() => [])
      };

      WorkoutPlan.find.mockReturnValue(mockQuery);

      await workoutController.getPlans(req, res);

      expect(WorkoutPlan.find).toHaveBeenCalledWith({
        user: 'userId123',
        category: 'strength'
      });
    });
  });

  describe('createPlan', () => {
    it('should create workout plan successfully', async () => {
      const mockExercises = [
        { _id: 'ex1', name: 'Push-ups', equals: jest.fn(() => true) }
      ];

      req.body = {
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

      Exercise.find.mockResolvedValue(mockExercises);

      const mockWorkoutPlan = {
        save: jest.fn(),
        populate: jest.fn(),
        calculateEstimatedDuration: jest.fn(() => 30)
      };

      // Mock WorkoutPlan constructor
      WorkoutPlan.mockImplementation(() => mockWorkoutPlan);

      await workoutController.createPlan(req, res);

      expect(Exercise.find).toHaveBeenCalled();
      expect(mockWorkoutPlan.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return error if no exercises provided', async () => {
      req.body = {
        name: 'Test Workout'
        // no exercises
      };

      await workoutController.createPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Name and at least one exercise are required'
      });
    });

    it('should return error if exercises not found', async () => {
      req.body = {
        name: 'Test Workout',
        exercises: [{ exercise: 'invalid-id' }]
      };

      Exercise.find.mockResolvedValue([]); // No exercises found

      await workoutController.createPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'One or more exercises not found'
      });
    });
  });

  describe('addScheduleWorkout', () => {
    it('should schedule workout successfully', async () => {
      const mockPlan = {
        _id: 'plan1',
        name: 'Test Plan',
        exercises: [{
          toObject: () => ({
            exercise: 'ex1',
            sets: [{ completed: false }]
          })
        }]
      };

      req.body = {
        workoutPlan: 'plan1',
        scheduledDate: '2025-01-15',
        scheduledTime: '07:00'
      };

      const mockQuery = {
        populate: jest.fn(() => mockPlan)
      };

      WorkoutPlan.findOne.mockReturnValue(mockQuery);

      const mockScheduledWorkout = {
        save: jest.fn(),
        populate: jest.fn()
      };

      ScheduledWorkout.mockImplementation(() => mockScheduledWorkout);

      await workoutController.addScheduleWorkout(req, res);

      expect(WorkoutPlan.findOne).toHaveBeenCalledWith({
        _id: 'plan1',
        user: 'userId123'
      });
      expect(mockScheduledWorkout.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return error if workout plan not found', async () => {
      req.body = {
        workoutPlan: 'invalid-plan',
        scheduledDate: '2025-01-15',
        scheduledTime: '07:00'
      };

      const mockQuery = {
        populate: jest.fn(() => null)
      };

      WorkoutPlan.findOne.mockReturnValue(mockQuery);

      await workoutController.addScheduleWorkout(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Workout plan not found'
      });
    });
  });

  describe('startScheduledWorkout', () => {
    it('should start workout successfully', async () => {
      const mockWorkout = {
        status: 'scheduled',
        startWorkout: jest.fn()
      };

      req.doc = mockWorkout;

      await workoutController.startScheduledWorkout(req, res);

      expect(mockWorkout.startWorkout).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockWorkout,
        message: 'Workout started successfully'
      });
    });

    it('should return error if workout is not scheduled', async () => {
      const mockWorkout = {
        status: 'completed'
      };

      req.doc = mockWorkout;

      await workoutController.startScheduledWorkout(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Can only start scheduled workouts'
      });
    });
  });
});