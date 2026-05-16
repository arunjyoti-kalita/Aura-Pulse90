import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Scale, Ruler, Dumbbell, ChevronRight, Lightbulb, AlertTriangle, Trophy, Zap, Wind, Droplets, CloudDownload, X, CheckCircle2, Sparkles, MessageSquare, History, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import ProgressRing from "@/components/ProgressRing";
import WaterBottle from "@/components/WaterBottle";
import BodySilhouette from "@/components/BodySilhouette";
import SleepCheckIn from "@/components/SleepCheckIn";
import StressCheckIn from "@/components/StressCheckIn";
import RecoveryScoreCard from "@/components/RecoveryScoreCard";
import WellnessScoreCard from "@/components/WellnessScoreCard";
import { loadState, saveState, useSyncState, getDayNumber, getWeekNumber, getTodayWorkoutType, getStreak, getWeekWorkoutCount, getConsecutiveWorkoutDays, getWeeklyChallenge, getLevel, getDietLog, getToday, calculateRecoveryScore, calculateWellnessScore, calculateSleepHours, getMindfulnessStreak, calculateSkippedDays } from "@/lib/store";
import { getDailyQuote, getDailyTip } from "@/lib/quotes";
import { shouldShowBackupReminder, dismissBackupReminder, consumeRestoreVerificationNotice, ensureWeeklyRestorePoint, type RestoreVerificationNotice } from "@/lib/backup";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { DietLog } from "@/lib/store";

import { playClick, hapticPulse } from "@/lib/audio";

