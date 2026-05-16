import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Plus, Trash2, ArrowRight, Image, Sparkles, Target, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { loadState, patchState, useSyncState, getToday, genId, formatDate } from "@/lib/store";
import { toast } from "sonner";

export default function HabitsPage() {
  const [state, setState] = useSyncState();
  const today = getToday();
  const ft = state.settings.featureToggles;
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newTrigger, setNewTrigger] = useState("");
  const [newAction, setNewAction] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newRuleAction, setNewRuleAction] = useState("");

  const habitStacks = state.settings.habitStacks;
  const ifThenRules = state.settings.ifThenRules;
  const completions = state.habitCompletions;

  const isHabitDone = useCallback((habitId: string) => {
    return completions.some(c => c.date === today && c.habitId === habitId);
  }, [completions, today]);

  const toggleHabit = useCallback((habitId: string) => {
    patchState(s => {
      const existing = s.habitCompletions.find(c => c.date === today && c.habitId === habitId);
      if (existing) {
        s.habitCompletions = s.habitCompletions.filter(c => !(c.date === today && c.habitId === habitId));
      } else {
        s.habitCompletions.push({ date: today, habitId });
        if (ft.xpSystem) s.xp = (s.xp || 0) + 5;
      }
    });
  }, [today, ft.xpSystem]);

  const habitStreak = useCallback((habitId: string) => {
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 90; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const ds = formatDate(d);
      if (completions.some(c => c.date === ds && c.habitId === habitId)) streak++;
      else break;
    }
    return streak;
  }, [completions]);

  const addHabitStack = () => {
    if (!newTrigger || !newAction) return;
    patchState(s => {
      s.settings.habitStacks.push({ id: genId(), trigger: newTrigger, action: newAction, enabled: true });
    });
    setNewTrigger(""); setNewAction(""); setShowAddHabit(false);
    toast.success("Stack added.");
  };

  const addIfThenRule = () => {
    if (!newCondition || !newRuleAction) return;
    patchState(s => {
      s.settings.ifThenRules.push({ id: genId(), condition: newCondition, action: newRuleAction, enabled: true });
    });
    setNewCondition(""); setNewRuleAction(""); setShowAddRule(false);
    toast.success("Rule added.");
  };

  const removeHabit = (id: string) => {
    patchState(s => {
      s.settings.habitStacks = s.settings.habitStacks.filter(h => h.id !== id);
    });
  };

  const removeRule = (id: string) => {
    patchState(s => {
      s.settings.ifThenRules = s.settings.ifThenRules.filter(r => r.id !== id);
    });
  };

  const handleVisionPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        patchState(s => {
          s.settings.goalVisionPhoto = reader.result as string;
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto relative z-10">
      {/* Technical Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black italic text-white tracking-tight leading-none">SYSTEMS</h1>
          <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Architecture of Identity</p>
        </div>
        <div className="flex gap-2">
           <Button size="sm" variant="outline" onClick={() => setShowAddHabit(true)} className="h-7 text-[8px] font-black uppercase tracking-widest px-2 border-white/10 bg-white/5">
             + STACK
           </Button>
           <Button size="sm" variant="outline" onClick={() => setShowAddRule(true)} className="h-7 text-[8px] font-black uppercase tracking-widest px-2 border-white/10 bg-white/5">
             + RULE
           </Button>
        </div>
      </div>

      {/* Habit Stacking - 2 Column Grid */}
      {ft.habitStacking && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-3 h-3 text-primary" />
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Habit Stacks</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {habitStacks.filter(h => h.enabled).map(h => {
              const done = isHabitDone(h.id);
              const streak = habitStreak(h.id);
              return (
                <div key={h.id} className={`glass-card-premium p-2 flex flex-col justify-between transition-all duration-300 border-white/5 ${done ? 'bg-primary/5 border-primary/20' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <button onClick={() => toggleHabit(h.id)}>
                      {done ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4 text-white/10" />}
                    </button>
                    <button onClick={() => removeHabit(h.id)} className="text-white/10 hover:text-destructive transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[7px] text-white/30 uppercase font-black truncate">{h.trigger}</p>
                    <p className="text-[11px] font-black text-white leading-none line-clamp-2">{h.action}</p>
                  </div>
                  {streak > 0 && (
                    <p className="text-[8px] font-black text-primary mt-2">{streak}🔥</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* If-Then Plans - 2 Column Grid */}
      {ft.ifThenPlanner && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Rules</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ifThenRules.filter(r => r.enabled).map(r => (
              <div key={r.id} className="glass-card-premium p-3 border-white/5 flex flex-col justify-between h-24">
                <div className="flex justify-between items-start">
                   <p className="text-[7px] text-amber-400/60 uppercase font-black">IF {r.condition}</p>
                   <button onClick={() => removeRule(r.id)} className="text-white/10 hover:text-destructive">
                     <Trash2 className="w-3 h-3" />
                   </button>
                </div>
                <p className="text-[10px] font-black text-white/90 leading-tight">THEN {r.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Vision - Compact */}
      {ft.goalVisualization && (
        <div className="mb-6">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Vision</p>
          <div className="glass-card-premium p-3 border-white/5 space-y-3">
            <Textarea
              value={state.settings.goalVisionText}
              onChange={e => {
                const s = loadState(); s.settings.goalVisionText = e.target.value; saveState(s); setState(s);
              }}
              placeholder="The vision..."
              className="bg-white/5 border-none h-16 text-[10px] p-2 placeholder:text-white/10 resize-none font-bold"
            />
            <div className="relative rounded-lg overflow-hidden border border-white/5">
              {state.settings.goalVisionPhoto ? (
                <img src={state.settings.goalVisionPhoto} className="w-full h-24 object-cover opacity-60" />
              ) : (
                <Button variant="outline" onClick={handleVisionPhoto} className="w-full h-12 border-dashed border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/20">
                  + VISION IMAGE
                </Button>
              )}
              {state.settings.goalVisionPhoto && (
                <button onClick={handleVisionPhoto} className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center text-[8px] font-black text-white uppercase transition-opacity">Change</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Affirmations - Grid */}
      {ft.affirmations && (
        <div>
          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Identity Affirmations</p>
          <div className="grid grid-cols-2 gap-2">
            {state.settings.customAffirmations.map((a, i) => (
              <div key={i} className="glass-card-premium p-2 border-white/5 bg-gradient-to-br from-primary/5 to-transparent">
                <p className="text-[9px] font-black text-white/70 italic leading-tight">"{a}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs - Minimalized */}
      <Dialog open={showAddHabit} onOpenChange={setShowAddHabit}>
        <DialogContent className="glass-card-premium bg-black/90 text-white max-w-[300px]">
          <DialogHeader><DialogTitle className="text-[11px] font-black uppercase tracking-widest text-center">New Stack</DialogTitle></DialogHeader>
          <div className="space-y-3 p-2">
            <Input value={newTrigger} onChange={e => setNewTrigger(e.target.value)} placeholder="After I..." className="h-9 bg-white/5 text-[10px] font-bold" />
            <Input value={newAction} onChange={e => setNewAction(e.target.value)} placeholder="I will..." className="h-9 bg-white/5 text-[10px] font-bold" />
            <Button onClick={addHabitStack} className="w-full h-9 text-[10px] font-black uppercase tracking-widest">ADD STACK</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddRule} onOpenChange={setShowAddRule}>
        <DialogContent className="glass-card-premium bg-black/90 text-white max-w-[300px]">
          <DialogHeader><DialogTitle className="text-[11px] font-black uppercase tracking-widest text-center">New Rule</DialogTitle></DialogHeader>
          <div className="space-y-3 p-2">
            <Input value={newCondition} onChange={e => setNewCondition(e.target.value)} placeholder="If..." className="h-9 bg-white/5 text-[10px] font-bold" />
            <Input value={newRuleAction} onChange={e => setNewRuleAction(e.target.value)} placeholder="Then..." className="h-9 bg-white/5 text-[10px] font-bold" />
            <Button onClick={addIfThenRule} className="w-full h-9 text-[10px] font-black uppercase tracking-widest">ADD RULE</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
