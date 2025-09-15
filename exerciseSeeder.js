const mongoose = require('mongoose');
require('dotenv').config();
const Exercise = require('./models/exerciseModel')



// Sample exercise data
const exerciseData = [
  // Chest Exercises
  {
    name: "Push-ups",
    category: "chest",
    muscleGroups: ["pectorals", "triceps", "shoulders", "core"],
    equipment: "bodyweight",
    difficulty: "beginner",
    instructions: [
      "Start in a plank position with hands slightly wider than shoulder-width apart",
      "Lower your body until your chest nearly touches the floor",
      "Push back up to the starting position",
      "Keep your core tight and body in a straight line throughout"
    ],
    tips: [
      "Focus on controlled movement",
      "Don't let your hips sag or pike up",
      "Breathe in on the way down, out on the way up"
    ],
    variations: ["Incline push-ups", "Diamond push-ups", "Wide-grip push-ups"],
    estimatedDuration: 45,
    caloriesPerMinute: 7
  },
  {
    name: "Bench Press",
    category: "chest",
    muscleGroups: ["pectorals", "triceps", "shoulders"],
    equipment: "barbell",
    difficulty: "intermediate",
    instructions: [
      "Lie on a bench with feet flat on the floor",
      "Grip the barbell with hands slightly wider than shoulder-width",
      "Lower the bar to your chest with control",
      "Press the bar back up to the starting position"
    ],
    tips: [
      "Keep your shoulder blades retracted",
      "Don't bounce the bar off your chest",
      "Use a spotter for safety"
    ],
    cautions: ["Always use a spotter", "Don't arch your back excessively"],
    variations: ["Incline bench press", "Decline bench press", "Dumbbell bench press"],
    estimatedDuration: 90,
    caloriesPerMinute: 6
  },

  // Back Exercises
  {
    name: "Pull-ups",
    category: "back",
    muscleGroups: ["latissimus dorsi", "rhomboids", "biceps", "rear delts"],
    equipment: "bodyweight",
    difficulty: "intermediate",
    instructions: [
      "Hang from a pull-up bar with palms facing away",
      "Pull your body up until your chin is over the bar",
      "Lower yourself back down with control",
      "Keep your core engaged throughout"
    ],
    tips: [
      "Focus on pulling with your back muscles",
      "Avoid swinging or kipping",
      "Full range of motion is key"
    ],
    variations: ["Chin-ups", "Wide-grip pull-ups", "Assisted pull-ups"],
    estimatedDuration: 60,
    caloriesPerMinute: 8
  },
  {
    name: "Bent-over Row",
    category: "back",
    muscleGroups: ["latissimus dorsi", "rhomboids", "middle traps", "biceps"],
    equipment: "barbell",
    difficulty: "intermediate",
    instructions: [
      "Stand with feet hip-width apart, holding a barbell",
      "Hinge at the hips and lean forward about 45 degrees",
      "Pull the barbell to your lower chest/upper abdomen",
      "Lower the weight back down with control"
    ],
    tips: [
      "Keep your back straight and core tight",
      "Pull with your elbows, not your hands",
      "Squeeze your shoulder blades together at the top"
    ],
    cautions: ["Don't round your back", "Start with lighter weight to master form"],
    variations: ["Dumbbell rows", "T-bar rows", "Cable rows"],
    estimatedDuration: 75,
    caloriesPerMinute: 6
  },

  // Leg Exercises
  {
    name: "Squats",
    category: "legs",
    muscleGroups: ["quadriceps", "glutes", "hamstrings", "calves", "core"],
    equipment: "bodyweight",
    difficulty: "beginner",
    instructions: [
      "Stand with feet shoulder-width apart",
      "Lower your body as if sitting back into a chair",
      "Keep your chest up and knees tracking over your toes",
      "Push through your heels to return to standing"
    ],
    tips: [
      "Keep your weight in your heels",
      "Don't let your knees cave inward",
      "Go as deep as your mobility allows"
    ],
    variations: ["Goblet squats", "Jump squats", "Single-leg squats"],
    estimatedDuration: 60,
    caloriesPerMinute: 8
  },
  {
    name: "Deadlifts",
    category: "legs",
    muscleGroups: ["hamstrings", "glutes", "erector spinae", "traps", "forearms"],
    equipment: "barbell",
    difficulty: "advanced",
    instructions: [
      "Stand with feet hip-width apart, bar over mid-foot",
      "Bend at hips and knees to grip the bar",
      "Keep your chest up and back straight",
      "Drive through your heels and hips to lift the bar",
      "Stand tall, then lower the bar back down"
    ],
    tips: [
      "Keep the bar close to your body",
      "Lead with your hips, not your back",
      "Focus on hip hinge movement"
    ],
    cautions: ["Master the hip hinge pattern first", "Consider starting with lighter weight"],
    variations: ["Romanian deadlifts", "Sumo deadlifts", "Trap bar deadlifts"],
    estimatedDuration: 90,
    caloriesPerMinute: 7
  },

  // Shoulder Exercises
  {
    name: "Overhead Press",
    category: "shoulders",
    muscleGroups: ["shoulders", "triceps", "upper chest", "core"],
    equipment: "barbell",
    difficulty: "intermediate",
    instructions: [
      "Stand with feet shoulder-width apart, holding barbell at shoulder height",
      "Press the bar straight up overhead",
      "Lock out your arms at the top",
      "Lower the bar back to shoulder level with control"
    ],
    tips: [
      "Keep your core tight throughout",
      "Don't arch your back excessively",
      "Press the bar in a straight line"
    ],
    variations: ["Dumbbell shoulder press", "Seated press", "Push press"],
    estimatedDuration: 75,
    caloriesPerMinute: 6
  },

  // Arm Exercises
  {
    name: "Bicep Curls",
    category: "arms",
    muscleGroups: ["biceps", "forearms"],
    equipment: "dumbbells",
    difficulty: "beginner",
    instructions: [
      "Stand with feet hip-width apart, dumbbells at your sides",
      "Curl the weights up by flexing your biceps",
      "Squeeze at the top of the movement",
      "Lower the weights back down with control"
    ],
    tips: [
      "Don't swing the weights",
      "Keep your elbows at your sides",
      "Focus on the muscle contraction"
    ],
    variations: ["Hammer curls", "Barbell curls", "Cable curls"],
    estimatedDuration: 45,
    caloriesPerMinute: 4
  },

  // Core Exercises
  {
    name: "Plank",
    category: "core",
    muscleGroups: ["core", "shoulders", "glutes"],
    equipment: "bodyweight",
    difficulty: "beginner",
    instructions: [
      "Start in a push-up position",
      "Lower onto your forearms",
      "Keep your body in a straight line from head to heels",
      "Hold this position while breathing normally"
    ],
    tips: [
      "Don't let your hips sag or pike up",
      "Keep your head in neutral position",
      "Engage your glutes and core"
    ],
    variations: ["Side plank", "Plank with leg lift", "Plank to push-up"],
    estimatedDuration: 60,
    caloriesPerMinute: 3
  },

  // Cardio Exercises
  {
    name: "Jumping Jacks",
    category: "cardio",
    muscleGroups: ["full body", "cardiovascular system"],
    equipment: "bodyweight",
    difficulty: "beginner",
    instructions: [
      "Start standing with feet together and arms at your sides",
      "Jump up while spreading your legs shoulder-width apart",
      "Simultaneously raise your arms overhead",
      "Jump back to the starting position",
      "Repeat in a continuous, rhythmic motion"
    ],
    tips: [
      "Land softly on the balls of your feet",
      "Keep a steady rhythm",
      "Modify by stepping instead of jumping if needed"
    ],
    variations: ["Star jumps", "Half jacks", "Cross jacks"],
    estimatedDuration: 30,
    caloriesPerMinute: 12
  },

  // Full-body Exercise
  {
    name: "Burpees",
    category: "full-body",
    muscleGroups: ["full body", "cardiovascular system"],
    equipment: "bodyweight",
    difficulty: "intermediate",
    instructions: [
      "Start in a standing position",
      "Drop into a squat and place hands on the floor",
      "Jump or step your feet back into a plank position",
      "Perform a push-up (optional)",
      "Jump or step feet back to squat position",
      "Jump up with arms overhead"
    ],
    tips: [
      "Move at your own pace",
      "Focus on form over speed",
      "Modify by stepping instead of jumping"
    ],
    variations: ["Half burpees", "Burpee box jumps", "Single-arm burpees"],
    estimatedDuration: 45,
    caloriesPerMinute: 15
  }
];

// Seeder function
const seedExercises = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing exercises
    await Exercise.deleteMany({});
    console.log('Cleared existing exercises');

    // Insert new exercises
    const exercises = await Exercise.insertMany(exerciseData);
    console.log(`Successfully seeded ${exercises.length} exercises`);

    // Display seeded exercises
    exercises.forEach(exercise => {
      console.log(`- ${exercise.name} (${exercise.category})`);
    });

  } catch (error) {
    console.error('Error seeding exercises:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeder
if (require.main === module) {
  seedExercises();
}

module.exports = { seedExercises, exerciseData };