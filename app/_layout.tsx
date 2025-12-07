import "../global.css";
import { Stack } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import AuthScreen from "../components/AuthScreen";
import { View, ActivityIndicator } from "react-native";

export default function Layout() {
    const { session, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color="white" />
            </View>
        );
    }

    if (!session) {
        return <AuthScreen />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
        </Stack>
    );
}
