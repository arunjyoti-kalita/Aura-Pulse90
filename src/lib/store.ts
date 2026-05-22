// Local storage based data layer for Transform 90

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: number;
  enabled: boolean;
  youtubeUrl?: string;
  instructions?: string;
  supersetWith?: string;
  muscleGroups?: string[]; // for heat map
}

export interface CustomWorkout {
  type: 'A' | 'B' | 'C';
  title: string;
  subtitle: string;
  warmup: string[];
  exercises: Exercise[];
}

export interface MealConfig {
  name: string;
  time: string;
  suggestions: string;
  enabled: boolean;
}

export interface MilestoneConfig {
  week: number;
  day: number;
  title: string;
  description: string;
}

// --- Sleep & Recovery ---
export interface SleepLog {
  date: string;
  bedtime: string;
  wakeTime: string;
  quality: number; // 1-5
  hoursSlept: number;
}

export interface RestDayLog {
  date: string;
  activity: 'Full Rest' | 'Light Walk' | 'Stretching' | 'Yoga' | 'Other';
}

// --- Mental Health ---
export interface StressEntry {
  date: string;
  level: 'Low' | 'Medium' | 'High';
}

export interface BreathingSession {
  date: string;
  type: 'Box' | '4-7-8' | 'Power';
  durationMinutes: number;
}

// --- Body Metrics ---
export interface BodyMeasurement {
  date: string;
  chest: number | null;
  leftArm: number | null;
  rightArm: number | null;
  leftThigh: number | null;
  rightThigh: number | null;
  hips: number | null;
}

// --- Micro Workouts ---
export interface QuickSession {
  date: string;
  type: '5min' | '10min' | '15min' | 'desk' | 'snack';
  xpEarned: number;
  completedAt: string;
}

// --- AI Coaching ---
export interface DifficultyRating {
  date: string;
  workoutType: 'A' | 'B' | 'C';
  rating: 'Too Easy' | 'Just Right' | 'Too Hard';
}

export interface ProgressionSuggestion {
  date: string;
  exerciseName: string;
  suggestion: string;
  applied: boolean;
}

export interface SmartCoachingSuggestion {
  date: string;
  type: 'rest' | 'recovery' | 'overload';
  message: string;
  dismissed: boolean;
}

export interface OutdoorLog {
  id: string;
  date: string;
  distance: number;
  duration: number;
  type: 'walk' | 'run' | 'cycle';
}

