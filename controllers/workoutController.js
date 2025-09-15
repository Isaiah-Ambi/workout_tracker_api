const { Router } = require('express');
const checkOwnership = require('../middleware/checkOwnership');
const validateObjectId = require('../middleware/validateObjectId');
const authMiddleware = require('../middleware/authMiddleware');

const Exercise = require('../models/exerciseModel');
const { WorkoutPlan, ScheduledWorkout, WorkoutLog } = require('../models/workoutModel');
const WorkoutService = require('../services/workoutService');

// const router = Router();

// router.use(authMiddleware);

exports.getPlans = async (req, res) => {
  try {
    const { category, difficulty, isActive, search } = req.query;
    const filters = { user: req.user.id };
    
    if (category) filters.category = category;
    if (difficulty) filters.difficulty = difficulty;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const plans = await WorkoutPlan.find(filters)
      .populate('exercises.exercise', 'name category muscleGroups equipment')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: plans,
      count: plans.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/workouts/plans/:id - Get single workout plan
exports.getOnePlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id)
      .populate('exercises.exercise', 'name category muscleGroups equipment instructions');
    
    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/workouts/plans - Create new workout plan
exports.createPlan = async (req, res) => {
  try {
    const { name, description, exercises, category, difficulty, tags } = req.body;

    // Validate required fields
    if (!name || !exercises || exercises.length === 0) {
      return res.status(400).json({ 
        error: 'Name and at least one exercise are required' 
      });
    }

    // Validate exercises exist
    const exerciseIds = exercises.map(ex => ex.exercise);
    // console.log(exerciseIds);
    const validExercises = await Exercise.find({ _id: { $in: exerciseIds } });
    // console.log(validExercises);
    if (validExercises.length !== exerciseIds.length) {
      return res.status(400).json({ error: 'One or more exercises not found' });
    }

    // Add exercise names and create sets if not provided
    const processedExercises = exercises.map((ex, index) => {
      const exerciseDoc = validExercises.find(e => e._id.equals(ex.exercise));
      
      // Create default sets if not provided
      const sets = ex.sets || Array.from({ length: ex.targetSets || 3 }, (_, i) => ({
        setNumber: i + 1,
        reps: ex.targetReps || 10,
        weight: ex.targetWeight || 0,
        restTime: 60,
        completed: false
      }));

      return {
        ...ex,
        exerciseName: exerciseDoc.name,
        order: index + 1,
        sets
      };
    });

    const workoutPlan = new WorkoutPlan({
      name,
      description,
      user: req.user.id,
      exercises: processedExercises,
      category: category || 'custom',
      difficulty: difficulty || 'beginner',
      tags: tags || [],
      estimatedDuration: 45 // Default, can be calculated
    });

    // Calculate estimated duration
    workoutPlan.estimatedDuration = workoutPlan.calculateEstimatedDuration();

    await workoutPlan.save();
    await workoutPlan.populate('exercises.exercise', 'name category muscleGroups');

    res.status(201).json({
      success: true,
      data: workoutPlan,
      message: 'Workout plan created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/workouts/plans/:id - Update workout plan
exports.updatePlan = async (req, res) => {
  try {
    const { name, description, exercises, category, difficulty, tags, isActive } = req.body;
    const plan = req.doc;

    // Update basic fields
    if (name) plan.name = name;
    if (description !== undefined) plan.description = description;
    if (category) plan.category = category;
    if (difficulty) plan.difficulty = difficulty;
    if (tags) plan.tags = tags;
    if (isActive !== undefined) plan.isActive = isActive;

    // Update exercises if provided
    if (exercises) {
      const exerciseIds = exercises.map(ex => ex.exercise);
      const validExercises = await Exercise.find({ _id: { $in: exerciseIds } });
      
      if (validExercises.length !== exerciseIds.length) {
        return res.status(400).json({ error: 'One or more exercises not found' });
      }

      const processedExercises = exercises.map((ex, index) => {
        const exerciseDoc = validExercises.find(e => e._id.equals(ex.exercise));
        return {
          ...ex,
          exerciseName: exerciseDoc.name,
          order: index + 1
        };
      });

      plan.exercises = processedExercises;
      plan.estimatedDuration = plan.calculateEstimatedDuration();
    }

    await plan.save();
    await plan.populate('exercises.exercise', 'name category muscleGroups');

    res.json({
      success: true,
      data: plan,
      message: 'Workout plan updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/workouts/plans/:id - Delete workout plan
exports.deletePlan = async (req, res) => {
  try {
    await WorkoutPlan.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Workout plan deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/workouts/plans/:id/exercises - Add exercise to workout plan
exports.addExercise = async (req, res) => {
  try {
    const { exercise, targetSets, targetReps, targetWeight, instructions } = req.body;
    
    // Validate exercise exists
    const exerciseDoc = await Exercise.findById(exercise);
    if (!exerciseDoc) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const exerciseData = {
      exercise,
      exerciseName: exerciseDoc.name,
      targetSets: targetSets || 3,
      targetReps: targetReps || 10,
      targetWeight: targetWeight || 0,
      instructions,
      sets: Array.from({ length: targetSets || 3 }, (_, i) => ({
        setNumber: i + 1,
        reps: targetReps || 10,
        weight: targetWeight || 0,
        restTime: 60,
        completed: false
      }))
    };

    await req.doc.addExercise(exerciseData);
    await req.doc.populate('exercises.exercise', 'name category muscleGroups');

    res.json({
      success: true,
      data: req.doc,
      message: 'Exercise added to workout plan'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/workouts/plans/:id/exercises/:exerciseId - Remove exercise from plan
exports.deleteExercise = async (req, res) => {
  try {
    await req.doc.removeExercise(req.params.exerciseId);
    
    res.json({
      success: true,
      data: req.doc,
      message: 'Exercise removed from workout plan'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========================
// SCHEDULED WORKOUT ROUTES
// ========================

// GET /api/workouts/scheduled - Get scheduled workouts
exports.getScheduledWorkouts = async (req, res) => {
  try {
    const { status, startDate, endDate, upcoming } = req.query;
    let query = { user: req.user.id };

    if (status) {
      query.status = { $in: status.split(',') };
    }

    if (upcoming === 'true') {
      query.scheduledDate = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'in-progress'] };
    }

    if (startDate && endDate) {
      query.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const workouts = await ScheduledWorkout.find(query)
      .populate('workoutPlan', 'name description estimatedDuration category')
      .sort({ scheduledDate: 1, scheduledTime: 1 });

    res.json({
      success: true,
      data: workouts,
      count: workouts.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/workouts/scheduled/:id - Get single scheduled workout
exports.getOneScheduledWorkout = async (req, res) => {
  try {
    const workout = await ScheduledWorkout.findById(req.params.id)
      .populate('workoutPlan')
      .populate('exercises.exercise', 'name instructions tips');

    res.json({
      success: true,
      data: workout
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/workouts/scheduled - Schedule a workout
exports.addScheduleWorkout = async (req, res) => {
  try {
    const { workoutPlan, scheduledDate, scheduledTime, reminderTime } = req.body;

    // Validate workout plan exists and belongs to user
    const plan = await WorkoutPlan.findOne({ 
      _id: workoutPlan, 
      user: req.user.id 
    }).populate('exercises.exercise');

    if (!plan) {
      return res.status(404).json({ error: 'Workout plan not found' });
    }

    // Create a copy of exercises for tracking progress
    const exercisesCopy = plan.exercises.map(ex => ({
      ...ex.toObject(),
      sets: ex.sets.map(set => ({ ...set, completed: false }))
    }));

    const scheduledWorkout = new ScheduledWorkout({
      user: req.user.id,
      workoutPlan,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      reminderTime: reminderTime || 30,
      exercises: exercisesCopy
    });

    await scheduledWorkout.save();
    await scheduledWorkout.populate('workoutPlan', 'name description estimatedDuration');

    res.status(201).json({
      success: true,
      data: scheduledWorkout,
      message: 'Workout scheduled successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/workouts/scheduled/:id - Update scheduled workout
exports.updateScheduledWorkout = async (req, res) => {
  try {
    const { scheduledDate, scheduledTime, status, notes, rating } = req.body;
    const workout = req.doc;

    if (scheduledDate) workout.scheduledDate = new Date(scheduledDate);
    if (scheduledTime) workout.scheduledTime = scheduledTime;
    if (status) workout.status = status;
    if (notes !== undefined) workout.notes = notes;
    if (rating) workout.rating = rating;

    await workout.save();

    res.json({
      success: true,
      data: workout,
      message: 'Scheduled workout updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/workouts/scheduled/:id/start - Start a workout
exports.startScheduledWorkout = async (req, res) => {
  try {
    const workout = req.doc;
    
    if (workout.status !== 'scheduled') {
      return res.status(400).json({ 
        error: 'Can only start scheduled workouts' 
      });
    }

    await workout.startWorkout();

    res.json({
      success: true,
      data: workout,
      message: 'Workout started successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/workouts/scheduled/:id/complete - Complete a workout
exports.completeScheduledWorkout = async (req, res) => {
  try {
    const { rating, notes, caloriesBurned } = req.body;
    const workout = req.doc;

    if (workout.status !== 'in-progress') {
      return res.status(400).json({ 
        error: 'Can only complete in-progress workouts' 
      });
    }

    if (rating) workout.rating = rating;
    if (notes) workout.notes = notes;
    if (caloriesBurned) workout.caloriesBurned = caloriesBurned;

    await workout.completeWorkout();

    // Create workout log entry
    const workoutLog = new WorkoutLog({
      user: req.user.id,
      scheduledWorkout: workout._id,
      workoutPlan: workout.workoutPlan,
      workoutName: workout.workoutPlan.name || 'Workout',
      duration: workout.actualDuration,
      exercises: workout.exercises,
      totalSets: workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0),
      totalReps: workout.exercises.reduce((sum, ex) => 
        sum + ex.sets.reduce((setSum, set) => setSum + (set.completed ? set.reps : 0), 0), 0
      ),
      totalWeight: workout.exercises.reduce((sum, ex) => 
        sum + ex.sets.reduce((setSum, set) => setSum + (set.completed ? set.weight * set.reps : 0), 0), 0
      ),
      caloriesBurned: workout.caloriesBurned,
      rating: workout.rating,
      notes: workout.notes
    });

    await workoutLog.save();

    res.json({
      success: true,
      data: workout,
      message: 'Workout completed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/workouts/scheduled/:id/exercise/:exerciseIndex/set/:setIndex - Update set progress
exports.updateSetProgress = async (req, res) => {
    try {
      const { exerciseIndex, setIndex } = req.params;
      const { reps, weight, completed, notes } = req.body;
      
      const setData = {};
      if (reps !== undefined) setData.reps = reps;
      if (weight !== undefined) setData.weight = weight;
      if (completed !== undefined) setData.completed = completed;
      if (notes !== undefined) setData.notes = notes;

      await req.doc.updateExerciseProgress(
        parseInt(exerciseIndex), 
        parseInt(setIndex), 
        setData
      );

      res.json({
        success: true,
        data: req.doc,
        message: 'Set progress updated successfully'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

// DELETE /api/workouts/scheduled/:id - Cancel/delete scheduled workout
exports.deleteScheduledWorkout = async (req, res) => {
  try {
    await ScheduledWorkout.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Scheduled workout deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========================
// WORKOUT LOG ROUTES
// ========================

// GET /api/workouts/logs - Get workout history
exports.getLogs = async (req, res) => {
  try {
    const { limit = 10, page = 1, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { user: req.user.id };
    
    if (startDate && endDate) {
      query.completedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const logs = await WorkoutLog.find(query)
      .populate('workoutPlan', 'name category')
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await WorkoutLog.countDocuments(query);

    res.json({
      success: true,
      data: logs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/workouts/logs/:id - Get single workout log
exports.getOneLog = async (req, res) => {
  try {
    const log = await WorkoutLog.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    }).populate('workoutPlan').populate('exercises.exercise');

    if (!log) {
      return res.status(404).json({ error: 'Workout log not found' });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// GET /api/workouts/stats - Get user workout statistics
exports.getStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const stats = await WorkoutLog.getUserStats(req.user.id, parseInt(days));
    
    // Get additional stats
    const totalPlans = await WorkoutPlan.countDocuments({ 
      user: req.user.id, 
      isActive: true 
    });
    
    const upcomingWorkouts = await ScheduledWorkout.countDocuments({
      user: req.user.id,
      scheduledDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'in-progress'] }
    });

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        workoutStats: stats[0] || {
          totalWorkouts: 0,
          totalDuration: 0,
          totalSets: 0,
          totalReps: 0,
          totalWeight: 0,
          totalCalories: 0,
          averageRating: 0
        },
        totalActivePlans: totalPlans,
        upcomingWorkouts
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// module.exports = router;