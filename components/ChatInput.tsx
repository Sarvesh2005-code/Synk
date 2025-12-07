import { useState } from "react";
import { View, TextInput, TouchableOpacity, ActivityIndicator, Text } from "react-native";
import { Send, X } from "lucide-react-native";
import { GlassCard } from "./ui/GlassCard";
import { useChatStore } from "../store/chatStore";
import { useAuth } from "../hooks/useAuth";
import { ChatMediaPicker } from "./ChatMediaPicker";

interface ChatInputProps {
    channelId?: string;
}

export function ChatInput({ channelId }: ChatInputProps) {
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const { sendMessage, replyingTo, setReplyingTo } = useChatStore();
    const { session } = useAuth();

    const handleSend = async () => {
        if (!text.trim() || !session?.user || !channelId) return;

        const content = text.trim();
        setText("");
        setSending(true);

        // Pass parentId if replying
        await sendMessage(content, session.user.id, channelId, 'text', undefined, replyingTo?.id);
        setSending(false);
    };

    const handleImageSelected = async (url: string) => {
        if (!session?.user || !channelId) return;
        await sendMessage("Sent an image", session.user.id, channelId, 'image', url, replyingTo?.id);
    };

    return (
        <View className="mb-8 mx-4">
            {replyingTo && (
                <GlassCard intensity={20} className="flex-row items-center justify-between p-2 px-4 mb-2 rounded-2xl border border-white/10">
                    <View>
                        <Text className="text-white/60 text-xs">Replying to</Text>
                        <Text numberOfLines={1} className="text-white text-sm font-semibold max-w-[200px]">
                            {replyingTo.type === 'image' ? 'Image' : replyingTo.content}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => setReplyingTo(null)}>
                        <X size={16} color="white" />
                    </TouchableOpacity>
                </GlassCard>
            )}

            <GlassCard intensity={40} className="p-2 flex-row items-center border-t border-white/10 rounded-full">
                {session?.user && <ChatMediaPicker userId={session.user.id} onImageSelected={handleImageSelected} />}

                <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder={replyingTo ? "Reply..." : "iMessage..."}
                    placeholderTextColor="#666"
                    className="flex-1 text-white px-4 py-2 text-lg"
                    multiline
                />
                <TouchableOpacity
                    onPress={handleSend}
                    disabled={!text.trim() || sending}
                    className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-1"
                >
                    {sending ? <ActivityIndicator size="small" color="white" /> : <Send size={20} color="white" />}
                </TouchableOpacity>
            </GlassCard>
        </View>
    );
}
