import "../global.css";
import { Slot } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../hooks/useAuth";
import { AuthScreen } from "../components/AuthScreen";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (!session) {
        return <AuthScreen />;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="light" />
            <View className="flex-1 bg-black">
                <Slot />
            </View>
        </GestureHandlerRootView>
    );
}
