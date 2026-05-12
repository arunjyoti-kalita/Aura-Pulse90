import { motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

interface StressCheckInProps {
  onSubmit: (level: 'Low' | 'Medium' | 'High') => void;
  onDismiss: () => void;
}

export default function StressCheckIn({ onSubmit, onDismiss }: StressCheckInProps) {
  const options: { level: 'Low' | 'Medium' | 'High'; emoji: string; color: string }[] = [
    { level: 'Low', emoji: '😌', color: 'hover:border-primary/50' },
    { level: 'Medium', emoji: '😐', color: 'hover:border-amber-400/50' },
    { level: 'High', emoji: '😰', color: 'hover:border-destructive/50' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 relative"
    >
      <button onClick={onDismiss} className="absolute top-2 right-2 p-1 rounded-lg hover:bg-secondary">
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 text-amber-400" />
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Stress Level</p>
      </div>
      <div className="flex gap-2">
        {options.map(o => (
          <button
            key={o.level}
            onClick={() => onSubmit(o.level)}
            className={`flex-1 glass-card p-3 text-center transition-colors ${o.color}`}
          >
            <span className="text-2xl">{o.emoji}</span>
            <p className="text-xs mt-1">{o.level}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
