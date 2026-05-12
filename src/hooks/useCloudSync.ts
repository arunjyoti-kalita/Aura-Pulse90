import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { pullSyncFromCloud, pushSyncToCloud } from "@/lib/sync";

// Pulls cloud data once after login, then pushes local changes (debounced).
export function useCloudSync() {
  const { user } = useAuth();
  const [pulling, setPulling] = useState(false);
  const [pulledForUser, setPulledForUser] = useState<string | null>(null);
  const pushTimer = useRef<number | null>(null);

  // Pull on login
  useEffect(() => {
    if (!user) {
      setPulledForUser(null);
      return;
    }
    if (pulledForUser === user.uid) return;
    setPulling(true);
    pullSyncFromCloud(user.uid)
      .then(({ hadData }) => {
        setPulledForUser(user.uid);
        if (hadData) {
          // Force any active page to re-read localStorage
          window.dispatchEvent(new CustomEvent("transform90:cloud-restored"));
        }
      })
      .catch((err) => console.error("Cloud pull failed:", err))
      .finally(() => setPulling(false));
  }, [user, pulledForUser]);

  // Push on local changes (debounced)
  useEffect(() => {
    if (!user || pulledForUser !== user.uid) return;
    const handler = () => {
      if (pushTimer.current) window.clearTimeout(pushTimer.current);
      pushTimer.current = window.setTimeout(() => {
        pushSyncToCloud(user.uid).catch((err) =>
          console.error("Cloud push failed:", err)
        );
      }, 1500);
    };
    window.addEventListener("transform90:state-changed", handler);
    return () => {
      window.removeEventListener("transform90:state-changed", handler);
      if (pushTimer.current) window.clearTimeout(pushTimer.current);
    };
  }, [user, pulledForUser]);

  return { pulling };
}
