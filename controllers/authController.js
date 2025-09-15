const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const AuthService = require('../services/authService');


exports.createUser = async (req, res) => {
    try{
        const { username, email, password } = req.body;
        newUser = await AuthService.register(username, email, password);
        res.json(newUser);
    } catch(error) {
        res.json({ error });
    }
};

exports.getToken = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if(username) {
            const token = await AuthService.login(username, password)
            res.json({token})
            return
        }
        if(email) {
            const token = await AuthService.login(email, password)
            console.log({token});
            res.json({token});
            return
        }
        
    } catch(error) {
        res.json(error);
    }
};

// module.exports = { createUser };