import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const KEYS = {
    GENERATED_TOKENS: 'generatedTokens',
    USED_TOKENS: 'usedTokens',
    SCAN_LOGS: 'scanLogs',
};

// --- Helper: Sync Functions (Optional - simplifed for now to write-through) ---

// --- Generated Tokens ---
export const saveGeneratedTokens = async (newTokens) => {
    try {
        // 1. Local Save
        const existing = await getGeneratedTokens(true); // check local only first
        const updated = { ...existing, ...newTokens };
        await AsyncStorage.setItem(KEYS.GENERATED_TOKENS, JSON.stringify(updated));

        // 2. Supabase Save (Cloud)
        // Convert object to array for upsert
        const rows = Object.values(newTokens).map(t => ({
            id: t.id,
            hash: t.hash,
            is_used: t.used,
            scanned_at: t.scannedAt,
            title: t.title || 'Unknown',
            event_name: 'FRESHERS2025'
        }));

        const { error } = await supabase.from('tokens').upsert(rows);
        if (error) console.error("Supabase Save Error (Tokens):", error);

    } catch (e) {
        console.error("Error saving generated tokens", e);
    }
};

export const getGeneratedTokens = async (localOnly = false) => {
    try {
        // 1. Try Supabase first if not localOnly
        if (!localOnly) {
            const { data, error } = await supabase.from('tokens').select('*');
            if (!error && data) {
                const remoteTokens = {};
                data.forEach(row => {
                    remoteTokens[row.id] = {
                        id: row.id,
                        used: row.is_used,
                        scannedAt: row.scanned_at,
                        hash: row.hash,
                        title: row.title
                    };
                });
                // Update local cache
                await AsyncStorage.setItem(KEYS.GENERATED_TOKENS, JSON.stringify(remoteTokens));
                return remoteTokens;
            }
        }

        // 2. Fallback to Local
        const data = await AsyncStorage.getItem(KEYS.GENERATED_TOKENS);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error("Error getting generated tokens", e);
        // Finally fallback to local if Supabase fails
        const data = await AsyncStorage.getItem(KEYS.GENERATED_TOKENS);
        return data ? JSON.parse(data) : {};
    }
};

// --- Used Tokens ---
// In new Supabase schema, 'used' is a column in 'tokens'. But we keep local check for speed.
export const markTokenAsUsed = async (tokenId) => {
    try {
        // 1. Local Update
        // We update the full token object in GENERATED_TOKENS if possible, 
        // but the app flow largely relies on separate USED_TOKENS list for quick O(1) checks.
        // For consistency with new schema, we update both.

        // Quick Used List
        const existingUsed = await getUsedTokens(true);
        const updatedUsed = { ...existingUsed, [tokenId]: true };
        await AsyncStorage.setItem(KEYS.USED_TOKENS, JSON.stringify(updatedUsed));

        // Full Token List (Local)
        const allTokens = await getGeneratedTokens(true);
        if (allTokens[tokenId]) {
            allTokens[tokenId].used = true;
            allTokens[tokenId].scannedAt = Date.now();
            await AsyncStorage.setItem(KEYS.GENERATED_TOKENS, JSON.stringify(allTokens));
        }

        // 2. Supabase Update
        const { error } = await supabase
            .from('tokens')
            .update({ is_used: true, scanned_at: Date.now() })
            .eq('id', tokenId);

        if (error) console.error("Supabase Update Error:", error);

    } catch (e) {
        console.error("Error marking token as used", e);
    }
};

export const getUsedTokens = async (localOnly = false) => {
    try {
        if (!localOnly) {
            // Fetch all tokens where is_used is true
            const { data, error } = await supabase.from('tokens').select('id').eq('is_used', true);
            if (!error && data) {
                const usedMap = {};
                data.forEach(row => { usedMap[row.id] = true; });
                await AsyncStorage.setItem(KEYS.USED_TOKENS, JSON.stringify(usedMap));
                return usedMap;
            }
        }

        const data = await AsyncStorage.getItem(KEYS.USED_TOKENS);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        const data = await AsyncStorage.getItem(KEYS.USED_TOKENS);
        return data ? JSON.parse(data) : {};
    }
};

// --- Scan Logs ---
export const addScanLog = async (log) => {
    try {
        // 1. Local Save
        const existing = await getScanLogs(true);
        const updated = [log, ...existing];
        await AsyncStorage.setItem(KEYS.SCAN_LOGS, JSON.stringify(updated));

        // 2. Supabase Save
        const row = {
            token_id: log.tokenId,
            status: log.type,
            scanned_at: log.time
        };
        const { error } = await supabase.from('scan_logs').insert([row]);
        if (error) console.error("Supabase Log Error:", error);

    } catch (e) {
        console.error("Error adding scan log", e);
    }
};

export const getScanLogs = async (localOnly = false) => {
    try {
        if (!localOnly) {
            const { data, error } = await supabase
                .from('scan_logs')
                .select('*')
                .order('scanned_at', { ascending: false })
                .limit(50); // limit for performance

            if (!error && data) {
                const logs = data.map(row => ({
                    tokenId: row.token_id,
                    type: row.status,
                    time: row.scanned_at
                }));
                await AsyncStorage.setItem(KEYS.SCAN_LOGS, JSON.stringify(logs));
                return logs;
            }
        }

        const data = await AsyncStorage.getItem(KEYS.SCAN_LOGS);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        const data = await AsyncStorage.getItem(KEYS.SCAN_LOGS);
        return data ? JSON.parse(data) : [];
    }
};

// --- Global Reset ---
export const clearAllData = async () => {
    try {
        // Local
        await AsyncStorage.multiRemove([KEYS.GENERATED_TOKENS, KEYS.USED_TOKENS, KEYS.SCAN_LOGS]);

        // Supabase (Dangerous - strictly optional/dev only)
        // For a real app, maybe we don't want the button to wipe DB.
        // Keeping it local-only reset for now to prevent accidental production wipe
        // OR implementing soft delete.
        // User requested "reset system for next event".
        // We will clean tables.

        const { error: e1 } = await supabase.from('tokens').delete().neq('id', '0'); // Delete all
        const { error: e2 } = await supabase.from('scan_logs').delete().neq('id', -1);

        if (e1 || e2) console.error("Supabase Reset Error", e1, e2);

    } catch (e) {
        console.error("Error clearing data", e);
    }
};
