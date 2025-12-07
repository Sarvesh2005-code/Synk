import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import { GlassCard } from "./ui/GlassCard";
import { Hash, Plus } from "lucide-react-native";
import { Channel } from "../types/chat";
import { useAuth } from "../hooks/useAuth";

export function ChannelList() {
    const [channels, setChannels] = useState<Channel[]>([]);
    const router = useRouter();
    const { session } = useAuth();

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        const { data, error } = await supabase.from('channels').select('*').order('slug');
        if (data) setChannels(data);
    };

    const createChannel = async () => {
        if (!session?.user) return;

        Alert.prompt(
            "New Channel",
            "Enter a channel name (e.g. 'random')",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Create",
                    onPress: async (name) => {
                        if (!name) return;
                        const slug = name.toLowerCase().replace(/\s+/g, '-');

                        const { error } = await supabase.from('channels').insert({
                            slug,
                            created_by: session.user.id
                        });

                        if (error) Alert.alert("Error", error.message);
                        else fetchChannels();
                    }
                }
            ]
        );
    };

    return (
        <ScrollView className="flex-1 px-4 pt-4">
            <View className="flex-row items-center justify-between mb-6">
                <Text className="text-white text-2xl font-bold">Channels</Text>
                <TouchableOpacity onPress={createChannel} className="bg-white/10 p-2 rounded-full">
                    <Plus color="white" size={20} />
                </TouchableOpacity>
            </View>

            <View className="gap-3">
                {channels.map((channel) => (
                    <TouchableOpacity
                        key={channel.id}
                        onPress={() => router.push(`/channel/${channel.id}`)}
                    >
                        <GlassCard intensity={20} className="p-4 flex-row items-center border border-white/5 rounded-2xl active:bg-white/5">
                            <View className="w-10 h-10 bg-blue-600/20 rounded-full items-center justify-center mr-3">
                                <Hash color="#3b82f6" size={20} />
                            </View>
                            <View>
                                <Text className="text-white text-lg font-semibold">#{channel.slug}</Text>
                                <Text className="text-zinc-500 text-xs text-uppercase">Public Channel</Text>
                            </View>
                        </GlassCard>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}
