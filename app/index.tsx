import { useEffect } from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
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
                .select(`
                *,
                reply_to:parent_id (*)
            `)
                .order('inserted_at', { ascending: false })
                .limit(50);

            // Transform data to include nested parent message if needed, or Supabase returns it if relations set up
            // For simple id match in MVP, we might rely on UI lookup or simplified join.
            // Let's assume standard select for now and handle join manually or via proper query.

            if (data) setMessages(data as any[]);
        };

        fetchMessages();

        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
                const newMessage = payload.new as any;
                // Fetch parent if it exists to show context immediately?
                if (newMessage.parent_id) {
                    const { data: parent } = await supabase.from('messages').select('*').eq('id', newMessage.parent_id).single();
                    newMessage.reply_to = parent;
                }
                addMessage(newMessage);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    return (
        <View className="flex-1 bg-black">
            <GlassCard className="pt-12 pb-4 px-6 border-b border-white/5 rounded-none z-10">
                <Text className="text-white text-xl font-bold text-center">General</Text>
                <Text className="text-zinc-500 text-xs text-center uppercase tracking-widest">12 Members</Text>
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
                    // @ts-ignore
                    estimatedItemSize={60}
                    inverted
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
                />
                <ChatInput />
            </KeyboardAvoidingView>
        </View>
    );
}
