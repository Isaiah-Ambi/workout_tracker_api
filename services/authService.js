const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel')
require('dotenv').config();

const secret_key = process.env.SECRET

const AuthService = {
    register: async (username, email, password) => {
        
        const existingUser = await User.findOne({ 
            $or:
            [
                {email: email}, 
                {username: username}
            ] 
        });
        if (existingUser) {
            return { 
                name: "UserExistsError",
                message: 'User already exists' 
            };
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            "username": username,
            "email": email,
            "password": hashedPassword,
        });
        await newUser.save();
        return {
            name: "Successful",
            "message": "User registered Successfully" ,
            newUser
        };     
    },

    login: async (username, password) => {
        const user = await User.findOne({
            $or: [
                {username: username},
                {email: username}
            ]
        });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const payload = { id: user._id, name: user.username };
        const token = jwt.sign(payload, secret_key, { expiresIn: '1h' });
        return {name: "successfull", token}
    },
    listAll: async () => {
        const users = await User.find({});
        console.log(users);
        return users;
    }

}


module.exports = AuthService;