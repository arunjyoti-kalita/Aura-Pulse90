import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ReactNode, Component, ErrorInfo } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useCloudSync } from "@/hooks/useCloudSync";
import { useNotifications } from "@/hooks/useNotifications";
import SideNav from "@/components/SideNav";
import WaterTube from "@/components/WaterTube";
import FloatingCoachButton from "@/components/FloatingCoachButton";
import Dashboard from "./pages/Dashboard";
import WorkoutPage from "./pages/WorkoutPage";
import DietPage from "./pages/DietPage";
import ProgressPage from "./pages/ProgressPage";
import TimelinePage from "./pages/TimelinePage";
import GoldenRules from "./pages/GoldenRules";
import SettingsPage from "./pages/SettingsPage";
import BadgesPage from "./pages/BadgesPage";
import BreathePage from "./pages/BreathePage";
import HabitsPage from "./pages/HabitsPage";
import OutdoorPage from "./pages/OutdoorPage";
import CommunityPage from "./pages/CommunityPage";
import CoachPage from "./pages/CoachPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Global Error Boundary to catch "Black Screen" crashes
class GlobalErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("CRITICAL UI CRASH:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-red-500 p-8 flex flex-col items-center justify-center font-mono text-center">
          <h1 className="text-2xl font-black italic mb-4 tracking-tighter">SYSTEM_CRASH_DETECTION</h1>
          <div className="bg-zinc-900 p-6 rounded-2xl border border-red-900/50 max-w-2xl overflow-auto text-[10px] text-left opacity-80 mb-8">
            <p className="text-red-400 font-bold mb-2 uppercase tracking-widest">Error Trace:</p>
            {this.state.error?.stack}
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="px-8 py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
            >
              PURGE_LOCAL_CACHE & REBOOT
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              RETRY_BOOT
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary font-black uppercase tracking-[0.5em] animate-pulse text-xs">Authenticating...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AppShell() {
  useCloudSync();
  useNotifications();

  return (
    <div className="min-h-screen flex mesh-gradient selection:bg-primary/30 text-foreground">
      <SideNav />
      <WaterTube />
      <FloatingCoachButton />
      <main
        className="flex-1 min-h-screen relative overflow-x-hidden"
        style={{ marginLeft: "var(--sidenav-width, 64px)", paddingRight: "88px" }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workout" element={<WorkoutPage />} />
          <Route path="/diet" element={<DietPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/rules" element={<GoldenRules />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/badges" element={<BadgesPage />} />
          <Route path="/breathe" element={<BreathePage />} />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/outdoor" element={<OutdoorPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/coach" element={<CoachPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

const App = () => (
  <GlobalErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </GlobalErrorBoundary>
);

export default App;
