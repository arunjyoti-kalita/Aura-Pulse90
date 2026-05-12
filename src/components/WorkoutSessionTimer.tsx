import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";

interface WorkoutSessionTimerProps {
  presets?: number[]; // seconds
  halfwayBeep?: boolean;
  endBeep?: boolean;
}

export default function WorkoutSessionTimer({
  presets = [30, 60, 120],
  halfwayBeep = true,
  endBeep = true,
}: WorkoutSessionTimerProps) {
  const [selectedPreset, setSelectedPreset] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [flash, setFlash] = useState(false);
  const audioCtx = useRef<AudioContext | null>(null);
  const halfwayFired = useRef(false);

  const totalTime = selectedPreset;
  const pct = running || timeLeft < totalTime ? timeLeft / totalTime : 1;

  const playBeep = useCallback((freq: number, duration: number) => {
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
  }, []);

  const playEndBeeps = useCallback(() => {
    if (!endBeep) return;
    // 3 short beeps
    [0, 200, 400].forEach((delay) => {
      setTimeout(() => playBeep(880, 120), delay);
    });
  }, [endBeep, playBeep]);

  const playHalfwayBeep = useCallback(() => {
    if (!halfwayBeep) return;
    playBeep(660, 200);
  }, [halfwayBeep, playBeep]);

  useEffect(() => {
    if (!running || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        const next = t - 1;
        // Halfway beep
        const halfway = Math.floor(totalTime / 2);
        if (next === halfway && !halfwayFired.current) {
          halfwayFired.current = true;
          playHalfwayBeep();
        }
        if (next <= 0) {
          setRunning(false);
          playEndBeeps();
          setFlash(true);
          setTimeout(() => {
            setFlash(false);
            setTimeLeft(totalTime);
          }, 800);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, totalTime, playEndBeeps, playHalfwayBeep]);

  const handleStart = useCallback(() => {
    halfwayFired.current = false;
    setTimeLeft(selectedPreset);
    setRunning(true);
  }, [selectedPreset]);

  const handleStop = useCallback(() => {
    setRunning(false);
    setTimeLeft(selectedPreset);
    halfwayFired.current = false;
  }, [selectedPreset]);

  const selectPreset = useCallback((s: number) => {
    if (running) return;
    setSelectedPreset(s);
    setTimeLeft(s);
  }, [running]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const formatLabel = (s: number) => {
    if (s < 60) return `${s}s`;
    if (s % 60 === 0) return `${s / 60}m`;
    return `${Math.floor(s / 60)}m${s % 60}s`;
  };

  // SVG ring
  const size = 72;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - Math.min(pct, 1) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card rounded-2xl p-3 flex items-center gap-3 transition-colors duration-300 ${
        flash ? "bg-primary/30 ring-2 ring-primary" : ""
      }`}
    >
      {/* Progress ring + time */}
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            className="stroke-secondary"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-300 ${
              flash ? "stroke-primary" : "stroke-primary"
            }`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-display font-bold">
          {formatTime(timeLeft)}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Plank / Hold Timer</p>
        {/* Presets */}
        <div className="flex gap-1">
          {presets.map((s) => (
            <button
              key={s}
              onClick={() => selectPreset(s)}
              disabled={running}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                selectedPreset === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              } ${running ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {formatLabel(s)}
            </button>
          ))}
        </div>
        {/* Start / Stop */}
        {running ? (
          <button
            onClick={handleStop}
            className="px-4 py-1 rounded-full text-xs font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            STOP
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="px-4 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            START
          </button>
        )}
      </div>
    </motion.div>
  );
}
