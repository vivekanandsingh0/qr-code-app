import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    GENERATED_TOKENS: 'generatedTokens',
    USED_TOKENS: 'usedTokens',
    SCAN_LOGS: 'scanLogs',
};

// --- Generated Tokens ---
export const saveGeneratedTokens = async (newTokens) => {
    try {
        const existing = await getGeneratedTokens();
        const updated = { ...existing, ...newTokens };
        await AsyncStorage.setItem(KEYS.GENERATED_TOKENS, JSON.stringify(updated));
    } catch (e) {
        console.error("Error saving generated tokens", e);
    }
};

export const getGeneratedTokens = async () => {
    try {
        const data = await AsyncStorage.getItem(KEYS.GENERATED_TOKENS);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error("Error getting generated tokens", e);
        return {};
    }
};

// --- Used Tokens ---
export const markTokenAsUsed = async (tokenId) => {
    try {
        const existing = await getUsedTokens();
        const updated = { ...existing, [tokenId]: true };
        await AsyncStorage.setItem(KEYS.USED_TOKENS, JSON.stringify(updated));
    } catch (e) {
        console.error("Error marking token as used", e);
    }
};

export const getUsedTokens = async () => {
    try {
        const data = await AsyncStorage.getItem(KEYS.USED_TOKENS);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error("Error getting used tokens", e);
        return {};
    }
};

// --- Scan Logs ---
export const addScanLog = async (log) => {
    try {
        const existing = await getScanLogs();
        const updated = [log, ...existing]; // Newest first
        // Limit log size if needed, but requirements say "scrollable", assumes infinite for now or reasonable limit
        await AsyncStorage.setItem(KEYS.SCAN_LOGS, JSON.stringify(updated));
    } catch (e) {
        console.error("Error adding scan log", e);
    }
};

export const getScanLogs = async () => {
    try {
        const data = await AsyncStorage.getItem(KEYS.SCAN_LOGS);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Error getting scan logs", e);
        return [];
    }
};

// --- Global Reset ---
export const clearAllData = async () => {
    try {
        await AsyncStorage.multiRemove([KEYS.GENERATED_TOKENS, KEYS.USED_TOKENS, KEYS.SCAN_LOGS]);
    } catch (e) {
        console.error("Error clearing data", e);
    }
};
