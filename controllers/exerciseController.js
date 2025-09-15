const express = require('express');
const Exercise = require('../models/exerciseModel');


exports.getAll = async (req, res) => {
    try{
        const exercises = await Exercise.find({});
        res.status(200).json(exercises);
    } catch (error) {
        res.status(400).json(error);
    }
}

exports.getOne = async (req, res) => {
    try{
        const id = req.params.id
        const exercise = await Exercise.findById(id);
        res.status(200).json(exercise);
    } catch (error) {
        res.status(400).json(error);
    }
}