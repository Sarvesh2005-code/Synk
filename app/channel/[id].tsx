import { useEffect, useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useChatStore } from "../../store/chatStore";
import { useAuth } from "../../hooks/useAuth";
import { MessageBubble } from "../../components/MessageBubble";
import { ChatInput } from "../../components/ChatInput";
import { supabase } from "../../lib/supabase";
import { GlassCard } from "../../components/ui/GlassCard";
import { Message, Channel } from "../../types/chat";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

export default function ChannelScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { messages, setMessages, addMessage } = useChatStore();
    const { session } = useAuth();
    const router = useRouter();
    const [channel, setChannel] = useState<Channel | null>(null);

    useEffect(() => {
        if (!id) return;

        // Fetch Channel Details
        supabase.from('channels').select('*').eq('id', id).single().then(({ data }) => {
            if (data) setChannel(data);
        });

        // Fetch Messages
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select(`*, reply_to:parent_id (*)`)
                .eq('channel_id', id)
                .order('inserted_at', { ascending: false })
                .limit(50);

            if (data) setMessages(data as any[]);
            else setMessages([]);
        };

        fetchMessages();

        // Realtime Subscription
        const channelSub = supabase
            .channel(`public:messages:${id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `channel_id=eq.${id}` // Filter by THIS channel
            }, async (payload) => {
                const newMessage = payload.new as any;
                if (newMessage.parent_id) {
                    const { data: parent } = await supabase.from('messages').select('*').eq('id', newMessage.parent_id).single();
                    newMessage.reply_to = parent;
                }
                addMessage(newMessage);
            })
            .subscribe();

        return () => { supabase.removeChannel(channelSub); };
    }, [id]);

    return (
        <View className="flex-1 bg-black">
            <Stack.Screen options={{ headerShown: false }} />

            <GlassCard className="pt-12 pb-4 px-4 border-b border-white/5 rounded-none z-10 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ChevronLeft color="white" size={24} />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-white text-xl font-bold text-center">#{channel?.slug || 'Loading...'}</Text>
                    <Text className="text-zinc-500 text-xs text-center uppercase tracking-widest">Channel</Text>
                </View>
                <View className="w-10" />
            </GlassCard>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
                <FlashList<Message>
                    data={[...messages].reverse()}
                    renderItem={({ item }) => (
                        <MessageBubble
                            message={item}
                            isOwn={item.user_id === session?.user?.id}
                        />
                    )}
                    estimatedItemSize={60}
                    inverted
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
                />

                {/* Need to update ChatInput to accept channelID or pass it via Store? 
                    Actually ChatInput pulls from Store. Store needs to know current Channel ID or pass it in. 
                    Let's modify ChatInput to take channelId prop for safety or update store.
                    For now, let's PASS it to ChatInput as a Prop if we can, OR update store 'currentChannelId' 
                */}
                <ChatInput channelId={id} />
            </KeyboardAvoidingView>
        </View>
    );
}
