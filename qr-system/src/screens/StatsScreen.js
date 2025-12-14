import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatTile, Card } from '../components/UIComponents';
import { useApp } from '../db/AppContext';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function StatsScreen() {
    const { stats, scanLogs, isLoading, refreshData } = useApp();

    useFocusEffect(
        useCallback(() => {
            refreshData();
        }, [])
    );

    const renderLog = ({ item }) => (
        <View style={styles.logItem}>
            <View>
                <Text style={styles.logToken}>{item.tokenId}</Text>
                <Text style={styles.logTime}>{new Date(item.time).toLocaleTimeString()}</Text>
            </View>
            <View style={[
                styles.badge,
                item.type === 'valid' ? styles.bgSuccess : item.type === 'duplicate' ? styles.bgWarn : styles.bgError
            ]}>
                <Text style={styles.badgeText}>{item.type.toUpperCase()}</Text>
            </View>
        </View>
    );

    if (isLoading) return <View style={styles.center}><Text>Loading...</Text></View>;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Live Dashboard</Text>
            </View>

            <View style={styles.grid}>
                <View style={styles.row}>
                    <StatTile label="Total Generated" value={stats.totalGenerated} color="#007AFF" />
                    <StatTile label="Remaining" value={stats.remaining} color="#5856D6" />
                </View>
                <View style={styles.row}>
                    <StatTile label="Valid Scans" value={stats.validScans} color="#34C759" />
                    <StatTile label="Duplicates" value={stats.duplicateScans} color="#FFCC00" />
                    <StatTile label="Invalid" value={stats.invalidScans} color="#FF3B30" />
                </View>
            </View>

            <View style={styles.logsContainer}>
                <Text style={styles.subtitle}>Recent Scans</Text>
                <FlatList
                    data={scanLogs}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderLog}
                    contentContainerStyle={styles.list}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={true}
                    ListEmptyComponent={<Text style={styles.emptyText}>No scans yet.</Text>}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f2f7' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e5ea' },
    title: { fontSize: 24, fontWeight: 'bold' },
    grid: { padding: 12 },
    row: { flexDirection: 'row', marginBottom: 8 },
    logsContainer: { flex: 1, backgroundColor: '#fff', marginTop: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
    subtitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
    list: { paddingBottom: 20 },
    logItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    logToken: { fontSize: 16, fontWeight: '500' },
    logTime: { fontSize: 12, color: '#999' },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    bgSuccess: { backgroundColor: '#34C759' },
    bgWarn: { backgroundColor: '#FFCC00' },
    bgError: { backgroundColor: '#FF3B30' },
    emptyText: { textAlign: 'center', color: '#ccc', marginTop: 20 }
});
