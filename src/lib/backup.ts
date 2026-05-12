// Backup & Restore utilities for Transform 90

import { getLevel, type AppState } from "./store";

const STORAGE_KEY = "transform90_data";
const BACKUP_META_KEY = "transform90_last_backup";
const BACKUP_REMINDER_DISMISSED_KEY = "transform90_backup_reminder_dismissed";
const QUICK_RESTORE_POINTS_KEY = "transform90_quick_restore_points";
const RESTORE_VERIFICATION_KEY = "transform90_restore_verification_pending";
const BACKUP_VERSION = "transform90-v2";
const MAX_QUICK_RESTORE_POINTS = 3;

const QUICK_RESTORE_EXCLUDED_KEYS = new Set<string>([
  QUICK_RESTORE_POINTS_KEY,
  RESTORE_VERIFICATION_KEY,
]);

type BackupChecksumStatus = "valid" | "missing" | "mismatch";
type QuickRestoreSource = "manual" | "weekly";

interface BackupChecksum {
  totalKeys: number;
  totalCharacters: number;
}

interface Transform90Backup {
  version: string;
  backup_date: string;
  backup_device: string;
  backup_timestamp: number;
  total_keys: number;
  checksum: BackupChecksum;
  summary: {
    dayNumber: number;
    currentStreak: number;
    totalXP: number;
    badgesEarned: number;
  };
  data: Record<string, unknown>;
  __transform90_backup: true;
  __version: string;
  __exportDate: string;
}

interface StoredQuickRestorePoint {
  id: string;
  createdAt: string;
  dayNumber: number;
  currentStreak: number;
  source: QuickRestoreSource;
  compression: "gzip" | "none";
  totalKeys: number;
  payload: string;
}

interface RestoreVerificationPayload {
  backupDate: string;
  expectedKeys: string[];
  expectedChecksum: BackupChecksum;
}

export interface BackupMeta {
  lastBackupDate: string;
  backupReminderEnabled: boolean;
  lastBackupSizeBytes: number;
  lastBackupFileName: string;
  lastAutoRestorePointDate: string;
  lastBackupKeys: number;
}

export interface BackupPreview {
  exportDate: string;
  completedDays: number;
  missedDays: number;
  partialDays: number;
  currentStreak: number;
  totalXP: number;
  currentLevel: string;
  badgesEarned: number;
  foodLogCount: number;
  progressDays: number;
  totalDataItems: number;
  dayNumber: number;
  checksumStatus: BackupChecksumStatus;
  warning?: string;
}

export interface QuickRestorePoint {
  id: string;
  createdAt: string;
  dayNumber: number;
  currentStreak: number;
  source: QuickRestoreSource;
  compression: "gzip" | "none";
  totalKeys: number;
}

export interface RestoreOperationResult {
  success: boolean;
  totalKeys: number;
  restoredKeys: number;
  backupDate: string;
  error?: string;
  warning?: string;
}

export interface RestoreVerificationNotice {
  status: "success" | "warning";
  message: string;
}

function defaultBackupMeta(): BackupMeta {
  return {
    lastBackupDate: "",
    backupReminderEnabled: true,
    lastBackupSizeBytes: 0,
    lastBackupFileName: "",
    lastAutoRestorePointDate: "",
    lastBackupKeys: 0,
  };
}

function safeDate(value?: string): Date {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatIsoDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(dateString: string, days: number): string {
  const date = safeDate(dateString);
  date.setDate(date.getDate() + days);
  return formatIsoDate(date);
}

function getDayNumberAtDate(startDate?: string, endDate?: string): number {
  const start = safeDate(startDate);
  const end = safeDate(endDate);
  const diff = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000));
  return diff + 1;
}

function getUserAgent(): string {
  return typeof navigator !== "undefined" ? navigator.userAgent : "unknown-device";
}

function isBackupChecksum(value: unknown): value is BackupChecksum {
  return !!value && typeof value === "object"
    && typeof (value as BackupChecksum).totalKeys === "number"
    && typeof (value as BackupChecksum).totalCharacters === "number";
}

function parseStorageValue(raw: string | null): unknown {
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function serializeStorageValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === undefined) return "undefined";
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value);
}

