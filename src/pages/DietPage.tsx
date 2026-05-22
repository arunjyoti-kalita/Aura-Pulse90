import { useState, useMemo, useCallback, useEffect } from "react";
import { Droplets, CheckCircle2, XCircle, Circle, Plus, Minus, Camera, Cookie, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loadState, saveState, getToday, getDietLog, getWeeklyDietScore, genId, useSyncState, patchState, formatDate } from "@/lib/store";
import type { DietLog, FoodLogEntry } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MacroTracker from "@/components/MacroTracker";
import CalorieBalance from "@/components/CalorieBalance";
import FoodLoggerModal from "@/components/FoodLoggerModal";
import { foodDatabase, quickAddItems, quickAddItemsByMeal } from "@/lib/foodDatabase";

const mealColors: Record<string, string> = {
  'Breakfast': 'border-l-amber-400',
  'Lunch': 'border-l-emerald-400',
  'Snack': 'border-l-purple-400',
  'Dinner': 'border-l-blue-400',
};

export default function DietPage() {
  const [state, setState] = useSyncState();
  const today = getToday();
  const dietLog = useMemo(() => getDietLog(state.dietLogs || [], today, state.settings?.meals || []), [state.dietLogs, today, state.settings?.meals]);
  const weekScore = useMemo(() => getWeeklyDietScore(state.dietLogs || [], state.startDate), [state]);
  const waterGoal = state.settings?.dailyWaterGoal || 10;
  const ft = state.settings?.featureToggles || ({} as any);

  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [foodModalMeal, setFoodModalMeal] = useState("");
  const [expandedSummary, setExpandedSummary] = useState(false);

  const weekStart = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay());
    return formatDate(d);
  }, [today]);
  const cheatUsedThisWeek = useMemo(() => {
    if (!state.dietLogs) return false;
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return state.dietLogs.some(d => {
      const date = new Date(d.date);
      return d.cheatMeal && date >= new Date(weekStart) && date < weekEnd;
    });
  }, [state.dietLogs, weekStart]);

  const persist = useCallback((updated: DietLog) => {
    patchState(s => {
      s.dietLogs = (s.dietLogs || []).filter(d => d.date !== today);
      s.dietLogs.push(updated);
    });
  }, [today]);

  const refreshState = useCallback(() => setState(loadState()), []);

  // useEffect removed as useSyncState and useMemo handle reactivity now

  // Food entries helpers
  const foodEntries = dietLog.foodEntries || [];

  const dailyTotals = useMemo(() => {
    return foodEntries.reduce((acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [foodEntries]);

  const getMealEntries = (mealName: string) => foodEntries.filter(e => e.mealName === mealName);
  const getMealTotals = (mealName: string) => {
    const entries = getMealEntries(mealName);
    return entries.reduce((acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const handleAddFood = (entry: FoodLogEntry) => {
    const updated = { ...dietLog, foodEntries: [...foodEntries, entry] };
    persist(updated);
  };

  const handleRemoveFood = (entryId: string) => {
    const updated = { ...dietLog, foodEntries: foodEntries.filter(e => e.id !== entryId) };
    persist(updated);
  };

  const openFoodModal = (mealName: string) => {
    setFoodModalMeal(mealName);
    setFoodModalOpen(true);
  };

  const handleQuickAdd = (mealName: string, item: typeof quickAddItems[0]) => {
    let food = foodDatabase.find(f => f.id === item.id);
    if (!food && item.id === 'protein-shake') {
      // Handle items not in database but in quickAddItems
      food = {
        id: 'protein-shake',
        name: 'Protein Shake',
        calories: 150,
        protein: 25,
        carbs: 5,
        fat: 2,
        serving: '1 scoop',
        servingType: 'piece',
        category: 'Protein'
      } as any;
    }
    
    if (food) {
      const entry: FoodLogEntry = {
        id: genId(),
        foodId: food.id,
        foodName: food.name,
        quantity: 1,
        serving: food.serving,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        mealName: mealName
      };
      handleAddFood(entry);
      toast.success(`Quick added ${food.name} to ${mealName}`);
    }
  };

  // Macro targets
  const { proteinTarget, carbTarget, fatTarget, calorieTarget } = state.settings;

  const toggleWater = () => {
    const nextVal = !dietLog.waterOnWaking;
    const nextGlasses = nextVal ? dietLog.waterGlasses + 2 : Math.max(0, dietLog.waterGlasses - 2);
    persist({ ...dietLog, waterOnWaking: nextVal, waterGlasses: nextGlasses });
  };
  const setMealStatus = (idx: number, status: 'clean' | 'bad') => {
    const meals = [...dietLog.meals];
    meals[idx] = { ...meals[idx], status: meals[idx].status === status ? null : status };
    persist({ ...dietLog, meals });
  };
  const adjustWater = (delta: number) => {
    const glasses = Math.max(0, Math.min(20, dietLog.waterGlasses + delta));
    persist({ ...dietLog, waterGlasses: glasses });
  };
  const toggleCheatMeal = () => {
    if (dietLog.cheatMeal) { persist({ ...dietLog, cheatMeal: false }); }
    else if (!cheatUsedThisWeek) { persist({ ...dietLog, cheatMeal: true }); toast.success("Cheat meal logged! Enjoy it guilt-free 🍕"); }
    else { toast.error("You've already used your weekly cheat meal!"); }
  };

  const handleMealPhoto = (mealName: string) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const photos = { ...(dietLog.mealPhotos || {}), [mealName]: reader.result as string };
        persist({ ...dietLog, mealPhotos: photos });
        toast.success(`Photo saved for ${mealName}`);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // Macro ring helper
  const macroRing = (current: number, target: number, color: string, size: number = 48) => {
    const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    const r = (size - 6) / 2;
    const circumference = 2 * Math.PI * r;
    return (
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
          strokeLinecap="round" />
      </svg>
    );
  };

  const macroStatus = (current: number, target: number) => {
    const diff = Math.abs((current / Math.max(1, target)) * 100 - 100);
    if (diff <= 10) return 'text-primary';
    if (diff <= 20) return 'text-amber-400';
    return 'text-destructive';
  };

  // Generate macro logs from food entries for CalorieBalance/MacroTracker compatibility
  const syntheticMacroLogs = useMemo(() => {
    if (foodEntries.length === 0) return state.macroLogs;
    const foodMacros = foodEntries.map(e => ({
      date: today,
      mealName: e.mealName,
      protein: e.protein,
      carbs: e.carbs,
      fat: e.fat,
      calories: e.calories,
    }));
    // Merge: keep non-today macroLogs, replace today with food-based
    const otherDays = state.macroLogs.filter(l => l.date !== today);
    return [...otherDays, ...foodMacros];
  }, [foodEntries, state.macroLogs, today]);


  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="pb-32 relative">
      {/* Background Mask for Header */}
      <div className="absolute top-0 left-0 right-0 h-32 z-0">
        <img 
          src="/images/healthy_food_bg.png" 
          alt="Diet" 
          className="w-full h-full object-cover hero-mask opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 to-background" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 px-5 pt-12 max-w-lg mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-2">
          <p className="text-[28px] font-bold leading-tight text-foreground tracking-tight">
            Dietary <span className="text-primary">Pulse</span>
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider">
              Score: {weekScore}%
            </div>
            <p className="text-xs text-muted-foreground">
              Fueling your 90-day transformation
            </p>
          </div>
        </motion.div>

        {/* Daily Summary Card */}
        <motion.div variants={itemVariants}>
          <button 
            onClick={() => setExpandedSummary(!expandedSummary)} 
            className="w-full glass-card-premium p-4 text-left relative overflow-hidden group shadow-2xl"
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <p className="section-label text-white/50">Daily Energy</p>
                </div>
                <p className="text-3xl font-bold text-white tracking-tighter">
                  {dailyTotals.calories.toLocaleString()}
                  <span className="text-sm font-medium text-muted-foreground ml-1.5 tracking-normal">cal</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative group-hover:scale-110 transition-transform">
                  {macroRing(dailyTotals.protein, proteinTarget, "hsl(var(--primary))", 32)}
                  <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-primary">P</div>
                </div>
                <div className="relative group-hover:scale-110 transition-transform delay-75">
                  {macroRing(dailyTotals.carbs, carbTarget, "hsl(210 80% 55%)", 40)}
                  <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-info">C</div>
                </div>
                <div className="relative group-hover:scale-110 transition-transform delay-150">
                  {macroRing(dailyTotals.fat, fatTarget, "hsl(38 92% 50%)", 40)}
                  <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-warning">F</div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSummary && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }} 
                  className="overflow-hidden"
                >
                  <div className="mt-6 pt-5 border-t border-white/10 space-y-4">
                    <MacroBar label="Protein" current={Math.round(dailyTotals.protein)} target={proteinTarget} color="hsl(var(--primary))" />
                    <MacroBar label="Carbs" current={Math.round(dailyTotals.carbs)} target={carbTarget} color="hsl(210 80% 55%)" />
                    <MacroBar label="Fat" current={Math.round(dailyTotals.fat)} target={fatTarget} color="hsl(38 92% 50%)" />
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Progress</span>
                      <span className={`text-sm font-black tracking-tight ${macroStatus(dailyTotals.calories, calorieTarget)}`}>
                        {Math.round((dailyTotals.calories / calorieTarget) * 100)}% of Limit
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-center mt-3 text-muted-foreground/30">
              {expandedSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
        </motion.div>

        {/* Water on Waking */}
        <motion.button variants={itemVariants}
          onClick={toggleWater}
          className={`w-full glass-card p-5 mt-4 flex items-center gap-4 transition-all duration-300 ${dietLog.waterOnWaking ? 'border-primary/40 bg-primary/5' : 'hover:bg-white/5'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${dietLog.waterOnWaking ? 'bg-primary/20' : 'bg-secondary'}`}>
            <Droplets className={`w-5 h-5 ${dietLog.waterOnWaking ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-sm">Morning Hydration</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest mt-0.5">500ml upon waking</p>
          </div>
          {dietLog.waterOnWaking ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <Circle className="w-6 h-6 text-muted-foreground/20" />}
        </motion.button>

      {/* Meal Cards with Food Logging */}
      <div className="mt-5 space-y-3">
        {dietLog.meals.map((meal, i) => {
          const mealEntries = getMealEntries(meal.name);
          const mealTotals = getMealTotals(meal.name);
          const colorClass = mealColors[meal.name] || 'border-l-muted';
          const mealConfig = state.settings.meals.find(m => m.name === meal.name);

          return (
            <motion.div key={meal.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}
              className={`glass-card p-2.5 border-l-4 ${colorClass}`}>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <span className="font-medium">{meal.name}</span>
                  {mealConfig?.time && <span className="text-xs text-muted-foreground ml-2">· {mealConfig.time.replace(/^0/, '')}</span>}
                </div>
                {ft.mealPhotos && (
                  <button onClick={() => handleMealPhoto(meal.name)} className="p-2 rounded-lg hover:bg-secondary">
                    <Camera className={`w-4 h-4 ${dietLog.mealPhotos?.[meal.name] ? 'text-primary' : 'text-muted-foreground/40'}`} />
                  </button>
                )}
                <button onClick={() => setMealStatus(i, 'clean')} className={`p-2 rounded-lg transition-colors ${meal.status === 'clean' ? 'bg-primary/20' : 'hover:bg-secondary'}`}>
                  <CheckCircle2 className={`w-5 h-5 ${meal.status === 'clean' ? 'text-primary' : 'text-muted-foreground/40'}`} />
                </button>
                <button onClick={() => setMealStatus(i, 'bad')} className={`p-2 rounded-lg transition-colors ${meal.status === 'bad' ? 'bg-destructive/20' : 'hover:bg-secondary'}`}>
                  <XCircle className={`w-5 h-5 ${meal.status === 'bad' ? 'text-destructive' : 'text-muted-foreground/40'}`} />
                </button>
              </div>

              {ft.mealPhotos && dietLog.mealPhotos?.[meal.name] && (
                <img src={dietLog.mealPhotos[meal.name]} alt={meal.name} className="w-full h-24 object-cover rounded-lg mt-2" />
              )}

              {/* Food entries list */}
              {mealEntries.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {mealEntries.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between bg-secondary/30 rounded-lg px-2.5 py-1.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{entry.foodName} <span className="text-muted-foreground">×{entry.quantity}</span></p>
                        <p className="text-[11px] text-muted-foreground">{entry.calories} cal · P{Math.round(entry.protein)}g · C{Math.round(entry.carbs)}g · F{Math.round(entry.fat)}g</p>
                      </div>
                      <button onClick={() => handleRemoveFood(entry.id)} className="p-1 ml-2 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs pt-1 border-t border-border/50">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{mealTotals.calories} cal · P{Math.round(mealTotals.protein)}g · C{Math.round(mealTotals.carbs)}g · F{Math.round(mealTotals.fat)}g</span>
                  </div>
                </div>
              )}

              {mealEntries.length === 0 && (
                <p className="text-xs text-muted-foreground/60 mt-2">Tap Add Food to log your meal</p>
              )}

              {/* Quick Add Buttons */}
              <div className="mt-2 flex flex-wrap gap-2">
                {(quickAddItemsByMeal[meal.name] || []).map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleQuickAdd(meal.name, item)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/40 hover:bg-secondary/60 border border-border/20 transition-colors text-[11px] font-medium animate-fade-in"
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={() => openFoodModal(meal.name)} className="w-full mt-2 h-7 text-xs">
                <Plus className="w-3 h-3 mr-1" /> Add Food
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Calorie Balance */}
      {ft.calorieBalance && (
        <CalorieBalance
          macroLogs={syntheticMacroLogs}
          workoutLogs={state.workoutLogs}
          settings={state.settings}
          currentWeight={state.currentWeight}
          today={today}
        />
      )}

      {/* Macro Tracker (existing, uses syntheticMacroLogs) */}
      {ft.macroTracking && (
        <MacroTracker
          macroLogs={syntheticMacroLogs}
          proteinTarget={proteinTarget}
          carbTarget={carbTarget}
          fatTarget={fatTarget}
          calorieTarget={calorieTarget}
          meals={state.settings.meals.filter(m => m.enabled)}
          barcodeEnabled={ft.barcodeScanner}
          onUpdate={refreshState}
        />
      )}

      {/* Cheat Meal */}
      {ft.cheatMealTracker && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <button onClick={toggleCheatMeal} className={`w-full glass-card p-4 mt-4 flex items-center gap-3 ${dietLog.cheatMeal ? 'border-amber-400/50' : ''}`}>
            <Cookie className={`w-5 h-5 ${dietLog.cheatMeal ? 'text-amber-400' : 'text-muted-foreground'}`} />
            <div className="flex-1 text-left">
              <p className="font-medium text-sm">Weekly Cheat Meal</p>
              <p className="text-[11px] text-muted-foreground">
                {dietLog.cheatMeal ? '🎉 Logged today — enjoy!' : cheatUsedThisWeek ? 'Already used this week' : '1 guilt-free meal available'}
              </p>
            </div>
            {dietLog.cheatMeal ? <CheckCircle2 className="w-5 h-5 text-amber-400" /> : <Circle className="w-5 h-5 text-muted-foreground/40" />}
          </button>
        </motion.div>
      )}

      {/* Water Intake */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-5 mt-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Water Intake</p>
        <div className="flex items-center justify-between">
          <button onClick={() => adjustWater(-1)} className="p-2 rounded-lg hover:bg-secondary"><Minus className="w-5 h-5" /></button>
          <div className="text-center">
            <p className="text-3xl font-display font-bold">{dietLog.waterGlasses}</p>
            <p className="text-xs text-muted-foreground">glasses (target {waterGoal})</p>
          </div>
          <button onClick={() => adjustWater(1)} className="p-2 rounded-lg hover:bg-secondary"><Plus className="w-5 h-5" /></button>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full mt-3 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (dietLog.waterGlasses / waterGoal) * 100)}%` }} />
        </div>
      </motion.div>

      {/* Food Logger Modal */}
      <FoodLoggerModal
        open={foodModalOpen}
        onOpenChange={setFoodModalOpen}
        mealName={foodModalMeal}
        onAddFood={handleAddFood}
      />
      </motion.div>
    </div>
  );
}

function MacroBar({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const pct = target > 0 ? (current / target) * 100 : 0;
  const diff = Math.abs(pct - 100);
  const statusColor = diff <= 10 ? 'text-primary' : diff <= 20 ? 'text-amber-400' : 'text-destructive';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className={statusColor}>{current}g / {target}g</span>
      </div>
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
      </div>
    </div>
  );
}
