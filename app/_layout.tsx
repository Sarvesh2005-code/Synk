import "../global.css";
import { Stack } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import AuthScreen from "../components/AuthScreen";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function Layout() {
    const { session, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color="#FFF" />
            </View>
        );
    }

    if (!session) {
        return <AuthScreen />;
    }

    return (
        <>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
                <Stack.Screen name="index" />
            </Stack>
            <StatusBar style="light" />
        </>
    );
}
