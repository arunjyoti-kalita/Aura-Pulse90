import { useMemo } from "react";
import { motion } from "framer-motion";
import { loadState, getLevel } from "@/lib/store";
import { Trophy, Zap, Shield, Target } from "lucide-react";

export default function BadgesPage() {
  const state = useMemo(() => loadState(), []);
  const level = getLevel(state.xp);
  const earned = state.badges.filter(b => b.earned).length;

  const nextLevel = level.level === 4 ? 5000 : [500, 1500, 3000][level.level - 1];
  const prevLevel = level.level === 1 ? 0 : [0, 500, 1500][level.level - 1];
  const progress = (state.xp - prevLevel) / (nextLevel - prevLevel);

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto relative z-10">
      {/* Technical Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-black italic text-white tracking-tight leading-none uppercase">Prestige</h1>
          <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em] mt-1">Gamification & Kinetic Growth</p>
        </div>
        <div className="px-2 py-1 rounded bg-primary/10 border border-primary/20 text-[11px] font-black text-primary uppercase">
          {earned} / {state.badges.length} EARNED
        </div>
      </div>

      {/* Level & XP Side-by-Side */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <div className="glass-card-premium p-3 border-white/5 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <Trophy className="w-12 h-12 text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">Current Tier</p>
            <p className="text-xl font-black text-white leading-tight uppercase">{level.name}</p>
          </div>
          <div className="space-y-1">
             <div className="flex justify-between text-[11px] font-bold text-white/40 uppercase">
               <span>LVL {level.level}</span>
               <span>{state.xp} XP</span>
             </div>
             <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-primary" style={{ width: `${Math.min(100, progress * 100)}%` }} />
             </div>
          </div>
        </div>

        <div className="glass-card-premium p-3 border-white/5 flex flex-col justify-between h-32">
          <p className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-2">XP Breakdown</p>
          <div className="space-y-1.5">
            {[
              { action: 'Workout', xp: '50' },
              { action: 'Clean Meal', xp: '10' },
              { action: 'Weigh-in', xp: '20' },
              { action: 'Steps', xp: '30' },
            ].map(item => (
              <div key={item.action} className="flex justify-between items-center">
                <span className="text-[11px] text-white/40 font-bold uppercase">{item.action}</span>
                <span className="text-[11px] text-primary font-black">+{item.xp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges Grid - 3 Column Compact */}
      <div className="grid grid-cols-3 gap-2">
        {state.badges.map((badge, i) => (
          <div
            key={badge.id}
            className={`glass-card-premium p-3 text-center border-white/5 flex flex-col items-center justify-between min-h-[110px] transition-all duration-500 ${badge.earned ? 'bg-primary/5 border-primary/20' : 'opacity-20 grayscale'}`}
          >
            <div className="text-2xl mb-1">{badge.emoji}</div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-white leading-tight uppercase line-clamp-1">{badge.name}</p>
              <p className="text-[11px] text-white/40 font-bold leading-tight line-clamp-2">{badge.description}</p>
            </div>
            <div className="mt-2">
              <div className={`px-1.5 py-0.5 rounded-sm text-[11px] font-bold uppercase ${badge.earned ? 'bg-primary text-black' : 'bg-white/5 text-white/40'}`}>
                {badge.earned ? 'UNLOCKED' : 'LOCKED'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
