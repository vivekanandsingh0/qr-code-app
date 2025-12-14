import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Vibration, InteractionManager } from 'react-native';
import { CameraView, Camera } from "expo-camera";
import { useIsFocused } from '@react-navigation/native';
import { Button, Card } from '../components/UIComponents';
import { validateQrHash } from '../utils/security';
import * as Storage from '../db/storage';
import { useApp } from '../db/AppContext';

export default function ScanScreen() {
    const isFocused = useIsFocused();
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false); // throttle
    const [status, setStatus] = useState(null); // { type: 'valid'|'duplicate'|'invalid', token: '' }
    const [isCameraMounted, setIsCameraMounted] = useState(false);
    const { refreshData } = useApp();

    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        getBarCodeScannerPermissions();
    }, []);

    // Delay camera mount/unmount to prevent nav jank
    useEffect(() => {
        if (isFocused) {
            const task = InteractionManager.runAfterInteractions(() => {
                setIsCameraMounted(true);
            });
            return () => task.cancel();
        } else {
            // Immediately unmount or delay? Immediate unmount often better for cleanup, 
            // but if we want smooth EXIT animation, we might delay. 
            // However, for "black screen" glitch, we want to ensure it IS NOT rendered when not focused.
            setIsCameraMounted(false);
        }
    }, [isFocused]);

    const handleBarCodeScanned = async ({ type, data }) => {
        if (scanned) return;
        setScanned(true);

        // Simple debounce reset
        setTimeout(() => setScanned(false), 2000);

        try {
            const qrData = JSON.parse(data);

            // 1. Validate Hash & Structure
            if (!validateQrHash(qrData)) {
                setStatus({ type: 'invalid', token: 'Unknown' });
                Vibration.vibrate([0, 200, 100, 200]); // Error vibrate
                await Storage.addScanLog({ tokenId: "Unknown", time: Date.now(), type: 'invalid' });
                await refreshData();
                return;
            }

            const tokenId = qrData.token;

            // 2. Check if Generated
            const generated = await Storage.getGeneratedTokens();
            if (!generated[tokenId]) {
                setStatus({ type: 'invalid', token: tokenId });
                Vibration.vibrate([0, 200, 100, 200]);
                await Storage.addScanLog({ tokenId, time: Date.now(), type: 'invalid' });
                await refreshData();
                return;
            }

            // 3. Check if Used
            const used = await Storage.getUsedTokens();
            if (used[tokenId]) {
                setStatus({ type: 'duplicate', token: tokenId });
                Vibration.vibrate([0, 100, 100, 100]); // Warn vibrate
                await Storage.addScanLog({ tokenId, time: Date.now(), type: 'duplicate' });
                await refreshData();
                return;
            }

            // 4. Success -> Mark as used
            await Storage.markTokenAsUsed(tokenId);
            setStatus({ type: 'valid', token: tokenId });
            Vibration.vibrate(100); // Success vibrate
            await Storage.addScanLog({ tokenId, time: Date.now(), type: 'valid' });
            await refreshData();

        } catch (e) {
            // JSON parse error or other format issue
            setStatus({ type: 'invalid', token: 'Raw Data' });
            Vibration.vibrate([0, 200, 100, 200]);
            await Storage.addScanLog({ tokenId: 'Raw Data', time: Date.now(), type: 'invalid' });
            await refreshData();
        }
    };

    if (hasPermission === null) return <View style={styles.container}><Text>Requesting permission...</Text></View>;
    if (hasPermission === false) return <View style={styles.container}><Text>No access to camera</Text></View>;

    return (
        <View style={styles.container}>
            {isCameraMounted && (
                <CameraView
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr", "pdf417"],
                    }}
                    style={StyleSheet.absoluteFillObject}
                />
            )}

            <View style={styles.overlay}>
                {status && (
                    <Card style={[styles.statusCard, status.type === 'valid' ? styles.validBorder : status.type === 'duplicate' ? styles.warnBorder : styles.errorBorder]}>
                        <Text style={styles.statusTitle}>
                            {status.type === 'valid' && "✅ Valid Token"}
                            {status.type === 'duplicate' && "⚠️ Already Used"}
                            {status.type === 'invalid' && "🔴 Invalid QR"}
                        </Text>
                        <Text style={styles.statusToken}>{status.token}</Text>
                    </Card>
                )}
                {!status && <Text style={styles.hint}>Scan a QR Code</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
    overlay: { position: 'absolute', bottom: 50, left: 20, right: 20, alignItems: 'center' },
    statusCard: { width: '100%', alignItems: 'center', borderWidth: 2 },
    validBorder: { borderColor: '#34c759' },
    errorBorder: { borderColor: '#ff3b30' },
    warnBorder: { borderColor: '#ffcc00' },
    statusTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
    statusToken: { fontSize: 16, color: '#555' },
    hint: { color: 'white', backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 8 }
});
