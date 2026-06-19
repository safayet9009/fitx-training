// Centralized mock data for FitX

export const currentUser = {
  id: "u1",
  name: "Arjun Rahman",
  email: "arjun@fitx.app",
  avatar: "AR",
  level: 14,
  xp: 2840,
  xpToNext: 3500,
  streak: 23,
  bmi: 23.1,
  bmiStatus: "Normal" as const,
  height: 178,
  weight: 73,
  goal: "Build lean muscle",
  role: "admin" as "admin" | "user",
  subscription: { plan: "Pro Monthly", status: "active", renews: "Jul 19, 2026", trialDays: 4 },
};

export type Activity = {
  id: string;
  type: "gym" | "run" | "home";
  title: string;
  duration: string;
  calories: number;
  xp: number;
  date: string;
  user?: string;
};

export const activities: Activity[] = [
  { id: "a1", type: "gym",  title: "Push Day — Chest & Triceps", duration: "58 min", calories: 412, xp: 180, date: "Today, 7:42 AM" },
  { id: "a2", type: "run",  title: "Morning Run — Ramna Park",   duration: "32 min", calories: 286, xp: 140, date: "Yesterday, 6:10 AM" },
  { id: "a3", type: "home", title: "Core Crusher — 4 Rounds",    duration: "22 min", calories: 178, xp: 90,  date: "Yesterday, 9:35 PM" },
  { id: "a4", type: "gym",  title: "Leg Day — Squats & Lunges",  duration: "1h 12m", calories: 540, xp: 220, date: "Tue, 6:55 AM" },
  { id: "a5", type: "run",  title: "Tempo Run 5K",                duration: "26 min", calories: 312, xp: 150, date: "Mon, 7:20 AM" },
  { id: "a6", type: "home", title: "Mobility & Stretch",          duration: "18 min", calories: 92,  xp: 60,  date: "Sun, 8:00 AM" },
];

export const dailySummary = {
  caloriesBurned: 612,
  workoutsCompleted: 2,
  xpEarnedToday: 270,
};

export const weeklySummary = {
  workouts: 6,
  minutes: 248,
  calories: 1820,
  xp: 840,
};

export const leaderboard = [
  { id: "u9",  rank: 1, name: "Nadia Karim",   level: 22, xp: 5840, you: false },
  { id: "u4",  rank: 2, name: "Tanvir Hasan",  level: 20, xp: 5210, you: false },
  { id: "u7",  rank: 3, name: "Mehzabin Ali",  level: 19, xp: 4980, you: false },
  { id: "u2",  rank: 4, name: "Rakib Chowdhury", level: 17, xp: 4120, you: false },
  { id: "u5",  rank: 5, name: "Sumi Akter",    level: 16, xp: 3760, you: false },
  { id: "u1",  rank: 6, name: "Arjun Rahman",  level: 14, xp: 2840, you: true  },
  { id: "u8",  rank: 7, name: "Imran Hossain", level: 13, xp: 2640, you: false },
  { id: "u3",  rank: 8, name: "Faria Sultana", level: 12, xp: 2410, you: false },
];

export type Center = {
  id: string;
  name: string;
  city: "Dhaka" | "Chittagong" | "Barishal";
  area: string;
  fee: number; // BDT/month
  facilities: string[];
};

export const centers: Center[] = [
  // Dhaka (7)
  { id: "c1",  name: "FitX Gulshan",      city: "Dhaka", area: "Gulshan 2",   fee: 3500, facilities: ["Cardio", "Free Weights", "Sauna", "PT"] },
  { id: "c2",  name: "FitX Dhanmondi",    city: "Dhaka", area: "Dhanmondi 27", fee: 2800, facilities: ["Cardio", "Yoga", "Locker"] },
  { id: "c3",  name: "FitX Banani",       city: "Dhaka", area: "Banani 11",   fee: 3200, facilities: ["CrossFit", "PT", "Shower"] },
  { id: "c4",  name: "FitX Uttara",       city: "Dhaka", area: "Sector 7",    fee: 2500, facilities: ["Cardio", "Weights"] },
  { id: "c5",  name: "FitX Mirpur",       city: "Dhaka", area: "Mirpur 10",   fee: 2200, facilities: ["Weights", "Boxing"] },
  { id: "c6",  name: "FitX Mohakhali",    city: "Dhaka", area: "DOHS",        fee: 3000, facilities: ["Cardio", "Sauna"] },
  { id: "c7",  name: "FitX Bashundhara",  city: "Dhaka", area: "Block C",     fee: 3600, facilities: ["Pool", "Yoga", "PT"] },
  // Chittagong (4)
  { id: "c8",  name: "FitX Agrabad",      city: "Chittagong", area: "Agrabad",   fee: 2400, facilities: ["Cardio", "Weights"] },
  { id: "c9",  name: "FitX Nasirabad",    city: "Chittagong", area: "Nasirabad", fee: 2600, facilities: ["CrossFit", "PT"] },
  { id: "c10", name: "FitX GEC",          city: "Chittagong", area: "GEC Circle", fee: 2300, facilities: ["Cardio", "Yoga"] },
  { id: "c11", name: "FitX Khulshi",      city: "Chittagong", area: "Khulshi",   fee: 2700, facilities: ["Sauna", "Weights"] },
  // Barishal (3)
  { id: "c12", name: "FitX Band Road",    city: "Barishal", area: "Band Road", fee: 1800, facilities: ["Cardio", "Weights"] },
  { id: "c13", name: "FitX Sadar",        city: "Barishal", area: "Sadar Road", fee: 1900, facilities: ["Yoga", "PT"] },
  { id: "c14", name: "FitX Nathullabad",  city: "Barishal", area: "Nathullabad", fee: 1700, facilities: ["Weights"] },
];

