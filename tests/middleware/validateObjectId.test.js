const mongoose = require('mongoose');

const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  next();
};

// Mock mongoose
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn()
    }
  }
}));

describe('ValidateObjectId Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {}
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next() for valid ObjectId', () => {
    req.params.id = '507f1f77bcf86cd799439011';
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);

    validateObjectId(req, res, next);

    expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    expect(next).toHaveBeenCalled();
  });

  it('should return 400 for invalid ObjectId', () => {
    req.params.id = 'invalid-id';
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);

    validateObjectId(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid ID format' });
    expect(next).not.toHaveBeenCalled();
  });
});
