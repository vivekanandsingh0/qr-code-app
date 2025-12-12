import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

export const Card = ({ children, style }) => (
    <View style={[styles.card, style]}>
        {children}
    </View>
);

export const Button = ({ title, onPress, type = 'primary', style, disabled }) => (
    <TouchableOpacity
        style={[styles.button, type === 'danger' ? styles.btnDanger : styles.btnPrimary, style, disabled && styles.btnDisabled]}
        onPress={onPress}
        disabled={disabled}
    >
        <Text style={styles.btnText}>{title}</Text>
    </TouchableOpacity>
);

export const Input = ({ value, onChangeText, placeholder, keyboardType }) => (
    <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#999"
    />
);

export const StatTile = ({ label, value, color }) => (
    <Card style={[styles.statTile, { borderLeftColor: color, borderLeftWidth: 4 }]}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
    </Card>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    button: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 8,
    },
    btnPrimary: {
        backgroundColor: '#007AFF',
    },
    btnDanger: {
        backgroundColor: '#FF3B30',
    },
    btnDisabled: {
        backgroundColor: '#A0A0A0',
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#f2f2f7',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#e5e5ea',
    },
    statTile: {
        flex: 1,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        textAlign: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});
