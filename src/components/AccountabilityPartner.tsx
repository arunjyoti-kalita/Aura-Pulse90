import { useMemo } from "react";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { WorkoutLog } from "@/lib/store";
import { getToday } from "@/lib/store";

interface AccountabilityPartnerProps {
  workoutLogs: WorkoutLog[];
  schedule: ('A' | 'B' | 'C' | 'Rest')[];
  startDate: string;
}

export default function AccountabilityPartner({ workoutLogs, schedule, startDate }: AccountabilityPartnerProps) {
  const today = getToday();
  const dayInWeek = ((Math.floor((new Date().getTime() - new Date(startDate).getTime()) / 86400000)) % 7);
  const isWorkoutDay = schedule[dayInWeek] !== 'Rest';
  const didWorkout = workoutLogs.some(l => l.date === today);
  const shouldShow = isWorkoutDay && !didWorkout && new Date().getHours() >= 20;

  if (!shouldShow) return null;

  const message = encodeURIComponent("Hey, I missed my workout today — holding myself accountable 💪");

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-3 mt-3 flex items-start gap-2 border-amber-400/30">
      <MessageCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-xs text-amber-400 font-medium">Missed today's workout?</p>
        <p className="text-[10px] text-muted-foreground">Send an accountability message</p>
      </div>
      <a href={`https://wa.me/?text=${message}`} target="_blank" rel="noopener noreferrer"
        className="px-2 py-1 rounded-lg bg-primary/20 text-primary text-[10px] font-display hover:bg-primary/30 transition-colors">
        Send
      </a>
    </motion.div>
  );
}
