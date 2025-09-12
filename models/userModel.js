const mongoose = require('mongoose');
const { Schema, model } = mongoose;



const userSchema = Schema({
    username: String,
    email: String,
    password: String
})

const User = model('User', userSchema);

module.exports = User;

