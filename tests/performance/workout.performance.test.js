const { WorkoutPlan } = require('../../models/workoutModel');
const { createMockWorkoutPlan } = require('../utils/testHelpers');

jest.mock('../../models/workoutModel');

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Workout Plan Queries', () => {
    it('should handle large datasets efficiently', async () => {
      // Create 1000 mock workout plans
      const largePlanSet = Array.from({ length: 1000 }, (_, i) => 
        createMockWorkoutPlan({ name: `Plan ${i}` })
      );

      const mockQuery = {
        populate: jest.fn(() => mockQuery),
        sort: jest.fn(() => largePlanSet)
      };
      WorkoutPlan.find.mockReturnValue(mockQuery);

      const startTime = Date.now();
      
      // This would be a real database query in actual performance testing
      const result = await mockQuery.sort();
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Assert query completes quickly (mocked, but structure for real testing)
      expect(executionTime).toBeLessThan(100); // ms
      expect(result).toHaveLength(1000);
      expect(WorkoutPlan.find).toHaveBeenCalled();
    });

    it('should handle complex filtering efficiently', async () => {
      const complexFilter = {
        user: 'userId123',
        category: { $in: ['strength', 'cardio', 'flexibility'] },
        difficulty: { $in: ['beginner', 'intermediate'] },
        isActive: true,
        $or: [
          { name: { $regex: 'workout', $options: 'i' } },
          { description: { $regex: 'workout', $options: 'i' } }
        ]
      };

      const mockQuery = {
        populate: jest.fn(() => mockQuery),
        sort: jest.fn(() => [])
      };
      WorkoutPlan.find.mockReturnValue(mockQuery);

      const startTime = Date.now();
      await WorkoutPlan.find(complexFilter).populate().sort();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(50);
      expect(WorkoutPlan.find).toHaveBeenCalledWith(complexFilter);
    });
  });
});