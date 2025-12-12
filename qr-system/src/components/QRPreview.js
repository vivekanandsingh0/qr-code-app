import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export const QRPreview = ({ value, label, size = 150 }) => (
    <View style={styles.container}>
        <View style={styles.qrWrapper}>
            {value ? (
                <QRCode value={JSON.stringify(value)} size={size} />
            ) : (
                <View style={[styles.placeholder, { width: size, height: size }]}>
                    <Text style={styles.placeholderText}>No QR</Text>
                </View>
            )}
        </View>
        {label && <Text style={styles.label}>{label}</Text>}
    </View>
);

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        margin: 10,
    },
    qrWrapper: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    label: {
        marginTop: 8,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    placeholder: {
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#aaa',
    }
});
