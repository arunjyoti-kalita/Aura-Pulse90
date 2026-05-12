import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Play, Square, Timer, Sparkles, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadState, saveState } from "@/lib/store";

interface BreathConfig {
  id: string;
  name: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  description: string;
  emoji: string;
}

const breathConfigs: BreathConfig[] = [
  { id: 'box', name: 'BOX', inhale: 4, holdIn: 4, exhale: 4, holdOut: 4, description: 'Performance & Focus', emoji: '⬛' },
  { id: '478', name: '4-7-8', inhale: 4, holdIn: 7, exhale: 8, holdOut: 0, description: 'Deep Relaxation', emoji: '🌙' },
  { id: 'power', name: 'POWER', inhale: 6, holdIn: 0, exhale: 2, holdOut: 0, description: 'Energy Surge', emoji: '⚡' },
  { id: 'calm', name: 'CALM', inhale: 4, holdIn: 2, exhale: 4, holdOut: 2, description: 'Stress Relief', emoji: '🌊' },
];

export default function BreathePage() {
  const [selected, setSelected] = useState<BreathConfig | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);

  const startSession = useCallback((config: BreathConfig) => {
    setSelected(config);
    setIsActive(true);
    setPhase('Inhale');
    setTimeLeft(config.inhale);
    setTotalSeconds(0);
  }, []);

  const stopSession = useCallback(() => {
    if (totalSeconds > 30) {
      const s = loadState();
      s.xp = (s.xp || 0) + 15;
      saveState(s);
    }
    setIsActive(false);
    setSelected(null);
  }, [totalSeconds]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && selected) {
      timer = setInterval(() => {
        setTotalSeconds(s => s + 1);
        setTimeLeft(t => {
          if (t <= 1) {
            if (phase === 'Inhale') {
              if (selected.holdIn > 0) { setPhase('Hold'); return selected.holdIn; }
              setPhase('Exhale'); return selected.exhale;
            } else if (phase === 'Hold') {
              setPhase('Exhale'); return selected.exhale;
            } else if (phase === 'Exhale') {
              if (selected.holdOut > 0) { setPhase('Rest'); return selected.holdOut; }
              setPhase('Inhale'); return selected.inhale;
            } else {
              setPhase('Inhale'); return selected.inhale;
            }
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phase, selected, timeLeft]);

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto relative z-10">
      {/* Technical Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-black italic text-white tracking-tight leading-none uppercase">Respiratory</h1>
          <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Nervous System Calibration</p>
        </div>
        {isActive && (
          <Button variant="ghost" onClick={stopSession} className="h-8 text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white">
            <ChevronLeft className="w-3 h-3 mr-1" /> EXIT
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isActive ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-2 gap-2">
              {breathConfigs.map(config => (
                <button
                  key={config.id}
                  onClick={() => startSession(config)}
                  className="glass-card-premium p-3 text-left border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs">{config.emoji}</span>
                  </div>
                  <p className="text-[12px] font-black text-white mb-1">{config.name}</p>
                  <p className="text-[8px] text-white/40 font-bold uppercase tracking-wider mb-3 leading-tight">{config.description}</p>
                  <div className="flex gap-1">
                    {[config.inhale, config.holdIn, config.exhale, config.holdOut].filter(v => v > 0).map((v, i) => (
                      <div key={i} className="px-1.5 py-0.5 rounded-sm bg-white/5 text-[7px] font-black text-white/60">
                        {v}S
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 glass-card-premium p-4 border-white/5 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3 h-3 text-primary" />
                <p className="text-[9px] font-black text-primary uppercase tracking-widest">Protocol Tip</p>
              </div>
              <p className="text-[10px] text-white/60 leading-relaxed font-medium italic">
                Focus on expanding your diaphragm. Nasal breathing is prioritized for parasympathetic activation.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center pt-10"
          >
            {/* Minimal Breath Visualizer */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: phase === 'Inhale' ? 1.4 : phase === 'Exhale' ? 0.8 : 1.1,
                  opacity: phase === 'Inhale' ? 0.8 : 0.4
                }}
                transition={{ duration: timeLeft, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full border border-primary/20 bg-primary/5"
              />
              <motion.div
                animate={{
                  scale: phase === 'Inhale' ? 1.2 : phase === 'Exhale' ? 0.9 : 1.05
                }}
                transition={{ duration: timeLeft, ease: "easeInOut" }}
                className="absolute inset-4 rounded-full border-2 border-primary/40"
              />
              
              <div className="text-center z-10">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">{phase}</p>
                <p className="text-5xl font-black text-white tabular-nums tracking-tighter">{timeLeft}</p>
              </div>
            </div>

            <div className="mt-16 text-center">
              <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Session Duration</p>
              <p className="text-xs font-mono text-white/40">{Math.floor(totalSeconds / 60)}:{(totalSeconds % 60).toString().padStart(2, '0')}</p>
            </div>

            <Button
              variant="outline"
              onClick={stopSession}
              className="mt-12 h-10 px-8 rounded-full border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              STOP SESSION
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