/**
 * Capture EVERY key in localStorage without exception.
 */
function snapshotLocalStorage(excludeKeys?: Set<string>): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || excludeKeys?.has(key)) continue;
    try {
      const rawValue = localStorage.getItem(key);
      if (rawValue === null) continue;
      try {
        data[key] = JSON.parse(rawValue);
      } catch {
        data[key] = rawValue;
      }
    } catch (e) {
      console.warn("Could not backup key:", key);
      data["__error_" + key] = "Could not read this key";
    }
  }
  return data;
}

function snapshotRawLocalStorage(): Record<string, string> {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
  }
  return data;
}

function calculateChecksum(data: Record<string, unknown>): BackupChecksum {
  return Object.entries(data).reduce<BackupChecksum>((acc, [key, value]) => {
    acc.totalKeys += 1;
    acc.totalCharacters += key.length + serializeStorageValue(value).length;
    return acc;
  }, { totalKeys: 0, totalCharacters: 0 });
}

function readMainState(data: Record<string, unknown>): Partial<AppState> | null {
  const mainData = data[STORAGE_KEY];
  if (!mainData || typeof mainData !== "object" || Array.isArray(mainData)) return null;
  return mainData as Partial<AppState>;
}

function countCompletedWorkouts(workoutLogs: unknown[]): number {
  return workoutLogs.filter((log) => {
    const entry = log as { partial?: boolean; completionPct?: number };
    return !entry.partial && (typeof entry.completionPct !== "number" || entry.completionPct >= 100);
  }).length;
}

function countPartialWorkouts(workoutLogs: unknown[]): number {
  return workoutLogs.filter((log) => {
    const entry = log as { partial?: boolean; completionPct?: number };
    return Boolean(entry.partial) || (typeof entry.completionPct === "number" && entry.completionPct < 100);
  }).length;
}

function countMissedWorkouts(mainState: Partial<AppState> | null, backupDate: string): number {
  if (!mainState?.startDate) return 0;
  const workoutLogs = Array.isArray(mainState.workoutLogs) ? mainState.workoutLogs : [];
  const workoutDates = new Set(workoutLogs.map((log) => (log as { date?: string }).date).filter(Boolean));
  const weeklySchedule = Array.isArray(mainState.settings?.weeklySchedule)
    ? mainState.settings.weeklySchedule
    : ["A", "B", "C", "A", "B", "Rest", "Rest"];
  const totalDays = getDayNumberAtDate(mainState.startDate, backupDate);
  let missed = 0;

  for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
    const scheduledWorkout = weeklySchedule[dayIndex % weeklySchedule.length];
    if (scheduledWorkout === "Rest") continue;
    const date = addDays(mainState.startDate, dayIndex);
    if (!workoutDates.has(date)) missed += 1;
  }

  return missed;
}

function getStreakAtDate(workoutLogs: unknown[], backupDate: string): number {
  const workoutDates = new Set(workoutLogs.map((log) => (log as { date?: string }).date).filter(Boolean));
  let streak = 0;
  const anchor = formatIsoDate(safeDate(backupDate));

  for (let i = 0; i < 365; i++) {
    const date = addDays(anchor, -i);
    if (!workoutDates.has(date)) break;
    streak += 1;
  }

  return streak;
}

function countFoodLogDays(dietLogs: unknown[]): number {
  return dietLogs.filter((entry) => {
    const log = entry as {
      foodEntries?: unknown[];
      meals?: { status?: "clean" | "bad" | null }[];
      calorieEstimate?: number;
    };
    const hasFoodEntries = Array.isArray(log.foodEntries) && log.foodEntries.length > 0;
    const hasLegacyMealToggle = Array.isArray(log.meals) && log.meals.some((meal) => meal.status);
    return hasFoodEntries || hasLegacyMealToggle || typeof log.calorieEstimate === "number";
  }).length;
}

function getChecksumStatus(backup: Transform90Backup): BackupChecksumStatus {
  const recalculated = calculateChecksum(backup.data);
  if (!isBackupChecksum(backup.checksum)) return "missing";
  return backup.checksum.totalKeys === recalculated.totalKeys
    && backup.checksum.totalCharacters === recalculated.totalCharacters
    ? "valid"
    : "mismatch";
}

