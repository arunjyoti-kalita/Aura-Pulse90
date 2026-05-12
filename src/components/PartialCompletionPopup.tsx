import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ExerciseStat {
  name: string;
  completed: number;
  total: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  exerciseStats: ExerciseStat[];
  completionPct: number;
}

export default function PartialCompletionPopup({ open, onClose, onConfirm, exerciseStats, completionPct }: Props) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Finish today's workout?</DialogTitle>
          <DialogDescription>Here's a summary of your session</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 my-2">
          {exerciseStats.map(ex => {
            const status = ex.completed === 0 ? 'skipped' : ex.completed === ex.total ? 'done' : 'partial';
            const dotColor = status === 'done'
              ? 'bg-primary'
              : status === 'partial'
                ? 'bg-amber-500'
                : 'bg-destructive';
            const label = status === 'skipped' ? 'Skipped' : `${ex.completed} of ${ex.total} sets done`;

            return (
              <div key={ex.name} className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                <span className="flex-1 truncate">{ex.name}</span>
                <span className="text-muted-foreground text-xs">{label}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Overall</span>
            <span className="font-semibold text-amber-400">{completionPct}%</span>
          </div>
          <Progress value={completionPct} className="h-2" />
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Go Back
          </Button>
          <Button onClick={onConfirm} className="flex-1 bg-amber-500 hover:bg-amber-600 text-black">
            Complete Anyway
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
