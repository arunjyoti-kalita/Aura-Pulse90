import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Star, X, Brain, Sparkles, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calculateSleepHours } from "@/lib/store";

interface SleepCheckInProps {
  onSubmit: (bedtime: string, wakeTime: string, quality: number, tags?: string[]) => void;
  onDismiss: () => void;
  defaultBedtime?: string;
  defaultWakeTime?: string;
}

export default function SleepCheckIn({ onSubmit, onDismiss, defaultBedtime = '02:00', defaultWakeTime = '09:00' }: SleepCheckInProps) {
  const [bedtime, setBedtime] = useState(defaultBedtime);
  const [wakeTime, setWakeTime] = useState(defaultWakeTime);
  const [quality, setQuality] = useState(3);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const hours = calculateSleepHours(bedtime, wakeTime);
  const hoursColor = hours >= 7 ? 'text-primary' : hours >= 6 ? 'text-amber-400' : 'text-destructive';

  // Sleep Cycle Calculator (90 min cycles)
  const cycles = Math.round((hours / 1.5) * 10) / 10;
  const isOptimalCycles = cycles >= 5 && cycles <= 6.5;

  const behavioralTags = [
    { id: "screen_free", label: "No Screen 📱" },
    { id: "no_caffeine", label: "No Caffeine ☕" },
    { id: "cool_room", label: "Cool Room ❄️" },
    { id: "no_late_meal", label: "No Late Meal 🍽️" },
    { id: "reading", label: "Reading 📖" },
    { id: "meditation", label: "Meditation 🧘" }
  ];

  const handleTagToggle = (id: string) => {
    setSelectedTags(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const getReadinessAlert = () => {
    if (hours >= 7 && quality >= 4) {
      return {
        text: "⚡ Primed for Peak Performance. Fully recovered for high-intensity work today!",
        style: "text-primary bg-primary/5 border border-primary/10"
      };
    } else if (hours >= 6 && quality >= 3) {
      return {
        text: "👍 Good Recovery. Optimal training range. Stay hydrated and maintain form.",
        style: "text-amber-400 bg-amber-400/5 border border-amber-400/10"
      };
    } else {
      return {
        text: "⚠️ Under-recovered warning. Consider adding 15-30s of rest time per set to maintain neural drive.",
        style: "text-destructive bg-destructive/5 border border-destructive/10"
      };
    }
  };

  const readiness = getReadinessAlert();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 relative border border-white/10 animate-scale-up"
    >
      <button onClick={onDismiss} className="absolute top-2.5 right-2.5 p-1.5 rounded-lg hover:bg-secondary transition-colors">
        <X className="w-4 h-4 text-muted-foreground/60" />
      </button>

      <div className="flex items-center gap-2 mb-3.5">
        <Moon className="w-4 h-4 text-primary" />
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Sleep Check-in</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[10px] text-muted-foreground font-semibold">Bedtime</label>
          <Input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)} className="h-9 text-sm mt-1 bg-white/5 border-white/10 font-bold" />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground font-semibold">Wake Time</label>
          <Input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className="h-9 text-sm mt-1 bg-white/5 border-white/10 font-bold" />
        </div>
      </div>

      <div className="flex items-center justify-around bg-secondary/20 rounded-xl py-3 px-2 mb-4 border border-border/10">
        <div className="text-center">
          <p className={`text-xl font-display font-black leading-none mb-1 ${hoursColor}`}>{hours}h</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Total Sleep</p>
        </div>
        <div className="w-px h-8 bg-border/40" />
        <div className="text-center">
          <p className={`text-xl font-display font-black leading-none mb-1 ${isOptimalCycles ? 'text-primary' : 'text-muted-foreground'}`}>{cycles}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Sleep Cycles 🧠</p>
        </div>
      </div>

      {/* Behavioral Tags */}
      <div className="mb-4">
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Sleep Context Factors</p>
        <div className="flex flex-wrap gap-1.5">
          {behavioralTags.map(tag => {
            const active = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => handleTagToggle(tag.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                  active 
                    ? 'bg-primary/10 border-primary text-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]' 
                    : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1">
                  {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  {tag.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">Sleep Quality</p>
        <div className="flex justify-center gap-1.5 py-1">
          {[1, 2, 3, 4, 5].map(s => (
            <button key={s} onClick={() => setQuality(s)} className="p-0.5 transform hover:scale-110 active:scale-95 transition-transform">
              <Star className={`w-7 h-7 transition-all duration-300 ${s <= quality ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]' : 'text-muted-foreground/30'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Recovery Readiness Alert */}
      <div className={`p-3 rounded-xl text-[12px] leading-relaxed font-bold mb-4 animate-fade-in ${readiness.style}`}>
        <div className="flex gap-2">
          <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 animate-pulse" />
          <span>{readiness.text}</span>
        </div>
      </div>

      <Button onClick={() => onSubmit(bedtime, wakeTime, quality, selectedTags)} size="sm" className="w-full h-10 font-display font-black text-xs uppercase tracking-wider rounded-xl btn-press shadow-xl">
        Log Sleep & Check Readiness
      </Button>
    </motion.div>
  );
}
