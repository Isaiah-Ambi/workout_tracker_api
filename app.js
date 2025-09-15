const express = require('express');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const workoutRoutes = require('./routes/workoutRoutes');

require('dotenv').config()

const app = express();


app.use(express.json());

app.use('/api', authRoutes);
app.use('/exercise', exerciseRoutes);
app.use('/workout', workoutRoutes);


module.exports = app