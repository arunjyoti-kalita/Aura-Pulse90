import { useMemo } from "react";
import { motion } from "framer-motion";
import type { MacroLog, WorkoutLog, AppSettings } from "@/lib/store";

interface CalorieBalanceProps {
  macroLogs: MacroLog[];
  workoutLogs: WorkoutLog[];
  settings: AppSettings;
  currentWeight: number | null;
  today: string;
}

function estimateBMR(weight: number, height: number | null): number {
  const h = height || 170;
  return Math.round(10 * weight + 6.25 * h - 5 * 30 + 5); // Mifflin-St Jeor for ~30yr male
}

function estimateWorkoutCalories(intensity: number | undefined): number {
  if (!intensity) return 0;
  return Math.round(intensity * 2.5); // rough estimate
}

export default function CalorieBalance({ macroLogs, workoutLogs, settings, currentWeight, today }: CalorieBalanceProps) {
  const todayLogs = useMemo(() => macroLogs.filter(l => l.date === today), [macroLogs, today]);
  const todayWorkout = useMemo(() => workoutLogs.find(l => l.date === today), [workoutLogs, today]);

  const eaten = useMemo(() => todayLogs.reduce((s, l) => s + l.calories, 0), [todayLogs]);
  const bmr = currentWeight ? estimateBMR(currentWeight, settings.height) : 1800;
  const workoutCal = estimateWorkoutCalories(todayWorkout?.intensityScore);
  const burned = bmr + workoutCal;
  const balance = eaten - burned;
  const isDeficit = balance <= 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 mt-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Calorie Balance</p>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-display font-bold">{eaten}</p>
          <p className="text-[10px] text-muted-foreground">Eaten</p>
        </div>
        <div>
          <p className="text-lg font-display font-bold">{burned}</p>
          <p className="text-[10px] text-muted-foreground">Burned</p>
        </div>
        <div>
          <p className={`text-lg font-display font-bold ${isDeficit ? 'text-primary' : 'text-destructive'}`}>
            {balance > 0 ? '+' : ''}{balance}
          </p>
          <p className="text-[10px] text-muted-foreground">{isDeficit ? 'Deficit ✓' : 'Surplus'}</p>
        </div>
      </div>
      <div className="w-full h-1.5 bg-secondary rounded-full mt-3 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${isDeficit ? 'bg-primary' : 'bg-destructive'}`}
          style={{ width: `${Math.min(100, (eaten / burned) * 100)}%` }} />
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-1">BMR: {bmr} + Workout: {workoutCal}</p>
    </motion.div>
  );
}