function buildBackupPreview(backup: Transform90Backup): BackupPreview {
  const mainState = readMainState(backup.data);
  const workoutLogs = Array.isArray(mainState?.workoutLogs) ? mainState.workoutLogs : [];
  const dietLogs = Array.isArray(mainState?.dietLogs) ? mainState.dietLogs : [];
  const progressEntries = Array.isArray(mainState?.progressEntries) ? mainState.progressEntries : [];
  const badges = Array.isArray(mainState?.badges) ? mainState.badges : [];
  const totalXP = typeof mainState?.xp === "number" ? mainState.xp : 0;
  const level = getLevel(totalXP);
  const checksumStatus = getChecksumStatus(backup);
  const exportDate = backup.backup_date || backup.__exportDate || new Date().toISOString();

  const computedStreak = getStreakAtDate(workoutLogs, exportDate);
  const m = (mainState ?? {}) as Record<string, unknown>;
  const storedStreak =
    (typeof m.streak === "number" && m.streak)
    || (typeof m.currentStreak === "number" && m.currentStreak)
    || (typeof m.streakCount === "number" && m.streakCount)
    || 0;

  return {
    exportDate,
    completedDays: countCompletedWorkouts(workoutLogs),
    missedDays: countMissedWorkouts(mainState, exportDate),
    partialDays: countPartialWorkouts(workoutLogs),
    currentStreak: computedStreak || (storedStreak as number),
    totalXP,
    currentLevel: `${level.name} (Level ${level.level})`,
    badgesEarned: badges.filter((badge) => (badge as { earned?: boolean }).earned).length,
    foodLogCount: countFoodLogDays(dietLogs),
    progressDays: progressEntries.length,
    totalDataItems: Object.keys(backup.data).length,
    dayNumber: mainState?.startDate ? getDayNumberAtDate(mainState.startDate, exportDate) : 1,
    checksumStatus,
    warning: checksumStatus === "mismatch"
      ? "This backup file may be corrupted — the data may not restore correctly. Continue anyway?"
      : undefined,
  };
}

function normalizeBackup(content: unknown): { backup?: Transform90Backup; error?: string } {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return { error: "File is not a valid JSON object" };
  }

  const raw = content as Record<string, unknown>;
  const version = typeof raw.version === "string"
    ? raw.version
    : typeof raw.__version === "string"
      ? raw.__version
      : "";
  const isLegacyBackup = raw.__transform90_backup === true;
  const isSupportedBackup = version.startsWith("transform90") || isLegacyBackup;

  if (!isSupportedBackup) {
    return { error: "This does not appear to be a Transform 90 backup file. Please select a file that starts with transform90-FULLBACKUP." };
  }

  const data = raw.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { error: "This backup file appears to be empty or corrupted." };
  }

  if (Object.keys(data as Record<string, unknown>).length === 0) {
    return { error: "This backup file appears to be empty or corrupted." };
  }

  const backupDate = typeof raw.backup_date === "string"
    ? raw.backup_date
    : typeof raw.__exportDate === "string"
      ? raw.__exportDate
      : new Date().toISOString();

  const checksum = isBackupChecksum(raw.checksum)
    ? raw.checksum
    : calculateChecksum(data as Record<string, unknown>);

  return {
    backup: {
      version: version.startsWith("transform90") ? version : BACKUP_VERSION,
      backup_date: backupDate,
      backup_device: typeof raw.backup_device === "string" ? raw.backup_device : "unknown-device",
      backup_timestamp: typeof raw.backup_timestamp === "number" ? raw.backup_timestamp : Date.now(),
      total_keys: typeof raw.total_keys === "number" ? raw.total_keys : Object.keys(data as Record<string, unknown>).length,
      checksum,
      summary: {
        dayNumber: typeof raw.summary === "object" && raw.summary && typeof (raw.summary as Record<string, unknown>).dayNumber === "number"
          ? (raw.summary as Record<string, number>).dayNumber
          : 1,
        currentStreak: typeof raw.summary === "object" && raw.summary && typeof (raw.summary as Record<string, unknown>).currentStreak === "number"
          ? (raw.summary as Record<string, number>).currentStreak
          : 0,
        totalXP: typeof raw.summary === "object" && raw.summary && typeof (raw.summary as Record<string, unknown>).totalXP === "number"
          ? (raw.summary as Record<string, number>).totalXP
          : 0,
        badgesEarned: typeof raw.summary === "object" && raw.summary && typeof (raw.summary as Record<string, unknown>).badgesEarned === "number"
          ? (raw.summary as Record<string, number>).badgesEarned
          : 0,
      },
      data: data as Record<string, unknown>,
      __transform90_backup: true,
      __version: version || BACKUP_VERSION,
      __exportDate: backupDate,
    },
  };
}

