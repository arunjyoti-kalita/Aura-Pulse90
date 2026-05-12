import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Dumbbell, Apple, TrendingUp, Calendar, Trophy, Wind, Target, MapPin, Users, Settings, Menu, ChevronLeft, Brain, CloudDownload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loadState, getLevel } from "@/lib/store";
import { getDailyQuote } from "@/lib/quotes";
import { downloadBackup } from "@/lib/backup";
import { toast } from "sonner";

const navItems = [
  { path: "/", icon: Home, label: "Dashboard" },
  { path: "/workout", icon: Dumbbell, label: "Workout" },
  { path: "/diet", icon: Apple, label: "Diet" },
  { path: "/progress", icon: TrendingUp, label: "Progress" },
  { path: "/community", icon: Users, label: "Community" },
  { path: "/habits", icon: Target, label: "Habits" },
  { path: "/breathe", icon: Wind, label: "Breathe" },
  { path: "/outdoor", icon: MapPin, label: "Outdoor" },
  { path: "/timeline", icon: Calendar, label: "Timeline" },
  { path: "/badges", icon: Trophy, label: "Badges" },
  { path: "/coach", icon: Brain, label: "Coach" },
  { path: "/settings", icon: Settings, label: "Admin" },
];

const COLLAPSED_W = 64;
const EXPANDED_W = 260;

export default function SideNav() {
  const [expanded, setExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("sidenav_expanded");
    if (saved !== null) return saved === "true";
    return window.innerWidth >= 1024;
  });
  const location = useLocation();
  const navigate = useNavigate();
  const state = loadState();
  const level = getLevel(state.xp);
  const dayNum = Math.max(1, Math.ceil((Date.now() - new Date(state.startDate).getTime()) / 86400000));
  const quote = getDailyQuote(dayNum);

  useEffect(() => {
    localStorage.setItem("sidenav_expanded", String(expanded));
    document.documentElement.style.setProperty(
      "--sidenav-width",
      `${expanded ? EXPANDED_W : COLLAPSED_W}px`
    );
  }, [expanded]);

  const nextLevelXp = level.level === 4 ? 5000 : [500, 1500, 3000][level.level - 1];
  const prevLevelXp = level.level === 1 ? 0 : [0, 500, 1500][level.level - 1];
  const xpProgress = ((state.xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100;

  const userName = "Athlete";
  const userEmail = "";
  const avatarUrl: string | undefined = undefined;

  return (
    <motion.nav
      animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
      transition={{ type: "tween", duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed top-0 left-0 bottom-0 z-40 flex flex-col overflow-hidden"
      style={{
        background: "hsl(0 0% 7%)",
        borderRight: "3px solid hsl(153 100% 50%)",
      }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="absolute top-3 right-2 p-2 rounded-lg hover:bg-secondary/60 transition-colors z-10"
        aria-label={expanded ? "Collapse menu" : "Expand menu"}
      >
        {expanded ? (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Menu className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* User section */}
      <div className="px-3 pt-14 pb-3">
        <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center bg-primary/10 mb-2 mx-auto overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-base font-bold text-primary">{userName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-2"
            >
              <p className="text-base font-bold text-foreground truncate">{userName}</p>
              {userEmail && (
                <p className="text-[9px] text-muted-foreground/70 truncate">{userEmail}</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                {level.name} — Week {Math.min(Math.ceil(dayNum / 7), 12)}
              </p>
              <div className="mt-2">
                <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-1">
                  <span>{state.xp} XP</span>
                  <span>{nextLevelXp}</span>
                </div>
                <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, xpProgress)}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mx-3 h-px bg-border/40" />

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              title={!expanded ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-0.5 ${
                active
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {expanded && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </div>

      {/* Bottom section */}
      <div className="px-2 py-3 border-t border-border/30">
        <button
          onClick={async () => {
            try {
              await downloadBackup();
              toast.success("Backup saved");
            } catch {
              toast.error("Backup failed");
            }
          }}
          title={!expanded ? "Quick Backup" : undefined}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
        >
          <CloudDownload className="w-4 h-4 flex-shrink-0" />
          {expanded && <span>Quick Backup</span>}
        </button>
        {expanded && (
          <>
            <p className="text-[10px] text-muted-foreground italic leading-relaxed mt-3 px-1">
              "{quote}"
            </p>
            <p className="text-[9px] text-muted-foreground/50 mt-2 px-1">Transform 90 · v2.0</p>
          </>
        )}
      </div>
    </motion.nav>
  );
}
