const mongoose = require('mongoose');

const createMockUser = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashedPassword',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

const createMockExercise = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  name: 'Push-ups',
  category: 'chest',
  muscleGroups: ['pectorals', 'triceps'],
  equipment: 'bodyweight',
  difficulty: 'beginner',
  instructions: ['Start in plank position', 'Lower body', 'Push back up'],
  estimatedDuration: 60,
  caloriesPerMinute: 7,
  ...overrides
});

const createMockWorkoutPlan = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  name: 'Test Workout',
  description: 'A test workout plan',
  user: new mongoose.Types.ObjectId(),
  exercises: [],
  category: 'strength',
  difficulty: 'beginner',
  estimatedDuration: 45,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

const createMockScheduledWorkout = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  user: new mongoose.Types.ObjectId(),
  workoutPlan: new mongoose.Types.ObjectId(),
  scheduledDate: new Date(),
  scheduledTime: '07:00',
  status: 'scheduled',
  exercises: [],
  completionPercentage: 0,
  reminderTime: 30,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

const createMockWorkoutLog = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  user: new mongoose.Types.ObjectId(),
  workoutPlan: new mongoose.Types.ObjectId(),
  workoutName: 'Test Workout',
  completedAt: new Date(),
  duration: 45,
  exercises: [],
  totalSets: 9,
  totalReps: 90,
  totalWeight: 1000,
  caloriesBurned: 300,
  rating: 5,
  ...overrides
});

// Mock request/response helpers
const createMockReq = (overrides = {}) => ({
  user: { id: 'testUserId' },
  params: {},
  query: {},
  body: {},
  headers: {},
  ...overrides
});

const createMockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.send = jest.fn(() => res);
  res.cookie = jest.fn(() => res);
  return res;
};

// Database connection mock
const setupTestDB = () => {
  beforeAll(async () => {
    // Mock database connection
    mongoose.connect = jest.fn();
  });

  afterAll(async () => {
    // Mock database cleanup
    mongoose.connection.close = jest.fn();
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
};

module.exports = {
  createMockUser,
  createMockExercise,
  createMockWorkoutPlan,
  createMockScheduledWorkout,
  createMockWorkoutLog,
  createMockReq,
  createMockRes,
  setupTestDB
};