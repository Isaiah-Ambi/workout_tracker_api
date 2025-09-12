const mongoose = require('mongoose');

// Exercise Set Schema - for individual sets within an exercise
const exerciseSetSchema = new mongoose.Schema({
  setNumber: {
    type: Number,
    required: true,
    min: 1
  },
  reps: {
    type: Number,
    required: true,
    min: 0
  },
  weight: {
    type: Number,
    default: 0,
    min: 0
  },
  restTime: {
    type: Number, // in seconds
    default: 60,
    min: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  }
}, { _id: false });

// Workout Exercise Schema - exercises within a workout plan
const workoutExerciseSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  exerciseName: {
    type: String,
    required: true // Store name for quick access
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  sets: [exerciseSetSchema],
  targetSets: {
    type: Number,
    required: true,
    min: 1
  },
  targetReps: {
    type: Number,
    required: true,
    min: 1
  },
  targetWeight: {
    type: Number,
    default: 0,
    min: 0
  },
  instructions: {
    type: String,
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Workout Plan Schema - template for workouts
const workoutPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exercises: [workoutExerciseSchema],
  category: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'mixed', 'custom'],
    default: 'custom'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true,
    min: 5
  },
  targetMuscleGroups: [{
    type: String,
    trim: true
  }],
  equipment: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true
});

// Scheduled Workout Schema - actual workout instances with scheduling
const scheduledWorkoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workoutPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutPlan',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String, // Format: "HH:MM" (24-hour format)
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Time must be in HH:MM format'
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'skipped', 'cancelled'],
    default: 'scheduled'
  },
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  actualDuration: {
    type: Number // in minutes
  },
  exercises: [workoutExerciseSchema], // Copy of exercises for tracking progress
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  caloriesBurned: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  // Notification settings
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderTime: {
    type: Number, // minutes before workout to send reminder
    default: 30
  }
}, {
  timestamps: true
});

// Workout Log Schema - for completed workout tracking and history
const workoutLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledWorkout: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScheduledWorkout'
  },
  workoutPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutPlan',
    required: true
  },
  workoutName: {
    type: String,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  exercises: [workoutExerciseSchema],
  totalSets: {
    type: Number,
    default: 0
  },
  totalReps: {
    type: Number,
    default: 0
  },
  totalWeight: {
    type: Number,
    default: 0
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Indexes for better performance
workoutPlanSchema.index({ user: 1, name: 1 });
workoutPlanSchema.index({ user: 1, isActive: 1 });
workoutPlanSchema.index({ category: 1, difficulty: 1 });

scheduledWorkoutSchema.index({ user: 1, scheduledDate: 1 });
scheduledWorkoutSchema.index({ user: 1, status: 1 });
scheduledWorkoutSchema.index({ scheduledDate: 1, scheduledTime: 1 });

workoutLogSchema.index({ user: 1, completedAt: -1 });
workoutLogSchema.index({ user: 1, workoutPlan: 1 });

// Methods for WorkoutPlan
workoutPlanSchema.methods.calculateEstimatedDuration = function() {
  let totalDuration = 0;
  this.exercises.forEach(exercise => {
    // Base time per set (assuming 45 seconds per set + rest time)
    const timePerSet = 45 + (exercise.sets[0]?.restTime || 60);
    totalDuration += exercise.targetSets * timePerSet;
  });
  return Math.ceil(totalDuration / 60); // Convert to minutes
};

workoutPlanSchema.methods.addExercise = function(exerciseData) {
  const order = this.exercises.length + 1;
  this.exercises.push({
    ...exerciseData,
    order: order
  });
  return this.save();
};

workoutPlanSchema.methods.removeExercise = function(exerciseId) {
  this.exercises = this.exercises.filter(ex => !ex.exercise.equals(exerciseId));
  // Reorder exercises
  this.exercises.forEach((ex, index) => {
    ex.order = index + 1;
  });
  return this.save();
};

// Methods for ScheduledWorkout
scheduledWorkoutSchema.methods.startWorkout = function() {
  this.status = 'in-progress';
  this.actualStartTime = new Date();
  return this.save();
};

scheduledWorkoutSchema.methods.completeWorkout = function() {
  this.status = 'completed';
  this.actualEndTime = new Date();
  if (this.actualStartTime) {
    this.actualDuration = Math.ceil((this.actualEndTime - this.actualStartTime) / (1000 * 60));
  }
  
  // Calculate completion percentage
  const totalSets = this.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = this.exercises.reduce((sum, ex) => 
    sum + ex.sets.filter(set => set.completed).length, 0
  );
  this.completionPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  
  return this.save();
};

scheduledWorkoutSchema.methods.updateExerciseProgress = function(exerciseIndex, setIndex, setData) {
  if (this.exercises[exerciseIndex] && this.exercises[exerciseIndex].sets[setIndex]) {
    Object.assign(this.exercises[exerciseIndex].sets[setIndex], setData);
    
    // Check if exercise is completed
    const exercise = this.exercises[exerciseIndex];
    const completedSets = exercise.sets.filter(set => set.completed).length;
    exercise.isCompleted = completedSets === exercise.sets.length;
    
    return this.save();
  }
  throw new Error('Exercise or set not found');
};

// Static methods
workoutPlanSchema.statics.findByUser = function(userId, options = {}) {
  const query = { user: userId };
  if (options.isActive !== undefined) {
    query.isActive = options.isActive;
  }
  return this.find(query).populate('exercises.exercise').sort({ updatedAt: -1 });
};

scheduledWorkoutSchema.statics.findUpcoming = function(userId, limit = 10) {
  return this.find({
    user: userId,
    scheduledDate: { $gte: new Date() },
    status: { $in: ['scheduled', 'in-progress'] }
  })
  .populate('workoutPlan')
  .sort({ scheduledDate: 1, scheduledTime: 1 })
  .limit(limit);
};

scheduledWorkoutSchema.statics.findByDateRange = function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    scheduledDate: {
      $gte: startDate,
      $lte: endDate
    }
  })
  .populate('workoutPlan')
  .sort({ scheduledDate: 1, scheduledTime: 1 });
};

workoutLogSchema.statics.getUserStats = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        completedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalWorkouts: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        totalSets: { $sum: '$totalSets' },
        totalReps: { $sum: '$totalReps' },
        totalWeight: { $sum: '$totalWeight' },
        totalCalories: { $sum: '$caloriesBurned' },
        averageRating: { $avg: '$rating' }
      }
    }
  ]);
};

// Create models
const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);
const ScheduledWorkout = mongoose.model('ScheduledWorkout', scheduledWorkoutSchema);
const WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);

module.exports = {
  WorkoutPlan,
  ScheduledWorkout,
  WorkoutLog
};