import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card } from '../components/UIComponents';
import { QRPreview } from '../components/QRPreview';
import { generateHash } from '../utils/security';
import * as Storage from '../db/storage';
import { useApp } from '../db/AppContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function GenerateScreen() {
    const [count, setCount] = useState('');
    const [title, setTitle] = useState('');
    const [generatedList, setGeneratedList] = useState([]);
    const { refreshData } = useApp();

    const handleGenerate = async () => {
        const num = parseInt(count);
        if (isNaN(num) || num <= 0) {
            Alert.alert("Invalid Input", "Please enter a valid number greater than 0.");
            return;
        }

        const currentTokens = await Storage.getGeneratedTokens();
        const startIdx = Object.keys(currentTokens).length + 1;
        const newTokens = {};
        const batchList = [];

        const EVENT_NAME = "FRESHERS2025";
        const displayTitle = title.trim() || EVENT_NAME;

        for (let i = 0; i < num; i++) {
            const idx = startIdx + i;
            const tokenId = `TOKEN_${idx.toString().padStart(4, '0')}`;
            const hash = generateHash(tokenId);

            const tokenData = {
                id: tokenId,
                used: false,
                scannedAt: null,
                hash: hash,
                title: displayTitle
            };

            const qrPayload = {
                event: EVENT_NAME,
                token: tokenId,
                batch: 1, // simplified batch for now
                hash: hash
            };

            newTokens[tokenId] = tokenData;
            batchList.push({ ...qrPayload, label: tokenId, title: displayTitle });
        }

        await Storage.saveGeneratedTokens(newTokens);
        await refreshData();
        setGeneratedList(batchList);
        setCount('');
        Alert.alert("Success", `Generated ${num} tokens!`);
    };

    const generateHtml = (qrList) => {
        // Updated for larger size (300x300) and title integration
        let items = qrList.map(item => {
            const data = JSON.stringify({
                event: item.event,
                token: item.token,
                batch: item.batch,
                hash: item.hash
            });
            // Using larger size in API request and larger image display
            const imgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
            return `
            <div style="display: inline-block; margin: 30px; text-align: center; border: 2px solid #333; padding: 20px; page-break-inside: avoid;">
                <h3 style="margin: 0 0 10px 0; font-family: sans-serif;">${item.title}</h3>
                <img src="${imgSrc}" width="250" height="250" />
                <p style="font-family: monospace; font-size: 16px; margin-top: 10px; font-weight: bold;">${item.token}</p>
            </div>
        `;
        }).join('');

        return `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; text-align: center; background: #fff; }
          </style>
        </head>
        <body>
          <h1 style="margin-bottom: 40px;">Generated Tokens: ${qrList.length}</h1>
          <div>${items}</div>
        </body>
      </html>
    `;
    };

    const printPdf = async () => {
        if (generatedList.length === 0) return;
        try {
            const html = generateHtml(generatedList);
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (e) {
            Alert.alert("Error", "Failed to generate PDF");
            console.error(e);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Generate Tokens</Text>
            </View>

            <View style={styles.form}>
                <Input
                    placeholder="Event Title (e.g. Freshers Party)"
                    value={title}
                    onChangeText={setTitle}
                />
                <Input
                    placeholder="Number of tokens (e.g. 50)"
                    value={count}
                    onChangeText={setCount}
                    keyboardType="numeric"
                />
                <Button title="Generate" onPress={handleGenerate} />
                {generatedList.length > 0 && (
                    <Button title="Export to PDF" onPress={printPdf} type="secondary" style={{ backgroundColor: '#5856D6' }} />
                )}
            </View>

            <FlatList
                data={generatedList}
                keyExtractor={item => item.token}
                numColumns={2}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={{ flex: 1, alignItems: 'center', marginBottom: 20 }}>
                        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>{item.title}</Text>
                        <QRPreview value={item} label={item.token} size={100} />
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No tokens details to show. Generate some!</Text>}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f2f7' },
    header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e5ea' },
    title: { fontSize: 24, fontWeight: 'bold' },
    form: { padding: 16 },
    list: { padding: 8 },
    emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
});
