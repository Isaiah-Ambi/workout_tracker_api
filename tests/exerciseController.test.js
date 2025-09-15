const exerciseController = require('../controllers/exerciseController');
const Exercise = require('../models/exerciseModel');

// Mock Exercise model
jest.mock('../models/exerciseModel');

describe('Exercise Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      json: jest.fn(),
      status: jest.fn(() => res)
    };
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should get all exercises successfully', async () => {
      const mockExercises = [
        { id: '1', name: 'Push-ups', category: 'chest' },
        { id: '2', name: 'Squats', category: 'legs' }
      ];

      Exercise.find.mockResolvedValue(mockExercises);

      await exerciseController.getAll(req, res);

      expect(Exercise.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockExercises);
    });

    it('should handle errors when getting exercises', async () => {
      const mockError = new Error('Database error');
      Exercise.find.mockRejectedValue(mockError);

      await exerciseController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getOne', () => {
    it('should get single exercise successfully', async () => {
      const mockExercise = { id: '1', name: 'Push-ups', category: 'chest' };
      req.params.id = '1';

      Exercise.findById.mockResolvedValue(mockExercise);

      await exerciseController.getOne(req, res);

      expect(Exercise.findById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockExercise);
    });

    it('should handle errors when getting single exercise', async () => {
      const mockError = new Error('Exercise not found');
      req.params.id = 'invalid-id';

      Exercise.findById.mockRejectedValue(mockError);

      await exerciseController.getOne(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(mockError);
    });
  });
});
