import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Storage from './storage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [stats, setStats] = useState({
        totalGenerated: 0,
        validScans: 0,
        duplicateScans: 0,
        invalidScans: 0,
        remaining: 0,
    });
    const [scanLogs, setScanLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load initial data
    const refreshData = async () => {
        setIsLoading(true);
        const generated = await Storage.getGeneratedTokens();
        const used = await Storage.getUsedTokens();
        const logs = await Storage.getScanLogs();

        const totalGenerated = Object.keys(generated).length;
        const totalUsed = Object.keys(used).length;

        // Calculate stats from logs
        let valid = 0;
        let duplicate = 0;
        let invalid = 0;

        logs.forEach(log => {
            if (log.type === 'valid') valid++;
            if (log.type === 'duplicate') duplicate++;
            if (log.type === 'invalid') invalid++;
        });

        setStats({
            totalGenerated,
            validScans: valid,
            duplicateScans: duplicate,
            invalidScans: invalid,
            remaining: totalGenerated - totalUsed,
        });
        setScanLogs(logs);
        setIsLoading(false);
    };

    useEffect(() => {
        refreshData();
    }, []);

    const resetAll = async () => {
        await Storage.clearAllData();
        await refreshData();
    };

    const limitReset = async () => {
        await Storage.limitResetData();
        await refreshData();
    };

    return (
        <AppContext.Provider value={{ stats, scanLogs, refreshData, resetAll, limitReset, isLoading }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
