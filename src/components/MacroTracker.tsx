import { useState, useMemo, useCallback } from "react";
import { Plus, Minus, ScanLine } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { loadState, saveState, getToday } from "@/lib/store";
import type { MacroLog } from "@/lib/store";
import { toast } from "sonner";

interface MacroTrackerProps {
  macroLogs: MacroLog[];
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  calorieTarget: number;
  meals: { name: string }[];
  barcodeEnabled: boolean;
  onUpdate: () => void;
}

export default function MacroTracker({ macroLogs, proteinTarget, carbTarget, fatTarget, calorieTarget, meals, barcodeEnabled, onUpdate }: MacroTrackerProps) {
  const today = getToday();
  const [showLog, setShowLog] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [scanResult, setScanResult] = useState<string | null>(null);

  const todayLogs = useMemo(() => macroLogs.filter(l => l.date === today), [macroLogs, today]);

  const totals = useMemo(() => {
    const raw = todayLogs.reduce((acc, l) => ({
      protein: acc.protein + l.protein,
      carbs: acc.carbs + l.carbs,
      fat: acc.fat + l.fat,
      calories: acc.calories + l.calories,
    }), { protein: 0, carbs: 0, fat: 0, calories: 0 });
    return {
      protein: Math.round(raw.protein * 100) / 100,
      carbs: Math.round(raw.carbs * 100) / 100,
      fat: Math.round(raw.fat * 100) / 100,
      calories: Math.round(raw.calories),
    };
  }, [todayLogs]);

  const logMacro = useCallback(() => {
    if (!selectedMeal) { toast.error("Select a meal"); return; }
    const p = parseFloat(protein) || 0;
    const c = parseFloat(carbs) || 0;
    const f = parseFloat(fat) || 0;
    const cal = Math.round(p * 4 + c * 4 + f * 9);
    const s = loadState();
    s.macroLogs.push({ date: today, mealName: selectedMeal, protein: p, carbs: c, fat: f, calories: cal });
    saveState(s);
    onUpdate();
    setProtein(""); setCarbs(""); setFat("");
    setShowLog(false);
    toast.success(`${selectedMeal} macros logged!`);
  }, [selectedMeal, protein, carbs, fat, today, onUpdate]);

  const scanBarcode = async () => {
    const code = prompt("Enter barcode number:");
    if (!code) return;
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product?.nutriments) {
        const n = data.product.nutriments;
        setProtein(String(Math.round(n.proteins_100g || 0)));
        setCarbs(String(Math.round(n.carbohydrates_100g || 0)));
        setFat(String(Math.round(n.fat_100g || 0)));
        setScanResult(data.product.product_name || "Product found");
        toast.success(`Found: ${data.product.product_name}`);
      } else {
        toast.error("Product not found — enter manually");
      }
    } catch {
      toast.error("Scan failed — enter manually");
    }
  };

  const macroBar = (label: string, current: number, target: number, color: string) => {
    const pct = target > 0 ? (current / target) * 100 : 0;
    const diff = Math.abs(pct - 100);
    const statusColor = diff <= 10 ? 'text-primary' : diff <= 20 ? 'text-amber-400' : 'text-destructive';
    return (
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">{label}</span>
          <span className={statusColor}>{Math.round(current * 100) / 100}g / {target}g</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
        </div>
      </div>
    );
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Macro Tracker</p>
          <Button size="sm" variant="outline" onClick={() => setShowLog(true)} className="h-7 text-xs">
            <Plus className="w-3 h-3 mr-1" /> Log
          </Button>
        </div>

        {/* Protein Ring - prominent */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                strokeDasharray={`${Math.min(100, (totals.protein / proteinTarget) * 100) * 2.64} 264`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-lg font-display font-bold">{totals.protein}g</p>
              <p className="text-[9px] text-muted-foreground">Protein</p>
            </div>
          </div>
        </div>

        {macroBar("Protein", totals.protein, proteinTarget, "hsl(var(--primary))")}
        {macroBar("Carbs", totals.carbs, carbTarget, "hsl(210 80% 55%)")}
        {macroBar("Fat", totals.fat, fatTarget, "hsl(38 92% 50%)")}

        <div className="flex justify-between mt-3 pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">Calories</span>
          <span className="text-sm font-display font-bold">{totals.calories} / {calorieTarget}</span>
        </div>
      </motion.div>

      <Dialog open={showLog} onOpenChange={setShowLog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Log Macros</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {meals.map(m => (
                <button key={m.name} onClick={() => setSelectedMeal(m.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${selectedMeal === m.name ? 'bg-primary text-primary-foreground' : 'glass-card hover:border-primary/50'}`}>
                  {m.name}
                </button>
              ))}
            </div>
            {scanResult && <p className="text-xs text-primary">📦 {scanResult}</p>}
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-[10px] text-muted-foreground">Protein (g)</label><Input value={protein} onChange={e => setProtein(e.target.value)} type="number" className="h-8 text-sm mt-0.5" /></div>
              <div><label className="text-[10px] text-muted-foreground">Carbs (g)</label><Input value={carbs} onChange={e => setCarbs(e.target.value)} type="number" className="h-8 text-sm mt-0.5" /></div>
              <div><label className="text-[10px] text-muted-foreground">Fat (g)</label><Input value={fat} onChange={e => setFat(e.target.value)} type="number" className="h-8 text-sm mt-0.5" /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={logMacro} className="flex-1 font-display">Log Macros</Button>
              {barcodeEnabled && (
                <Button variant="outline" onClick={scanBarcode}><ScanLine className="w-4 h-4" /></Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
