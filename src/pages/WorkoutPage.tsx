import { useState, useMemo, useCallback, useRef } from "react";
import { CheckCircle2, Circle, ExternalLink, Info, Link2, Trophy, ArrowUp, Zap, Share2, Camera, Wind, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import WorkoutSessionTimer from "@/components/WorkoutSessionTimer";
import WorkoutMusic from "@/components/WorkoutMusic";
import QuickSessionSelector from "@/components/QuickSessionSelector";
import AIFormCheck from "@/components/AIFormCheck";
import InlineRestTimer from "@/components/InlineRestTimer";
import { loadState, saveState, useSyncState, getTodayWorkoutType, getToday, calculateWorkoutIntensity, checkAndAwardBadges, getProgressionSuggestions, getWorkoutDifficulty, deskExercises, patchState } from "@/lib/store";
import type { CustomWorkout, Exercise, PersonalRecord, QuickSession } from "@/lib/store";
import { toast } from "sonner";
import { fireConfetti } from "@/lib/confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PartialCompletionPopup from "@/components/PartialCompletionPopup";
import WorkoutShareCard from "@/components/WorkoutShareCard";
import { playClick, hapticPulse } from "@/lib/audio";

// Classify exercise for rest time defaults
function getExerciseCategory(name: string): 'strength' | 'core' | 'cardio' {
  const n = name.toLowerCase();
  if (n.includes('crunch') || n.includes('plank') || n.includes('leg raise') || n.includes('bicycle') || n.includes('shoulder tap')) return 'core';
  if (n.includes('jog') || n.includes('high knee') || n.includes('mountain') || n.includes('burpee') || n.includes('jump')) return 'cardio';
  return 'strength';
}

export default function WorkoutPage() {
  const [state, setState] = useSyncState();
  const todayType = getTodayWorkoutType(state);
  const today = getToday();
  const alreadyDone = state.workoutLogs.some(l => l.date === today);
  const isRest = todayType === 'Rest';
  const ft = state.settings.featureToggles;
  const strictMode = state.settings.strictMode;

  const [showQuickSession, setShowQuickSession] = useState(false);
  const [quickSessionActive, setQuickSessionActive] = useState<'5min' | '10min' | '15min' | 'desk' | null>(null);
  const [showDifficultyRating, setShowDifficultyRating] = useState(false);
  const [formCheckExercise, setFormCheckExercise] = useState<Exercise | null>(null);
  const [lastSetStruggled, setLastSetStruggled] = useState(false);

  // Inline rest timer state
  const [activeTimerExercise, setActiveTimerExercise] = useState<string | null>(null);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState(60);
  const [activeTimerIsLastSet, setActiveTimerIsLastSet] = useState(false);
  const [readyExercises, setReadyExercises] = useState<Set<string>>(new Set());
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [timerKey, setTimerKey] = useState(0); // force remount on new timer

  const [hasSkippedToday, setHasSkippedToday] = useState(() => {
    const todayLog = loadState().workoutLogs.find(l => l.date === getToday());
    return todayLog?.isSkipped || false;
  });

  // Track workout start time
  const activeWorkoutStartTimestamp = useRef<number | null>(null);
  const workoutStartTime = useRef<string>(new Date().toISOString());

  const handleInteraction = (cb?: () => void) => {
    playClick();
    hapticPulse('light');
    if (cb) cb();
  };

  const workout: CustomWorkout = useMemo(() => {
    if (quickSessionActive === 'desk') {
      return { type: todayType as 'A' | 'B' | 'C', title: 'Desk Workout', subtitle: 'No floor exercises', warmup: ['Shoulder rolls — 30 sec'], exercises: deskExercises };
    }
    if (isRest) return state.settings.customWorkouts[0];
    return state.settings.customWorkouts.find(w => w.type === todayType) || state.settings.customWorkouts[0];
  }, [isRest, todayType, state.settings.customWorkouts, quickSessionActive]);

  const activeExercises = useMemo(() => {
    let exs = workout.exercises.filter(ex => ex.enabled);
    if (quickSessionActive === '5min') exs = exs.slice(0, 4);
    if (quickSessionActive === '10min') exs = exs.slice(0, 4);
    if (quickSessionActive === '15min') exs = exs.slice(0, 6);
    return exs;
  }, [workout, quickSessionActive]);

  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>(() => {
    if (isRest && !quickSessionActive) return {};
    const existing = state.workoutLogs.find(l => l.date === today);
    if (existing && !quickSessionActive) return existing.completedSets;
    const sets: Record<string, boolean[]> = {};
    activeExercises.forEach(ex => {
      const numSets = quickSessionActive === '5min' ? 1 : quickSessionActive === '10min' ? 2 : quickSessionActive === '15min' ? 2 : ex.sets;
      sets[ex.name] = Array(numSets).fill(false);
    });
    return sets;
  });

  const [instructionEx, setInstructionEx] = useState<Exercise | null>(null);
  const [newPR, setNewPR] = useState<string | null>(null);
  const [showPartialPopup, setShowPartialPopup] = useState(false);

  const audioCtx = useRef<AudioContext | null>(null);

  const overloadSuggestions = useMemo(() => {
    if (!ft.progressiveOverload || isRest) return [];
    return getProgressionSuggestions(state, todayType as 'A' | 'B' | 'C');
  }, [state, todayType, ft.progressiveOverload, isRest]);

  const difficultyLevel = useMemo(() => {
    if (!ft.adaptiveDifficulty || isRest) return null;
    return getWorkoutDifficulty(state, todayType as 'A' | 'B' | 'C');
  }, [state, todayType, ft.adaptiveDifficulty, isRest]);

  const getRestTime = useCallback((ex: Exercise): number => {
    const s = state.settings;
    if (s.restTimeGlobalOverride && s.restTimeGlobalOverride > 0) return s.restTimeGlobalOverride;
    const cat = getExerciseCategory(ex.name);
    let baseRest = 60;
    if (cat === 'core') baseRest = s.restTimeCore ?? 45;
    if (cat === 'cardio') baseRest = s.restTimeCardio ?? 30;
    else baseRest = s.restTimeStrength ?? 60;

    // Adaptive Rest: Add 30s if struggling detected
    if (lastSetStruggled) {
      toast.info("Struggle detected. Adding 30s rest protocol.");
      setLastSetStruggled(false);
      return baseRest + 30;
    }
    return baseRest;
  }, [state.settings, lastSetStruggled]);

  const toggleSet = useCallback((exName: string, setIdx: number) => {
    handleInteraction();
    if (activeWorkoutStartTimestamp.current === null) {
      activeWorkoutStartTimestamp.current = Date.now();
      workoutStartTime.current = new Date().toISOString();
    }
    const updated = { ...completedSets };
    updated[exName] = [...(completedSets[exName] || [])];
    updated[exName][setIdx] = !updated[exName][setIdx];
    
    if (updated[exName][setIdx]) {
      const ex = activeExercises.find(e => e.name === exName);
      if (ex) {
        const s = state.settings;
        if (s.restTimerAutoStart) {
          const restTime = quickSessionActive === '5min' ? 0 : quickSessionActive === '10min' ? 20 : quickSessionActive === '15min' ? 30 : getRestTime(ex);
          if (restTime > 0) {
            const setsArr = updated[exName];
            const allSetsDone = setsArr.every(Boolean);
            setActiveTimerExercise(exName);
            setActiveTimerSeconds(restTime);
            setActiveTimerIsLastSet(allSetsDone);
            setTimerKey(k => k + 1);
            setReadyExercises(prev => { const n = new Set(prev); n.delete(exName); return n; });
          }
        }
      }
    }
    
    setCompletedSets(updated);

    // Save progress mid-workout
    patchState(s => {
      const existingLogIdx = s.workoutLogs.findIndex(l => l.date === today);
      if (existingLogIdx >= 0) {
        s.workoutLogs[existingLogIdx].completedSets = updated;
      } else {
        s.workoutLogs.push({
          date: today,
          type: todayType as 'A' | 'B' | 'C',
          completedSets: updated,
          completedAt: '',
          partial: true
        });
      }
    });
  }, [activeExercises, today, todayType, quickSessionActive, state.settings, getRestTime, completedSets]);

  const handleInlineTimerComplete = useCallback((exName: string, isLastSet: boolean) => {
    setActiveTimerExercise(null);
    const s = state.settings;
    if (s.restTimerReadyBadge) {
      setReadyExercises(prev => new Set(prev).add(exName));
    }
    if (isLastSet) {
      setCompletedExercises(prev => new Set(prev).add(exName));
      // Find next exercise and pulse it
    }
  }, [state.settings]);

  const completionStats = useMemo(() => {
    let totalSets = 0;
    let doneSets = 0;
    const exerciseStats = activeExercises.map(ex => {
      const sets = completedSets[ex.name] || [];
      const completed = sets.filter(Boolean).length;
      totalSets += sets.length;
      doneSets += completed;
      return { name: ex.name, completed, total: sets.length };
    });
    const pct = totalSets === 0 ? 0 : Math.round((doneSets / totalSets) * 100);
    return { exerciseStats, pct, totalSets, doneSets };
  }, [activeExercises, completedSets]);

  const allDone = completionStats.pct === 100;
  const nothingDone = completionStats.doneSets === 0;

  const doCompleteWorkout = (force = false) => {
    if (!allDone && !force && !nothingDone) {
      setShowPartialPopup(true);
      return;
    }
    if (strictMode && !allDone && !quickSessionActive) return;

    if (quickSessionActive) {
      const endTime = new Date().toISOString();
      const durationSeconds = activeWorkoutStartTimestamp.current ? Math.round((Date.now() - activeWorkoutStartTimestamp.current) / 1000) : 0;
      const timeStr = durationSeconds > 60 ? `${Math.floor(durationSeconds/60)}m ${durationSeconds%60}s` : `${durationSeconds}s`;
      
      const xpMap = { '5min': 25, '10min': 25, '15min': 25, 'desk': 12 };
      const xp = xpMap[quickSessionActive];

      patchState(s => {
        s.quickSessions.push({ date: today, type: quickSessionActive, xpEarned: xp, completedAt: endTime });
        if (ft.xpSystem) s.xp = (s.xp || 0) + xp;
        
        s.workoutLogs = s.workoutLogs.filter(l => l.date !== today);
        s.workoutLogs.push({
          date: today, type: todayType as 'A' | 'B' | 'C', completedSets,
          completedAt: endTime, startedAt: workoutStartTime.current, durationSeconds,
          partial: true, completionPct: quickSessionActive === 'desk' ? 25 : 50,
        });
      });
      
      toast.success(`Quick session done in ${timeStr}! +${xp} XP 🏃`);
      if (ft.confetti) fireConfetti();
      setQuickSessionActive(null);
      return;
    }

    const isPartial = !allDone;
    const pct = completionStats.pct;
    const xpEarned = ft.xpSystem ? Math.round((pct / 100) * 50 / 5) * 5 : 0;
    const endTime = new Date().toISOString();
    const durationSeconds = activeWorkoutStartTimestamp.current ? Math.round((Date.now() - activeWorkoutStartTimestamp.current) / 1000) : 0;
    const timeStr = durationSeconds > 60 ? `${Math.floor(durationSeconds/60)}m ${durationSeconds%60}s` : `${durationSeconds}s`;
    const intensity = calculateWorkoutIntensity(
      { date: today, type: todayType as 'A' | 'B' | 'C', completedSets, completedAt: endTime },
      activeExercises
    );

    patchState(s => {
      s.workoutLogs = s.workoutLogs.filter(l => l.date !== today);
      s.workoutLogs.push({
        date: today, type: todayType as 'A' | 'B' | 'C', completedSets,
        completedAt: endTime, startedAt: workoutStartTime.current, durationSeconds,
        intensityScore: intensity,
        partial: isPartial, completionPct: pct,
      });
      if (ft.xpSystem) s.xp = (s.xp || 0) + xpEarned;
      if (ft.badges) {
        const { state: updated, newBadges } = checkAndAwardBadges(s);
        Object.assign(s, { badges: updated.badges });
        if (newBadges.length > 0 && ft.confetti) {
          fireConfetti();
          newBadges.forEach(name => toast.success(`🏅 Badge earned: ${name}!`));
        }
      }
    });

    if (isPartial) toast.success(`Workout logged in ${timeStr} (${pct}%) — ${xpEarned} XP earned 💪`);
    else toast.success(`Workout completed in ${timeStr}! 💪`);
    if (ft.confetti && allDone) fireConfetti();
    setShowPartialPopup(false);
    if (ft.adaptiveDifficulty && !isPartial) setShowDifficultyRating(true);
  };

  const skipPlannedWorkout = () => {
    handleInteraction();
    setHasSkippedToday(true);
    patchState(s => {
      s.workoutLogs = s.workoutLogs.filter(l => l.date !== today);
      s.workoutLogs.push({
        date: today,
        type: todayType as 'A' | 'B' | 'C',
        completedSets: {},
        completedAt: new Date().toISOString(),
        partial: false,
        isSkipped: true
      });
    });
    toast.info("Planned workout skipped. Try a micro-workout instead!");
  };

  const rateDifficulty = (rating: 'Too Easy' | 'Just Right' | 'Too Hard') => {
    patchState(s => {
      s.difficultyRatings.push({ date: today, workoutType: todayType as 'A' | 'B' | 'C', rating });
    });
    setShowDifficultyRating(false);
    toast.success('Rating saved!');
  };

  const handleQuickSession = (type: '5min' | '10min' | '15min' | 'desk') => {
    setQuickSessionActive(type);
    setShowQuickSession(false);
    const exs = type === 'desk' ? deskExercises : (workout.exercises.filter(ex => ex.enabled).slice(0, type === '15min' ? 6 : 4));
    const sets: Record<string, boolean[]> = {};
    exs.forEach(ex => { sets[ex.name] = Array(type === '5min' ? 1 : 2).fill(false); });
    setCompletedSets(sets);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (isRest && !quickSessionActive) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden mesh-gradient">
        {/* Background Mask */}
        <div className="absolute top-0 left-0 right-0 h-96 z-0">
          <img 
            src="/images/fitness_hero_bg.png" 
            alt="Rest" 
            className="w-full h-full object-cover hero-mask opacity-30 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/60 to-background" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center justify-center text-center px-5 pt-32"
        >
          <div className="w-24 h-24 rounded-full bg-secondary/50 backdrop-blur-xl flex items-center justify-center border border-white/5 shadow-2xl mb-8 animate-float">
            <span className="text-5xl">🚶</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-foreground">Rest Day</h1>
          <p className="text-muted-foreground mt-4 text-sm max-w-[280px] leading-relaxed uppercase tracking-widest font-bold">
            Passive recovery in progress
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2 max-w-[260px]">
            Your muscles grow during rest, not just the workout. Take it easy today.
          </p>
        </motion.div>

        {ft.quickSessions && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 px-5 max-w-lg mx-auto"
          >
            {showQuickSession ? (
              <QuickSessionSelector onSelect={handleQuickSession} onClose={() => setShowQuickSession(false)} deskModeEnabled={ft.deskMode} />
            ) : (
              <Button onClick={() => setShowQuickSession(true)} variant="outline" className="w-full h-14 font-black btn-press glass-card-premium border-primary/20 text-primary uppercase tracking-[0.2em] shadow-lg shadow-primary/5">
                <Zap className="w-5 h-5 mr-3 fill-current" /> Express Session
              </Button>
            )}
          </motion.div>
        )}
      </div>
    );
  }

  const getYoutubeUrl = (ex: Exercise) => ex.youtubeUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' proper form tutorial')}`;
  const getPR = (exName: string): PersonalRecord | undefined => state.personalRecords.find(pr => pr.exerciseName === exName);
  const hasOverloadSuggestion = (exName: string) => overloadSuggestions.some(s => s.exerciseName === exName);

  const buttonLabel = quickSessionActive
    ? "Complete Quick Session ⚡"
    : strictMode ? (allDone ? "COMPLETE WORKOUT 🎉" : "Complete all sets to finish")
    : allDone ? "COMPLETE WORKOUT 🎉" : nothingDone ? "Skip Today" : "FINISH & REVIEW";

  return (
    <div className="pb-32 relative">
      {/* Background Mask for Header */}
      <div className="absolute top-0 left-0 right-0 h-32 z-0">
        <img 
          src="/images/fitness_hero_bg.png" 
          alt="Workout" 
          className="w-full h-full object-cover hero-mask opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 to-background" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 px-5 pt-12 max-w-lg mx-auto"
      >
        {/* Sticky Controls */}
        <div className="sticky top-4 z-40 flex justify-end items-center gap-3 mb-4">
          <WorkoutMusic builtInBeatsEnabled={ft.builtInBeats} customPlaylists={state.settings.customPlaylists || []} />
          <WorkoutSessionTimer presets={state.settings.timerPresets} halfwayBeep={state.settings.timerHalfwayBeep} endBeep={state.settings.timerEndBeep} />
        </div>

        <motion.div variants={itemVariants} className="mb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-label text-primary mb-1">Session Protocol</p>
              <h1 className="text-[28px] font-bold leading-tight tracking-tight text-white uppercase">
                {quickSessionActive ? (quickSessionActive === 'desk' ? 'Desk' : `Quick ${quickSessionActive}`) : workout.title}
              </h1>
              <p className="text-sm font-bold text-white/50 mt-1 uppercase tracking-[0.1em]">
                {quickSessionActive ? 'Express Performance' : workout.subtitle}
              </p>
            </div>
            {difficultyLevel && !quickSessionActive && (
              <div className={`text-[12px] font-black px-4 py-2 rounded-xl shadow-2xl backdrop-blur-xl border border-white/10 uppercase tracking-widest ${
                difficultyLevel === 'Beast' ? 'bg-destructive/20 text-destructive border-destructive/20' :
                difficultyLevel === 'Advanced' ? 'bg-primary/20 text-primary border-primary/20' :
                difficultyLevel === 'Beginner' ? 'bg-warning/20 text-warning border-warning/20' :
                'bg-secondary text-muted-foreground'
              }`}>{difficultyLevel}</div>
            )}
          </div>
        </motion.div>

        {/* Skip & Quick Session UI */}
        {hasSkippedToday ? (
          <motion.div variants={itemVariants} className="mb-4">
            <div className="glass-card-premium p-4 text-center border-warning/30 bg-warning/5">
              <h3 className="text-warning font-bold mb-2">Workout Skipped</h3>
              <p className="text-xs text-white/60 mb-4">Since you skipped today's planned workout, try a micro-workout to keep the momentum going!</p>
              {showQuickSession ? (
                <QuickSessionSelector onSelect={handleQuickSession} onClose={() => setShowQuickSession(false)} deskModeEnabled={ft.deskMode} />
              ) : (
                <button onClick={() => setShowQuickSession(true)} className="w-full glass-card px-3.5 py-3 text-xs text-white font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
                  <Zap className="w-4 h-4 text-warning" /> View Micro-Workouts
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            {ft.quickSessions && !quickSessionActive && !alreadyDone && (
              <motion.div variants={itemVariants} className="mb-3 flex gap-2">
                {showQuickSession ? (
                  <div className="w-full"><QuickSessionSelector onSelect={handleQuickSession} onClose={() => setShowQuickSession(false)} deskModeEnabled={ft.deskMode} /></div>
                ) : (
                  <>
                    <button onClick={() => setShowQuickSession(true)} className="flex-1 glass-card-premium px-3.5 py-2.5 text-[12px] text-primary font-bold flex justify-center items-center gap-2 hover:border-primary/50 transition-all btn-press shadow-xl">
                      <Zap className="w-3.5 h-3.5 fill-current" /> Express Session
                    </button>
                    <button onClick={skipPlannedWorkout} className="flex-1 glass-card px-3.5 py-2.5 text-[12px] text-white/50 font-bold flex justify-center items-center gap-2 hover:text-white hover:bg-white/5 transition-all btn-press border-white/10">
                      Skip Planned Workout
                    </button>
                  </>
                )}
              </motion.div>
            )}

            {alreadyDone && !quickSessionActive && (
              <motion.div variants={itemVariants} className="glass-card p-3 mb-3 text-center text-xs text-primary font-bold glow-green border-primary/20">
                <CheckCircle2 className="w-4 h-4 inline mr-2" /> Session Logged Today
              </motion.div>
            )}
          </>
        )}

        {!hasSkippedToday && (
          <>
            <motion.div variants={itemVariants} className="glass-card-premium p-2.5 mb-2.5 relative overflow-hidden group">
              <div className="flex items-center gap-2 mb-1.5">
                <Wind className="w-3.5 h-3.5 text-primary" />
                <p className="section-label">Preparation</p>
              </div>
          {workout.warmup.map((w, i) => (
            <p key={i} className="text-sm text-foreground/80 py-0.5 font-medium leading-relaxed flex items-start gap-2">
              <span className="text-primary/40 text-[12px] mt-1 font-black">{i + 1}</span>
              {w}
            </p>
          ))}
          <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wind className="w-24 h-24 text-primary" />
          </div>
        </motion.div>

      <div className="mt-3 space-y-2">
        {activeExercises.map((ex, i) => {
          const pr = getPR(ex.name);
          const isSupersetPartner = activeExercises.some(e => e.supersetWith === ex.id);
          const hasSupersetLink = ft.supersetMode && (ex.supersetWith || isSupersetPartner);
          const setsArr = completedSets[ex.name] || [];
          const setsCompleted = setsArr.filter(Boolean).length;
          const hasOverload = hasOverloadSuggestion(ex.name);
          const allSetsDone = setsCompleted === setsArr.length && setsArr.length > 0;
          const setProgress = setsArr.length > 0 ? (setsCompleted / setsArr.length) * 100 : 0;
          const isTimerActive = activeTimerExercise === ex.name;
          const isReady = readyExercises.has(ex.name);
          const justCompleted = completedExercises.has(ex.name);
          const restTimeDisplay = quickSessionActive === '5min' ? 0 : quickSessionActive === '10min' ? 20 : quickSessionActive === '15min' ? 30 : getRestTime(ex);

          return (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-2xl p-2.5 relative overflow-hidden card-press ${
                justCompleted ? 'bg-primary/8 border border-primary/20 shadow-[0_0_15px_hsl(var(--primary)/0.15)]' :
                allSetsDone ? 'bg-primary/8 border border-primary/20' : 'glass-card'
              } ${hasSupersetLink ? 'border-primary/20' : ''}`}
              style={{ borderLeft: '3px solid hsl(153 100% 50% / 0.3)' }}
            >
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-[16px]">{ex.name}</p>
                    {allSetsDone && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    {hasOverload && <ArrowUp className="w-3.5 h-3.5 text-primary" />}
                    {ft.youtubeLinks && (
                      <a href={getYoutubeUrl(ex)} target="_blank" rel="noopener noreferrer" className="p-0.5 rounded hover:bg-destructive/10 transition-colors">
                        <svg className="w-4 h-4 text-destructive" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </a>
                    )}
                    {(ft as any).aiFormCheck && (
                      <button onClick={() => setFormCheckExercise(ex)} className="p-0.5 rounded hover:bg-primary/10 transition-colors">
                        <Camera className="w-3.5 h-3.5 text-primary" />
                      </button>
                    )}
                    {ft.exerciseInstructions && ex.instructions && (
                      <button onClick={() => setInstructionEx(ex)} className="p-0.5 rounded hover:bg-secondary transition-colors">
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    )}
                    {newPR === ex.name && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-warning text-sm">
                        <Trophy className="w-4 h-4 inline" /> New PR!
                      </motion.span>
                    )}
                  </div>
                  <p className="text-sm text-primary font-medium mt-0">{setsArr.length} sets × {ex.reps}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[11px] text-muted-foreground">{restTimeDisplay}s rest</p>
                    <span className={`text-[11px] font-semibold px-2 py-0 rounded-full ${
                      allSetsDone ? 'bg-primary/20 text-primary' : setsCompleted > 0 ? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground'
                    }`}>{setsCompleted}/{setsArr.length}</span>
                  </div>
                  {ft.personalRecords && pr && (
                    <p className="text-[11px] text-primary mt-0.5">🏆 PR: {pr.bestReps} sets ({pr.date})</p>
                  )}
                  {hasSupersetLink && (
                    <p className="text-[11px] text-primary mt-0.5 flex items-center gap-1"><Link2 className="w-3 h-3" /> Superset</p>
                  )}
                </div>
              </div>
              <div className="flex gap-1.5 items-center">
                {setsArr.map((_, si) => (
                  <div key={si} className="flex flex-col items-center gap-0.5">
                    <button onClick={() => toggleSet(ex.name, si)} className="transition-transform active:scale-90 btn-press">
                      {completedSets[ex.name]?.[si] ? (
                        <CheckCircle2 className="w-7 h-7 text-primary" />
                      ) : (
                        <Circle className={`w-7 h-7 ${isReady && !completedSets[ex.name]?.[si] ? 'text-primary/50' : 'text-muted-foreground/30'}`} />
                      )}
                    </button>
                    {isReady && !completedSets[ex.name]?.[si] && setsCompleted === si && (
                      <span className="text-[11px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">READY</span>
                    )}
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              <div className="w-full h-1 bg-secondary/50 rounded-full mt-1.5 overflow-hidden">
                <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${setProgress}%` }} transition={{ duration: 0.3 }} />
              </div>

              {/* Inline Rest Timer */}
              <AnimatePresence>
                {isTimerActive && state.settings.restTimerInline && (
                  <InlineRestTimer
                    key={timerKey}
                    seconds={activeTimerSeconds}
                    isLastSet={activeTimerIsLastSet}
                    colorTransition={state.settings.restTimerColorTransition}
                    audioEnabled={ft.audioBeepTimer}
                    onComplete={() => handleInlineTimerComplete(ex.name, activeTimerIsLastSet)}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {ft.workoutIntensity && !quickSessionActive && (
        <div className="glass-card p-4 mt-4 text-center">
          <p className="section-label">Intensity Score</p>
          <p className="text-3xl font-bold stat-number mt-1">
            {calculateWorkoutIntensity({ date: today, type: todayType as 'A' | 'B' | 'C', completedSets, completedAt: '' }, activeExercises)}
          </p>
        </div>
      )}

      {/* Coach HUD - Proactive Prompts */}
      <AnimatePresence>
        {!allDone && !nothingDone && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-50 pointer-events-none"
          >
            <div className="glass-cockpit p-3 light-bleed light-bleed-primary max-w-sm mx-auto shadow-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 animate-pulse border border-primary/30">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Tactical_Cue</p>
                <p className="text-[12px] font-bold text-white/90 leading-tight italic">
                  {completionStats.pct < 30 ? "Sync kinetic chain. Focus on slow eccentric phase." :
                   completionStats.pct < 70 ? "Volume phase complete. Maintain neural drive." :
                   "Final protocol. Max effort required."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => handleInteraction(() => {
          if (nothingDone && !strictMode && !quickSessionActive) {
            skipPlannedWorkout();
          } else {
            doCompleteWorkout();
          }
        })}
        disabled={strictMode && !allDone && !quickSessionActive}
        className={`w-full mt-6 h-14 text-[14px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all btn-press shadow-2xl ${
          allDone || quickSessionActive
            ? 'bg-primary text-primary-foreground shadow-primary/20'
            : nothingDone
              ? 'bg-white/5 border border-white/10 text-white/40'
              : 'bg-primary text-primary-foreground shadow-primary/20'
        } ${strictMode && !allDone && !quickSessionActive ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {buttonLabel}
      </button>
          </>
        )}

      {/* Share Card */}
      {alreadyDone && !quickSessionActive && (
        <WorkoutShareCard
          workoutName={workout.title + ' — ' + workout.subtitle}
          setsCompleted={completionStats.doneSets}
          totalSets={completionStats.totalSets}
          intensityScore={calculateWorkoutIntensity({ date: today, type: todayType as 'A' | 'B' | 'C', completedSets, completedAt: '' }, activeExercises)}
          streak={state.workoutLogs.length}
          date={today}
          xp={state.xp}
          completionPct={completionStats.pct}
        />
      )}

      <PartialCompletionPopup
        open={showPartialPopup}
        onClose={() => setShowPartialPopup(false)}
        onConfirm={() => doCompleteWorkout(true)}
        exerciseStats={completionStats.exerciseStats}
        completionPct={completionStats.pct}
      />

      {/* Difficulty Rating Dialog */}
      <Dialog open={showDifficultyRating} onOpenChange={setShowDifficultyRating}>
        <DialogContent className="accent-border-top">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl">How was that workout?</DialogTitle>
            <DialogDescription>Your rating helps adjust future difficulty</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            {(['Too Easy', 'Just Right', 'Too Hard'] as const).map(r => (
              <button key={r} onClick={() => rateDifficulty(r)} className="glass-card p-5 text-center hover:border-primary/50 transition-colors card-press">
                <span className="text-3xl">{r === 'Too Easy' ? '😎' : r === 'Just Right' ? '💪' : '😤'}</span>
                <p className="text-xs mt-2 font-medium">{r}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Exercise Instructions Dialog */}
      <Dialog open={!!instructionEx} onOpenChange={() => setInstructionEx(null)}>
        <DialogContent className="accent-border-top">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl">{instructionEx?.name}</DialogTitle>
            <DialogDescription>How to perform this exercise</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-relaxed">{instructionEx?.instructions}</p>
          {ft.youtubeLinks && instructionEx && (
            <a href={getYoutubeUrl(instructionEx)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-destructive hover:underline mt-2">
              <ExternalLink className="w-4 h-4" /> Watch on YouTube
            </a>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Form Check */}
      <AnimatePresence>
        {formCheckExercise && (
          <AIFormCheck
            exerciseName={formCheckExercise.name}
            targetSets={formCheckExercise.sets}
            targetReps={formCheckExercise.reps}
            audioEnabled={(ft as any).formCheckAudio !== false}
            voiceEnabled={(ft as any).formCheckVoice !== false}
            bannersEnabled={(ft as any).formCheckBanners !== false}
            sensitivity={(state.settings as any).formCheckSensitivity || 'Normal'}
            onClose={() => setFormCheckExercise(null)}
            onComplete={(summary, setsDone) => {
              setFormCheckExercise(null);
              toast.success(`${summary.totalReps} reps — ${summary.formScore}% form score`);
              
              if (formCheckExercise) {
                const exName = formCheckExercise.name;
                const updated = { ...completedSets };
                const currentSets = [...(completedSets[exName] || [])];
                for (let i = 0; i < setsDone; i++) {
                  currentSets[i] = true;
                }
                updated[exName] = currentSets;
                setCompletedSets(updated);

                // Save to local storage
                const s = loadState();
                const existingLogIdx = s.workoutLogs.findIndex(l => l.date === today);
                if (existingLogIdx >= 0) {
                  s.workoutLogs[existingLogIdx].completedSets = updated;
                } else {
                  s.workoutLogs.push({
                    date: today,
                    type: todayType as 'A' | 'B' | 'C',
                    completedSets: updated,
                    completedAt: '',
                    partial: true
                  });
                }
                saveState(s);
              }
            }}
          />
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
}
