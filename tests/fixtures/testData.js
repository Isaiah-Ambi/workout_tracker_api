const mongoose = require('mongoose');

// Test data fixtures
const testUsers = [
  {
    _id: new mongoose.Types.ObjectId(),
    username: 'testuser1',
    email: 'test1@example.com',
    password: 'hashedPassword1'
  },
  {
    _id: new mongoose.Types.ObjectId(),
    username: 'testuser2',
    email: 'test2@example.com',
    password: 'hashedPassword2'
  }
];

const testExercises = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Push-ups',
    category: 'chest',
    muscleGroups: ['pectorals', 'triceps', 'shoulders'],
    equipment: 'bodyweight',
    difficulty: 'beginner',
    instructions: [
      'Start in a plank position',
      'Lower your body until chest nearly touches floor',
      'Push back up to starting position'
    ],
    estimatedDuration: 45,
    caloriesPerMinute: 7
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Squats',
    category: 'legs',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: 'bodyweight',
    difficulty: 'beginner',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower body as if sitting back into chair',
      'Push through heels to return to standing'
    ],
    estimatedDuration: 60,
    caloriesPerMinute: 8
  }
];

const testWorkoutPlans = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Beginner Full Body',
    description: 'A complete beginner workout',
    user: testUsers[0]._id,
    exercises: [
      {
        exercise: testExercises[0]._id,
        exerciseName: testExercises[0].name,
        order: 1,
        targetSets: 3,
        targetReps: 10,
        targetWeight: 0,
        sets: [
          { setNumber: 1, reps: 10, weight: 0, restTime: 60, completed: false },
          { setNumber: 2, reps: 10, weight: 0, restTime: 60, completed: false },
          { setNumber: 3, reps: 10, weight: 0, restTime: 60, completed: false }
        ]
      },
      {
        exercise: testExercises[1]._id,
        exerciseName: testExercises[1].name,
        order: 2,
        targetSets: 3,
        targetReps: 15,
        targetWeight: 0,
        sets: [
          { setNumber: 1, reps: 15, weight: 0, restTime: 60, completed: false },
          { setNumber: 2, reps: 15, weight: 0, restTime: 60, completed: false },
          { setNumber: 3, reps: 15, weight: 0, restTime: 60, completed: false }
        ]
      }
    ],
    category: 'strength',
    difficulty: 'beginner',
    estimatedDuration: 45,
    isActive: true
  }
];

const testScheduledWorkouts = [
  {
    _id: new mongoose.Types.ObjectId(),
    user: testUsers[0]._id,
    workoutPlan: testWorkoutPlans[0]._id,
    scheduledDate: new Date('2025-01-15'),
    scheduledTime: '07:00',
    status: 'scheduled',
    exercises: testWorkoutPlans[0].exercises,
    completionPercentage: 0,
    reminderTime: 30
  }
];

const testWorkoutLogs = [
  {
    _id: new mongoose.Types.ObjectId(),
    user: testUsers[0]._id,
    workoutPlan: testWorkoutPlans[0]._id,
    workoutName: testWorkoutPlans[0].name,
    completedAt: new Date('2025-01-14'),
    duration: 42,
    exercises: testWorkoutPlans[0].exercises.map(ex => ({
      ...ex,
      sets: ex.sets.map(set => ({ ...set, completed: true }))
    })),
    totalSets: 6,
    totalReps: 75,
    totalWeight: 0,
    caloriesBurned: 280,
    rating: 4
  }
];

module.exports = {
  testUsers,
  testExercises,
  testWorkoutPlans,
  testScheduledWorkouts,
  testWorkoutLogs
};
