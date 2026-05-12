import { useState, useCallback, useMemo } from "react";
import { Users, Copy, Trophy, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { loadState, saveState, getToday } from "@/lib/store";
import { toast } from "sonner";

interface Friend {
  code: string;
  name: string;
  weeklyWorkouts: number;
  weeklySteps: number;
}

export default function FriendChallenges() {
  const [state, setState] = useState(() => loadState());
  const [showAdd, setShowAdd] = useState(false);
  const [friendCode, setFriendCode] = useState("");
  const [friendName, setFriendName] = useState("");

  // Generate user's unique code from start date hash
  const myCode = useMemo(() => {
    const hash = state.startDate.replace(/-/g, '').slice(-6);
    return hash.padStart(6, '0');
  }, [state.startDate]);

  const friends: Friend[] = useMemo(() => {
    return (state as any).friends || [];
  }, [state]);

  const myWeeklyWorkouts = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    return state.workoutLogs.filter(l => new Date(l.date) >= weekStart).length;
  }, [state.workoutLogs]);

  const addFriend = useCallback(() => {
    if (!friendCode || friendCode.length !== 6) { toast.error("Enter a valid 6-digit code"); return; }
    const s = loadState();
    const existing = ((s as any).friends || []) as Friend[];
    if (existing.find(f => f.code === friendCode)) { toast.error("Already added"); return; }
    (s as any).friends = [...existing, { code: friendCode, name: friendName || `Friend ${existing.length + 1}`, weeklyWorkouts: 0, weeklySteps: 0 }];
    saveState(s);
    setState(s);
    setShowAdd(false);
    setFriendCode("");
    setFriendName("");
    toast.success("Friend added!");
  }, [friendCode, friendName]);

  const copyCode = () => {
    navigator.clipboard.writeText(myCode);
    toast.success("Code copied!");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Friends & Challenges</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} className="h-7 text-xs">
          <UserPlus className="w-3 h-3 mr-1" /> Add
        </Button>
      </div>

      {/* My code */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-muted-foreground">Your code:</span>
        <span className="font-display font-bold text-primary tracking-widest">{myCode}</span>
        <button onClick={copyCode} className="p-1 rounded hover:bg-secondary"><Copy className="w-3 h-3" /></button>
      </div>

      {/* Weekly challenge */}
      <div className="space-y-2">
        <div className="flex items-center justify-between glass-card p-2 rounded-lg">
          <span className="text-xs font-medium">You</span>
          <span className="text-sm font-display font-bold text-primary">{myWeeklyWorkouts} workouts</span>
        </div>
        {friends.map(f => (
          <div key={f.code} className="flex items-center justify-between glass-card p-2 rounded-lg">
            <span className="text-xs font-medium">{f.name}</span>
            <span className="text-sm font-display font-bold">{f.weeklyWorkouts} workouts</span>
          </div>
        ))}
        {friends.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">Share your code to add friends</p>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Add Friend</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Friend's 6-digit code</label>
              <Input value={friendCode} onChange={e => setFriendCode(e.target.value)} maxLength={6} placeholder="123456" className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Nickname (optional)</label>
              <Input value={friendName} onChange={e => setFriendName(e.target.value)} placeholder="John" className="mt-1" />
            </div>
            <Button onClick={addFriend} className="w-full font-display">Add Friend</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
