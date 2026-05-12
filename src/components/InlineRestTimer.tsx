import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";

interface InlineRestTimerProps {
  seconds: number;
  isLastSet: boolean;
  onComplete: () => void;
  colorTransition?: boolean;
  showReadyBadge?: boolean;
  audioEnabled?: boolean;
}

export default function InlineRestTimer({
  seconds,
  isLastSet,
  onComplete,
  colorTransition = true,
  audioEnabled = true,
}: InlineRestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [totalTime, setTotalTime] = useState(seconds);
  const audioCtx = useRef<AudioContext | null>(null);

  const playBeep = useCallback((freq: number, duration: number) => {
    if (!audioEnabled) return;
    try {
      if (!audioCtx.current) audioCtx.current = new AudioContext();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    } catch {}
  }, [audioEnabled]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        const next = t - 1;
        if (next <= 3 && next > 0) playBeep(880, 150);
        if (next <= 0) {
          playBeep(440, 500);
          setTimeout(onComplete, 300);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, onComplete, playBeep]);

  const skip = () => {
    setTimeLeft(0);
    onComplete();
  };

  const addTime = () => {
    const maxRest = 180; // 3 minutes cap
    setTimeLeft(t => Math.min(t + 15, maxRest));
    setTotalTime(t => Math.min(t + 15, maxRest));
  };

  const pct = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // Color based on remaining time
  let barColor = 'bg-primary'; // green
  let textColor = 'text-primary';
  if (colorTransition) {
    if (timeLeft <= 5) {
      barColor = 'bg-destructive';
      textColor = 'text-destructive';
    } else if (timeLeft <= 10) {
      barColor = 'bg-warning';
      textColor = 'text-warning';
    }
  }

  const finished = timeLeft <= 0;

  if (finished) {
    return (
      <motion.div
        initial={{ height: 'auto', opacity: 1 }}
        animate={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2, delay: 0.5 }}
        className="overflow-hidden"
      />
    );
  }

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="mt-3 pt-3 border-t border-border/30">
        {/* Countdown */}
        <p className={`text-2xl font-display font-bold ${textColor} text-center`}>
          {formatTime(timeLeft)}
        </p>

        {/* Progress bar */}
        <div className="w-full h-2 bg-secondary/50 rounded-full mt-2 overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-colors duration-300 ${barColor}`}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={addTime}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            + 15s
          </button>
          <p className="text-[11px] text-muted-foreground text-center">
            {isLastSet ? 'Great work — move to next exercise' : `Rest — next set in ${timeLeft}s`}
          </p>
          <button
            onClick={skip}
            className="text-[11px] text-primary hover:text-primary/80 transition-colors font-medium"
          >
            Skip Rest
          </button>
        </div>
      </div>
    </motion.div>
  );
}
