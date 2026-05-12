// Legacy compatibility - workouts are now managed through settings in store.ts
// This file re-exports types for any remaining imports

import { loadState, type CustomWorkout } from '@/lib/store';

export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  rest: number;
};

export type Workout = {
  type: 'A' | 'B' | 'C';
  title: string;
  subtitle: string;
  warmup: string[];
  exercises: Exercise[];
};

export function getWorkout(type: 'A' | 'B' | 'C'): Workout {
  const state = loadState();
  const w = state.settings.customWorkouts.find(w => w.type === type) || state.settings.customWorkouts[0];
  return {
    type: w.type,
    title: w.title,
    subtitle: w.subtitle,
    warmup: w.warmup,
    exercises: w.exercises.filter(e => e.enabled).map(e => ({ name: e.name, sets: e.sets, reps: e.reps, rest: e.rest })),
  };
}

export const workouts: Workout[] = (() => {
  const state = loadState();
  return state.settings.customWorkouts.map(w => ({
    type: w.type,
    title: w.title,
    subtitle: w.subtitle,
    warmup: w.warmup,
    exercises: w.exercises.filter(e => e.enabled).map(e => ({ name: e.name, sets: e.sets, reps: e.reps, rest: e.rest })),
  }));
})();
