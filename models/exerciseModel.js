const { Schema, model } = require('mongoose')


const exerciseSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'full-body']
  },
  muscleGroups: [{
    type: String,
    required: true
  }],
  equipment: {
    type: String,
    enum: ['bodyweight', 'dumbbells', 'barbell', 'machine', 'resistance-band', 'kettlebell', 'cable', 'none'],
    default: 'bodyweight'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  instructions: [{
    type: String,
    required: true
  }],
  tips: [String],
  cautions: [String],
  variations: [String],
  estimatedDuration: {
    type: Number, // in seconds
    default: 60
  },
  caloriesPerMinute: {
    type: Number,
    default: 5
  }
}, {
  timestamps: true
});

const Exercise = model('Exercise', exerciseSchema);


module.exports = Exercise;