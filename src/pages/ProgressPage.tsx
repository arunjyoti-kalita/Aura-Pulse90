import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { loadState, patchState, useSyncState, calculateBodyFat, getMonthlyGrade, generateWeeklySummary, getWeekNumber, checkAndAwardBadges, getWeeklyMuscleVolume, estimateStrengthScore, getMindfulnessStreak, calculateRecoveryScore, getTodayWorkoutType, getToday, formatDate } from "@/lib/store";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { toast } from "sonner";
import { fireConfetti } from "@/lib/confetti";
import MuscleHeatMap from "@/components/MuscleHeatMap";
import { Camera, Zap, Wind, Trophy, Database, ChevronRight, History, TrendingUp, Activity } from "lucide-react";
import { playClick, hapticPulse } from "@/lib/audio";

export default function ProgressPage() {
  const [state, setState] = useSyncState();
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [pushups, setPushups] = useState("");
  const [chest, setChest] = useState("");
  const [leftArm, setLeftArm] = useState("");
  const [rightArm, setRightArm] = useState("");
  const [leftThigh, setLeftThigh] = useState("");
  const [rightThigh, setRightThigh] = useState("");
  const [hips, setHips] = useState("");
  const ft = state.settings.featureToggles;
  const week = getWeekNumber(state.startDate);

  const handleInteraction = (cb?: () => void) => {
    playClick();
    hapticPulse('light');
    if (cb) cb();
  };

  // Performance Matrix Data
  const performanceData = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const ds = formatDate(d);
      
      const workout = state.workoutLogs.find(l => l.date === ds);
      const sleep = state.sleepLogs.find(l => l.date === ds);
      const rec = calculateRecoveryScore(state, ds);
      
      return {
        date: ds.slice(5),
        recovery: rec.score,
        intensity: workout?.intensityScore || 0,
        sleep: (sleep?.quality || 0) * 10
      };
    });
    return last14Days;
  }, [state]);

  const chartData = useMemo(() => {
    return state.progressEntries
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(e => ({ date: e.date.slice(5), weight: e.weight, waist: e.waist }));
  }, [state.progressEntries]);

  const bodyFat = useMemo(() => {
    if (!ft.bodyFatEstimator || !state.currentWeight || !state.currentWaist || !state.settings.height) return null;
    return calculateBodyFat(state.currentWeight, state.currentWaist, state.settings.height);
  }, [state, ft.bodyFatEstimator]);

  const monthlyGrade = useMemo(() => ft.monthlyReportCard ? getMonthlyGrade(state) : null, [state, ft.monthlyReportCard]);
  const latestSummary = useMemo(() => ft.weeklySummary ? generateWeeklySummary(state, week) : null, [state, week, ft.weeklySummary]);
  const muscleVolume = useMemo(() => ft.muscleHeatMap ? getWeeklyMuscleVolume(state) : {}, [state, ft.muscleHeatMap]);

  const strengthScore = useMemo(() => {
    if (!ft.strengthEstimator) return null;
    const latestPushups = state.progressEntries.filter(e => e.pushups).sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!latestPushups?.pushups) return null;
    return estimateStrengthScore(latestPushups.pushups);
  }, [state.progressEntries, ft.strengthEstimator]);

  const logProgress = () => {
    handleInteraction();
    const today = getToday();
    patchState(s => {
      const entry = {
        date: today,
        weight: weight ? parseFloat(weight) : null,
        waist: waist ? parseFloat(waist) : null,
        pushups: pushups ? parseInt(pushups) : null,
      };
      s.progressEntries = s.progressEntries.filter(e => e.date !== today);
      s.progressEntries.push(entry);
      if (entry.weight) s.currentWeight = entry.weight;
      if (entry.waist) s.currentWaist = entry.waist;

      if (ft.bodyMeasurements && (chest || leftArm || rightArm || leftThigh || rightThigh || hips)) {
        s.bodyMeasurements = s.bodyMeasurements.filter(m => m.date !== today);
        s.bodyMeasurements.push({
          date: today, chest: parseFloat(chest), leftArm: parseFloat(leftArm), rightArm: parseFloat(rightArm),
          leftThigh: parseFloat(leftThigh), rightThigh: parseFloat(rightThigh), hips: parseFloat(hips)
        });
      }

      if (ft.xpSystem && (entry.weight || entry.waist)) s.xp = (s.xp || 0) + 20;
    });
    setWeight(""); setWaist(""); setPushups("");
    setChest(""); setLeftArm(""); setRightArm(""); setLeftThigh(""); setRightThigh(""); setHips("");
    toast.success("Logged.");
  };

  const handlePhotoUpload = (type: 'front' | 'side') => {
    handleInteraction();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const today = getToday();
        patchState(s => {
          let entry = s.progressEntries.find(e => e.date === today);
          if (!entry) {
            entry = { date: today, weight: null, waist: null, pushups: null };
            s.progressEntries.push(entry);
          }
          if (type === 'front') entry.photoFront = reader.result as string;
          else entry.photoSide = reader.result as string;
        });
        toast.success("Photo saved.");
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto relative z-10">
      {/* Header - Minimalist */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black italic text-white tracking-tight leading-none uppercase">Evolution Log</h1>
          <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Biometric History</p>
        </div>
        <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary">
          WEEK {week}
        </div>
      </div>

      {/* Performance Matrix - Advanced Telemetry */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-cockpit p-4 mb-4 light-bleed"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Performance Matrix</p>
          <div className="flex gap-2 text-[8px] font-black uppercase text-white/30">
            <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-primary" /> Rec</span>
            <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-blue-400" /> Sleep</span>
          </div>
        </div>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                itemStyle={{ padding: '0px' }}
              />
              <Bar dataKey="intensity" fill="rgba(34,197,94,0.1)" radius={[2, 2, 0, 0]} />
              <Line type="monotone" dataKey="recovery" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sleep" stroke="hsl(210 80% 55%)" strokeWidth={1} strokeDasharray="4 4" dot={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Main Stats - Side by Side Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="glass-card-premium p-2 text-center border-white/5 light-bleed">
          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-0.5">BF%</p>
          <p className="text-sm font-black text-primary leading-tight">{bodyFat ?? '—'}%</p>
        </div>
        <div className="glass-card-premium p-2 text-center border-white/5 light-bleed">
          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-0.5">Strength</p>
          <p className="text-sm font-black text-white leading-tight">{strengthScore?.score ?? '—'}</p>
        </div>
        <div className="glass-card-premium p-2 text-center border-white/5 light-bleed">
          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-0.5">Grade</p>
          <p className="text-sm font-black text-blue-400 leading-tight">{monthlyGrade?.grade ?? '—'}</p>
        </div>
      </div>

      {/* Data Entry - High Density Single Row */}
      <div className="glass-cockpit p-4 mb-4 light-bleed">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">Quick Log</p>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="space-y-1">
            <Input value={weight} onChange={e => setWeight(e.target.value)} type="number" placeholder="Weight" className="h-9 bg-white/5 border-white/10 rounded-lg text-xs font-bold px-2 focus:border-primary/50" />
          </div>
          <div className="space-y-1">
            <Input value={waist} onChange={e => setWaist(e.target.value)} type="number" placeholder="Waist" className="h-9 bg-white/5 border-white/10 rounded-lg text-xs font-bold px-2 focus:border-primary/50" />
          </div>
          <div className="space-y-1">
            <Input value={pushups} onChange={e => setPushups(e.target.value)} type="number" placeholder="Reps" className="h-9 bg-white/5 border-white/10 rounded-lg text-xs font-bold px-2 focus:border-primary/50" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={logProgress} className="flex-1 h-9 font-black text-[9px] uppercase tracking-widest rounded-lg btn-press">Log Entry</Button>
          <Button variant="outline" onClick={() => handlePhotoUpload('front')} className="w-9 h-9 p-0 rounded-lg bg-white/5 border-white/10 btn-press">
            <Camera className="w-3.5 h-3.5 text-white/40" />
          </Button>
        </div>
      </div>

      {/* Heatmap */}
      {ft.muscleHeatMap && (
        <div className="mb-6">
          <MuscleHeatMap volume={muscleVolume} recommended={state.settings.recommendedSets} />
        </div>
      )}

      {/* History Grid - Side by Side (2 columns) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 mb-2">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Log History</p>
          <History className="w-3 h-3 text-white/10" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[...state.progressEntries].reverse().slice(0, 10).map((e) => {
            const workout = state.workoutLogs.find(l => l.date === e.date);
            const isRest = getTodayWorkoutType(state) === 'Rest'; // Simplified for history
            const status = workout ? (workout.partial ? 'sad' : 'fire') : (isRest ? 'chill' : 'missed');

            return (
              <div key={e.date} className="glass-card p-3 border-white/5 group hover:border-primary/20 transition-all relative overflow-hidden card-press" onClick={() => handleInteraction()}>
                <div className="absolute -top-1 -right-1 opacity-20 group-hover:opacity-100 transition-opacity">
                  {status === 'fire' && <span className="text-[12px]">🔥</span>}
                  {status === 'sad' && <span className="text-[12px]">😞</span>}
                  {status === 'chill' && <span className="text-[12px]">🧘</span>}
                  {status === 'missed' && <span className="text-[12px]">⭕</span>}
                </div>
                <p className="text-[8px] font-black text-white/40 group-hover:text-primary transition-colors">{e.date}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {e.weight && <span className="text-[7px] font-bold text-white bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-tighter">{e.weight}kg</span>}
                  {e.waist && <span className="text-[7px] font-bold text-info bg-info/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">{e.waist}cm</span>}
                  {e.pushups && <span className="text-[7px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">{e.pushups}R</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
