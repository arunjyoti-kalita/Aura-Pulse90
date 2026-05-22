import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadState, useSyncState, getDayNumber, getDietLog, getWorkoutTypeByOrder, calculateSkippedDays, getToday } from "@/lib/store";
import { X, Coffee, Frown, Circle, Star, Shield, Flame, Zap, SkipForward } from "lucide-react";

type DayStatus = 'done' | 'partial' | 'skipped' | 'rest' | 'missed' | 'upcoming';

const PHASES = [
  { start: 1, end: 30, title: "Foundation", color: "text-blue-400", icon: Shield },
  { start: 31, end: 60, title: "Intensity", color: "text-orange-400", icon: Flame },
  { start: 61, end: 90, title: "Mastery", color: "text-primary", icon: Star },
];

// Workout type pill config
const TYPE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  A: { bg: 'bg-cyan-500/20', text: 'text-cyan-300', label: 'A' },
  B: { bg: 'bg-violet-500/20', text: 'text-violet-300', label: 'B' },
  C: { bg: 'bg-amber-500/20', text: 'text-amber-300', label: 'C' },
};

// Removed hardcoded isRestDay function to use store logic instead

export default function TimelinePage() {
  const [state] = useSyncState();
  const currentDay = useMemo(() => {
    const skipped = calculateSkippedDays(state.startDate, state.workoutLogs, state.settings.weeklySchedule);
    return getDayNumber(state.startDate, skipped);
  }, [state.startDate, state.workoutLogs, state.settings.weeklySchedule]);

  const milestones = state.settings.milestones;
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const days = useMemo(() => {
    const sched = state.settings.weeklySchedule;
    let skippedSoFar = 0;
    let completedSoFar = 0;
    let lastType: string | undefined = undefined;
    
    const startParts = state.startDate.split('-').map(Number);
    const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    const todayStr = getToday();

    return Array.from({ length: 90 }, (_, i) => {
      const calendarDayNum = i + 1;
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const ds = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      const effectiveDayNumber = calendarDayNum - skippedSoFar;
      const isRest = sched[(effectiveDayNumber - 1) % 7] === 'Rest';
      const log = state.workoutLogs.find(l => l.date === ds && !l.isSkipped);
      const isToday = ds === todayStr;
      const isFuture = new Date(ds.replace(/-/g, '/')) > new Date(new Date().setHours(0,0,0,0));

      const workoutType = log ? log.type : (isRest ? 'Rest' : getWorkoutTypeByOrder(completedSoFar, sched, lastType));

      let status: DayStatus;
      if (isFuture) status = 'upcoming';
      else if (state.workoutLogs.find(l => l.date === ds)?.isSkipped) status = 'skipped';
      else if (log) status = log.partial ? 'partial' : 'done';
      else if (isRest) status = 'rest';
      else status = 'missed';

      // Update counters for NEXT day
      if (log) {
        completedSoFar++;
        lastType = log.type;
      } else if (!isRest && !isFuture) {
        skippedSoFar++;
      } else if (!isRest && isFuture) {
        completedSoFar++;
        lastType = workoutType as string;
      }

      const dietLog = getDietLog(state.dietLogs, ds, state.settings.meals);

      return { dayNum: effectiveDayNumber, calendarDayNum, status, isToday, ds, log, dietLog, workoutType };
    });
  }, [state, currentDay]);

  const statusConfig: Record<DayStatus, { color: string; label: string; icon: any; iconColor: string }> = {
    done:     { color: 'bg-primary/20 border-primary/40',    label: 'Completed', icon: Flame,        iconColor: 'text-primary'  },
    partial:  { color: 'bg-warning/20 border-warning/40',    label: 'Partial',   icon: Zap,          iconColor: 'text-warning'  },
    skipped:  { color: 'bg-orange-500/20 border-orange-500/40', label: 'Skipped', icon: SkipForward,  iconColor: 'text-orange-400' },
    rest:     { color: 'bg-blue-500/20 border-blue-500/40',  label: 'Rest',      icon: Coffee,       iconColor: 'text-blue-400' },
    missed:   { color: 'bg-red-500/20 border-red-500/40',    label: 'Missed',    icon: Frown,        iconColor: 'text-red-400'  },
    upcoming: { color: 'bg-white/5 border-white/5',          label: 'Future',    icon: Circle,       iconColor: 'text-white/10' },
  };

  return (
    <div className="min-h-screen pb-20 px-3 pt-6 max-w-lg mx-auto relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black italic text-white tracking-tight leading-none">TIMELINE</h1>
          <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em] mt-1">Day {Math.min(currentDay, 90)} / 90</p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-2">
          {['A', 'B', 'C'].map(t => (
            <span key={t} className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${TYPE_CONFIG[t].bg} ${TYPE_CONFIG[t].text}`}>{t}</span>
          ))}
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">SKP</span>
        </div>
      </div>

      {/* Ultra-Dense Grid */}
      <div className="grid grid-cols-10 gap-1.5 mb-8">
        {days.map((day) => {
          const cfg = statusConfig[day.status];
          const isCurrent = day.isToday;
          const workoutType = day.log?.type || (day.status === 'upcoming' || day.status === 'rest' ? day.workoutType : null);
          const typeStyle = workoutType && workoutType !== 'Rest' ? TYPE_CONFIG[workoutType] : null;

          return (
            <button
              key={day.calendarDayNum}
              onClick={() => setSelectedDay(day.calendarDayNum)}
              className="relative group"
            >
              <div
                className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all border overflow-hidden ${
                  isCurrent
                    ? 'bg-primary text-black border-white shadow-[0_0_15px_rgba(34,255,136,0.4)] z-10 scale-105'
                    : `${cfg.color} text-white/40`
                }`}
              >
                {isCurrent ? (
                  <span className="text-[11px] font-bold leading-none">{day.dayNum}</span>
                ) : day.status === 'upcoming' ? (
                  <span className="text-[11px] font-bold leading-none text-white/10">{day.dayNum}</span>
                ) : (day.status === 'done' || day.status === 'partial') ? (
                  <span className={`text-[12px] font-bold leading-none ${typeStyle ? typeStyle.text : 'text-white/40'}`}>
                    {workoutType && workoutType !== 'Rest' ? workoutType : <cfg.icon className={`w-3 h-3 ${cfg.iconColor}`} strokeWidth={3} />}
                  </span>
                ) : day.status === 'skipped' ? (
                  <span className="text-[11px] font-bold leading-none text-orange-400">SKP</span>
                ) : day.status === 'rest' ? (
                  <Coffee className="w-3 h-3 text-blue-400" strokeWidth={3} />
                ) : (
                  <cfg.icon className={`w-3 h-3 ${cfg.iconColor}`} strokeWidth={3} />
                )}
              </div>

              {/* Milestone dot */}
              {milestones.some(m => m.day === day.dayNum) && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full shadow-[0_0_5px_rgba(250,204,21,0.6)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Phase legend */}
      <div className="flex gap-2 mb-6">
        {PHASES.map(p => (
          <div key={p.title} className="flex-1 bg-white/5 border border-white/5 rounded-xl p-2 text-center">
            <p className={`text-[11px] font-bold uppercase tracking-widest ${p.color}`}>{p.title}</p>
            <p className="text-[11px] text-white/35 mt-0.5">D{p.start}–{p.end}</p>
          </div>
        ))}
      </div>

      {/* Mini Milestones List */}
      <div className="space-y-2">
        <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 px-1">Milestones</p>
        {milestones.map((m, i) => {
          const reached = currentDay >= m.day;
          return (
            <div
              key={i}
              className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${reached ? 'bg-primary/5 border-primary/20' : 'bg-white/5 border-white/5 opacity-30'}`}
            >
              <div className="text-lg">{reached ? '🏆' : '🔒'}</div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-[12px] font-bold text-white uppercase tracking-tight">{m.title}</p>
                  <span className="text-[11px] font-black text-white/40 font-mono">D{m.day}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Detail Popup */}
      <AnimatePresence>
        {selectedDay && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedDay(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[320px] bg-zinc-900 border border-white/10 rounded-2xl z-[101] p-5 shadow-2xl"
            >
              {(() => {
                const day = days.find(d => d.calendarDayNum === selectedDay)!;
                const cfg = statusConfig[day.status];
                const workoutType = day.log?.type;
                const typeStyle = workoutType ? TYPE_CONFIG[workoutType] : null;
                const typeNames: Record<string, string> = { A: 'Upper Body', B: 'Lower Body', C: 'Full Body Burn' };

                return (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-2xl font-black italic text-white leading-none">DAY {selectedDay}</h3>
                          {/* Workout type badge */}
                          {workoutType && !day.log?.isSkipped && (
                            <span className={`text-[13px] font-bold px-2 py-0.5 rounded-lg ${typeStyle?.bg} ${typeStyle?.text}`}>
                              {workoutType}
                            </span>
                          )}
                          {day.log?.isSkipped && (
                            <span className="text-[13px] font-bold px-2 py-0.5 rounded-lg bg-orange-500/20 text-orange-400">SKIPPED</span>
                          )}
                        </div>
                        <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.2em] mt-1.5">{day.ds}</p>
                      </div>
                      <button onClick={() => setSelectedDay(null)} className="p-1.5 bg-white/5 rounded-lg">
                        <X className="w-4 h-4 text-white/40" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Status */}
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">Status</p>
                          <div className="flex items-center gap-1.5">
                            <cfg.icon className={`w-3 h-3 ${cfg.iconColor}`} />
                            <p className="text-[12px] font-bold text-white uppercase">{cfg.label}</p>
                          </div>
                        </div>
                        {/* Water */}
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">Water</p>
                          <p className="text-[12px] font-bold text-white uppercase">{day.dietLog.waterGlasses} Glasses</p>
                        </div>
                      </div>

                      {/* Workout detail card */}
                      {day.log && !day.log.isSkipped && workoutType && (
                        <div className={`p-3 rounded-xl border ${typeStyle?.bg} border-white/10`}>
                          <p className="text-[11px] font-black text-white/40 uppercase tracking-widest mb-1">Workout</p>
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-black uppercase ${typeStyle?.text}`}>
                              Type {workoutType} — {typeNames[workoutType] ?? ''}
                            </p>
                            {day.log.durationSeconds && (
                              <span className="text-[11px] font-bold text-white/40">
                                {Math.floor(day.log.durationSeconds / 60)}m {day.log.durationSeconds % 60}s
                              </span>
                            )}
                          </div>
                          {day.log.completionPct !== undefined && (
                            <div className="mt-2">
                              <div className="flex justify-between mb-1">
                                <span className="text-[11px] text-white/30 uppercase tracking-widest">Completion</span>
                                <span className="text-[11px] font-black text-white/40">{day.log.completionPct}%</span>
                              </div>
                              <div className="w-full bg-white/5 rounded-full h-1">
                                <div
                                  className={`h-1 rounded-full ${typeStyle?.bg ?? 'bg-primary'}`}
                                  style={{ width: `${day.log.completionPct}%`, backgroundColor: undefined }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Skipped detail */}
                      {day.log?.isSkipped && (
                        <div className="p-3 rounded-xl border bg-orange-500/10 border-orange-500/20">
                          <p className="text-[11px] font-black text-orange-400/80 uppercase tracking-widest mb-1">Skipped Session</p>
                          <p className="text-[12px] font-bold text-white/70">
                            Type {day.log.type} workout was skipped. Schedule shifted forward.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
