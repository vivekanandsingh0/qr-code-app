import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Linking, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/UIComponents';
import { useApp } from '../db/AppContext';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function SettingsScreen() {
    const { resetAll, limitReset, scanLogs } = useApp();
    const [modalVisible, setModalVisible] = useState(false);
    const [password, setPassword] = useState('');
    const [resetType, setResetType] = useState(null); // 'FULL' or 'LIMITED'

    const ADMIN_PASS = "Vk@815353";

    const promptReset = (type) => {
        setResetType(type);
        const title = type === 'FULL' ? "Reset All Data" : "Limited Reset";
        const msg = type === 'FULL'
            ? "This will delete ALL data (Tokens + Logs)."
            : "This will clear LOGS only. Generated tokens will be kept but marked as unused.";

        Alert.alert(
            title,
            msg + "\nAre you sure?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Proceed", style: "destructive", onPress: () => setModalVisible(true) }
            ]
        );
    };

    const confirmReset = async () => {
        if (password === ADMIN_PASS) {
            setModalVisible(false);
            setPassword('');

            if (resetType === 'FULL') {
                await resetAll();
                Alert.alert("Complete Reset", "All data deleted.");
            } else {
                await limitReset();
                Alert.alert("Limited Reset", "Logs cleared. Tokens ready for reuse.");
            }
        } else {
            Alert.alert("Access Denied", "Incorrect Password.");
        }
    };

    const handleExport = async () => {
        if (scanLogs.length === 0) {
            Alert.alert("No Data", "No scan logs to export.");
            return;
        }

        const header = "Token ID,Time,Status\n";
        const rows = scanLogs.map(log =>
            `${log.tokenId},${new Date(log.time).toISOString()},${log.type}`
        ).join("\n");

        const csv = header + rows;
        const fileUri = FileSystem.documentDirectory + 'scan_logs.csv';

        try {
            await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
            await Sharing.shareAsync(fileUri, { UTI: '.csv', mimeType: 'text/csv' });
        } catch (e) {
            Alert.alert("Error", "Failed to export logs.");
            console.error(e);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>
            <View style={styles.content}>
                <Button title="Export Scan Logs (CSV)" onPress={handleExport} style={{ marginBottom: 20 }} />

                <View style={styles.dangerZone}>
                    <Text style={styles.dangerTitle}>Danger Zone</Text>
                    <Button
                        title="Limited Reset (Logs Only)"
                        onPress={() => promptReset('LIMITED')}
                        type="secondary"
                        style={{ marginBottom: 10, backgroundColor: '#FF9500' }}
                    />
                    <Button
                        title="Reset All Data (Full)"
                        onPress={() => promptReset('FULL')}
                        type="danger"
                    />
                </View>

                <View style={styles.info}>
                    <Text style={styles.infoText}>Version 1.0.0</Text>
                    <Text style={styles.infoText}>Event: FRESHERS2025</Text>

                    <View style={styles.creditContainer}>
                        <Text style={styles.creditText}>Developed by Vivekanand Singh</Text>
                        <TouchableOpacity onPress={() => Linking.openURL('https://wa.me/919508020857')}>
                            <Text style={styles.contactLink}>Contact: +91 9508020857</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Enter Admin Password</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnCancel]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.textStyle}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnConfirm]}
                                onPress={confirmReset}
                            >
                                <Text style={styles.textStyle}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f2f7' },
    header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e5ea' },
    title: { fontSize: 24, fontWeight: 'bold' },
    content: { padding: 20 },
    dangerZone: { marginTop: 40, padding: 20, backgroundColor: '#fff', borderRadius: 12, borderColor: '#FF3B30', borderWidth: 1 },
    dangerTitle: { color: '#FF3B30', fontWeight: 'bold', marginBottom: 10, alignSelf: 'center' },
    info: { marginTop: 40, alignItems: 'center' },
    infoText: { color: '#999', marginVertical: 4 },
    creditContainer: { marginTop: 20, alignItems: 'center' },
    creditText: { fontSize: 14, fontWeight: '600', color: '#333' },
    contactLink: { fontSize: 14, color: '#007AFF', marginTop: 5, textDecorationLine: 'underline' },
    // Modal Styles
    centeredView: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { margin: 20, backgroundColor: "white", borderRadius: 20, padding: 35, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '80%' },
    modalText: { marginBottom: 15, textAlign: "center", fontSize: 18, fontWeight: 'bold' },
    modalInput: { height: 40, margin: 12, borderWidth: 1, padding: 10, width: '100%', borderRadius: 8, borderColor: '#ccc' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    modalBtn: { borderRadius: 10, padding: 10, elevation: 2, flex: 0.45, alignItems: 'center' },
    modalBtnCancel: { backgroundColor: "#ccc" },
    modalBtnConfirm: { backgroundColor: "#FF3B30" },
    textStyle: { color: "white", fontWeight: "bold", textAlign: "center" }
});
