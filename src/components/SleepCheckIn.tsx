import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Star, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calculateSleepHours } from "@/lib/store";

interface SleepCheckInProps {
  onSubmit: (bedtime: string, wakeTime: string, quality: number) => void;
  onDismiss: () => void;
  defaultBedtime?: string;
  defaultWakeTime?: string;
}

export default function SleepCheckIn({ onSubmit, onDismiss, defaultBedtime = '22:00', defaultWakeTime = '06:00' }: SleepCheckInProps) {
  const [bedtime, setBedtime] = useState(defaultBedtime);
  const [wakeTime, setWakeTime] = useState(defaultWakeTime);
  const [quality, setQuality] = useState(3);

  const hours = calculateSleepHours(bedtime, wakeTime);
  const hoursColor = hours >= 7 ? 'text-primary' : hours >= 6 ? 'text-amber-400' : 'text-destructive';

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
        <Moon className="w-4 h-4 text-primary" />
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Sleep Check-in</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[10px] text-muted-foreground">Bedtime</label>
          <Input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)} className="h-8 text-sm mt-0.5" />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground">Wake Time</label>
          <Input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className="h-8 text-sm mt-0.5" />
        </div>
      </div>
      <div className="text-center mb-3">
        <p className={`text-lg font-display font-bold ${hoursColor}`}>{hours}h</p>
        <p className="text-[10px] text-muted-foreground">Total Sleep</p>
      </div>
      <div className="mb-3">
        <p className="text-[10px] text-muted-foreground mb-1">Sleep Quality</p>
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <button key={s} onClick={() => setQuality(s)} className="p-0.5">
              <Star className={`w-6 h-6 transition-colors ${s <= quality ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
            </button>
          ))}
        </div>
      </div>
      <Button onClick={() => onSubmit(bedtime, wakeTime, quality)} size="sm" className="w-full font-display">
        Log Sleep
      </Button>
    </motion.div>
  );
}
