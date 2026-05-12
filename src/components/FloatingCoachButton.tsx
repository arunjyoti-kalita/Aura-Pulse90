import { useLocation, useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { loadState } from "@/lib/store";

export default function FloatingCoachButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = loadState();
  const ft = state.settings.featureToggles as any;

  // Don't show on coach page itself, or if disabled
  if (!ft.aiCoach || !ft.coachFloatingButton || location.pathname === '/coach') return null;

  return (
    <button
      onClick={() => navigate('/coach')}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg btn-press glow-green fixed-side-ui"
      style={{ boxShadow: '0 4px 20px hsl(153 100% 50% / 0.3)' }}
      aria-label="Open AI Coach"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
