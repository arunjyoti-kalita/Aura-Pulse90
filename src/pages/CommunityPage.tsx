import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FriendChallenges from "@/components/FriendChallenges";
import AccountabilityPartner from "@/components/AccountabilityPartner";
import { loadState } from "@/lib/store";
import { getLeaderboard } from "@/lib/sync";
import { Trophy, Users, Zap } from "lucide-react";

export default function CommunityPage() {
  const [state] = useState(() => loadState());
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const ft = state.settings.featureToggles;

  useEffect(() => {
    getLeaderboard()
      .then(setLeaderboard)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-20 px-4 pt-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Community</h1>
        <p className="text-muted-foreground text-sm mt-1">Connect, challenge & grow together</p>
      </motion.div>

      <FriendChallenges />

      <AccountabilityPartner
        workoutLogs={state.workoutLogs}
        schedule={state.settings.weeklySchedule}
        startDate={state.startDate}
      />

      {/* Leaderboard */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Global Leaderboard</p>
          </div>
          <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            <Users className="w-3 h-3 text-primary" />
            <span className="text-[12px] font-bold text-primary">{leaderboard.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 w-full bg-secondary/30 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.length > 0 ? leaderboard.map((entry, idx) => (
              <div key={entry.uid} className={`flex items-center justify-between p-3 rounded-xl transition-all ${entry.uid === state.settings.darkMode ? 'bg-primary/10 border border-primary/30 ring-1 ring-primary/20' : 'bg-secondary/20 border border-border/10'}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-display font-bold w-6 text-center ${idx < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </span>
                  {entry.photoURL ? (
                    <img src={entry.photoURL} className="w-8 h-8 rounded-full border border-border/50" alt="" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary border border-primary/20">
                      {entry.displayName?.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{entry.displayName || "Pulse Runner"}</span>
                    {idx === 0 && <span className="text-[11px] text-primary font-bold uppercase tracking-widest">Grandmaster</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-primary fill-primary" />
                    <span className="text-sm font-display font-bold text-primary">{entry.xp.toLocaleString()}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground uppercase font-semibold">XP Earned</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 text-muted-foreground text-xs italic">
                No data yet. Be the first to join the leaderboard!
              </div>
            )}
          </div>
        )}
        
        <p className="text-[12px] text-muted-foreground text-center mt-4">XP is updated whenever you sync to the cloud.</p>
      </motion.div>
    </div>
  );
}
