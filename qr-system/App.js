import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { AppProvider } from './src/db/AppContext';
import ScanScreen from './src/screens/ScanScreen';
import GenerateScreen from './src/screens/GenerateScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <SafeAreaProvider>
            <AppProvider>
                <NavigationContainer>
                    <StatusBar style="auto" />
                    <Tab.Navigator
                        screenOptions={({ route }) => ({
                            tabBarIcon: ({ focused, color, size }) => {
                                let iconName;
                                if (route.name === 'Scan') {
                                    iconName = focused ? 'scan' : 'scan-outline';
                                } else if (route.name === 'Generate') {
                                    iconName = focused ? 'qr-code' : 'qr-code-outline';
                                } else if (route.name === 'Stats') {
                                    iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                                } else if (route.name === 'Settings') {
                                    iconName = focused ? 'settings' : 'settings-outline';
                                }
                                return <Ionicons name={iconName} size={size} color={color} />;
                            },
                            tabBarActiveTintColor: '#007AFF',
                            tabBarInactiveTintColor: 'gray',
                            headerShown: false,
                        })}
                    >
                        <Tab.Screen name="Scan" component={ScanScreen} />
                        <Tab.Screen name="Generate" component={GenerateScreen} />
                        <Tab.Screen name="Stats" component={StatsScreen} />
                        <Tab.Screen name="Settings" component={SettingsScreen} />
                    </Tab.Navigator>
                </NavigationContainer>
            </AppProvider>
        </SafeAreaProvider>
    );
}
