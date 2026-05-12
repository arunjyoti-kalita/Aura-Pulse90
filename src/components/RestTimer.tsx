import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RestTimerProps {
  seconds: number;
  onComplete?: () => void;
  onTick?: (timeLeft: number) => void;
}

export default function RestTimer({ seconds, onComplete, onTick }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        const next = t - 1;
        onTick?.(next);
        if (next <= 0) {
          setRunning(false);
          onComplete?.();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, timeLeft, onComplete, onTick]);

  const reset = useCallback(() => {
    setTimeLeft(seconds);
    setRunning(false);
  }, [seconds]);

  const pct = timeLeft / seconds;

  return (
    <div className="flex items-center gap-3 glass-card p-3 rounded-lg">
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="transform -rotate-90" width={48} height={48}>
          <circle cx={24} cy={24} r={20} strokeWidth={3} fill="none" className="stroke-secondary" />
          <circle cx={24} cy={24} r={20} strokeWidth={3} fill="none" strokeDasharray={125.6} strokeDashoffset={125.6 * (1 - pct)} strokeLinecap="round" className="stroke-primary transition-all duration-300" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-display font-bold">{timeLeft}s</span>
      </div>
      <span className="text-sm text-muted-foreground flex-1">Rest Timer</span>
      <div className="flex gap-1">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setRunning(!running)}>
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={reset}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
