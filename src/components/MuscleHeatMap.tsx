import { motion } from "framer-motion";

interface MuscleHeatMapProps {
  volume: Record<string, number>;
  recommended: Record<string, number>;
}

const musclePositions: Record<string, { x: number; y: number; w: number; h: number }> = {
  chest: { x: 35, y: 22, w: 30, h: 10 },
  shoulders: { x: 22, y: 18, w: 56, h: 6 },
  triceps: { x: 18, y: 28, w: 12, h: 12 },
  core: { x: 37, y: 35, w: 26, h: 14 },
  quads: { x: 30, y: 52, w: 40, h: 16 },
  hamstrings: { x: 32, y: 56, w: 36, h: 12 },
  glutes: { x: 35, y: 48, w: 30, h: 8 },
  cardio: { x: 40, y: 14, w: 20, h: 6 },
};

function getIntensityColor(sets: number): string {
  if (sets === 0) return 'hsl(var(--muted))';
  if (sets <= 2) return 'hsl(142 71% 45% / 0.3)';
  if (sets <= 4) return 'hsl(142 71% 45% / 0.55)';
  return 'hsl(142 71% 45% / 0.85)';
}

export default function MuscleHeatMap({ volume, recommended }: MuscleHeatMapProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-cockpit p-4 light-bleed"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[12px] font-black text-primary uppercase tracking-[0.2em]">Kinetic Heat Map</p>
        <div className="flex gap-1">
          {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-primary/20" />)}
        </div>
      </div>
      
      {/* Simplified body SVG - Blueprint Style */}
      <div className="relative mx-auto mb-4" style={{ width: 160, height: 260 }}>
        <svg viewBox="0 0 100 160" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(34,197,94,0.1)]">
          {/* Body outline */}
          <ellipse cx="50" cy="10" rx="8" ry="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <rect x="38" y="20" width="24" height="35" rx="2" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <rect x="22" y="22" width="12" height="28" rx="2" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <rect x="66" y="22" width="12" height="28" rx="2" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <rect x="34" y="55" width="14" height="38" rx="2" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <rect x="52" y="55" width="14" height="38" rx="2" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

          {/* Muscle overlays */}
          {Object.entries(musclePositions).map(([muscle, pos]) => {
            const sets = volume[muscle] || 0;
            const color = getIntensityColor(sets);
            if (sets === 0) return null;
            return (
              <motion.rect
                key={muscle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                x={pos.x}
                y={pos.y}
                width={pos.w}
                height={pos.h}
                rx="1"
                fill={color}
                className="transition-all duration-700"
                style={{ filter: `drop-shadow(0 0 2px ${color})` }}
              />
            );
          })}
        </svg>
      </div>

      {/* Volume tracker - High Density */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 border-t border-white/5 pt-4">
        {Object.entries(recommended).map(([muscle, target]) => {
          const done = volume[muscle] || 0;
          const pct = Math.min(100, (done / target) * 100);
          return (
            <div key={muscle} className="flex flex-col gap-1">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">{muscle}</span>
                <span className="text-[11px] font-mono text-primary">{done}/{target}</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-primary' : pct >= 50 ? 'bg-primary/50' : 'bg-primary/20'}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
