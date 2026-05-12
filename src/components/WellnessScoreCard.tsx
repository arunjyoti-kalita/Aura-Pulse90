import { motion } from "framer-motion";
import { Brain } from "lucide-react";

interface WellnessScoreCardProps {
  score: number;
}

export default function WellnessScoreCard({ score }: WellnessScoreCardProps) {
  const color = score >= 7 ? 'text-primary' : score >= 5 ? 'text-amber-400' : 'text-destructive';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-3"
    >
      <div className="flex items-center gap-2 mb-1">
        <Brain className={`w-4 h-4 ${color}`} />
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Wellness</p>
      </div>
      <p className={`text-3xl font-display font-bold ${color}`}>{score.toFixed(1)}<span className="text-sm text-muted-foreground">/10</span></p>
    </motion.div>
  );
}