function createBackup(excludeKeys?: Set<string>): Transform90Backup {
  const backupDate = new Date().toISOString();
  const data = snapshotLocalStorage(excludeKeys);
  const checksum = calculateChecksum(data);
  const backup: Transform90Backup = {
    version: BACKUP_VERSION,
    backup_date: backupDate,
    backup_device: getUserAgent(),
    backup_timestamp: Date.now(),
    total_keys: Object.keys(data).length,
    checksum,
    summary: {
      dayNumber: 1,
      currentStreak: 0,
      totalXP: 0,
      badgesEarned: 0,
    },
    data,
    __transform90_backup: true,
    __version: BACKUP_VERSION,
    __exportDate: backupDate,
  };
  const preview = buildBackupPreview(backup);
  backup.summary = {
    dayNumber: preview.dayNumber,
    currentStreak: preview.currentStreak,
    totalXP: preview.totalXP,
    badgesEarned: preview.badgesEarned,
  };
  return backup;
}

function buildBackupFileName(backup: Transform90Backup): string {
  const preview = buildBackupPreview(backup);
  const dateStr = formatIsoDate(safeDate(backup.backup_date));
  return `transform90-FULLBACKUP-day${preview.dayNumber}-streak${preview.currentStreak}-${dateStr}.json`;
}

function toBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function compressText(text: string): Promise<{ compression: "gzip" | "none"; payload: string }> {
  if (typeof CompressionStream === "undefined") {
    return { compression: "none", payload: text };
  }

  const stream = new CompressionStream("gzip");
  const writer = stream.writable.getWriter();
  await writer.write(new TextEncoder().encode(text));
  await writer.close();
  const buffer = await new Response(stream.readable).arrayBuffer();
  return { compression: "gzip", payload: toBase64(buffer) };
}

async function decompressText(payload: string, compression: "gzip" | "none"): Promise<string> {
  if (compression === "none") return payload;
  const stream = new DecompressionStream("gzip");
  const writer = stream.writable.getWriter();
  await writer.write(new Uint8Array(fromBase64(payload)));
  await writer.close();
  const buffer = await new Response(stream.readable).arrayBuffer();
  return new TextDecoder().decode(buffer);
}

