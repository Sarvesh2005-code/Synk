import { View } from "react-native";
import { Stack } from "expo-router";
import { ChannelList } from "../components/ChannelList";
import { StatusBar } from "expo-status-bar";
import { GlassCard } from "../components/ui/GlassCard";
import { useAuth } from "../hooks/useAuth";
import { ActivityIndicator } from "react-native";

export default function HomeScreen() {
    const { session, loading } = useAuth();

    if (loading) {
        return <View className="flex-1 bg-black items-center justify-center"><ActivityIndicator /></View>;
    }

    return (
        <View className="flex-1 bg-black">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            {/* Header */}
            <GlassCard className="pt-14 pb-4 px-6 border-b border-white/5 rounded-none z-10">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-zinc-400 text-xs font-medium uppercase tracking-widest mb-1">Workspace</Text>
                        <Text className="text-white text-3xl font-bold tracking-tight">Synk.</Text>
                    </View>
                    <View className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full border-2 border-white/10" />
                </View>
            </GlassCard>

            <ChannelList />
        </View>
    );
}

// Importing Text here to avoid mixing imports above if not careful, 
// but clean implementation is better.
import { Text } from "react-native";
