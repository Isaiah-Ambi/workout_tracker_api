const { Router } = require('express');
const checkOwnership = require('../middleware/checkOwnership');
const validateObjectId = require('../middleware/validateObjectId');
const authMiddleware = require('../middleware/authMiddleware');

const Exercise = require('../models/exerciseModel');
const { WorkoutPlan, ScheduledWorkout, WorkoutLog } = require('../models/workoutModel');
const WorkoutService = require('../services/workoutService');
const { getPlans, getOnePlan, createPlan, updatePlan, deletePlan,
  addExercise, deleteExercise, getScheduledWorkouts, getOneScheduledWorkout, addScheduleWorkout,
  updateScheduledWorkout, startScheduledWorkout, completeScheduledWorkout,
  updateSetProgress, deleteScheduledWorkout, getLogs, getOneLog, getStats

  } = require('../controllers/workoutController')


const router = Router();

router.use(authMiddleware);

router.get('/plans', getPlans);

// GET /api/workouts/plans/:id - Get single workout plan
router.get('/plans/:id', validateObjectId, checkOwnership(WorkoutPlan), getOnePlan);

// POST /api/workouts/plans - Create new workout plan
router.post('/plans', createPlan);

// PUT /api/workouts/plans/:id - Update workout plan
router.put('/plans/:id', validateObjectId, checkOwnership(WorkoutPlan), updatePlan);

// DELETE /api/workouts/plans/:id - Delete workout plan
router.delete('/plans/:id', validateObjectId, checkOwnership(WorkoutPlan), deletePlan);

// POST /api/workouts/plans/:id/exercises - Add exercise to workout plan
router.post('/plans/:id/exercises', validateObjectId, checkOwnership(WorkoutPlan), addExercise);

// DELETE /api/workouts/plans/:id/exercises/:exerciseId - Remove exercise from plan
router.delete('/plans/:id/exercises/:exerciseId', validateObjectId, checkOwnership(WorkoutPlan), deleteExercise);

// ========================
// SCHEDULED WORKOUT ROUTES
// ========================

// GET /api/workouts/scheduled - Get scheduled workouts
router.get('/scheduled', getScheduledWorkouts);

// GET /api/workouts/scheduled/:id - Get single scheduled workout
router.get('/scheduled/:id', validateObjectId, checkOwnership(ScheduledWorkout), getOneScheduledWorkout);

// POST /api/workouts/scheduled - Schedule a workout
router.post('/scheduled', addScheduleWorkout);

// PUT /api/workouts/scheduled/:id - Update scheduled workout
router.put('/scheduled/:id', validateObjectId, checkOwnership(ScheduledWorkout), updateScheduledWorkout);

// POST /api/workouts/scheduled/:id/start - Start a workout
router.post('/scheduled/:id/start', validateObjectId, checkOwnership(ScheduledWorkout), startScheduledWorkout);

// POST /api/workouts/scheduled/:id/complete - Complete a workout
router.post('/scheduled/:id/complete', validateObjectId, checkOwnership(ScheduledWorkout), completeScheduledWorkout)

// PUT /api/workouts/scheduled/:id/exercise/:exerciseIndex/set/:setIndex - Update set progress
router.put('/scheduled/:id/exercise/:exerciseIndex/set/:setIndex', 
  validateObjectId, 
  checkOwnership(ScheduledWorkout), 
  updateSetProgress

);

// DELETE /api/workouts/scheduled/:id - Cancel/delete scheduled workout
router.delete('/scheduled/:id', validateObjectId, checkOwnership(ScheduledWorkout), deleteScheduledWorkout);

// ========================
// WORKOUT LOG ROUTES
// ========================

// GET /api/workouts/logs - Get workout history
router.get('/logs', getLogs);

// GET /api/workouts/logs/:id - Get single workout log
router.get('/logs/:id', validateObjectId, getOneLog);

// GET /api/workouts/stats - Get user workout statistics
router.get('/stats', getStats);

module.exports = router;