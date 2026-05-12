import { motion } from "framer-motion";

interface WaterBottleProps {
  current: number;
  goal: number;
  onAdd: () => void;
}

export default function WaterBottle({ current, goal, onAdd }: WaterBottleProps) {
  const pct = Math.min(1, current / goal);

  return (
    <button onClick={onAdd} className="relative w-16 h-24 mx-auto block group" aria-label="Add water glass">
      <svg viewBox="0 0 64 96" className="w-full h-full">
        {/* Bottle outline */}
        <path
          d="M20 12 L20 8 Q20 4 24 4 L40 4 Q44 4 44 8 L44 12 L48 24 L48 84 Q48 92 40 92 L24 92 Q16 92 16 84 L16 24 Z"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />
        {/* Water fill */}
        <clipPath id="bottleClip">
          <path d="M20 12 L20 8 Q20 4 24 4 L40 4 Q44 4 44 8 L44 12 L48 24 L48 84 Q48 92 40 92 L24 92 Q16 92 16 84 L16 24 Z" />
        </clipPath>
        <motion.rect
          clipPath="url(#bottleClip)"
          x="14"
          width="36"
          initial={{ y: 92, height: 0 }}
          animate={{ y: 92 - pct * 88, height: pct * 88 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          rx="2"
          fill="hsl(210 80% 55% / 0.6)"
        />
        {/* Water surface wave */}
        {pct > 0 && (
          <motion.ellipse
            clipPath="url(#bottleClip)"
            cx="32"
            rx="17"
            ry="2"
            fill="hsl(210 80% 55% / 0.3)"
            initial={{ cy: 92 }}
            animate={{ cy: 92 - pct * 88 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </svg>
      <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] font-display font-bold text-muted-foreground">
        {current}/{goal}
      </span>
    </button>
  );
}