function readStoredQuickRestorePoints(): StoredQuickRestorePoint[] {
  try {
    const raw = localStorage.getItem(QUICK_RESTORE_POINTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((point): point is StoredQuickRestorePoint => {
      return !!point
        && typeof point === "object"
        && typeof point.id === "string"
        && typeof point.createdAt === "string"
        && typeof point.dayNumber === "number"
        && typeof point.currentStreak === "number"
        && (point.source === "manual" || point.source === "weekly")
        && (point.compression === "gzip" || point.compression === "none")
        && typeof point.totalKeys === "number"
        && typeof point.payload === "string";
    });
  } catch {
    return [];
  }
}

async function saveQuickRestorePoint(source: QuickRestoreSource): Promise<void> {
  const backup = createBackup(QUICK_RESTORE_EXCLUDED_KEYS);
  const preview = buildBackupPreview(backup);
  const compressed = await compressText(JSON.stringify(backup));
  const existing = readStoredQuickRestorePoints();

  const nextPoint: StoredQuickRestorePoint = {
    id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: backup.backup_date,
    dayNumber: preview.dayNumber,
    currentStreak: preview.currentStreak,
    source,
    compression: compressed.compression,
    totalKeys: preview.totalDataItems,
    payload: compressed.payload,
  };

  localStorage.setItem(
    QUICK_RESTORE_POINTS_KEY,
    JSON.stringify([nextPoint, ...existing].slice(0, MAX_QUICK_RESTORE_POINTS)),
  );
}

export function getBackupMeta(): BackupMeta {
  try {
    const raw = localStorage.getItem(BACKUP_META_KEY);
    if (raw) return { ...defaultBackupMeta(), ...JSON.parse(raw) };
  } catch {}
  return defaultBackupMeta();
}

export function saveBackupMeta(meta: BackupMeta) {
  localStorage.setItem(BACKUP_META_KEY, JSON.stringify({ ...defaultBackupMeta(), ...meta }));
}

export function formatBackupSize(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function downloadBackup(): Promise<{ filename: string; sizeBytes: number; totalKeys: number }> {
  try {
    await saveQuickRestorePoint("manual");
  } catch {}

  const backup = createBackup();
  const json = JSON.stringify(backup, null, 2);
  const filename = buildBackupFileName(backup);
  const totalKeys = Object.keys(backup.data).length;
  const sizeBytes = json.length;

  // Try multiple download methods in order of reliability

  // Method 1: showSaveFilePicker (modern Chrome/Edge desktop)
  if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: "JSON Backup File", accept: { "application/json": [".json"] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
      onBackupSuccess(backup.backup_date, sizeBytes, filename, totalKeys);
      return { filename, sizeBytes, totalKeys };
    } catch (err: any) {
      // User cancelled or API failed — fall through to next method
      if (err?.name === "AbortError") {
        throw new Error("Backup cancelled by user");
      }
    }
  }

  // Method 2: Standard Blob download
  try {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.cssText = "position:fixed;top:-9999px;left:-9999px;";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 3000);
    onBackupSuccess(backup.backup_date, sizeBytes, filename, totalKeys);
    return { filename, sizeBytes, totalKeys };
  } catch {
    // Fall through
  }

  // Method 3: Data URI
  try {
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(json);
    const a = document.createElement("a");
    a.setAttribute("href", dataUri);
    a.setAttribute("download", filename);
    a.style.cssText = "position:fixed;top:-9999px;left:-9999px;";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 3000);
    onBackupSuccess(backup.backup_date, sizeBytes, filename, totalKeys);
    return { filename, sizeBytes, totalKeys };
  } catch {
    // Fall through
  }

  // Method 4: Open in new tab
  try {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const newTab = window.open(url, "_blank");
    if (newTab) {
      alert(
        "✅ Your backup has opened in a new tab.\n\n" +
        "To save it:\n" +
        "• Desktop: Press Ctrl+S (or Cmd+S on Mac)\n" +
        "• Mobile: Tap the Share button → Save to Files\n\n" +
        "Save the file as " + filename
      );
      onBackupSuccess(backup.backup_date, sizeBytes, filename, totalKeys);
      return { filename, sizeBytes, totalKeys };
    }
  } catch {
    // Fall through
  }

  // Method 5: Show text in modal for manual copy
  showBackupAsTextModal(json, filename);
  onBackupSuccess(backup.backup_date, sizeBytes, filename, totalKeys);
  return { filename, sizeBytes, totalKeys };
}

function onBackupSuccess(backupDate: string, sizeBytes: number, filename: string, totalKeys: number) {
  const meta = getBackupMeta();
  saveBackupMeta({
    ...meta,
    lastBackupDate: backupDate,
    lastBackupSizeBytes: sizeBytes,
    lastBackupFileName: filename,
    lastBackupKeys: totalKeys,
  });
  localStorage.setItem("lastBackupDate", new Date().toISOString());
  localStorage.setItem("lastBackupKeys", totalKeys.toString());
  localStorage.setItem("lastBackupSize", sizeBytes.toString());
}