export const badges = [
  { id: "b1", name: "First Sweat",    icon: "💧", unlocked: true,  desc: "Complete your first workout" },
  { id: "b2", name: "7-Day Streak",   icon: "🔥", unlocked: true,  desc: "Train 7 days in a row" },
  { id: "b3", name: "Iron Will",      icon: "🏋️", unlocked: true,  desc: "Lift 5,000 kg total volume" },
  { id: "b4", name: "Roadrunner",     icon: "🏃", unlocked: true,  desc: "Run 25 km total" },
  { id: "b5", name: "Early Bird",     icon: "🌅", unlocked: false, desc: "10 workouts before 7 AM" },
  { id: "b6", name: "Century Club",   icon: "💯", unlocked: false, desc: "100 workouts completed" },
  { id: "b7", name: "Marathon Mind",  icon: "🧠", unlocked: false, desc: "Run 42 km cumulative" },
  { id: "b8", name: "Legend",         icon: "👑", unlocked: false, desc: "Reach Level 25" },
];

export const gymExercises = [
  { id: "e1", name: "Barbell Bench Press", muscle: "Chest",     sets: 4, reps: 8,  weight: 60 },
  { id: "e2", name: "Incline Dumbbell Press", muscle: "Chest",  sets: 3, reps: 10, weight: 22 },
  { id: "e3", name: "Tricep Rope Pushdown",  muscle: "Triceps", sets: 3, reps: 12, weight: 25 },
  { id: "e4", name: "Overhead Press",        muscle: "Shoulders", sets: 4, reps: 8, weight: 35 },
];

export const homeExercises = [
  { id: "h1", name: "Push-ups",       duration: 45, rest: 15, rounds: 4 },
  { id: "h2", name: "Mountain Climbers", duration: 30, rest: 15, rounds: 4 },
  { id: "h3", name: "Plank Hold",     duration: 45, rest: 15, rounds: 3 },
  { id: "h4", name: "Jumping Jacks",  duration: 40, rest: 10, rounds: 4 },
];

export const adminUsers = [
  { id: "u1", name: "Arjun Rahman",  email: "arjun@fitx.app",  role: "admin", status: "active" },
  { id: "u2", name: "Rakib Chowdhury", email: "rakib@fitx.app", role: "user",  status: "active" },
  { id: "u3", name: "Faria Sultana", email: "faria@fitx.app", role: "user",  status: "active" },
  { id: "u4", name: "Tanvir Hasan",  email: "tanvir@fitx.app", role: "user", status: "active" },
  { id: "u5", name: "Sumi Akter",    email: "sumi@fitx.app",   role: "user", status: "banned" },
];

export const pendingPayments = [
  { id: "p1", user: "Mehzabin Ali",   method: "bKash",  txn: "9KX72ALQ31", amount: 990, plan: "Pro Monthly" },
  { id: "p2", user: "Imran Hossain",  method: "Nagad",  txn: "NG88712214", amount: 2490, plan: "Pro 3 Month" },
  { id: "p3", user: "Tanvir Hasan",   method: "Rocket", txn: "RK55129087", amount: 8990, plan: "Pro Yearly" },
];

export const analytics = {
  totalUsers: 18420,
  activeUsers: 9314,
  workouts: 142890,
  revenue: 14_280_000, // BDT
};

export function bmiInfo(heightCm: number, weightKg: number) {
  if (!heightCm || !weightKg) return { value: 0, status: "—", goal: "—", color: "var(--muted-foreground)" };
  const h = heightCm / 100;
  const v = weightKg / (h * h);
  let status = "Normal", goal = "Maintain & build strength", color = "var(--neon-green)";
  if (v < 18.5) { status = "Underweight"; goal = "Lean bulk + protein focus"; color = "var(--neon-blue)"; }
  else if (v >= 25 && v < 30) { status = "Overweight"; goal = "Cardio + calorie deficit"; color = "var(--neon-amber)"; }
  else if (v >= 30) { status = "Obese"; goal = "Low-impact cardio plan"; color = "var(--neon-red)"; }
  return { value: Math.round(v * 10) / 10, status, goal, color };
}
