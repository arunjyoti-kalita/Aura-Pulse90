import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
  key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  get length() { return Object.keys(store).length; },
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

// Mock navigator
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'test-agent' }, writable: true });

// Mock URL/document for downloadBackup
Object.defineProperty(globalThis, 'URL', {
  value: { createObjectURL: vi.fn(() => 'blob:test'), revokeObjectURL: vi.fn() },
  writable: true,
});

import {
  validateBackup,
  restoreFromBackup,
  verifyStoredDataIntegrity,
  clearAllAppData,
  getBackupMeta,
  saveBackupMeta,
  getQuickRestorePoints,
  consumeRestoreVerificationNotice,
} from '@/lib/backup';

describe('Backup & Restore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('validates a correct backup file', () => {
    const backup = {
      version: 'transform90-v2',
      backup_date: new Date().toISOString(),
      backup_device: 'test',
      backup_timestamp: Date.now(),
      total_keys: 1,
      checksum: { totalKeys: 1, totalCharacters: 30 },
      summary: { dayNumber: 1, currentStreak: 0, totalXP: 0, badgesEarned: 0 },
      data: { someKey: 'someValue' },
      __transform90_backup: true,
      __version: 'transform90-v2',
      __exportDate: new Date().toISOString(),
    };

    const result = validateBackup(backup);
    expect(result.valid).toBe(true);
    expect(result.preview).toBeDefined();
    expect(result.preview!.totalDataItems).toBe(1);
  });

  it('rejects invalid backup files', () => {
    expect(validateBackup(null).valid).toBe(false);
    expect(validateBackup({}).valid).toBe(false);
    expect(validateBackup({ version: 'wrong' }).valid).toBe(false);
    expect(validateBackup({ version: 'transform90-v2' }).valid).toBe(false); // no data
  });

  it('restores all keys from backup', () => {
    store['existing'] = 'data';

    const backup = {
      version: 'transform90-v2',
      backup_date: '2025-01-15T10:00:00Z',
      backup_device: 'test',
      backup_timestamp: Date.now(),
      total_keys: 6,
      checksum: { totalKeys: 0, totalCharacters: 0 },
      summary: { dayNumber: 5, currentStreak: 3, totalXP: 100, badgesEarned: 2 },
      data: {
        transform90_data: { startDate: '2025-01-10', xp: 100, workoutLogs: [], dietLogs: [], settings: {} },
        custom_key: 'custom_value',
        numeric_key: 42,
        object_key: { nested: true },
        array_key: [1, 2, 3],
        bool_key: true,
      },
      __transform90_backup: true,
      __version: 'transform90-v2',
      __exportDate: '2025-01-15T10:00:00Z',
    };

    const result = restoreFromBackup(backup);
    expect(result.success).toBe(true);
    expect(result.restoredKeys).toBe(6);

    // Verify existing data was cleared
    expect(store['existing']).toBeUndefined();

    // Verify all keys restored
    expect(store['custom_key']).toBe('custom_value');
    expect(store['numeric_key']).toBe('42');
    expect(JSON.parse(store['object_key'])).toEqual({ nested: true });
    expect(JSON.parse(store['array_key'])).toEqual([1, 2, 3]);
    expect(store['bool_key']).toBe('true');

    // Verify main data
    const mainData = JSON.parse(store['transform90_data']);
    expect(mainData.startDate).toBe('2025-01-10');
    expect(mainData.xp).toBe(100);

    // Verification key should be set
    expect(store['transform90_restore_verification_pending']).toBeDefined();
  });

  it('round-trips data through backup and restore', () => {
    // Seed localStorage with various data types
    store['transform90_data'] = JSON.stringify({
      startDate: '2025-01-01',
      xp: 500,
      workoutLogs: [{ date: '2025-01-02', type: 'A' }],
      dietLogs: [{ date: '2025-01-02', foodEntries: [{ name: 'Rice', calories: 206 }] }],
      settings: { calorieTarget: 1800 },
      badges: [{ id: '1', earned: true }],
    });
    store['transform90_coach_messages'] = JSON.stringify([{ role: 'user', content: 'hello' }]);
    store['plain_string'] = 'just a string';
    store['number_val'] = '42';

    // Create backup by snapshotting
    const snapshotData: Record<string, unknown> = {};
    for (let i = 0; i < localStorageMock.length; i++) {
      const key = localStorageMock.key(i)!;
      const raw = localStorageMock.getItem(key)!;
      try { snapshotData[key] = JSON.parse(raw); } catch { snapshotData[key] = raw; }
    }

    const backup = {
      version: 'transform90-v2',
      backup_date: new Date().toISOString(),
      backup_device: 'test',
      backup_timestamp: Date.now(),
      total_keys: Object.keys(snapshotData).length,
      checksum: { totalKeys: Object.keys(snapshotData).length, totalCharacters: 0 },
      summary: { dayNumber: 1, currentStreak: 0, totalXP: 0, badgesEarned: 0 },
      data: snapshotData,
      __transform90_backup: true,
      __version: 'transform90-v2',
      __exportDate: new Date().toISOString(),
    };

    // Clear and restore
    localStorageMock.clear();
    expect(localStorageMock.length).toBe(0);

    const result = restoreFromBackup(backup);
    expect(result.success).toBe(true);

    // Verify round-trip
    const restoredMain = JSON.parse(store['transform90_data']);
    expect(restoredMain.xp).toBe(500);
    expect(restoredMain.workoutLogs).toHaveLength(1);
    expect(restoredMain.dietLogs[0].foodEntries[0].name).toBe('Rice');

    const restoredCoach = JSON.parse(store['transform90_coach_messages']);
    expect(restoredCoach[0].content).toBe('hello');

    expect(store['plain_string']).toBe('just a string');
    expect(store['number_val']).toBe('42');
  });

  it('verifyStoredDataIntegrity detects corrupt JSON', () => {
    store['transform90_data'] = '{invalid json';
    const result = verifyStoredDataIntegrity();
    expect(result.valid).toBe(false);
    expect(result.invalidKeys).toContain('transform90_data');
  });

  it('verifyStoredDataIntegrity passes for valid data', () => {
    store['transform90_data'] = JSON.stringify({ xp: 100 });
    store['plain'] = 'not json';
    const result = verifyStoredDataIntegrity();
    expect(result.valid).toBe(true);
  });

  it('consumeRestoreVerificationNotice returns success for valid restore', () => {
    const payload = {
      backupDate: '2025-01-15T10:00:00Z',
      expectedKeys: ['key1', 'key2'],
      expectedChecksum: { totalKeys: 2, totalCharacters: 0 },
    };

    // Set up the verification key and the expected data
    store['transform90_restore_verification_pending'] = JSON.stringify(payload);
    store['key1'] = 'val1';
    store['key2'] = 'val2';

    // Need to fix checksum - recalculate
    const charCount = 'key1'.length + 'val1'.length + 'key2'.length + 'val2'.length;
    payload.expectedChecksum = { totalKeys: 2, totalCharacters: charCount };
    store['transform90_restore_verification_pending'] = JSON.stringify(payload);

    const notice = consumeRestoreVerificationNotice();
    expect(notice).not.toBeNull();
    expect(notice!.status).toBe('success');

    // Verification key should be consumed
    expect(store['transform90_restore_verification_pending']).toBeUndefined();
  });

  it('consumeRestoreVerificationNotice returns warning for missing keys', () => {
    const payload = {
      backupDate: '2025-01-15T10:00:00Z',
      expectedKeys: ['key1', 'missing_key'],
      expectedChecksum: { totalKeys: 2, totalCharacters: 20 },
    };
    store['transform90_restore_verification_pending'] = JSON.stringify(payload);
    store['key1'] = 'val1';
    // missing_key is not set

    const notice = consumeRestoreVerificationNotice();
    expect(notice).not.toBeNull();
    expect(notice!.status).toBe('warning');
  });

  it('clearAllAppData empties localStorage', () => {
    store['a'] = '1';
    store['b'] = '2';
    clearAllAppData();
    expect(localStorageMock.length).toBe(0);
  });

  it('backup meta persists and loads', () => {
    const meta = getBackupMeta();
    expect(meta.lastBackupDate).toBe('');

    saveBackupMeta({ ...meta, lastBackupDate: '2025-06-01T00:00:00Z' });
    const loaded = getBackupMeta();
    expect(loaded.lastBackupDate).toBe('2025-06-01T00:00:00Z');
  });
});
