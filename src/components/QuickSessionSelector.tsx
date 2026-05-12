import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, X, Monitor, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickSessionSelectorProps {
  onSelect: (type: '5min' | '10min' | '15min' | 'desk') => void;
  onClose: () => void;
  deskModeEnabled: boolean;
}

export default function QuickSessionSelector({ onSelect, onClose, deskModeEnabled }: QuickSessionSelectorProps) {
  const sessions = [
    { type: '5min' as const, label: '5 min Burn', desc: '1 set × 4 exercises, no rest', icon: '🔥', xp: 25 },
    { type: '10min' as const, label: '10 min Blast', desc: '2 sets × 4 exercises, 20s rest', icon: '⚡', xp: 25 },
    { type: '15min' as const, label: '15 min Express', desc: '2 sets × 6 exercises, 30s rest', icon: '💥', xp: 25 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 relative"
    >
      <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-lg hover:bg-secondary">
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-primary" />
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Quick Sessions</p>
      </div>
      <div className="space-y-2">
        {sessions.map(s => (
          <button
            key={s.type}
            onClick={() => onSelect(s.type)}
            className="w-full glass-card p-3 text-left hover:border-primary/50 transition-colors flex items-center gap-3"
          >
            <span className="text-xl">{s.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-display font-semibold">{s.label}</p>
              <p className="text-[10px] text-muted-foreground">{s.desc}</p>
            </div>
            <span className="text-[10px] text-primary font-display">+{s.xp} XP</span>
          </button>
        ))}
        {deskModeEnabled && (
          <button
            onClick={() => onSelect('desk')}
            className="w-full glass-card p-3 text-left hover:border-primary/50 transition-colors flex items-center gap-3"
          >
            <Monitor className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-display font-semibold">Desk Mode</p>
              <p className="text-[10px] text-muted-foreground">No floor exercises, 15 min</p>
            </div>
            <span className="text-[10px] text-primary font-display">+12 XP</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