export default function Dashboard() {
  const [state, setState] = useSyncState();
  const navigate = useNavigate();
  const [, setTick] = useState(0);

  const handleInteraction = useCallback((cb?: () => void) => {
    playClick();
    hapticPulse('light');
    if (cb) cb();
  }, []);
  const skippedDays = calculateSkippedDays(state.startDate, state.workoutLogs, state.settings.weeklySchedule);
  const day = getDayNumber(state.startDate, skippedDays);
  const week = getWeekNumber(state.startDate, skippedDays);
  const todayType = getTodayWorkoutType(state);
  const streak = getStreak(state.workoutLogs);
  const weekDone = getWeekWorkoutCount(state.startDate, state.workoutLogs);
  const ft = state.settings.featureToggles;
  const consecutiveDays = getConsecutiveWorkoutDays(state.workoutLogs);
  const challenge = getWeeklyChallenge(week);
  const level = getLevel(state.xp);
  const today = getToday();

  // If the user already logged a workout today, show that — not the scheduled type.
  // This keeps the Dashboard in sync with the Timeline.
  const todayLog = state.workoutLogs.find(l => l.date === today && !l.isSkipped);
  const effectiveType: 'A' | 'B' | 'C' | 'Rest' = todayLog ? todayLog.type : todayType;

  const workoutLabel = effectiveType === 'Rest' ? '🚶 Rest Day' :
    state.settings.customWorkouts.find(w => w.type === effectiveType)?.subtitle || effectiveType;
  const workoutTitle = effectiveType === 'Rest' ? 'Rest Day' :
    state.settings.customWorkouts.find(w => w.type === effectiveType)?.title || `Day ${effectiveType}`;

  // Get greeting based on time
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // Why I Started dialog
  const [showWhyDialog, setShowWhyDialog] = useState(false);
  const [whyText, setWhyText] = useState(state.whyIStarted);

  useEffect(() => {
    if (ft.whyIStarted && day === 1 && !state.whyIStarted) setShowWhyDialog(true);
  }, []);

  const saveWhy = useCallback(() => {
    patchState(s => {
      s.whyIStarted = whyText;
    });
    setShowWhyDialog(false);
  }, [whyText]);

  // Mood check-in
  const [showMood, setShowMood] = useState(false);
  useEffect(() => {
    if (ft.moodCheckIn) {
      const dayOfWeek = new Date().getDay();
      if (dayOfWeek === 1 && state.lastMoodCheckDate !== today) setShowMood(true);
    }
  }, []);

  const logMood = useCallback((mood: 'Motivated' | 'Tired' | 'Stressed' | 'Strong' | 'Struggling') => {
    patchState(s => {
      s.moodEntries = s.moodEntries.filter(m => m.date !== today);
      s.moodEntries.push({ date: today, mood });
      s.lastMoodCheckDate = today;
    });
    setShowMood(false);
  }, [today]);

  // Milestone celebration
  const [showMilestone, setShowMilestone] = useState<{ title: string; description: string } | null>(null);
  useEffect(() => {
    if (!ft.milestoneCelebration) return;
    const milestone = state.settings.milestones.find(m => day >= m.day && m.week > state.lastMilestoneCelebrated);
    if (milestone) {
      setShowMilestone(milestone);
      patchState(s => {
        s.lastMilestoneCelebrated = milestone.week;
      });
    }
  }, []);

  // Water tracking
  const dietLog = useMemo(() => getDietLog(state.dietLogs, today, state.settings.meals), [state, today]);
  const addWater = useCallback(() => {
    patchState(s => {
      const log: DietLog = getDietLog(s.dietLogs, today, s.settings.meals);
      log.waterGlasses = Math.min(20, log.waterGlasses + 1);
      s.dietLogs = s.dietLogs.filter(d => d.date !== today);
      s.dietLogs.push(log);
    });
  }, [today]);

  // Sleep check-in
  const [showSleepCheckIn, setShowSleepCheckIn] = useState(false);
  useEffect(() => {
    if (ft.sleepTracking && state.lastSleepCheckDate !== today) setShowSleepCheckIn(true);
  }, []);

  const logSleep = useCallback((bedtime: string, wakeTime: string, quality: number) => {
    const hours = calculateSleepHours(bedtime, wakeTime);
    patchState(s => {
      s.sleepLogs = s.sleepLogs.filter(l => l.date !== today);
      s.sleepLogs.push({ date: today, bedtime, wakeTime, quality, hoursSlept: hours });
      s.lastSleepCheckDate = today;
    });
    setShowSleepCheckIn(false);
  }, [today]);

  // Stress check-in
  const [showStress, setShowStress] = useState(false);
  useEffect(() => {
    if (ft.stressCheckIn && state.lastStressCheckDate !== today) setShowStress(true);
  }, []);

  const logStress = useCallback((level: 'Low' | 'Medium' | 'High') => {
    patchState(s => {
      s.stressEntries = s.stressEntries.filter(e => e.date !== today);
      s.stressEntries.push({ date: today, level });
      s.lastStressCheckDate = today;
    });
    setShowStress(false);
  }, [today]);

  // Recovery & Wellness scores
  const recovery = useMemo(() => ft.recoveryScore ? calculateRecoveryScore(state, today) : null, [state, today, ft.recoveryScore]);
  const wellness = useMemo(() => ft.wellnessScore ? calculateWellnessScore(state, today) : null, [state, today, ft.wellnessScore]);

  // Mindfulness streak
  const mindfulStreak = useMemo(() => ft.mindfulnessTracker ? getMindfulnessStreak(state) : 0, [state, ft.mindfulnessTracker]);

  // Smart rest detection
  const showSmartRest = useMemo(() => {
    if (!ft.smartRestDetection) return false;
    const recent = state.moodEntries.slice(-2);
    if (recent.length < 2) return false;
    const lowMoods = ['Tired', 'Stressed', 'Struggling'];
    return recent.every(m => lowMoods.includes(m.mood));
  }, [state.moodEntries, ft.smartRestDetection]);

  // High stress warning
  const showStressWarning = useMemo(() => {
    if (!ft.stressCheckIn) return false;
    const recent = state.stressEntries.slice(-3);
    return recent.length >= 3 && recent.every(s => s.level === 'High');
  }, [state.stressEntries, ft.stressCheckIn]);

  // Affirmation
  const dailyAffirmation = useMemo(() => {
    if (!ft.affirmations || !state.settings.customAffirmations.length) return null;
    const idx = day % state.settings.customAffirmations.length;
    return state.settings.customAffirmations[idx];
  }, [ft.affirmations, day, state.settings.customAffirmations]);

  // Rest day activity logging
  const [showRestLog, setShowRestLog] = useState(false);
  const isRestDay = todayType === 'Rest';
  const hasRestLog = state.restDayLogs.some(r => r.date === today);

  const logRestDay = useCallback((activity: 'Full Rest' | 'Light Walk' | 'Stretching' | 'Yoga' | 'Other') => {
    patchState(s => {
      s.restDayLogs = s.restDayLogs.filter(r => r.date !== today);
      s.restDayLogs.push({ date: today, activity });
    });
    setShowRestLog(false);
  }, [today]);

  // Recent activity
  const recentWorkouts = useMemo(() => {
    return [...state.workoutLogs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  }, [state.workoutLogs]);
  // Backup reminder
  const [showBackupBanner, setShowBackupBanner] = useState(() => shouldShowBackupReminder());
  const [restoreNotice, setRestoreNotice] = useState<RestoreVerificationNotice | null>(null);

  useEffect(() => {
    setRestoreNotice(consumeRestoreVerificationNotice());
    void ensureWeeklyRestorePoint();
  }, []);


  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="bg-background relative overflow-x-hidden min-h-screen">
      {/* Floating Background Blobs */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-float pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] animate-float pointer-events-none" style={{ animationDelay: '-2s' }} />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-5 pt-12 pb-24 max-w-lg mx-auto relative z-10"
      >
        {/* Hero greeting */}
        <motion.div variants={itemVariants} className="mb-2">
          <p className="text-[28px] font-bold leading-tight text-foreground tracking-tight">
            {greeting},
          </p>
          <p className="text-[28px] font-bold leading-tight text-primary tracking-tight">
            Athlete
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="px-2 py-0.5 rounded-md bg-secondary/50 border border-white/5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Phase 1
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · Week {week}
            </p>
          </div>
        </motion.div>
        
        {showSleepCheckIn && (
          <motion.div variants={itemVariants} className="mb-4">
            <SleepCheckIn
              onSubmit={logSleep}
              onDismiss={() => setShowSleepCheckIn(false)}
            />
          </motion.div>
        )}

        {showStress && (
          <motion.div variants={itemVariants} className="mb-4">
            <StressCheckIn
              onSubmit={logStress}
              onDismiss={() => setShowStress(false)}
            />
          </motion.div>
        )}

        {restoreNotice && (
          <motion.div variants={itemVariants} className={`mt-4 rounded-2xl p-3 flex items-start gap-3 border ${restoreNotice.status === 'success' ? 'bg-primary/8 border-primary/20' : 'bg-secondary/40 border-border/60'}`}>
            {restoreNotice.status === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0" />
            )}
            <p className="text-xs text-foreground/80 flex-1">{restoreNotice.message}</p>
            <button onClick={() => setRestoreNotice(null)} className="p-1 rounded-lg hover:bg-secondary/50">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </motion.div>
        )}

        {/* Hero workout card with Image */}
        <motion.button
          variants={itemVariants}
          onClick={() => handleInteraction(() => todayType !== 'Rest' && navigate('/workout'))}
          className="w-full mt-2 rounded-[28px] h-40 relative overflow-hidden card-press group shadow-2xl light-bleed"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/fitness_hero_bg.png" 
              alt="Hero" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <p className="section-label text-white/70">Protocol</p>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{workoutTitle}</p>
            <p className="text-xs text-primary font-semibold mt-0.5 tracking-wide">{workoutLabel}</p>
            
            {todayType !== 'Rest' && (
              <div className="mt-4 flex items-center gap-2">
                <div className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-primary/20 flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                  CONTINUE JOURNEY
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}
          </div>
        </motion.button>

        {/* XP Bar - slim at top */}
        {ft.xpSystem && (
          <motion.div variants={itemVariants} className="mt-3 glass-card p-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground mb-2 px-1">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-primary"><Zap className="w-3.5 h-3.5" /> {state.xp} XP</span>
              <span className="uppercase tracking-wider">{level.name}</span>
            </div>
            <div className="w-full h-2 bg-secondary/50 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
                initial={{ width: 0 }} 
                animate={{ width: `${Math.min(100, (state.xp / (level.level === 4 ? 5000 : [500, 1500, 3000][level.level - 1])) * 100)}%` }} 
                transition={{ duration: 1.5, ease: "easeOut" }} 
              />
            </div>
          </motion.div>
        )}

        {/* Morning Check-ins */}
        {(showSleepCheckIn || showStress) && (
          <motion.div variants={itemVariants} className="mt-2.5 grid grid-cols-1 gap-2">
            {showSleepCheckIn && (
              <SleepCheckIn
                onSubmit={logSleep}
                onDismiss={() => setShowSleepCheckIn(false)}
                defaultBedtime={state.settings.targetBedtime}
                defaultWakeTime={state.settings.targetWakeTime}
              />
            )}
            {showStress && (
              <StressCheckIn
                onSubmit={logStress}
                onDismiss={() => setShowStress(false)}
              />
            )}
          </motion.div>
        )}

        {/* Proactive Coach Suggestion - Technical Terminal Style */}
        {ft.aiCoach && (
          <motion.div variants={itemVariants}
            className="mt-3 p-0.5 rounded-[24px] bg-gradient-to-br from-primary/20 via-transparent to-primary/10 light-bleed light-bleed-primary"
            onClick={() => handleInteraction(() => navigate('/coach'))}
          >
            <div className="rounded-[23px] glass-cockpit p-4 relative overflow-hidden group">
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-[0_0_20px_rgba(34,197,94,0.1)] group-hover:shadow-[0_0_30px_rgba(34,197,94,0.2)] transition-all">
                  <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">
                        MAX_COACH_V2.1
                      </p>
                      <span className="px-1.5 py-0.5 rounded-[4px] bg-primary/10 border border-primary/20 text-[7px] font-bold text-primary uppercase">Active</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-primary/30" />)}
                    </div>
                  </div>
                  <div className="font-mono text-[13px] text-foreground/90 leading-relaxed min-h-[3em]">
                    <span className="text-primary mr-1">&gt;</span>
                    {recovery && recovery.score < 50 
                      ? "CRITICAL RECOVERY DETECTED: Suggested protocol 'Yoga_Flow_04'. Postpone heavy lifts." 
                      : isRestDay 
                        ? "PASSIVE RECOVERY MODE: 15min Light_Walk identified as optimal." 
                        : streak >= 7 
                          ? "ELITE_STREAK_MAINTAINED: Kinetic energy is high. Priority: Overload sets." 
                          : "NEURAL_SYNC_COMPLETE: Sleep quality analyzed. Ready for Protocol A."}
                    <span className="inline-block w-1.5 h-3.5 bg-primary/50 ml-1 animate-pulse align-middle" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 text-[9px] text-primary font-black uppercase tracking-widest opacity-70">
                    <MessageSquare className="w-3 h-3" />
                    Enter Command Terminal
                  </div>
                </div>
              </div>
              {/* Scanline effect */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            </div>
          </motion.div>
        )}

        {/* Quick Stats - horizontal scroll */}
        <motion.div
          variants={itemVariants}
          className="flex gap-4 mt-3 overflow-x-auto pb-4 no-scrollbar -mx-5 px-5"
        >
          <div className="glass-card-premium p-2 min-w-[90px] text-center flex-shrink-0 card-press border-primary/10">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-1.5">
              <Flame className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <p className="text-2xl font-bold stat-number">{streak}</p>
            <p className="section-label mt-1">Days</p>
          </div>
          
          <div className="glass-card-premium p-2 min-w-[90px] text-center flex-shrink-0 card-press">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-1.5">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold stat-number">{state.currentWeight || "—"}</p>
            <p className="section-label mt-1">Weight</p>
          </div>

          <div className="glass-card-premium p-2 min-w-[90px] text-center flex-shrink-0 card-press">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-1.5">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold stat-number">{state.workoutLogs.length}</p>
            <p className="section-label mt-1">Sessions</p>
          </div>

          <div className="glass-card-premium p-2 min-w-[90px] text-center flex-shrink-0 card-press">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-1.5">
              <Ruler className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold stat-number">{state.currentWaist || "—"}</p>
            <p className="section-label mt-1">Waist</p>
          </div>
        </motion.div>

        {/* Recovery + Wellness Scores row */}
        {(recovery || wellness) && (
          <motion.div variants={itemVariants} className="flex gap-4 mt-2">
            {recovery && <div className="flex-1"><RecoveryScoreCard {...recovery} /></div>}
            {wellness && <div className="flex-1"><WellnessScoreCard score={wellness} /></div>}
          </motion.div>
        )}

        {/* Progress ring + Water + Body */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-3 gap-3 mt-3 items-center justify-center glass-card p-2"
        >
          <div className="flex justify-center">
            <ProgressRing progress={weekDone / 5} size={70} strokeWidth={6}>
              <div className="text-center">
                <p className="text-lg font-bold stat-number">{weekDone}<span className="text-muted-foreground text-xs">/5</span></p>
              </div>
            </ProgressRing>
          </div>

          {ft.hydrationBottle && (
            <div className="flex justify-center">
              <WaterBottle current={dietLog.waterGlasses} goal={state.settings.dailyWaterGoal} onAdd={addWater} />
            </div>
          )}

          {ft.bodySilhouette && (
            <div className="flex justify-center scale-90">
              <BodySilhouette startingWaist={state.settings.startingWaist} currentWaist={state.currentWaist} />
            </div>
          )}
        </motion.div>

        {/* Daily Insights Bento */}
        <div className="grid grid-cols-1 gap-2.5 mt-3">
          {ft.dailyQuote && (
            <motion.div variants={itemVariants} className="glass-card-premium p-2.5 relative overflow-hidden group">
              <div className="flex items-center gap-2 mb-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                <p className="section-label">Perspective</p>
              </div>
              <p className="text-sm font-medium text-foreground italic leading-relaxed relative z-10">
                "{getDailyQuote(day)}"
              </p>
              <div className="absolute -bottom-4 -right-4 text-primary/5 text-6xl font-serif">"</div>
            </motion.div>
          )}

          {ft.dailyTips && (
            <motion.div variants={itemVariants} className="glass-card-premium p-2.5 border-l-2 border-l-warning/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-warning/10 rounded-lg">
                  <Lightbulb className="w-3.5 h-3.5 text-warning" />
                </div>
                <div>
                  <p className="section-label text-warning/80">Growth Tip</p>
                  <p className="text-sm text-foreground mt-0.5 leading-relaxed font-medium">
                    {getDailyTip(week)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Weekly Challenge */}
        {ft.weeklyChallenge && (
          <motion.div variants={itemVariants} className="glass-card-premium p-2.5 mt-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy className="w-12 h-12 text-primary -rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <Trophy className="w-4 h-4 text-primary" />
                <p className="section-label text-primary">Active Challenge</p>
              </div>
              <p className="text-lg font-bold text-foreground">{challenge.title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{challenge.description}</p>
              <div className="mt-3 h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-1/3 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Breathe shortcut */}
        {ft.breathingModule && (
          <motion.button
            variants={itemVariants}
            onClick={() => navigate('/breathe')}
            className="w-full glass-card-premium p-2.5 mt-2 flex items-center gap-3 text-left card-press"
          >
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group-hover:rotate-12 transition-transform">
              <Wind className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground">Flow State</p>
                {ft.mindfulnessTracker && mindfulStreak > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-[9px] text-primary font-black uppercase">{mindfulStreak} Day Streak</span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Calm & Focus Training</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
          </motion.button>
        )}

        {/* Recent Activity */}
        {recentWorkouts.length > 0 && (
          <motion.div variants={itemVariants} className="mt-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="section-label">Log History</p>
              <button className="text-[10px] font-bold text-primary uppercase tracking-widest">View All</button>
            </div>
            <div className="space-y-2">
              {recentWorkouts.map(w => {
                const isRest = (w.type as any) === 'Rest' || w.isSkipped;
                const isMissed = w.completionPct < 30;
                const isPerfect = w.completionPct === 100;
                
                return (
                  <div key={w.date} className="glass-card-premium p-2.5 flex items-center gap-3 card-press border-white/5 bg-white/5">
                    <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center flex-shrink-0 border border-white/10">
                      {isRest ? (
                        <Wind className="w-4 h-4 text-cyan-400" />
                      ) : isMissed ? (
                        <AlertCircle className="w-4 h-4 text-warning" />
                      ) : (
                        <Flame className={`w-4 h-4 ${isPerfect ? 'text-primary' : 'text-orange-400'}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-white uppercase tracking-tight">
                        {isRest ? 'Passive Recovery' : `Tactical Protocol ${w.type}`}
                      </p>
                      <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">
                        {new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-black ${isPerfect ? 'text-primary' : 'text-white/60'}`}>{w.completionPct || 100}%</p>
                      {isPerfect && <p className="text-[7px] font-black text-primary uppercase tracking-widest mt-0.5">Verified</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

      {/* Why I Started Dialog */}
      <Dialog open={showWhyDialog} onOpenChange={setShowWhyDialog}>
        <DialogContent className="accent-border-top">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl">Why I Started</DialogTitle>
            <DialogDescription>Write a personal note about why you want to transform.</DialogDescription>
          </DialogHeader>
          <Textarea value={whyText} onChange={e => setWhyText(e.target.value)} placeholder="I started because..." rows={4} />
          <Button onClick={saveWhy} className="font-bold btn-press">Save My Why</Button>
        </DialogContent>
      </Dialog>

      {/* Mood Check-in Dialog */}
      <Dialog open={showMood} onOpenChange={setShowMood}>
        <DialogContent className="accent-border-top">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl">Weekly Mood Check-in</DialogTitle>
            <DialogDescription>How are you feeling this week?</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {(['Motivated', 'Tired', 'Stressed', 'Strong', 'Struggling'] as const).map(mood => (
              <button key={mood} onClick={() => logMood(mood)} className="glass-card p-4 text-center hover:border-primary/50 transition-colors card-press">
                <span className="text-3xl">{mood === 'Motivated' ? '🔥' : mood === 'Tired' ? '😴' : mood === 'Stressed' ? '😰' : mood === 'Strong' ? '💪' : '😔'}</span>
                <p className="text-xs mt-2 font-medium">{mood}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Milestone Celebration Dialog */}
      <Dialog open={!!showMilestone} onOpenChange={() => setShowMilestone(null)}>
        <DialogContent className="text-center accent-border-top">
          <div className="py-6">
            <span className="text-7xl">🏆</span>
            <h2 className="text-2xl font-bold mt-4 text-primary">{showMilestone?.title}</h2>
            <p className="text-muted-foreground mt-2">{showMilestone?.description}</p>
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="glass-card p-3">
                <p className="text-xl font-bold stat-number">{state.workoutLogs.length}</p>
                <p className="text-[10px] text-muted-foreground">Workouts</p>
              </div>
              <div className="glass-card p-3">
                <p className="text-xl font-bold stat-number">{streak}</p>
                <p className="text-[10px] text-muted-foreground">Streak</p>
              </div>
              <div className="glass-card p-3">
                <p className="text-xl font-bold stat-number">{state.xp}</p>
                <p className="text-[10px] text-muted-foreground">XP</p>
              </div>
            </div>
            <Button onClick={() => setShowMilestone(null)} className="mt-6 font-bold btn-press">Continue 💪</Button>
          </div>
        </DialogContent>
      </Dialog>

      </motion.div>
    </div>
  );
}
