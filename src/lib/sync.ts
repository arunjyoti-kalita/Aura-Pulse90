import { db, auth } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const SYNC_KEYS_DEFAULT = [
  "transform90_data",
  "transform90_coach_messages",
  "formcheck_privacy",
  "transform90_custom_foods",
];

function collectAllLocalData(): Record<string, unknown> {
  const all: Record<string, unknown> = {};
  const keys = new Set<string>(SYNC_KEYS_DEFAULT);
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    // skip purely UI/session keys
    if (k.startsWith("firebase:") || k === "sidenav_expanded") continue;
    keys.add(k);
  }
  keys.forEach((k) => {
    const v = localStorage.getItem(k);
    if (v == null) return;
    try {
      all[k] = JSON.parse(v);
    } catch {
      all[k] = v;
    }
  });
  return all;
}

function applyDataToLocalStorage(data: Record<string, unknown>) {
  Object.entries(data).forEach(([key, value]) => {
    try {
      const serialized = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (err) {
      console.warn("Failed to restore key", key, err);
    }
  });
}

export async function pushSyncToCloud(userId: string): Promise<void> {
  const data = collectAllLocalData();
  const userRef = doc(db, "profiles", userId);
  await setDoc(userRef, {
    sync_data: data,
    synced_at: serverTimestamp(),
  }, { merge: true });

  // Update global leaderboard
  const state = data["transform90_data"] as any;
  if (state && typeof state.xp === "number") {
    const leaderboardRef = doc(db, "leaderboard", userId);
    await setDoc(leaderboardRef, {
      uid: userId,
      displayName: auth.currentUser?.displayName || "Anonymous Pulse",
      photoURL: auth.currentUser?.photoURL || null,
      xp: state.xp,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
}

export async function getLeaderboard(): Promise<any[]> {
  const q = query(collection(db, "leaderboard"), orderBy("xp", "desc"), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

export async function pullSyncFromCloud(
  userId: string
): Promise<{ hadData: boolean; syncedAt: any }> {
  const userRef = doc(db, "profiles", userId);
  const docSnap = await getDoc(userRef);
  
  if (!docSnap.exists()) return { hadData: false, syncedAt: null };
  
  const data = docSnap.data();
  if (!data.sync_data) return { hadData: false, syncedAt: null };
  
  applyDataToLocalStorage(data.sync_data as Record<string, unknown>);
  return { hadData: true, syncedAt: data.synced_at };
}
