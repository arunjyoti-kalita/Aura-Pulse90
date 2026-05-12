import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface RecoveryScoreCardProps {
  score: number;
  sleep: number;
  rest: number;
  mood: number;
  expanded?: boolean;
}

export default function RecoveryScoreCard({ score, sleep, rest, mood, expanded = false }: RecoveryScoreCardProps) {
  const color = score >= 8 ? 'text-primary' : score >= 5 ? 'text-amber-400' : 'text-destructive';
  const bgColor = score >= 8 ? 'border-primary/20' : score >= 5 ? 'border-amber-400/20' : 'border-destructive/20';
  const label = score >= 8 ? 'Train Hard 💪' : score >= 5 ? 'Train Normal 👍' : 'Consider Rest 🧘';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card p-3 ${bgColor}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Heart className={`w-4 h-4 ${color}`} />
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Recovery</p>
      </div>
      <div className="flex items-center gap-3">
        <p className={`text-3xl font-display font-bold ${color}`}>{score.toFixed(1)}</p>
        <div>
          <p className="text-xs text-muted-foreground">/10</p>
          <p className={`text-[10px] font-medium ${color}`}>{label}</p>
        </div>
      </div>
      {expanded && (
        <div className="mt-2 space-y-1">
          {[
            { label: 'Sleep', value: sleep, pct: 40 },
            { label: 'Rest', value: rest, pct: 30 },
            { label: 'Mood', value: mood, pct: 30 },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-2 text-[10px]">
              <span className="text-muted-foreground w-10">{f.label}</span>
              <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(f.value / 10) * 100}%` }} />
              </div>
              <span className="text-muted-foreground w-6 text-right">{f.value.toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