function showBackupAsTextModal(jsonString: string, filename: string) {
  const modal = document.createElement("div");
  modal.id = "backup-text-modal";
  modal.style.cssText = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:rgba(0,0,0,0.95);z-index:99999;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:20px;box-sizing:border-box;
  `;
  modal.innerHTML = `
    <div style="width:100%;max-width:500px;background:#1a1a1a;border-radius:16px;padding:24px;border:1px solid #00FF87;">
      <h2 style="color:#00FF87;margin:0 0 8px;font-size:18px;">📋 Copy Your Backup</h2>
      <p style="color:#aaa;font-size:13px;margin:0 0 16px;">
        Your browser blocked the download. Select all text below and copy it.<br>
        Save it in Notes, WhatsApp, or Google Drive as <strong>${filename}</strong>.
      </p>
      <textarea id="backupTextArea" readonly style="
        width:100%;height:160px;background:#0d0d0d;color:#fff;
        border:1px solid #333;border-radius:8px;padding:10px;
        font-size:11px;font-family:monospace;box-sizing:border-box;resize:none;
      ">${jsonString.replace(/</g, "&lt;")}</textarea>
      <button onclick="
        var t=document.getElementById('backupTextArea');
        t.select();t.setSelectionRange(0,99999);
        navigator.clipboard.writeText(t.value).then(function(){
          document.getElementById('copyBtn').textContent='✅ Copied!';
        }).catch(function(){document.execCommand('copy');});
      " id="copyBtn" style="
        width:100%;padding:14px;background:#00FF87;color:#000;
        border:none;border-radius:8px;font-size:16px;font-weight:700;
        margin:12px 0 8px;cursor:pointer;
      ">Copy to Clipboard</button>
      <button onclick="document.getElementById('backup-text-modal').remove();" style="
        width:100%;padding:12px;background:transparent;color:#aaa;
        border:1px solid #333;border-radius:8px;font-size:14px;cursor:pointer;
      ">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
}

export function validateBackup(content: unknown): { valid: boolean; preview?: BackupPreview; error?: string; backup?: Record<string, unknown> } {
  const normalized = normalizeBackup(content);
  if (!normalized.backup) {
    return { valid: false, error: normalized.error || "Invalid backup file" };
  }

  return {
    valid: true,
    preview: buildBackupPreview(normalized.backup),
    backup: normalized.backup as unknown as Record<string, unknown>,
  };
}

