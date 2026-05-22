import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Download, Upload, AlertTriangle, ChevronDown, ChevronUp, Save, CloudDownload, Info, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  loadState, saveState, patchState, useSyncState, defaultSettings, genId, exportDataAsCSV, getToday,
  type AppSettings, type CustomWorkout, type Exercise, type MealConfig, type MilestoneConfig, type FeatureToggles,
} from "@/lib/store";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  clearAllAppData,
  downloadBackup,
  ensureWeeklyRestorePoint,
  formatBackupSize,
  getBackupMeta,
  getQuickRestorePoints,
  loadQuickRestorePointBackup,
  saveBackupMeta,
  validateBackup,
  verifyStoredDataIntegrity,
  restoreFromBackup,
  type BackupPreview,
  type QuickRestorePoint,
} from "@/lib/backup";

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card-premium overflow-hidden border border-white/5 bg-white/[0.02]">
      <button onClick={() => setOpen(!open)} className="w-full p-3 flex items-center justify-between text-left group hover:bg-white/5 transition-colors">
        <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">{title}</span>
        <div className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-3 h-3 text-white/20" />
        </div>
      </button>
      {open && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] text-white/40 font-black uppercase tracking-widest truncate">{label}</span>
      <div className="flex-1 max-w-[140px]">{children}</div>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03
    }
  }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export default function SettingsPage() {
  const [state, setState] = useSyncState();
  const settings = state.settings;
  const navigate = useNavigate();
  const [backupMeta, setBackupMeta] = useState(() => getBackupMeta());
  const [quickRestorePoints, setQuickRestorePoints] = useState<QuickRestorePoint[]>(() => getQuickRestorePoints());
  const dataBackupRef = useRef<HTMLDivElement>(null);

  const refreshBackupState = useCallback(() => {
    setBackupMeta(getBackupMeta());
    setQuickRestorePoints(getQuickRestorePoints());
  }, []);

  useEffect(() => {
    void ensureWeeklyRestorePoint().finally(refreshBackupState);

    if (window.location.hash === '#data-backup') {
      requestAnimationFrame(() => {
        dataBackupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [refreshBackupState]);

  const update = useCallback((patch: Partial<AppSettings>) => {
    patchState(s => {
      s.settings = { ...s.settings, ...patch };
    });
  }, []);

  const updateStartDate = useCallback((date: string) => {
    patchState(s => {
      s.startDate = date;
    });
  }, []);

  const updateWorkout = useCallback((type: 'A' | 'B' | 'C', patch: Partial<CustomWorkout>) => {
    update({
      customWorkouts: settings.customWorkouts.map(w =>
        w.type === type ? { ...w, ...patch } : w
      ),
    });
  }, [settings.customWorkouts, update]);

  const updateExercise = useCallback((workoutType: 'A' | 'B' | 'C', exId: string, patch: Partial<Exercise>) => {
    update({
      customWorkouts: settings.customWorkouts.map(w =>
        w.type === workoutType ? {
          ...w,
          exercises: w.exercises.map(ex => ex.id === exId ? { ...ex, ...patch } : ex),
        } : w
      ),
    });
  }, [settings.customWorkouts, update]);

  const addExercise = useCallback((type: 'A' | 'B' | 'C') => {
    const newEx: Exercise = { id: genId(), name: 'New Exercise', sets: 3, reps: '10', rest: 60, enabled: true };
    update({
      customWorkouts: settings.customWorkouts.map(w =>
        w.type === type ? { ...w, exercises: [...w.exercises, newEx] } : w
      ),
    });
  }, [settings.customWorkouts, update]);

  const removeExercise = useCallback((type: 'A' | 'B' | 'C', exId: string) => {
    update({
      customWorkouts: settings.customWorkouts.map(w =>
        w.type === type ? { ...w, exercises: w.exercises.filter(ex => ex.id !== exId) } : w
      ),
    });
  }, [settings.customWorkouts, update]);

  const updateMeal = useCallback((idx: number, patch: Partial<MealConfig>) => {
    const meals = [...settings.meals];
    meals[idx] = { ...meals[idx], ...patch };
    update({ meals });
  }, [settings.meals, update]);

  const addMeal = useCallback(() => {
    update({ meals: [...settings.meals, { name: 'New Meal', time: '12:00', suggestions: '', enabled: true }] });
  }, [settings.meals, update]);

  const removeMeal = useCallback((idx: number) => {
    update({ meals: settings.meals.filter((_, i) => i !== idx) });
  }, [settings.meals, update]);

  const updateMilestone = useCallback((idx: number, patch: Partial<MilestoneConfig>) => {
    const milestones = [...settings.milestones];
    milestones[idx] = { ...milestones[idx], ...patch };
    update({ milestones });
  }, [settings.milestones, update]);

  const addMilestone = useCallback(() => {
    update({
      milestones: [...settings.milestones, { week: 6, day: 42, title: 'Custom Milestone', description: 'Add your description' }],
    });
  }, [settings.milestones, update]);

  const removeMilestone = useCallback((idx: number) => {
    update({ milestones: settings.milestones.filter((_, i) => i !== idx) });
  }, [settings.milestones, update]);

  const toggleFeature = useCallback((key: keyof FeatureToggles) => {
    update({
      featureToggles: { ...settings.featureToggles, [key]: !settings.featureToggles[key] },
    });
  }, [settings.featureToggles, update]);

  const resetAllData = useCallback(() => {
    clearAllAppData();
    setState(loadState());
    refreshBackupState();
    toast.success("All data reset!");
  }, [refreshBackupState]);

  const downloadCSV = useCallback(() => {
    const csv = exportDataAsCSV(state);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transform90_progress.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported!");
  }, [state]);

  const toggleFastDay = useCallback((day: number) => {
    const days = settings.fastDays.includes(day)
      ? settings.fastDays.filter(d => d !== day)
      : [...settings.fastDays, day];
    update({ fastDays: days });
  }, [settings.fastDays, update]);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const accentColors = [
    { name: 'green', hue: '142 71% 45%' },
    { name: 'blue', hue: '210 80% 55%' },
    { name: 'purple', hue: '270 70% 55%' },
    { name: 'orange', hue: '25 95% 53%' },
    { name: 'pink', hue: '330 80% 55%' },
    { name: 'cyan', hue: '185 80% 45%' },
  ];

  const applyAccentColor = useCallback((colorName: string) => {
    const color = accentColors.find(c => c.name === colorName);
    if (color) {
      document.documentElement.style.setProperty('--primary', color.hue);
      document.documentElement.style.setProperty('--ring', color.hue);
      document.documentElement.style.setProperty('--accent', color.hue);
      update({ accentColor: colorName });
    }
  }, [update]);

  const featureLabels: { key: keyof FeatureToggles; label: string; group: string }[] = [
    { key: 'dailyTips', label: 'Daily Tips', group: 'Smart' },
    { key: 'restDaySuggestion', label: 'Rest Day Suggestion', group: 'Smart' },
    { key: 'calorieEstimator', label: 'Calorie Estimator', group: 'Smart' },
    { key: 'weeklySummary', label: 'Weekly Summary', group: 'Smart' },
    { key: 'bodyFatEstimator', label: 'Body Fat Estimator', group: 'Analytics' },
    { key: 'workoutIntensity', label: 'Workout Intensity Score', group: 'Analytics' },
    { key: 'bestWorstWeek', label: 'Best/Worst Week', group: 'Analytics' },
    { key: 'monthlyReportCard', label: 'Monthly Report Card', group: 'Analytics' },
    { key: 'dualAxisChart', label: 'Dual-Axis Chart', group: 'Analytics' },
    { key: 'badges', label: 'Badge System', group: 'Gamification' },
    { key: 'xpSystem', label: 'XP Points', group: 'Gamification' },
    { key: 'levelSystem', label: 'Level System', group: 'Gamification' },
    { key: 'weeklyChallenge', label: 'Weekly Challenge', group: 'Gamification' },
    { key: 'confetti', label: 'Confetti Animation', group: 'Gamification' },
    { key: 'beforeAfterPhotos', label: 'Before/After Photos', group: 'Visual' },
    { key: 'bodySilhouette', label: 'Body Silhouette', group: 'Visual' },
    { key: 'hydrationBottle', label: 'Water Bottle Animation', group: 'Visual' },
    { key: 'mealPhotos', label: 'Meal Photos', group: 'Diet' },
    { key: 'cheatMealTracker', label: 'Cheat Meal Tracker', group: 'Diet' },
    { key: 'macroTracking', label: 'Macro Tracking', group: 'Diet' },
    { key: 'calorieBalance', label: 'Calorie Balance', group: 'Diet' },
    { key: 'audioBeepTimer', label: 'Audio Beep Timer', group: 'Workout' },
    { key: 'exerciseInstructions', label: 'Exercise Instructions', group: 'Workout' },
    { key: 'supersetMode', label: 'Superset Mode', group: 'Workout' },
    { key: 'personalRecords', label: 'Personal Records', group: 'Workout' },
    { key: 'youtubeLinks', label: 'YouTube Links', group: 'Workout' },
    { key: 'quickSessions', label: 'Quick Sessions', group: 'Workout' },
    { key: 'deskMode', label: 'Desk Mode', group: 'Workout' },
    { key: 'dailyQuote', label: 'Daily Quote', group: 'Motivation' },
    { key: 'whyIStarted', label: '"Why I Started" Note', group: 'Motivation' },
    { key: 'moodCheckIn', label: 'Mood Check-in', group: 'Motivation' },
    { key: 'milestoneCelebration', label: 'Milestone Celebrations', group: 'Motivation' },
    { key: 'affirmations', label: 'Affirmations', group: 'Motivation' },
    { key: 'sleepTracking', label: 'Sleep Tracking', group: 'Sleep & Recovery' },
    { key: 'recoveryScore', label: 'Recovery Score', group: 'Sleep & Recovery' },
    { key: 'restDayQuality', label: 'Rest Day Quality', group: 'Sleep & Recovery' },
    { key: 'stressCheckIn', label: 'Stress Check-in', group: 'Wellness' },
    { key: 'breathingModule', label: 'Breathing Exercises', group: 'Wellness' },
    { key: 'mindfulnessTracker', label: 'Mindfulness Tracker', group: 'Wellness' },
    { key: 'wellnessScore', label: 'Wellness Score', group: 'Wellness' },
    { key: 'muscleHeatMap', label: 'Muscle Heat Map', group: 'Body Metrics' },
    { key: 'volumeTracker', label: 'Volume Tracker', group: 'Body Metrics' },
    { key: 'bodyMeasurements', label: 'Body Measurements', group: 'Body Metrics' },
    { key: 'strengthEstimator', label: 'Strength Estimator', group: 'Body Metrics' },
    { key: 'progressiveOverload', label: 'Progressive Overload', group: 'AI Coaching' },
    { key: 'adaptiveDifficulty', label: 'Adaptive Difficulty', group: 'AI Coaching' },
    { key: 'smartRestDetection', label: 'Smart Rest Detection', group: 'AI Coaching' },
    { key: 'habitStacking', label: 'Habit Stacking', group: 'Habits' },
    { key: 'ifThenPlanner', label: 'If-Then Planner', group: 'Habits' },
    { key: 'goalVisualization', label: 'Goal Visualization', group: 'Habits' },
    { key: 'barcodeScanner', label: 'Barcode Scanner', group: 'Diet' },
    { key: 'exerciseSnacks', label: 'Exercise Snacks', group: 'Workout' },
  ];

  const featureGroups = [...new Set(featureLabels.map(f => f.group))];

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex items-center gap-4 mb-8"
      >
        <button 
          onClick={() => navigate('/')} 
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-black italic text-white tracking-tight leading-none uppercase">Parameters</h1>
          <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.2em] mt-1">System Core Configuration</p>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        {/* FEATURE TOGGLES */}
        <Section title="FEATURE OVERRIDES" defaultOpen={false}>
          {featureGroups.map(group => (
            <div key={group} className="mb-4 last:mb-0">
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mb-2 opacity-60">{group}</p>
              <div className="grid grid-cols-1 gap-2">
                {featureLabels.filter(f => f.group === group).map(f => (
                  <div key={f.key} className="flex items-center justify-between group">
                    <span className="text-[11px] text-white/60 font-medium group-hover:text-white transition-colors">{f.label}</span>
                    <Switch 
                      checked={settings.featureToggles[f.key]} 
                      onCheckedChange={() => toggleFeature(f.key)} 
                      className="scale-75 origin-right"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Section>


        {/* SESSION TIMER */}
        <Section title="⏱️ Session Timer">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Timer Presets (seconds)</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {settings.timerPresets.map((p, i) => (
                <div key={i} className="flex items-center gap-1 bg-secondary/30 rounded-lg px-2 py-1">
                  <Input
                    type="number"
                    value={p}
                    onChange={e => {
                      const presets = [...settings.timerPresets];
                      presets[i] = Number(e.target.value);
                      update({ timerPresets: presets });
                    }}
                    className="h-6 text-xs w-16"
                  />
                  <button
                    onClick={() => update({ timerPresets: settings.timerPresets.filter((_, j) => j !== i) })}
                    className="p-0.5 text-destructive hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => update({ timerPresets: [...settings.timerPresets, 90] })} className="w-full">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Preset
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Halfway Beep</span>
            <Switch checked={settings.timerHalfwayBeep} onCheckedChange={v => update({ timerHalfwayBeep: v })} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">End Beep</span>
            <Switch checked={settings.timerEndBeep} onCheckedChange={v => update({ timerEndBeep: v })} />
          </div>
        </Section>

        {/* WORKOUT CUSTOMIZATION */}
        <Section title="🏋️ Workout Customization">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm">Strict Mode</span>
              <p className="text-[11px] text-muted-foreground">Require all sets before completing</p>
            </div>
            <Switch checked={settings.strictMode} onCheckedChange={v => update({ strictMode: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm">Partial workouts count toward streak</span>
              <p className="text-[11px] text-muted-foreground">Showing up matters</p>
            </div>
            <Switch checked={settings.partialCountsTowardStreak} onCheckedChange={v => update({ partialCountsTowardStreak: v })} />
          </div>
          <FieldRow label="Duration Target">
            <Select value={String(settings.workoutDuration)} onValueChange={v => update({ workoutDuration: Number(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[30, 45, 60, 90].map(d => <SelectItem key={d} value={String(d)}>{d} min</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldRow>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Weekly Schedule</p>
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map((name, i) => (
                <div key={i} className="text-center">
                  <p className="text-[11px] text-muted-foreground mb-1">{name}</p>
                  <Select value={settings.weeklySchedule[i]} onValueChange={v => {
                    const sched = [...settings.weeklySchedule];
                    sched[i] = v as 'A' | 'B' | 'C' | 'Rest';
                    update({ weeklySchedule: sched });
                  }}>
                    <SelectTrigger className="h-8 text-xs px-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['A', 'B', 'C', 'Rest'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {settings.customWorkouts.map(workout => (
            <div key={workout.type} className="border border-border/50 rounded-lg p-3 space-y-3">
              <div className="flex gap-2">
                <Input value={workout.title} onChange={e => updateWorkout(workout.type, { title: e.target.value })} className="h-8 text-sm font-semibold" />
                <Input value={workout.subtitle} onChange={e => updateWorkout(workout.type, { subtitle: e.target.value })} className="h-8 text-sm" />
              </div>
              {workout.exercises.map(ex => (
                <div key={ex.id} className="bg-secondary/30 rounded-lg p-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Switch checked={ex.enabled} onCheckedChange={v => updateExercise(workout.type, ex.id, { enabled: v })} />
                    <Input value={ex.name} onChange={e => updateExercise(workout.type, ex.id, { name: e.target.value })} className="h-7 text-xs flex-1" />
                    <Input type="number" value={ex.sets} onChange={e => updateExercise(workout.type, ex.id, { sets: Number(e.target.value) })} className="h-7 text-xs w-14" placeholder="Sets" />
                    <Input value={ex.reps} onChange={e => updateExercise(workout.type, ex.id, { reps: e.target.value })} className="h-7 text-xs w-16" placeholder="Reps" />
                    <Input type="number" value={ex.rest} onChange={e => updateExercise(workout.type, ex.id, { rest: Number(e.target.value) })} className="h-7 text-xs w-14" placeholder="Rest" />
                    <button onClick={() => removeExercise(workout.type, ex.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* YouTube URL field */}
                  <Input
                    value={ex.youtubeUrl || ''}
                    onChange={e => updateExercise(workout.type, ex.id, { youtubeUrl: e.target.value })}
                    className="h-6 text-[11px]"
                    placeholder="YouTube URL (optional)"
                  />
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => addExercise(workout.type)} className="w-full">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Exercise
              </Button>
            </div>
          ))}
        </Section>

        {/* DIET CUSTOMIZATION */}
        <Section title="🥗 Diet Customization">
          <FieldRow label="Daily Water Goal">
            <div className="flex items-center gap-2">
              <Slider value={[settings.dailyWaterGoal]} onValueChange={([v]) => update({ dailyWaterGoal: v })} min={4} max={20} step={1} className="flex-1" />
              <span className="text-sm font-medium w-8 text-right">{settings.dailyWaterGoal}</span>
            </div>
          </FieldRow>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Meals</p>
            {settings.meals.map((meal, i) => (
              <div key={i} className="flex items-center gap-2 mb-2 bg-secondary/30 rounded-lg p-2">
                <Switch checked={meal.enabled} onCheckedChange={v => updateMeal(i, { enabled: v })} />
                <Input value={meal.name} onChange={e => updateMeal(i, { name: e.target.value })} className="h-7 text-xs flex-1" />
                <Input type="time" value={meal.time} onChange={e => updateMeal(i, { time: e.target.value })} className="h-7 text-xs w-24" />
                <button onClick={() => removeMeal(i)} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addMeal} className="w-full">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Meal
            </Button>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Meal Suggestions</p>
            {settings.meals.map((meal, i) => (
              <div key={i} className="mb-2">
                <label className="text-xs text-muted-foreground">{meal.name}</label>
                <Input value={meal.suggestions} onChange={e => updateMeal(i, { suggestions: e.target.value })} className="h-7 text-xs mt-1" placeholder="Food suggestions..." />
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Fast Days (Skip Dinner)</p>
            <div className="flex gap-2">
              {dayNames.map((name, i) => (
                <button key={i} onClick={() => toggleFastDay(i + 1)} className={`px-2 py-1 rounded text-xs font-medium transition-colors ${settings.fastDays.includes(i + 1) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  {name}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* NUTRITION SETTINGS */}
        <Section title="🥩 Nutrition Settings">
          <FieldRow label="Daily Calorie Target">
            <Input type="number" value={settings.calorieTarget} onChange={e => update({ calorieTarget: Number(e.target.value) })} className="h-8 text-sm" />
          </FieldRow>
          <FieldRow label="Protein Target (g)">
            <Input type="number" value={settings.proteinTarget} onChange={e => update({ proteinTarget: Number(e.target.value) })} className="h-8 text-sm" />
          </FieldRow>
          <FieldRow label="Carb Target (g)">
            <Input type="number" value={settings.carbTarget} onChange={e => update({ carbTarget: Number(e.target.value) })} className="h-8 text-sm" />
          </FieldRow>
          <FieldRow label="Fat Target (g)">
            <Input type="number" value={settings.fatTarget} onChange={e => update({ fatTarget: Number(e.target.value) })} className="h-8 text-sm" />
          </FieldRow>
          <div className="space-y-2 pt-2 border-t border-border/50">
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => {
              const today = getToday();
              patchState(s => {
                const log = s.dietLogs.find(d => d.date === today);
                if (log) log.foodEntries = [];
              });
              toast.success("Today's food log cleared");
            }}>Clear Today's Food Log</Button>
            <Button variant="outline" size="sm" className="w-full text-xs text-destructive" onClick={() => {
              patchState(s => {
                s.dietLogs.forEach(d => { d.foodEntries = []; });
              });
              toast.success("All food history cleared");
            }}>Clear All Food History</Button>
          </div>
        </Section>

        <Section title="🎯 Personal Goals">
          <FieldRow label="Start Date">
            <Input type="date" value={state.startDate} onChange={e => updateStartDate(e.target.value)} className="h-8 text-sm" />
          </FieldRow>
          <FieldRow label="Height (cm)">
            <Input type="number" value={settings.height ?? ''} onChange={e => update({ height: e.target.value ? Number(e.target.value) : null })} className="h-8 text-sm" />
          </FieldRow>
          <FieldRow label="Starting Weight (kg)">
            <Input type="number" value={settings.startingWeight ?? ''} onChange={e => update({ startingWeight: e.target.value ? Number(e.target.value) : null })} className="h-8 text-sm" />
          </FieldRow>
          <FieldRow label="Target Weight (kg)">
            <Input type="number" value={settings.targetWeight ?? ''} onChange={e => update({ targetWeight: e.target.value ? Number(e.target.value) : null })} className="h-8 text-sm" />
          </FieldRow>
          <FieldRow label="Starting Waist (cm)">
            <Input type="number" value={settings.startingWaist ?? ''} onChange={e => update({ startingWaist: e.target.value ? Number(e.target.value) : null })} className="h-8 text-sm" />
          </FieldRow>
          <FieldRow label="Target Waist (cm)">
            <Input type="number" value={settings.targetWaist ?? ''} onChange={e => update({ targetWaist: e.target.value ? Number(e.target.value) : null })} className="h-8 text-sm" />
          </FieldRow>
          <FieldRow label="Daily Step Goal">
            <Input type="number" value={settings.dailyStepGoal} onChange={e => update({ dailyStepGoal: Number(e.target.value) })} className="h-8 text-sm" />
          </FieldRow>
          <FieldRow label="Push-up Baseline">
            <Input type="number" value={settings.pushupBaseline ?? ''} onChange={e => update({ pushupBaseline: e.target.value ? Number(e.target.value) : null })} className="h-8 text-sm" />
          </FieldRow>
          <FieldRow label="Push-up Target">
            <Input type="number" value={settings.pushupTarget ?? ''} onChange={e => update({ pushupTarget: e.target.value ? Number(e.target.value) : null })} className="h-8 text-sm" />
          </FieldRow>
        </Section>

        {/* NOTIFICATIONS */}
        <Section title="🔔 Notifications & Reminders">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Workout Reminder</span>
              <Switch checked={settings.workoutReminderEnabled} onCheckedChange={v => update({ workoutReminderEnabled: v })} />
            </div>
            {settings.workoutReminderEnabled && (
              <FieldRow label="Time">
                <Input type="time" value={settings.workoutReminderTime} onChange={e => update({ workoutReminderTime: e.target.value })} className="h-8 text-sm" />
              </FieldRow>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm">Water Reminder</span>
              <Switch checked={settings.waterReminderEnabled} onCheckedChange={v => update({ waterReminderEnabled: v })} />
            </div>
            {settings.waterReminderEnabled && (
              <FieldRow label="Every (min)">
                <Input type="number" value={settings.waterReminderInterval} onChange={e => update({ waterReminderInterval: Number(e.target.value) })} className="h-8 text-sm" />
              </FieldRow>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm">Weigh-in Reminder</span>
              <Switch checked={settings.weighInReminderEnabled} onCheckedChange={v => update({ weighInReminderEnabled: v })} />
            </div>
            {settings.weighInReminderEnabled && (
              <>
                <FieldRow label="Day">
                  <Select value={settings.weighInReminderDay} onValueChange={v => update({ weighInReminderDay: v })}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FieldRow>
                <FieldRow label="Time">
                  <Input type="time" value={settings.weighInReminderTime} onChange={e => update({ weighInReminderTime: e.target.value })} className="h-8 text-sm" />
                </FieldRow>
              </>
            )}
          </div>
        </Section>

        {/* MILESTONES */}
        <Section title="🏆 Progress Milestones">
          {settings.milestones.map((m, i) => (
            <div key={i} className="bg-secondary/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input type="number" value={m.week} onChange={e => updateMilestone(i, { week: Number(e.target.value), day: Number(e.target.value) * 7 })} className="h-7 text-xs w-16" placeholder="Week" />
                <Input value={m.title} onChange={e => updateMilestone(i, { title: e.target.value })} className="h-7 text-xs flex-1" />
                <button onClick={() => removeMilestone(i)} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <Input value={m.description} onChange={e => updateMilestone(i, { description: e.target.value })} className="h-7 text-xs" placeholder="Description" />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addMilestone} className="w-full">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Milestone
          </Button>
        </Section>

        {/* MUSIC SETTINGS */}
        <Section title="🎵 Music Settings">
          <div className="flex items-center justify-between">
            <span className="text-sm">Built-in Workout Beats</span>
            <Switch checked={settings.featureToggles.builtInBeats} onCheckedChange={() => toggleFeature('builtInBeats')} />
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Custom Playlists (up to 5)</p>
            {(settings.customPlaylists || []).map((pl, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input value={pl.name} onChange={e => {
                  const pls = [...(settings.customPlaylists || [])];
                  pls[i] = { ...pls[i], name: e.target.value };
                  update({ customPlaylists: pls });
                }} className="h-8 text-xs flex-1" placeholder="Name" />
                <Input value={pl.url} onChange={e => {
                  const pls = [...(settings.customPlaylists || [])];
                  pls[i] = { ...pls[i], url: e.target.value };
                  update({ customPlaylists: pls });
                }} className="h-8 text-xs flex-[2]" placeholder="URL" />
                <button onClick={() => {
                  const pls = (settings.customPlaylists || []).filter((_, j) => j !== i);
                  update({ customPlaylists: pls });
                }} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {(settings.customPlaylists || []).length < 5 && (
              <Button variant="outline" size="sm" onClick={() => update({ customPlaylists: [...(settings.customPlaylists || []), { name: '', url: '' }] })} className="w-full">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Playlist
              </Button>
            )}
          </div>
        </Section>

        <Section title="⏱️ Rest Timer">
          <FieldRow label="Auto-start on set complete">
            <Switch checked={settings.restTimerAutoStart ?? true} onCheckedChange={v => update({ restTimerAutoStart: v } as any)} />
          </FieldRow>
          <FieldRow label="Show inline (inside exercise)">
            <Switch checked={settings.restTimerInline ?? true} onCheckedChange={v => update({ restTimerInline: v } as any)} />
          </FieldRow>
          <FieldRow label="Color transition (green→amber→red)">
            <Switch checked={settings.restTimerColorTransition ?? true} onCheckedChange={v => update({ restTimerColorTransition: v } as any)} />
          </FieldRow>
          <FieldRow label="Show 'Ready' badge">
            <Switch checked={settings.restTimerReadyBadge ?? true} onCheckedChange={v => update({ restTimerReadyBadge: v } as any)} />
          </FieldRow>
          <FieldRow label="Strength rest (sec)">
            <Input type="number" value={settings.restTimeStrength ?? 60} onChange={e => update({ restTimeStrength: Number(e.target.value) } as any)} className="h-8 text-xs" min={10} max={180} />
          </FieldRow>
          <FieldRow label="Core rest (sec)">
            <Input type="number" value={settings.restTimeCore ?? 45} onChange={e => update({ restTimeCore: Number(e.target.value) } as any)} className="h-8 text-xs" min={10} max={180} />
          </FieldRow>
          <FieldRow label="Cardio rest (sec)">
            <Input type="number" value={settings.restTimeCardio ?? 30} onChange={e => update({ restTimeCardio: Number(e.target.value) } as any)} className="h-8 text-xs" min={10} max={180} />
          </FieldRow>
          <FieldRow label="Global override (sec, 0 = off)">
            <Input type="number" value={settings.restTimeGlobalOverride ?? 0} onChange={e => update({ restTimeGlobalOverride: Number(e.target.value) || null } as any)} className="h-8 text-xs" min={0} max={180} />
          </FieldRow>
        </Section>

        <Section title="📷 AI Form Check">
          <FieldRow label="Enable AI Form Check">
            <Switch checked={(settings.featureToggles as any).aiFormCheck} onCheckedChange={() => toggleFeature('aiFormCheck' as any)} />
          </FieldRow>
          <FieldRow label="Rep count beep">
            <Switch checked={(settings.featureToggles as any).formCheckAudio} onCheckedChange={() => toggleFeature('formCheckAudio' as any)} />
          </FieldRow>
          <FieldRow label="Voice announcements">
            <Switch checked={(settings.featureToggles as any).formCheckVoice} onCheckedChange={() => toggleFeature('formCheckVoice' as any)} />
          </FieldRow>
          <FieldRow label="Form warning banners">
            <Switch checked={(settings.featureToggles as any).formCheckBanners} onCheckedChange={() => toggleFeature('formCheckBanners' as any)} />
          </FieldRow>
          <FieldRow label="Detection sensitivity">
            <Select value={(settings as any).formCheckSensitivity || 'Normal'} onValueChange={v => update({ formCheckSensitivity: v as any })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Strict">Strict</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Relaxed">Relaxed</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
        </Section>

        <Section title="🧠 AI Coach">
          <FieldRow label="Enable AI Coach">
            <Switch checked={(settings.featureToggles as any).aiCoach} onCheckedChange={() => toggleFeature('aiCoach' as any)} />
          </FieldRow>
          <FieldRow label="Suggestion chips">
            <Switch checked={(settings.featureToggles as any).coachSuggestionChips} onCheckedChange={() => toggleFeature('coachSuggestionChips' as any)} />
          </FieldRow>
          <FieldRow label="Floating coach button">
            <Switch checked={(settings.featureToggles as any).coachFloatingButton} onCheckedChange={() => toggleFeature('coachFloatingButton' as any)} />
          </FieldRow>
          <FieldRow label="Coach name">
            <Input value={(settings as any).coachName || 'Coach Max'} onChange={e => update({ coachName: e.target.value } as any)} className="h-8 text-xs" />
          </FieldRow>
          <Button variant="outline" size="sm" onClick={() => { localStorage.removeItem('transform90_coach_messages'); toast.success('Chat history cleared'); }} className="w-full">
            Clear chat history
          </Button>
        </Section>

        {/* DATA & BACKUP */}
        <div id="data-backup" ref={dataBackupRef}>
        <Section title="💾 Data & Backup" defaultOpen={window.location.hash === '#data-backup'}>
          <div className="glass-card p-3 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground leading-relaxed">
                <p className="font-medium text-foreground mb-1">Your data stays local until you back it up</p>
                <p>Backup captures every saved item in this browser, including workouts, food logs, settings, custom foods, coach history, badges, and restore points.</p>
              </div>
            </div>
          </div>

          {/* FULL BACKUP */}
          <div>
            <button
              type="button"
              onClick={async () => {
                try {
                  const allData: Record<string, unknown> = {};
                  const knownKeys = [
                    'transform90_data',
                    'transform90_coach_messages',
                    'formcheck_privacy',
                    'transform90_custom_foods',
                  ];
                  for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k && !knownKeys.includes(k)) knownKeys.push(k);
                  }
                  knownKeys.forEach((key) => {
                    const val = localStorage.getItem(key);
                    if (val) {
                      try { allData[key] = JSON.parse(val); }
                      catch { allData[key] = val; }
                    }
                  });

                  const backup = {
                    version: "transform90-v2",
                    backup_date: new Date().toISOString(),
                    total_keys: Object.keys(allData).length,
                    data: allData,
                  };
                  const jsonString = JSON.stringify(backup, null, 2);

                  let dayNum: string | number = "0";
                  let streak: string | number = "0";
                  try {
                    const m = allData['transform90_data'] as Record<string, unknown> | undefined;
                    if (m) {
                      dayNum = (m.currentDay as number) || (m.dayNumber as number) || (m.programDay as number) || "0";
                      streak = (m.streak as number) || (m.currentStreak as number) || (m.streakCount as number) || "0";
                    }
                  } catch {}

                  const filename = `transform90-FULLBACKUP-day${dayNum}-streak${streak}-${new Date().toISOString().split('T')[0]}.json`;

                  const blob = new Blob([jsonString], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = filename;
                  a.style.display = 'none';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  setTimeout(() => URL.revokeObjectURL(url), 3000);

                  localStorage.setItem('lastBackupDate', new Date().toISOString());
                  localStorage.setItem('lastBackupKeys', Object.keys(allData).length.toString());
                  localStorage.setItem('lastBackupSize', jsonString.length.toString());

                  refreshBackupState();
                  toast.success(`Backup saved — ${Object.keys(allData).length} items, ${(jsonString.length / 1024).toFixed(1)} KB`);
                } catch (err) {
                  console.error('Backup error:', err);
                  toast.error('Backup failed: ' + (err instanceof Error ? err.message : String(err)));
                }
              }}
              className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" /> ⬇ Download Full Backup
            </button>
            <p className="text-[11px] text-muted-foreground text-center mt-1.5">
              Use this to restore your data on another browser or device
            </p>
            <div className="mt-1.5 text-[11px] text-muted-foreground text-center space-y-0.5">
              <p>
                Last backup: {backupMeta.lastBackupDate
                  ? new Date(backupMeta.lastBackupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'Not backed up yet'}
                {backupMeta.lastBackupKeys ? ` — ${backupMeta.lastBackupKeys} items` : ''}
                {backupMeta.lastBackupSizeBytes ? ` — ${formatBackupSize(backupMeta.lastBackupSizeBytes)}` : ''}
              </p>
            </div>
          </div>

          {/* RESTORE */}
          <RestoreButton
            onRestored={() => { setState(loadState()); refreshBackupState(); }}
            onBackupStateChange={refreshBackupState}
            quickRestorePoints={quickRestorePoints}
          />

          {/* DIVIDER */}
          <div className="border-t border-border/50" />

          {/* CSV EXPORT */}
          <div>
            <Button variant="outline" onClick={downloadCSV} className="w-full">
              <Download className="w-4 h-4 mr-2" /> Export Progress as CSV
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-1.5">
              Use this to view your progress in Excel or Google Sheets — cannot be used for restore
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Sunday Backup Reminder</span>
            <Switch checked={backupMeta.backupReminderEnabled} onCheckedChange={v => {
              const nextMeta = { ...backupMeta, backupReminderEnabled: v };
              saveBackupMeta(nextMeta);
              setBackupMeta(nextMeta);
              toast.success(v ? "Backup reminder enabled" : "Backup reminder disabled");
            }} />
          </div>

          <Button
            variant="outline"
            onClick={() => {
              const result = verifyStoredDataIntegrity();
              if (result.valid) {
                toast.success(`Data integrity looks good — ${result.totalKeys} stored items checked`);
                return;
              }
              toast.error(`Some saved items look incomplete: ${result.invalidKeys.join(', ')}`);
            }}
            className="w-full"
          >
            <ShieldCheck className="w-4 h-4 mr-2" /> Verify Data Integrity
          </Button>

          <details className="rounded-xl border border-border/50 bg-secondary/20 p-3 text-xs text-muted-foreground">
            <summary className="cursor-pointer list-none font-medium text-foreground">Transfer Guide</summary>
            <ol className="mt-3 list-decimal pl-4 space-y-2 leading-relaxed">
              <li>Tap <strong>Download Full Backup</strong> — a JSON file downloads to your device.</li>
              <li>Send the file to yourself with WhatsApp, email, Google Drive, or USB.</li>
              <li>Open Transform 90 on the new browser or device.</li>
              <li>Go to Admin → <strong>Restore From Backup</strong>.</li>
              <li>Select the <code className="text-[11px]">transform90-FULLBACKUP-*.json</code> file — your data will be fully restored.</li>
              <li>The app reloads automatically and verifies that your progress came back.</li>
            </ol>
          </details>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <AlertTriangle className="w-4 h-4 mr-2" /> Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete all workouts, food logs, custom foods, restore points, coach history, and settings saved in this browser. This cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                  if (window.confirm("This is your last chance. ALL data will be permanently deleted. Continue?")) {
                    resetAllData();
                  }
                }}>Yes, delete everything</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Section>
        </div>

        <Section title="⚙️ App Preferences">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Accent Color</p>
            <div className="flex gap-2">
              {accentColors.map(c => (
                <button key={c.name} onClick={() => applyAccentColor(c.name)} className={`w-8 h-8 rounded-full border-2 transition-all ${settings.accentColor === c.name ? 'border-foreground scale-110' : 'border-transparent'}`} style={{ backgroundColor: `hsl(${c.hue})` }} />
              ))}
            </div>
          </div>
        </Section>

        <Section title="Timeline">
          <p className="text-xs text-muted-foreground">Recalculate all timeline colors from scratch based on actual workout logs.</p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              localStorage.removeItem('transform90_timeline_cache');
              toast.success('Timeline recalculated from workout logs');
            }}
          >
            Recalculate Timeline
          </Button>
        </Section>

        {/* Save Changes Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-4 pt-4"
        >
          <Button
            onClick={() => {
              patchState(s => {
                s.settings = state.settings;
                s.startDate = state.startDate;
              });
              toast.success("All changes saved!");
            }}
            className="w-full h-12 text-base font-bold"
          >
            <Save className="w-5 h-5 mr-2" /> Save Changes
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

function RestoreButton({
  onRestored,
  onBackupStateChange,
  quickRestorePoints,
}: {
  onRestored: () => void;
  onBackupStateChange: () => void;
  quickRestorePoints: QuickRestorePoint[];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<BackupPreview | null>(null);
  const [backupContent, setBackupContent] = useState<Record<string, unknown> | null>(null);
  const [backupFirst, setBackupFirst] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sourceLabel, setSourceLabel] = useState('');
  const [loadingQuickRestoreId, setLoadingQuickRestoreId] = useState<string | null>(null);
  const [restoreMode, setRestoreMode] = useState<'file' | 'paste'>('file');
  const [pasteText, setPasteText] = useState('');

  const openRestorePreview = useCallback((content: unknown, label: string) => {
    const result = validateBackup(content);
    if (!result.valid || !result.preview || !result.backup) {
      toast.error(result.error || "This does not appear to be a Transform 90 backup file.");
      return;
    }

    setPreview(result.preview);
    setBackupContent(result.backup);
    setSourceLabel(label);
    setShowConfirm(true);
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reject CSV files with a clear message
    if (file.name.endsWith('.csv')) {
      toast.error(
        "Wrong file type — you selected a CSV export file. For restoring your data you need the Full Backup JSON file (filename starts with transform90-FULLBACKUP). Go to Settings → Data & Backup → Download Full Backup to create one."
      );
      e.target.value = '';
      return;
    }

    if (!file.name.endsWith('.json')) {
      toast.error("Please select a valid Transform 90 backup JSON file.");
      e.target.value = '';
      return;
    }

    try {
      const content = JSON.parse(await file.text());
      openRestorePreview(content, file.name);
    } catch {
      toast.error("Could not read this file — it may be corrupted. Try downloading a fresh backup.");
    }

    e.target.value = '';
  };

  const handlePasteRestore = useCallback(() => {
    if (!pasteText.trim()) {
      toast.error("Please paste your backup text first");
      return;
    }
    try {
      const content = JSON.parse(pasteText.trim());
      openRestorePreview(content, "Pasted Backup Text");
    } catch {
      toast.error("Could not parse the pasted text — make sure you copied the entire backup.");
    }
  }, [pasteText, openRestorePreview]);

  const handleQuickRestore = async (point: QuickRestorePoint, index: number) => {
    setLoadingQuickRestoreId(point.id);
    const content = await loadQuickRestorePointBackup(point.id);
    setLoadingQuickRestoreId(null);

    if (!content) {
      toast.error("This restore point could not be read — please try another one");
      return;
    }

    openRestorePreview(content, `Restore Point ${index + 1}`);
  };

  const handleRestore = async () => {
    if (!backupContent || !preview) return;

    if (backupFirst) {
      try {
        await downloadBackup();
        onBackupStateChange();
      } catch {
        toast.error("Current data could not be backed up — restore cancelled");
        return;
      }
    }

    const result = restoreFromBackup(backupContent);
    if (!result.success) {
      toast.error(`Restore failed — ${result.error}. Your existing data was not affected.`);
      return;
    }

    setShowConfirm(false);
    setPreview(null);
    setBackupContent(null);
    setSourceLabel('');
    onRestored();
    onBackupStateChange();
    toast.success(`✅ Restored ${result.restoredKeys} data items successfully! Reloading app now...`);
    setTimeout(() => window.location.href = window.location.origin, 2500);
  };

  return (
    <>
      <input ref={fileRef} type="file" accept=".json" onChange={handleFile} className="hidden" />
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Restore From Backup</p>
        <div className="flex gap-1 mb-3">
          <button
            type="button"
            onClick={() => setRestoreMode('file')}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${restoreMode === 'file' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
          >
            Select File
          </button>
          <button
            type="button"
            onClick={() => setRestoreMode('paste')}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${restoreMode === 'paste' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
          >
            Paste Text
          </button>
        </div>

        {restoreMode === 'file' ? (
          <>
            <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileRef.current?.click(); }} className="w-full">
              <Upload className="w-4 h-4 mr-2" /> ⬆ Select Backup File
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-1.5">
              Select your <code className="text-[11px]">transform90-FULLBACKUP</code> JSON file
            </p>
            <p className="text-[11px] text-amber-500 text-center mt-0.5">
              Only accepts Full Backup JSON files — not CSV files
            </p>
          </>
        ) : (
          <div className="space-y-2">
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder='Paste your backup JSON text here (starts with {"version":"transform90-v2"...})'
              className="w-full h-32 rounded-lg border border-border bg-secondary/30 p-3 text-xs font-mono text-foreground placeholder:text-muted-foreground resize-none"
            />
            <Button type="button" variant="outline" onClick={handlePasteRestore} className="w-full">
              <Upload className="w-4 h-4 mr-2" /> ⬆ Restore From Pasted Text
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              Use this if the download didn't work and you copied the backup text instead
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Quick Restore Points</p>
        {quickRestorePoints.length ? quickRestorePoints.map((point, index) => (
          <div key={point.id} className="rounded-xl border border-border/50 bg-secondary/20 p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Restore Point {index + 1}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(point.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · Day {point.dayNumber}, Streak {point.currentStreak}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { void handleQuickRestore(point, index); }}
              disabled={loadingQuickRestoreId === point.id}
            >
              {loadingQuickRestoreId === point.id ? 'Loading...' : 'Restore'}
            </Button>
          </div>
        )) : (
          <p className="text-xs text-muted-foreground rounded-xl border border-border/50 bg-secondary/20 p-3">
            No quick restore points yet — a new one is saved every Sunday and whenever you create a backup.
          </p>
        )}
      </div>

      {showConfirm && preview && (
        <div className="glass-card p-4 rounded-xl space-y-4 border border-border/60">
          <div className="text-center">
            <p className="text-sm font-bold text-foreground uppercase tracking-wider">Restore Preview</p>
            <p className="text-xs text-muted-foreground mt-1">{sourceLabel}</p>
          </div>

          <div className="rounded-xl border border-border/50 bg-secondary/20 p-3 text-xs text-muted-foreground space-y-1.5">
            <p><strong>Backup created:</strong> {new Date(preview.exportDate).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>Total data items:</strong> {preview.totalDataItems} keys</p>
            <div className="border-t border-border/30 my-2" />
            <p className="font-semibold text-foreground text-xs uppercase tracking-wider">Your Progress in This Backup:</p>
            <p>• Current streak: {preview.currentStreak} days</p>
            <p>• Total XP: {preview.totalXP}</p>
            <p>• Level: {preview.currentLevel}</p>
            <p>• Workouts completed: {preview.completedDays}</p>
            <p>• Workouts partial: {preview.partialDays}</p>
            <p>• Workouts missed: {preview.missedDays}</p>
            <p>• Badges earned: {preview.badgesEarned}</p>
            <p>• Food log days: {preview.foodLogCount}</p>
            <p>• Progress entries: {preview.progressDays}</p>
            <p>Checksum: {preview.checksumStatus === 'valid' ? '✅ Verified' : preview.checksumStatus === 'missing' ? 'Not available (older backup)' : '⚠️ Mismatch detected'}</p>
          </div>

          {preview.warning && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-foreground/80">
              ⚠️ {preview.warning}
            </div>
          )}

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-foreground/80">
            ⚠️ This will replace ALL current data in this browser with the backup data
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="backup-first" checked={backupFirst} onCheckedChange={v => setBackupFirst(!!v)} />
            <label htmlFor="backup-first" className="text-xs text-muted-foreground">Download current data before restoring</label>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={() => { void handleRestore(); }} className="w-full" size="sm">Restore Everything</Button>
            <Button variant="outline" onClick={() => { setShowConfirm(false); setPreview(null); setBackupContent(null); setSourceLabel(''); }} className="w-full" size="sm">Cancel</Button>
          </div>
        </div>
      )}
    </>
  );
}
