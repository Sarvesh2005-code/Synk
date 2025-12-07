import { useEffect } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useChatStore } from "../store/chatStore";
import { useAuth } from "../hooks/useAuth";
import { MessageBubble } from "../components/MessageBubble";
import { ChatInput } from "../components/ChatInput";
import { supabase } from "../lib/supabase";
import { GlassCard } from "../components/ui/GlassCard";
import { Message } from "../types/chat";

export default function ChatScreen() {
    const { messages, setMessages, addMessage } = useChatStore();
    const { session } = useAuth();

    useEffect(() => {
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .order('inserted_at', { ascending: false })
                .limit(50);

            if (data) setMessages(data as any[]);
        };

        fetchMessages();

        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                addMessage(payload.new as any);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    return (
        <View className="flex-1 bg-black">
            <GlassCard className="pt-12 pb-4 px-6 border-b border-white/5 rounded-none z-10">
                <Text className="text-white text-xl font-bold text-center">General</Text>
                <Text className="text-zinc-500 text-xs text-center uppercase tracking-widest">12 Members</Text>
                <ChatInput />
            </KeyboardAvoidingView>
        </View>
    );
}
