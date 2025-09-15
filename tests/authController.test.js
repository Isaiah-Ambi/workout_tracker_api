const authController = require('../controllers/authController');
const AuthService = require('../services/authService');

// Mock the AuthService
jest.mock('../services/authService');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn(() => res)
    };
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const mockUser = {
        name: "Successful",
        message: "User registered Successfully",
        newUser: { id: '123', username: 'testuser', email: 'test@test.com' }
      };

      req.body = {
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123'
      };

      AuthService.register.mockResolvedValue(mockUser);

      await authController.createUser(req, res);

      expect(AuthService.register).toHaveBeenCalledWith('testuser', 'test@test.com', 'password123');
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle registration errors', async () => {
      const mockError = {
        name: "UserExistsError",
        message: 'User already exists'
      };

      req.body = {
        username: 'existinguser',
        email: 'existing@test.com',
        password: 'password123'
      };

      AuthService.register.mockResolvedValue(mockError);

      await authController.createUser(req, res);

      expect(res.json).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getToken', () => {
    it('should login with username successfully', async () => {
      const mockToken = { 
         
          name: "successfull", 
          token: "mockToken" 
      };

      req.body = {
        username: 'testuser',
        password: 'password123'
      };

      AuthService.login.mockResolvedValue(mockToken);

      await authController.getToken(req, res);

      expect(AuthService.login).toHaveBeenCalledWith('testuser', 'password123');
      expect(res.json).toHaveBeenCalledWith({ token: { name: 'successfull', token: 'mockToken' } });
    });

    it('should login with email successfully', async () => {
      const mockToken = { 
        name: "successfull", 
        token: "mockToken"
      };

      req.body = {
        email: 'test@test.com',
        password: 'password123'
      };

      AuthService.login.mockResolvedValue(mockToken);

      await authController.getToken(req, res);

      expect(AuthService.login).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(res.json).toHaveBeenCalledWith({ token: { name: 'successfull', token: 'mockToken' } });
    });

    it('should handle login errors', async () => {
      const mockError = new Error('Invalid credentials');

      req.body = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      AuthService.login.mockRejectedValue(mockError);

      await authController.getToken(req, res);

      expect(res.json).toHaveBeenCalledWith(mockError);
    });
  });
});