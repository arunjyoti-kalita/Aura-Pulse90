import { useState, useRef, useCallback } from "react";
import { Share2, Download, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface WorkoutShareCardProps {
  workoutName: string;
  setsCompleted: number;
  totalSets: number;
  intensityScore: number;
  streak: number;
  date: string;
  xp: number;
  completionPct: number;
}

export default function WorkoutShareCard(props: WorkoutShareCardProps) {
  const [open, setOpen] = useState(false);
  const [showStats, setShowStats] = useState({ sets: true, intensity: true, streak: true, xp: true });
  const cardRef = useRef<HTMLDivElement>(null);

  const quotes = [
    "The body achieves what the mind believes.",
    "Discipline is choosing between what you want now and what you want most.",
    "Every rep counts. Every day matters.",
    "You didn't come this far to only come this far.",
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  const downloadCard = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement('a');
      link.download = `transform90-${props.date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success("Share card downloaded!");
    } catch {
      toast.error("Could not generate image");
    }
  }, [props.date]);

  const shareCard = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `transform90-${props.date}.png`, { type: 'image/png' });
        if (navigator.share) {
          await navigator.share({ files: [file], title: 'Transform 90 Workout' });
        } else {
          downloadCard();
        }
      });
    } catch {
      downloadCard();
    }
  }, [props.date, downloadCard]);

  const toggleStat = (key: keyof typeof showStats) => setShowStats(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="w-full mt-3 font-display">
        <Share2 className="w-4 h-4 mr-2" /> Share Your Workout
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Share Card</DialogTitle>
          </DialogHeader>

          {/* The card */}
          <div ref={cardRef} className="rounded-xl p-5 text-center" style={{
            background: 'linear-gradient(135deg, hsl(160 30% 8%), hsl(142 30% 12%), hsl(160 20% 6%))',
            border: '1px solid hsl(142 71% 45% / 0.3)',
          }}>
            <p className="text-primary font-display font-bold text-lg">Transform <span style={{ color: 'hsl(142 71% 45%)' }}>90</span></p>
            <p className="text-xs" style={{ color: 'hsl(0 0% 70%)' }}>{props.date}</p>
            <p className="font-display font-bold text-lg mt-3" style={{ color: 'hsl(0 0% 95%)' }}>{props.workoutName}</p>
            <p className="text-xs mt-1" style={{ color: 'hsl(142 71% 45%)' }}>{props.completionPct}% Complete</p>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {showStats.sets && (
                <div className="rounded-lg p-2" style={{ background: 'hsl(142 71% 45% / 0.1)' }}>
                  <p className="font-display font-bold" style={{ color: 'hsl(0 0% 95%)' }}>{props.setsCompleted}/{props.totalSets}</p>
                  <p className="text-[9px]" style={{ color: 'hsl(0 0% 60%)' }}>Sets</p>
                </div>
              )}
              {showStats.intensity && (
                <div className="rounded-lg p-2" style={{ background: 'hsl(142 71% 45% / 0.1)' }}>
                  <p className="font-display font-bold" style={{ color: 'hsl(0 0% 95%)' }}>{props.intensityScore}</p>
                  <p className="text-[9px]" style={{ color: 'hsl(0 0% 60%)' }}>Intensity</p>
                </div>
              )}
              {showStats.streak && (
                <div className="rounded-lg p-2" style={{ background: 'hsl(142 71% 45% / 0.1)' }}>
                  <p className="font-display font-bold" style={{ color: 'hsl(0 0% 95%)' }}>{props.streak}🔥</p>
                  <p className="text-[9px]" style={{ color: 'hsl(0 0% 60%)' }}>Streak</p>
                </div>
              )}
              {showStats.xp && (
                <div className="rounded-lg p-2" style={{ background: 'hsl(142 71% 45% / 0.1)' }}>
                  <p className="font-display font-bold" style={{ color: 'hsl(0 0% 95%)' }}>{props.xp} XP</p>
                  <p className="text-[9px]" style={{ color: 'hsl(0 0% 60%)' }}>Total</p>
                </div>
              )}
            </div>

            <p className="text-[10px] italic mt-3" style={{ color: 'hsl(0 0% 55%)' }}>"{quote}"</p>
          </div>

          {/* Toggle stats */}
          <div className="flex gap-2 flex-wrap">
            {Object.entries(showStats).map(([key, val]) => (
              <button key={key} onClick={() => toggleStat(key as keyof typeof showStats)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${val ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                {val ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {key}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={downloadCard} variant="outline" className="flex-1"><Download className="w-4 h-4 mr-1" /> Save</Button>
            <Button onClick={shareCard} className="flex-1 font-display"><Share2 className="w-4 h-4 mr-1" /> Share</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
