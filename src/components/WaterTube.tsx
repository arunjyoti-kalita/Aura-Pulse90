import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Droplets } from "lucide-react";
import { loadState, patchState, getDietLog, getToday } from "@/lib/store";

const GOAL = 12;
const TUBE_W = 64; 
const TUBE_H = 340;
const LIQUID_MAX_H = 310;
const TUBE_Y_START = 325;
const TUBE_PATH = `M12 10 L12 ${TUBE_Y_START - 20} Q12 ${TUBE_Y_START} ${TUBE_W/2} ${TUBE_Y_START} Q${TUBE_W-12} ${TUBE_Y_START} ${TUBE_W-12} ${TUBE_Y_START-20} L${TUBE_W-12} 10 Z`;

export default function WaterTube() {
  const [glasses, setGlasses] = useState(0);
  const [prevGlasses, setPrevGlasses] = useState(0);
  const [isAIActive, setIsAIActive] = useState(false);

  useEffect(() => {
    const handler = () => {
      const state = loadState();
      const today = getToday();
      const log = getDietLog(state.dietLogs, today, state.settings.meals);
      setGlasses(log.waterGlasses || 0);
    };
    handler();
    window.addEventListener("transform90:state-changed", handler);

    const observer = new MutationObserver(() => {
      setIsAIActive(document.documentElement.hasAttribute('data-ai-form-check'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-ai-form-check'] });

    return () => {
      window.removeEventListener("transform90:state-changed", handler);
      observer.disconnect();
    };
  }, []);

  const setGlassCount = (next: number) => {
    const clamped = Math.max(0, Math.min(GOAL + 4, next));
    if (clamped > glasses) {
      setPrevGlasses(glasses);
    }
    
    patchState(s => {
      const today = getToday();
      const log = getDietLog(s.dietLogs, today, s.settings.meals);
      const updated = { ...log, waterGlasses: clamped };
      const others = s.dietLogs.filter((d) => d.date !== today);
      s.dietLogs = [...others, updated];
    });

    setGlasses(clamped);
    
    if (window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const pct = Math.min(1, glasses / GOAL);

  const creatures = useMemo(() => {
    return {
      bubbles: Array.from({ length: 8 }, (_, i) => ({
        id: `b-${i}`,
        x: 15 + Math.random() * (TUBE_W - 30),
        size: 1 + Math.random() * 2,
        delay: Math.random() * 5,
        duration: 4 + Math.random() * 4,
      })),
      micro: Array.from({ length: 15 }, (_, i) => ({
        id: `m-${i}`,
        x: 15 + Math.random() * (TUBE_W - 30),
        y: TUBE_Y_START - 20 - Math.random() * (LIQUID_MAX_H - 40),
        delay: Math.random() * 2,
      })),
      fish: Array.from({ length: 3 }, (_, i) => ({
        id: `f-${i}`,
        y: TUBE_Y_START - 60 - (i * 70),
        delay: i * 2,
        scale: 0.6 + Math.random() * 0.4
      }))
    };
  }, []);

  const ticks = useMemo(() => {
    return Array.from({ length: GOAL + 1 }, (_, i) => ({
      y: TUBE_Y_START - (i * (LIQUID_MAX_H / GOAL)),
      major: i % 4 === 0,
      index: i
    }));
  }, []);

  const liquidTop = TUBE_Y_START - pct * LIQUID_MAX_H;
  const liquidPath = `M12 ${liquidTop} L12 ${TUBE_Y_START - 20} Q12 ${TUBE_Y_START} ${TUBE_W/2} ${TUBE_Y_START} Q${TUBE_W-12} ${TUBE_Y_START} ${TUBE_W-12} ${TUBE_Y_START-20} L${TUBE_W-12} ${liquidTop} Z`;

  if (isAIActive) return null;

  return (
    <div
      className="fixed top-0 right-0 bottom-0 z-40 flex flex-col items-center justify-center pointer-events-none fixed-side-ui"
      style={{ width: 100 }}
    >
      <div className="pointer-events-auto flex flex-col items-center gap-4 py-8 px-3 h-full justify-center">
        {/* Counter Header */}
        <motion.div 
          key={glasses}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-2"
        >
          <div className="flex items-center justify-center gap-1">
            <Droplets className={`w-4 h-4 ${glasses >= GOAL ? 'text-primary' : 'text-cyan-400'} animate-pulse`} />
            <span className="text-2xl font-black font-display text-white tracking-tighter">
              {glasses}
            </span>
          </div>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] -mt-1">
            Glasses
          </p>
        </motion.div>

        {/* Test tube */}
        <div className="relative flex-1 flex items-end mb-4" style={{ minHeight: 320 }}>
          <svg
            viewBox={`0 0 ${TUBE_W} ${TUBE_H}`}
            className="h-full"
            style={{ 
              width: TUBE_W, 
              filter: `drop-shadow(0 0 15px ${glasses >= GOAL ? 'rgba(34,197,94,0.2)' : 'rgba(34,211,238,0.2)'})` 
            }}
          >
            <defs>
              <clipPath id="tubeInnerOcean">
                <path d={TUBE_PATH} />
              </clipPath>
              
              <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(190 95% 65%)" />
                <stop offset="50%" stopColor="hsl(200 95% 50%)" />
                <stop offset="100%" stopColor="hsl(215 95% 35%)" />
              </linearGradient>

              <filter id="creatureGlow">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <clipPath id="liquidClip">
                <motion.path 
                  d={liquidPath} 
                  initial={false}
                  animate={{ d: liquidPath }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                />
              </clipPath>
            </defs>

            {/* Glass Outline */}
            <path
              d={`M10 8 L10 ${TUBE_Y_START - 20} Q10 ${TUBE_Y_START + 5} ${TUBE_W/2} ${TUBE_Y_START + 5} Q${TUBE_W-10} ${TUBE_Y_START + 5} ${TUBE_W-10} ${TUBE_Y_START - 20} L${TUBE_W-10} 8`}
              fill="rgba(255,255,255,0.03)"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1.5"
            />

            {/* Ticks */}
            {ticks.map(t => (
              <line
                key={t.index}
                x1={t.major ? 10 : 15}
                x2={t.major ? 20 : 18}
                y1={t.y}
                y2={t.y}
                stroke={t.index <= glasses ? "rgba(34,211,238,0.4)" : "rgba(255,255,255,0.1)"}
                strokeWidth="1"
              />
            ))}

            {/* Liquid & Creatures */}
            <g clipPath="url(#tubeInnerOcean)">
              <motion.rect
                x="12"
                width={TUBE_W - 24}
                fill="url(#oceanGrad)"
                initial={false}
                animate={{
                  y: liquidTop,
                  height: pct * LIQUID_MAX_H + 20,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              />

              <g clipPath="url(#liquidClip)">
                {/* Algae at the bottom */}
                {[15, 32, 49].map((x, i) => (
                  <motion.path
                    key={`algae-${i}`}
                    d={`M${x} ${TUBE_Y_START} Q${x + 5} ${TUBE_Y_START - 15} ${x} ${TUBE_Y_START - 30}`}
                    fill="none"
                    stroke={i % 2 === 0 ? "hsl(142 70% 45% / 0.4)" : "hsl(160 80% 40% / 0.5)"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    animate={{
                      d: [
                        `M${x} ${TUBE_Y_START} Q${x + 5} ${TUBE_Y_START - 15} ${x} ${TUBE_Y_START - 30}`,
                        `M${x} ${TUBE_Y_START} Q${x - 5} ${TUBE_Y_START - 15} ${x} ${TUBE_Y_START - 30}`,
                        `M${x} ${TUBE_Y_START} Q${x + 5} ${TUBE_Y_START - 15} ${x} ${TUBE_Y_START - 30}`,
                      ]
                    }}
                    transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                  />
                ))}

                {/* Fishes */}
                {pct > 0.1 && creatures.fish.map((f, i) => (
                  <motion.g
                    key={f.id}
                    initial={{ x: -20, y: f.y }}
                    animate={{ 
                      x: [ -20, TUBE_W + 20 ],
                      y: [ f.y, f.y - 10, f.y + 10, f.y ]
                    }}
                    transition={{ 
                      duration: 10 + i * 3, 
                      repeat: Infinity, 
                      delay: f.delay,
                      ease: "linear"
                    }}
                  >
                    <path 
                      d="M0 0 C4 2 8 2 12 0 L10 -4 L10 4 Z" 
                      fill="hsl(190 100% 70% / 0.6)"
                      transform={`scale(${f.scale})`}
                    />
                    <circle cx="2" cy="0" r="0.5" fill="white" />
                  </motion.g>
                ))}

                {/* Octopus peeking out */}
                {pct > 0.6 && (
                  <motion.g
                    initial={{ y: TUBE_Y_START }}
                    animate={{ y: [TUBE_Y_START, TUBE_Y_START - 100, TUBE_Y_START - 90, TUBE_Y_START] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <circle cx={TUBE_W/2} cy="0" r="12" fill="hsl(330 70% 60% / 0.4)" />
                    <circle cx={TUBE_W/2 - 4} cy="-2" r="1.5" fill="white" opacity="0.6" />
                    <circle cx={TUBE_W/2 + 4} cy="-2" r="1.5" fill="white" opacity="0.6" />
                    {[ -8, -4, 0, 4, 8 ].map((tx, ti) => (
                      <motion.path
                        key={`tentacle-${ti}`}
                        d={`M${TUBE_W/2 + tx} 0 Q${TUBE_W/2 + tx + 5} 15 ${TUBE_W/2 + tx} 25`}
                        stroke="hsl(330 70% 60% / 0.3)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        animate={{ d: [
                          `M${TUBE_W/2 + tx} 0 Q${TUBE_W/2 + tx + 5} 15 ${TUBE_W/2 + tx} 25`,
                          `M${TUBE_W/2 + tx} 0 Q${TUBE_W/2 + tx - 5} 15 ${TUBE_W/2 + tx} 25`,
                          `M${TUBE_W/2 + tx} 0 Q${TUBE_W/2 + tx + 5} 15 ${TUBE_W/2 + tx} 25`,
                        ]}}
                        transition={{ duration: 3, repeat: Infinity, delay: ti * 0.2 }}
                      />
                    ))}
                  </motion.g>
                )}

                {/* Microorganisms */}
                {pct > 0 && creatures.micro.map((m) => (
                  <motion.circle
                    key={m.id}
                    r="0.6"
                    fill="rgba(255,255,255,0.5)"
                    filter="url(#creatureGlow)"
                    initial={{ cx: m.x, cy: m.y }}
                    animate={{
                      cx: [m.x, m.x + 15, m.x - 15, m.x],
                      cy: [m.y, m.y - 15, m.y + 15, m.y],
                      opacity: [0.1, 0.7, 0.1]
                    }}
                    transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, delay: m.delay }}
                  />
                ))}
              </g>

              {/* Bubbles */}
              {pct > 0 && creatures.bubbles.map((b) => (
                <motion.circle
                  key={b.id}
                  cx={b.x}
                  r={b.size}
                  fill="rgba(255,255,255,0.2)"
                  initial={{ cy: TUBE_Y_START, opacity: 0 }}
                  animate={{
                    cy: [TUBE_Y_START, liquidTop + 10],
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}
            </g>

            {/* Surface Shine */}
            {pct > 0 && (
              <motion.path
                d={`M12 0 Q${TUBE_W/2} 5 ${TUBE_W-12} 0`}
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2"
                initial={false}
                animate={{ y: liquidTop }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              />
            )}
          </svg>

          {/* Proportional Tick Marks (12 units) */}
          <div className="absolute inset-y-8 left-0 w-full flex flex-col justify-between pointer-events-none px-1">
            {[...Array(13)].map((_, i) => (
              <div key={i} className="flex items-center justify-between w-full">
                <div className={`h-[1px] ${i % 3 === 0 ? 'w-3 bg-primary/40' : 'w-1.5 bg-primary/20'}`} />
                <div className={`h-[1px] ${i % 3 === 0 ? 'w-3 bg-primary/40' : 'w-1.5 bg-primary/20'}`} />
              </div>
            ))}
          </div>

          {/* Counter Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-30 pointer-events-none">
            <p className="text-[32px] font-black text-white drop-shadow-lg leading-none">{glasses}</p>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-tighter">/ 12 Glasses</p>
          </div>

          {/* Splash +1 */}
          <AnimatePresence>
            {glasses > prevGlasses && (
              <motion.div
                initial={{ y: 0, opacity: 0, scale: 0.5 }}
                animate={{ y: -60, opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0 }}
                className="absolute left-1/2 -translate-x-1/2 text-cyan-400 font-black text-sm z-50 pointer-events-none"
              >
                +1
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setGlassCount(glasses + 1)}
            className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 hover:bg-cyan-500/30 text-cyan-400 flex items-center justify-center backdrop-blur-xl shadow-lg shadow-cyan-500/10 active:scale-90 transition-all group"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
          <button
            onClick={() => setGlassCount(glasses - 1)}
            className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/40 flex items-center justify-center backdrop-blur-xl active:scale-90 transition-all"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>

        {/* Goal */}
        <div className="mt-auto pt-4 border-t border-white/5 w-full text-center">
          <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Goal</div>
          <div className={`text-xs font-bold ${glasses >= GOAL ? 'text-primary' : 'text-white/40'}`}>
            {Math.round(pct * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}
