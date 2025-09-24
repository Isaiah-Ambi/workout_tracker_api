const express = require('express');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const workoutRoutes = require('./routes/workoutRoutes');

const swaggerJsdoc = require("swagger-jsdoc"),
const swaggerUi = require("swagger-ui-express");

require('dotenv').config()

const app = express();


app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/exercise', exerciseRoutes);
app.use('/api/workout', workoutRoutes);


module.exports = app