// --- Habits ---
export interface HabitStack {
  id: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

export interface HabitCompletion {
  date: string;
  habitId: string;
}

export interface IfThenRule {
  id: string;
  condition: string;
  action: string;
  enabled: boolean;
}

export interface FeatureToggles {
  dailyTips: boolean;
  restDaySuggestion: boolean;
  calorieEstimator: boolean;
  weeklySummary: boolean;
  bodyFatEstimator: boolean;
  workoutIntensity: boolean;
  bestWorstWeek: boolean;
  monthlyReportCard: boolean;
  badges: boolean;
  xpSystem: boolean;
  levelSystem: boolean;
  weeklyChallenge: boolean;
  confetti: boolean;
  beforeAfterPhotos: boolean;
  dualAxisChart: boolean;
  bodySilhouette: boolean;
  mealPhotos: boolean;
  cheatMealTracker: boolean;
  hydrationBottle: boolean;
  audioBeepTimer: boolean;
  exerciseInstructions: boolean;
  supersetMode: boolean;
  personalRecords: boolean;
  dailyQuote: boolean;
  whyIStarted: boolean;
  moodCheckIn: boolean;
  milestoneCelebration: boolean;
  youtubeLinks: boolean;
  builtInBeats: boolean;
  // Sleep & Recovery
  sleepTracking: boolean;
  recoveryScore: boolean;
  restDayQuality: boolean;
  // Mental Health
  stressCheckIn: boolean;
  breathingModule: boolean;
  mindfulnessTracker: boolean;
  wellnessScore: boolean;
  // Body Metrics
  muscleHeatMap: boolean;
  volumeTracker: boolean;
  bodyMeasurements: boolean;
  strengthEstimator: boolean;
  // Micro Workouts
  quickSessions: boolean;
  exerciseSnacks: boolean;
  deskMode: boolean;
  // AI Coaching
  progressiveOverload: boolean;
  adaptiveDifficulty: boolean;
  smartRestDetection: boolean;
  // Habits
  habitStacking: boolean;
  ifThenPlanner: boolean;
  affirmations: boolean;
  goalVisualization: boolean;
  // Nutrition
  macroTracking: boolean;
  calorieBalance: boolean;
  barcodeScanner: boolean;
  // AI Form Check
  aiFormCheck: boolean;
  formCheckAudio: boolean;
  formCheckVoice: boolean;
  formCheckBanners: boolean;
  // AI Coach
  aiCoach: boolean;
  coachSuggestionChips: boolean;
  coachFloatingButton: boolean;
}

export const defaultFeatureToggles: FeatureToggles = {
  dailyTips: true,
  restDaySuggestion: true,
  calorieEstimator: true,
  weeklySummary: true,
  bodyFatEstimator: true,
  workoutIntensity: true,
  bestWorstWeek: true,
  monthlyReportCard: true,
  badges: true,
  xpSystem: true,
  levelSystem: true,
  weeklyChallenge: true,
  confetti: true,
  beforeAfterPhotos: true,
  dualAxisChart: true,
  bodySilhouette: true,
  mealPhotos: false,
  cheatMealTracker: true,
  hydrationBottle: true,
  audioBeepTimer: true,
  exerciseInstructions: true,
  supersetMode: true,
  personalRecords: true,
  dailyQuote: true,
  whyIStarted: true,
  moodCheckIn: true,
  milestoneCelebration: true,
  youtubeLinks: true,
  builtInBeats: true,
  sleepTracking: true,
  recoveryScore: true,
  restDayQuality: true,
  stressCheckIn: true,
  breathingModule: true,
  mindfulnessTracker: true,
  wellnessScore: true,
  muscleHeatMap: true,
  volumeTracker: true,
  bodyMeasurements: true,
  strengthEstimator: true,
  quickSessions: true,
  exerciseSnacks: false,
  deskMode: true,
  progressiveOverload: true,
  adaptiveDifficulty: true,
  smartRestDetection: true,
  habitStacking: true,
  ifThenPlanner: true,
  affirmations: true,
  goalVisualization: true,
  macroTracking: true,
  calorieBalance: true,
  barcodeScanner: false,
  aiFormCheck: true,
  formCheckAudio: true,
  formCheckVoice: true,
  formCheckBanners: true,
  aiCoach: true,
  coachSuggestionChips: true,
  coachFloatingButton: true,
};

export interface MacroLog {
  date: string;
  mealName: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface AppSettings {
  customWorkouts: CustomWorkout[];
  weeklySchedule: ('A' | 'B' | 'C' | 'Rest')[];
  workoutDuration: number;
  timerPresets: number[];
  timerHalfwayBeep: boolean;
  timerEndBeep: boolean;
  meals: MealConfig[];
  dailyWaterGoal: number;
  fastDays: number[];
  startingWeight: number | null;
  targetWeight: number | null;
  startingWaist: number | null;
  targetWaist: number | null;
  dailyStepGoal: number;
  pushupBaseline: number | null;
  pushupTarget: number | null;
  height: number | null;
  workoutReminderTime: string;
  workoutReminderEnabled: boolean;
  waterReminderInterval: number;
  waterReminderEnabled: boolean;
  weighInReminderDay: string;
  weighInReminderTime: string;
  weighInReminderEnabled: boolean;
  milestones: MilestoneConfig[];
  darkMode: boolean;
  accentColor: string;
  featureToggles: FeatureToggles;
  customPlaylists: { name: string; url: string }[];
  strictMode: boolean;
  partialCountsTowardStreak: boolean;
  // Sleep settings
  targetSleepHours: number;
  targetBedtime: string;
  targetWakeTime: string;
  sleepReminderEnabled: boolean;
  sleepReminderTime: string;
  // Wellness
  breathingReminderTime: string;
  breathingReminderEnabled: boolean;
  // Body metrics
  recommendedSets: Record<string, number>;
  // Micro workouts
  snackNotificationTimes: string[];
  snackNotificationsEnabled: boolean;
  // AI Coaching
  smartRestSensitivity: 'Low' | 'Medium' | 'High';
  // Nutrition
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  calorieTarget: number;
  // Habits
  customAffirmations: string[];
  habitStacks: HabitStack[];
  ifThenRules: IfThenRule[];
  goalVisionText: string;
  goalVisionPhoto: string;
  // AI Form Check
  formCheckSensitivity: 'Strict' | 'Normal' | 'Relaxed';
  // AI Coach
  coachName: string;
  // Rest Timer
  restTimeStrength: number;
  restTimeCore: number;
  restTimeCardio: number;
  restTimeGlobalOverride: number | null;
  restTimerAutoStart: boolean;
  restTimerInline: boolean;
  restTimerColorTransition: boolean;
  restTimerReadyBadge: boolean;
}

export interface WorkoutLog {
  date: string;
  type: 'A' | 'B' | 'C';
  completedSets: Record<string, boolean[]>;
  completedAt: string;
  startedAt?: string;
  durationSeconds?: number;
  intensityScore?: number;
  partial?: boolean;
  completionPct?: number;
  difficultyRating?: 'Too Easy' | 'Just Right' | 'Too Hard';
  isSkipped?: boolean;
}

export interface FoodLogEntry {
  id: string;
  foodId: string;
  foodName: string;
  quantity: number;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealName: string;
}

export interface DietLog {
  date: string;
  waterOnWaking: boolean;
  meals: { name: string; status: 'clean' | 'bad' | null }[];
  waterGlasses: number;
  cheatMeal?: boolean;
  mealPhotos?: Record<string, string>;
  calorieEstimate?: number;
  foodEntries?: FoodLogEntry[];
}

export interface ProgressEntry {
  date: string;
  weight: number | null;
  waist: number | null;
  pushups: number | null;
  photoFront?: string;
  photoSide?: string;
}

export interface MoodEntry {
  date: string;
  mood: 'Motivated' | 'Tired' | 'Stressed' | 'Strong' | 'Struggling';
}

export interface PersonalRecord {
  exerciseName: string;
  bestReps: number;
  date: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earned: boolean;
  earnedDate?: string;
}

export interface WeeklySummary {
  weekNumber: number;
  workoutsCompleted: number;
  avgWaterIntake: number;
  waistChange: number | null;
  weightChange: number | null;
  cleanMealPct: number;
  date: string;
}

export interface AppState {
  startDate: string;
  workoutLogs: WorkoutLog[];
  dietLogs: DietLog[];
  progressEntries: ProgressEntry[];
  currentWeight: number | null;
  currentWaist: number | null;
  settings: AppSettings;
  whyIStarted: string;
  moodEntries: MoodEntry[];
  personalRecords: PersonalRecord[];
  badges: Badge[];
  xp: number;
  weeklySummaries: WeeklySummary[];
  lastMilestoneCelebrated: number;
  lastMoodCheckDate: string;
  // New data stores
  sleepLogs: SleepLog[];
  restDayLogs: RestDayLog[];
  stressEntries: StressEntry[];
  breathingSessions: BreathingSession[];
  bodyMeasurements: BodyMeasurement[];
  quickSessions: QuickSession[];
  difficultyRatings: DifficultyRating[];
  progressionSuggestions: ProgressionSuggestion[];
  smartCoachingSuggestions: SmartCoachingSuggestion[];
  macroLogs: MacroLog[];
  habitCompletions: HabitCompletion[];
  lastSleepCheckDate: string;
  lastStressCheckDate: string;
  mindfulnessMinutes: Record<string, number>; // date -> minutes
  outdoorLogs: OutdoorLog[];
  steps: number;
}

const STORAGE_KEY = 'transform90_data';

let idCounter = 0;
export function genId(): string {
  return `${Date.now()}-${++idCounter}`;
}

const defaultMuscleGroups: Record<string, string[]> = {
  'Push-ups': ['chest', 'shoulders', 'triceps'],
  'Wide Push-ups': ['chest', 'shoulders'],
  'Incline Push-ups': ['chest', 'shoulders'],
  'Pike Push-ups': ['shoulders', 'triceps'],
  'Plank Hold': ['core'],
  'Mountain Climbers': ['core', 'cardio'],
  'Tricep Dips (Chair)': ['triceps', 'shoulders'],
  'Bodyweight Squats': ['quads', 'glutes'],
  'Reverse Lunges': ['quads', 'hamstrings', 'glutes'],
  'Jump Squats': ['quads', 'glutes', 'cardio'],
  'Glute Bridges': ['glutes', 'hamstrings'],
  'Bicycle Crunches': ['core'],
  'Leg Raises': ['core'],
  'Plank Shoulder Taps': ['core', 'shoulders'],
  'Burpees': ['chest', 'quads', 'core', 'cardio'],
  'Push-up to Downward Dog': ['chest', 'shoulders', 'core'],
  'Spot Jog High Knees': ['cardio', 'quads'],
};

export const defaultWorkouts: CustomWorkout[] = [
  {
    type: 'A', title: 'Day A', subtitle: 'Upper Body & Core',
    warmup: ['Arm circles — 30 sec', 'Jumping jacks — 1 min', 'Cat-cow stretch — 5 reps'],
    exercises: [
      { id: 'a1', name: 'Push-ups', sets: 3, reps: '10-12', rest: 60, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=push+ups+proper+form+tutorial', instructions: 'Hands slightly wider than shoulders. Keep your core tight and body in a straight line. Lower until chest nearly touches floor.', muscleGroups: ['chest', 'shoulders', 'triceps'] },
      { id: 'a2', name: 'Superman', sets: 3, reps: '12-15', rest: 45, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=superman+exercise+proper+form', instructions: 'Lie face down. Simultaneously lift arms and legs off the floor, squeezing your back and glutes. Hold for 2s.', muscleGroups: ['lower back', 'glutes'] },
      { id: 'a3', name: 'Incline Push-ups', sets: 3, reps: '12', rest: 60, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=incline+push+ups+proper+form', instructions: 'Use a sturdy chair or bed. Easier than regular push-ups, targets the lower chest.', muscleGroups: ['chest', 'shoulders'] },
      { id: 'a4', name: 'Pike Push-ups', sets: 3, reps: '8-10', rest: 60, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=pike+push+ups+proper+form', instructions: 'Hands on floor, hips high (V-shape). Lower your head toward the floor between your hands.', muscleGroups: ['shoulders', 'triceps'] },
      { id: 'a5', name: 'Tricep Dips (Chair)', sets: 3, reps: '10-12', rest: 60, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=tricep+dips+chair+proper+form', instructions: 'Use a stable chair. Keep your back close to the chair as you lower and push up.', muscleGroups: ['triceps', 'shoulders'] },
      { id: 'a6', name: 'Plank Hold', sets: 3, reps: '30-45 sec', rest: 45, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=plank+hold+proper+form', instructions: 'Forearms on floor. Keep your body perfectly straight. Don\'t let your hips sag.', muscleGroups: ['core'] },
      { id: 'a7', name: 'Mountain Climbers', sets: 3, reps: '30 sec', rest: 45, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=mountain+climbers+proper+form', instructions: 'Push-up position. Drive knees to chest rapidly while keeping hips level.', muscleGroups: ['core', 'cardio'] },
    ],
  },
  {
    type: 'B', title: 'Day B', subtitle: 'Lower Body & Abs',
    warmup: ['High knees — 1 min', 'Leg swings — 10 each leg', 'Bodyweight squats — 10 reps'],
    exercises: [
      { id: 'b1', name: 'Bodyweight Squats', sets: 4, reps: '15-20', rest: 60, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=bodyweight+squats+proper+form', instructions: 'Feet shoulder-width apart. Sit back like sitting in a chair. Keep heels on the ground.', muscleGroups: ['quads', 'glutes'] },
      { id: 'b2', name: 'Bulgarian Split Squats', sets: 3, reps: '10 each', rest: 60, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=bulgarian+split+squat+no+weights', instructions: 'Put one foot behind you on a chair/bed. Squat down with the front leg. Amazing for lean legs!', muscleGroups: ['quads', 'glutes'] },
      { id: 'b3', name: 'Reverse Lunges', sets: 3, reps: '12 each', rest: 60, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=reverse+lunges+proper+form', instructions: 'Step back and lower until both knees are at 90 degrees. Stay upright.', muscleGroups: ['quads', 'glutes'] },
      { id: 'b4', name: 'Glute Bridges', sets: 3, reps: '15-20', rest: 45, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=glute+bridge+proper+form', instructions: 'Lie on back, knees bent. Drive through heels to lift hips. Squeeze glutes at top.', muscleGroups: ['glutes', 'hamstrings'] },
      { id: 'b5', name: 'Calf Raises', sets: 3, reps: '20', rest: 30, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=calf+raises+proper+form', instructions: 'Stand on a flat floor or edge of a step. Lift your heels as high as possible.', muscleGroups: ['calves'] },
      { id: 'b6', name: 'Bicycle Crunches', sets: 3, reps: '20', rest: 45, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=bicycle+crunches+proper+form', instructions: 'Opposite elbow to opposite knee. Control the movement, don\'t rush.', muscleGroups: ['core'] },
      { id: 'b7', name: 'Leg Raises', sets: 3, reps: '12', rest: 45, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=leg+raises+proper+form', instructions: 'Lie flat. Lift legs to 90 degrees then slowly lower without touching floor.', muscleGroups: ['core'] },
    ],
  },
  {
    type: 'C', title: 'Day C', subtitle: 'Full Body Burn',
    warmup: ['Jumping jacks — 1 min', 'Inchworms — 5 reps', 'Arm circles — 30 sec'],
    exercises: [
      { id: 'c1', name: 'Burpees', sets: 3, reps: '8-10', rest: 60, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=burpees+proper+form+for+beginners', instructions: 'Squat, jump to plank, push-up (optional), jump back to squat, jump up. High intensity!', muscleGroups: ['full body', 'cardio'] },
      { id: 'c2', name: 'Jump Squats', sets: 3, reps: '12', rest: 60, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=jump+squats+proper+form', instructions: 'Squat then jump up explosively. Land softly on the balls of your feet.', muscleGroups: ['quads', 'glutes', 'cardio'] },
      { id: 'c3', name: 'Push-up to Downward Dog', sets: 3, reps: '10', rest: 45, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=push+up+to+downward+dog+exercise+form', instructions: 'Do a push-up, then push your hips high into a V-shape. Great for mobility and strength.', muscleGroups: ['chest', 'shoulders', 'core'] },
      { id: 'c4', name: 'Shadow Boxing', sets: 3, reps: '1 min', rest: 30, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=beginner+shadow+boxing+workout', instructions: 'Stay light on your feet. Throw straight punches (jabs/crosses) in the air. Keep moving!', muscleGroups: ['cardio', 'shoulders'] },
      { id: 'c5', name: 'Plank Shoulder Taps', sets: 3, reps: '20', rest: 45, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=plank+shoulder+taps+proper+form', instructions: 'High plank position. Tap opposite shoulder without rocking your hips.', muscleGroups: ['core', 'shoulders'] },
      { id: 'c6', name: 'Walking Lunges', sets: 3, reps: '16 total', rest: 45, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=walking+lunges+proper+form', instructions: 'Step forward into a lunge, then immediately step into the next one. Use your hallway.', muscleGroups: ['quads', 'glutes'] },
      { id: 'c7', name: 'Superman Hold', sets: 3, reps: '30 sec', rest: 30, enabled: true, youtubeUrl: 'https://www.youtube.com/results?search_query=superman+hold+exercise+form', instructions: 'Hold the top position of the Superman exercise. Focus on breathing.', muscleGroups: ['lower back', 'glutes'] },
    ],
  },
];

export const defaultMeals: MealConfig[] = [
  { name: 'Breakfast', time: '07:00', suggestions: 'Oats with Peanut Butter & 2 Boiled Eggs (High protein, low cost)', enabled: true },
  { name: 'Lunch', time: '12:00', suggestions: 'Lentils (Dal) / Chickpeas, Brown/White Rice, and a bowl of Curd', enabled: true },
  { name: 'Snack', time: '16:00', suggestions: 'Roasted Chickpeas or Sprouted Moong Dal (Cheap & great for lean muscle)', enabled: true },
  { name: 'Dinner', time: '19:30', suggestions: 'Soya Chunks or Paneer/Chicken with seasonal green vegetables (No oil/low oil)', enabled: true },
];

export const defaultMilestones: MilestoneConfig[] = [
  { week: 2, day: 14, title: 'Week 2 — Habits forming', description: 'Your body is adapting to the new routine. Keep pushing!' },
  { week: 4, day: 28, title: 'Week 4 — Visible changes', description: 'Others start noticing. Clothes fit differently.' },
  { week: 8, day: 56, title: 'Week 8 — Major progress', description: 'Significant strength and endurance gains.' },
  { week: 12, day: 84, title: 'Week 12 — Transformation!', description: 'You made it. Compare Day 1 photos to now.' },
];

export const defaultBadges: Badge[] = [
  { id: 'first_workout', name: 'First Workout', description: 'Complete your first workout', emoji: '🎯', earned: false },
  { id: 'streak_3', name: '3-Day Streak', description: 'Work out 3 days in a row', emoji: '🔥', earned: false },
  { id: 'streak_7', name: '7-Day Streak', description: 'Work out 7 days in a row', emoji: '⚡', earned: false },
  { id: 'streak_30', name: '30-Day Streak', description: 'Work out 30 days in a row', emoji: '💎', earned: false },
  { id: 'first_kilo', name: 'First Kilo Lost', description: 'Lose your first kilogram', emoji: '⚖️', earned: false },
  { id: 'first_cm', name: 'First CM Off Waist', description: 'Lose 1cm off your waist', emoji: '📏', earned: false },
  { id: 'week_4', name: 'Completed Week 4', description: 'Reach the Week 4 milestone', emoji: '🏅', earned: false },
  { id: 'week_8', name: 'Completed Week 8', description: 'Reach the Week 8 milestone', emoji: '🥇', earned: false },
  { id: 'completed_90', name: 'Completed 90 Days', description: 'Finish the full program', emoji: '🏆', earned: false },
  { id: 'pushups_100', name: '100 Push-ups in a Week', description: 'Do 100+ push-ups in a single week', emoji: '💪', earned: false },
  { id: 'perfect_diet', name: 'Perfect Diet Week', description: 'Eat clean every meal for a full week', emoji: '🥗', earned: false },
  { id: 'mindful_7', name: '7-Day Mindfulness', description: '7 consecutive days of mindfulness', emoji: '🧘', earned: false },
  { id: 'mindful_30', name: '30-Day Mindfulness', description: '30 consecutive days of mindfulness', emoji: '🕉️', earned: false },
  { id: 'sleep_master', name: 'Sleep Master', description: '7 days of 7+ hours sleep', emoji: '😴', earned: false },
];

const defaultHabitStacks: HabitStack[] = [
  { id: 'hs1', trigger: 'After morning water', action: 'Do 10 push-ups', enabled: true },
  { id: 'hs2', trigger: 'After lunch', action: 'Take a 10 min walk', enabled: true },
  { id: 'hs3', trigger: 'After waking', action: 'Log sleep quality', enabled: true },
  { id: 'hs4', trigger: 'After workout', action: 'Log meals', enabled: true },
];

const defaultIfThenRules: IfThenRule[] = [
  { id: 'it1', condition: 'If I miss a workout', action: 'Then I will do 20 push-ups before bed', enabled: true },
  { id: 'it2', condition: 'If I eat badly', action: 'Then I will drink 1 extra litre of water', enabled: true },
  { id: 'it3', condition: 'If I feel like skipping', action: 'Then I will do just the warmup and decide after', enabled: true },
];

const defaultAffirmations = [
  'I am someone who works out every day',
  'I am someone who eats to fuel my body',
  'I am someone who prioritizes sleep and recovery',
];

export const defaultSettings: AppSettings = {
  customWorkouts: defaultWorkouts,
  weeklySchedule: ['A', 'B', 'C', 'A', 'B', 'Rest', 'Rest'],
  workoutDuration: 45,
  timerPresets: [30, 60, 120],
  timerHalfwayBeep: true,
  timerEndBeep: true,
  meals: defaultMeals,
  dailyWaterGoal: 10,
  fastDays: [],
  startingWeight: null,
  targetWeight: null,
  startingWaist: null,
  targetWaist: null,
  dailyStepGoal: 8000,
  pushupBaseline: null,
  pushupTarget: null,
  height: null,
  workoutReminderTime: '07:00',
  workoutReminderEnabled: false,
  waterReminderInterval: 60,
  waterReminderEnabled: false,
  weighInReminderDay: 'Monday',
  weighInReminderTime: '08:00',
  weighInReminderEnabled: false,
  milestones: defaultMilestones,
  darkMode: true,
  accentColor: 'green',
  featureToggles: defaultFeatureToggles,
  customPlaylists: [],
  strictMode: false,
  partialCountsTowardStreak: true,
  targetSleepHours: 8,
  targetBedtime: '22:00',
  targetWakeTime: '06:00',
  sleepReminderEnabled: false,
  sleepReminderTime: '07:00',
  breathingReminderTime: '08:00',
  breathingReminderEnabled: false,
  recommendedSets: { chest: 12, core: 12, quads: 12, hamstrings: 10, glutes: 10, shoulders: 9, triceps: 9 },
  snackNotificationTimes: ['10:00', '14:00', '18:00'],
  snackNotificationsEnabled: false,
  smartRestSensitivity: 'Medium',
  proteinTarget: 120,
  carbTarget: 200,
  fatTarget: 60,
  calorieTarget: 2000,
  customAffirmations: defaultAffirmations,
  habitStacks: defaultHabitStacks,
  ifThenRules: defaultIfThenRules,
  goalVisionText: '',
  goalVisionPhoto: '',
  formCheckSensitivity: 'Normal',
  coachName: 'Coach Max',
  restTimeStrength: 60,
  restTimeCore: 45,
  restTimeCardio: 30,
  restTimeGlobalOverride: null,
  restTimerAutoStart: true,
  restTimerInline: true,
  restTimerColorTransition: true,
  restTimerReadyBadge: true,
};

const defaultState: AppState = {
  startDate: getToday(),
  workoutLogs: [],
  dietLogs: [],
  progressEntries: [],
  currentWeight: null,
  currentWaist: null,
  settings: defaultSettings,
  whyIStarted: '',
  moodEntries: [],
  personalRecords: [],
  badges: defaultBadges,
  xp: 0,
  weeklySummaries: [],
  lastMilestoneCelebrated: 0,
  lastMoodCheckDate: '',
  sleepLogs: [],
  restDayLogs: [],
  stressEntries: [],
  breathingSessions: [],
  bodyMeasurements: [],
  quickSessions: [],
  difficultyRatings: [],
  progressionSuggestions: [],
  smartCoachingSuggestions: [],
  macroLogs: [],
  habitCompletions: [],
  lastSleepCheckDate: '',
  lastStressCheckDate: '',
  mindfulnessMinutes: {},
  outdoorLogs: [],
  steps: 0,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultState,
        ...parsed,
        settings: {
          ...defaultSettings,
          ...(parsed.settings || {}),
          featureToggles: { ...defaultFeatureToggles, ...(parsed.settings?.featureToggles || {}) },
          habitStacks: parsed.settings?.habitStacks || defaultHabitStacks,
          ifThenRules: parsed.settings?.ifThenRules || defaultIfThenRules,
          customAffirmations: parsed.settings?.customAffirmations || defaultAffirmations,
          recommendedSets: { ...defaultSettings.recommendedSets, ...(parsed.settings?.recommendedSets || {}) },
        },
        badges: parsed.badges?.length ? parsed.badges.map((b: Badge, i: number) => ({
          ...(defaultBadges[i] || b),
          ...b,
        })) : defaultBadges,
        workoutLogs: parsed.workoutLogs || [],
        dietLogs: parsed.dietLogs || [],
        progressEntries: parsed.progressEntries || [],
        sleepLogs: parsed.sleepLogs || [],
        restDayLogs: parsed.restDayLogs || [],
        stressEntries: parsed.stressEntries || [],
        breathingSessions: parsed.breathingSessions || [],
        bodyMeasurements: parsed.bodyMeasurements || [],
        quickSessions: parsed.quickSessions || [],
        difficultyRatings: parsed.difficultyRatings || [],
        progressionSuggestions: parsed.progressionSuggestions || [],
        smartCoachingSuggestions: parsed.smartCoachingSuggestions || [],
        macroLogs: parsed.macroLogs || [],
        habitCompletions: parsed.habitCompletions || [],
        mindfulnessMinutes: parsed.mindfulnessMinutes || {},
        outdoorLogs: parsed.outdoorLogs || [],
        steps: parsed.steps || 0,
      };
    }
  } catch {}
  return { ...defaultState };
}

import { useState, useEffect } from "react";

export function useSyncState() {
  const [state, setState] = useState(() => loadState());

  useEffect(() => {
    const handler = () => {
      setState(loadState());
    };
    window.addEventListener("transform90:state-changed", handler);
    return () => window.removeEventListener("transform90:state-changed", handler);
  }, []);

  return [state, setState] as const;
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("transform90:state-changed"));
  }
}

export function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getToday(): string {
  return formatDate(new Date());
}

export function parseSafe(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function autoCheckHabits(s: AppState) {
  const today = getToday();
  if (!s.settings) s.settings = {} as any;
  if (!s.settings.habitStacks) s.settings.habitStacks = [];
  if (!s.habitCompletions) s.habitCompletions = [];

  // 1. Log Sleep Quality habit auto-check
  const hasSleepLog = s.sleepLogs && s.sleepLogs.some(l => l.date === today);
  if (hasSleepLog) {
    const sleepHabit = s.settings.habitStacks.find(h => 
      h.enabled && 
      (h.id === 'hs3' || h.action.toLowerCase().includes('sleep') || h.action.toLowerCase().includes('waking'))
    );
    if (sleepHabit) {
      const alreadyDone = s.habitCompletions.some(c => c.date === today && c.habitId === sleepHabit.id);
      if (!alreadyDone) {
        s.habitCompletions.push({ date: today, habitId: sleepHabit.id });
        if (s.settings.featureToggles?.xpSystem) {
          s.xp = (s.xp || 0) + 5;
        }
      }
    }
  }

  // 2. Log Meals habit auto-check
  const todayDietLog = s.dietLogs && s.dietLogs.find(d => d.date === today);
  const hasMealLog = todayDietLog && (
    (todayDietLog.meals && todayDietLog.meals.some(m => m.status !== null)) ||
    (todayDietLog.foodEntries && todayDietLog.foodEntries.length > 0)
  );
  if (hasMealLog) {
    const mealHabit = s.settings.habitStacks.find(h => 
      h.enabled && 
      (h.id === 'hs4' || h.action.toLowerCase().includes('meal') || h.action.toLowerCase().includes('food') || h.action.toLowerCase().includes('eat'))
    );
    if (mealHabit) {
      const alreadyDone = s.habitCompletions.some(c => c.date === today && c.habitId === mealHabit.id);
      if (!alreadyDone) {
        s.habitCompletions.push({ date: today, habitId: mealHabit.id });
        if (s.settings.featureToggles?.xpSystem) {
          s.xp = (s.xp || 0) + 5;
        }
      }
    }
  }

  // 3. Breathe habit auto-check (at least 3 minutes)
  const hasBreathing3Min = s.breathingSessions && s.breathingSessions.some(b => b.date === today && b.durationMinutes >= 3);
  if (hasBreathing3Min) {
    const breathingHabit = s.settings.habitStacks.find(h => 
      h.enabled && 
      (h.action.toLowerCase().includes('breathe') || h.action.toLowerCase().includes('meditat') || h.action.toLowerCase().includes('mindful'))
    );
    if (breathingHabit) {
      const alreadyDone = s.habitCompletions.some(c => c.date === today && c.habitId === breathingHabit.id);
      if (!alreadyDone) {
        s.habitCompletions.push({ date: today, habitId: breathingHabit.id });
        if (s.settings.featureToggles?.xpSystem) {
          s.xp = (s.xp || 0) + 5;
        }
      }
    }
  }
}

export function patchState(updater: (s: AppState) => void) {
  const s = loadState();
  updater(s);
  autoCheckHabits(s);
  saveState(s);
}

export function calculateSkippedDays(startDate: string, workoutLogs: WorkoutLog[], schedule?: string[]): number {
  const sched = schedule || ['A', 'B', 'C', 'A', 'B', 'Rest', 'Rest'];
  const start = parseSafe(startDate);
  const today = parseSafe(getToday());

  const daysDiff = Math.floor((today.getTime() - start.getTime()) / 86400000);

  let skipped = 0;
  for (let i = 0; i < daysDiff; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = formatDate(d);

    // A day is a workout day if the schedule says so at that point in the program
    const effectiveDayNumber = (i + 1) - skipped;
    const dayInWeek = (effectiveDayNumber - 1) % 7;
    
    if (sched[dayInWeek] !== 'Rest') {
      const log = workoutLogs.find(l => l.date === dateStr);
      if (!log || log.isSkipped) {
        skipped++;
      }
    }
  }
  return skipped;
}

export function getWorkoutTypeForDay(state: AppState, calendarDayNum: number): 'A' | 'B' | 'C' | 'Rest' {
  const sched = state.settings.weeklySchedule;
  const start = parseSafe(state.startDate);
  
  // 1. Determine if this calendar day is a Rest day
  let skippedBefore = 0;
  for (let i = 0; i < calendarDayNum - 1; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const eff = (i + 1) - skippedBefore;
    if (sched[(eff - 1) % 7] === 'Rest') continue;
    const log = state.workoutLogs.find(l => l.date === ds);
    if (!log || log.isSkipped) skippedBefore++;
  }
  
  const effectiveDayNum = calendarDayNum - skippedBefore;
  if (sched[(effectiveDayNum - 1) % 7] === 'Rest') return 'Rest';
  
  // 2. Suggest type based on last completion OR count
  const targetDate = new Date(start);
  targetDate.setDate(targetDate.getDate() + calendarDayNum - 1);
  const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
  
  const pastLogs = state.workoutLogs
    .filter(l => l.date < targetDateStr && !l.isSkipped)
    .sort((a, b) => b.date.localeCompare(a.date)); // Newest first
    
  const lastLog = pastLogs[0];
  return getWorkoutTypeByOrder(pastLogs.length, sched, lastLog?.type);
}

export function getWorkoutTypeByOrder(completedCount: number, schedule: string[], lastLogType?: string): 'A' | 'B' | 'C' {
  const activeTypes = Array.from(new Set(schedule.filter(t => t !== 'Rest'))).sort() as ('A' | 'B' | 'C')[];
  if (activeTypes.length === 0) return 'A';
  
  // Adaptive suggestion: If we know what you did last, give you the next one
  if (lastLogType && activeTypes.includes(lastLogType as any)) {
    const lastIndex = activeTypes.indexOf(lastLogType as any);
    return activeTypes[(lastIndex + 1) % activeTypes.length];
  }
  
  // Fallback to completion count logic
  return activeTypes[completedCount % activeTypes.length];
}

export function getDayNumber(startDate: string, skippedDays: number = 0): number {
  const start = new Date(startDate);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / 86400000) + 1 - skippedDays;
}

export function getWeekNumber(startDate: string, skippedDays: number = 0): number {
  return Math.min(12, Math.ceil(getDayNumber(startDate, skippedDays) / 7));
}

export function getTodayWorkoutType(state: AppState): 'A' | 'B' | 'C' | 'Rest' {
  const sched = state.settings.weeklySchedule;
  const skipped = calculateSkippedDays(state.startDate, state.workoutLogs, sched);
  const calendarDayNum = Math.floor((new Date().getTime() - new Date(state.startDate).getTime()) / 86400000) + 1;
  return getWorkoutTypeForDay(state, calendarDayNum);
}

export function getStreak(workoutLogs: WorkoutLog[]): number {
  if (!workoutLogs.length) return 0;
  const sorted = [...workoutLogs].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = formatDate(d);
    if (sorted.find(l => l.date === ds)) { streak++; }
    else break;
  }
  return streak;
}

export function getConsecutiveWorkoutDays(workoutLogs: WorkoutLog[]): number {
  if (!workoutLogs.length) return 0;
  let count = 0;
  const today = new Date();
  for (let i = 0; i < 10; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = formatDate(d);
    if (workoutLogs.find(l => l.date === ds)) count++;
    else break;
  }
  return count;
}

export function getWeekWorkoutCount(startDate: string, workoutLogs: WorkoutLog[]): number {
  const week = getWeekNumber(startDate);
  const weekStart = new Date(startDate);
  weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return workoutLogs.filter(l => {
    const d = new Date(l.date);
    return d >= weekStart && d < weekEnd;
  }).length;
}

export function getDietLog(dietLogs: DietLog[], date: string, meals?: MealConfig[]): DietLog {
  const existing = dietLogs.find(d => d.date === date);
  if (existing) return existing;
  const mealNames = meals?.filter(m => m.enabled) || defaultMeals;
  return {
    date,
    waterOnWaking: false,
    meals: mealNames.map(m => ({ name: m.name, status: null })),
    waterGlasses: 0,
  };
}

export function getWeeklyDietScore(dietLogs: DietLog[], startDate: string): number {
  const week = getWeekNumber(startDate);
  const weekStart = new Date(startDate);
  weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekLogs = dietLogs.filter(d => {
    const date = new Date(d.date);
    return date >= weekStart && date < weekEnd;
  });
  if (!weekLogs.length) return 0;
  let clean = 0, total = 0;
  weekLogs.forEach(d => {
    d.meals.forEach(m => {
      if (m.status) { total++; if (m.status === 'clean') clean++; }
    });
  });
  return total ? Math.round((clean / total) * 100) : 0;
}

export function exportDataAsCSV(state: AppState): string {
  let csv = 'Type,Date,Details\n';
  state.workoutLogs.forEach(w => {
    csv += `Workout,${w.date},"Type ${w.type} completed at ${w.completedAt}"\n`;
  });
  state.dietLogs.forEach(d => {
    const meals = d.meals.map(m => `${m.name}:${m.status || 'none'}`).join('; ');
    csv += `Diet,${d.date},"Water:${d.waterGlasses} WaterOnWaking:${d.waterOnWaking} ${meals}"\n`;
  });
  state.progressEntries.forEach(p => {
    csv += `Progress,${p.date},"Weight:${p.weight || '-'} Waist:${p.waist || '-'} Pushups:${p.pushups || '-'}"\n`;
  });
  state.moodEntries.forEach(m => {
    csv += `Mood,${m.date},"${m.mood}"\n`;
  });
  state.sleepLogs.forEach(s => {
    csv += `Sleep,${s.date},"Hours:${s.hoursSlept} Quality:${s.quality}/5"\n`;
  });
  state.breathingSessions.forEach(b => {
    csv += `Breathing,${b.date},"${b.type} ${b.durationMinutes}min"\n`;
  });
  return csv;
}

// --- Smart Features Helpers ---

export function calculateBodyFat(weight: number, waist: number, height: number, isMale = true): number {
  if (isMale) {
    return Math.max(0, Math.round((86.010 * Math.log10(waist) - 70.041 * Math.log10(height) + 36.76) * 10) / 10);
  }
  return Math.max(0, Math.round((86.010 * Math.log10(waist) - 70.041 * Math.log10(height) + 36.76) * 10) / 10);
}

export function calculateWorkoutIntensity(workout: WorkoutLog, exercises: Exercise[]): number {
  let score = 0;
  const sets = workout.completedSets;
  for (const exName in sets) {
    const completed = sets[exName].filter(Boolean).length;
    const ex = exercises.find(e => e.name === exName);
    score += completed * 10;
    if (ex && ex.rest <= 45) score += completed * 3;
    if (ex && ex.rest <= 30) score += completed * 2;
  }
  return score;
}

export function getWeeklyChallenge(week: number): { title: string; description: string } {
  const challenges: Record<number, { title: string; description: string }> = {
    1: { title: 'Kickstart', description: 'Complete all 5 workouts this week' },
    2: { title: 'Hydration Hero', description: 'Hit your water goal every day' },
    3: { title: 'Push-up Power', description: 'Do 100 push-ups total this week' },
    4: { title: 'Clean Eating', description: 'Log clean meals at least 80% of the time' },
    5: { title: 'No Excuses', description: 'Don\'t miss a single workout day' },
    6: { title: 'Step Master', description: 'Hit your step goal every day this week' },
    7: { title: 'Intensity Up', description: 'Try shorter rest times (45s) for all exercises' },
    8: { title: 'Endurance Test', description: 'Add 2 extra reps to every exercise' },
    9: { title: 'Diet Champion', description: '100% clean meals all week' },
    10: { title: 'Consistency King', description: 'Complete every workout + log every meal' },
    11: { title: 'Final Push', description: 'Beat your best workout intensity score' },
    12: { title: 'Grand Finale', description: 'Complete all 5 workouts and take progress photos' },
  };
  return challenges[week] || challenges[1];
}

export const calorieDatabase: Record<string, number> = {
  'Rice (1 cup)': 206,
  'Roti (1 piece)': 120,
  'Eggs (1)': 78,
  'Dal (1 cup)': 198,
  'Fish (100g)': 136,
  'Chicken (100g)': 165,
  'Vegetables (1 cup)': 50,
  'Fruits (1 cup)': 65,
  'Oats (1 cup)': 150,
  'Yogurt (1 cup)': 100,
  'Nuts (handful)': 170,
  'Milk (1 glass)': 120,
  'Bread (1 slice)': 80,
  'Cheese (30g)': 110,
  'Paneer (100g)': 260,
  'Salad (1 bowl)': 35,
};

export function getMonthlyGrade(state: AppState): { grade: string; score: number } {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const schedule = state.settings.weeklySchedule;
  let expectedWorkouts = 0;
  let actualWorkouts = 0;
  for (let i = 0; i < daysInMonth; i++) {
    const d = new Date(monthStart);
    d.setDate(d.getDate() + i);
    const ds = formatDate(d);
    const dayInWeek = i % 7;
    if (schedule[dayInWeek] !== 'Rest') {
      expectedWorkouts++;
      if (state.workoutLogs.find(l => l.date === ds)) actualWorkouts++;
    }
  }
  const workoutScore = expectedWorkouts ? (actualWorkouts / expectedWorkouts) * 40 : 0;
  const monthLogs = state.dietLogs.filter(d => {
    const date = parseSafe(d.date);
    return date >= monthStart && date <= monthEnd;
  });
  let clean = 0, total = 0;
  monthLogs.forEach(d => {
    d.meals.forEach(m => {
      if (m.status) { total++; if (m.status === 'clean') clean++; }
    });
  });
  const dietScore = total ? (clean / total) * 30 : 0;
  const avgWater = monthLogs.length ? monthLogs.reduce((s, d) => s + d.waterGlasses, 0) / monthLogs.length : 0;
  const waterScore = Math.min(20, (avgWater / state.settings.dailyWaterGoal) * 20);
  const streak = getStreak(state.workoutLogs);
  const streakScore = Math.min(10, streak);
  const totalScore = Math.round(workoutScore + dietScore + waterScore + streakScore);
  let grade = 'F';
  if (totalScore >= 90) grade = 'A';
  else if (totalScore >= 80) grade = 'B';
  else if (totalScore >= 70) grade = 'C';
  else if (totalScore >= 60) grade = 'D';
  return { grade, score: totalScore };
}

export function generateWeeklySummary(state: AppState, weekNum: number): WeeklySummary {
  const weekStart = parseSafe(state.startDate);
  weekStart.setDate(weekStart.getDate() + (weekNum - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const workouts = state.workoutLogs.filter(l => {
    const d = parseSafe(l.date);
    return d >= weekStart && d < weekEnd;
  }).length;
  const dietLogs = state.dietLogs.filter(d => {
    const date = parseSafe(d.date);
    return date >= weekStart && date < weekEnd;
  });
  const avgWater = dietLogs.length ? Math.round(dietLogs.reduce((s, d) => s + d.waterGlasses, 0) / dietLogs.length * 10) / 10 : 0;
  let clean2 = 0, total2 = 0;
  dietLogs.forEach(d => {
    d.meals.forEach(m => {
      if (m.status) { total2++; if (m.status === 'clean') clean2++; }
    });
  });
  const cleanPct = total2 ? Math.round((clean2 / total2) * 100) : 0;
  const weekEntries = state.progressEntries.filter(p => {
    const d = parseSafe(p.date);
    return d >= weekStart && d < weekEnd;
  });
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevEntries = state.progressEntries.filter(p => {
    const d = parseSafe(p.date);
    return d >= prevWeekStart && d < weekStart;
  });
  const lastWeight = weekEntries.filter(e => e.weight).pop()?.weight;
  const prevWeight = prevEntries.filter(e => e.weight).pop()?.weight;
  const lastWaist = weekEntries.filter(e => e.waist).pop()?.waist;
  const prevWaist = prevEntries.filter(e => e.waist).pop()?.waist;
  return {
    weekNumber: weekNum,
    workoutsCompleted: workouts,
    avgWaterIntake: avgWater,
    waistChange: lastWaist && prevWaist ? Math.round((lastWaist - prevWaist) * 10) / 10 : null,
    weightChange: lastWeight && prevWeight ? Math.round((lastWeight - prevWeight) * 10) / 10 : null,
    cleanMealPct: cleanPct,
    date: getToday(),
  };
}

// XP System
export function addXP(state: AppState, amount: number): AppState {
  return { ...state, xp: state.xp + amount };
}

export function getLevel(xp: number): { name: string; level: number } {
  if (xp >= 3000) return { name: 'Elite', level: 4 };
  if (xp >= 1500) return { name: 'Athlete', level: 3 };
  if (xp >= 500) return { name: 'Intermediate', level: 2 };
  return { name: 'Beginner', level: 1 };
}

export function checkAndAwardBadges(state: AppState): { state: AppState; newBadges: string[] } {
  const newBadges: string[] = [];
  const badges = [...state.badges];
  const streak = getStreak(state.workoutLogs);
  
  const award = (id: string) => {
    const b = badges.find(b => b.id === id);
    if (b && !b.earned) {
      b.earned = true;
      b.earnedDate = getToday();
      newBadges.push(b.name);
    }
  };

  if (state.workoutLogs.length >= 1) award('first_workout');
  if (streak >= 3) award('streak_3');
  if (streak >= 7) award('streak_7');
  if (streak >= 30) award('streak_30');

  const sw = state.settings.startingWeight;
  if (sw && state.currentWeight && sw - state.currentWeight >= 1) award('first_kilo');
  const swa = state.settings.startingWaist;
  if (swa && state.currentWaist && swa - state.currentWaist >= 1) award('first_cm');

  const dayNum = getDayNumber(state.startDate);
  if (dayNum >= 28) award('week_4');
  if (dayNum >= 56) award('week_8');
  if (dayNum >= 90) award('completed_90');

  const weekScore = getWeeklyDietScore(state.dietLogs, state.startDate);
  if (weekScore === 100) award('perfect_diet');

  // Mindfulness badges
  const mindfulnessStreak = getMindfulnessStreak(state);
  if (mindfulnessStreak >= 7) award('mindful_7');
  if (mindfulnessStreak >= 30) award('mindful_30');

  // Sleep badge
  const sleepStreak = getSleepStreak(state.sleepLogs);
  if (sleepStreak >= 7) award('sleep_master');

  return { state: { ...state, badges }, newBadges };
}

// --- Recovery Score ---
export function calculateRecoveryScore(state: AppState, date: string): { score: number; sleep: number; rest: number; mood: number } {
  const sleepLog = state.sleepLogs.find(s => s.date === date);
  const sleepScore = sleepLog ? Math.min(10, (sleepLog.hoursSlept / 8) * 10 * 0.4 + (sleepLog.quality / 5) * 10 * 0.3) : 5;
  
  // Rest days factor - days since last workout
  const sortedLogs = [...state.workoutLogs].sort((a, b) => b.date.localeCompare(a.date));
  const lastWorkout = sortedLogs[0];
  let daysSinceWorkout = 1;
  if (lastWorkout) {
    daysSinceWorkout = Math.max(1, Math.floor((parseSafe(date).getTime() - parseSafe(lastWorkout.date).getTime()) / 86400000));
  }
  const restScore = Math.min(10, daysSinceWorkout * 2.5) * 0.3;

  // Rest day activity bonus
  const restDayLog = state.restDayLogs.find(r => {
    const prevDate = parseSafe(date);
    prevDate.setDate(prevDate.getDate() - 1);
    return r.date === formatDate(prevDate);
  });
  const restBonus = restDayLog ? (restDayLog.activity === 'Stretching' || restDayLog.activity === 'Yoga' ? 1 : restDayLog.activity === 'Light Walk' ? 0.5 : 0) : 0;
  
  // Mood factor
  const moodEntry = state.moodEntries.find(m => m.date === date);
  const moodScores: Record<string, number> = { Motivated: 9, Strong: 8, Tired: 4, Stressed: 3, Struggling: 2 };
  const moodScore = (moodEntry ? moodScores[moodEntry.mood] : 6) * 0.3;
  
  const total = Math.min(10, Math.round((sleepScore + restScore + moodScore + restBonus) * 10) / 10);
  return { score: total, sleep: sleepScore, rest: restScore * (10/3), mood: moodScore * (10/3) };
}

// --- Wellness Score ---
export function calculateWellnessScore(state: AppState, date: string): number {
  const moodEntry = state.moodEntries.find(m => m.date === date);
  const moodScores: Record<string, number> = { Motivated: 9, Strong: 8, Tired: 5, Stressed: 3, Struggling: 2 };
  const moodVal = moodEntry ? moodScores[moodEntry.mood] : 5;
  
  const stressEntry = state.stressEntries.find(s => s.date === date);
  const stressVal = stressEntry ? (stressEntry.level === 'Low' ? 9 : stressEntry.level === 'Medium' ? 5 : 2) : 5;
  
  const sleepLog = state.sleepLogs.find(s => s.date === date);
  const sleepVal = sleepLog ? (sleepLog.quality / 5) * 10 : 5;
  
  return Math.round(((moodVal + stressVal + sleepVal) / 3) * 10) / 10;
}

// --- Sleep helpers ---
export function calculateSleepHours(bedtime: string, wakeTime: string): number {
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  let hours = wh - bh + (wm - bm) / 60;
  if (hours < 0) hours += 24;
  return Math.round(hours * 10) / 10;
}

export function getSleepStreak(sleepLogs: SleepLog[]): number {
  if (!sleepLogs.length) return 0;
  const sorted = [...sleepLogs].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = formatDate(d);
    const log = sorted.find(l => l.date === ds);
    if (log && log.hoursSlept >= 7) streak++;
    else break;
  }
  return streak;
}

export function getMindfulnessStreak(state: AppState): number {
  let streak = 0;
  const today = new Date();
  
  const dsToday = formatDate(today);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dsYesterday = formatDate(yesterday);

  const doneToday = (state.breathingSessions && state.breathingSessions.some(b => b.date === dsToday && b.durationMinutes >= 3)) || (state.mindfulnessMinutes && (state.mindfulnessMinutes[dsToday] || 0) >= 3);
  const doneYesterday = (state.breathingSessions && state.breathingSessions.some(b => b.date === dsYesterday && b.durationMinutes >= 3)) || (state.mindfulnessMinutes && (state.mindfulnessMinutes[dsYesterday] || 0) >= 3);

  if (!doneToday && !doneYesterday) {
    return 0; // Streak broken
  }

  const startOffset = doneToday ? 0 : 1;

  for (let i = startOffset; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = formatDate(d);
    const hasBreathing = state.breathingSessions && state.breathingSessions.some(b => b.date === ds && b.durationMinutes >= 3);
    const hasMinutes = state.mindfulnessMinutes && (state.mindfulnessMinutes[ds] || 0) >= 3;
    if (hasBreathing || hasMinutes) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// --- Muscle volume helpers ---
export function getWeeklyMuscleVolume(state: AppState): Record<string, number> {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
  weekStart.setHours(0, 0, 0, 0);
  
  const volume: Record<string, number> = {};
  const weekLogs = state.workoutLogs.filter(l => new Date(l.date) >= weekStart);
  
  weekLogs.forEach(log => {
    const workout = state.settings.customWorkouts.find(w => w.type === log.type);
    if (!workout) return;
    workout.exercises.forEach(ex => {
      if (!ex.enabled) return;
      const completedCount = (log.completedSets[ex.name] || []).filter(Boolean).length;
      const muscles = ex.muscleGroups || defaultMuscleGroups[ex.name] || [];
      muscles.forEach(m => {
        volume[m] = (volume[m] || 0) + completedCount;
      });
    });
  });
  return volume;
}

// --- 1RM Estimator ---
export function estimateStrengthScore(maxReps: number): { score: number; level: string } {
  const score = Math.round(maxReps * (1 + maxReps / 30));
  let level = 'Beginner';
  if (score >= 60) level = 'Elite';
  else if (score >= 40) level = 'Advanced';
  else if (score >= 25) level = 'Intermediate';
  return { score, level };
}

// --- Quick session exercises ---
export const deskExercises: Exercise[] = [
  { id: 'desk1', name: 'Wall Push-ups', sets: 2, reps: '15', rest: 20, enabled: true, muscleGroups: ['chest', 'shoulders'] },
  { id: 'desk2', name: 'Standing Calf Raises', sets: 2, reps: '20', rest: 20, enabled: true, muscleGroups: ['calves'] },
  { id: 'desk3', name: 'Seated Leg Raises', sets: 2, reps: '15', rest: 20, enabled: true, muscleGroups: ['core'] },
  { id: 'desk4', name: 'Chair Squats', sets: 2, reps: '12', rest: 20, enabled: true, muscleGroups: ['quads', 'glutes'] },
  { id: 'desk5', name: 'Desk Tricep Dips', sets: 2, reps: '10', rest: 20, enabled: true, muscleGroups: ['triceps'] },
  { id: 'desk6', name: 'Shoulder Rolls', sets: 1, reps: '20', rest: 10, enabled: true, muscleGroups: ['shoulders'] },
  { id: 'desk7', name: 'Neck Stretches', sets: 1, reps: '30 sec each', rest: 10, enabled: true, muscleGroups: ['neck'] },
];

export const exerciseSnacks = [
  '15 Squats',
  '10 Push-ups',
  '30 sec Plank',
  '20 Jumping Jacks',
  '10 Lunges each leg',
  '20 High Knees',
];

// --- Progressive overload ---
export function getProgressionSuggestions(state: AppState, workoutType: 'A' | 'B' | 'C'): { exerciseName: string; suggestion: string }[] {
  const suggestions: { exerciseName: string; suggestion: string }[] = [];
  const todayLogs = state.workoutLogs.filter(l => l.type === workoutType).sort((a, b) => b.date.localeCompare(a.date));
  if (todayLogs.length < 2) return suggestions;
  
  const latest = todayLogs[0];
  const previous = todayLogs[1];
  const workout = state.settings.customWorkouts.find(w => w.type === workoutType);
  if (!workout) return suggestions;
  
  workout.exercises.forEach(ex => {
    if (!ex.enabled) return;
    const latestSets = (latest.completedSets[ex.name] || []).filter(Boolean).length;
    const prevSets = (previous.completedSets[ex.name] || []).filter(Boolean).length;
    if (latestSets >= prevSets && latestSets >= ex.sets) {
      suggestions.push({
        exerciseName: ex.name,
        suggestion: `Try +1 rep per set or +1 set next time`,
      });
    }
  });
  return suggestions;
}

// --- Adaptive difficulty ---
export function getWorkoutDifficulty(state: AppState, workoutType: 'A' | 'B' | 'C'): string {
  const ratings = state.difficultyRatings.filter(r => r.workoutType === workoutType).sort((a, b) => b.date.localeCompare(a.date));
  if (ratings.length < 2) return 'Standard';
  const last2 = ratings.slice(0, 2);
  if (last2.every(r => r.rating === 'Too Easy')) return 'Advanced';
  if (last2.every(r => r.rating === 'Too Hard')) return 'Beginner';
  if (ratings.length >= 4 && ratings.slice(0, 4).every(r => r.rating === 'Too Easy')) return 'Beast';
  return 'Standard';
}
