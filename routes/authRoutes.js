const { Router } = require('express');
const AuthService = require('../services/authService');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();


router.post('/register', async (req, res) => {
    try{
        const { username, email, password } = req.body;
        newUser = await AuthService.register(username, email, password);
        res.json(newUser);
    } catch(error) {
        res.json({ error })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if(username) {
            const token = await AuthService.login(username, password)
            res.json({token})
            return
        }
        if(email) {
            const token = AuthService.login(email, password)
            res.json({token})
            return
        }
        
    } catch(error) {
        res.json(error);
    }
});

router.get('/all', async (req, res) => {
    try {
        console.log("all")
        const users = await AuthService.listAll();
        console.log(users)
        res.json(users);
    } catch (error) {
        res.json({error})
    }
});

module.exports = router;