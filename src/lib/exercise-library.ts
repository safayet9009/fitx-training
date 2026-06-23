// Rich exercise library with YouTube tutorials, difficulty, muscle group, calories.

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type GymExercise = {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: number;
  weight: number; // kg
  difficulty: Difficulty;
  caloriesPerSet: number;
  youtubeId: string;
  videoTitle: string;
};

export type HomeExercise = {
  id: string;
  name: string;
  muscle: string;
  rounds: number;
  duration: number; // seconds work
  rest: number;
  difficulty: Difficulty;
  caloriesPerRound: number;
  youtubeId: string;
  videoTitle: string;
};

// YouTube IDs are real, well-known form tutorials from popular fitness channels.
export const gymExercises: GymExercise[] = [
  { id: "g1", name: "Barbell Bench Press", muscle: "Chest", sets: 4, reps: 8, weight: 60,
    difficulty: "Intermediate", caloriesPerSet: 28, youtubeId: "rT7DgCr-3pg",
    videoTitle: "How To: Bench Press — Proper Form" },
  { id: "g2", name: "Back Squat", muscle: "Legs", sets: 4, reps: 6, weight: 80,
    difficulty: "Advanced", caloriesPerSet: 42, youtubeId: "ultWZbUMPL8",
    videoTitle: "How To Squat — Perfect Technique" },
  { id: "g3", name: "Deadlift", muscle: "Back", sets: 3, reps: 5, weight: 100,
    difficulty: "Advanced", caloriesPerSet: 55, youtubeId: "op9kVnSso6Q",
    videoTitle: "How To Deadlift — Step by Step" },
  { id: "g4", name: "Pull-Up", muscle: "Back", sets: 4, reps: 8, weight: 0,
    difficulty: "Intermediate", caloriesPerSet: 18, youtubeId: "eGo4IYlbE5g",
    videoTitle: "Perfect Pull-Up Technique" },
  { id: "g5", name: "Overhead Press", muscle: "Shoulders", sets: 4, reps: 8, weight: 35,
    difficulty: "Intermediate", caloriesPerSet: 24, youtubeId: "2yjwXTZQDDI",
    videoTitle: "How To: Overhead Press" },
  { id: "g6", name: "Barbell Row", muscle: "Back", sets: 4, reps: 10, weight: 50,
    difficulty: "Intermediate", caloriesPerSet: 30, youtubeId: "vT2GjY_Umpw",
    videoTitle: "Barbell Bent-Over Row Form" },
  { id: "g7", name: "Romanian Deadlift", muscle: "Legs", sets: 3, reps: 10, weight: 70,
    difficulty: "Intermediate", caloriesPerSet: 32, youtubeId: "JCXUYuzwNrM",
    videoTitle: "Romanian Deadlift Tutorial" },
  { id: "g8", name: "Tricep Rope Pushdown", muscle: "Arms", sets: 3, reps: 12, weight: 25,
    difficulty: "Beginner", caloriesPerSet: 14, youtubeId: "vB5OHsJ3EME",
    videoTitle: "Tricep Pushdown — Cable Form" },
  { id: "g9", name: "Bicep Curl", muscle: "Arms", sets: 3, reps: 12, weight: 14,
    difficulty: "Beginner", caloriesPerSet: 12, youtubeId: "ykJmrZ5v0Oo",
    videoTitle: "Dumbbell Bicep Curl" },
  { id: "g10", name: "Lunges", muscle: "Legs", sets: 3, reps: 12, weight: 20,
    difficulty: "Beginner", caloriesPerSet: 22, youtubeId: "QOVaHwm-Q6U",
    videoTitle: "How To: Walking Lunge" },
];

export const homeExercises: HomeExercise[] = [
  { id: "h1", name: "Push-up", muscle: "Chest", rounds: 4, duration: 40, rest: 20,
    difficulty: "Beginner", caloriesPerRound: 12, youtubeId: "IODxDxX7oi4",
    videoTitle: "How To Do A Perfect Push-Up" },
  { id: "h2", name: "Plank", muscle: "Core", rounds: 3, duration: 45, rest: 15,
    difficulty: "Beginner", caloriesPerRound: 8, youtubeId: "ASdvN_XEl_c",
    videoTitle: "Proper Plank Form" },
  { id: "h3", name: "Mountain Climbers", muscle: "Core", rounds: 4, duration: 30, rest: 15,
    difficulty: "Intermediate", caloriesPerRound: 14, youtubeId: "nmwgirgXLYM",
    videoTitle: "Mountain Climbers Tutorial" },
  { id: "h4", name: "Jumping Jacks", muscle: "Cardio", rounds: 4, duration: 40, rest: 10,
    difficulty: "Beginner", caloriesPerRound: 16, youtubeId: "c4DAnQ6DtF8",
    videoTitle: "Jumping Jacks Cardio" },
  { id: "h5", name: "Burpees", muscle: "Full Body", rounds: 4, duration: 30, rest: 20,
    difficulty: "Advanced", caloriesPerRound: 20, youtubeId: "TU8QYVW0gDU",
    videoTitle: "How To Do A Burpee" },
  { id: "h6", name: "Squat Jumps", muscle: "Legs", rounds: 3, duration: 30, rest: 15,
    difficulty: "Intermediate", caloriesPerRound: 18, youtubeId: "A-cFYWvaHr0",
    videoTitle: "Squat Jump Form" },
];

export const muscleGroups = [
  "All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", "Full Body",
] as const;
