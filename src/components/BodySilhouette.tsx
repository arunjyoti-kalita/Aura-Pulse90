interface BodySilhouetteProps {
  startingWaist: number | null;
  currentWaist: number | null;
}

export default function BodySilhouette({ startingWaist, currentWaist }: BodySilhouetteProps) {
  const start = startingWaist || 90;
  const current = currentWaist || start;
  // Scale factor: 1.0 at starting, decreases as waist shrinks
  const scale = Math.max(0.7, Math.min(1.0, current / start));

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 80 120" className="w-16 h-24" aria-label="Body progress">
        {/* Head */}
        <circle cx="40" cy="16" r="10" fill="hsl(var(--primary))" opacity="0.8" />
        {/* Neck */}
        <rect x="36" y="26" width="8" height="6" rx="2" fill="hsl(var(--primary))" opacity="0.7" />
        {/* Torso - scales with waist */}
        <path
          d={`M${40 - 16 * scale} 32 Q${40 - 18 * scale} 55 ${40 - 14 * scale} 72 L${40 + 14 * scale} 72 Q${40 + 18 * scale} 55 ${40 + 16 * scale} 32 Z`}
          fill="hsl(var(--primary))"
          opacity="0.6"
          style={{ transition: 'all 0.5s ease' }}
        />
        {/* Arms */}
        <path d={`M${40 - 16 * scale} 34 L12 55 L15 58 L${40 - 14 * scale} 42`} fill="hsl(var(--primary))" opacity="0.5" />
        <path d={`M${40 + 16 * scale} 34 L68 55 L65 58 L${40 + 14 * scale} 42`} fill="hsl(var(--primary))" opacity="0.5" />
        {/* Legs */}
        <path d={`M${40 - 12 * scale} 72 L26 110 L32 110 L40 82`} fill="hsl(var(--primary))" opacity="0.5" />
        <path d={`M${40 + 12 * scale} 72 L54 110 L48 110 L40 82`} fill="hsl(var(--primary))" opacity="0.5" />
      </svg>
      {startingWaist && currentWaist && currentWaist < startingWaist && (
        <p className="text-[10px] text-primary font-medium mt-1">
          -{Math.round((startingWaist - currentWaist) * 10) / 10}cm
        </p>
      )}
    </div>
  );
}