export function restoreFromBackup(content: unknown): RestoreOperationResult {
  const normalized = normalizeBackup(content);
  if (!normalized.backup) {
    return {
      success: false,
      totalKeys: 0,
      restoredKeys: 0,
      backupDate: "",
      error: normalized.error || "Invalid backup file",
    };
  }

  const backup = normalized.backup;
  const data = backup.data;
  const previousState = snapshotRawLocalStorage();
  const checksumStatus = getChecksumStatus(backup);
  const expectedKeys = Object.keys(data).filter(k => !k.startsWith("__error_"));
  let restoredKeys = 0;

  try {
    // Step 1: Clear everything currently in localStorage
    localStorage.clear();

    // Step 2: Write back every single key from backup
    for (const [key, value] of Object.entries(data)) {
      // Skip error placeholder keys
      if (key.startsWith("__error_")) continue;

      try {
        if (typeof value === "object" && value !== null) {
          localStorage.setItem(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          localStorage.setItem(key, String(value));
        }
        restoredKeys += 1;
      } catch (e) {
        console.warn("Could not restore key:", key);
      }
    }

    // Step 3: Set verification payload
    const verificationPayload: RestoreVerificationPayload = {
      backupDate: backup.backup_date,
      expectedKeys,
      expectedChecksum: calculateChecksum(data),
    };
    localStorage.setItem(RESTORE_VERIFICATION_KEY, JSON.stringify(verificationPayload));

    return {
      success: true,
      totalKeys: expectedKeys.length,
      restoredKeys,
      backupDate: backup.backup_date,
      warning: checksumStatus === "mismatch"
        ? "This backup file may be corrupted — the data may not restore correctly."
        : undefined,
    };
  } catch (error) {
    try {
      localStorage.clear();
      Object.entries(previousState).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } catch {}

    return {
      success: false,
      totalKeys: expectedKeys.length,
      restoredKeys: 0,
      backupDate: backup.backup_date,
      error: error instanceof Error ? error.message : "Unknown restore error",
    };
  }
}

export async function ensureWeeklyRestorePoint(): Promise<boolean> {
  const today = new Date();
  if (today.getDay() !== 0) return false;

  const todayKey = formatIsoDate(today);
  const meta = getBackupMeta();
  if (meta.lastAutoRestorePointDate === todayKey) return false;

  try {
    await saveQuickRestorePoint("weekly");
    saveBackupMeta({ ...meta, lastAutoRestorePointDate: todayKey });
    return true;
  } catch {
    return false;
  }
}

export function getQuickRestorePoints(): QuickRestorePoint[] {
  return readStoredQuickRestorePoints().map(({ payload: _payload, ...point }) => point);
}

export async function loadQuickRestorePointBackup(id: string): Promise<Record<string, unknown> | null> {
  const point = readStoredQuickRestorePoints().find((entry) => entry.id === id);
  if (!point) return null;

  try {
    const text = await decompressText(point.payload, point.compression);
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export function consumeRestoreVerificationNotice(): RestoreVerificationNotice | null {
  try {
    const raw = localStorage.getItem(RESTORE_VERIFICATION_KEY);
    if (!raw) return null;

    localStorage.removeItem(RESTORE_VERIFICATION_KEY);
    const payload = JSON.parse(raw) as RestoreVerificationPayload;
    if (!Array.isArray(payload.expectedKeys)) {
      return {
        status: "warning",
        message: "Restore completed but some data may be missing — try restoring again",
      };
    }

    const restoredData: Record<string, unknown> = {};
    const missingKeys = payload.expectedKeys.filter((key) => {
      const value = localStorage.getItem(key);
      if (value === null) return true;
      restoredData[key] = parseStorageValue(value);
      return false;
    });

    if (missingKeys.length > 0) {
      return {
        status: "warning",
        message: "Restore completed but some data may be missing — try restoring again",
      };
    }

    const checksum = calculateChecksum(restoredData);
    const checksumMatches = checksum.totalKeys === payload.expectedChecksum.totalKeys
      && checksum.totalCharacters === payload.expectedChecksum.totalCharacters;

    return checksumMatches
      ? { status: "success", message: `Data restored successfully — ${payload.expectedKeys.length} items recovered. Welcome back!` }
      : { status: "warning", message: "Restore completed but some data may be missing — try restoring again" };
  } catch {
    return {
      status: "warning",
      message: "Restore completed but some data may be missing — try restoring again",
    };
  }
}

export function verifyStoredDataIntegrity(): { valid: boolean; totalKeys: number; invalidKeys: string[] } {
  const invalidKeys: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    const raw = localStorage.getItem(key);
    if (raw === null) {
      invalidKeys.push(key);
      continue;
    }

    const trimmed = raw.trim();
    const shouldParseAsJson = key === STORAGE_KEY
      || key === BACKUP_META_KEY
      || key === QUICK_RESTORE_POINTS_KEY
      || key === RESTORE_VERIFICATION_KEY
      || (trimmed.startsWith("{") || trimmed.startsWith("["));

    if (!shouldParseAsJson) continue;

    try {
      JSON.parse(raw);
    } catch {
      invalidKeys.push(key);
    }
  }

  return {
    valid: invalidKeys.length === 0,
    totalKeys: localStorage.length,
    invalidKeys,
  };
}

export function clearAllAppData() {
  localStorage.clear();
}

export function shouldShowBackupReminder(): boolean {
  const meta = getBackupMeta();
  if (!meta.backupReminderEnabled) return false;

  const today = new Date();
  if (today.getDay() !== 0) return false;

  const todayKey = formatIsoDate(today);
  if (meta.lastBackupDate && formatIsoDate(safeDate(meta.lastBackupDate)) === todayKey) {
    return false;
  }

  const dismissed = localStorage.getItem(BACKUP_REMINDER_DISMISSED_KEY);
  if (dismissed === todayKey) return false;

  return true;
}

export function dismissBackupReminder() {
  localStorage.setItem(BACKUP_REMINDER_DISMISSED_KEY, formatIsoDate(new Date()));
}
