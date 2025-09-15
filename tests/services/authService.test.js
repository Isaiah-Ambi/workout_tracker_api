const AuthService = require('../../services/authService');
const User = require('../../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock User model
jest.mock('../../models/userModel');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      const mockSave = jest.fn();
      const mockUser = {
        username: 'newuser',
        email: 'new@test.com',
        password: 'hashedPassword',
        save: mockSave
      };

      User.findOne.mockResolvedValue(null); // No existing user
      User.mockImplementation(() => mockUser);

      const result = await AuthService.register('newuser', 'new@test.com', 'password123');

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [
          { email: 'new@test.com' },
          { username: 'newuser' }
        ]
      });
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'mockSalt');
      expect(mockSave).toHaveBeenCalled();
      expect(result.name).toBe('Successful');
    });

    it('should return error if user already exists', async () => {
      const existingUser = { username: 'existinguser' };
      User.findOne.mockResolvedValue(existingUser);

      const result = await AuthService.register('existinguser', 'existing@test.com', 'password123');

      expect(result).toEqual({
        name: "UserExistsError",
        message: 'User already exists'
      });
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        _id: 'userId123',
        username: 'testuser',
        password: 'hashedPassword'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');

      const result = await AuthService.login('testuser', 'password123');

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [
          { username: 'testuser' },
          { email: 'testuser' }
        ]
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'userId123', name: 'testuser' },
        'test-secret-key',
        { expiresIn: '1h' }
      );
      expect(result).toEqual({
        name: "successfull",
        token: 'mockToken'
      });
    });
  });

  describe('listAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { username: 'user1' },
        { username: 'user2' }
      ];

      User.find.mockResolvedValue(mockUsers);

      const result = await AuthService.listAll();

      expect(User.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockUsers);
    });
  });
});