import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function Home() {
    return (
        <View className="flex-1 items-center justify-center bg-black">
            <Text className="text-6xl font-bold text-white tracking-tighter">Synk</Text>
            <Text className="text-zinc-400 mt-2 text-lg font-medium">Lightning Fast.</Text>
            <StatusBar style="light" />
        </View>
    );
}
