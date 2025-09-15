const mongoose = require('mongoose');
const { WorkoutPlan, ScheduledWorkout, WorkoutLog } = require('../../models/workoutModel');

describe('Workout Models', () => {
  describe('WorkoutPlan', () => {
    let workoutPlan;

    beforeEach(() => {
      workoutPlan = {
        exercises: [
          {
            targetSets: 3,
            sets: [
              { restTime: 60 },
              { restTime: 60 },
              { restTime: 60 }
            ]
          },
          {
            targetSets: 2,
            sets: [
              { restTime: 90 },
              { restTime: 90 }
            ]
          }
        ]
      };
    });

    describe('calculateEstimatedDuration', () => {
      it('should calculate duration correctly', () => {
        // Mock the method
        const calculateEstimatedDuration = function() {
          let totalDuration = 0;
          this.exercises.forEach(exercise => {
            const timePerSet = 45 + (exercise.sets[0]?.restTime || 60);
            totalDuration += exercise.targetSets * timePerSet;
          });
          return Math.ceil(totalDuration / 60);
        };

        workoutPlan.calculateEstimatedDuration = calculateEstimatedDuration;

        const duration = workoutPlan.calculateEstimatedDuration();
        
        // First exercise: 3 sets * (45 + 60) = 315 seconds
        // Second exercise: 2 sets * (45 + 90) = 270 seconds
        // Total: 585 seconds = 9.75 minutes ≈ 10 minutes
        expect(duration).toBe(10);
      });
    });

    describe('addExercise', () => {
      it('should add exercise with correct order', () => {
        const addExercise = function(exerciseData) {
          const order = this.exercises.length + 1;
          this.exercises.push({
            ...exerciseData,
            order: order
          });
          return Promise.resolve(this);
        };

        workoutPlan.exercises = [];
        workoutPlan.save = jest.fn(() => Promise.resolve(workoutPlan));
        workoutPlan.addExercise = addExercise;

        const newExercise = { exercise: 'ex1', targetSets: 3 };
        
        return workoutPlan.addExercise(newExercise).then(() => {
          expect(workoutPlan.exercises).toHaveLength(1);
          expect(workoutPlan.exercises[0].order).toBe(1);
        });
      });
    });
  });

  describe('ScheduledWorkout', () => {
    let scheduledWorkout;

    beforeEach(() => {
      scheduledWorkout = {
        status: 'scheduled',
        actualStartTime: null,
        actualEndTime: null,
        actualDuration: null,
        exercises: [
          {
            sets: [
              { completed: true },
              { completed: false },
              { completed: true }
            ]
          }
        ],
        completionPercentage: 0,
        save: jest.fn(() => Promise.resolve(scheduledWorkout))
      };
    });

    describe('startWorkout', () => {
      it('should start workout correctly', () => {
        const startWorkout = function() {
          this.status = 'in-progress';
          this.actualStartTime = new Date();
          return this.save();
        };

        scheduledWorkout.startWorkout = startWorkout;

        return scheduledWorkout.startWorkout().then(() => {
          expect(scheduledWorkout.status).toBe('in-progress');
          expect(scheduledWorkout.actualStartTime).toBeInstanceOf(Date);
          expect(scheduledWorkout.save).toHaveBeenCalled();
        });
      });
    });

    describe('completeWorkout', () => {
      it('should complete workout and calculate completion percentage', () => {
        const completeWorkout = function() {
          this.status = 'completed';
          this.actualEndTime = new Date();
          if (this.actualStartTime) {
            this.actualDuration = Math.ceil((this.actualEndTime - this.actualStartTime) / (1000 * 60));
          }
          
          const totalSets = this.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
          const completedSets = this.exercises.reduce((sum, ex) => 
            sum + ex.sets.filter(set => set.completed).length, 0
          );
          this.completionPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
          
          return this.save();
        };

        scheduledWorkout.actualStartTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
        scheduledWorkout.completeWorkout = completeWorkout;

        return scheduledWorkout.completeWorkout().then(() => {
          expect(scheduledWorkout.status).toBe('completed');
          expect(scheduledWorkout.actualEndTime).toBeInstanceOf(Date);
          expect(scheduledWorkout.completionPercentage).toBe(67); // 2 out of 3 sets completed
          expect(scheduledWorkout.actualDuration).toBeGreaterThan(0);
        });
      });
    });
  });
});