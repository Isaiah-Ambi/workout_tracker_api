const { WorkoutPlan, ScheduledWorkout, WorkoutLog } = require('../models/workoutModel')

const WorkoutService = {
    get: async (category, difficulty, isActive, Search, filters ) => {
        
            
            
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
            return plans
    },
}


module.export = WorkoutService;