const express = require('express');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');

require('dotenv').config()

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;


mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use(express.json());

app.use('/api', authRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});