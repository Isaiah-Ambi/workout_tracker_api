const { Router } = require('express');
const AuthService = require('../services/authService');
const authMiddleware = require('../middleware/authMiddleware');
const { createUser, getToken } = require('../controllers/authController');

const router = Router();


router.post('/register', createUser );
router.post('/login', getToken);


module.exports = router;