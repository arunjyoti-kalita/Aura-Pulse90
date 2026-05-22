import { useState, useMemo } from "react";
import { Search, Plus, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { foodDatabase, loadCustomFoods, saveCustomFoods, getQuantityOptions } from "@/lib/foodDatabase";
import type { FoodItem, CustomFoodItem } from "@/lib/foodDatabase";
import type { FoodLogEntry } from "@/lib/store";
import { genId } from "@/lib/store";
import { toast } from "sonner";

interface FoodLoggerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealName: string;
  onAddFood: (entry: FoodLogEntry) => void;
}

export default function FoodLoggerModal({ open, onOpenChange, mealName, onAddFood }: FoodLoggerModalProps) {
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedCustom, setSelectedCustom] = useState<CustomFoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCal, setCustomCal] = useState("");
  const [customP, setCustomP] = useState("");
  const [customC, setCustomC] = useState("");
  const [customF, setCustomF] = useState("");
  const [customServing, setCustomServing] = useState("");

  const customFoods = useMemo(() => loadCustomFoods(), [open]);

  const filteredFoods = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      const dbFiltered = foodDatabase.filter(f => f.allowedMeals.includes(mealName));
      return { custom: customFoods, db: dbFiltered };
    }
    const matches = foodDatabase.filter(f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
    const sortedMatches = [...matches].sort((a, b) => {
      const aAllowed = a.allowedMeals.includes(mealName) ? 1 : 0;
      const bAllowed = b.allowedMeals.includes(mealName) ? 1 : 0;
      return bAllowed - aAllowed;
    });
    return {
      custom: customFoods.filter(f => f.name.toLowerCase().includes(q)),
      db: sortedMatches,
    };
  }, [search, customFoods, mealName]);

  const groupedDb = useMemo(() => {
    const groups: Record<string, FoodItem[]> = {};
    filteredFoods.db.forEach(f => {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f);
    });
    return groups;
  }, [filteredFoods.db]);

  const resetSelection = () => {
    setSelectedFood(null);
    setSelectedCustom(null);
    setQuantity(1);
  };

  const handleAddDbFood = () => {
    if (!selectedFood) return;
    const entry: FoodLogEntry = {
      id: genId(),
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      quantity,
      serving: selectedFood.serving,
      calories: Math.round(selectedFood.calories * quantity),
      protein: Math.round(selectedFood.protein * quantity * 10) / 10,
      carbs: Math.round(selectedFood.carbs * quantity * 10) / 10,
      fat: Math.round(selectedFood.fat * quantity * 10) / 10,
      mealName,
    };
    onAddFood(entry);
    toast.success(`${selectedFood.name} added to ${mealName}`);
    resetSelection();
    setSearch("");
  };

  const handleAddCustomFood = () => {
    if (!selectedCustom) return;
    const entry: FoodLogEntry = {
      id: genId(),
      foodId: selectedCustom.id,
      foodName: selectedCustom.name,
      quantity,
      serving: selectedCustom.serving,
      calories: Math.round(selectedCustom.calories * quantity),
      protein: Math.round(selectedCustom.protein * quantity * 10) / 10,
      carbs: Math.round(selectedCustom.carbs * quantity * 10) / 10,
      fat: Math.round(selectedCustom.fat * quantity * 10) / 10,
      mealName,
    };
    onAddFood(entry);
    toast.success(`${selectedCustom.name} added to ${mealName}`);
    resetSelection();
    setSearch("");
  };

  const handleSaveCustom = () => {
    if (!customName.trim()) { toast.error("Enter a food name"); return; }
    const item: CustomFoodItem = {
      id: `custom-${genId()}`,
      name: customName.trim(),
      serving: customServing.trim() || "1 serving",
      calories: parseFloat(customCal) || 0,
      protein: parseFloat(customP) || 0,
      carbs: parseFloat(customC) || 0,
      fat: parseFloat(customF) || 0,
    };
    const foods = loadCustomFoods();
    foods.push(item);
    saveCustomFoods(foods);
    toast.success(`${item.name} saved to custom foods`);
    setShowCustomForm(false);
    setCustomName(""); setCustomCal(""); setCustomP(""); setCustomC(""); setCustomF(""); setCustomServing("");
  };

  const activeFood = selectedFood || selectedCustom;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetSelection(); onOpenChange(v); }}>
      <DialogContent className="max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display">Add Food to {mealName}</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {activeFood ? (
            <motion.div key="qty" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <button onClick={resetSelection} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                ← Back to search
              </button>
              <div className="glass-card p-4 text-center">
                <p className="font-display font-bold text-lg">{activeFood.name}</p>
                <p className="text-xs text-muted-foreground">{'serving' in activeFood ? activeFood.serving : ''}</p>
                <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                  <div><p className="text-sm font-bold text-primary">{Math.round((activeFood.calories) * quantity)}</p><p className="text-[9px] text-muted-foreground">cal</p></div>
                  <div><p className="text-sm font-bold">{Math.round(activeFood.protein * quantity * 10) / 10}g</p><p className="text-[9px] text-muted-foreground">protein</p></div>
                  <div><p className="text-sm font-bold">{Math.round(activeFood.carbs * quantity * 10) / 10}g</p><p className="text-[9px] text-muted-foreground">carbs</p></div>
                  <div><p className="text-sm font-bold">{Math.round(activeFood.fat * quantity * 10) / 10}g</p><p className="text-[9px] text-muted-foreground">fat</p></div>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Select quantity</p>
                <div className="flex gap-2 flex-wrap">
                  {(selectedFood ? getQuantityOptions(selectedFood.servingType) : [1, 2, 3]).map(q => (
                    <button key={q} onClick={() => setQuantity(q)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${quantity === q ? 'bg-primary text-primary-foreground' : 'glass-card hover:border-primary/50'}`}>
                      {q}×
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={selectedFood ? handleAddDbFood : handleAddCustomFood} className="w-full font-display">
                <Plus className="w-4 h-4 mr-2" /> Add to {mealName}
              </Button>
            </motion.div>
          ) : showCustomForm ? (
            <motion.div key="custom" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              <button onClick={() => setShowCustomForm(false)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                ← Back to search
              </button>
              <Input placeholder="Food name" value={customName} onChange={e => setCustomName(e.target.value)} className="h-9 text-sm" />
              <Input placeholder="Serving size (e.g. 1 cup)" value={customServing} onChange={e => setCustomServing(e.target.value)} className="h-9 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-[10px] text-muted-foreground">Calories</label><Input type="number" value={customCal} onChange={e => setCustomCal(e.target.value)} className="h-8 text-sm mt-0.5" /></div>
                <div><label className="text-[10px] text-muted-foreground">Protein (g)</label><Input type="number" value={customP} onChange={e => setCustomP(e.target.value)} className="h-8 text-sm mt-0.5" /></div>
                <div><label className="text-[10px] text-muted-foreground">Carbs (g)</label><Input type="number" value={customC} onChange={e => setCustomC(e.target.value)} className="h-8 text-sm mt-0.5" /></div>
                <div><label className="text-[10px] text-muted-foreground">Fat (g)</label><Input type="number" value={customF} onChange={e => setCustomF(e.target.value)} className="h-8 text-sm mt-0.5" /></div>
              </div>
              <Button onClick={handleSaveCustom} className="w-full font-display">Save Custom Food</Button>
            </motion.div>
          ) : (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 flex-1 min-h-0 flex flex-col">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search foods..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 max-h-[50vh]">
                {/* Custom foods */}
                {filteredFoods.custom.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Your Custom Foods</p>
                    {filteredFoods.custom.map(f => (
                      <button key={f.id} onClick={() => { setSelectedCustom(f); setQuantity(1); }}
                        className="w-full glass-card p-3 mb-1.5 flex items-center justify-between hover:border-primary/50 transition-colors text-left">
                        <div>
                          <p className="text-sm font-medium">{f.name}</p>
                          <p className="text-[10px] text-muted-foreground">{f.serving} · {f.calories} cal · P{f.protein}g · C{f.carbs}g · F{f.fat}g</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Database foods grouped */}
                {Object.entries(groupedDb).map(([category, foods]) => (
                  <div key={category}>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">{category}</p>
                    {foods.map(f => (
                      <button key={f.id} onClick={() => { setSelectedFood(f); setQuantity(1); }}
                        className="w-full glass-card p-3 mb-1.5 flex items-center justify-between hover:border-primary/50 transition-colors text-left">
                        <div>
                          <p className="text-sm font-medium">{f.name}</p>
                          <p className="text-[10px] text-muted-foreground">{f.serving} · {f.calories} cal · P{f.protein}g · C{f.carbs}g · F{f.fat}g</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                ))}

                {filteredFoods.db.length === 0 && filteredFoods.custom.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No foods found matching "{search}"</p>
                )}
              </div>

              <button onClick={() => setShowCustomForm(true)}
                className="w-full glass-card p-3 text-center text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
                Can't find your food? <span className="text-primary font-medium">Add manually</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
